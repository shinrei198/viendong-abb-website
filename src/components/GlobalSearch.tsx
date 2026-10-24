import { useEffect, useMemo, useRef, useState } from 'react'
import type { NewsItem, ProductItem, VideoItem } from '@/data/siteData'

interface GlobalSearchProps {
  onNavigate: (page: string, id?: string) => void
}

type SearchResult = {
  id: string
  type: 'product' | 'news' | 'video'
  title: string
  subtitle: string
  image?: string
  targetId?: string
  score: number
}

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

function relevance(query: string, fields: Array<string | undefined>) {
  const normalizedQuery = normalize(query)
  const terms = normalizedQuery.split(/\s+/).filter(Boolean)
  if (!terms.length) return 0
  const normalizedFields = fields.filter(Boolean).map((field) => normalize(field || ''))
  if (!terms.every((term) => normalizedFields.some((field) => field.includes(term)))) return 0
  return normalizedFields.reduce((best, field, index) => {
    let score = best
    if (field === normalizedQuery) score = Math.max(score, 120 - index)
    else if (field.startsWith(normalizedQuery)) score = Math.max(score, 90 - index)
    else if (field.includes(normalizedQuery)) score = Math.max(score, 65 - index)
    score += terms.filter((term) => field.startsWith(term)).length * 7
    score += terms.filter((term) => field.includes(term)).length * 3
    return score
  }, 1)
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)
  const [data, setData] = useState<{ products: ProductItem[]; news: NewsItem[]; videos: VideoItem[] }>({ products: [], news: [], videos: [] })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const refresh = () => {
      void import('@/data/siteData').then((module) => {
        setData({ products: module.getStoredProducts(), news: module.getStoredNews(), videos: module.getStoredVideos() })
        setRevision((value) => value + 1)
      })
    }
    window.addEventListener('viendong_storage_update', refresh)
    return () => window.removeEventListener('viendong_storage_update', refresh)
  }, [])

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => inputRef.current?.focus())
      void import('@/data/siteData').then((module) => {
        setData({ products: module.getStoredProducts(), news: module.getStoredNews(), videos: module.getStoredVideos() })
      })
    }
  }, [open])

  const results = useMemo(() => {
    if (normalize(query).length < 2) return []
    const products: SearchResult[] = data.products.map<SearchResult>((product) => ({
      id: product.id,
      type: 'product',
      title: product.name,
      subtitle: `${product.series} · ${product.baseSku}`,
      image: product.variants.find((variant) => variant.enabled)?.image || product.gallery?.[0],
      targetId: product.id,
      score: relevance(query, [
        product.baseSku, product.name, product.series, product.category, product.subCategory,
        product.specs, product.description,
        ...product.variants.flatMap((variant) => [variant.sku, variant.color]),
      ]),
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 6)

    const news = data.news.filter((item) => item.status === 'published').map<SearchResult>((item) => ({
      id: item.id,
      type: 'news',
      title: item.title,
      subtitle: `Tin tức · ${item.category}`,
      image: item.thumb,
      targetId: item.slug || item.id,
      score: relevance(query, [item.title, item.category, item.summary, ...(item.tags || [])]),
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 1)

    const videos = data.videos.filter((item) => !item.isHidden).map<SearchResult>((item) => ({
      id: item.id,
      type: 'video',
      title: item.title,
      subtitle: `Video · ${item.category}`,
      image: item.thumb,
      targetId: item.id,
      score: relevance(query, [item.title, item.category, item.linkedProductSku]),
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 1)

    return [...products, ...news, ...videos].slice(0, 8)
  }, [query, revision, data])

  const selectResult = (result: SearchResult) => {
    if (result.type === 'product') onNavigate('productDetail', result.targetId)
    else if (result.type === 'news') onNavigate('newsDetail', result.targetId)
    else onNavigate('videos', result.targetId)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label="Tìm kiếm trên website" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex items-center p-2 text-gray-500 transition-colors hover:text-gray-900">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[7.25rem] z-[70] mx-auto max-w-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[36rem]">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B4C98" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm, mã SKU, tin tức hoặc video…" className="min-w-0 flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {query && <button onClick={() => setQuery('')} className="text-xs font-semibold text-slate-400 hover:text-slate-700">Xóa</button>}
          </div>

          <div className="max-h-[65vh] overflow-y-auto">
            {normalize(query).length < 2 ? (
              <p className="px-5 py-7 text-center text-sm text-slate-500">Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm.</p>
            ) : results.length === 0 ? (
              <p className="px-5 py-7 text-center text-sm text-slate-500">Chưa tìm thấy nội dung phù hợp với “{query}”.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.map((result) => (
                  <button key={`${result.type}-${result.id}`} onClick={() => selectResult(result)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-slate-100">
                      {result.image ? <img src={result.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-bold text-[#1B4C98]">ABB</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{result.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{result.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#FF000F]">{result.type === 'product' ? 'Sản phẩm' : result.type === 'news' ? 'Tin tức' : 'Video'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
