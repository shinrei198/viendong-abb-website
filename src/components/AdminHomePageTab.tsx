import { useEffect, useMemo, useState } from 'react'
import type {
  HomeBenefitIcon,
  HomeBenefitItem,
  HomeCategoryItem,
  HomePageContent,
  ProductItem,
} from '@/data/siteData'
import { uploadMedia } from '@/utils/mediaUpload'

interface AdminHomePageTabProps {
  content: HomePageContent
  products: ProductItem[]
  onSave: (content: HomePageContent) => void
  showToast: (message: string) => void
}

const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-[#1B4C98] focus:outline-none focus:ring-1 focus:ring-[#1B4C98]/20'
const labelClass = 'mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500'

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
        <h3 className="text-sm font-bold uppercase text-[#1B4C98]">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  )
}

export default function AdminHomePageTab({ content, products, onSave, showToast }: AdminHomePageTabProps) {
  const [draft, setDraft] = useState<HomePageContent>(content)
  const [isDirty, setIsDirty] = useState(false)
  const [uploadingCategory, setUploadingCategory] = useState<number | null>(null)

  useEffect(() => {
    if (!isDirty) setDraft(content)
  }, [content, isDirty])

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => `${a.series} ${a.name}`.localeCompare(`${b.series} ${b.name}`, 'vi')),
    [products],
  )

  const updateDraft = (next: HomePageContent) => {
    setDraft(next)
    setIsDirty(true)
  }

  const updateCategory = (index: number, patch: Partial<HomeCategoryItem>) => {
    const categories = draft.categories.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    updateDraft({ ...draft, categories })
  }

  const updateBenefit = (index: number, patch: Partial<HomeBenefitItem>) => {
    const benefits = draft.benefits.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    updateDraft({ ...draft, benefits })
  }

  const moveItem = (key: 'categories' | 'benefits', index: number, direction: -1 | 1) => {
    const items = [...draft[key]]
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    ;[items[index], items[nextIndex]] = [items[nextIndex], items[index]]
    updateDraft({ ...draft, [key]: items })
  }

  const save = () => {
    const cleaned: HomePageContent = {
      ...draft,
      categories: draft.categories.filter((item) => item.name.trim()),
      benefits: draft.benefits.filter((item) => item.title.trim()),
      featuredProductIds: [...new Set(draft.featuredProductIds.filter(Boolean))].slice(0, 6),
    }
    onSave(cleaned)
    setDraft(cleaned)
    setIsDirty(false)
    showToast('✓ Đã lưu nội dung trang chủ!')
  }

  return (
    <div className="space-y-5 pb-32">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold uppercase text-[#1B4C98]">Biên tập Trang chủ</h2>
          <p className="text-xs text-gray-500">Quản lý nội dung hiển thị mà không cần sửa code. Banner, video và tin tức vẫn dùng các tab riêng.</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDirty ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
          <span className={`h-2 w-2 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          {isDirty ? 'Có thay đổi chưa lưu' : 'Đã đồng bộ'}
        </span>
      </div>

      <SectionCard title="Thanh xác thực ABB" description="Hai dòng giới thiệu ngay bên dưới banner chính.">
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className={labelClass}>Dòng chính</span><input className={inputClass} value={draft.partnerTitle} onChange={(e) => updateDraft({ ...draft, partnerTitle: e.target.value })} /></label>
          <label><span className={labelClass}>Dòng phụ</span><input className={inputClass} value={draft.partnerSubtitle} onChange={(e) => updateDraft({ ...draft, partnerSubtitle: e.target.value })} /></label>
        </div>
      </SectionCard>

      <SectionCard title="Danh mục nổi bật" description="Tối đa 5 thẻ được hiển thị. Thẻ đầu tiên là thẻ lớn; có thể đổi thứ tự và đường dẫn lọc sản phẩm.">
        <label><span className={labelClass}>Tiêu đề khu vực</span><input className={inputClass} value={draft.categorySectionTitle} onChange={(e) => updateDraft({ ...draft, categorySectionTitle: e.target.value })} /></label>
        <div className="space-y-3">
          {draft.categories.map((category, index) => (
            <div key={category.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1B4C98] text-[10px] font-bold text-white">{index + 1}</span>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700"><input type="checkbox" checked={category.isActive} onChange={(e) => updateCategory(index, { isActive: e.target.checked })} /> Hiển thị</label>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" aria-label="Đưa danh mục lên" title="Đưa lên" disabled={index === 0} onClick={() => moveItem('categories', index, -1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-[11px] text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30">▲</button>
                  <button type="button" aria-label="Đưa danh mục xuống" title="Đưa xuống" disabled={index === draft.categories.length - 1} onClick={() => moveItem('categories', index, 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-[11px] text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30">▼</button>
                  <button type="button" aria-label="Xóa danh mục" title="Xóa" onClick={() => updateDraft({ ...draft, categories: draft.categories.filter((_, itemIndex) => itemIndex !== index) })} className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">×</button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <label><span className={labelClass}>Tên danh mục</span><input className={inputClass} value={category.name} onChange={(e) => updateCategory(index, { name: e.target.value })} /></label>
                <label><span className={labelClass}>Mô tả</span><input className={inputClass} value={category.description} onChange={(e) => updateCategory(index, { description: e.target.value })} /></label>
                <label><span className={labelClass}>Số sản phẩm</span><input type="number" min="0" className={inputClass} value={category.count} onChange={(e) => updateCategory(index, { count: Math.max(0, Number(e.target.value) || 0) })} /></label>
                <label><span className={labelClass}>Bộ lọc khi bấm</span><select className={inputClass} value={category.targetCategory} onChange={(e) => updateCategory(index, { targetCategory: e.target.value })}><option value="all">Tất cả</option><option value="faceplate">Mặt che</option><option value="socket">Ổ cắm</option><option value="switch">Công tắc</option><option value="media-socket">Ổ cắm media</option><option value="accessories">Phụ kiện</option><option value="breaker">Cầu dao</option></select></label>
              </div>
              <div className="mt-3">
                <span className={labelClass}>Ảnh danh mục (để trống sẽ dùng ảnh mặc định)</span>
                <div className="flex gap-2">
                  <input className={inputClass} value={category.imageUrl} onChange={(e) => updateCategory(index, { imageUrl: e.target.value })} placeholder="https://... hoặc /media/..." />
                  <label className="flex min-w-[88px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-[#1B4C98] transition-colors hover:bg-blue-100">
                    {uploadingCategory === index ? 'Đang tải...' : 'Tải ảnh'}
                    <input
                      type="file"
                      accept="image/*,.tif,.tiff"
                      disabled={uploadingCategory !== null}
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        setUploadingCategory(index)
                        try {
                          const result = await uploadMedia(file, { folder: 'homepage', maxWidth: 1800, maxHeight: 1200 })
                          updateCategory(index, { imageUrl: result.url })
                          showToast(`Đã tải ảnh WebP (${Math.round(result.bytes / 1024)} KB).`)
                        } catch (error) {
                          showToast(error instanceof Error ? error.message : 'Không thể tải ảnh lên.')
                        } finally {
                          setUploadingCategory(null)
                          event.target.value = ''
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        {draft.categories.length < 5 && <button type="button" onClick={() => updateDraft({ ...draft, categories: [...draft.categories, { id: `home-cat-${Date.now()}`, name: 'Danh mục mới', description: '', count: 0, imageUrl: '', targetCategory: 'all', isActive: true }] })} className="border border-dashed border-[#1B4C98] px-4 py-2 text-xs font-bold text-[#1B4C98]">+ Thêm danh mục</button>}
      </SectionCard>

      <SectionCard title="Sản phẩm nổi bật" description="Chọn tối đa 6 sản phẩm thật từ database. Ảnh, tên và SKU sẽ tự lấy theo biến thể đang bật đầu tiên.">
        <label><span className={labelClass}>Tiêu đề khu vực</span><input className={inputClass} value={draft.featuredSectionTitle} onChange={(e) => updateDraft({ ...draft, featuredSectionTitle: e.target.value })} /></label>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <label key={index}><span className={labelClass}>Vị trí {index + 1}</span><select className={inputClass} value={draft.featuredProductIds[index] || ''} onChange={(e) => { const ids = [...draft.featuredProductIds]; ids[index] = e.target.value; updateDraft({ ...draft, featuredProductIds: ids }) }}><option value="">— Không hiển thị —</option>{sortedProducts.map((product) => <option key={product.id} value={product.id}>{product.series} · {product.name} · {product.baseSku}</option>)}</select></label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Tiêu đề nội dung động" description="Video và bài viết vẫn được quản lý trong tab tương ứng; tại đây chỉ đổi tiêu đề khu vực.">
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className={labelClass}>Video</span><input className={inputClass} value={draft.videoSectionTitle} onChange={(e) => updateDraft({ ...draft, videoSectionTitle: e.target.value })} /></label>
          <label><span className={labelClass}>Tin tức</span><input className={inputClass} value={draft.newsSectionTitle} onChange={(e) => updateDraft({ ...draft, newsSectionTitle: e.target.value })} /></label>
        </div>
      </SectionCard>

      <SectionCard title="Lý do chọn Viễn Đông" description="Có thể đổi nội dung, biểu tượng, trạng thái và thứ tự từng lợi ích.">
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className={labelClass}>Tiêu đề</span><input className={inputClass} value={draft.whyTitle} onChange={(e) => updateDraft({ ...draft, whyTitle: e.target.value })} /></label>
          <label><span className={labelClass}>Mô tả</span><input className={inputClass} value={draft.whySubtitle} onChange={(e) => updateDraft({ ...draft, whySubtitle: e.target.value })} /></label>
        </div>
        <div className="space-y-3">
          {draft.benefits.map((benefit, index) => (
            <div key={benefit.id} className="grid items-end gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[140px_1fr_2fr_auto]">
              <label><span className={labelClass}>Biểu tượng</span><select className={inputClass} value={benefit.icon} onChange={(e) => updateBenefit(index, { icon: e.target.value as HomeBenefitIcon })}><option value="shield">Chính hãng</option><option value="truck">Giao hàng</option><option value="support">Hỗ trợ</option><option value="price">Giá/chiết khấu</option></select></label>
              <label><span className={labelClass}>Tiêu đề</span><input className={inputClass} value={benefit.title} onChange={(e) => updateBenefit(index, { title: e.target.value })} /></label>
              <label><span className={labelClass}>Mô tả</span><input className={inputClass} value={benefit.description} onChange={(e) => updateBenefit(index, { description: e.target.value })} /></label>
              <div className="flex items-center gap-1.5"><label className="mr-2 flex items-center gap-1 text-xs"><input type="checkbox" checked={benefit.isActive} onChange={(e) => updateBenefit(index, { isActive: e.target.checked })} /> Hiện</label><button type="button" aria-label="Đưa lợi ích lên" title="Đưa lên" disabled={index === 0} onClick={() => moveItem('benefits', index, -1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-[11px] text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30">▲</button><button type="button" aria-label="Đưa lợi ích xuống" title="Đưa xuống" disabled={index === draft.benefits.length - 1} onClick={() => moveItem('benefits', index, 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-[11px] text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30">▼</button><button type="button" aria-label="Xóa lợi ích" title="Xóa" onClick={() => updateDraft({ ...draft, benefits: draft.benefits.filter((_, itemIndex) => itemIndex !== index) })} className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">×</button></div>
            </div>
          ))}
        </div>
        {draft.benefits.length < 6 && <button type="button" onClick={() => updateDraft({ ...draft, benefits: [...draft.benefits, { id: `benefit-${Date.now()}`, title: 'Lợi ích mới', description: '', icon: 'shield', isActive: true }] })} className="border border-dashed border-[#1B4C98] px-4 py-2 text-xs font-bold text-[#1B4C98]">+ Thêm lợi ích</button>}
      </SectionCard>

      <SectionCard title="Kêu gọi hợp tác & Hỗ trợ" description="Nội dung CTA đại lý và phần liên hệ ở cuối trang chủ.">
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className={labelClass}>Tiêu đề CTA</span><input className={inputClass} value={draft.ctaTitle} onChange={(e) => updateDraft({ ...draft, ctaTitle: e.target.value })} /></label>
          <label><span className={labelClass}>Mô tả CTA</span><input className={inputClass} value={draft.ctaDescription} onChange={(e) => updateDraft({ ...draft, ctaDescription: e.target.value })} /></label>
          <label><span className={labelClass}>Nhãn nút chính</span><input maxLength={28} className={inputClass} value={draft.ctaPrimaryLabel} onChange={(e) => updateDraft({ ...draft, ctaPrimaryLabel: e.target.value })} /></label>
          <label><span className={labelClass}>Link nút chính</span><input className={inputClass} value={draft.ctaPrimaryUrl} onChange={(e) => updateDraft({ ...draft, ctaPrimaryUrl: e.target.value })} placeholder="mailto:..., tel:... hoặc https://..." /></label>
          <label><span className={labelClass}>Nhãn nút giới thiệu</span><input maxLength={28} className={inputClass} value={draft.ctaSecondaryLabel} onChange={(e) => updateDraft({ ...draft, ctaSecondaryLabel: e.target.value })} /></label>
          <div />
          <label><span className={labelClass}>Tiêu đề hỗ trợ</span><input className={inputClass} value={draft.supportTitle} onChange={(e) => updateDraft({ ...draft, supportTitle: e.target.value })} /></label>
          <label><span className={labelClass}>Mô tả hỗ trợ</span><input className={inputClass} value={draft.supportDescription} onChange={(e) => updateDraft({ ...draft, supportDescription: e.target.value })} /></label>
        </div>
      </SectionCard>

      <div className="fixed bottom-5 left-4 right-4 z-40 flex justify-end sm:left-auto sm:right-7">
        <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:w-auto sm:min-w-[340px]">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trang chủ</p>
            <p className={`truncate text-xs font-semibold ${isDirty ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isDirty ? 'Đang có nội dung cần lưu' : 'Mọi thay đổi đã được lưu'}
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!isDirty}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#FF000F] px-5 py-3 text-xs font-bold uppercase text-white shadow-lg transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <span aria-hidden="true">✓</span>
            Lưu trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
