import { useState, useEffect } from 'react'
import { getStoredProductCategories, getStoredProducts, productMatchesCategory, ProductItem, ProductVariant } from '@/data/siteData'
import { getEnabledVariants, hasVariantOptions, productColorDot } from '@/utils/productVariants'
import ProductImageBranding from '@/components/ProductImageBranding'

interface ProductsPageProps {
  onNavigate: (page: string, productId?: string) => void
  onAddToCart: (product: { id: string; name: string; sku: string }) => void
  initialCategory?: string
}

// ── Category tree (Cấu trúc quan hệ Cha - Con chuẩn 6 nhóm) ────────────────
export const categoryTree = [
  {
    id: 'faceplate',
    label: 'Mặt che',
    short: 'Mặt che',
    sub: [
      { id: 'faceplate-velet120', label: 'VELET 120' },
      { id: 'faceplate-mayple120', label: 'MAYPLE 120' },
      { id: 'faceplate-acus', label: 'ACUS' },
    ],
  },
  {
    id: 'socket',
    label: 'Ổ cắm',
    short: 'Ổ cắm',
    sub: [
      { id: 'socket-velet120', label: 'VELET 120' },
      { id: 'socket-mayple120', label: 'MAYPLE 120' },
      { id: 'socket-mayple', label: 'MAYPLE' },
      { id: 'socket-velet', label: 'VELET' },
      { id: 'socket-zita', label: 'ZITA' },
      { id: 'socket-acus', label: 'ACUS' },
    ],
  },
  {
    id: 'switch',
    label: 'Công tắc',
    short: 'Công tắc',
    sub: [
      { id: 'switch-velet120', label: 'VELET 120' },
      { id: 'switch-mayple120', label: 'MAYPLE 120' },
      { id: 'switch-mayple', label: 'MAYPLE' },
      { id: 'switch-velet', label: 'VELET' },
      { id: 'switch-zita', label: 'ZITA' },
      { id: 'switch-acus', label: 'ACUS' },
    ],
  },
  {
    id: 'media-socket',
    label: 'Ổ cắm TV, mạng, điện thoại',
    short: 'TV, Mạng, Thoại',
    sub: [
      { id: 'media-velet120', label: 'VELET 120' },
      { id: 'media-mayple120', label: 'MAYPLE 120' },
      { id: 'media-mayple', label: 'MAYPLE' },
      { id: 'media-velet', label: 'VELET' },
      { id: 'media-zita', label: 'ZITA' },
      { id: 'media-acus', label: 'ACUS' },
    ],
  },
  {
    id: 'accessories',
    label: 'Thiết bị và phụ kiện khác',
    short: 'Phụ kiện khác',
    sub: [
      { id: 'other-velet120', label: 'VELET 120' },
      { id: 'other-mayple120', label: 'MAYPLE 120' },
      { id: 'other-mayple', label: 'MAYPLE' },
      { id: 'other-velet', label: 'VELET' },
      { id: 'other-zita', label: 'ZITA' },
      { id: 'other-acus', label: 'ACUS' },
    ],
  },
  {
    id: 'breaker',
    label: 'Cầu dao',
    short: 'Cầu dao',
    sub: [
      { id: 'breaker-auto', label: 'Cầu dao tự động' },
      { id: 'breaker-leakage', label: 'Cầu dao chống rò' },
    ],
  },
]

