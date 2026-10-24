import type { AboutPageContent } from '@/data/siteData'

interface AdminAboutTabProps {
  content: AboutPageContent
  onChange: (content: AboutPageContent) => void
  onSave: () => void
}

const inputClass = 'mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#1B4C98]'
const labelClass = 'text-xs font-bold text-slate-700'

export default function AdminAboutTab({ content, onChange, onSave }: AdminAboutTabProps) {
  const patch = (value: Partial<AboutPageContent>) => onChange({ ...content, ...value })

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF000F]">Content</p><h2 className="mt-1 text-xl font-bold text-[#1B4C98]">Nội dung Giới thiệu</h2></div>
        <button onClick={onSave} className="bg-[#FF000F] px-5 py-2.5 text-sm font-bold text-white">Lưu nội dung</button>
      </div>

      <div className="grid gap-4 border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <label className={labelClass}>Tên doanh nghiệp<input className={inputClass} value={content.companyEyebrow} onChange={(event) => patch({ companyEyebrow: event.target.value })} /></label>
        <label className={labelClass}>Dòng nhấn hero<input className={inputClass} value={content.heroAccent} onChange={(event) => patch({ heroAccent: event.target.value })} /></label>
        <label className={`${labelClass} md:col-span-2`}>Tiêu đề hero<input className={inputClass} value={content.heroTitle} onChange={(event) => patch({ heroTitle: event.target.value })} /></label>
        <label className={`${labelClass} md:col-span-2`}>Tầm nhìn<textarea rows={5} className={inputClass} value={content.vision} onChange={(event) => patch({ vision: event.target.value })} /></label>
      </div>

      <div className="border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-[#1B4C98]">Sứ mệnh</h3>
        <div className="space-y-3">
          {content.missionItems.map((item, index) => (
            <label key={index} className={labelClass}>Nội dung {index + 1}<textarea rows={3} className={inputClass} value={item} onChange={(event) => { const missionItems = [...content.missionItems]; missionItems[index] = event.target.value; patch({ missionItems }) }} /></label>
          ))}
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-[#1B4C98]">Giá trị cốt lõi</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {content.coreValues.map((value, index) => (
            <div key={index} className="space-y-3 border border-slate-200 bg-slate-50 p-4">
              <label className={labelClass}>Tiêu đề<input className={inputClass} value={value.title} onChange={(event) => { const coreValues = [...content.coreValues]; coreValues[index] = { ...value, title: event.target.value }; patch({ coreValues }) }} /></label>
              <label className={labelClass}>Mô tả<textarea rows={5} className={inputClass} value={value.description} onChange={(event) => { const coreValues = [...content.coreValues]; coreValues[index] = { ...value, description: event.target.value }; patch({ coreValues }) }} /></label>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
