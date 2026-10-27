import React, { useState, useRef } from 'react'
import type { CustomIconConfig, IconPosition, IconBoxShape, IconSourceType } from '@/types/icon'
import CmsIcon, { BUILTIN_ICONS, resolveIconConfig } from '@/components/CmsIcon'
import { uploadMedia } from '@/utils/mediaUpload'
import { sanitizeSvg } from '@/utils/sanitize'

interface AdminIconPickerProps {
  value?: CustomIconConfig
  legacyIcon?: string
  onChange: (config: CustomIconConfig) => void
  onToast?: (msg: string) => void
  label?: string
}

export default function AdminIconPicker({
  value,
  legacyIcon,
  onChange,
  onToast,
  label = 'Biểu tượng',
}: AdminIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<IconSourceType>(value?.type || 'builtin')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const svgFileInputRef = useRef<HTMLInputElement>(null)

  const currentConfig = resolveIconConfig(legacyIcon, value)

  const handleUpdate = (patch: Partial<CustomIconConfig>) => {
    onChange({
      ...currentConfig,
      ...patch,
    })
  }

  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      onToast?.('Vui lòng chọn file định dạng .svg')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const cleaned = sanitizeSvg(content)
        handleUpdate({
          type: 'svg',
          svgMarkup: cleaned,
          tint: true,
        })
        setActiveTab('svg')
        onToast?.('Đã tải và làm sạch file SVG.')
      }
    }
    reader.onerror = () => onToast?.('Không đọc được file SVG.')
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadMedia(file, { folder: 'homepage', maxWidth: 512, maxHeight: 512 })
      handleUpdate({
        type: 'image',
        imageUrl: result.url,
        showBox: false, // Default images look best without background box or with transparent
      })
      setActiveTab('image')
      onToast?.(`Đã tải ảnh lên (${Math.round(result.bytes / 1024)} KB)`)
    } catch (err) {
      onToast?.(err instanceof Error ? err.message : 'Tải ảnh thất bại')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const getSourceLabel = () => {
    if (currentConfig.type === 'svg') return 'SVG tùy chỉnh'
    if (currentConfig.type === 'image') return 'Ảnh riêng'
    const found = BUILTIN_ICONS.find((i) => i.id === currentConfig.builtinName)
    return found ? found.label.split('(')[0].trim() : 'Có sẵn'
  }

  return (
    <div className="w-full">
      {label && <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</span>}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full items-center justify-between gap-2.5 rounded-lg border border-gray-300 bg-white p-2 text-left shadow-xs transition-all hover:border-[#1B4C98] hover:bg-blue-50/20"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-800 group-hover:border-blue-200 group-hover:bg-blue-50/50">
            <CmsIcon config={currentConfig} overrideSize={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-800">{getSourceLabel()}</p>
            <p className="truncate text-[10px] text-gray-400">
              {currentConfig.size}px • {currentConfig.showBox ? `${currentConfig.boxSize}px box` : 'Không nền'} • {currentConfig.position}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 rounded bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 group-hover:bg-[#1B4C98] group-hover:text-white transition-colors">
          Đổi icon ✎
        </span>
      </button>

      {/* Modal chỉnh sửa icon */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Tùy biến Biểu tượng & Giao diện</h3>
                <p className="text-xs text-gray-500">Tự do đổi hình ảnh, kích thước, ô nền và vị trí hiển thị</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* LIVE PREVIEW SECTION */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Xem trước trực tiếp</span>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {/* Preview on Red */}
                  <div
                    className="flex flex-col rounded-lg p-5"
                    style={{ background: 'var(--red, #FF000F)', color: 'white' }}
                  >
                    <span className="text-[10px] font-semibold opacity-75 mb-2">Trên thẻ nền đỏ:</span>
                    <div className="flex items-center justify-center min-h-[90px] border border-white/20 rounded-md bg-white/5 p-2">
                      <CmsIcon config={currentConfig} inverted={true} />
                    </div>
                  </div>

                  {/* Preview on White */}
                  <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 text-gray-900">
                    <span className="text-[10px] font-semibold text-gray-400 mb-2">Trên thẻ nền trắng:</span>
                    <div className="flex items-center justify-center min-h-[90px] border border-gray-200 rounded-md bg-gray-50/50 p-2">
                      <CmsIcon config={currentConfig} inverted={false} />
                    </div>
                  </div>
                </div>
              </div>

              {/* TABS: BUILTIN / SVG / IMAGE */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Nguồn biểu tượng</span>
                <div className="mt-2 flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('builtin')
                      handleUpdate({ type: 'builtin' })
                    }}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      activeTab === 'builtin'
                        ? 'bg-white text-[#1B4C98] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Icon có sẵn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('svg')
                      handleUpdate({ type: 'svg' })
                    }}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      activeTab === 'svg'
                        ? 'bg-white text-[#1B4C98] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tải file SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('image')
                      handleUpdate({ type: 'image' })
                    }}
                    className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      activeTab === 'image'
                        ? 'bg-white text-[#1B4C98] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Ảnh PNG / JPG / WebP
                  </button>
                </div>

                {/* TAB 1: BUILTIN GRID */}
                {activeTab === 'builtin' && (
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-500 mb-2">Chọn nhanh một biểu tượng chuyên nghiệp từ thư viện:</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                      {BUILTIN_ICONS.map((item) => {
                        const isSelected = currentConfig.type === 'builtin' && currentConfig.builtinName === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            title={item.label}
                            onClick={() => handleUpdate({ type: 'builtin', builtinName: item.id })}
                            className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition-all ${
                              isSelected
                                ? 'border-[#1B4C98] bg-blue-50 text-[#1B4C98] ring-2 ring-[#1B4C98]/20'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                              <path d={item.path} />
                            </svg>
                            <span className="line-clamp-1 text-[9px] font-medium leading-none">{item.label.split('(')[0]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: SVG UPLOAD / PASTE */}
                {activeTab === 'svg' && (
                  <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Tải lên file SVG</p>
                        <p className="text-[11px] text-gray-500">Vector sắc nét, tự động lọc sạch mã độc an toàn</p>
                      </div>
                      <input
                        ref={svgFileInputRef}
                        type="file"
                        accept=".svg,image/svg+xml"
                        className="hidden"
                        onChange={handleSvgFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => svgFileInputRef.current?.click()}
                        className="rounded-md border border-[#1B4C98] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B4C98] shadow-xs hover:bg-blue-50"
                      >
                        Chọn file .SVG từ máy ⇧
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Hoặc dán trực tiếp mã &lt;svg&gt;...&lt;/svg&gt; vào đây:
                      </label>
                      <textarea
                        rows={3}
                        value={currentConfig.svgMarkup || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          handleUpdate({
                            type: 'svg',
                            svgMarkup: sanitizeSvg(val),
                          })
                        }}
                        placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                        className="w-full rounded-md border border-gray-300 bg-white p-2 font-mono text-[11px] text-gray-800 focus:border-[#1B4C98] focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentConfig.tint !== false}
                        onChange={(e) => handleUpdate({ tint: e.target.checked })}
                        className="rounded border-gray-300 text-[#1B4C98] focus:ring-[#1B4C98]"
                      />
                      Tự động đổi màu theo nền thẻ (Trắng trên nền đỏ / Đen trên nền trắng)
                    </label>
                  </div>
                )}

                {/* TAB 3: IMAGE UPLOAD / URL */}
                {activeTab === 'image' && (
                  <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Tải ảnh biểu tượng (PNG / WebP / JPG)</p>
                        <p className="text-[11px] text-gray-500">Khuyên dùng ảnh nền trong suốt (transparent PNG/WebP)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-md border border-[#1B4C98] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B4C98] shadow-xs hover:bg-blue-50 disabled:opacity-50"
                      >
                        {isUploading ? 'Đang tải lên...' : 'Tải ảnh từ máy ⇧'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Hoặc dán đường dẫn ảnh trực tiếp:
                      </label>
                      <input
                        type="text"
                        value={currentConfig.imageUrl || ''}
                        onChange={(e) => handleUpdate({ type: 'image', imageUrl: e.target.value })}
                        placeholder="https://... hoặc /media/..."
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-[#1B4C98] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONTROLS: SIZE, BOX, POSITION */}
              <div className="border-t border-gray-200 pt-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tùy chỉnh Kích thước & Bố cục</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Icon Size Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">Kích thước biểu tượng</label>
                      <span className="text-xs font-bold text-[#1B4C98]">{currentConfig.size}px</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={64}
                      step={2}
                      value={currentConfig.size}
                      onChange={(e) => handleUpdate({ size: Number(e.target.value) })}
                      className="w-full accent-[#1B4C98]"
                    />
                  </div>

                  {/* Box Size Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">Kích thước khung nền</label>
                      <span className="text-xs font-bold text-[#1B4C98]">{currentConfig.boxSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={32}
                      max={80}
                      step={2}
                      disabled={!currentConfig.showBox}
                      value={currentConfig.boxSize}
                      onChange={(e) => handleUpdate({ boxSize: Number(e.target.value) })}
                      className="w-full accent-[#1B4C98] disabled:opacity-30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Show box & shape */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentConfig.showBox}
                        onChange={(e) => handleUpdate({ showBox: e.target.checked })}
                        className="rounded border-gray-300 text-[#1B4C98] focus:ring-[#1B4C98]"
                      />
                      Hiển thị ô nền mờ phía sau biểu tượng
                    </label>

                    {currentConfig.showBox && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-gray-500 mr-1">Hình dáng:</span>
                        {(['square', 'rounded', 'circle'] as IconBoxShape[]).map((shape) => (
                          <button
                            key={shape}
                            type="button"
                            onClick={() => handleUpdate({ boxShape: shape })}
                            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
                              currentConfig.boxShape === shape
                                ? 'bg-[#1B4C98] text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {shape === 'square' ? 'Vuông' : shape === 'rounded' ? 'Bo góc' : 'Tròn'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Vị trí đặt trong thẻ</label>
                    <div className="flex items-center gap-1.5">
                      {(
                        [
                          { id: 'top-left', label: 'Góc trên trái' },
                          { id: 'top-center', label: 'Ở giữa trên' },
                          { id: 'inline-left', label: 'Cạnh tiêu đề' },
                        ] as { id: IconPosition; label: string }[]
                      ).map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => handleUpdate({ position: pos.id })}
                          className={`flex-1 rounded px-2 py-1.5 text-[11px] font-medium transition-all text-center ${
                            currentConfig.position === pos.id
                              ? 'bg-[#1B4C98] text-white shadow-xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 rounded-b-xl">
              <button
                type="button"
                onClick={() => {
                  handleUpdate({
                    type: 'builtin',
                    builtinName: legacyIcon || 'shield',
                    svgMarkup: '',
                    imageUrl: '',
                    tint: true,
                    size: 28,
                    boxSize: 48,
                    showBox: true,
                    boxShape: 'square',
                    position: 'top-left',
                  })
                  onToast?.('Đã đặt lại biểu tượng mặc định.')
                }}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                ↺ Đặt lại mặc định
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-[#1B4C98] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#153b75] transition-colors"
              >
                Hoàn tất & Đóng ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
