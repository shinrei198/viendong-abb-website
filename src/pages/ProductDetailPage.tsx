import { useState, useMemo, useEffect } from 'react'
import { getStoredProducts, ProductItem, ProductVariant } from '@/data/siteData'
import { getDefaultVariant, getEnabledVariants, hasVariantOptions, productColorDot } from '@/utils/productVariants'
import ProductImageBranding from '@/components/ProductImageBranding'

interface ProductDetailPageProps {
  productId: string
  onNavigate: (page: string, productId?: string) => void
  onAddToCart: (product: { id: string; name: string; sku: string }) => void
}

export default function ProductDetailPage({ productId, onNavigate, onAddToCart }: ProductDetailPageProps) {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(getStoredProducts)

  useEffect(() => {
    const refreshProducts = () => setAllProducts(getStoredProducts())
    window.addEventListener('viendong_storage_update', refreshProducts)
    return () => window.removeEventListener('viendong_storage_update', refreshProducts)
  }, [])
  
  const product: ProductItem = useMemo(() => {
    const found = allProducts.find((p) => p.id === productId)
    if (found) return found
    return allProducts[0] || {
      id: 'prod-fallback',
      name: 'Thiết bị điện ABB',
      baseSku: '4TYA000000',
      series: 'VELET 120',
      category: 'switch',
      specs: 'Thiết bị điện chuẩn Thụy Sĩ ABB',
      inStock: true,
      variants: [{ color: 'Trắng', colorCode: 'P01', hex: '#FFFFFF', sku: '4TYA000000P0100', image: '', enabled: true }],
    }
  }, [allProducts, productId])

  // Enabled color variants
  const enabledVariants = useMemo(() => {
    return getEnabledVariants(product)
  }, [product])
  const showVariantOptions = hasVariantOptions(product, enabledVariants)

  // Selected variant state (defaults to first enabled variant)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    return getDefaultVariant(product)
  })
  const [selectedImage, setSelectedImage] = useState(selectedVariant.image)

  // Keep the selected SKU when data refreshes; otherwise select the first valid variant.
  useEffect(() => {
    setSelectedVariant((current) =>
      enabledVariants.find((variant) => variant.sku === current.sku) ||
      enabledVariants[0] ||
      product.variants?.[0] || {
        color: 'Trắng',
        colorCode: 'P01',
        hex: '#FFFFFF',
        sku: product.baseSku,
        image: '',
        enabled: true,
      }
    )
    setQty(1)
  }, [product.id, product.baseSku, product.variants, enabledVariants])

  useEffect(() => {
    setSelectedImage(selectedVariant.image)
  }, [product.id, selectedVariant.sku, selectedVariant.image])

  const galleryImages = useMemo(
    () => Array.from(new Set([selectedVariant.image, ...(product.gallery || [])].filter(Boolean))),
    [product.gallery, selectedVariant.image]
  )

  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'docs'>('specs')
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      onAddToCart({
        id: product.id,
        name: `${product.name} (${selectedVariant.color})`,
        sku: selectedVariant.sku,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Related products in the same series
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.series === product.series && p.id !== product.id)
      .slice(0, 4)
  }, [allProducts, product])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <button onClick={() => onNavigate('home')} className="hover:text-red-600 transition-colors">Trang chủ</button>
        <span>›</span>
        <button onClick={() => onNavigate('products')} className="hover:text-red-600 transition-colors">Sản phẩm</button>
        <span>›</span>
        <span className="text-blue-600 font-semibold">{product.series}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Product Images View */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl mb-4 shadow-sm overflow-hidden group">
            <ProductImageBranding series={product.series} badge={product.badge} size="detail" />
            <div className="aspect-square flex items-center justify-center p-8 relative">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={`${product.name} ${selectedVariant.color}`}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-center text-gray-300">
                  <svg width="96" height="96" viewBox="0 0 64 64" fill="none" className="mx-auto mb-2 opacity-30">
                    <rect x="6" y="10" width="52" height="44" rx="4" stroke="#1B4C98" strokeWidth="2.5" />
                    <rect x="12" y="16" width="12" height="12" rx="2" fill="#FF000F" />
                  </svg>
                  <p className="text-xs">Hình ảnh chuẩn đang cập nhật</p>
                </div>
              )}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square overflow-hidden rounded-lg border bg-white p-2 transition-colors ${selectedImage === image ? 'border-[#FF000F] ring-1 ring-[#FF000F]' : 'border-gray-200 hover:border-gray-400'}`}
                  aria-label={`Xem ảnh ${index + 1} của ${product.name}`}
                >
                  <img src={image} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Color or breaker-pole variants */}
          {showVariantOptions && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                {product.category === 'breaker' ? 'Chọn số cực:' : 'Tùy chọn màu sắc:'}
              </span>
              <div className="flex gap-2 flex-wrap">
                {enabledVariants.map((v) => {
                  const isSelected = selectedVariant.color === v.color
                  return (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-gray-500 bg-gray-50 ring-1 ring-gray-400 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      {product.category !== 'breaker' && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs"
                          style={{ backgroundColor: productColorDot[v.color] || v.hex }}
                        />
                      )}
                      <span className="text-xs font-bold text-gray-800">{v.color}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Info & Action */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-red-50 text-[#FF000F] border border-red-200">
              Dòng {product.series}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-50 text-[#1B4C98] border border-blue-200">
              Thương hiệu ABB Thụy Sĩ
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>

          {/* Dynamic Active SKU */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-5">
            <div>
              <span className="text-[11px] text-gray-500 block uppercase font-medium">Mã SKU đặt hàng:</span>
              <span className="text-sm font-mono font-bold text-[#1B4C98]">{selectedVariant.sku}</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <span className="text-[11px] text-gray-500 block uppercase font-medium">{product.category === 'breaker' ? 'Số cực đang chọn:' : 'Màu sắc đang chọn:'}</span>
              <span className="text-sm font-bold text-gray-800">{selectedVariant.color}</span>
            </div>
            {product.pack && (
              <>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase font-medium">Đóng gói:</span>
                  <span className="text-sm font-bold text-gray-800">{product.pack} cái / hộp</span>
                </div>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {product.description || `${product.name} thuộc dòng ${product.series} của ABB Thụy Sĩ, đáp ứng tiêu chuẩn an toàn điện cao cấp, vật liệu chống cháy, phím bấm êm ái và thẩm mỹ kiến trúc hiện đại.`}
          </p>

          {/* Pricing Policy (NO PRICES DISPLAYED) */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-extrabold text-[#1B4C98] uppercase tracking-wide">
                Chính sách báo giá kênh phân phối & Dự án
              </span>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Chiết khấu cao
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Viễn Đông Electric cung cấp bảng giá chiết khấu đặc biệt cho Đại lý, Nhà thầu, KTS và Công trình. Vui lòng thêm sản phẩm vào danh sách báo giá hoặc liên hệ Hotline để nhận báo giá nhanh trong 15 phút.
            </p>
          </div>

          {/* Add to Quote Action */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-100 font-bold transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2.5 text-sm font-bold text-gray-900 min-w-[3rem] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-100 font-bold transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 py-3 px-6 bg-[#FF000F] hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{added ? '✓ Đã thêm vào danh sách' : '+ Thêm vào danh sách báo giá'}</span>
            </button>
          </div>

          {/* Direct Hotline Consultation */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <a
              href="tel:0903333333"
              className="flex-1 py-2.5 text-xs font-bold text-center border border-[#1B4C98] text-[#1B4C98] rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>📞</span> Hotline: 090 333 3333
            </a>
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 text-xs font-bold text-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>💬</span> Chat Zalo báo giá
            </a>
          </div>
        </div>
      </div>

      {/* Technical Specifications Tabs */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden mb-12 bg-white shadow-sm">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-[#FF000F] text-[#FF000F] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Thông số kỹ thuật
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'features'
                ? 'border-[#FF000F] text-[#FF000F] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Đặc điểm nổi bật
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'docs'
                ? 'border-[#FF000F] text-[#FF000F] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Tiêu chuẩn & Bảo hành
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Dòng sản phẩm:</span>
                  <span className="font-bold text-gray-900">{product.series}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Mã SKU cơ sở:</span>
                  <span className="font-mono font-bold text-gray-900">{product.baseSku}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Mã SKU biến thể màu ({selectedVariant.color}):</span>
                  <span className="font-mono font-bold text-[#1B4C98]">{selectedVariant.sku}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Thông số kỹ thuật:</span>
                  <span className="font-bold text-gray-900">{product.specs}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Quy cách đóng gói:</span>
                  <span className="font-bold text-gray-900">{product.pack ? `${product.pack} cái / hộp` : '10 cái / hộp'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <span className="text-gray-500 font-medium">Tình trạng kho hàng:</span>
                  <span className="font-bold text-green-600">● Sẵn hàng tại kho Viễn Đông</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <ul className="space-y-2.5 text-xs text-gray-700 list-disc list-inside">
              <li>Thương hiệu thiết bị điện hàng đầu toàn cầu ABB (Thụy Sĩ) với hơn 140 năm lịch sử.</li>
              <li>Chất liệu Polycarbonate cao cấp chống cháy, không phai màu theo thời gian, chống trầy xước.</li>
              <li>Cơ cấu tiếp điểm hợp kim bạc độ bền cao, cơ cấu bật tắt êm ái lên tới 40.000 lần.</li>
              <li>Lỗ cắm có màn che an toàn bảo vệ trẻ em và tiếp xúc điện chắc chắn, chống phát sinh tia lửa.</li>
              <li>Thiết kế module linh hoạt, dễ dàng lắp đặt và thay thế vào các đế âm tiêu chuẩn.</li>
            </ul>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3 text-xs text-gray-700">
              <p><strong>Bảo hành chính hãng:</strong> 24 tháng theo tiêu chuẩn bảo hành của nhà sản xuất ABB.</p>
              <p><strong>Tiêu chuẩn quốc tế:</strong> IEC 60669-1, IEC 60884-1, RoHS, chứng nhận hợp chuẩn hợp quy Việt Nam (TCVN).</p>
              <p><strong>Xuất xứ hàng hóa:</strong> Phân phối chính hãng bởi Công ty TNHH Thiết bị Điện Viễn Đông.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Sản phẩm cùng dòng {product.series}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => {
              const relImg = getDefaultVariant(rel).image
              return (
                <div
                  key={rel.id}
                  onClick={() => onNavigate('productDetail', rel.id)}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="bg-gray-50 rounded-lg mb-2 overflow-hidden">
                    <ProductImageBranding series={rel.series} badge={rel.badge} size="compact" />
                    <div className="aspect-square flex items-center justify-center p-2">
                      {relImg ? (
                        <img src={relImg} alt={rel.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-gray-300">⚡</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">{rel.series}</p>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{rel.name}</h4>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">{rel.baseSku}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
