import { useState, useEffect } from 'react'
import { getStoredProducts, productMatchesCategory, ProductItem, ProductVariant } from '@/data/siteData'
import { getEnabledVariants, hasVariantOptions, productColorDot } from '@/utils/productVariants'
import ProductImageBranding from '@/components/ProductImageBranding'

interface ProductsPageProps {
  onNavigate: (page: string, productId?: string) => void
  onAddToCart: (product: { id: string; name: string; sku: string }) => void
  initialCategory?: string
}

// ── Category tree retained for backward compatibility ────────────────
export const categoryTree = [
  { id: 'faceplate', label: 'Mặt che', short: 'Mặt che' },
  { id: 'socket', label: 'Ổ cắm', short: 'Ổ cắm' },
  { id: 'switch', label: 'Công tắc', short: 'Công tắc' },
  { id: 'media-socket', label: 'Ổ cắm TV, mạng, điện thoại', short: 'TV, Mạng, Thoại' },
  { id: 'accessories', label: 'Thiết bị và phụ kiện khác', short: 'Phụ kiện khác' },
  { id: 'breaker', label: 'Cầu dao', short: 'Cầu dao' },
]

export const SERIES_OPTIONS = [
  { id: 'all', label: 'Tất cả dòng sản phẩm (Series)' },
  { id: 'ACUS', label: '1. ABB Acus Series (Viền tràn)' },
  { id: 'VELET 120', label: '2. ABB Velet 120 (Chữ nhật 120)' },
  { id: 'MAYPLE 120', label: '3. ABB Mayple 120 (Chữ nhật 120)' },
  { id: 'VELET', label: '4. ABB Velet (Vuông)' },
  { id: 'ZITA', label: '5. ABB Zita (Vuông thanh lịch)' },
  { id: 'MAYPLE', label: '6. ABB Mayple (Vuông tiêu chuẩn)' },
  { id: 'breaker', label: '7. Thiết bị đóng cắt SH200 (MCB)' },
]

export const COLOR_OPTIONS = [
  { id: 'all', label: 'Tất cả màu sắc (Color)' },
  { id: 'Vàng', label: '🟡 Vàng ánh kim (Gold)' },
  { id: 'Xám Đậm', label: '⚫ Xám Đậm (Titanium)' },
  { id: 'Trắng', label: '⚪ Trắng ngọc (White)' },
  { id: 'Bạc', label: '🔘 Bạc kim loại (Silver)' },
  { id: 'Đen', label: '⬛ Đen huyền (Black)' },
]

