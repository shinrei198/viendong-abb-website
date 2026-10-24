import { useState, useMemo } from 'react'
import { ProductItem, ProductVariant, saveStoredProducts, saveAllDataToSourceCode } from '@/data/siteData'
import { uploadMedia } from '@/utils/mediaUpload'

interface AdminProductsTabProps {
  products: ProductItem[]
  onProductsUpdated: (products: ProductItem[]) => void
  featuredProductIds: string[]
  onFeaturedProductIdsUpdated: (productIds: string[]) => void
  showToast: (msg: string) => void
  openConfirm: (title: string, message: string, onConfirm: () => void) => void
}

const COLOR_PRESETS = [
  { name: 'Trắng', code: 'P01', hex: '#FFFFFF' },
  { name: 'Vàng', code: 'P03', hex: '#D4AF37' },
  { name: 'Xám Đậm', code: 'P04', hex: '#4A4A4A' },
  { name: 'Bạc', code: 'P02', hex: '#C5C6C7' },
  { name: 'Đen', code: 'P05', hex: '#1C1C1C' },
]

export default function AdminProductsTab({
  products,
  onProductsUpdated,
  featuredProductIds,
  onFeaturedProductIdsUpdated,
  showToast,
  openConfirm,
}: AdminProductsTabProps) {
  const [search, setSearch] = useState('')
  const [selectedSeries, setSelectedSeries] = useState<string>('all')
  const [selectedCat, setSelectedCat] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [uploadingVariant, setUploadingVariant] = useState<number | null>(null)
  const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(false)

  // Form state
  const [formData, setFormData] = useState<ProductItem>({
    id: '',
    name: '',
    baseSku: '',
    series: 'VELET 120',
    category: 'switch',
    subCategory: '',
    specs: '',
    pack: 10,
    badge: '',
    inStock: true,
    description: '',
    variants: [],
  })

  // Filtered products list
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSeries = selectedSeries === 'all' || p.series === selectedSeries
      const matchCat =
        selectedCat === 'all' ||
        p.category === selectedCat ||
        (selectedCat === 'accessories' && (p.category === 'other' || p.category === 'accessories'))

      const s = search.toLowerCase().trim()
      const matchSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.baseSku.toLowerCase().includes(s) ||
        p.specs.toLowerCase().includes(s) ||
        (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(s)))

      return matchSeries && matchCat && matchSearch
    })
  }, [products, selectedSeries, selectedCat, search])

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  // Handle open edit modal
  const handleEdit = (p: ProductItem) => {
    setIsNew(false)
    setEditingProduct(p)
    setFormData(JSON.parse(JSON.stringify(p)))
    setIsFeaturedOnHome(featuredProductIds.includes(p.id))
    setModalOpen(true)
  }

  // Handle open add modal
  const handleAddNew = () => {
    setIsNew(true)
    setEditingProduct(null)
    setIsFeaturedOnHome(false)
    setFormData({
      id: `prod-${Date.now()}`,
      name: '',
      baseSku: '',
      series: 'VELET 120',
      category: 'switch',
      subCategory: 'switch-velet120',
      specs: '250V | Chuẩn cắm nhanh Thụy Sĩ ABB',
      pack: 10,
      badge: '',
      inStock: true,
      description: '',
      variants: [
        { color: 'Trắng', colorCode: 'P01', hex: '#FFFFFF', sku: '', image: '', enabled: true },
        { color: 'Vàng', colorCode: 'P03', hex: '#D4AF37', sku: '', image: '', enabled: true },
        { color: 'Xám Đậm', colorCode: 'P04', hex: '#4A4A4A', sku: '', image: '', enabled: true },
      ],
    })
    setModalOpen(true)
  }

  // Handle delete product
  const handleDelete = (p: ProductItem) => {
    openConfirm(
      'Xác nhận xóa sản phẩm',
      `Ní có chắc muốn xóa "${p.name}" (Mã: ${p.baseSku}) khỏi hệ thống không?`,
      () => {
        const next = products.filter((item) => item.id !== p.id)
        saveStoredProducts(next)
        onProductsUpdated(next)
        if (featuredProductIds.includes(p.id)) {
          onFeaturedProductIdsUpdated(featuredProductIds.filter((id) => id !== p.id))
        }
        showToast('✓ Đã xóa sản phẩm thành công!')
      }
    )
  }

  // Handle toggle stock
  const handleToggleStock = (p: ProductItem) => {
    const next = products.map((item) => (item.id === p.id ? { ...item, inStock: !item.inStock } : item))
    saveStoredProducts(next)
    onProductsUpdated(next)
    showToast(`✓ Đã cập nhật trạng thái kho cho ${p.name}!`)
  }

  // Save Modal Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm')
      return
    }
    if (!formData.baseSku.trim()) {
      alert('Vui lòng nhập mã SKU gốc')
      return
    }

    const wasFeatured = featuredProductIds.includes(formData.id)
    if (isFeaturedOnHome && !wasFeatured && featuredProductIds.length >= 6) {
      showToast('Danh sách Sản phẩm nổi bật đã đủ 6 sản phẩm.')
      return
    }

    let next: ProductItem[]
    if (isNew) {
      next = [formData, ...products]
      showToast('✓ Đã thêm sản phẩm mới vào Database!')
    } else {
      next = products.map((item) => (item.id === formData.id ? formData : item))
      showToast('✓ Đã lưu cập nhật cho toàn bộ các màu thành công!')
    }

    saveStoredProducts(next)
    onProductsUpdated(next)
    if (isFeaturedOnHome && !wasFeatured) {
      onFeaturedProductIdsUpdated([...featuredProductIds, formData.id])
    } else if (!isFeaturedOnHome && wasFeatured) {
      onFeaturedProductIdsUpdated(featuredProductIds.filter((id) => id !== formData.id))
    }
    setModalOpen(false)
  }

  // Sync to Cloudflare
  const handleCloudflareSync = async () => {
    setSyncing(true)
    try {
      const res = await saveAllDataToSourceCode()
      showToast(res.message || '✓ Đã đồng bộ Database lên Cloudflare KV!')
    } catch {
      showToast('⚠️ Lỗi khi đồng bộ đám mây')
    } finally {
      setSyncing(false)
    }
  }

  // Add new variant in modal
  const handleAddVariant = () => {
    setFormData((prev) => {
      const nextPole = `${prev.variants.length + 1}P`
      const isBreaker = prev.category === 'breaker'
      return {
        ...prev,
        variants: [
          ...prev.variants,
          {
            color: isBreaker ? nextPole : 'Trắng',
            colorCode: isBreaker ? nextPole : 'P01',
            hex: '#FFFFFF',
            sku: isBreaker ? `${prev.baseSku}-${nextPole}` : `${prev.baseSku}P0100`,
            image: '',
            enabled: true,
          },
        ],
      }
    })
  }

  // Series Stats
  const seriesCount = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach((p) => {
      counts[p.series] = (counts[p.series] || 0) + 1
    })
    return counts
  }, [products])

  return (
    <div className="space-y-6">
      {/* ── Top Header Controls & Stats ── */}
      <div className="bg-white p-5 border border-gray-200 shadow-xs rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">
              Quản lý Danh mục Sản phẩm ABB
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-[#1B4C98]">
              {products.length} mã
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Mô hình Sản phẩm gốc & Nhóm biến thể màu sắc: Cập nhật thông tin đồng loạt cho toàn bộ các màu cùng lúc.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-[#FF000F] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>+</span> Thêm sản phẩm
          </button>
          <button
            onClick={handleCloudflareSync}
            disabled={syncing}
            className="px-4 py-2 bg-[#1B4C98] hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>☁️</span> {syncing ? 'Đang lưu...' : 'Lưu Database'}
          </button>
        </div>
      </div>

      {/* Series Quick Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2">
        <button
          onClick={() => { setSelectedSeries('all'); setPage(1) }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedSeries === 'all'
              ? 'bg-blue-50/80 border-[#1B4C98] shadow-xs'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-[10px] font-bold text-gray-500 uppercase">Tất cả</div>
          <div className="text-base font-extrabold text-gray-900">{products.length}</div>
        </button>
        {['VELET 120', 'MAYPLE 120', 'MAYPLE', 'VELET', 'ZITA', 'ACUS', 'GSH200', 'SH200', 'SH200L'].map((series) => (
          <button
            key={series}
            onClick={() => { setSelectedSeries(series); setPage(1) }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedSeries === series
                ? 'bg-blue-50/80 border-[#1B4C98] shadow-xs'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-[10px] font-bold text-gray-500 uppercase truncate">{series}</div>
            <div className="text-base font-extrabold text-[#1B4C98]">{seriesCount[series] || 0}</div>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã SKU gốc, SKU màu, thông số..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => { setSelectedCat(e.target.value); setPage(1) }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 font-medium"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="faceplate">Mặt che</option>
            <option value="socket">Ổ cắm</option>
            <option value="switch">Công tắc</option>
            <option value="media-socket">Ổ TV, mạng, thoại</option>
            <option value="accessories">Phụ kiện khác</option>
            <option value="breaker">Cầu dao</option>
          </select>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Tìm thấy <strong>{filtered.length}</strong> mã
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Ảnh</th>
                <th className="py-3 px-4">Tên sản phẩm & Thông số</th>
                <th className="py-3 px-4 w-32">Dòng sản phẩm</th>
                <th className="py-3 px-4 w-36">Mã SKU gốc</th>
                <th className="py-3 px-4 w-44">Biến thể màu sắc</th>
                <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-4 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((p) => {
                const enabledVars = p.variants ? p.variants.filter((v) => v.enabled) : []
                const defaultImg = (enabledVars[0] || (p.variants && p.variants[0]))?.image

                return (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="w-12 h-12 mx-auto bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                        {defaultImg ? (
                          <img src={defaultImg} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-gray-300">⚡</span>
                        )}
                      </div>
                    </td>

                    {/* Name & Specs */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-gray-900 text-xs hover:text-[#1B4C98] cursor-pointer" onClick={() => handleEdit(p)}>
                          {p.name}
                        </span>
                        {p.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-sm text-white bg-[#FF000F]">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{p.specs}</p>
                    </td>

                    {/* Series */}
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-[#1B4C98] bg-blue-50 border border-blue-200">
                        {p.series}
                      </span>
                    </td>

                    {/* Base SKU */}
                    <td className="py-2.5 px-4 font-mono font-bold text-gray-700">
                      {p.baseSku}
                    </td>

                    {/* Color Variants */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.variants && p.variants.map((v) => (
                          <span
                            key={v.color}
                            title={`${v.color}: ${v.sku} (${v.enabled ? 'Đang bật' : 'Đã ẩn'})`}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border ${
                              v.enabled
                                ? 'bg-gray-50 border-gray-300 text-gray-700'
                                : 'bg-gray-100 border-dashed border-gray-300 text-gray-400 line-through'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full border border-gray-400"
                              style={{ backgroundColor: v.hex }}
                            />
                            {v.color}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* In Stock Toggle */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          p.inStock
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {p.inStock ? '● Còn hàng' : '○ Hết hàng'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#1B4C98] hover:bg-blue-50 rounded-md border border-blue-200"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md border border-red-200"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Không tìm thấy sản phẩm nào khớp với tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <span>
              Trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Hiển thị {paginated.length}/{filtered.length} mã)
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* EDIT / CREATE PRODUCT MODAL (Parent - Variants) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  {isNew ? 'Thêm Sản phẩm ABB mới' : `Chỉnh sửa: ${formData.name}`}
                </h3>
                <p className="text-xs text-gray-500">
                  Thông tin chung ở trên sẽ áp dụng đồng loạt cho toàn bộ các màu. Các mã SKU và ảnh riêng chỉnh ở bảng bên dưới.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* SECTION 1: THÔNG TIN CHUNG (PARENT) */}
              <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200 space-y-4">
                <h4 className="text-xs font-bold text-[#1B4C98] uppercase tracking-wider flex items-center gap-1.5">
                  <span>1.</span> Thông tin chung (Áp dụng đồng loạt cho toàn bộ màu)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ví dụ: Công tắc 1 chiều 16AX, size 1M"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Mã SKU cơ sở (Base SKU) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.baseSku}
                      onChange={(e) => setFormData({ ...formData, baseSku: e.target.value.toUpperCase() })}
                      placeholder="Ví dụ: 4TYA505111"
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-hidden bg-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Dòng sản phẩm (Series)
                    </label>
                    <select
                      value={formData.series}
                      onChange={(e) => setFormData({ ...formData, series: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="VELET 120">VELET 120 (Chữ nhật 120×70)</option>
                      <option value="MAYPLE 120">MAYPLE 120 (Chữ nhật 120×70)</option>
                      <option value="MAYPLE">MAYPLE (Vuông 86×86)</option>
                      <option value="VELET">VELET (Vuông 86×86)</option>
                      <option value="ZITA">ZITA (Vuông 86×86 phẳng)</option>
                      <option value="ACUS">ACUS (Vuông 86×86 Luxury)</option>
                      <option value="GSH200">GSH200 (Cầu dao chống dòng rò)</option>
                      <option value="SH200">SH200 (Cầu dao tự động)</option>
                      <option value="SH200L">SH200L (Cầu dao tự động)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phân loại danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="switch">Công tắc</option>
                      <option value="socket">Ổ cắm</option>
                      <option value="faceplate">Mặt che</option>
                      <option value="media-socket">Ổ cắm TV, mạng, thoại</option>
                      <option value="other">Thiết bị và phụ kiện khác</option>
                      <option value="breaker">Cầu dao (MCB / RCCB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Thông số kỹ thuật tóm tắt
                    </label>
                    <input
                      type="text"
                      value={formData.specs}
                      onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                      placeholder="Ví dụ: 16AX 250V | Kích thước 120×70mm | Cắm nhanh"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Đóng gói (cái/hộp)
                      </label>
                      <input
                        type="number"
                        value={formData.pack || 10}
                        onChange={(e) => setFormData({ ...formData, pack: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Nhãn nổi bật
                      </label>
                      <select
                        value={formData.badge || ''}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="">Không có</option>
                        <option value="Bán chạy">Bán chạy</option>
                        <option value="Hot">Hot</option>
                        <option value="Mới">Mới</option>
                        <option value="Cao cấp">Cao cấp</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Mô tả chi tiết sản phẩm
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả tiêu chuẩn, ứng dụng và ưu điểm của sản phẩm..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>

                <div className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors ${isFeaturedOnHome ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-md text-base ${isFeaturedOnHome ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'}`}>★</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Sản phẩm nổi bật trang chủ</p>
                      <p className="text-[10px] font-semibold text-gray-500">{featuredProductIds.length}/6 sản phẩm</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!isFeaturedOnHome && !featuredProductIds.includes(formData.id) && featuredProductIds.length >= 6}
                    onClick={() => setIsFeaturedOnHome((current) => !current)}
                    className={`min-w-[190px] px-4 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isFeaturedOnHome ? 'bg-amber-400 text-gray-900 hover:bg-amber-500' : 'border border-[#1B4C98] bg-white text-[#1B4C98] hover:bg-blue-50'}`}
                  >
                    {isFeaturedOnHome ? '✓ Đang hiển thị nổi bật' : '☆ Đưa lên Sản phẩm nổi bật'}
                  </button>
                </div>
              </div>

              {/* SECTION 2: QUẢN LÝ BIẾN THỂ MÀU SẮC (CHILD VARIANTS) */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>2.</span> {formData.category === 'breaker' ? 'Số cực & Mã SKU từng phiên bản' : 'Biến thể màu sắc & Mã SKU từng màu'} ({formData.variants.length} {formData.category === 'breaker' ? 'phiên bản' : 'màu'})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Gạt công tắc để Ẩn / Hiện phiên bản này trên web. Có thể sửa trực tiếp mã SKU hoặc đường dẫn ảnh WebP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    + Thêm màu
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.variants.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-colors ${
                        v.enabled ? 'bg-gray-50/70 border-gray-200' : 'bg-gray-100/60 border-dashed border-gray-300 opacity-70'
                      }`}
                    >
                      {/* Color Preview & Select */}
                      <div className="flex items-center gap-2 w-32 flex-shrink-0">
                        {formData.category !== 'breaker' && (
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-xs flex-shrink-0"
                            style={{ backgroundColor: v.hex }}
                          />
                        )}
                        {formData.category === 'breaker' ? (
                          <input
                            value={v.color}
                            onChange={(e) => {
                              const updated = [...formData.variants]
                              updated[vIdx] = { ...v, color: e.target.value, colorCode: e.target.value }
                              setFormData({ ...formData, variants: updated })
                            }}
                            aria-label="Số cực"
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md bg-white font-bold text-gray-800"
                          />
                        ) : (
                          <select
                            value={v.color}
                            onChange={(e) => {
                              const found = COLOR_PRESETS.find((cp) => cp.name === e.target.value)
                              const updated = [...formData.variants]
                              updated[vIdx] = {
                                ...v,
                                color: e.target.value,
                                colorCode: found ? found.code : 'P01',
                                hex: found ? found.hex : '#E5E7EB',
                              }
                              setFormData({ ...formData, variants: updated })
                            }}
                            className="px-2 py-1 text-xs border border-gray-300 rounded-md bg-white font-bold text-gray-800"
                          >
                            <option value="Trắng">Trắng</option>
                            <option value="Vàng">Vàng</option>
                            <option value="Xám Đậm">Xám Đậm</option>
                            <option value="Bạc">Bạc</option>
                            <option value="Đen">Đen</option>
                          </select>
                        )}
                      </div>

                      {/* Variant SKU Input */}
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] text-gray-500 block uppercase font-medium">
                          {formData.category === 'breaker' ? 'Mã SKU của phiên bản này:' : 'Mã SKU cụ thể của màu này:'}
                        </label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...formData.variants]
                            updated[vIdx] = { ...v, sku: e.target.value.toUpperCase() }
                            setFormData({ ...formData, variants: updated })
                          }}
                          placeholder={formData.category === 'breaker' ? 'Ví dụ: SH201-2P' : 'Ví dụ: 4TYA505111P0106'}
                          className="w-full px-2.5 py-1 text-xs font-mono font-bold border border-gray-300 rounded-md bg-white uppercase"
                        />
                      </div>

                      {/* Image Path Input */}
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] text-gray-500 block uppercase font-medium">Đường dẫn ảnh WebP:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={v.image}
                            onChange={(e) => {
                              const updated = [...formData.variants]
                              updated[vIdx] = { ...v, image: e.target.value }
                              setFormData({ ...formData, variants: updated })
                            }}
                            placeholder="/products/5.Velet120/White/..."
                            className="flex-1 px-2.5 py-1 text-xs font-mono border border-gray-300 rounded-md bg-white"
                          />
                          {v.image && (
                            <img src={v.image} alt="" className="w-7 h-7 object-contain bg-white border border-gray-200 rounded-sm" />
                          )}
                          <label className="flex-shrink-0 cursor-pointer rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1B4C98] hover:bg-blue-100">
                            {uploadingVariant === vIdx ? 'Đang tải...' : 'Tải ảnh'}
                            <input
                              type="file"
                              accept="image/*,.tif,.tiff"
                              disabled={uploadingVariant !== null}
                              className="hidden"
                              onChange={async (event) => {
                                const file = event.target.files?.[0]
                                if (!file) return
                                setUploadingVariant(vIdx)
                                try {
                                  const result = await uploadMedia(file, { folder: 'products', maxWidth: 1800, maxHeight: 1800, quality: 0.86 })
                                  setFormData((current) => {
                                    const variants = [...current.variants]
                                    variants[vIdx] = { ...variants[vIdx], image: result.url }
                                    return { ...current, variants }
                                  })
                                  showToast(`Đã tải ảnh WebP (${Math.round(result.bytes / 1024)} KB).`)
                                } catch (error) {
                                  showToast(error instanceof Error ? error.message : 'Không thể tải ảnh sản phẩm lên.')
                                } finally {
                                  setUploadingVariant(null)
                                  event.target.value = ''
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Enable / Disable Toggle */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.variants]
                            updated[vIdx] = { ...v, enabled: !v.enabled }
                            setFormData({ ...formData, variants: updated })
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                            v.enabled
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-200 text-gray-500 border-gray-300'
                          }`}
                        >
                          {v.enabled ? '✓ Bật' : '✕ Ẩn màu'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.variants.filter((_, idx) => idx !== vIdx)
                            setFormData({ ...formData, variants: updated })
                          }}
                          className="text-red-500 hover:text-red-700 p-1 text-xs"
                          title="Xóa biến thể màu này"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FF000F] hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  {isNew ? 'Lưu sản phẩm mới' : 'Lưu tất cả thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
