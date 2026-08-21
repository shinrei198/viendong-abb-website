import { useState, useEffect, useRef } from 'react'
import imgMCB from '@/imports/MBB.jpg'
import imgAFDD from '@/imports/Thie__t_bi__pha_t_hie__n_ho___quang__ie__n_AFDDs.jpg'
import imgFramia from '@/imports/Framina.jpeg'
import imgInora from '@/imports/Inora.jpg'
import imgSurgeArrest from '@/imports/Thie__t_bi___o_ng_ca__t_MCB.jpg'
import imgZita from '@/imports/Zita.png'
import imgVelet from '@/imports/Velet.png'
import {
  VideoItem,
  NewsItem,
  BannerSlideItem,
  getStoredVideos,
  getStoredNews,
  getStoredBanners,
  getStoredSiteSettings,
  createVietnameseSlug,
} from '@/data/siteData'
import { NewsThumbnailView } from '@/components/ThumbnailCropper'
import VideoModal from '@/components/VideoModal'
import HeroSlider from '@/components/HeroSlider'

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void
  onAddToCart: (product: { id: string; name: string; sku: string }) => void
}

const categories = [
  { name: 'MCB · RCCB · RCBO', desc: 'Dòng SH200, GSH201 — 111 sản phẩm', count: 111, img: imgMCB },
  { name: 'Thiết bị bảo vệ chống hồ quang – AFDD', desc: 'S-ARC1, DS-ARC1 — an toàn tuyệt đối', count: 24, img: imgAFDD },
  { name: 'Công tắc & Ổ cắm Framia', desc: '3 màu Trắng · Xám · Vàng — 30 sản phẩm', count: 30, img: imgFramia },
  { name: 'Công tắc & Ổ cắm Inora', desc: 'Thiết kế hiện đại — 19 sản phẩm', count: 19, img: imgInora },
  { name: 'Chống sét lan truyền', desc: 'OVR, OVR T1-T2 — bảo vệ thiết bị điện', count: 32, img: imgSurgeArrest },
  { name: 'ACB – Máy cắt không khí', desc: 'Emax2 E1.2→E4.2 — 50 sản phẩm', count: 50, img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=420&fit=crop&auto=format' },
]

const featuredProducts = [
  { id: 'zita-1', name: 'Công tắc đơn ABB Zita', sku: 'ZITA-SW1', cat: 'Công tắc', badge: 'Bán chạy', img: imgZita, isLocal: true },
  { id: 'velet-1', name: 'Công tắc 3 băng ABB Velet 120', sku: 'VELET-SW3', cat: 'Công tắc', badge: 'Hot', img: imgVelet, isLocal: true },
  { id: 'mcb-1', name: 'MCB 1P 16A SH200L-C16', sku: '2CSS215101R0164', cat: 'MCB', badge: 'Bán chạy', img: null, isLocal: false },
  { id: 'mccb-2', name: 'MCCB 3P 63A T1N', sku: '1SDA051338R1', cat: 'MCCB', badge: 'Mới', img: null, isLocal: false },
  { id: 'ict-1', name: 'Contactor ESB20-20N 20A', sku: 'GHE3211302R0006', cat: 'Contactor', badge: '', img: null, isLocal: false },
  { id: 'acb-1', name: 'ACB 3P 800A Emax2 E1.2N', sku: '1SDA070753R1', cat: 'ACB', badge: 'Hot', img: null, isLocal: false },
]

const stats = [
  { value: '50+', label: 'Cửa hàng & Đại lý' },
  { value: '30+', label: 'Tỉnh thành' },
  { value: '500+', label: 'Mã thiết bị' },
  { value: '20+', label: 'Năm kinh nghiệm' },
]

const whyUs = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
    title: 'Hàng chính hãng 100%',
    desc: 'Nhập trực tiếp từ ABB với đầy đủ chứng từ và tem kiểm định.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>,
    title: 'Giao hàng toàn quốc',
    desc: 'Phủ khắp 63 tỉnh thành, nhanh trong 24–48 giờ.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>,
    title: 'Hỗ trợ kỹ thuật 24/7',
    desc: 'Đội ngũ kỹ sư điện tư vấn và giải đáp mọi thắc mắc.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
    title: 'Chính sách đại lý linh hoạt',
    desc: 'Chiết khấu hấp dẫn, công nợ và hỗ trợ marketing.',
  },
]

const font = "'Roboto Condensed', 'Roboto', sans-serif"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div style={{ width: 32, height: 3, backgroundColor: 'var(--red)', marginBottom: 12 }} />
      {children}
    </div>
  )
}