export const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Tất cả nhóm thiết bị' },
  { id: 'faceplate', label: 'Mặt che thiết bị' },
  { id: 'switch', label: 'Công tắc điện' },
  { id: 'socket', label: 'Ổ cắm điện' },
  { id: 'media-socket', label: 'Ổ cắm TV, Mạng, Điện thoại' },
  { id: 'accessories', label: 'Thiết bị & Phụ kiện khác' },
  { id: 'breaker', label: 'Cầu dao tự động (MCB)' },
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
      <button className={buttonClass} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Trang sau" aria-label="Về trang sau">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>
      <button className={buttonClass} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} title="Trang cuối" aria-label="Về trang cuối">
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

  // Selected active color for each individual product card: { [productId]: 'Vàng' }
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})

  // 4-Column Filter States
  const [selectedSeries, setSelectedSeries] = useState<string>('all')
  const [selectedColor, setSelectedColor] = useState<string>('all')
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory || 'all')
  const [search, setSearch] = useState<string>('')
  const [stockOnly, setStockOnly] = useState<boolean>(false)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pageSize, setPageSize] = useState<number>(12)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Auto-sync when database updates in Admin or Cloudflare
  useEffect(() => {
    const handleUpdate = () => {
      const stored = getStoredProducts()
      if (stored && stored.length > 0) setProducts(stored)
    }
    window.addEventListener('viendong_storage_update', handleUpdate)
    return () => window.removeEventListener('viendong_storage_update', handleUpdate)
  }, [])

  // Sync initialCategory from routing
  useEffect(() => {
    if (!initialCategory) return
    const isSeries = SERIES_OPTIONS.some((s) => s.id === initialCategory)
    if (isSeries) {
      setSelectedSeries(initialCategory)
      setSelectedCat('all')
    } else {
      setSelectedCat(initialCategory)
    }
  }, [initialCategory])

  const allList = products

  // Active filter detection
  const hasActiveFilter =
    selectedSeries !== 'all' ||
    selectedColor !== 'all' ||
    selectedCat !== 'all' ||
    search.trim() !== '' ||
    stockOnly

  const handleResetFilters = () => {
    setSelectedSeries('all')
    setSelectedColor('all')
    setSelectedCat('all')
    setSearch('')
    setStockOnly(false)
    setCurrentPage(1)
  }

  // Helper function to get active variant of a product (prioritizes active color filter)
  const getActiveVariant = (p: ProductItem): ProductVariant => {
    const enabledVariants = getEnabledVariants(p)
    const cardChosenColor = selectedColors[p.id]
    const globalFilterColor = selectedColor !== 'all' ? selectedColor : undefined
    const preferredColor = cardChosenColor || globalFilterColor

    if (preferredColor) {
      const found = enabledVariants.find((v) => v.color.toLowerCase() === preferredColor.toLowerCase())
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

  // Filter products by all 4 criteria + stock
  const filtered = allList.filter((p) => {
    // 1. Series Filter
    const matchSeries =
      selectedSeries === 'all' ||
      (selectedSeries === 'breaker'
        ? p.series === 'SH200' || p.series === 'SH200L' || p.series === 'GSH200' || p.category === 'breaker'
        : p.series === selectedSeries)

    // 2. Color Filter
    const matchColor =
      selectedColor === 'all' ||
      (p.variants && p.variants.some((v) => v.color.toLowerCase() === selectedColor.toLowerCase()))

    // 3. Category Filter
    const matchCat =
      selectedCat === 'all' ||
      productMatchesCategory(p, selectedCat)

    // 4. Search Filter (by SKU, name, series, specs)
    const searchLower = search.toLowerCase().trim()
    const matchSearch =
      !searchLower ||
      p.name.toLowerCase().includes(searchLower) ||
      p.baseSku.toLowerCase().includes(searchLower) ||
      p.series.toLowerCase().includes(searchLower) ||
      p.specs.toLowerCase().includes(searchLower) ||
      (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(searchLower)))

    // 5. In stock only
    const matchStock = !stockOnly || p.inStock

    return matchSeries && matchColor && matchCat && matchSearch && matchStock
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSeries, selectedColor, selectedCat, search, stockOnly, pageSize])

  useEffect(() => {
    if (currentPage !== safeCurrentPage) setCurrentPage(safeCurrentPage)
  }, [currentPage, safeCurrentPage])

  const selectedSeriesData = SERIES_OPTIONS.find((s) => s.id === selectedSeries)
  const selectedCatData = CATEGORY_OPTIONS.find((c) => c.id === selectedCat)

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16">
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B4C98 0%, #10346c 100%)' }} className="py-10 px-6 shadow-sm">
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
              Sản phẩm chính hãng 100%. Đầy đủ CO/CQ, bảng thông số và chiết khấu dự án trực tiếp.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/15 backdrop-blur-xs border border-white/20 shadow-xs">
              {allList.length} sản phẩm niêm yết
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* ── 4-Column Horizontal Filter Bar (Faceted Filter) ── */}
        <section aria-label="Bộ lọc sản phẩm" className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. DÒNG SẢN PHẨM ABB (SERIES) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase mb-1.5">
                1. Dòng sản phẩm ABB (Series)
              </label>
              <div className="relative">
                <select
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-8 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1B4C98] focus:ring-2 focus:ring-[#1B4C98]/10 cursor-pointer appearance-none transition-all shadow-2xs"
                >
                  {SERIES_OPTIONS.map((opt) => {
                    const count = opt.id === 'all'
                      ? allList.length
                      : opt.id === 'breaker'
                        ? allList.filter((p) => p.series === 'SH200' || p.series === 'SH200L' || p.series === 'GSH200' || p.category === 'breaker').length
                        : allList.filter((p) => p.series === opt.id).length
                    return (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({count} mã)
                      </option>
                    )
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* 2. MÀU SẮC (COLOR) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase mb-1.5">
                2. Màu sắc (Color)
              </label>
              <div className="relative">
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-8 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1B4C98] focus:ring-2 focus:ring-[#1B4C98]/10 cursor-pointer appearance-none transition-all shadow-2xs"
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* 3. NHÓM CHỨC NĂNG */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase mb-1.5">
                3. Nhóm chức năng
              </label>
              <div className="relative">
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-8 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1B4C98] focus:ring-2 focus:ring-[#1B4C98]/10 cursor-pointer appearance-none transition-all shadow-2xs"
                >
                  {CATEGORY_OPTIONS.map((opt) => {
                    const count = opt.id === 'all'
                      ? allList.length
                      : allList.filter((p) => productMatchesCategory(p, opt.id)).length
                    return (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({count} mã)
                      </option>
                    )
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* 4. TÌM THEO MÃ SKU */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase mb-1.5">
                4. Tìm theo mã SKU
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã SKU (VD: 4TYA500...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-9 pr-8 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#1B4C98] focus:ring-2 focus:ring-[#1B4C98]/10 transition-all shadow-2xs placeholder:text-gray-400"
                />
                <svg className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Status Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={(e) => setStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded-md border-gray-300 text-[#1B4C98] focus:ring-0 cursor-pointer"
                />
                <span>Chỉ sản phẩm sẵn hàng trong kho</span>
              </label>

              {hasActiveFilter && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Đặt lại bộ lọc
                </button>
              )}
            </div>

            <div className="text-gray-500 font-medium">
              Tìm thấy <span className="font-bold text-[#1B4C98] text-sm">{filtered.length}</span> / {allList.length} sản phẩm phù hợp
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <span className="text-[11px] text-gray-400 font-medium">Bộ lọc đang áp dụng:</span>
              {selectedSeries !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#1B4C98] border border-blue-100">
                  Dòng: {selectedSeriesData?.label.replace(/^\d+\.\s*/, '')}
                  <button onClick={() => setSelectedSeries('all')} className="hover:text-red-600 ml-0.5">✕</button>
                </span>
              )}
              {selectedColor !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
                  Màu: {selectedColor}
                  <button onClick={() => setSelectedColor('all')} className="hover:text-red-600 ml-0.5">✕</button>
                </span>
              )}
              {selectedCat !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Nhóm: {selectedCatData?.label}
                  <button onClick={() => setSelectedCat('all')} className="hover:text-red-600 ml-0.5">✕</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  SKU/Tên: &quot;{search}&quot;
                  <button onClick={() => setSearch('')} className="hover:text-red-600 ml-0.5">✕</button>
                </span>
              )}
              {stockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  Sẵn hàng
                  <button onClick={() => setStockOnly(false)} className="hover:text-red-600 ml-0.5">✕</button>
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── Main Product Content: Full-width Grid ── */}
        <div>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2" style={{ fontFamily: font }}>
                <span>
                  {selectedSeries !== 'all'
                    ? selectedSeriesData?.label.replace(/^\d+\.\s*/, '')
                    : selectedCat !== 'all'
                      ? selectedCatData?.label
                      : 'Tất cả sản phẩm ABB'}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1B4C98] border border-blue-100">
                  {filtered.length} sản phẩm
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {selectedCat === 'breaker' || selectedSeries === 'breaker'
                  ? 'Chọn số cực trên từng sản phẩm để xem hình ảnh và mã SKU tương ứng.'
                  : 'Bấm vào ô màu sắc trên từng sản phẩm để xem trước ảnh và đổi mã SKU tương ứng.'}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="hidden sm:inline">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-xl border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 focus:border-[#1B4C98] focus:outline-none shadow-2xs"
                  aria-label="Số sản phẩm mỗi trang"
                >
                  <option value={12}>12 / trang</option>
                  <option value={24}>24 / trang</option>
                  <option value={48}>48 / trang</option>
                </select>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-[#1B4C98] font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Xem dạng lưới"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-[#1B4C98] font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Xem dạng danh sách"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="mb-6 overflow-x-auto pb-1">
              <ProductPagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {/* Grid View: Spacious 4-column layout on desktop, 2-column on mobile */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((p) => {
                const activeVariant = getActiveVariant(p)
                const enabledVariants = getEnabledVariants(p)
                const showVariantOptions = hasVariantOptions(p, enabledVariants)

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between border border-gray-200/80 hover:border-[#1B4C98]/40"
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
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-xs py-1 px-2 rounded-full border border-gray-200/80 shadow-xs">
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
                                      : `w-3.5 h-3.5 rounded-full transition-all ${isSelected ? 'ring-2 ring-gray-600 ring-offset-1 ring-offset-white scale-110 shadow-xs' : 'border border-gray-300 hover:scale-110'}`}
                                    style={p.category === 'breaker' ? undefined : { backgroundColor: productColorDot[v.color] || v.hex }}
                                  >
                                    <span className="sr-only">{v.color}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Content */}
                      <div className="p-3.5 sm:p-4">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span className="font-bold uppercase tracking-wider text-[#1B4C98] truncate">{p.series}</span>
                          <span className="text-gray-500 font-medium">Màu: <strong className="text-gray-700">{activeVariant.color}</strong></span>
                        </div>

                        <h3
                          onClick={() => onNavigate('productDetail', p.id)}
                          className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 hover:text-[#1B4C98] cursor-pointer transition-colors leading-snug"
                        >
                          {p.name}
                        </h3>

                        <p className="text-[11px] font-mono font-bold text-blue-900 bg-blue-50/70 border border-blue-100/80 rounded px-1.5 py-0.5 mt-1.5 w-fit">
                          SKU: {activeVariant.sku}
                        </p>

                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-1">
                          {p.specs}
                        </p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3.5 sm:p-4 pt-0">
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mb-3">
                        <span className="text-xs font-bold text-[#1B4C98]">LIÊN HỆ BÁO GIÁ</span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Chính hãng ABB
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onNavigate('productDetail', p.id)}
                          className="w-full py-2 text-xs font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
                          className="w-full py-2 text-xs font-bold text-white rounded-xl transition-all hover:bg-red-700 active:scale-95 shadow-xs"
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
                    className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-gray-100">
                        {activeVariant.image ? (
                          <img src={activeVariant.image} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-gray-400">ABB</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1B4C98]">{p.series}</span>
                          <span className="text-xs font-mono text-gray-500">{activeVariant.sku}</span>
                        </div>
                        <h3
                          onClick={() => onNavigate('productDetail', p.id)}
                          className="font-bold text-gray-900 text-sm hover:text-[#1B4C98] cursor-pointer"
                        >
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{p.specs}</p>

                        {showVariantOptions && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {enabledVariants.map((v) => (
                              <button
                                key={v.color}
                                onClick={() => setSelectedColors((prev) => ({ ...prev, [p.id]: v.color }))}
                                className={`w-3.5 h-3.5 rounded-full ${activeVariant.color === v.color ? 'ring-2 ring-gray-600 scale-110' : 'border border-gray-300'}`}
                                style={{ backgroundColor: productColorDot[v.color] || v.hex }}
                                title={v.color}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <button
                        onClick={() => onNavigate('productDetail', p.id)}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
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
                        className="px-4 py-2 text-xs font-bold text-white rounded-xl hover:bg-red-700"
                        style={{ backgroundColor: 'var(--red)' }}
                      >
                        + Thêm báo giá
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 my-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 text-gray-300">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-base font-bold text-gray-800">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Không có sản phẩm nào khớp với các tiêu chí lọc hiện tại. Vui lòng thử chọn dòng hoặc màu sắc khác.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-colors"
                style={{ backgroundColor: '#1B4C98' }}
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <ProductPagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
