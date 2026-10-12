import React from 'react'
import logoColor from '@/imports/logo_color.png'
import abbLogo from '@/imports/abb-seeklogo.png'

interface AboutPageProps {
  onNavigate: (page: string, categoryId?: string) => void
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      {/* ── BREADCRUMB ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center text-xs text-gray-500 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#1B4C98] transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            Trang chủ
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-[#1B4C98] font-bold">Giới thiệu doanh nghiệp</span>
        </div>
      </div>

      {/* ── HERO BANNER ──────────────────────────────────────── */}
      <section className="relative bg-white border-b border-slate-200 overflow-hidden py-16 lg:py-24">
        {/* Subtle geometric background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#1B4C98 1px, transparent 1px), radial-gradient(#1B4C98 1px, #ffffff 1px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />

        {/* Ambient colored lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF000F] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4C98]">
                  Nhà Phân Phối Cấp 1 Thiết Bị Điện ABB
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                CÔNG TY TNHH <br className="hidden sm:inline" />
                <span className="text-[#1B4C98]">THIẾT BỊ ĐIỆN VIỄN ĐÔNG</span>
              </h1>

              <div className="w-20 h-1 bg-gradient-to-r from-[#1B4C98] via-[#0055A4] to-[#FF000F] rounded-full" />

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Được thành lập với sứ mệnh mang đến nguồn điện an toàn, thông minh và bền bỉ cho mọi công trình, 
                <strong className="text-slate-900 font-semibold"> Viễn Đông Electric </strong> 
                tự hào là đơn vị phân phối chính thức các giải pháp thiết bị điện dân dụng & công nghiệp từ 
                <strong className="text-[#FF000F] font-semibold"> Tập đoàn ABB (Thụy Sĩ) </strong> 
                tại thị trường Việt Nam.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('products')}
                  className="px-7 py-3.5 rounded-xl bg-[#1B4C98] hover:bg-[#143B78] text-white font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  <span>Khám phá sản phẩm ABB</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <a
                  href="#tam-nhin-su-menh"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-all flex items-center gap-2"
                >
                  <span>Tầm nhìn & Sứ mệnh</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Card: Strategic Brand Commitments */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="w-5 h-5 rounded-full bg-[#1B4C98] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">100% Nguồn gốc chính ngạch</p>
                      <p className="text-slate-500 text-xs mt-0.5">Đầy đủ chứng chỉ CO (Xuất xứ) & CQ (Chất lượng) theo từng lô hàng.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="w-5 h-5 rounded-full bg-[#1B4C98] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Chuẩn an toàn Châu Âu & Thụy Sĩ</p>
                      <p className="text-slate-500 text-xs mt-0.5">Tiên phong công nghệ chống cháy, chống giật và thẩm mỹ tinh xảo.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="w-5 h-5 rounded-full bg-[#1B4C98] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Hỗ trợ kỹ thuật & Dự án chuyên sâu</p>
                      <p className="text-slate-500 text-xs mt-0.5">Đội ngũ kỹ sư đồng hành tư vấn bóc tách khối lượng và giải pháp tối ưu.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY METRICS / STATS ──────────────────────────────── */}
      <section className="bg-slate-900 text-white py-10 relative overflow-hidden border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">100%</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">Chính Hãng ABB CO/CQ</p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF000F] tracking-tight">6+</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">Bộ Sưu Tập Chủ Lực</p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 tracking-tight">1.000+</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">Công Trình Tin Dùng</p>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">24/7</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">Hỗ Trợ Kỹ Thuật & Báo Giá</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TẦM NHÌN - SỨ MỆNH ───────────────────────────────── */}
      <section id="tam-nhin-su-menh" className="py-20 lg:py-28 bg-white scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1B4C98] text-xs font-bold uppercase tracking-widest mb-3">
              Kim chỉ nam định hướng
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              Tầm Nhìn & Sứ Mệnh
            </h2>
            <div className="w-16 h-1 bg-[#1B4C98] mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 mt-4 text-base">
              Đặt sự an tâm của khách hàng và chất lượng của mỗi công trình <br /> làm tâm điểm trong mọi hoạt động kinh doanh.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* CARD 1: TẦM NHÌN */}
            <div className="relative bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-100 shadow-xl shadow-slate-100/70 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50/80 transition-all flex flex-col justify-between group">
              {/* Blue accent top bar */}
              <div className="absolute top-0 left-8 right-8 h-1.5 bg-[#1B4C98] rounded-b-md" />

              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1B4C98] group-hover:bg-[#1B4C98] group-hover:text-white transition-all shadow-xs">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#1B4C98] bg-blue-50/80 px-3 py-1 rounded-full">
                    VISION
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight mb-5">
                  Tầm Nhìn
                </h3>

                {/* Exact Text From User's Google Doc */}
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal text-justify sm:text-left bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                  “<strong className="text-slate-900 font-semibold">Công ty TNHH Thiết Bị Điện Viễn Đông</strong> hướng đến trở thành một trong những đơn vị phân phối thiết bị điện hàng đầu Việt Nam, là đối tác tin cậy của các chủ đầu tư, nhà thầu và doanh nghiệp trong việc cung cấp các giải pháp thiết bị điện chính hãng, chất lượng cao.”
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B4C98]" />
                  <span>Đối tác tin cậy số 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B4C98]" />
                  <span>Phân phối chuẩn toàn quốc</span>
                </div>
              </div>
            </div>

            {/* CARD 2: SỨ MỆNH */}
            <div className="relative bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-100 shadow-xl shadow-slate-100/70 hover:border-red-200 hover:shadow-2xl hover:shadow-red-50/80 transition-all flex flex-col justify-between group">
              {/* Red accent top bar */}
              <div className="absolute top-0 left-8 right-8 h-1.5 bg-[#FF000F] rounded-b-md" />

              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#FF000F] group-hover:bg-[#FF000F] group-hover:text-white transition-all shadow-xs">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF000F] bg-red-50/80 px-3 py-1 rounded-full">
                    MISSION
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight mb-5">
                  Sứ Mệnh
                </h3>

                {/* Exact Text From User's Google Doc */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-4">
                    <div className="w-7 h-7 rounded-xl bg-red-100 text-[#FF000F] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      01
                    </div>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                      Cung cấp các sản phẩm thiết bị điện chính hãng, đảm bảo chất lượng, an toàn và hiệu quả cho mọi công trình.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-4">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1B4C98] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      02
                    </div>
                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                      Mang đến giải pháp điện toàn diện, giúp khách hàng tối ưu chi phí đầu tư và nâng cao hiệu suất vận hành.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF000F]" />
                  <span>An toàn tuyệt đối</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B4C98]" />
                  <span>Tối ưu chi phí đầu tư</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GIÁ TRỊ CỐT LÕI ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#FF000F] text-xs font-bold uppercase tracking-widest mb-3">
              Nền tảng phát triển bền vững
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              Giá Trị Cốt Lõi
            </h2>
            <div className="w-16 h-1 bg-[#FF000F] mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 mt-4 text-base">
              Hai trụ cột vững chắc định hình phong cách làm việc, văn hóa doanh nghiệp và cam kết phụng sự của Viễn Đông Electric.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* TRỤ CỘT 1: UY TÍN */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1B4C98] flex items-center justify-center font-extrabold text-xl mb-6 border border-blue-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Uy Tín
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4C98]">Trụ cột 01</span>
              </div>

              {/* Exact Text From User's Google Doc */}
              <p className="text-slate-700 text-base leading-relaxed text-justify sm:text-left">
                Luôn giữ vững cam kết với khách hàng và đối tác bằng việc cung cấp sản phẩm chính hãng, dịch vụ chuyên nghiệp và thực hiện đúng tiến độ trong mọi dự án.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B4C98]" />
                  <span>Cam kết cung cấp 100% thiết bị ABB chính hãng</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B4C98]" />
                  <span>Bảo đảm giao hàng đúng tiến độ thi công công trình</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B4C98]" />
                  <span>Dịch vụ tư vấn, bảo hành và hậu mãi minh bạch</span>
                </div>
              </div>
            </div>

            {/* TRỤ CỘT 2: CHẤT LƯỢNG */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-red-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#FF000F] flex items-center justify-center font-extrabold text-xl mb-6 border border-red-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Chất Lượng
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF000F]">Trụ cột 02</span>
              </div>

              {/* Exact Text From User's Google Doc */}
              <p className="text-slate-700 text-base leading-relaxed text-justify sm:text-left">
                Lấy chất lượng sản phẩm và dịch vụ làm nền tảng phát triển, lựa chọn những thương hiệu thiết bị điện uy tín nhằm mang đến hiệu quả và độ an toàn cao nhất.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF000F]" />
                  <span>Tiêu chuẩn chế tạo nghiêm ngặt chuẩn quốc tế IEC</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF000F]" />
                  <span>Vật liệu chống cháy PC/V0 cao cấp, cơ cấu tiếp điểm bạc</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF000F]" />
                  <span>Đồng hành cùng thương hiệu công nghệ năng lượng số 1 Thụy Sĩ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NĂNG LỰC PHÂN PHỐI & GIẢI PHÁP ─────────────────────── */}
      <section className="py-20 lg:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B4C98] bg-blue-50 px-3 py-1 rounded-full">
                Hệ Sinh Thái Toàn Diện
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Giải Pháp Điện ABB <br />
                <span className="text-[#1B4C98]">Cho Mọi Quy Mô Dự Án</span>
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Viễn Đông Electric cung cấp giải pháp đồng bộ từ thiết bị đóng cắt hạ thế bảo vệ nguồn đến các dòng công tắc ổ cắm thông minh hoàn thiện không gian nội thất cao cấp:
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: 'Dòng Công Tắc Ổ Cắm Cao Cấp',
                    desc: 'Velet 120, Mayple 120, Mayple, Velet, Zita, Acus với thiết kế tràn viền tinh xảo.',
                  },
                  {
                    title: 'Thiết Bị Đóng Cắt Bảo Vệ Nguồn',
                    desc: 'Aptomat MCB SH200, MCCB Tmax XT, ACB Emax 2, chống rò RCCB/RCBO an toàn tối đa.',
                  },
                  {
                    title: 'Giải Pháp Khách Sạn & Tự Động Hóa',
                    desc: 'Công tắc thẻ từ RFID, điều khiển DND/MUR, dimmer LED và cổng kết nối truyền thông.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="w-8 h-8 rounded-xl bg-[#1B4C98] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative space-y-8">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
                      Cam kết chất lượng
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
                      Vì Sao Chủ Đầu Tư & Nhà Thầu Chọn Viễn Đông?
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                      <div className="text-red-400 font-bold flex items-center gap-2">
                        <span>●</span> Nguồn Hàng Sẵn Có
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Kho hàng trung tâm tại TP.HCM lưu kho số lượng lớn, sẵn sàng đáp ứng tiến độ gấp của công trình.
                      </p>
                    </div>

                    <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                      <div className="text-red-400 font-bold flex items-center gap-2">
                        <span>●</span> Báo Giá Dự Án Tốt Nhất
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Chính sách chiết khấu trực tiếp cấp 1 từ hãng cho nhà thầu, thợ điện và đại lý phân phối.
                      </p>
                    </div>

                    <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                      <div className="text-red-400 font-bold flex items-center gap-2">
                        <span>●</span> Hồ Sơ Dự Án Minh Bạch
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Cung cấp đầy đủ CO/CQ, bảng test xuất xưởng, hóa đơn VAT hợp lệ giúp nghiệm thu thông suốt.
                      </p>
                    </div>

                    <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                      <div className="text-red-400 font-bold flex items-center gap-2">
                        <span>●</span> Đồng Hành Kỹ Thuật
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Hỗ trợ catalogue, bảng mẫu mẫu thực tế (sample board) và hướng dẫn lắp đặt trực tiếp tại công trường.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-white/10">
                    <div className="text-xs text-slate-400">
                      Cần tư vấn thiết bị hoặc nhận hồ sơ năng lực?
                    </div>
                    <button
                      onClick={() => onNavigate('cart')}
                      className="px-6 py-3 rounded-xl bg-[#FF000F] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                    >
                      Gửi Yêu Cầu Báo Giá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THÔNG TIN LIÊN HỆ DOANH NGHIỆP ───────────────────── */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <img src={logoColor} alt="Viễn Đông" className="h-10 w-auto object-contain" />
                <div className="h-6 w-px bg-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông Tin Doanh Nghiệp
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B4C98]">
                CÔNG TY TNHH THIẾT BỊ ĐIỆN VIỄN ĐÔNG
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 pt-2 text-xs sm:text-sm text-slate-600">
                <div>
                  <span className="font-bold text-slate-900 block">Địa chỉ (VPĐD):</span>
                  <span>187A Bến Vân Đồn, Phường Khánh Hội, Thành phố Hồ Chí Minh</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Điện thoại:</span>
                  <a href="tel:02839435276" className="text-[#1B4C98] font-bold hover:underline">
                    028.3943.5276
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Gmail:</span>
                  <a href="mailto:viendongelectric@gmail.com" className="text-[#1B4C98] font-bold hover:underline">
                    viendongelectric@gmail.com
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Mã số thuế:</span>
                  <span className="font-mono font-bold text-slate-800">0309430819</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Giám đốc:</span>
                  <span className="font-bold text-slate-800">Trần Hoàng Hùng</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 self-start lg:self-center">
              <button
                onClick={() => onNavigate('products')}
                className="px-6 py-3.5 rounded-xl bg-[#1B4C98] hover:bg-[#143B78] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm text-center"
              >
                Xem Sản Phẩm ABB
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
