import { useState } from 'react'
import logoColor from '@/imports/logo_color.png'

interface HeaderProps {
  currentPage: string
  onNavigate: (page: string) => void
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
  { name: 'MCB · RCCB · RCBO', sub: 'SH200, GSH201', count: 111 },
  { name: 'MCCB – Cầu dao tự động khối', sub: 'Tmax T1-T6, Tmax XT', count: 200 },
  { name: 'Công tắc & Ổ cắm Framia', sub: 'Trắng · Xám · Vàng', count: 30 },
  { name: 'Công tắc & Ổ cắm Inora', sub: 'Thiết kế hiện đại', count: 19 },
  { name: 'Khởi động từ & Rờ le nhiệt', sub: 'AX Contactor, TA Thermal Relay', count: 65 },
  { name: 'ACB – Máy cắt không khí', sub: 'Emax2 E1.2–E4.2', count: 50 },
]

const catIcons = [
  'M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h6v2H4z',
  'M3 6l3-3h12l3 3v12l-3 3H6l-3-3V6zm3 0v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2z',
  'M9 3H5a2 2 0 00-2 2v4m0 0h18M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9',
  'M12 22c0 0 8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c-5 0-8 2.5-8 4v2h16v-2c0-1.5-3-4-8-4z',
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
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-1.5 group">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5V8H18.5L13 3.5zM6 20V4h5v5h5v11H6z"/>
              </svg>
              <span className="text-[11px] font-bold tracking-widest uppercase text-white group-hover:text-yellow-300 transition-colors">
                BẢNG GIÁ, CATALOGUE ABB
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {['Đại lý', 'Nhà thầu', 'Thợ điện'].map((label) => (
                <span key={label} className="px-2 py-0.5 rounded text-[10px] font-semibold border border-white/30 text-white/80">
                  {label}
                </span>
              ))}
            </div>
            
            {/* Quick Admin entry link */}
            <button
              onClick={() => onNavigate('admin')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                currentPage === 'admin'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white hover:text-[#1B4C98]'
              }`}
              title="Mở Trang Quản Trị Admin"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
              Quản trị Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-40" style={{ background: 'white', borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 flex-shrink-0">
            <img src={logoColor} alt="Viễn Đông Electric" className="h-11 w-auto object-contain" />
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
                            key={cat.name}
                            onClick={() => { onNavigate('products'); setProductsOpen(false) }}
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

            <button
              onClick={() => onNavigate('map')}
              className="px-3 py-2 text-sm font-medium transition-all rounded"
              style={{ color: currentPage === 'map' ? 'var(--red)' : 'var(--navy)' }}
            >
              Hệ thống phân phối
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-1 text-gray-500 hover:text-gray-900 p-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

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
                onClick={() => { onNavigate(item.page === 'contact' ? 'map' : item.page); setMobileOpen(false) }}
                className="w-full text-left px-2 py-2.5 text-sm font-medium border-b border-gray-50"
                style={{ color: currentPage === item.page ? 'var(--red)' : 'var(--navy)' }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { onNavigate('map'); setMobileOpen(false) }}
              className="w-full text-left px-2 py-2.5 text-sm font-medium border-b border-gray-50"
              style={{ color: currentPage === 'map' ? 'var(--red)' : 'var(--navy)' }}
            >
              Hệ thống phân phối
            </button>
            {/* Mobile product categories */}
            <div className="pt-2 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-1">Danh mục sản phẩm</p>
              {productCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { onNavigate('products'); setMobileOpen(false) }}
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