const font = "'Roboto Condensed', 'Roboto', sans-serif"

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function ProductPagination({ currentPage, totalPages, onPageChange }: ProductPaginationProps) {
  const [pageInput, setPageInput] = useState(String(currentPage))

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  const goToInputPage = () => {
    const parsedPage = Number.parseInt(pageInput, 10)
    const nextPage = Number.isFinite(parsedPage)
      ? Math.min(Math.max(parsedPage, 1), totalPages)
      : currentPage
    setPageInput(String(nextPage))
    onPageChange(nextPage)
  }

  const buttonClass = 'w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#1B4C98] hover:text-[#1B4C98] disabled:cursor-not-allowed disabled:opacity-35'

  return (
    <div className="flex items-center justify-end gap-1.5" aria-label="Điều hướng trang sản phẩm">
      <button className={buttonClass} onClick={() => onPageChange(1)} disabled={currentPage === 1} title="Trang đầu" aria-label="Về trang đầu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
      </button>
      <button className={buttonClass} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Trang trước" aria-label="Về trang trước">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <label className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-500">
        <span>Trang</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={goToInputPage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              goToInputPage()
              e.currentTarget.blur()
            }
          }}
          className="h-7 w-11 rounded-md border border-gray-200 px-1 text-center text-xs font-bold text-gray-800 focus:border-[#1B4C98] focus:outline-none"
          aria-label="Nhập số trang sản phẩm"
        />
        <span>/ {totalPages}</span>
      </label>
      <button className={buttonClass} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Trang kế tiếp" aria-label="Qua trang kế tiếp">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button className={buttonClass} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} title="Trang cuối" aria-label="Tới trang cuối">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 7l5 5-5 5M13 7l5 5-5 5" /></svg>
      </button>
    </div>
  )
}

