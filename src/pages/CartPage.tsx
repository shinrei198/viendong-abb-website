import { useState } from 'react'
import { addQuoteRequest } from '@/data/siteData'

interface CartItem {
  id: string
  name: string
  sku: string
  qty: number
}

interface CartPageProps {
  items: CartItem[]
  onNavigate: (page: string) => void
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onClear: () => void
}

type Step = 'cart' | 'info' | 'success'

export default function CartPage({ items, onNavigate, onUpdateQty, onRemove, onClear }: CartPageProps) {
  const [step, setStep] = useState<Step>('cart')
  const [createdCode, setCreatedCode] = useState<string>('')
  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '', province: '', note: '', userType: 'Đại lý'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    // Save to siteData quote requests
    const newQuote = addQuoteRequest({
      customerName: form.name,
      company: form.company,
      phone: form.phone,
      email: form.email,
      province: form.province || 'Toàn quốc',
      customerType: form.userType as any || 'Đại lý',
      note: form.note,
      items: items.map((i) => ({ id: i.id, name: i.name, sku: i.sku, qty: i.qty })),
    })

    setCreatedCode(newQuote.code)
    setStep('success')
    onClear()
  }

  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)' }}>
          Yêu cầu báo giá đã được gửi!
        </h2>
        <p className="text-gray-600 mb-2">
          Cảm ơn <strong>{form.name}</strong>. Đội ngũ kỹ thuật Viễn Đông sẽ liên hệ qua email <strong>{form.email}</strong> và số điện thoại <strong>{form.phone}</strong> trong vòng 2–4 giờ làm việc.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Mã yêu cầu: <strong className="text-[#1B4C98] font-mono">{createdCode || `VD-${Date.now().toString().slice(-6)}`}</strong>
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 text-sm font-semibold border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            style={{ color: 'var(--navy)' }}
          >
            Về trang chủ
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--red)' }}
          >
            Tiếp tục chọn hàng
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-gray-300">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)' }}>
          Giỏ hàng trống
        </h2>
        <p className="text-gray-500 mb-6 text-sm">Chưa có sản phẩm nào trong giỏ. Hãy chọn thiết bị ABB bạn cần.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 text-sm font-semibold text-white rounded transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--red)' }}
        >
          Xem sản phẩm →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:text-red-600 transition-colors">Trang chủ</button>
        <span>›</span>
        <span className="font-medium text-gray-900">Giỏ hàng & Báo giá</span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {(['cart', 'info'] as const).map((s, i) => {
          const labels = ['Giỏ hàng', 'Thông tin báo giá']
          const isActive = step === s
          const isDone = (step === 'info' && s === 'cart')
          return (
            <div key={s} className="flex items-center gap-3">
              {i > 0 && <div className="w-12 h-px bg-gray-300" />}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: isDone ? '#16a34a' : isActive ? 'var(--red)' : '#e5e7eb',
                    color: isDone || isActive ? 'white' : '#9ca3af',
                  }}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span className="text-sm font-semibold" style={{ color: isActive ? 'var(--red)' : isDone ? '#16a34a' : '#9ca3af' }}>
                  {labels[i]}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)' }}>
                Danh sách sản phẩm yêu cầu báo giá
              </h2>
              <button onClick={onClear} className="text-xs text-red-500 hover:underline">Xóa tất cả</button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded flex items-center justify-center flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" className="opacity-20">
                    <rect x="6" y="10" width="52" height="44" rx="4" stroke="#1B2A4A" strokeWidth="2.5"/>
                    <rect x="12" y="16" width="12" height="12" rx="2" fill="#FF000F"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                  <p className="text-[11px] font-mono text-gray-400">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center border border-gray-200 rounded">
                  <button
                    onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Tóm tắt yêu cầu</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số loại sản phẩm</span>
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng số lượng</span>
                  <span className="font-semibold">{items.reduce((s, i) => s + i.qty, 0)} sản phẩm</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex items-center gap-2 p-3 rounded-lg mb-3" style={{ backgroundColor: 'rgba(227,6,19,0.05)', border: '1px solid rgba(227,6,19,0.15)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--red)', flexShrink: 0 }}><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2V7h-2v2z"/></svg>
                  <p className="text-xs text-red-700">Giá sẽ được báo dựa trên số lượng và loại đại lý của bạn.</p>
                </div>
              </div>

              <button
                onClick={() => setStep('info')}
                className="w-full py-3 text-sm font-bold text-white rounded transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--red)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                Gửi yêu cầu Báo giá
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="w-full mt-2 py-2.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Tiếp tục chọn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)' }}>
              Thông tin liên hệ báo giá
            </h2>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              {/* User type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">Bạn là *</label>
                <div className="flex gap-2 flex-wrap">
                  {['Đại lý', 'Nhà thầu', 'Thợ điện', 'Khác'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, userType: type })}
                      className="px-4 py-2 rounded text-sm font-medium border transition-all"
                      style={{
                        borderColor: form.userType === type ? 'var(--red)' : '#d1d5db',
                        backgroundColor: form.userType === type ? 'rgba(227,6,19,0.07)' : 'white',
                        color: form.userType === type ? 'var(--red)' : '#374151',
                        fontWeight: form.userType === type ? '600' : '400',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2.5 text-sm border rounded focus:outline-none transition-colors"
                    style={{ borderColor: errors.name ? '#ef4444' : '#d1d5db' }}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">Công ty / Cơ sở</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Cty TNHH Điện Minh Phát"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0901 234 567"
                    className="w-full px-3 py-2.5 text-sm border rounded focus:outline-none transition-colors"
                    style={{ borderColor: errors.phone ? '#ef4444' : '#d1d5db' }}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@congty.vn"
                    className="w-full px-3 py-2.5 text-sm border rounded focus:outline-none transition-colors"
                    style={{ borderColor: errors.email ? '#ef4444' : '#d1d5db' }}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">Tỉnh / Thành phố</label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-400 bg-white"
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {['TP. Hồ Chí Minh', 'Hà Nội', 'Bình Dương', 'Đồng Nai', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Tỉnh khác'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">Ghi chú thêm</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={3}
                  placeholder="Yêu cầu đặc biệt, thông tin dự án, thời gian cần hàng..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep('cart')}
                className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                ← Quay lại giỏ hàng
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 text-sm font-bold text-white rounded transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--red)' }}
              >
                Gửi yêu cầu Báo giá →
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Sản phẩm yêu cầu báo giá</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 bg-gray-50 rounded flex-shrink-0 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 64 64" fill="none" className="opacity-20">
                        <rect x="6" y="10" width="52" height="44" rx="4" stroke="#1B2A4A" strokeWidth="2.5"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-xs truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">×{item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng sản phẩm</span>
                  <span className="font-bold text-gray-900">{items.length} loại</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