export default function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const [banners, setBanners] = useState<BannerSlideItem[]>(getStoredBanners())
  const [videos, setVideos] = useState<VideoItem[]>(getStoredVideos())
  const [newsList, setNewsList] = useState<NewsItem[]>(getStoredNews())
  const [settings, setSettings] = useState(getStoredSiteSettings())
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null)

  useEffect(() => {
    const handleStorageUpdate = () => {
      setBanners(getStoredBanners())
      setVideos(getStoredVideos())
      setNewsList(getStoredNews())
      setSettings(getStoredSiteSettings())
    }
    handleStorageUpdate()
    window.addEventListener('viendong_storage_update', handleStorageUpdate)
    window.addEventListener('storage', handleStorageUpdate)
    return () => {
      window.removeEventListener('viendong_storage_update', handleStorageUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }
  }, [])

  const displayVideos = videos.filter((v) => !v.isHidden).slice(0, 8)
  const displayNews = newsList.filter((n) => n.status === 'published').slice(0, 8)

  // Drag to Scroll Refs for Video and News sliders
  const videoScrollRef = useRef<HTMLDivElement>(null)
  const newsScrollRef = useRef<HTMLDivElement>(null)

  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
  const [videoStartX, setVideoStartX] = useState(0)
  const [videoScrollLeft, setVideoScrollLeft] = useState(0)
  const wasVideoDraggedRef = useRef(false)

  const [isDraggingNews, setIsDraggingNews] = useState(false)
  const [newsStartX, setNewsStartX] = useState(0)
  const [newsScrollLeft, setNewsScrollLeft] = useState(0)
  const wasNewsDraggedRef = useRef(false)

  // Video Drag Handlers
  const handleVideoMouseDown = (e: React.MouseEvent) => {
    if (!videoScrollRef.current) return
    setIsDraggingVideo(true)
    wasVideoDraggedRef.current = false
    setVideoStartX(e.pageX - videoScrollRef.current.offsetLeft)
    setVideoScrollLeft(videoScrollRef.current.scrollLeft)
  }

  const handleVideoMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingVideo || !videoScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - videoScrollRef.current.offsetLeft
    const walk = (x - videoStartX) * 1.5
    videoScrollRef.current.scrollLeft = videoScrollLeft - walk
    if (Math.abs(walk) > 6) {
      wasVideoDraggedRef.current = true
    }
  }

  const handleVideoMouseUp = () => {
    setIsDraggingVideo(false)
    setTimeout(() => {
      wasVideoDraggedRef.current = false
    }, 50)
  }

  const scrollVideo = (direction: 'left' | 'right') => {
    if (!videoScrollRef.current) return
    const scrollAmount = 320
    videoScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  // News Drag Handlers
  const handleNewsMouseDown = (e: React.MouseEvent) => {
    if (!newsScrollRef.current) return
    setIsDraggingNews(true)
    wasNewsDraggedRef.current = false
    setNewsStartX(e.pageX - newsScrollRef.current.offsetLeft)
    setNewsScrollLeft(newsScrollRef.current.scrollLeft)
  }

  const handleNewsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingNews || !newsScrollRef.current) return
    e.preventDefault()
    const x = e.pageX - newsScrollRef.current.offsetLeft
    const walk = (x - newsStartX) * 1.5
    newsScrollRef.current.scrollLeft = newsScrollLeft - walk
    if (Math.abs(walk) > 6) {
      wasNewsDraggedRef.current = true
    }
  }

  const handleNewsMouseUp = () => {
    setIsDraggingNews(false)
    setTimeout(() => {
      wasNewsDraggedRef.current = false
    }, 50)
  }

  const scrollNews = (direction: 'left' | 'right') => {
    if (!newsScrollRef.current) return
    const scrollAmount = 360
    newsScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div style={{ background: '#fff' }}>
      {/* ── HERO BANNER SLIDER (Auto 10s, Drag & Swipe, Hotspot Buttons) ── */}
      <section className="w-full relative">
        <HeroSlider banners={banners} onNavigate={onNavigate} />
      </section>

      {/* ── ABB STRIP ─────────────────────────────────────── */}
      <section className="bg-white py-4" style={{ borderTop: '3px solid var(--red)', borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-8 flex items-center justify-center bg-red-600 text-white font-black text-sm tracking-wider flex-shrink-0">ABB</div>
            <div>
              <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Roboto', sans-serif" }}>
                Viễn Đông Electric — Nhà phân phối chính thức của ABB tại Việt Nam
              </p>
              <p className="text-xs text-gray-400">Authorized Distribution Partner · Hỗ trợ & Bảo hành chính hãng</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400 flex-shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Hàng có sẵn</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" /> Bảo hành chính hãng</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600" /> Hỗ trợ kỹ thuật</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <SectionLabel>
            <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#1a1a1a', lineHeight: 1.1 }}>
              Danh mục sản phẩm
            </h2>
          </SectionLabel>
          <button
            onClick={() => onNavigate('products')}
            className="text-sm font-medium hidden md:block hover:underline"
            style={{ color: '#1a1a1a', fontFamily: "'Roboto', sans-serif" }}
          >
            Xem tất cả →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className="md:col-span-2 md:row-span-2 relative overflow-hidden cursor-pointer group"
            style={{ minHeight: '380px' }}
            onClick={() => onNavigate('products')}
          >
            <img
              src={categories[0].img as string}
              alt={categories[0].name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.0) 55%)' }} />
            <div className="absolute bottom-0 left-0 p-7">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-white mb-2" style={{ backgroundColor: 'var(--red)' }}>
                {categories[0].count}+ sản phẩm
              </span>
              <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '1.9rem', color: 'white' }}>{categories[0].name}</h3>
              <p className="text-white/60 text-sm mt-1">{categories[0].desc}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-white/70 group-hover:text-white transition-colors">Khám phá →</span>
            </div>
          </div>

          {categories.slice(1, 5).map((cat) => (
            <div
              key={cat.name}
              className="relative overflow-hidden cursor-pointer group"
              style={{ minHeight: '180px' }}
              onClick={() => onNavigate('products')}
            >
              <img
                src={cat.img as string}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.0) 55%)' }} />
              <div className="absolute bottom-0 left-0 p-5">
                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-white mb-1.5" style={{ backgroundColor: 'var(--red)' }}>
                  {cat.count}+ SP
                </span>
                <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#f7f7f7' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <SectionLabel>
              <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#1a1a1a', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sản phẩm nổi bật
              </h2>
            </SectionLabel>
            <button onClick={() => onNavigate('products')} className="text-sm font-medium hidden md:block hover:underline" style={{ color: '#1a1a1a' }}>
              Xem tất cả →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 group"
                style={{ border: '1px solid #e5e5e5' }}
              >
                <div
                  className="relative aspect-square flex items-center justify-center overflow-hidden"
                  style={{ background: '#fafafa' }}
                >
                  {p.badge && (
                    <span
                      className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white z-10"
                      style={{ backgroundColor: 'var(--red)' }}
                    >
                      {p.badge}
                    </span>
                  )}
                  {p.img ? (
                    <img
                      src={p.img as string}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
                    />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="opacity-10 group-hover:opacity-20 transition-opacity">
                      <rect x="8" y="12" width="48" height="40" rx="2" stroke="#1a1a1a" strokeWidth="2"/>
                      <rect x="14" y="18" width="10" height="10" rx="1" fill="#FF000F"/>
                      <rect x="27" y="18" width="10" height="10" rx="1" fill="#FF000F"/>
                      <rect x="40" y="18" width="10" height="10" rx="1" fill="#FF000F"/>
                      <rect x="14" y="32" width="36" height="2" rx="1" fill="#1a1a1a"/>
                      <rect x="14" y="38" width="24" height="2" rx="1" fill="#1a1a1a"/>
                    </svg>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{p.cat}</p>
                  <h4 className="text-[12px] font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: "'Roboto', sans-serif" }}>{p.name}</h4>
                  <p className="text-[9px] text-gray-300 mb-3 font-mono">{p.sku}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onNavigate('productDetail', p.id)}
                      className="flex-1 py-1.5 text-[11px] font-medium border transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#e5e5e5', color: '#1a1a1a' }}
                    >Chi tiết</button>
                    <button
                      onClick={() => onAddToCart({ id: p.id, name: p.name, sku: p.sku })}
                      className="flex-1 py-1.5 text-[11px] font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: 'var(--red)' }}
                    >+ Giỏ</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTION (Matching Hình 1 & Instructions) ─── */}
      <section className="py-20 px-6 bg-white" style={{ borderTop: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <SectionLabel>
              <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#1a1a1a', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Video mới cập nhật
              </h2>
            </SectionLabel>
            <div className="flex items-center gap-4">
              {/* Slider Navigation Arrows */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollVideo('left')}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-[#FF000F] hover:text-white hover:border-transparent transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Video trước"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollVideo('right')}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-[#FF000F] hover:text-white hover:border-transparent transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Video kế tiếp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => onNavigate('videos')}
                className="text-sm font-medium hover:underline flex items-center gap-1 text-[#1a1a1a]"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Xem tất cả video →
              </button>
            </div>
          </div>

          {/* Interactive Drag & Swipe Video Carousel */}
          <div
            ref={videoScrollRef}
            onMouseDown={handleVideoMouseDown}
            onMouseMove={handleVideoMouseMove}
            onMouseUp={handleVideoMouseUp}
            onMouseLeave={handleVideoMouseUp}
            className={`flex gap-4 overflow-x-auto pb-4 pt-1 select-none no-scrollbar cursor-${isDraggingVideo ? 'grabbing' : 'grab'}`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: isDraggingVideo ? 'none' : 'x proximity',
            }}
          >
            {displayVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  if (!wasVideoDraggedRef.current) {
                    setActiveModalVideo(v)
                  }
                }}
                className="flex-shrink-0 w-72 bg-white overflow-hidden group cursor-pointer border border-[#e5e5e5] hover:shadow-lg transition-all duration-300 flex flex-col"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* 16:9 Thumbnail with red play button overlay */}
                <div className="relative w-full aspect-video bg-[#f7f7f7] overflow-hidden">
                  <img
                    src={v.thumb}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />

                  {/* Featured Red Badge Top-Left */}
                  {v.isFeatured && (
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white z-10 uppercase tracking-wider shadow-sm"
                      style={{ backgroundColor: 'var(--red)' }}
                    >
                      Nổi bật
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                    {/* Centered Red Play Square Button */}
                    <div
                      className="w-11 h-9 flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-transform duration-200"
                      style={{ backgroundColor: '#FF000F' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5">
                    {v.duration}
                  </span>
                </div>

                {/* Info block */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider truncate"
                        style={{ color: '#a5a5a5', fontFamily: "'Roboto', sans-serif" }}
                      >
                        {v.category}
                      </span>
                      <span
                        className="text-[11px] font-bold flex-shrink-0"
                        style={{ color: '#FF000F', fontFamily: "'Roboto', sans-serif" }}
                      >
                        {v.date}
                      </span>
                    </div>
                    <h3
                      className="text-[13px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#FF000F] transition-colors"
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      {v.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY VIEN DONG ─────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#f7f7f7', borderTop: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ width: 32, height: 3, backgroundColor: 'var(--red)', margin: '0 auto 12px' }} />
            <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1a1a1a', lineHeight: 1.1 }}>
              Tại sao chọn Viễn Đông?
            </h2>
            <p className="text-gray-400 mt-3 text-base max-w-xl mx-auto">
              Đối tác tin cậy của hàng nghìn đại lý và nhà thầu điện trên toàn quốc
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: '#e5e5e5' }}>
            {whyUs.map((item, i) => (
              <div
                key={item.title}
                className="p-8 flex flex-col"
                style={{ background: i % 2 === 0 ? 'var(--red)' : '#ffffff' }}
              >
                <div
                  className="mb-6 w-12 h-12 flex items-center justify-center"
                  style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.18)' : '#f7f7f7' }}
                >
                  <span style={{ color: i % 2 === 0 ? 'white' : '#1a1a1a' }}>{item.icon}</span>
                </div>
                <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.25, marginBottom: '0.5rem', color: i % 2 === 0 ? 'white' : '#1a1a1a' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: i % 2 === 0 ? 'rgba(255,255,255,0.65)' : '#888' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#f7f7f7', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ width: 32, height: 3, backgroundColor: 'var(--red)', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, color: '#1a1a1a' }} className="mb-4">
            Trở thành đại lý phân phối của Viễn Đông
          </h2>
          <p className="text-gray-400 mb-10 text-base max-w-xl mx-auto">
            Tiếp cận toàn bộ danh mục ABB với chính sách chiết khấu tốt nhất thị trường.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="px-8 py-3.5 font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--red)' }}
            >
              Đăng ký làm đại lý
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="px-8 py-3.5 font-medium transition-all hover:bg-gray-200"
              style={{ border: '1px solid #d5d5d5', color: '#1a1a1a', background: 'white' }}
            >
              Xem hệ thống phân phối
            </button>
          </div>
        </div>
      </section>

      {/* ── SUPPORT ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white" style={{ borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div style={{ width: 32, height: 3, backgroundColor: 'var(--red)', margin: '0 auto 12px' }} />
            <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1a1a1a', lineHeight: 1.1 }}>
              Chúng tôi sẵn sàng hỗ trợ bạn
            </h2>
            <p className="text-gray-400 mt-3 text-base max-w-xl mx-auto">
              Hãy liên hệ với <span style={{ color: 'var(--red)', fontWeight: 600 }}>Viễn Đông</span> nếu bạn cần tư vấn về sản phẩm, chương trình ưu đãi hoặc cách thức hợp tác bạn nhé!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: settings.hotlineFormatted || 'tel:+842839435276', label: 'Liên hệ qua Hotline', bg: 'var(--red)', icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', textColor: 'white' },
              { href: settings.zaloUrl || 'https://zalo.me', label: 'Liên hệ qua Zalo', bg: '#1B4C98', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', textColor: 'white' },
              { href: settings.catalogueUrl || '#', label: 'Catalogue, Bảng giá ABB', bg: '#f7f7f7', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5V8H18.5L13 3.5zM6 20V4h5v5h5v11H6z', textColor: '#1a1a1a', stroke: true },
              { href: `mailto:${settings.email || 'info@viendongelectric.vn'}`, label: 'Gửi yêu cầu báo giá nhanh', bg: 'var(--red)', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', textColor: 'white' },
            ].map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
                target={btn.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 font-bold text-sm uppercase tracking-widest transition-all hover:opacity-85 active:scale-95"
                style={{ background: btn.bg, color: btn.textColor, fontFamily: font, fontSize: '0.9rem', border: btn.textColor === '#1a1a1a' ? '1px solid #e5e5e5' : 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={btn.stroke ? 'none' : btn.textColor} stroke={btn.stroke ? btn.textColor : 'none'} strokeWidth={btn.stroke ? 2 : 0}>
                  <path d={btn.icon} />
                </svg>
                {btn.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS (Matching Hình 2) ────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <SectionLabel>
              <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#1a1a1a', lineHeight: 1.1 }}>
                Tin tức & Kỹ thuật
              </h2>
            </SectionLabel>
            <div className="flex items-center gap-4">
              {/* Slider Navigation Arrows */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollNews('left')}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-[#FF000F] hover:text-white hover:border-transparent transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Tin tức trước"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollNews('right')}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 bg-white text-gray-700 hover:bg-[#FF000F] hover:text-white hover:border-transparent transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Tin tức kế tiếp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => onNavigate('news')}
                className="text-sm font-medium hover:underline flex items-center gap-1 text-[#1a1a1a]"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Xem tất cả tin tức →
              </button>
            </div>
          </div>

          {/* Interactive Drag & Swipe News Carousel */}
          <div
            ref={newsScrollRef}
            onMouseDown={handleNewsMouseDown}
            onMouseMove={handleNewsMouseMove}
            onMouseUp={handleNewsMouseUp}
            onMouseLeave={handleNewsMouseUp}
            className={`flex gap-5 overflow-x-auto pb-4 pt-1 select-none no-scrollbar cursor-${isDraggingNews ? 'grabbing' : 'grab'}`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: isDraggingNews ? 'none' : 'x proximity',
            }}
          >
            {displayNews.map((news) => (
              <div
                key={news.id}
                onClick={() => {
                  if (!wasNewsDraggedRef.current) {
                    onNavigate('newsDetail', createVietnameseSlug(news.slug || news.title))
                  }
                }}
                className="flex-shrink-0 w-80 overflow-hidden bg-white hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                style={{ border: '1px solid #e5e5e5', scrollSnapAlign: 'start' }}
              >
                <div>
                  <div className="h-44 overflow-hidden bg-[#f0f0f0] relative">
                    <NewsThumbnailView
                      thumb={news.thumb}
                      alt={news.title}
                      className="w-full h-full"
                      imgClassName="group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    />
                    {news.isFeatured && (
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm z-10"
                        style={{ backgroundColor: 'var(--red)' }}
                      >
                        Nổi bật
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide"
                        style={{ backgroundColor: '#f7f7f7', color: '#555' }}
                      >
                        {news.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{news.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#FF000F] transition-colors line-clamp-2" style={{ fontFamily: "'Roboto', sans-serif" }}>
                      {news.title}
                    </h3>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <p className="text-xs text-red-600 font-medium group-hover:underline">
                    Đọc thêm →
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal Popup */}
      <VideoModal
        video={activeModalVideo}
        onClose={() => setActiveModalVideo(null)}
        onNavigate={onNavigate}
      />
    </div>
  )
}
