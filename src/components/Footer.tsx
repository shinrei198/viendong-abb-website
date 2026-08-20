import logoWhite from '@/imports/logo_white.png'

interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ background: '#1B4C98' }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <img src={logoWhite} alt="Viễn Đông Electric" className="h-12 w-auto object-contain mb-5" />
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">CÔNG TY TNHH THIẾT BỊ ĐIỆN VIỄN ĐÔNG</p>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Nhà phân phối chính thức cấp 1 của thiết bị điện ABB tại Việt Nam.
          </p>
          <div className="flex gap-2">
            {['F', 'Y', 'in', 'Z'].map((s, i) => (
              <a
                key={s}
                href="#"
                className="w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Chính sách */}
        <div>
          <div className="w-6 h-0.5 bg-red-600 mb-3" />
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Chính sách</h4>
          <ul className="space-y-2.5">
            {['Chính sách bảo mật', 'Chính sách đổi trả', 'Điều khoản dịch vụ', 'Chính sách bảo hành', 'Chính sách đại lý'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div>
          <div className="w-6 h-0.5 bg-red-600 mb-3" />
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Hỗ trợ</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Hệ thống phân phối', page: 'map' },
              { label: 'Giới thiệu', page: 'about' },
              { label: 'FAQs', page: 'home' },
              { label: 'Liên hệ', page: 'contact' },
            ].map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => onNavigate(item.page)}
                  className="text-sm text-white/40 hover:text-white transition-colors text-left"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter + Contact */}
        <div>
          <div className="w-6 h-0.5 bg-red-600 mb-3" />
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Đăng ký nhận tin</h4>
          <p className="text-white/40 text-sm mb-3">Nhận thông tin sản phẩm và khuyến mãi từ Viễn Đông.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-3 py-2 text-sm rounded-l text-white placeholder-white/40 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <button
              className="px-4 py-2 text-sm font-bold text-white rounded-r transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--red)' }}
            >
              →
            </button>
          </div>

          <div className="mt-6 pt-5 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', text: '187A Bến Vân Đồn, Q.4, TP.HCM' },
              { icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', text: '(028) 39435276' },
              { icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', text: 'info@viendongelectric.vn' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)" className="mt-0.5 flex-shrink-0">
                  <path d={item.icon} />
                </svg>
                <span className="text-sm text-white/40">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <span>© 2024 Viễn Đông Electric. All rights reserved.</span>
          <div className="flex gap-5">
            {['Sitemap', 'Điều khoản sử dụng', 'Chính sách bảo mật'].map((l) => (
              <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
