interface NotFoundPageProps {
  onNavigate: (page: string) => void
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <section className="relative isolate flex min-h-[68vh] items-center overflow-hidden bg-[#f7f8fa] px-4 py-20">
      <div className="absolute inset-0 -z-10 opacity-60" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(27,76,152,0.12), transparent 34%), radial-gradient(circle at 82% 72%, rgba(255,0,15,0.09), transparent 30%)' }} />
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-[#FF000F]">404 · Page not found</p>
        <h1 className="mb-5 text-4xl font-bold leading-tight text-[#1B4C98] sm:text-5xl" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Trang bạn tìm kiếm không tồn tại
        </h1>
        <p className="mx-auto mb-9 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
          Đường dẫn có thể đã thay đổi hoặc nội dung đang tạm thời không được hiển thị. Bạn có thể quay lại trang vừa xem hoặc trở về trang chủ Viễn Đông Electric.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => window.history.back()} className="min-w-40 border border-[#1B4C98] bg-white px-6 py-3 text-sm font-bold text-[#1B4C98] transition-colors hover:bg-blue-50">
            Về trang trước
          </button>
          <button onClick={() => onNavigate('home')} className="min-w-40 bg-[#FF000F] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
            Về trang chủ
          </button>
        </div>
      </div>
    </section>
  )
}