export default function ProductsPage({ onNavigate, onAddToCart, initialCategory }: ProductsPageProps) {
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const stored = getStoredProducts()
    return stored && stored.length > 0 ? stored : []
  })
  const [productCategories, setProductCategories] = useState(getStoredProductCategories())

  // Selected active color for each individual product card: { [productId]: 'Vàng' }
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})

  const [selectedCat, setSelectedCat] = useState(initialCategory || 'all')
  const [selectedSubcat, setSelectedSubcat] = useState('all')
  const [expandedCats, setExpandedCats] = useState<string[]>(initialCategory ? [initialCategory] : ['switch', 'socket'])
  const [search, setSearch] = useState('')
  const [stockOnly, setStockOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pageSize, setPageSize] = useState(12)
  const [currentPage, setCurrentPage] = useState(1)

  // Auto-sync when database updates in Admin or Cloudflare
  useEffect(() => {
    const handleUpdate = () => {
      const stored = getStoredProducts()
      if (stored && stored.length > 0) setProducts(stored)
      setProductCategories(getStoredProductCategories())
    }
    window.addEventListener('viendong_storage_update', handleUpdate)
    return () => window.removeEventListener('viendong_storage_update', handleUpdate)
  }, [])

  useEffect(() => {
    const parent = productCategories.find((category) => category.id === initialCategory)
    const parentOfSubcategory = productCategories.find((category) => category.sub.some((sub) => sub.id === initialCategory))
    setSelectedCat(parent?.id || parentOfSubcategory?.id || 'all')
    setSelectedSubcat(parentOfSubcategory ? initialCategory || 'all' : 'all')
    const expandedId = parent?.id || parentOfSubcategory?.id
    if (expandedId) {
      setExpandedCats((prev) => Array.from(new Set([...prev, expandedId])))
    }
  }, [initialCategory, productCategories])

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  const handleCatSelect = (catId: string) => {
    setSelectedCat(catId)
    setSelectedSubcat('all')
  }

  // Helper function to get active variant of a product
  const getActiveVariant = (p: ProductItem): ProductVariant => {
    const enabledVariants = getEnabledVariants(p)
    const chosenColor = selectedColors[p.id]
    if (chosenColor) {
      const found = enabledVariants.find((v) => v.color === chosenColor)
      if (found) return found
    }
    return enabledVariants[0] || (p.variants && p.variants[0]) || {
      color: 'Trắng',
      colorCode: 'P01',
      hex: '#FFFFFF',
      sku: p.baseSku,
      image: '',
      enabled: true,
    }
  }

  const allList = products

  const filtered = allList.filter((p) => {
    const matchCat =
      selectedCat === 'all' ||
      productMatchesCategory(p, selectedCat)

    const matchSubcat =
      selectedSubcat === 'all' ||
      p.subCategory === selectedSubcat ||
      (p.subCategory && p.subCategory.includes(selectedSubcat.replace('other-', 'acc-')))

    const searchLower = search.toLowerCase().trim()
    const matchSearch =
      !searchLower ||
      p.name.toLowerCase().includes(searchLower) ||
      p.baseSku.toLowerCase().includes(searchLower) ||
      p.series.toLowerCase().includes(searchLower) ||
      p.specs.toLowerCase().includes(searchLower) ||
      (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(searchLower)))

    const matchStock = !stockOnly || p.inStock

    return matchCat && matchSubcat && matchSearch && matchStock
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCat, selectedSubcat, search, stockOnly, pageSize])

  useEffect(() => {
    if (currentPage !== safeCurrentPage) setCurrentPage(safeCurrentPage)
  }, [currentPage, safeCurrentPage])

  // Dynamic count for category tree
  const getCatCount = (catId: string) => {
    return allList.filter((p) => productMatchesCategory(p, catId)).length
  }

  const selectedCatData = productCategories.find((c) => c.id === selectedCat)

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #1B4C98 0%, #1B4C98 100%)' }} className="py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-blue-200 text-xs mb-2">
              <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Trang chủ</button>
              <span>/</span>
              <span className="text-white font-medium">Danh mục sản phẩm</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase" style={{ fontFamily: font }}>
              Nhà Phân Phối Chính Thức Thiết Bị Điện ABB (Thụy Sỹ)
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-xl">
              Sản phẩm chính hãng 100%. Bảo hành lâu dài &amp; Uy tín.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-white/15 backdrop-blur-xs border border-white/20">
              {allList.length} sản phẩm niêm yết
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* ── Left Sidebar: Sticky & Independent Scroll ── */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto overscroll-auto pr-1.5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] [scrollbar-width:thin] [scrollbar-color:#c8daf4_transparent]">
            {/* Top Fixed Filter Controls */}
            <div className="bg-white rounded-2xl p-4 shadow-xs" style={{ border: '1px solid #c8daf4' }}>
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Tìm tên, mã SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-blue-500 transition-colors"
                />
                <svg className="w-3.5 h-3.5 absolute left-2.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stockOnly}
                    onChange={(e) => setStockOnly(e.target.checked)}
                    className="rounded-sm border-gray-300 text-blue-600 focus:ring-0"
                  />
                  <span>Chỉ sản phẩm sẵn hàng</span>
                </label>
              </div>
            </div>

            {/* Hierarchical Category Tree */}
            <div className="bg-white rounded-2xl p-4 shadow-xs" style={{ border: '1px solid #c8daf4' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Danh mục sản phẩm</h3>
                {selectedCat !== 'all' && (
                  <button onClick={() => { setSelectedCat('all'); setSelectedSubcat('all') }} className="text-[10px] text-blue-600 hover:underline">
                    Xem tất cả
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {productCategories.map((cat) => {
                  const isParentSelected = selectedCat === cat.id
                  const isExpanded = expandedCats.includes(cat.id)
                  const count = getCatCount(cat.id)

                  return (
                    <div key={cat.id} className="rounded-xl overflow-hidden">
                      <div
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isParentSelected
                            ? 'bg-blue-50 text-[#1B4C98] font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCatSelect(cat.id)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpand(cat.id)
                            }}
                            className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-sm"
                          >
                            <span className={`transform transition-transform text-[10px] ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                          </button>
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-normal ml-1">
                          {count}
                        </span>
                      </div>

                      {/* Sub-items */}
                      {isExpanded && cat.sub && (
                        <div className="ml-5 pl-2 border-l border-blue-100 py-1 space-y-0.5">
                          <button
                            onClick={() => { setSelectedCat(cat.id); setSelectedSubcat('all') }}
                            className={`w-full text-left px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                              isParentSelected && selectedSubcat === 'all'
                                ? 'text-[#1B4C98] font-bold bg-blue-50/60'
                                : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            Tất cả {cat.short}
                          </button>
                          {cat.sub.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => { setSelectedCat(cat.id); setSelectedSubcat(sub.id) }}
                              className={`w-full text-left px-2.5 py-1 text-[11px] rounded-md transition-colors flex items-center justify-between ${
                                selectedSubcat === sub.id
                                  ? 'text-[#1B4C98] font-bold bg-blue-50/60'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              <span className="truncate">{sub.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Product Content ── */}
        <div className="flex-1 min-w-0">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>{selectedCat === 'all' ? 'Tất cả sản phẩm' : (selectedCatData?.label ?? selectedCat)}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {filtered.length} mã
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedCat === 'breaker'
                  ? 'Chọn số cực trên từng sản phẩm để xem đúng hình ảnh và mã SKU tương ứng.'
                  : 'Bấm vào ô màu sắc trên từng sản phẩm để xem trước ảnh và đổi mã SKU tương ứng.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="hidden sm:inline">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 focus:border-[#1B4C98] focus:outline-none"
                  aria-label="Số sản phẩm mỗi trang"
                >
                  <option value={12}>12 / trang</option>
                  <option value={24}>24 / trang</option>
                  <option value={48}>48 / trang</option>
                </select>
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Xem dạng lưới"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Xem dạng danh sách"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active filter badges */}
          {(search || selectedCat !== 'all' || stockOnly) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[11px] text-gray-400 font-medium">Đang lọc:</span>
              {selectedCat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                  {selectedCatData?.label}
                  <button onClick={() => { setSelectedCat('all'); setSelectedSubcat('all') }} className="hover:text-blue-900">✕</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  &quot;{search}&quot;
                  <button onClick={() => setSearch('')} className="hover:text-gray-900">✕</button>
                </span>
              )}
              {stockOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700">
                  Còn hàng
                  <button onClick={() => setStockOnly(false)} className="hover:text-green-900">✕</button>
                </span>
              )}
              <button
                onClick={() => { setSelectedCat('all'); setSelectedSubcat('all'); setSearch(''); setStockOnly(false) }}
                className="text-[11px] text-red-600 hover:underline font-semibold ml-1"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mb-4 overflow-x-auto pb-1">
              <ProductPagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map((p) => {
                const activeVariant = getActiveVariant(p)
                const enabledVariants = getEnabledVariants(p)
                const showVariantOptions = hasVariantOptions(p, enabledVariants)

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between border border-[#c8daf4] hover:border-[#1B4C98]/40"
                  >
                    <div>
                      {/* Product Image Area */}
                      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                        <ProductImageBranding series={p.series} badge={p.badge} />
                        <div className="relative aspect-square flex items-center justify-center p-3">
                          {activeVariant.image ? (
                            <img
                              src={activeVariant.image}
                              alt={p.name}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                                <rect x="8" y="12" width="48" height="40" rx="4" stroke="#1B4C98" strokeWidth="2.5" />
                                <rect x="14" y="18" width="10" height="10" rx="2" fill="#FF000F" />
                                <rect x="14" y="32" width="36" height="3" rx="1" fill="#1B4C98" />
                              </svg>
                            </div>
                          )}

                          {/* Interactive color or breaker-pole variants */}
                          {showVariantOptions && (
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 bg-white/80 backdrop-blur-xs py-1 px-2 rounded-full border border-gray-200/60 shadow-xs">
                              {enabledVariants.map((v) => {
                                const isSelected = activeVariant.color === v.color
                                return (
                                  <button
                                    key={v.color}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedColors((prev) => ({ ...prev, [p.id]: v.color }))
                                    }}
                                    title={p.category === 'breaker' ? `Xem phiên bản ${v.color} (${v.sku})` : `Xem màu ${v.color} (${v.sku})`}
                                    className={p.category === 'breaker'
                                      ? `min-w-7 rounded-md border px-1.5 py-0.5 text-[9px] font-bold transition-all ${isSelected ? 'border-gray-500 bg-gray-100 text-gray-800' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`
                                      : `w-3.5 h-3.5 rounded-full transition-all ${isSelected ? 'ring-2 ring-gray-500 ring-offset-1 ring-offset-white scale-110 shadow-xs' : 'border border-gray-300 hover:scale-110'}`}
                                    style={p.category === 'breaker' ? undefined : { backgroundColor: productColorDot[v.color] || v.hex }}
                                  >
                                    {p.category === 'breaker' ? v.color : null}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Meta */}
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                            {p.series}
                          </p>
                          <span className="text-[9px] text-gray-500 font-medium">
                            {p.category === 'breaker' ? 'Số cực' : 'Màu'}: <strong className="text-gray-800">{activeVariant.color}</strong>
                          </span>
                        </div>

                        <h4
                          onClick={() => onNavigate('productDetail', p.id)}
                          className="text-[12px] font-bold text-gray-900 leading-snug mb-1 line-clamp-2 hover:text-[#1B4C98] cursor-pointer"
                        >
                          {p.name}
                        </h4>

                        {/* Dynamic SKU updates when color switches */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] text-gray-400">SKU:</span>
                          <span className="text-[10px] font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                            {activeVariant.sku}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">
                          {p.specs}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons & B2B Status (NO PRICE) */}
                    <div className="p-3 pt-0 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#1B4C98] uppercase tracking-wide">
                          Liên hệ báo giá
                        </span>
                        <span className="text-[9px] text-green-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Chính hãng ABB
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onNavigate('productDetail', p.id)}
                          className="flex-1 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:bg-blue-50 text-center"
                          style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() =>
                            onAddToCart({
                              id: p.id,
                              name: `${p.name} (${activeVariant.color})`,
                              sku: activeVariant.sku,
                            })
                          }
                          className="flex-1 py-1.5 text-[11px] font-bold text-white rounded-lg transition-all hover:bg-red-700 shadow-xs flex items-center justify-center gap-1"
                          style={{ backgroundColor: 'var(--red)' }}
                        >
                          <span>+</span> Báo giá
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {paginatedProducts.map((p) => {
                const activeVariant = getActiveVariant(p)
                const enabledVariants = getEnabledVariants(p)
                const showVariantOptions = hasVariantOptions(p, enabledVariants)

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-all border border-[#c8daf4]"
                  >
                    <div className="w-28 h-28 bg-gray-50 rounded-xl flex flex-col flex-shrink-0 border border-gray-100 overflow-hidden">
                      <ProductImageBranding series={p.series} badge={p.badge} size="compact" />
                      <div className="flex min-h-0 flex-1 items-center justify-center p-1">
                        {activeVariant.image ? (
                          <img src={activeVariant.image} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-gray-300">⚡</div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                          {p.series}
                        </span>
                        {p.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full bg-[#FF000F]">
                            {p.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">
                          Màu đang chọn: <strong className="text-gray-800">{activeVariant.color}</strong>
                        </span>
                      </div>

                      <h4
                        onClick={() => onNavigate('productDetail', p.id)}
                        className="font-bold text-gray-900 text-sm hover:text-[#1B4C98] cursor-pointer"
                      >
                        {p.name}
                      </h4>

                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-sm">
                          SKU: {activeVariant.sku}
                        </span>
                        <p className="text-[11px] text-gray-500">{p.specs}</p>
                      </div>

                      {/* Color dots in list view */}
                      {showVariantOptions && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-gray-400">Đổi màu:</span>
                          {enabledVariants.map((v) => (
                            <button
                              key={v.color}
                              onClick={() => setSelectedColors((prev) => ({ ...prev, [p.id]: v.color }))}
                              className={`w-4 h-4 rounded-full transition-all ${
                                activeVariant.color === v.color
                                  ? 'ring-2 ring-gray-500 ring-offset-1 ring-offset-white scale-110'
                                  : 'border border-gray-300'
                              }`}
                              style={{ backgroundColor: productColorDot[v.color] || v.hex }}
                              title={`Màu ${v.color}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span className="text-xs font-bold text-[#1B4C98]">Liên hệ báo giá</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('productDetail', p.id)}
                          className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-blue-50 transition-colors"
                          style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() =>
                            onAddToCart({
                              id: p.id,
                              name: `${p.name} (${activeVariant.color})`,
                              sku: activeVariant.sku,
                            })
                          }
                          className="px-3.5 py-1.5 text-xs font-bold text-white rounded-lg transition-all hover:bg-red-700"
                          style={{ backgroundColor: 'var(--red)' }}
                        >
                          + Báo giá
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 opacity-30">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm font-medium">Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
              <button
                onClick={() => { setSelectedCat('all'); setSelectedSubcat('all'); setSearch('') }}
                className="mt-2 text-sm text-blue-600 underline font-semibold"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-6 overflow-x-auto border-t border-gray-100 pt-4 pb-1">
              <ProductPagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
