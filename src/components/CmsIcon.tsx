import React from 'react'
import type { CustomIconConfig } from '@/types/icon'
import { sanitizeSvg } from '@/utils/sanitize'

export interface BuiltinIconDef {
  id: string
  label: string
  path: string
}

export const BUILTIN_ICONS: BuiltinIconDef[] = [
  {
    id: 'shield',
    label: 'Chính hãng (Khiên)',
    path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z',
  },
  {
    id: 'truck',
    label: 'Giao hàng (Xe tải)',
    path: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2a3 3 0 006 0h6a3 3 0 006 0h2v-5l-3-4zM6 18a1 1 0 110-2 1 1 0 010 2zm12 0a1 1 0 110-2 1 1 0 010 2z',
  },
  {
    id: 'support',
    label: 'Hỗ trợ 24/7 (Tin nhắn)',
    path: 'M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
  },
  {
    id: 'price',
    label: 'Giá / Chiết khấu (Tiền tệ)',
    path: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
  },
  {
    id: 'check',
    label: 'Xác nhận (Tích xanh)',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  },
  {
    id: 'star',
    label: 'Chất lượng (Ngôi sao)',
    path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
  {
    id: 'award',
    label: 'Huy chương (Chứng chỉ)',
    path: 'M12 2a6 6 0 00-6 6c0 2.97 2.16 5.43 5 5.91V22l3-2 3 2v-8.09c2.84-.48 5-2.94 5-5.91a6 6 0 00-6-6zm0 10a4 4 0 110-8 4 4 0 010 8z',
  },
  {
    id: 'clock',
    label: 'Nhanh chóng (Đồng hồ)',
    path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  },
  {
    id: 'phone',
    label: 'Hotline (Điện thoại)',
    path: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  },
  {
    id: 'zap',
    label: 'Điện năng (Tia chớp)',
    path: 'M7 2v11h3v9l7-12h-4l4-8z',
  },
  {
    id: 'box',
    label: 'Kiện hàng (Hộp sản phẩm)',
    path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z',
  },
  {
    id: 'tool',
    label: 'Kỹ thuật (Cờ lê)',
    path: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  },
  {
    id: 'users',
    label: 'Đối tác / Khách hàng',
    path: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  },
  {
    id: 'map-pin',
    label: 'Địa điểm (Định vị)',
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  },
  {
    id: 'store',
    label: 'Cửa hàng (Showroom)',
    path: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z',
  },
  {
    id: 'building',
    label: 'Doanh nghiệp (Tòa nhà)',
    path: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z',
  },
]

const BUILTIN_PATHS: Record<string, string> = BUILTIN_ICONS.reduce((acc, item) => {
  acc[item.id] = item.path
  return acc
}, {} as Record<string, string>)

export interface CmsIconProps {
  icon?: string
  config?: CustomIconConfig
  inverted?: boolean // true if inside red background, false if inside white background
  className?: string
  boxClassName?: string
  overrideSize?: number
}

export function resolveIconConfig(legacyIcon?: string, config?: CustomIconConfig): CustomIconConfig {
  if (config && (config.type === 'svg' || config.type === 'image' || config.type === 'builtin')) {
    return {
      type: config.type,
      builtinName: config.builtinName || legacyIcon || 'shield',
      svgMarkup: config.svgMarkup || '',
      imageUrl: config.imageUrl || '',
      tint: config.tint !== false,
      size: config.size || 28,
      boxSize: config.boxSize || 48,
      showBox: config.showBox !== false,
      boxShape: config.boxShape || 'square',
      position: config.position || 'top-left',
    }
  }

  return {
    type: 'builtin',
    builtinName: legacyIcon || 'shield',
    svgMarkup: '',
    imageUrl: '',
    tint: true,
    size: 28,
    boxSize: 48,
    showBox: true,
    boxShape: 'square',
    position: 'top-left',
  }
}

export default function CmsIcon({
  icon,
  config,
  inverted = false,
  className = '',
  boxClassName = '',
  overrideSize,
}: CmsIconProps) {
  const resolved = resolveIconConfig(icon, config)
  const size = overrideSize ?? resolved.size ?? 28
  const boxSize = resolved.boxSize ?? 48
  const showBox = resolved.showBox !== false

  // Shape class
  let shapeClass = ''
  if (resolved.boxShape === 'circle') shapeClass = 'rounded-full'
  else if (resolved.boxShape === 'rounded') shapeClass = 'rounded-xl'

  // Default colors
  const boxBg = inverted ? 'rgba(255,255,255,0.18)' : '#f7f7f7'
  const textColor = inverted ? 'white' : '#1a1a1a'

  // Render the icon glyph
  let glyph: React.ReactNode = null

  if (resolved.type === 'image' && resolved.imageUrl) {
    glyph = (
      <img
        src={resolved.imageUrl}
        alt=""
        className="block object-contain"
        style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
      />
    )
  } else if (resolved.type === 'svg' && resolved.svgMarkup) {
    const cleanSvg = sanitizeSvg(resolved.svgMarkup, resolved.tint)
    glyph = (
      <div
        className="flex items-center justify-center [&_svg]:block [&_svg]:w-full [&_svg]:h-full"
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
      />
    )
  } else {
    // Builtin fallback
    const path = BUILTIN_PATHS[resolved.builtinName || ''] || BUILTIN_PATHS['shield']
    glyph = (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="block flex-shrink-0"
      >
        <path d={path} />
      </svg>
    )
  }

  if (!showBox) {
    return (
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ color: textColor }}
      >
        {glyph}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 transition-transform ${shapeClass} ${boxClassName}`}
      style={{
        width: boxSize,
        height: boxSize,
        backgroundColor: boxBg,
        color: textColor,
      }}
    >
      <span className={className}>{glyph}</span>
    </div>
  )
}
