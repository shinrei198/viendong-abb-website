import React, { useState, useRef, useEffect } from 'react'

export interface ThumbnailCropData {
  url: string
  crop?: {
    x: number
    y: number
    width: number
    height: number
    aspectRatio?: number
  }
}

interface ThumbnailCropperProps {
  value: string // Có thể là chuỗi URL hoặc JSON string dạng { url, crop }
  onChange: (value: string) => void
  label?: string
}

export default function ThumbnailCropper({
  value,
  onChange,
  label = 'Ảnh đại diện bài viết (Thumbnail):',
}: ThumbnailCropperProps) {
  // Parse incoming value
  const parseThumbnailValue = (val: string): { url: string; crop: ThumbnailCropData['crop'] | null } => {
    if (!val) return { url: '', crop: null }
    if (val.trim().startsWith('{') && val.includes('"url"')) {
      try {
        const parsed = JSON.parse(val)
        return { url: parsed.url || '', crop: parsed.crop || null }
      } catch (e) {
        return { url: val, crop: null }
      }
    }
    return { url: val, crop: null }
  }

  const initial = parseThumbnailValue(value)
  const [imageUrl, setImageUrl] = useState(initial.url)
  const [appliedCrop, setAppliedCrop] = useState<ThumbnailCropData['crop'] | null>(initial.crop)

  // Cropper states
  const [isCropping, setIsCropping] = useState(false)
  const [cropAspectRatio, setCropAspectRatio] = useState<'free' | '16:9' | '4:3' | '1:1' | '2:3'>('16:9')
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  })
  const [cropAction, setCropAction] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{
    mouseX: number
    mouseY: number
    box: { x: number; y: number; width: number; height: number }
    containerW: number
    containerH: number
  } | null>(null)

  const cropContainerRef = useRef<HTMLDivElement>(null)
  const cropImageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state when incoming prop changes
  useEffect(() => {
    const current = parseThumbnailValue(value)
    setImageUrl(current.url)
    setAppliedCrop(current.crop)
  }, [value])

  const notifyChange = (url: string, crop: ThumbnailCropData['crop'] | null) => {
    if (!url) {
      onChange('')
      return
    }
    if (crop) {
      const data: ThumbnailCropData = { url, crop }
      onChange(JSON.stringify(data))
    } else {
      onChange(url)
    }
  }

  const handleUrlInputChange = (newUrl: string) => {
    setImageUrl(newUrl)
    setAppliedCrop(null)
    setIsCropping(false)
    notifyChange(newUrl.trim(), null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setImageUrl(base64)
        setAppliedCrop(null)
        setIsCropping(false)
        notifyChange(base64, null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Global drag handler
  useEffect(() => {
    if (!cropAction || !dragStart || !cropContainerRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const { mouseX, mouseY, box, containerW, containerH } = dragStart
      if (containerW <= 0 || containerH <= 0) return

      const deltaXPercent = ((e.clientX - mouseX) / containerW) * 100
      const deltaYPercent = ((e.clientY - mouseY) / containerH) * 100

      let newX = box.x
      let newY = box.y
      let newW = box.width
      let newH = box.height

      if (cropAction === 'move') {
        newX = Math.max(0, Math.min(100 - box.width, box.x + deltaXPercent))
        newY = Math.max(0, Math.min(100 - box.height, box.y + deltaYPercent))
      } else {
        if (cropAction.includes('e')) {
          newW = Math.max(10, Math.min(100 - box.x, box.width + deltaXPercent))
        }
        if (cropAction.includes('s')) {
          newH = Math.max(10, Math.min(100 - box.y, box.height + deltaYPercent))
        }
        if (cropAction.includes('w')) {
          const maxLeftShift = box.x + box.width - 10
          newX = Math.max(0, Math.min(maxLeftShift, box.x + deltaXPercent))
          newW = box.width - (newX - box.x)
        }
        if (cropAction.includes('n')) {
          const maxTopShift = box.y + box.height - 10
          newY = Math.max(0, Math.min(maxTopShift, box.y + deltaYPercent))
          newH = box.height - (newY - box.y)
        }

        if (cropAspectRatio !== 'free' && cropImageRef.current) {
          const img = cropImageRef.current
          const imgRatio = (img.naturalWidth || 1) / (img.naturalHeight || 1)
          let targetRatio = 16 / 9
          if (cropAspectRatio === '16:9') targetRatio = 16 / 9
          if (cropAspectRatio === '4:3') targetRatio = 4 / 3
          if (cropAspectRatio === '1:1') targetRatio = 1
          if (cropAspectRatio === '2:3') targetRatio = 2 / 3

          const requiredH = (newW / targetRatio) * imgRatio
          if (newY + requiredH <= 100) {
            newH = requiredH
          } else {
            newH = 100 - newY
            newW = (newH * targetRatio) / imgRatio
          }
        }
      }

      setCropBox({
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY)),
        width: Math.max(10, Math.min(100, newW)),
        height: Math.max(10, Math.min(100, newH)),
      })
    }

    const handleMouseUp = () => {
      setCropAction(null)
      setDragStart(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [cropAction, dragStart, cropAspectRatio])

  const handleSelectAspectRatio = (ratio: 'free' | '16:9' | '4:3' | '1:1' | '2:3') => {
    setCropAspectRatio(ratio)
    if (!cropImageRef.current) {
      setCropBox({ x: 5, y: 5, width: 90, height: 90 })
      return
    }

    const img = cropImageRef.current
    const natW = img.naturalWidth || 1000
    const natH = img.naturalHeight || 600
    const imgAspect = natW / natH

    if (ratio === 'free') {
      setCropBox({ x: 5, y: 5, width: 90, height: 90 })
      return
    }

    let targetAspect = 16 / 9
    if (ratio === '16:9') targetAspect = 16 / 9
    if (ratio === '4:3') targetAspect = 4 / 3
    if (ratio === '1:1') targetAspect = 1
    if (ratio === '2:3') targetAspect = 2 / 3

    let boxW = 85
    let boxH = (boxW / targetAspect) * imgAspect

    if (boxH > 85) {
      boxH = 85
      boxW = (boxH * targetAspect) / imgAspect
    }

    const boxX = Math.max(0, (100 - boxW) / 2)
    const boxY = Math.max(0, (100 - boxH) / 2)

    setCropBox({
      x: boxX,
      y: boxY,
      width: Math.min(100, boxW),
      height: Math.min(100, boxH),
    })
  }

  const applyCrop = () => {
    const img = cropImageRef.current
    const natW = img?.naturalWidth || 1000
    const natH = img?.naturalHeight || 600
    const aspect = (cropBox.width * natW) / (cropBox.height * natH)

    const cropObj = {
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height,
      aspectRatio: aspect,
    }

    setAppliedCrop(cropObj)
    setIsCropping(false)
    notifyChange(imageUrl, cropObj)
  }

  const resetCrop = () => {
    setAppliedCrop(null)
    setIsCropping(false)
    setCropBox({ x: 5, y: 5, width: 90, height: 90 })
    notifyChange(imageUrl, null)
  }

  const startDrag = (action: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cropContainerRef.current) return
    const rect = cropContainerRef.current.getBoundingClientRect()
    setCropAction(action)
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
      containerW: rect.width,
      containerH: rect.height,
    })
  }

  return (
    <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-gray-700 uppercase text-xs">
          {label}
        </label>
        {imageUrl && !isCropping && (
          <button
            type="button"
            onClick={() => {
              setIsCropping(true)
              handleSelectAspectRatio('free')
            }}
            className="px-2.5 py-1 text-[11px] font-bold bg-[#1B4C98] text-white hover:opacity-90 rounded cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>✂️</span> Cắt ảnh đại diện
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div className="sm:col-span-3">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => handleUrlInputChange(e.target.value)}
            placeholder="Dán link ảnh https://... hoặc tải từ máy tính"
            className="w-full px-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white rounded"
          />
        </div>
        <div className="sm:col-span-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded cursor-pointer text-center"
          >
            📁 Tải ảnh lên
          </button>
        </div>
      </div>

      {/* CROPPER TOOLBAR */}
      {isCropping && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-950">Tỉ lệ cắt:</span>
              {(['free', '16:9', '4:3', '1:1', '2:3'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => handleSelectAspectRatio(ratio)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    cropAspectRatio === ratio
                      ? 'bg-[#1B4C98] text-white shadow-xs'
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                  }`}
                >
                  {ratio === 'free' ? 'Tự do' : ratio}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="px-2.5 py-1 text-[11px] font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="px-3 py-1 text-[11px] font-bold bg-green-600 text-white hover:bg-green-700 rounded cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>✓</span> Áp dụng
              </button>
            </div>
          </div>
          <p className="text-[10px] text-blue-700 italic">
            💡 Kéo các góc / cạnh để tùy chỉnh vùng ảnh đại diện, kéo vùng giữa để di chuyển vị trí.
          </p>
        </div>
      )}

      {/* PREVIEW CONTAINER */}
      {imageUrl && (
        <div className="relative overflow-hidden bg-slate-200 border border-gray-300 min-h-36 max-h-[280px] flex items-center justify-center p-2 rounded select-none">
          {/* Đã Crop & Không trong trạng thái đang kéo chỉnh: Viewport Preview */}
          {appliedCrop && !isCropping ? (
            <div className="flex flex-col items-center gap-1.5 max-w-full">
              <div
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  aspectRatio: `${appliedCrop.aspectRatio || (appliedCrop.width * 16) / (appliedCrop.height * 9)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="border-2 border-green-600 rounded shadow-md bg-black/5"
              >
                <img
                  src={imageUrl}
                  alt="Thumbnail Cropped"
                  referrerPolicy="no-referrer"
                  style={{
                    position: 'absolute',
                    width: `${(100 / appliedCrop.width) * 100}%`,
                    height: `${(100 / appliedCrop.height) * 100}%`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    left: `-${(appliedCrop.x / appliedCrop.width) * 100}%`,
                    top: `-${(appliedCrop.y / appliedCrop.height) * 100}%`,
                    objectFit: 'fill',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 border border-green-200 rounded">
                  ✓ Đã cắt theo tỉ lệ
                </span>
                <button
                  type="button"
                  onClick={resetCrop}
                  className="text-[10px] font-semibold text-red-600 hover:text-red-800 underline cursor-pointer"
                >
                  Đặt lại ảnh gốc
                </button>
              </div>
            </div>
          ) : (
            <div ref={cropContainerRef} className="relative inline-block max-w-full max-h-[250px]">
              <img
                key={imageUrl.trim()}
                ref={cropImageRef}
                src={imageUrl.trim()}
                alt="Thumbnail Preview"
                referrerPolicy="no-referrer"
                className="max-h-[250px] max-w-full block object-contain pointer-events-none rounded shadow-xs"
              />

              {/* Cropper Overlay */}
              {isCropping && (
                <>
                  <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                  <div
                    style={{
                      left: `${cropBox.x}%`,
                      top: `${cropBox.y}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                    }}
                    className="absolute border-2 border-dashed border-[#1B4C98] bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] z-20"
                  >
                    <div
                      onMouseDown={(e) => startDrag('move', e)}
                      className="absolute inset-0 cursor-move flex items-center justify-center"
                    >
                      <span className="bg-[#1B4C98] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none select-none">
                        ✂️ Vùng đại diện ({cropAspectRatio.toUpperCase()})
                      </span>
                    </div>

                    {/* 4 Corners */}
                    <div onMouseDown={(e) => startDrag('nw', e)} className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nwse-resize z-30 shadow-xs" />
                    <div onMouseDown={(e) => startDrag('ne', e)} className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nesw-resize z-30 shadow-xs" />
                    <div onMouseDown={(e) => startDrag('sw', e)} className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nesw-resize z-30 shadow-xs" />
                    <div onMouseDown={(e) => startDrag('se', e)} className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nwse-resize z-30 shadow-xs" />

                    {/* 4 Edges */}
                    {cropAspectRatio === 'free' && (
                      <>
                        <div onMouseDown={(e) => startDrag('n', e)} className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-[#1B4C98] rounded-xs cursor-ns-resize z-30 shadow-xs" />
                        <div onMouseDown={(e) => startDrag('s', e)} className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-[#1B4C98] rounded-xs cursor-ns-resize z-30 shadow-xs" />
                        <div onMouseDown={(e) => startDrag('w', e)} className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-5 bg-white border border-[#1B4C98] rounded-xs cursor-ew-resize z-30 shadow-xs" />
                        <div onMouseDown={(e) => startDrag('e', e)} className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-5 bg-white border border-[#1B4C98] rounded-xs cursor-ew-resize z-30 shadow-xs" />
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper component dùng chung để render Thumbnail có hỗ trợ Crop Viewport ở tất cả các trang
export function NewsThumbnailView({
  thumb,
  alt = '',
  className = '',
  imgClassName = '',
}: {
  thumb: string
  alt?: string
  className?: string
  imgClassName?: string
}) {
  if (!thumb) return null

  // Check if thumb is a JSON ThumbnailCropData
  if (thumb.trim().startsWith('{') && thumb.includes('"url"')) {
    try {
      const parsed: ThumbnailCropData = JSON.parse(thumb)
      if (parsed.crop) {
        const crop = parsed.crop
        const widthMultiplier = (100 / crop.width) * 100
        const heightMultiplier = (100 / crop.height) * 100
        const leftOffsetPercent = (crop.x / crop.width) * 100
        const topOffsetPercent = (crop.y / crop.height) * 100

        return (
          <div className={`relative overflow-hidden ${className}`}>
            <img
              src={parsed.url}
              alt={alt}
              referrerPolicy="no-referrer"
              style={{
                position: 'absolute',
                width: `${widthMultiplier}%`,
                height: `${heightMultiplier}%`,
                maxWidth: 'none',
                maxHeight: 'none',
                left: `-${leftOffsetPercent}%`,
                top: `-${topOffsetPercent}%`,
                objectFit: 'fill',
              }}
              className={imgClassName}
            />
          </div>
        )
      }
      return (
        <img
          src={parsed.url}
          alt={alt}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      )
    } catch (e) {
      // Fallback
    }
  }

  return (
    <img
      src={thumb}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`w-full h-full object-cover ${imgClassName}`}
    />
  )
}
