import { useState, useEffect } from 'react'
import { NewsItem, getStoredNews, getStoredNewsCategories, createVietnameseSlug } from '@/data/siteData'
import Pagination from '@/components/Pagination'
import { NewsThumbnailView } from '@/components/ThumbnailCropper'

interface NewsPageProps {
  onNavigate: (page: string, articleId?: string) => void
}

export default function NewsPage({ onNavigate }: NewsPageProps) {
  const [news, setNews] = useState<NewsItem[]>(getStoredNews())
  const [categories, setCategories] = useState<string[]>(getStoredNewsCategories())
  const [selectedCat, setSelectedCat] = useState<string>('Tất cả')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const itemsPerPage = 24 // Up to 24 items per page as requested

  // Sync with storage updates from Admin
  useEffect(() => {
    const handleStorageUpdate = () => {
      setNews(getStoredNews())
      setCategories(getStoredNewsCategories())
    }
    window.addEventListener('viendong_storage_update', handleStorageUpdate)
    return () => window.removeEventListener('viendong_storage_update', handleStorageUpdate)
  }, [])

  // Filter published articles
  const filteredNews = news.filter((n) => {
    if (n.status === 'draft') return false
    const matchesCat = selectedCat === 'Tất cả' || n.category.toLowerCase() === selectedCat.toLowerCase()
    const matchesQuery =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesQuery
  })

  // Pagination calculation
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1
  const paginatedNews = filteredNews.slice(
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
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-[#1B4C98] to-[#0e2d5c] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/70 mb-4 flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
              Trang chủ
            </button>
            <span>›</span>
            <span className="text-white font-semibold">Tin tức & Kỹ thuật</span>
          </nav>

          <div className="w-9 h-1 bg-[#FF000F] mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 font-['Roboto_Condensed'] uppercase">
            Tin Tức & Kỹ Thuật Điện ABB
          </h1>
          <p className="text-white/80 max-w-2xl text-sm leading-relaxed">
            Cập nhật tin tức sản phẩm mới nhất, thông báo sự kiện hội thảo kỹ thuật và chia sẻ kiến thức chuyên sâu về hệ thống phân phối điện từ chuyên gia ABB.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Bar: Section Title + Position 1 Pagination (Canh lề phải ngay dưới Header) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="w-8 h-1 bg-[#FF000F] mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] font-['Roboto_Condensed'] tracking-wide uppercase">
              Tin tức & Kỹ thuật
            </h2>
          </div>

          {/* ── Position 1 Pagination: Ngay dưới Header, Canh lề phải ─────────────────── */}
          {totalPages > 1 && (
            <div className="flex sm:justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Category Filter Pills & Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
          {/* Categories */}
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

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm bài viết..."
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

        {/* Article Count */}
        <div className="pb-4">
          <p className="text-xs text-gray-500 font-medium">
            Có tất cả <strong>{filteredNews.length}</strong> bài viết
            {selectedCat !== 'Tất cả' && ` trong chuyên mục "${selectedCat}"`}
          </p>
        </div>

        {/* News Grid (Matching Hình 2) */}
        {paginatedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNews.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('newsDetail', createVietnameseSlug(item.slug || item.title))}
                className="bg-white overflow-hidden border border-[#e5e5e5] hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
              >
                {/* Thumbnail Image */}
                <div className="h-48 overflow-hidden bg-[#f5f5f5] relative">
                  <NewsThumbnailView
                    thumb={item.thumb}
                    alt={item.title}
                    className="w-full h-full"
                    imgClassName="group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.isFeatured && (
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider z-10"
                      style={{ backgroundColor: 'var(--red)' }}
                    >
                      Nổi bật
                    </span>
                  )}
                </div>

                {/* Card Body (Matching Hình 2) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Tag + Date */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide bg-[#f7f7f7] text-[#555]"
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{item.date}</span>
                    </div>

                    {/* Title */}
                    <h3
                      className="font-bold text-gray-900 text-[14px] leading-snug mb-2 group-hover:text-[#FF000F] transition-colors line-clamp-2"
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      {item.title}
                    </h3>

                    {/* Summary excerpt */}
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                      {item.summary}
                    </p>
                  </div>

                  {/* Read more action in ABB Red */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FF000F] group-hover:underline flex items-center gap-1">
                      Đọc thêm →
                    </span>
                    <span className="text-[11px] text-gray-400">{item.readTime || '3 phút đọc'}</span>
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
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-base font-bold text-gray-700 mb-1">Không tìm thấy bài viết nào</p>
            <p className="text-xs text-gray-500 mb-4">Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chọn chuyên mục khác.</p>
            <button
              onClick={() => {
                setSelectedCat('Tất cả')
                setSearchQuery('')
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1B4C98] hover:opacity-90 transition-opacity"
            >
              Xem tất cả tin tức
            </button>
          </div>
        )}

        {/* ── Position 2 Pagination: Dưới các ô hiển thị tin bài, Canh giữa trang ────── */}
        {totalPages > 1 && (
          <div className="mt-14 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
