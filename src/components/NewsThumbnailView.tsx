interface ThumbnailCropData {
  url: string
  crop?: {
    x: number
    y: number
    width: number
    height: number
    aspectRatio?: number
  }
}

interface NewsThumbnailViewProps {
  thumb: string
  alt?: string
  className?: string
  imgClassName?: string
}

export default function NewsThumbnailView({
  thumb,
  alt = '',
  className = '',
  imgClassName = '',
}: NewsThumbnailViewProps) {
  if (!thumb) return null

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
    } catch {
      // Fall back to treating the stored value as a normal image URL.
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
