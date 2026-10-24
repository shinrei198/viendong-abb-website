import React from 'react'

interface AboutPageProps {
  onNavigate: (page: string, categoryId?: string) => void
}

const missionItems = [
  'Cung cấp các sản phẩm thiết bị điện chính hãng, đảm bảo chất lượng, an toàn và hiệu quả cho mọi công trình.',
  'Mang đến giải pháp điện toàn diện, giúp khách hàng tối ưu chi phí đầu tư và nâng cao hiệu suất vận hành.',
]

const coreValues = [
  {
    number: '01',
    title: 'Uy tín',
    description:
      'Luôn giữ vững cam kết với khách hàng và đối tác bằng việc cung cấp sản phẩm chính hãng, dịch vụ chuyên nghiệp và thực hiện đúng tiến độ trong mọi dự án.',
  },
  {
    number: '02',
    title: 'Chất lượng',
    description:
      'Lấy chất lượng sản phẩm và dịch vụ làm nền tảng phát triển, lựa chọn những thương hiệu thiết bị điện uy tín nhằm mang đến hiệu quả và độ an toàn cao nhất.',
  },
]

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="lg:col-span-3">
      <span className="text-xs font-semibold tracking-[0.2em] text-[#E31E24]">{number}</span>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[#1B4C98] sm:text-4xl">{title}</h2>
      <div className="mt-6 h-px w-12 bg-[#1B4C98]" />
    </div>
  )
}

function ContentCard({
  number,
  title,
  children,
}: {
  number: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-7 sm:p-9">
      <span className="text-xs font-semibold tracking-[0.2em] text-[#E31E24]">{number}</span>
      {title && <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-[#1B4C98]">{title}</h3>}
      <div className={title ? 'mt-5 border-t border-slate-200 pt-5' : 'mt-6'}>{children}</div>
    </article>
  )
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 text-sm sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-slate-500 transition-colors hover:text-[#1B4C98]"
          >
            Trang chủ
          </button>
          <svg
            aria-hidden="true"
            className="mx-3 h-3.5 w-3.5 text-slate-300"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="m7 4 6 6-6 6" />
          </svg>
          <span className="font-semibold text-[#1B4C98]">Giới thiệu Viễn Đông</span>
        </div>
      </div>

      <section className="relative overflow-hidden bg-[#1B4C98] text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.045)_100%)]" />
          <div className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute -right-2 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-white/10" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:px-8 lg:py-28">
          <div className="lg:col-span-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
              Công ty TNHH Thiết Bị Điện Viễn Đông
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Tầm nhìn · Sứ mệnh
              <span className="mt-2 block text-blue-200">Giá trị cốt lõi</span>
            </h1>
          </div>

          <div className="flex items-end lg:col-span-4 lg:justify-end">
            <div className="h-px w-full max-w-xs bg-gradient-to-r from-white/60 to-transparent lg:bg-gradient-to-l" />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-24">
          <SectionHeading number="01" title="Tầm nhìn" />

          <div className="lg:col-span-9">
            <p className="max-w-4xl text-xl font-medium leading-9 tracking-[-0.01em] text-slate-700 sm:text-2xl sm:leading-10">
              Công ty TNHH Thiết Bị Điện Viễn Đông hướng đến trở thành một trong những đơn vị phân phối
              thiết bị điện hàng đầu Việt Nam, là đối tác tin cậy của các chủ đầu tư, nhà thầu và doanh
              nghiệp trong việc cung cấp các giải pháp thiết bị điện chính hãng, chất lượng cao.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-24">
          <SectionHeading number="02" title="Sứ mệnh" />

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-9">
            {missionItems.map((item, index) => (
              <ContentCard key={item} number={`0${index + 1}`}>
                <p className="text-base font-medium leading-8 text-slate-700 sm:text-lg">{item}</p>
              </ContentCard>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-24">
          <SectionHeading number="03" title="Giá trị cốt lõi" />

          <div className="grid gap-5 md:grid-cols-2 lg:col-span-9">
            {coreValues.map((value) => (
              <ContentCard key={value.title} number={value.number} title={value.title}>
                <p className="text-base leading-8 text-slate-600 sm:text-lg">{value.description}</p>
              </ContentCard>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
