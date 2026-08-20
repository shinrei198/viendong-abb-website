import React, { useState, useEffect, useRef } from 'react'
import { BannerSlideItem, BannerButtonOverlay } from '@/data/siteData'

interface HeroSliderProps {
  banners: BannerSlideItem[]
  onNavigate: (page: string, id?: string) => void
}

const AUTOPLAY_DELAY = 10000 // 10 seconds

export default function HeroSlider({ banners, onNavigate }: HeroSliderProps) {
  const activeBanners = banners.filter((b) => b.isActive)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

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
    if (activeBanners.length <= 1 || isPaused || isDragging) return

    const intervalStep = 50 // ms
    const stepPercent = (intervalStep / AUTOPLAY_DELAY) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % activeBanners.length)
          return 0
        }
        return prev + stepPercent
      })
    }, intervalStep)

    return () => clearInterval(timer)
  }, [activeBanners.length, isPaused, isDragging, currentIndex])

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
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
    } else if (type === 'phone') {
      window.location.href = `tel:${url.replace(/\s+/g, '')}`
    } else if (type === 'zalo') {
      const cleanUrl = url.startsWith('http') ? url : `https://zalo.me/${url}`
      window.open(cleanUrl, '_blank')
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

  return (
    <div
      className="relative w-full bg-[#1a1a1a] select-none overflow-hidden group aspect-[16/6]"
      style={{ containerType: 'inline-size' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        handleDragEnd()
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
          src={currentBanner.imageUrl}
          alt={currentBanner.altText || currentBanner.title}
          className="w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 select-none"
        />



        {/* ── INTERACTIVE HOTSPOT CTA BUTTONS (100% WYSIWYG IDENTICAL TO ADMIN CANVAS) ── */}
        {currentBanner.buttons &&
          currentBanner.buttons.map((btn) => {
            // Button style presets
            let styleClass =
              'bg-[#FF000F] text-white hover:bg-red-700 border border-red-500 shadow-xl'
            if (btn.styleType === 'navy') {
              styleClass =
                'bg-[#1B4C98] text-white hover:bg-blue-900 border border-blue-400 shadow-xl'
            } else if (btn.styleType === 'white') {
              styleClass =
                'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 shadow-xl'
            } else if (btn.styleType === 'glass') {
              styleClass =
                'bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-white/40 shadow-xl'
            }

            // Proportional font size & padding matching container width (1:1 identical to Admin Preview)
            let fontSize = 'clamp(9px, 1.05cqi, 15px)'
            let padding = 'clamp(3px, 0.45cqi, 9px) clamp(8px, 1.25cqi, 22px)'
            if (btn.size === 'sm') {
              fontSize = 'clamp(8px, 0.85cqi, 12px)'
              padding = 'clamp(2px, 0.35cqi, 7px) clamp(6px, 0.95cqi, 16px)'
            } else if (btn.size === 'lg') {
              fontSize = 'clamp(11px, 1.25cqi, 18px)'
              padding = 'clamp(5px, 0.65cqi, 12px) clamp(12px, 1.65cqi, 28px)'
            }

            return (
              <button
                key={btn.id}
                type="button"
                onClick={(e) => handleButtonClick(e, btn)}
                style={{
                  left: `${btn.posX}%`,
                  top: `${btn.posY}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize,
                  padding,
                }}
                className={`absolute z-20 rounded-none font-bold tracking-tight transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${styleClass}`}
              >
                <span>{btn.label}</span>
                {btn.actionType === 'phone' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                )}
              </button>
            )
          })}
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
