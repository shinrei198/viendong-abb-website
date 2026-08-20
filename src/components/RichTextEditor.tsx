import React, { useState, useRef, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết...',
  minHeight = '320px',
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html'>('editor')
  const editorRef = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<Range | null>(null)

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageCaptionInput, setImageCaptionInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkUrlInput, setLinkUrlInput] = useState('')
  const [linkTextInput, setLinkTextInput] = useState('')

  // Sync incoming value to contentEditable when not focused
  useEffect(() => {
    if (editorRef.current && activeTab === 'editor') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, activeTab])

  const saveCurrentSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus()
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(savedSelectionRef.current)
      }
    }
  }

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertQuote = () => {
    const quoteHtml = `
      <blockquote style="border-left: 4px solid #FF000F; padding: 16px 20px; background-color: #f8fafc; margin: 20px 0; font-style: italic; color: #334155;">
        <p style="margin: 0; font-size: 1.05rem; font-weight: 500;">"Nhập câu trích dẫn nổi bật tại đây..."</p>
        <cite style="display: block; margin-top: 8px; font-size: 0.85rem; color: #64748b; font-weight: 600; font-style: normal;">— Tên tác giả / Chức danh</cite>
      </blockquote>
      <p></p>
    `
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand('insertHTML', false, quoteHtml)
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setImageUrlInput(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOpenImageModal = () => {
    saveCurrentSelection()
    setImageUrlInput('')
    setImageCaptionInput('')
    setImageModalOpen(true)
  }

  const handleInsertImageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) {
      alert('Vui lòng chọn ảnh hoặc nhập URL hình ảnh')
      return
    }

    const caption = imageCaptionInput.trim()
    const imageHtml = `
      <figure style="margin: 24px 0; text-align: center;">
        <img src="${imageUrlInput}" alt="${caption}" style="max-width: 100%; height: auto; display: inline-block; border: 1px solid #e2e8f0; border-radius: 2px;" />
        ${
          caption
            ? `<figcaption style="font-size: 0.85rem; color: #64748b; margin-top: 8px; font-style: italic;">${caption}</figcaption>`
            : ''
        }
      </figure>
      <p></p>
    `

    if (editorRef.current) {
      restoreSelection()
      document.execCommand('insertHTML', false, imageHtml)
      onChange(editorRef.current.innerHTML)
    } else {
      onChange((value || '') + imageHtml)
    }

    setImageUrlInput('')
    setImageCaptionInput('')
    setImageModalOpen(false)
  }

  const handleOpenLinkModal = () => {
    saveCurrentSelection()
    setLinkUrlInput('')
    setLinkTextInput('')
    setLinkModalOpen(true)
  }

  const handleInsertLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrlInput.trim()) return

    const url = linkUrlInput.trim()
    const text = linkTextInput.trim() || url

    if (editorRef.current) {
      restoreSelection()
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1B4C98; font-weight: 600; text-decoration: underline;">${text}</a>`
      document.execCommand('insertHTML', false, linkHtml)
      onChange(editorRef.current.innerHTML)
    }

    setLinkUrlInput('')
    setLinkTextInput('')
    setLinkModalOpen(false)
  }

  const sampleImages = [
    { label: 'Tủ điện MCCB', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=450&fit=crop&auto=format' },
    { label: 'Hội thảo ABB', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop&auto=format' },
    { label: 'Công tắc Framia', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=450&fit=crop&auto=format' },
    { label: 'Trung tâm dữ liệu', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop&auto=format' },
  ]

  return (
    <div className="border border-gray-300 bg-white shadow-sm flex flex-col font-['Roboto'] relative">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[#f8fafc] border-b border-gray-200">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => exec('bold')}
            className="w-8 h-8 flex items-center justify-center font-bold rounded hover:bg-gray-200 text-gray-700 transition-colors"
            title="In đậm (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            className="w-8 h-8 flex items-center justify-center italic font-serif rounded hover:bg-gray-200 text-gray-700 transition-colors"
            title="In nghiêng (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            className="w-8 h-8 flex items-center justify-center underline rounded hover:bg-gray-200 text-gray-700 transition-colors"
            title="Gạch chân (Ctrl+U)"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            className="w-8 h-8 flex items-center justify-center line-through rounded hover:bg-gray-200 text-gray-700 transition-colors"
            title="Gạch ngang"
          >
            S
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Heading select */}
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h2>')}
            className="px-2 h-8 text-xs font-bold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1"
            title="Tiêu đề H2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h3>')}
            className="px-2 h-8 text-xs font-bold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1"
            title="Tiêu đề H3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<p>')}
            className="px-2 h-8 text-xs font-medium rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1"
            title="Đoạn văn thường"
          >
            P
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700"
            title="Danh sách gạch đầu dòng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700"
            title="Danh sách đánh số"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Quote */}
          <button
            type="button"
            onClick={insertQuote}
            className="px-2.5 h-8 text-xs font-semibold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1 border border-gray-300"
            title="Chèn khung trích dẫn nổi bật"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
            Khung Quote
          </button>

          {/* Image Dialog Trigger */}
          <button
            type="button"
            onClick={handleOpenImageModal}
            className="px-2.5 h-8 text-xs font-bold rounded bg-red-50 text-[#FF000F] hover:bg-red-100 flex items-center gap-1 border border-red-200 shadow-2xs"
            title="Chèn hình ảnh vào bài viết"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            + Chèn ảnh
          </button>

          {/* Link Dialog Trigger */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700"
            title="Chèn link liên kết"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700"
            title="Canh trái"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700"
            title="Canh giữa"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
            </svg>
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'editor'
                ? 'bg-[#1B4C98] text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Soạn thảo Word
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#1B4C98] text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Xem trước
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'html'
                ? 'bg-[#1B4C98] text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mã HTML
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === 'editor' && (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="p-4 outline-none prose max-w-none text-gray-800 focus:ring-0 overflow-y-auto leading-relaxed"
          data-placeholder={placeholder}
        />
      )}

      {/* Live Preview Mode */}
      {activeTab === 'preview' && (
        <div
          style={{ minHeight }}
          className="p-6 bg-white overflow-y-auto prose max-w-none text-gray-900 border-t border-gray-100"
          dangerouslySetInnerHTML={{
            __html:
              value ||
              '<p class="text-gray-400 italic">Chưa có nội dung bài viết...</p>',
          }}
        />
      )}

      {/* Raw HTML Mode */}
      {activeTab === 'html' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          className="w-full p-4 font-mono text-xs text-gray-800 bg-gray-50 outline-none resize-y border-none focus:ring-0"
          placeholder="Mã nguồn HTML của bài viết..."
        />
      )}

      {/* ── MODAL: CHÈN HÌNH ẢNH ──────────────────────────────────────────────── */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg border border-gray-300 shadow-2xl p-5 flex flex-col text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h4 className="text-sm font-bold text-[#1B4C98] uppercase flex items-center gap-1.5">
                <span>🖼️</span> Chèn hình ảnh vào nội dung bài viết
              </h4>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2">
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`px-3 py-1.5 text-xs font-bold rounded ${
                  imageTab === 'url' ? 'bg-[#1B4C98] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dán URL hình ảnh
              </button>
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`px-3 py-1.5 text-xs font-bold rounded ${
                  imageTab === 'upload' ? 'bg-[#1B4C98] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tải ảnh từ máy tính 📁
              </button>
            </div>

            <form onSubmit={handleInsertImageSubmit} className="space-y-4">
              {imageTab === 'url' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Đường dẫn hình ảnh (URL) (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                  {/* Sample presets */}
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Ảnh mẫu tham khảo:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleImages.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setImageUrlInput(s.url)}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-[#FF000F] border border-gray-200 transition-colors"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Chọn tệp hình ảnh từ máy tính (PNG, JPG, WEBP):
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-dashed border-gray-400 bg-gray-50 cursor-pointer text-xs"
                  />
                  {imageUrlInput && (
                    <div className="mt-2 p-2 bg-gray-100 border text-center">
                      <p className="text-[10px] text-green-700 font-bold mb-1">✓ Đã tải ảnh sẵn sàng:</p>
                      <img src={imageUrlInput} alt="Preview" className="max-h-28 mx-auto object-contain border" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Chú thích hình ảnh (Caption bên dưới ảnh - Không bắt buộc):
                </label>
                <input
                  type="text"
                  value={imageCaptionInput}
                  onChange={(e) => setImageCaptionInput(e.target.value)}
                  placeholder="Ví dụ: Cận cảnh thiết bị đóng cắt MCB ABB tại tủ điện phân phối"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#FF000F] hover:opacity-90 transition-opacity"
                >
                  Chèn vào bài viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHÈN LINK ────────────────────────────────────────────────── */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md border border-gray-300 shadow-2xl p-5 flex flex-col text-xs">
            <h4 className="text-sm font-bold text-[#1B4C98] uppercase pb-2 border-b border-gray-200 mb-4">
              Chèn đường dẫn liên kết (Link)
            </h4>
            <form onSubmit={handleInsertLinkSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Văn bản hiển thị:</label>
                <input
                  type="text"
                  value={linkTextInput}
                  onChange={(e) => setLinkTextInput(e.target.value)}
                  placeholder="Ví dụ: Xem chi tiết sản phẩm tại đây"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Địa chỉ web (URL) (*):</label>
                <input
                  type="text"
                  required
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#1B4C98] hover:opacity-90"
                >
                  Chèn link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
