import { useState } from 'react'

interface ProductDetailPageProps {
  productId: string
  onNavigate: (page: string, productId?: string) => void
  onAddToCart: (product: { id: string; name: string; sku: string }) => void
}

const productData: Record<string, {
  id: string; name: string; sku: string; cat: string; series: string
  specs: { label: string; value: string }[]
  features: string[]
  relatedIds: string[]
}> = {
  p1: {
    id: 'p1', name: 'MCB 1P 6A SH200L', sku: '2CSS215101R0064', cat: 'MCB', series: 'SH200',
    specs: [
      { label: 'Số cực', value: '1P' },
      { label: 'Dòng định mức', value: '6A' },
      { label: 'Khả năng cắt', value: '6kA (IEC)' },
      { label: 'Đặc tính tác động', value: 'Type B' },
      { label: 'Điện áp định mức', value: '230V AC' },
      { label: 'Tiêu chuẩn', value: 'IEC 60898-1' },
      { label: 'Chiều rộng', value: '18mm (1 module)' },
      { label: 'Màu sắc', value: 'Xám / Đỏ' },
    ],
    features: [
      'Bảo vệ chống quá tải và ngắn mạch',
      'Thiết kế nhỏ gọn 1 module DIN',
      'Thích hợp cho hệ thống điện dân dụng và thương mại',
      'Chứng nhận CE, IEC 60898-1',
      'Tuổi thọ cơ học 20.000 lần đóng cắt',
    ],
    relatedIds: ['p2', 'p3', 'p10'],
  },
  p4: {
    id: 'p4', name: 'MCCB 3P 63A T1N', sku: '1SDA051338R1', cat: 'MCCB', series: 'Tmax T1',
    specs: [
      { label: 'Số cực', value: '3P' },
      { label: 'Dòng định mức', value: '63A' },
      { label: 'Khả năng cắt Icu', value: '36kA @ 415V' },
      { label: 'Điện áp định mức', value: '690V AC' },
      { label: 'Tiêu chuẩn', value: 'IEC 60947-2' },
      { label: 'Mức độ bảo vệ', value: 'IP20' },
      { label: 'Khối lượng', value: '0.85 kg' },
      { label: 'Loại lắp đặt', value: 'Fixed' },
    ],
    features: [
      'Bảo vệ quá dòng và ngắn mạch cho mạch phân phối',
      'Khả năng cắt cao 36kA, phù hợp hệ thống công nghiệp',
      'Có thể bổ sung phụ kiện: shunt trip, auxiliary contact',
      'Chứng nhận IEC 60947-2, GOST',
    ],
    relatedIds: ['p5', 'p6', 'p7'],
  },
}

const fallbackProduct = productData['p1']

const relatedProducts = [
  { id: 'p2', name: 'MCB 2P 16A SH200L', sku: '2CSS215201R0164', cat: 'MCB' },
  { id: 'p3', name: 'MCB 3P 25A S200', sku: '2CDS253001R0254', cat: 'MCB' },
  { id: 'p5', name: 'MCCB 3P 160A T3N', sku: '1SDA051517R1', cat: 'MCCB' },
  { id: 'p10', name: 'RCCB 2P 25A F202', sku: '2CSF202001R1250', cat: 'RCCB' },
]

