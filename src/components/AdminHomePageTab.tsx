import { useEffect, useMemo, useState } from 'react'
import { countProductsForTarget, defaultSupportButtons } from '@/data/siteData'
import type {
  HomeBenefitIcon,
  HomeBenefitItem,
  HomeCategoryItem,
  HomePageContent,
  ProductCategoryItem,
  ProductItem,
  SupportButtonItem,
} from '@/data/siteData'
import { uploadMedia } from '@/utils/mediaUpload'
import AdminIconPicker from '@/components/AdminIconPicker'

interface AdminHomePageTabProps {
  content: HomePageContent
  products: ProductItem[]
  productCategories: ProductCategoryItem[]
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

export default function AdminHomePageTab({ content, products, productCategories, onSave, showToast }: AdminHomePageTabProps) {
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

  const updateSupportButton = (index: number, patch: Partial<SupportButtonItem>) => {
    const list = draft.supportButtons || defaultSupportButtons
    const updated = list.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    updateDraft({ ...draft, supportButtons: updated })
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
                <label><span className={labelClass}>Số sản phẩm thực tế</span><output className={`${inputClass} block bg-gray-50 font-bold text-[#1B4C98]`}>{countProductsForTarget(products, productCategories, category.targetCategory)} sản phẩm</output></label>
                <label><span className={labelClass}>Bộ lọc khi bấm</span><select className={inputClass} value={category.targetCategory} onChange={(e) => updateCategory(index, { targetCategory: e.target.value })}><option value="all">Tất cả sản phẩm</option>{productCategories.map((item) => <optgroup key={item.id} label={item.label}><option value={item.id}>Tất cả {item.short}</option>{item.sub.map((sub) => <option key={sub.id} value={sub.id}>{sub.label}</option>)}</optgroup>)}</select></label>
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
        {draft.categories.length < 5 && <button type="button" onClick={() => updateDraft({ ...draft, categories: [...draft.categories, { id: `home-cat-${Date.now()}`, name: 'Danh mục mới', description: '', imageUrl: '', targetCategory: 'all', isActive: true }] })} className="border border-dashed border-[#1B4C98] px-4 py-2 text-xs font-bold text-[#1B4C98]">+ Thêm danh mục</button>}
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
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <label><span className={labelClass}>Tiêu đề khối</span><input className={inputClass} value={draft.whyTitle} onChange={(e) => updateDraft({ ...draft, whyTitle: e.target.value })} placeholder="VD: Tại sao chọn Viễn Đông?" /></label>
          <label><span className={labelClass}>Mô tả phụ</span><input className={inputClass} value={draft.whySubtitle} onChange={(e) => updateDraft({ ...draft, whySubtitle: e.target.value })} placeholder="VD: Đối tác tin cậy của hàng nghìn đại lý..." /></label>
        </div>

        <div className="space-y-4">
          {draft.benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm"
            >
              {/* Card Header: Badge & Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-[#1B4C98]/10 px-2.5 py-1 text-xs font-bold text-[#1B4C98]">
                    Lợi ích #{index + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {benefit.title || 'Chưa đặt tiêu đề'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={benefit.isActive}
                      onChange={(e) => updateBenefit(index, { isActive: e.target.checked })}
                      className="rounded border-gray-300 text-[#1B4C98] focus:ring-[#1B4C98]"
                    />
                    <span>{benefit.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}</span>
                  </label>

                  <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-0.5">
                    <button
                      type="button"
                      aria-label="Đưa lên"
                      title="Đưa lên"
                      disabled={index === 0}
                      onClick={() => moveItem('benefits', index, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded text-xs text-gray-600 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Đưa xuống"
                      title="Đưa xuống"
                      disabled={index === draft.benefits.length - 1}
                      onClick={() => moveItem('benefits', index, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded text-xs text-gray-600 transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="Xóa lợi ích"
                    title="Xóa lợi ích này"
                    onClick={() => updateDraft({ ...draft, benefits: draft.benefits.filter((_, itemIndex) => itemIndex !== index) })}
                    className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
                  >
                    <span>✕</span>
                    <span className="hidden sm:inline">Xóa</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <AdminIconPicker
                    label="Biểu tượng & Giao diện"
                    value={benefit.iconConfig}
                    legacyIcon={benefit.icon}
                    onToast={showToast}
                    onChange={(newConfig) => {
                      updateBenefit(index, {
                        iconConfig: newConfig,
                        icon: (newConfig.builtinName as HomeBenefitIcon) || benefit.icon || 'shield',
                      })
                    }}
                  />
                </div>

                <div className="md:col-span-7">
                  <label>
                    <span className={labelClass}>Tiêu đề chính</span>
                    <input
                      className={inputClass}
                      value={benefit.title}
                      onChange={(e) => updateBenefit(index, { title: e.target.value })}
                      placeholder="VD: Hàng chính hãng 100%"
                    />
                  </label>
                </div>

                <div className="md:col-span-12">
                  <label>
                    <span className={labelClass}>Nội dung mô tả (Bấm Enter để ngắt dòng hiển thị trên website)</span>
                    <textarea
                      rows={2}
                      className={`${inputClass} resize-y font-normal leading-relaxed`}
                      value={benefit.description}
                      onChange={(e) => updateBenefit(index, { description: e.target.value })}
                      placeholder="Nhập nội dung mô tả chi tiết..."
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        {draft.benefits.length < 6 && (
          <button
            type="button"
            onClick={() => updateDraft({ ...draft, benefits: [...draft.benefits, { id: `benefit-${Date.now()}`, title: 'Lợi ích mới', description: '', icon: 'shield', isActive: true }] })}
            className="mt-4 border border-dashed border-[#1B4C98] px-4 py-2 text-xs font-bold text-[#1B4C98] hover:bg-blue-50"
          >
            + Thêm lợi ích
          </button>
        )}
      </SectionCard>

      {/* SECTION 1: CTA BANNER ĐẠI LÝ */}
      <SectionCard title="Kêu gọi hợp tác đại lý (CTA Banner)" description="Banner kêu gọi hợp tác dành cho đại lý và nhà thầu ở gần cuối trang chủ.">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={labelClass}>Tiêu đề CTA</span>
            <input className={inputClass} value={draft.ctaTitle} onChange={(e) => updateDraft({ ...draft, ctaTitle: e.target.value })} placeholder="VD: ĐỒNG HÀNH CÙNG VIỄN ĐÔNG" />
          </label>
          <label>
            <span className={labelClass}>Mô tả CTA</span>
            <input className={inputClass} value={draft.ctaDescription} onChange={(e) => updateDraft({ ...draft, ctaDescription: e.target.value })} placeholder="VD: Tiếp cận toàn bộ danh mục ABB..." />
          </label>
          <label>
            <span className={labelClass}>Nhãn nút chính (Đỏ)</span>
            <input maxLength={32} className={inputClass} value={draft.ctaPrimaryLabel} onChange={(e) => updateDraft({ ...draft, ctaPrimaryLabel: e.target.value })} placeholder="VD: Đăng ký làm đại lý" />
          </label>
          <label>
            <span className={labelClass}>Link nút chính</span>
            <input className={inputClass} value={draft.ctaPrimaryUrl} onChange={(e) => updateDraft({ ...draft, ctaPrimaryUrl: e.target.value })} placeholder="mailto:..., tel:... hoặc https://..." />
          </label>
          <label>
            <span className={labelClass}>Nhãn nút phụ (Trắng viền)</span>
            <input maxLength={32} className={inputClass} value={draft.ctaSecondaryLabel} onChange={(e) => updateDraft({ ...draft, ctaSecondaryLabel: e.target.value })} placeholder="VD: Về Viễn Đông Electric" />
          </label>
          <label>
            <span className={labelClass}>Link nút phụ</span>
            <input className={inputClass} value={draft.ctaSecondaryUrl || ''} onChange={(e) => updateDraft({ ...draft, ctaSecondaryUrl: e.target.value })} placeholder="Để trống nếu dẫn tới trang Giới thiệu (/about)" />
          </label>
        </div>
      </SectionCard>

      {/* SECTION 2: KHỐI HỖ TRỢ & 4 NÚT TRỰC QUAN */}
      <SectionCard title="Khối Hỗ trợ khách hàng & Báo giá (Support Section)" description="Khối 4 nút hỗ trợ nổi bật ở cuối trang chủ. Cho phép chỉnh sửa tiêu đề, mô tả và toàn bộ nhãn, link, màu sắc, biểu tượng của 4 nút.">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <label>
            <span className={labelClass}>Tiêu đề hỗ trợ</span>
            <input className={inputClass} value={draft.supportTitle} onChange={(e) => updateDraft({ ...draft, supportTitle: e.target.value })} placeholder="VD: CHÚNG TÔI SẴN SÀNG HỖ TRỢ BẠN" />
          </label>
          <label>
            <span className={labelClass}>Mô tả hỗ trợ</span>
            <input className={inputClass} value={draft.supportDescription} onChange={(e) => updateDraft({ ...draft, supportDescription: e.target.value })} placeholder="VD: Hãy liên hệ với Viễn Đông nếu bạn cần tư vấn..." />
          </label>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase text-[#1B4C98]">Cấu hình 4 Nút Hỗ Trợ Trực Quan</h4>
              <p className="text-[11px] text-gray-500">Tùy chỉnh nhãn nút, link liên kết, màu nền và icon cho từng nút bấm</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const list = draft.supportButtons || defaultSupportButtons
                const newItem: SupportButtonItem = {
                  id: `support-${Date.now()}`,
                  label: 'Nút hỗ trợ mới',
                  href: '#',
                  bg: '#1B4C98',
                  textColor: '#ffffff',
                  isActive: true,
                  iconConfig: {
                    type: 'builtin',
                    builtinName: 'support',
                    size: 18,
                    showBox: false,
                    tint: true,
                  },
                }
                updateDraft({ ...draft, supportButtons: [...list, newItem] })
              }}
              className="border border-dashed border-[#1B4C98] px-3 py-1.5 text-xs font-bold text-[#1B4C98] hover:bg-blue-50"
            >
              + Thêm nút hỗ trợ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(draft.supportButtons || defaultSupportButtons).map((btn, index) => (
              <div key={btn.id || index} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1B4C98] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate max-w-[180px]">
                      {btn.label || `Nút #${index + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={btn.isActive !== false}
                        onChange={(e) => updateSupportButton(index, { isActive: e.target.checked })}
                        className="rounded border-gray-300 text-[#1B4C98]"
                      />
                      <span>Hiện</span>
                    </label>
                    {(draft.supportButtons || defaultSupportButtons).length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const list = draft.supportButtons || defaultSupportButtons
                          updateDraft({
                            ...draft,
                            supportButtons: list.filter((_, i) => i !== index),
                          })
                        }}
                        className="text-xs text-red-500 hover:text-red-700 ml-1 font-medium"
                      >
                        ✕ Xóa
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className={labelClass}>Nhãn hiển thị</span>
                    <input
                      className={inputClass}
                      value={btn.label}
                      onChange={(e) => updateSupportButton(index, { label: e.target.value })}
                      placeholder="VD: LIÊN HỆ QUA HOTLINE"
                    />
                  </div>
                  <div>
                    <span className={labelClass}>Link liên kết (tel:, https:, mailto:)</span>
                    <input
                      className={inputClass}
                      value={btn.href}
                      onChange={(e) => updateSupportButton(index, { href: e.target.value })}
                      placeholder="VD: tel:02839435276 hoặc https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                  <div>
                    <span className={labelClass}>Màu nền nút</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={btn.bg.startsWith('#') ? btn.bg : btn.bg.includes('red') ? '#FF000F' : '#1B4C98'}
                        onChange={(e) => updateSupportButton(index, { bg: e.target.value, textColor: e.target.value.toLowerCase() === '#f7f7f7' || e.target.value.toLowerCase() === '#ffffff' ? '#1a1a1a' : '#ffffff' })}
                        className="h-8 w-8 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                      />
                      <input
                        type="text"
                        value={btn.bg}
                        onChange={(e) => updateSupportButton(index, { bg: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 bg-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <AdminIconPicker
                      label="Biểu tượng nút"
                      value={btn.iconConfig}
                      onToast={showToast}
                      onChange={(newConfig) => updateSupportButton(index, { iconConfig: newConfig })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
