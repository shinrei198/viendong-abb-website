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

  // Image modal & crop state
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageCaptionInput, setImageCaptionInput] = useState('')
  const [imageWidthPercent, setImageWidthPercent] = useState<number>(70)
  const [editingImageElement, setEditingImageElement] = useState<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Advanced Image Cropper / Editor states
  const [isCropping, setIsCropping] = useState(false)
  const [cropAspectRatio, setCropAspectRatio] = useState<'free' | '16:9' | '4:3' | '1:1' | '2:3'>('free')
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({ x: 10, y: 10, width: 80, height: 80 })
  const [appliedCrop, setAppliedCrop] = useState<{ isCropped: boolean; x: number; y: number; width: number; height: number } | null>(null)
  const [cropAction, setCropAction] = useState<string | null>(null) // 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; box: { x: number; y: number; width: number; height: number }; containerW: number; containerH: number } | null>(null)
  const cropContainerRef = useRef<HTMLDivElement>(null)
  const cropImageRef = useRef<HTMLImageElement>(null)

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

  // Global mousemove & mouseup listeners for Crop Box resizing & dragging
  useEffect(() => {
    if (!cropAction || !dragStart || !cropContainerRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const { mouseX, mouseY, box, containerW, containerH } = dragStart
      if (containerW <= 0 || containerH <= 0) return

      const deltaXPercent = ((e.clientX - mouseX) / containerW) * 100
      const deltaYPercent = ((e.clientY - mouseY) / containerH) * 100

      let newX = box.x
      let newY = box.y
      let newW = box.width
      let newH = box.height

      if (cropAction === 'move') {
        newX = Math.max(0, Math.min(100 - box.width, box.x + deltaXPercent))
        newY = Math.max(0, Math.min(100 - box.height, box.y + deltaYPercent))
      } else {
        // Handle resizing
        if (cropAction.includes('e')) {
          newW = Math.max(10, Math.min(100 - box.x, box.width + deltaXPercent))
        }
        if (cropAction.includes('s')) {
          newH = Math.max(10, Math.min(100 - box.y, box.height + deltaYPercent))
        }
        if (cropAction.includes('w')) {
          const maxLeftShift = box.x + box.width - 10
          newX = Math.max(0, Math.min(maxLeftShift, box.x + deltaXPercent))
          newW = box.width - (newX - box.x)
        }
        if (cropAction.includes('n')) {
          const maxTopShift = box.y + box.height - 10
          newY = Math.max(0, Math.min(maxTopShift, box.y + deltaYPercent))
          newH = box.height - (newY - box.y)
        }

        // Apply aspect ratio lock if not free
        if (cropAspectRatio !== 'free' && cropImageRef.current) {
          const img = cropImageRef.current
          const imgRatio = (img.naturalWidth || 1) / (img.naturalHeight || 1)
          let targetRatio = 1
          if (cropAspectRatio === '16:9') targetRatio = 16 / 9
          if (cropAspectRatio === '4:3') targetRatio = 4 / 3
          if (cropAspectRatio === '1:1') targetRatio = 1
          if (cropAspectRatio === '2:3') targetRatio = 2 / 3

          const requiredH = (newW / targetRatio) * imgRatio
          if (newY + requiredH <= 100) {
            newH = requiredH
          } else {
            newH = 100 - newY
            newW = (newH * targetRatio) / imgRatio
          }
        }
      }

      setCropBox({
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY)),
        width: Math.max(10, Math.min(100, newW)),
        height: Math.max(10, Math.min(100, newH)),
      })
    }

    const handleMouseUp = () => {
      setCropAction(null)
      setDragStart(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [cropAction, dragStart, cropAspectRatio])

  // Lắng nghe sự kiện Double Click vào ảnh trong bài viết để mở modal Cập nhật
  const handleEditorDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target && (target.tagName === 'IMG' || target.closest('figure'))) {
      const figure = target.closest('figure')
      const img = figure ? figure.querySelector('img') : (target.tagName === 'IMG' ? (target as HTMLImageElement) : null)
      if (!img) return

      setEditingImageElement(img)
      setImageUrlInput(img.getAttribute('src') || '')
      
      // Khôi phục cropData nếu ảnh đã từng được crop theo CSS viewport
      const cropDataAttr = img.getAttribute('data-crop') || figure?.getAttribute('data-crop')
      if (cropDataAttr) {
        try {
          const parsed = JSON.parse(cropDataAttr)
          setAppliedCrop(parsed)
          setCropBox({ x: parsed.x, y: parsed.y, width: parsed.width, height: parsed.height })
        } catch (err) {
          setAppliedCrop(null)
        }
      } else {
        setAppliedCrop(null)
      }

      if (figure) {
        const figcaption = figure.querySelector('figcaption')
        const captionText = figcaption?.textContent || ''
        setImageCaptionInput(captionText === 'Nhấp vào đây để thêm chú thích cho ảnh...' ? '' : captionText)

        const match = figure.style.maxWidth?.match(/(\d+)%/)
        if (match && match[1]) {
          setImageWidthPercent(parseInt(match[1], 10))
        } else {
          setImageWidthPercent(70)
        }
      } else {
        setImageCaptionInput(img.getAttribute('alt') || '')
        setImageWidthPercent(70)
      }

      setIsCropping(false)
      setImageModalOpen(true)
    }
  }

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
      </blockquote>
      <p><br></p>
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
        setIsCropping(false)
        setAppliedCrop(null)
        setCropBox({ x: 5, y: 5, width: 90, height: 90 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOpenImageModal = () => {
    saveCurrentSelection()
    setEditingImageElement(null)
    setImageUrlInput('')
    setImageCaptionInput('')
    setImageWidthPercent(70)
    setIsCropping(false)
    setAppliedCrop(null)
    setImageModalOpen(true)
  }

  // Set Crop Box based on selected Aspect Ratio
  const handleSelectAspectRatio = (ratio: 'free' | '16:9' | '4:3' | '1:1' | '2:3') => {
    setCropAspectRatio(ratio)
    if (!cropImageRef.current) {
      setCropBox({ x: 10, y: 10, width: 80, height: 80 })
      return
    }

    const img = cropImageRef.current
    const natW = img.naturalWidth || 1000
    const natH = img.naturalHeight || 600
    const imgAspect = natW / natH

    if (ratio === 'free') {
      setCropBox({ x: 5, y: 5, width: 90, height: 90 })
      return
    }

    let targetAspect = 1
    if (ratio === '16:9') targetAspect = 16 / 9
    if (ratio === '4:3') targetAspect = 4 / 3
    if (ratio === '1:1') targetAspect = 1
    if (ratio === '2:3') targetAspect = 2 / 3

    let boxW = 85
    let boxH = (boxW / targetAspect) * imgAspect

    if (boxH > 85) {
      boxH = 85
      boxW = (boxH * targetAspect) / imgAspect
    }

    const boxX = Math.max(0, (100 - boxW) / 2)
    const boxY = Math.max(0, (100 - boxH) / 2)

    setCropBox({
      x: boxX,
      y: boxY,
      width: Math.min(100, boxW),
      height: Math.min(100, boxH),
    })
  }

  // CSS Viewport Cropping: Áp dụng vùng hiển thị tức thì 100% không lo lỗi CORS
  const applyCrop = () => {
    setAppliedCrop({
      isCropped: true,
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height,
    })
    setIsCropping(false)
  }

  // Đặt lại về ảnh gốc chưa crop
  const resetCrop = () => {
    setAppliedCrop(null)
    setIsCropping(false)
    setCropBox({ x: 5, y: 5, width: 90, height: 90 })
  }

  const startDrag = (action: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cropContainerRef.current) return
    const rect = cropContainerRef.current.getBoundingClientRect()
    setCropAction(action)
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
      containerW: rect.width,
      containerH: rect.height,
    })
  }

  // Sinh mã HTML cho hình ảnh (Bao gồm viewport đóng gói khi đã crop bằng CSS Viewport chuẩn)
  const generateImageMarkup = (url: string, caption: string, widthPct: number) => {
    const cropData = appliedCrop?.isCropped ? appliedCrop : null
    const cropJson = cropData ? JSON.stringify(cropData).replace(/"/g, '&quot;') : ''

    if (cropData) {
      const img = cropImageRef.current
      const natW = img?.naturalWidth || 1000
      const natH = img?.naturalHeight || 600
      
      // Tỉ lệ khung hình thật của vùng crop
      const finalAspect = (cropData.width * natW) / (cropData.height * natH)
      
      // Tỉ lệ scale và độ dịch chuyển tính theo % chiều rộng / chiều cao của container Viewport:
      const widthMultiplier = (100 / cropData.width) * 100
      const heightMultiplier = (100 / cropData.height) * 100
      const leftOffsetPercent = (cropData.x / cropData.width) * 100
      const topOffsetPercent = (cropData.y / cropData.height) * 100

      return `
        <figure draggable="true" data-crop="${cropJson}" style="margin: 28px auto; text-align: center; max-width: ${widthPct}%; width: 100%; display: block; cursor: grab; user-select: all;">
          <div style="position: relative; width: 100%; aspect-ratio: ${finalAspect}; overflow: hidden; border-radius: 3px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background-color: #f8fafc;">
            <img src="${url}" alt="${caption}" data-crop="${cropJson}" referrerpolicy="no-referrer" style="position: absolute; width: ${widthMultiplier}%; height: ${heightMultiplier}%; max-width: none; max-height: none; left: -${leftOffsetPercent}%; top: -${topOffsetPercent}%; object-fit: fill; pointer-events: none;" />
          </div>
          <figcaption contenteditable="true" style="font-size: 0.85rem; color: #64748b; margin-top: 8px; font-style: italic; text-align: center; display: block; outline: none; border-bottom: 1px dashed transparent; min-height: 1.2em;" title="Nhấp vào đây để chỉnh sửa chú thích ảnh">${caption || 'Nhấp vào đây để thêm chú thích cho ảnh...'}</figcaption>
        </figure>
        <p><br></p>
      `
    }

    // Ảnh bình thường không crop
    return `
      <figure draggable="true" style="margin: 28px auto; text-align: center; max-width: ${widthPct}%; width: 100%; display: block; cursor: grab; user-select: all;">
        <img src="${url}" alt="${caption}" referrerpolicy="no-referrer" style="max-width: 100%; width: auto; height: auto; display: block; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 3px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); pointer-events: auto;" />
        <figcaption contenteditable="true" style="font-size: 0.85rem; color: #64748b; margin-top: 8px; font-style: italic; text-align: center; display: block; outline: none; border-bottom: 1px dashed transparent; min-height: 1.2em;" title="Nhấp vào đây để chỉnh sửa chú thích ảnh">${caption || 'Nhấp vào đây để thêm chú thích cho ảnh...'}</figcaption>
      </figure>
      <p><br></p>
    `
  }

  const handleInsertImageSubmit = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!imageUrlInput.trim()) {
      alert('Vui lòng chọn ảnh hoặc nhập URL hình ảnh')
      return
    }

    const caption = imageCaptionInput.trim()
    const widthPct = imageWidthPercent || 70
    const finalHtml = generateImageMarkup(imageUrlInput.trim(), caption, widthPct)

    // Nếu đang ở chế độ Cập nhật ảnh đã có sẵn
    if (editingImageElement && editorRef.current) {
      const figure = editingImageElement.closest('figure')
      if (figure) {
        figure.outerHTML = finalHtml
      } else {
        editingImageElement.outerHTML = finalHtml
      }

      onChange(editorRef.current.innerHTML)
      setEditingImageElement(null)
      setImageUrlInput('')
      setImageCaptionInput('')
      setIsCropping(false)
      setAppliedCrop(null)
      setImageModalOpen(false)
      return
    }

    // Chèn ảnh mới
    if (editorRef.current) {
      restoreSelection()
      document.execCommand('insertHTML', false, finalHtml)
      onChange(editorRef.current.innerHTML)
    } else {
      onChange((value || '') + finalHtml)
    }

    setEditingImageElement(null)
    setImageUrlInput('')
    setImageCaptionInput('')
    setIsCropping(false)
    setAppliedCrop(null)
    setImageModalOpen(false)
  }

  const handleOpenLinkModal = () => {
    saveCurrentSelection()
    setLinkUrlInput('')
    setLinkTextInput('')
    setLinkModalOpen(true)
  }

  const handleInsertLinkSubmit = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
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

  return (
    <div className="border border-gray-300 bg-white shadow-sm flex flex-col font-['Roboto'] relative">
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[#f8fafc] border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => exec('bold')} className="w-8 h-8 flex items-center justify-center font-bold rounded hover:bg-gray-200 text-gray-700 transition-colors" title="In đậm (Ctrl+B)">B</button>
          <button type="button" onClick={() => exec('italic')} className="w-8 h-8 flex items-center justify-center italic font-serif rounded hover:bg-gray-200 text-gray-700 transition-colors" title="In nghiêng (Ctrl+I)">I</button>
          <button type="button" onClick={() => exec('underline')} className="w-8 h-8 flex items-center justify-center underline rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Gạch chân (Ctrl+U)">U</button>
          <button type="button" onClick={() => exec('strikeThrough')} className="w-8 h-8 flex items-center justify-center line-through rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Gạch ngang">S</button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button type="button" onClick={() => exec('formatBlock', '<h2>')} className="px-2 h-8 text-xs font-bold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1" title="Tiêu đề H2">H2</button>
          <button type="button" onClick={() => exec('formatBlock', '<h3>')} className="px-2 h-8 text-xs font-bold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1" title="Tiêu đề H3">H3</button>
          <button type="button" onClick={() => exec('formatBlock', '<p>')} className="px-2 h-8 text-xs font-medium rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1" title="Đoạn văn thường">P</button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button type="button" onClick={() => exec('insertUnorderedList')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700" title="Danh sách gạch đầu dòng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>
          </button>
          <button type="button" onClick={() => exec('insertOrderedList')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700" title="Danh sách đánh số">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          <button type="button" onClick={insertQuote} className="px-2 h-8 text-xs font-semibold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1" title="Chèn khung trích dẫn nổi bật">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></svg>
            Quote
          </button>

          <button type="button" onClick={handleOpenImageModal} className="px-2.5 h-8 text-xs font-bold rounded bg-red-50 text-[#FF000F] hover:bg-red-100 flex items-center gap-1 border border-red-200 transition-colors cursor-pointer" title="Chèn hình ảnh vào bài viết">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
            + Chèn ảnh
          </button>

          <button type="button" onClick={handleOpenLinkModal} className="px-2.5 h-8 text-xs font-semibold rounded hover:bg-gray-200 text-gray-700 flex items-center gap-1 border border-gray-300 transition-colors" title="Chèn link liên kết">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
            Link
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button type="button" onClick={() => setActiveTab('editor')} className={`px-3 py-1.5 rounded transition-colors ${activeTab === 'editor' ? 'bg-[#1B4C98] text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}>Soạn thảo</button>
          <button type="button" onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 rounded transition-colors ${activeTab === 'preview' ? 'bg-[#1B4C98] text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}>Xem trước</button>
          <button type="button" onClick={() => setActiveTab('html')} className={`px-3 py-1.5 rounded transition-colors ${activeTab === 'html' ? 'bg-[#1B4C98] text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}>Mã HTML</button>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div 
          ref={editorRef} 
          contentEditable 
          onInput={handleInput} 
          onBlur={handleInput} 
          onDoubleClick={handleEditorDoubleClick}
          style={{ minHeight }} 
          className="p-4 outline-none prose max-w-none text-gray-800 focus:ring-0 overflow-y-auto leading-relaxed" 
          data-placeholder={placeholder} 
        />
      )}

      {activeTab === 'preview' && (
        <div style={{ minHeight }} className="p-6 bg-white overflow-y-auto prose max-w-none text-gray-900 border-t border-gray-100" dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400 italic">Chưa có nội dung bài viết...</p>' }} />
      )}

      {activeTab === 'html' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{ minHeight }} className="w-full p-4 font-mono text-xs text-gray-800 bg-gray-50 outline-none resize-y border-none focus:ring-0" placeholder="Mã nguồn HTML của bài viết..." />
      )}

      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-gray-300 shadow-2xl p-5 flex flex-col text-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h4 className="text-sm font-bold text-[#1B4C98] uppercase flex items-center gap-1.5">
                <span>🖼️</span> {editingImageElement ? 'Chỉnh sửa / Cắt lại hình ảnh bài viết' : 'Chèn hình ảnh vào nội dung bài viết'}
              </h4>
              <button type="button" onClick={() => setImageModalOpen(false)} className="text-gray-400 hover:text-gray-700 font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2">
              <button type="button" onClick={() => setImageTab('url')} className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${imageTab === 'url' ? 'bg-[#1B4C98] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Dán URL hình ảnh</button>
              <button type="button" onClick={() => setImageTab('upload')} className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${imageTab === 'upload' ? 'bg-[#1B4C98] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Tải ảnh từ máy tính 📁</button>
            </div>

            <div className="space-y-4">
              {imageTab === 'url' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Đường dẫn hình ảnh (URL) (*):</label>
                  <input type="text" required value={imageUrlInput} onChange={(e) => { setImageUrlInput(e.target.value); setIsCropping(false) }} placeholder="https://images.unsplash.com/... hoặc dán link ảnh trực tiếp" className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]" />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chọn tệp hình ảnh từ máy tính (PNG, JPG, WEBP):</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-2 border border-dashed border-gray-400 bg-gray-50 cursor-pointer text-xs" />
                </div>
              )}

              {/* ── IMAGE PREVIEW & ADVANCED CROP TOOL ─────────────────────────── */}
              {imageUrlInput.trim() && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <span>👁️</span> Xem trước & Tùy chỉnh ảnh:
                    </span>
                    <div className="flex items-center gap-2">
                      {!isCropping ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCropping(true)
                            handleSelectAspectRatio('free')
                          }}
                          className="px-3 py-1 font-bold bg-[#1B4C98] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs rounded"
                        >
                          <span>✂️</span> Bật công cụ Cắt ảnh (Crop)
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsCropping(false)}
                            className="px-2.5 py-1 text-[11px] font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                          >
                            Hủy cắt
                          </button>
                          <button
                            type="button"
                            onClick={applyCrop}
                            className="px-3 py-1 text-[11px] font-bold bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-xs rounded flex items-center gap-1"
                          >
                            <span>✓</span> Áp dụng Cắt ảnh
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCropping && (
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-blue-50 border border-blue-200 text-[11px] rounded">
                      <span className="font-bold text-blue-900">Tỉ lệ cắt:</span>
                      {(['free', '16:9', '4:3', '1:1', '2:3'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => handleSelectAspectRatio(ratio)}
                          className={`px-2.5 py-1 rounded cursor-pointer font-semibold transition-all ${
                            cropAspectRatio === ratio ? 'bg-[#1B4C98] text-white shadow-xs' : 'bg-white text-gray-700 border hover:bg-gray-100'
                          }`}
                        >
                          {ratio === 'free' ? 'Tự do' : ratio}
                        </button>
                      ))}
                      <span className="text-[11px] text-blue-700 ml-auto italic">
                        💡 Kéo các góc / cạnh để chỉnh kích thước, kéo vùng giữa để di chuyển
                      </span>
                    </div>
                  )}

                  {/* Main Preview Container with Image Matching Wrapper & Crop Viewport Preview */}
                  <div className="relative overflow-hidden bg-slate-100 border border-gray-300 min-h-48 max-h-[380px] flex items-center justify-center select-none p-3">
                    {/* Nếu đã áp dụng Crop và đang không trong chế độ kéo chỉnh Crop: Hiện Viewport Preview */}
                    {appliedCrop?.isCropped && !isCropping ? (
                      <div className="flex flex-col items-center gap-2 max-w-full">
                        <div
                          style={{
                            width: '100%',
                            maxWidth: '420px',
                            aspectRatio: `${(appliedCrop.width * (cropImageRef.current?.naturalWidth || 1000)) / (appliedCrop.height * (cropImageRef.current?.naturalHeight || 600))}`,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                          className="border-2 border-green-600 rounded shadow-md bg-black/5"
                        >
                          <img
                            src={imageUrlInput.trim()}
                            alt="Cropped Preview"
                            referrerPolicy="no-referrer"
                            style={{
                              position: 'absolute',
                              width: `${(100 / appliedCrop.width) * 100}%`,
                              height: `${(100 / appliedCrop.height) * 100}%`,
                              maxWidth: 'none',
                              maxHeight: 'none',
                              left: `-${(appliedCrop.x / appliedCrop.width) * 100}%`,
                              top: `-${(appliedCrop.y / appliedCrop.height) * 100}%`,
                              objectFit: 'fill',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-200 rounded">
                            ✓ Đã áp dụng vùng hiển thị mới
                          </span>
                          <button
                            type="button"
                            onClick={resetCrop}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-800 underline cursor-pointer"
                          >
                            Đặt lại ảnh gốc
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div ref={cropContainerRef} className="relative inline-block max-w-full max-h-[350px]">
                        <img
                          key={imageUrlInput.trim()}
                          ref={cropImageRef}
                          src={imageUrlInput.trim()}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const errEl = document.getElementById('preview-img-err')
                            if (errEl) errEl.style.display = 'block'
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.display = 'block'
                            const errEl = document.getElementById('preview-img-err')
                            if (errEl) errEl.style.display = 'none'
                          }}
                          className="max-h-[350px] max-w-full block object-contain pointer-events-none rounded shadow-xs"
                        />

                        {/* Professional Cropper Overlay Box with 8 Resizing Handles */}
                        {isCropping && (
                          <>
                            {/* Dark Mask around crop box */}
                            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                            {/* Interactive Crop Box */}
                            <div
                              style={{
                                left: `${cropBox.x}%`,
                                top: `${cropBox.y}%`,
                                width: `${cropBox.width}%`,
                                height: `${cropBox.height}%`,
                              }}
                              className="absolute border-2 border-dashed border-[#1B4C98] bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] z-20"
                            >
                              {/* Move handle in the center */}
                              <div
                                onMouseDown={(e) => startDrag('move', e)}
                                className="absolute inset-0 cursor-move flex items-center justify-center"
                              >
                                <span className="bg-[#1B4C98] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none select-none">
                                  ✂️ Vùng giữ lại ({cropAspectRatio.toUpperCase()})
                                </span>
                              </div>

                              {/* 8 Resizing Handles */}
                              {/* Corners */}
                              <div onMouseDown={(e) => startDrag('nw', e)} className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nwse-resize z-30 shadow-xs" />
                              <div onMouseDown={(e) => startDrag('ne', e)} className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nesw-resize z-30 shadow-xs" />
                              <div onMouseDown={(e) => startDrag('sw', e)} className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nesw-resize z-30 shadow-xs" />
                              <div onMouseDown={(e) => startDrag('se', e)} className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#1B4C98] rounded-xs cursor-nwse-resize z-30 shadow-xs" />

                              {/* Edges (active in free crop mode) */}
                              {cropAspectRatio === 'free' && (
                                <>
                                  <div onMouseDown={(e) => startDrag('n', e)} className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-[#1B4C98] rounded-xs cursor-ns-resize z-30 shadow-xs" />
                                  <div onMouseDown={(e) => startDrag('s', e)} className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-white border border-[#1B4C98] rounded-xs cursor-ns-resize z-30 shadow-xs" />
                                  <div onMouseDown={(e) => startDrag('w', e)} className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-5 bg-white border border-[#1B4C98] rounded-xs cursor-ew-resize z-30 shadow-xs" />
                                  <div onMouseDown={(e) => startDrag('e', e)} className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-5 bg-white border border-[#1B4C98] rounded-xs cursor-ew-resize z-30 shadow-xs" />
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div id="preview-img-err" className="hidden text-center p-4 text-red-500 font-semibold text-xs">
                      ⚠️ Không thể hiển thị xem trước trực tiếp từ đường dẫn này. Bạn vẫn có thể ấn chèn ảnh bình thường hoặc dùng tab <strong>"Tải ảnh từ máy tính 📁"</strong> nhé!
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Độ rộng hiển thị trong bài viết:</label>
                  <div className="flex items-center gap-2">
                    {[{ label: '50% (Nhỏ gọn)', val: 50 }, { label: '70% (Chuẩn bài viết)', val: 70 }, { label: '100% (Toàn dòng)', val: 100 }].map((w) => (
                      <button key={w.val} type="button" onClick={() => setImageWidthPercent(w.val)} className={`px-2.5 py-1.5 text-xs font-semibold rounded cursor-pointer transition-colors ${imageWidthPercent === w.val ? 'bg-[#1B4C98] text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border'}`}>{w.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chú thích hình ảnh (Caption bên dưới ảnh):</label>
                  <input type="text" value={imageCaptionInput} onChange={(e) => setImageCaptionInput(e.target.value)} placeholder="Ví dụ: Cận cảnh thiết bị đóng cắt MCB ABB..." className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]" />
                  <p className="text-[10px] text-gray-400 mt-0.5 italic">* Sau khi chèn, bạn cũng có thể nhấp trực tiếp vào dòng chữ dưới ảnh để sửa lại bất kỳ lúc nào.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button type="button" onClick={() => setImageModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer">Hủy</button>
                <button type="button" onClick={(e) => handleInsertImageSubmit(e)} className="px-5 py-2 font-bold text-white bg-[#FF000F] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5">
                  <span>{editingImageElement ? '💾' : '🖼️'}</span> {editingImageElement ? 'Cập nhật' : 'Chèn vào bài viết'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white w-full max-w-md border border-gray-300 shadow-2xl p-5 flex flex-col text-xs" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-bold text-[#1B4C98] uppercase pb-2 border-b border-gray-200 mb-4">Chèn đường dẫn liên kết (Link)</h4>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Văn bản hiển thị:</label>
                <input type="text" value={linkTextInput} onChange={(e) => setLinkTextInput(e.target.value)} placeholder="Ví dụ: Xem chi tiết sản phẩm tại đây" className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Đường dẫn liên kết (URL) (*):</label>
                <input type="text" required value={linkUrlInput} onChange={(e) => setLinkUrlInput(e.target.value)} placeholder="https://viendongelectric.vn/san-pham/..." className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]" />
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button type="button" onClick={() => setLinkModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold cursor-pointer">Hủy</button>
                <button type="button" onClick={(e) => handleInsertLinkSubmit(e)} className="px-5 py-2 font-bold text-white bg-[#1B4C98] hover:opacity-90 cursor-pointer">Chèn link</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