export default function ProductDetailPage({ productId, onNavigate, onAddToCart }: ProductDetailPageProps) {
  const product = productData[productId] || fallbackProduct
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'docs'>('specs')
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart({ id: product.id, name: product.name, sku: product.sku })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <button onClick={() => onNavigate('home')} className="hover:text-red-600 transition-colors">Trang chủ</button>
        <span>›</span>
        <button onClick={() => onNavigate('products')} className="hover:text-red-600 transition-colors">Sản phẩm</button>
        <span>›</span>
        <button onClick={() => onNavigate('products')} className="hover:text-red-600 transition-colors">{product.cat}</button>
        <span>›</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Product images */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg aspect-square flex items-center justify-center mb-3 p-12">
            <svg width="180" height="180" viewBox="0 0 64 64" fill="none" className="opacity-25">
              <rect x="6" y="10" width="52" height="44" rx="4" stroke="#1B2A4A" strokeWidth="2.5"/>
              <rect x="12" y="16" width="12" height="12" rx="2" fill="#FF000F"/>
              <rect x="27" y="16" width="12" height="12" rx="2" fill="#FF000F"/>
              <rect x="42" y="16" width="10" height="12" rx="2" fill="#FF000F"/>
              <rect x="12" y="32" width="40" height="3" rx="1" fill="#1B2A4A"/>
              <rect x="12" y="38" width="30" height="3" rx="1" fill="#1B2A4A"/>
              <rect x="12" y="44" width="20" height="3" rx="1" fill="#1B2A4A"/>
            </svg>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-20 bg-white border-2 border-gray-200 rounded flex items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
                <svg width="36" height="36" viewBox="0 0 64 64" fill="none" className="opacity-20">
                  <rect x="6" y="10" width="52" height="44" rx="4" stroke="#1B2A4A" strokeWidth="2.5"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide" style={{ backgroundColor: 'rgba(227,6,19,0.1)', color: 'var(--red)' }}>
              {product.cat}
            </span>
            <span className="text-xs text-gray-400 font-medium">{product.series}</span>
            <span className="ml-auto flex items-center gap-1 text-green-600 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Có hàng
            </span>
          </div>

          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)', lineHeight: 1.2 }}
          >
            {product.name}
          </h1>

          <p className="text-sm text-gray-500 mb-1">
            Mã sản phẩm (SKU):{' '}
            <span className="font-mono font-semibold text-gray-800">{product.sku}</span>
          </p>

          {/* ABB badge */}
          <div className="flex items-center gap-2 py-3 border-y border-gray-100 my-4">
            <div className="w-10 h-6 flex items-center justify-center rounded bg-red-600 text-white font-black text-[10px] tracking-wider">ABB</div>
            <span className="text-sm text-gray-600">Sản phẩm chính hãng ABB — Bảo hành 24 tháng</span>
          </div>

          {/* Notice - no price */}
          <div
            className="rounded-lg p-4 mb-5 border"
            style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
          >
            <p className="text-sm font-semibold text-amber-800 mb-1">Sản phẩm không niêm yết giá bán lẻ</p>
            <p className="text-xs text-amber-700">
              Thêm sản phẩm vào giỏ hàng và gửi yêu cầu báo giá. Đội ngũ kỹ thuật sẽ phản hồi trong vòng 2 giờ trong giờ hành chính.
            </p>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-semibold text-gray-700">Số lượng:</label>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAdd}
              className="flex-1 py-3 text-sm font-bold text-white rounded transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: added ? '#16a34a' : 'var(--red)' }}
            >
              {added ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Đã thêm vào giỏ</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Thêm vào giỏ hàng</>
              )}
            </button>
            <button
              className="px-4 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Lưu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-2">
            {product.specs.slice(0, 4).map((s) => (
              <div key={s.label} className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{s.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg mb-10">
        <div className="flex border-b border-gray-200">
          {([['specs', 'Thông số kỹ thuật'], ['features', 'Tính năng nổi bật'], ['docs', 'Tài liệu kỹ thuật']] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px"
              style={{
                borderBottomColor: activeTab === tab ? 'var(--red)' : 'transparent',
                color: activeTab === tab ? 'var(--red)' : '#6b7280',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {product.specs.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-3 border-b border-gray-100"
                  style={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}
                >
                  <span className="text-sm text-gray-600 px-4">{s.label}</span>
                  <span className="text-sm font-semibold text-gray-900 px-4">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'features' && (
            <ul className="space-y-3">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 flex-shrink-0" style={{ color: 'var(--red)' }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'docs' && (
            <div className="space-y-3">
              {['Datasheet kỹ thuật (PDF)', 'Hướng dẫn lắp đặt (PDF)', 'Chứng chỉ CE & IEC', 'CAD Drawing (DWG)'].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:border-red-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--red)' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5V8H18.5L13 3.5z"/></svg>
                    <span className="text-sm font-medium text-gray-800">{doc}</span>
                  </div>
                  <button className="text-xs font-semibold text-blue-600 hover:underline">Tải xuống</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      <div>
        <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)' }}>
          Sản phẩm liên quan
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-red-300 transition-all"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-6">
                <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="opacity-20">
                  <rect x="6" y="10" width="52" height="44" rx="4" stroke="#1B2A4A" strokeWidth="2.5"/>
                  <rect x="12" y="16" width="12" height="12" rx="2" fill="#FF000F"/>
                </svg>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{p.cat}</p>
                <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{p.name}</h4>
                <p className="text-[10px] font-mono text-gray-400 mb-3">{p.sku}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onNavigate('productDetail', p.id)}
                    className="flex-1 py-1.5 text-xs font-medium border rounded transition-colors hover:bg-gray-50"
                    style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => onAddToCart({ id: p.id, name: p.name, sku: p.sku })}
                    className="flex-1 py-1.5 text-xs font-semibold text-white rounded"
                    style={{ backgroundColor: 'var(--red)' }}
                  >
                    + Giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
