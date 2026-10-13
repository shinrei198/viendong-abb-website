export interface MediaUploadOptions {
  folder: 'banners' | 'news' | 'products' | 'homepage' | 'videos' | 'content'
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export interface MediaUploadResult {
  url: string
  key: string
  width: number
  height: number
  bytes: number
  format: 'webp'
}

const MAX_SOURCE_BYTES = 20 * 1024 * 1024

function canvasToWebP(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Trình duyệt không thể tạo ảnh WebP.')), 'image/webp', quality)
  })
}

async function decodeImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  const isTiff = file.type === 'image/tiff' || /\.tiff?$/i.test(file.name)
  if (isTiff) {
    const UTIF = await import('utif')
    const buffer = await file.arrayBuffer()
    const pages = UTIF.decode(buffer)
    if (!pages.length) throw new Error('Không đọc được file TIFF.')
    UTIF.decodeImage(buffer, pages[0])
    const rgba = UTIF.toRGBA8(pages[0])
    const canvas = document.createElement('canvas')
    canvas.width = pages[0].width
    canvas.height = pages[0].height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Không khởi tạo được bộ chuyển đổi ảnh.')
    context.putImageData(new ImageData(new Uint8ClampedArray(rgba), pages[0].width, pages[0].height), 0, 0)
    return { source: canvas, width: canvas.width, height: canvas.height, cleanup: () => {} }
  }

  const bitmap = await createImageBitmap(file)
  return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() }
}

export async function convertImageToWebP(file: File, options: Omit<MediaUploadOptions, 'folder'> = {}) {
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Ảnh vượt quá giới hạn 20 MB.')
  if (!file.type.startsWith('image/') && !/\.tiff?$/i.test(file.name)) throw new Error('File đã chọn không phải hình ảnh.')

  const decoded = await decodeImage(file)
  try {
    const maxWidth = options.maxWidth || 2560
    const maxHeight = options.maxHeight || 2560
    const scale = Math.min(1, maxWidth / decoded.width, maxHeight / decoded.height)
    const width = Math.max(1, Math.round(decoded.width * scale))
    const height = Math.max(1, Math.round(decoded.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { alpha: true })
    if (!context) throw new Error('Không khởi tạo được bộ chuyển đổi ảnh.')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(decoded.source, 0, 0, width, height)
    const blob = await canvasToWebP(canvas, options.quality ?? 0.84)
    return { blob, width, height }
  } finally {
    decoded.cleanup()
  }
}

export async function uploadMedia(file: File, options: MediaUploadOptions): Promise<MediaUploadResult> {
  const converted = await convertImageToWebP(file, options)
  const safeBaseName = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'image'
  const response = await fetch(`/api/media?folder=${encodeURIComponent(options.folder)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/webp',
      'X-File-Name': `${safeBaseName}.webp`,
      'X-Image-Width': String(converted.width),
      'X-Image-Height': String(converted.height),
    },
    body: converted.blob,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success || !result?.url) {
    throw new Error(result?.message || 'Không thể tải ảnh lên kho media.')
  }
  return {
    url: result.url,
    key: result.key,
    width: converted.width,
    height: converted.height,
    bytes: converted.blob.size,
    format: 'webp',
  }
}
