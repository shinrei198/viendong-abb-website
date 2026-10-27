import { useState } from 'react'
import logoColor from '@/imports/logo_viendong_header.png'
import GlobalSearch from '@/components/GlobalSearch'

interface HeaderProps {
  currentPage: string
  onNavigate: (page: string, categoryId?: string) => void
  cartCount: number
}

const navItems = [
  { label: 'Trang chủ', page: 'home' },
  { label: 'Giới thiệu', page: 'about' },
  { label: 'Sản phẩm', page: 'products', hasDropdown: true },
  { label: 'Video', page: 'videos' },
  { label: 'Tin tức', page: 'news' },
]

const productCategories = [
  { id: 'faceplate', name: 'Mặt che', sub: 'Velet 120, Mayple 120', count: 35 },
  { id: 'socket', name: 'Ổ cắm', sub: 'Velet, Mayple, Zita, Acus...', count: 120 },
  { id: 'switch', name: 'Công tắc', sub: 'Velet, Mayple, Zita, Acus...', count: 110 },
  { id: 'media-socket', name: 'Ổ cắm TV, Mạng, Điện thoại', sub: 'Velet, Mayple, Zita, Acus...', count: 45 },
  { id: 'accessories', name: 'Thiết bị và phụ kiện khác', sub: 'Velet, Mayple, Zita, Acus...', count: 60 },
  { id: 'breaker', name: 'Cầu dao', sub: 'Cầu dao tự động & chống rò', count: 150, isBreaker: true },
]

const catIcons = [
  'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm4 4h8v8H8V8z',
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8h2v5H9v-5zm6 0h2v5h-2v-5z',
  'M4 7h16a5 5 0 010 10H4A5 5 0 014 7zm12 2a3 3 0 100 6 3 3 0 000-6z',
  'M3 5h18v11H3V5zm5 14h8m-4-3v3',
  'M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6',
  'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z',
]

export default function Header({ currentPage, onNavigate, cartCount }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  return (
    <>
      {/* Top bar */}
      <div style={{ background: '#1B4C98' }} className="text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              info@viendongelectric.vn
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              (028) 39435276
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {['Đại lý', 'Nhà thầu', 'Thợ điện'].map((label) => (
              <span key={label} className="px-2 py-0.5 rounded text-[10px] font-semibold border border-white/30 text-white/80">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-40" style={{ background: 'white', borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 flex-shrink-0 w-[95px]">
            <img src={logoColor} alt="Viễn Đông Electric" className="h-10 w-23.5 object-contain max-w-[99%]" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto mr-4">
            {navItems.map((item) => (
              <div
                key={item.page}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setProductsOpen(true)}
                onMouseLeave={() => item.hasDropdown && setProductsOpen(false)}
              >
                <button
                  onClick={() => {
                    onNavigate(item.page)
                  }}
                  className="px-3 py-2 text-sm font-medium transition-all rounded flex items-center gap-1"
                  style={{
                    color: currentPage === item.page ? 'var(--red)' : 'var(--navy)',
                    fontWeight: currentPage === item.page ? '600' : '500',
                  }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  )}
                </button>

                {/* Mega menu dropdown */}
                {item.hasDropdown && productsOpen && (
                  <div className="absolute top-full z-50" style={{ left: '-120px' }}>
                    <div className="h-2" />
                    <div className="w-[560px] bg-white shadow-2xl rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                      {/* Strip header */}
                      <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{ background: '#1a1a1a', borderBottom: '3px solid var(--red)' }}
                      >
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Danh mục sản phẩm ABB</span>
                        <button
                          onClick={() => { onNavigate('products'); setProductsOpen(false) }}
                          className="text-yellow-300 text-[11px] font-semibold hover:text-white transition-colors"
                        >
                          Xem tất cả →
                        </button>
                      </div>
                      {/* 2-col grid */}
                      <div className="grid grid-cols-2">
                        {productCategories.map((cat, i) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onNavigate('products', cat.id)
                              setProductsOpen(false)
                            }}
                            className="flex items-start gap-3 px-5 py-4 text-left hover:bg-blue-50 transition-colors"
                            style={{
                              borderBottom: i < 4 ? '1px solid #f0f4f8' : 'none',
                              borderRight: i % 2 === 0 ? '1px solid #f0f4f8' : 'none',
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{ background: '#FF000F' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d={catIcons[i]} />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-gray-900 leading-tight">{cat.name}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{cat.sub}</p>
                              <span
                                className="inline-block mt-1 px-1.5 py-px text-[9px] font-bold text-white rounded-full"
                                style={{ backgroundColor: 'var(--red)' }}
                              >
                                {cat.count}+ SP
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <GlobalSearch onNavigate={onNavigate} />

            <button onClick={() => onNavigate('cart')} className="relative p-2 text-gray-500 hover:text-gray-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: 'var(--red)' }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { window.location.href = 'mailto:viendongelectric@gmail.com?subject=Đăng ký đại lý' }}
              className="hidden md:block px-4 py-2 text-sm font-semibold text-white rounded transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--red)' }}
            >
              Đăng ký đại lý
            </button>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            <div className="flex flex-wrap gap-1.5 pb-3 border-b border-gray-100 mb-2">
              {['Đại lý', 'Nhà thầu', 'Thợ điện'].map((l) => (
                <span key={l} className="px-2 py-0.5 rounded text-[10px] font-semibold border" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                  {l}
                </span>
              ))}
            </div>
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); setMobileOpen(false) }}
                className="w-full text-left px-2 py-2.5 text-sm font-medium border-b border-gray-50"
                style={{ color: currentPage === item.page ? 'var(--red)' : 'var(--navy)' }}
              >
                {item.label}
              </button>
            ))}
            {/* Mobile product categories */}
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-1">Danh mục sản phẩm</p>
              {productCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onNavigate('products', cat.id)
                    setMobileOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm border-b border-gray-50 hover:bg-blue-50 transition-colors"
                  style={{ color: 'var(--navy)' }}
                >
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: 'var(--red)' }}>
                    {cat.count}+
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { window.location.href = 'mailto:viendongelectric@gmail.com?subject=Đăng ký đại lý' }}
              className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white rounded"
              style={{ backgroundColor: 'var(--red)' }}
            >
              Đăng ký đại lý
            </button>
          </div>
        )}
      </header>
    </>
  )
}
