import React, { useState, useEffect, useRef } from 'react'
import { BannerSlideItem, BannerButtonOverlay } from '@/data/siteData'

interface HeroSliderProps {
  banners: BannerSlideItem[]
  onNavigate: (page: string, id?: string) => void
}

const AUTOPLAY_DELAY = 10000 // 10 seconds
const limitButtonLabel = (value: string) => Array.from(value.normalize('NFC')).slice(0, 24).join('')

export default function HeroSlider({ banners, onNavigate }: HeroSliderProps) {
  const activeBanners = banners.filter((b) => b.isActive)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  // Container measurement for adaptive layout
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDim, setContainerDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const updateSize = () => {
      if (el) {
        setContainerDim({ width: el.clientWidth, height: el.clientHeight })
      }
    }
    updateSize()
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDim({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    ro.observe(el)
    window.addEventListener('resize', updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Drag / Swipe States
  const [isDragging, setIsDragging] = useState(false)
  const [dragDeltaX, setDragDeltaX] = useState(0)
  const dragStartXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const wasDraggedRef = useRef(false)

  // Ensure index stays valid
  useEffect(() => {
    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0)
    }
  }, [activeBanners.length, currentIndex])

  // Progress Bar & Auto-Slide Timer (10s)
  useEffect(() => {
    if (activeBanners.length <= 1) return

    setProgress(0)
    const startTime = Date.now()

    const animFrame = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100)
      setProgress(pct)
    }, 50)

    const slideTimer = setTimeout(() => {
      setCurrentIndex((curr) => (curr + 1) % activeBanners.length)
    }, AUTOPLAY_DELAY)

    return () => {
      clearInterval(animFrame)
      clearTimeout(slideTimer)
    }
  }, [currentIndex, activeBanners.length])

  // Reset progress when index changes
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
  }

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % activeBanners.length)
  }

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + activeBanners.length) % activeBanners.length)
  }

  // Handle Action Execution
  const executeAction = (
    type: 'internal' | 'external' | 'phone' | 'zalo' | undefined,
    url: string | undefined
  ) => {
    if (!url) return
    if (type === 'internal' || !type) {
      onNavigate(url)
    } else if (type === 'external') {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer')
    } else if (type === 'phone') {
      window.location.href = `tel:${url.replace(/\s+/g, '')}`
    } else if (type === 'zalo') {
      const cleanUrl = url.startsWith('http') ? url : `https://zalo.me/${url}`
      window.open(cleanUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Button Click Handler
  const handleButtonClick = (e: React.MouseEvent, btn: BannerButtonOverlay) => {
    e.stopPropagation()
    executeAction(btn.actionType, btn.targetUrl)
  }

  // Entire Banner Click Handler
  const handleBannerClick = (banner: BannerSlideItem) => {
    if (wasDraggedRef.current) {
      return
    }
    if (banner.bannerLink) {
      executeAction(banner.bannerLinkType, banner.bannerLink)
    }
  }

  // Mouse / Touch Drag Handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    isDraggingRef.current = true
    wasDraggedRef.current = false
    dragStartXRef.current = clientX
    setDragDeltaX(0)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return
    const delta = clientX - dragStartXRef.current
    setDragDeltaX(delta)
    if (Math.abs(delta) > 8) {
      wasDraggedRef.current = true
    }
  }

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)

    // Threshold for slide switch: 45px
    if (dragDeltaX < -45) {
      nextSlide()
    } else if (dragDeltaX > 45) {
      prevSlide()
    }

    setDragDeltaX(0)

    setTimeout(() => {
      wasDraggedRef.current = false
    }, 150)
  }

  if (activeBanners.length === 0) {
    return null
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0]
  // Đồng bộ tỷ lệ khung hình chung cho toàn bộ Slider (dựa trên banner 1 hoặc chuẩn 1920/650)
  const masterBanner = activeBanners[0]
  const natW = masterBanner.naturalWidth || 1920
  const natH = masterBanner.naturalHeight || 650
  const aspectRatioStyle = `${natW} / ${natH}`

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[260px] sm:min-h-0 bg-[#1a1a1a] select-none overflow-hidden group"
      style={{
        containerType: 'inline-size',
        aspectRatio: aspectRatioStyle,
      }}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
    >
      {/* Slide Image & Overlay Container */}
      <div
        className={`w-full h-full relative cursor-${
          currentBanner.bannerLink ? 'pointer' : 'default'
        } transition-transform duration-300 ease-out`}
        style={{
          transform: isDragging ? `translateX(${dragDeltaX * 0.4}px)` : 'none',
        }}
        onClick={() => handleBannerClick(currentBanner)}
      >
        <img
          key={currentBanner.id}
          src={currentBanner.imageUrl}
          alt={currentBanner.altText || currentBanner.title}
          className="w-full h-full object-cover object-center pointer-events-none transition-all duration-700 select-none"
        />

        {/* Responsive readability overlays: desktop gradient and full mobile shade. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[45%] sm:block"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/50 sm:hidden" />

        {(currentBanner.mainTitle || currentBanner.description) && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="max-w-7xl mx-auto px-4 h-full relative">
              <div
                className={`absolute ${containerDim.width < 640 ? 'left-1/2 w-[calc(100%-128px)] -translate-x-1/2 text-center' : 'left-4 max-w-[58%] text-left'}`}
                style={{
                  top: containerDim.width < 640 ? undefined : '50%',
                  bottom: containerDim.width < 640 ? 'calc(31% + 29px)' : undefined,
                }}
              >
                {currentBanner.mainTitle && (
                  <h2 className={`${containerDim.width < 640 ? 'line-clamp-2 text-lg' : '-translate-y-1/2 whitespace-nowrap text-2xl lg:text-4xl'} overflow-hidden text-ellipsis font-bold leading-tight text-white drop-shadow-lg`}>
                    {currentBanner.mainTitle}
                  </h2>
                )}
                {currentBanner.description && (
                  <p
                    className={`${containerDim.width < 640 ? 'mt-1 line-clamp-2 text-xs' : 'text-sm lg:text-base'} max-w-2xl leading-snug text-white/90 drop-shadow-md`}
                    style={containerDim.width >= 640 && currentBanner.mainTitle ? { marginTop: containerDim.width >= 1024 ? '-18px' : '-11px' } : undefined}
                  >
                    {currentBanner.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA BUTTONS (ANCHORED TO VD LOGO, 20% FROM BOTTOM, 33px GAP) ── */}
        {currentBanner.buttons && currentBanner.buttons.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="max-w-7xl mx-auto px-4 h-full relative">
              <div
                className="absolute flex items-center pointer-events-auto"
                style={{
                  left: containerDim.width < 640 ? '50%' : '16px',
                  top: containerDim.width < 640 ? '69%' : undefined,
                  bottom: containerDim.width < 640 ? undefined : '20%',
                  transform: containerDim.width < 640 ? 'translate(-50%, -50%)' : 'translateY(50%)',
                  gap: containerDim.width < 640 ? '8px' : '33px',
                  maxWidth: containerDim.width < 640 ? 'calc(100% - 24px)' : undefined,
                }}
              >
                {currentBanner.buttons.slice(0, 2).map((btn) => {
                  let styleClass = 'bg-[#FF000F] text-white hover:bg-red-700 shadow-md border-0'
                  if (btn.styleType === 'navy') {
                    styleClass = 'bg-[#1B4C98] text-white hover:bg-blue-900 shadow-md border-0'
                  } else if (btn.styleType === 'white') {
                    styleClass = 'bg-white text-gray-900 hover:bg-gray-100 shadow-md border border-gray-300'
                  }

                  // Default size (+15% compared to baseline)
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={(e) => handleButtonClick(e, btn)}
                      className={`h-[38px] sm:h-9 px-3 sm:px-[18px] text-xs rounded-[4px] font-bold tracking-tight transition-all duration-150 hover:opacity-95 active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap leading-none ${styleClass}`}
                    >
                      <span className="max-w-[105px] min-[375px]:max-w-[128px] sm:max-w-none overflow-hidden text-ellipsis">{limitButtonLabel(btn.label)}</span>
                      {btn.actionType === 'phone' && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── NAVIGATION ARROWS (50% TRANSPARENCY) ──────────────────────────────── */}
      {activeBanners.length > 1 && (
        <>
          {/* Prev Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/40 hover:bg-[#FF000F] text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 border border-white/20 hover:border-transparent opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
            title="Slide trước"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/40 hover:bg-[#FF000F] text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 border border-white/20 hover:border-transparent opacity-80 hover:opacity-100 hover:scale-110 shadow-lg"
            title="Slide tiếp theo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* ── 10s PROGRESS BAR (TOP) ───────────────────────────────────────────── */}
      {activeBanners.length > 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full transition-all ease-linear"
            style={{
              width: `${progress}%`,
              backgroundColor: 'var(--red, #FF000F)',
              transitionDuration: isPaused || isDragging ? '0ms' : '50ms',
            }}
          />
        </div>
      )}

      {/* ── PAGINATION DOTS (BOTTOM CENTER) ──────────────────────────────────── */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
          {activeBanners.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(idx)
              }}
              className={`h-2 transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-6 bg-[#FF000F]'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              title={`Chuyển đến Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
