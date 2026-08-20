import { useState, useEffect } from 'react'
import { VideoItem, getStoredVideos, getStoredVideoCategories } from '@/data/siteData'
import Pagination from '@/components/Pagination'
import VideoModal from '@/components/VideoModal'

interface VideosPageProps {
  onNavigate: (page: string, productId?: string) => void
}

export default function VideosPage({ onNavigate }: VideosPageProps) {
  const [videos, setVideos] = useState<VideoItem[]>(getStoredVideos())
  const [categories, setCategories] = useState<string[]>(getStoredVideoCategories())
  const [selectedCat, setSelectedCat] = useState<string>('Tất cả')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null)

  const itemsPerPage = 12

  // Sync with storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setVideos(getStoredVideos())
      setCategories(getStoredVideoCategories())
    }
    window.addEventListener('viendong_storage_update', handleStorageUpdate)
    return () => window.removeEventListener('viendong_storage_update', handleStorageUpdate)
  }, [])

  // Filter videos
  const filteredVideos = videos.filter((v) => {
    if (v.isHidden) return false
    const matchesCat = selectedCat === 'Tất cả' || v.category.toLowerCase() === selectedCat.toLowerCase()
    const matchesQuery =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  // Pagination calculation
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCatChange = (cat: string) => {
    setSelectedCat(cat)
    setCurrentPage(1)
  }

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setCurrentPage(1)
  }

  return (
    <div className="bg-white min-h-screen font-['Roboto']">
      {/* Top Banner / Hero */}
      <section className="bg-gradient-to-r from-[#1B4C98] to-[#0e2d5c] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/70 mb-4 flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
              Trang chủ
            </button>
            <span>›</span>
            <span className="text-white font-semibold">Video & Truyền thông</span>
          </nav>

          <div className="w-9 h-1 bg-[#FF000F] mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 font-['Roboto_Condensed'] uppercase">
            Video & Truyền Thông ABB
          </h1>
          <p className="text-white/80 max-w-2xl text-sm leading-relaxed">
            Tổng hợp video giới thiệu sản phẩm mới, hướng dẫn lắp đặt kỹ thuật và các sự kiện hội thảo trực tuyến của ABB và Viễn Đông Electric.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Controls: Category Filter + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-200">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['Tất cả', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCatChange(cat)}
                className={`px-4 py-2 text-xs font-bold transition-all ${
                  selectedCat === cat
                    ? 'bg-[#1B4C98] text-white shadow-sm'
                    : 'bg-[#f4f4f4] text-[#444444] hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm video..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#1B4C98] transition-colors"
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Video Count & Top Pagination */}
        <div className="flex items-center justify-between py-6">
          <p className="text-xs text-gray-500 font-medium">
            Hiển thị <strong>{paginatedVideos.length}</strong> / <strong>{filteredVideos.length}</strong> video
            {selectedCat !== 'Tất cả' && ` trong mục "${selectedCat}"`}
          </p>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Video Grid (Matching Hình 1) */}
        {paginatedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => setActiveModalVideo(v)}
                className="bg-white border border-[#e5e5e5] overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail Container (16:9) with Red Play Button Overlay */}
                <div className="relative w-full aspect-video bg-[#f0f0f0] overflow-hidden">
                  <img
                    src={v.thumb || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=338&fit=crop&auto=format'}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                    {/* Centered Red Play Square Button (as in Image 1) */}
                    <div
                      className="w-12 h-10 flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-transform duration-200"
                      style={{ backgroundColor: '#FF000F' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration badge bottom-right (as in Image 1) */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-none">
                    {v.duration || '0:30'}
                  </span>
                </div>

                {/* Video Info Content (Exact styling from instructions & Image 1) */}
                <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Category on Left (#a5a5a5) | Date on Right (ABB Red) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
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

                    {/* Title */}
                    <h3
                      className="text-[13px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 group-hover:text-[#FF000F] transition-colors"
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                      title={v.title}
                    >
                      {v.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 border border-gray-200">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999"
              strokeWidth="1.5"
              className="mx-auto mb-3"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
            <p className="text-base font-bold text-gray-700 mb-1">Không tìm thấy video nào</p>
            <p className="text-xs text-gray-500 mb-4">Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chọn danh mục khác.</p>
            <button
              onClick={() => {
                setSelectedCat('Tất cả')
                setSearchQuery('')
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1B4C98] hover:opacity-90 transition-opacity"
            >
              Xem tất cả video
            </button>
          </div>
        )}

        {/* Bottom Centered Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Video Modal Popup */}
      <VideoModal
        video={activeModalVideo}
        onClose={() => setActiveModalVideo(null)}
        onNavigate={onNavigate}
      />
    </div>
  )
}
