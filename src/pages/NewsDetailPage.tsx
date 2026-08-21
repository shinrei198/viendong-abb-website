import { useState, useEffect } from 'react'
import { NewsItem, getStoredNews, createVietnameseSlug } from '@/data/siteData'
import { NewsThumbnailView } from '@/components/ThumbnailCropper'

interface NewsDetailPageProps {
  articleId: string
  onNavigate: (page: string, articleId?: string) => void
}

export default function NewsDetailPage({ articleId, onNavigate }: NewsDetailPageProps) {
  const [allNews, setAllNews] = useState<NewsItem[]>(getStoredNews())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleStorageUpdate = () => {
      setAllNews(getStoredNews())
    }
    window.addEventListener('viendong_storage_update', handleStorageUpdate)
    return () => window.removeEventListener('viendong_storage_update', handleStorageUpdate)
  }, [])

  // Find article by id or slug, or fallback
  const normalizeSlug = (s?: string) => (s || '').toLowerCase().replace(/[-_]+/g, '_')
  const targetSlug = normalizeSlug(articleId)
  const article =
    allNews.find(
      (n) =>
        n.id === articleId ||
        normalizeSlug(n.slug) === targetSlug ||
        normalizeSlug(createVietnameseSlug(n.title)) === targetSlug
    ) || allNews[0]

  // Find related articles (same category, excluding current)
  const relatedArticles = allNews
    .filter((n) => n.id !== article.id && (n.category === article.category || n.tags.some(t => article.tags?.includes(t))))
    .slice(0, 3)

  // If not enough in category, take latest
  const finalRelated =
    relatedArticles.length >= 2
      ? relatedArticles
      : allNews.filter((n) => n.id !== article.id).slice(0, 3)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white min-h-screen font-['Roboto']">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-[#f8fafc] border-b border-gray-200 py-3.5 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FF000F] transition-colors">
              Trang chủ
            </button>
            <span>›</span>
            <button onClick={() => onNavigate('news')} className="hover:text-[#FF000F] transition-colors">
              Tin tức & Kỹ thuật
            </button>
            <span>›</span>
            <span className="text-[#1B4C98] font-medium">{article.category}</span>
            <span>›</span>
            <span className="text-gray-900 font-semibold truncate max-w-[280px] sm:max-w-md">
              {article.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-6 py-10">
        {/* Category Badge & Meta Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider text-white"
            style={{ backgroundColor: 'var(--red)' }}
          >
            {article.category}
          </span>
          <span className="text-xs text-gray-400 font-medium">{article.date}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-600 font-medium">Bởi {article.author}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{article.readTime || '4 phút đọc'}</span>
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-4xl font-bold text-[#1a1a1a] leading-tight mb-6"
          style={{ fontFamily: "'Roboto Condensed', 'Roboto', sans-serif" }}
        >
          {article.title}
        </h1>

        {/* Summary Excerpt */}
        {article.summary && (
          <div className="bg-[#f8fafc] border-l-4 border-[#1B4C98] p-4 sm:p-5 mb-8 text-gray-700 text-sm sm:text-base font-medium leading-relaxed">
            {article.summary}
          </div>
        )}

        {/* Featured Image */}
        {article.thumb && (
          <div className="mb-8 overflow-hidden border border-gray-200 bg-gray-100 max-h-[460px]">
            <NewsThumbnailView
              thumb={article.thumb}
              alt={article.title}
              className="w-full h-80 sm:h-[420px]"
            />
          </div>
        )}

        {/* Quote Block (if configured) */}
        {article.quote && (
          <blockquote className="my-8 p-6 bg-gradient-to-r from-red-50 to-gray-50 border-l-4 border-[#FF000F] text-gray-800">
            <p className="text-base sm:text-lg font-semibold italic leading-relaxed text-[#1a1a1a] mb-2">
              "{article.quote}"
            </p>
            {article.quoteAuthor && (
              <cite className="block text-xs font-bold text-gray-600 uppercase tracking-wide not-italic">
                — {article.quoteAuthor}
              </cite>
            )}
          </blockquote>
        )}

        {/* Rich HTML Content */}
        <div
          className="prose max-w-none text-gray-800 text-[15px] leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Attachments Section */}
        {article.attachments && article.attachments.length > 0 && (
          <div className="mt-10 p-6 bg-[#f8fafc] border border-gray-200">
            <h4 className="text-sm font-bold text-[#1B4C98] uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5V8H18.5L13 3.5zM6 20V4h5v5h5v11H6z" />
              </svg>
              Tài liệu kỹ thuật đính kèm
            </h4>
            <div className="space-y-2.5">
              {article.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-[#FF000F] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-100 text-[#FF000F] flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{file.name}</p>
                      <p className="text-[11px] text-gray-400">{file.size}</p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    download
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1B4C98] hover:bg-[#FF000F] transition-colors"
                  >
                    Tải về ↓
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Article Tags & Social Share */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500 mr-1">Tags:</span>
            {article.tags?.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 text-[11px] bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Social share actions */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Chia sẻ:</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 text-xs font-medium border border-gray-300 hover:border-gray-500 text-gray-700 transition-colors"
            >
              {copied ? '✓ Đã sao chép link' : 'Sao chép link'}
            </button>
            <a
              href={`https://zalo.me/share?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 text-xs font-bold text-white bg-[#0068ff] hover:opacity-90 transition-opacity"
            >
              Zalo
            </a>
          </div>
        </div>

        {/* Back to news button */}
        <div className="mt-8">
          <button
            onClick={() => onNavigate('news')}
            className="px-6 py-2.5 text-xs font-bold text-[#1B4C98] border border-[#1B4C98] hover:bg-[#1B4C98] hover:text-white transition-colors"
          >
            ← Quay lại danh sách tin tức
          </button>
        </div>
      </article>

      {/* ── RELATED ARTICLES SECTION (Đề xuất tin liên quan) ────────────────────── */}
      <section className="bg-[#f7f7f7] py-14 px-6 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="w-8 h-1 bg-[#FF000F] mb-2.5" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] font-['Roboto_Condensed'] uppercase tracking-wide">
              Tin tức liên quan cùng chuyên mục
            </h3>
            <p className="text-xs text-gray-500 mt-1">Các bài viết mới nhất trong mục "{article.category}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {finalRelated.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate('newsDetail', createVietnameseSlug(item.slug || item.title))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="bg-white overflow-hidden border border-[#e5e5e5] hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
              >
                <div className="w-24 h-16 shrink-0 overflow-hidden bg-gray-100 relative">
                  <NewsThumbnailView
                    thumb={item.thumb}
                    alt={item.title}
                    className="w-full h-full"
                    imgClassName="group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide bg-[#f7f7f7] text-[#555]">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{item.date}</span>
                    </div>
                    <h4
                      className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#FF000F] transition-colors line-clamp-2"
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#FF000F] font-semibold mt-4 group-hover:underline">
                    Đọc thêm →
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
