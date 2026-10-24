import logoWhite from '@/imports/logo_white.png'

interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ background: '#1B4C98' }} className="text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand & Corporate Info */}
        <div className="space-y-3">
          <img src={logoWhite} alt="Viễn Đông Electric" className="h-12 w-auto object-contain mb-3" />
          <p className="text-white text-xs font-bold uppercase tracking-wider">
            CÔNG TY TNHH THIẾT BỊ ĐIỆN VIỄN ĐÔNG
          </p>
          <div className="space-y-2 text-xs text-white/70 pt-1">
            <p className="flex items-start gap-1.5">
              <span className="font-semibold text-white/90 min-w-[85px] flex-shrink-0">Địa chỉ (VPĐD):</span>
              <span className="leading-relaxed">187A Bến Vân Đồn, Phường Khánh Hội, Thành phố Hồ Chí Minh</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-semibold text-white/90 min-w-[85px] flex-shrink-0">Điện thoại:</span>
              <a href="tel:02839435276" className="text-white hover:text-red-300 font-bold transition-colors">
                028.3943.5276
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-semibold text-white/90 min-w-[85px] flex-shrink-0">Gmail:</span>
              <a href="mailto:viendongelectric@gmail.com" className="text-white hover:text-red-300 font-medium transition-colors">
                viendongelectric@gmail.com
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-semibold text-white/90 min-w-[85px] flex-shrink-0">Mã số thuế:</span>
              <span className="font-mono font-bold text-white">0309430819</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-semibold text-white/90 min-w-[85px] flex-shrink-0">Giám đốc:</span>
              <span className="font-medium text-white">Trần Hoàng Hùng</span>
            </p>
          </div>
        </div>

        {/* Chính sách */}
        <div>
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
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Hỗ trợ</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'Giới thiệu doanh nghiệp', page: 'about' },
              { label: 'Sản phẩm ABB chính hãng', page: 'products' },
              { label: 'FAQs & Hỏi đáp', page: 'home' },
              { label: 'Liên hệ tư vấn', page: 'about' },
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

        {/* Newsletter + Social */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Đăng ký nhận tin</h4>
          <p className="text-white/40 text-sm mb-3">Nhận thông tin sản phẩm và khuyến mãi từ Viễn Đông.</p>
          <div className="flex mb-5">
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

          <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">Mạng xã hội</p>
            <div className="flex gap-2">
              {['F', 'Y', 'in', 'Z'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                  {s}
                </a>
              ))}
            </div>
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
