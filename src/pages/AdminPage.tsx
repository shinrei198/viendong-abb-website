import React, { useState, useEffect, useRef } from 'react'
import {
  VideoItem,
  NewsItem,
  QuoteRequestItem,
  BannerSlideItem,
  BannerButtonOverlay,
  SiteSettings,
  getStoredVideos,
  saveStoredVideos,
  getStoredVideoCategories,
  saveStoredVideoCategories,
  getStoredNews,
  saveStoredNews,
  getStoredNewsCategories,
  saveStoredNewsCategories,
  getStoredBanners,
  saveStoredBanners,
  getStoredQuotes,
  saveStoredQuotes,
  getStoredSiteSettings,
  saveStoredSiteSettings,
  resetAllToDefault,
  saveAllDataToSourceCode,
  exportAllDataAsJSON,
  importAllDataFromJSON,
  createVietnameseSlug,
} from '@/data/siteData'
import RichTextEditor from '@/components/RichTextEditor'
import ThumbnailCropper, { NewsThumbnailView } from '@/components/ThumbnailCropper'

interface AdminPageProps {
  onNavigate: (page: string, id?: string) => void
}

type TabType = 'banners' | 'videos' | 'news' | 'quotes' | 'settings'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
}

// ── CONSTANTS FOR SAFE CONTENT BOUNDARIES (KHUNG BIÊN CƠ SỞ TRANG WEB) ───────
// Tương ứng với vùng nội dung max-w-7xl (canh lề chuẩn với tiêu đề & danh mục sản phẩm)
const BOUND_LEFT = 0 // % từ mép trái nội dung max-w-7xl
const BOUND_RIGHT = 100 // % từ mép phải nội dung max-w-7xl
const BOUND_TOP = 10 // % từ mép trên
const BOUND_BOTTOM = 88 // % từ mép dưới

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('banners')

  // Storage states
  const [banners, setBanners] = useState<BannerSlideItem[]>(getStoredBanners())
  const [videos, setVideos] = useState<VideoItem[]>(getStoredVideos())
  const [videoCats, setVideoCats] = useState<string[]>(getStoredVideoCategories())
  const [news, setNews] = useState<NewsItem[]>(getStoredNews())
  const [newsCats, setNewsCats] = useState<string[]>(getStoredNewsCategories())
  const [quotes, setQuotes] = useState<QuoteRequestItem[]>(getStoredQuotes())
  const [settings, setSettings] = useState<SiteSettings>(getStoredSiteSettings())

  const [notification, setNotification] = useState<string | null>(null)

  // Custom In-App Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  // Refresh from storage
  const refreshData = () => {
    setBanners(getStoredBanners())
    setVideos(getStoredVideos())
    setVideoCats(getStoredVideoCategories())
    setNews(getStoredNews())
    setNewsCats(getStoredNewsCategories())
    setQuotes(getStoredQuotes())
    setSettings(getStoredSiteSettings())
  }

  useEffect(() => {
    const handleUpdate = () => refreshData()
    window.addEventListener('viendong_storage_update', handleUpdate)
    return () => window.removeEventListener('viendong_storage_update', handleUpdate)
  }, [])

  // ═════════════════════════════════════════════════════════════════════════════
  // BANNER SLIDER MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════
  const [bannerModalOpen, setBannerModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerSlideItem | null>(null)
  const bannerPreviewRef = useRef<HTMLDivElement>(null)

  const [bannerForm, setBannerForm] = useState<Omit<BannerSlideItem, 'id'>>({
    title: '',
    imageUrl: '',
    altText: '',
    bannerLink: '',
    bannerLinkType: 'internal',
    buttons: [],
    order: 1,
    isActive: true,
    naturalWidth: 1920,
    naturalHeight: 650,
    mobileCtaLayout: 'hotspot',
  })

  // Selected button and Drag state for visual positioning
  const [selectedBtnIndex, setSelectedBtnIndex] = useState<number | null>(null)
  const [draggingBtnIndex, setDraggingBtnIndex] = useState<number | null>(null)
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'desktop' | 'laptop' | 'mobile' | 'mobile-sm'>('desktop')
  const [positionMode, setPositionMode] = useState<'pixel' | 'percent'>('pixel')
  const [showGuides, setShowGuides] = useState<boolean>(true)
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({ width: 1920, height: 650 })

  // Auto-detect image dimensions when image changes
  useEffect(() => {
    if (!bannerForm.imageUrl) return
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth || 1920
      const h = img.naturalHeight || 650
      setImageNaturalSize({ width: w, height: h })
      setBannerForm((prev) => ({
        ...prev,
        naturalWidth: w,
        naturalHeight: h,
      }))
    }
    img.src = bannerForm.imageUrl
  }, [bannerForm.imageUrl])

  const sampleBannerImages = [
    {
      label: 'Giải pháp đóng cắt ABB',
      url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&h=650&fit=crop&auto=format',
    },
    {
      label: 'Công tắc Framia sang trọng',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=650&fit=crop&auto=format',
    },
    {
      label: 'Nhà phân phối B2B',
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&h=650&fit=crop&auto=format',
    },
    {
      label: 'Trung tâm dữ liệu ABB',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=650&fit=crop&auto=format',
    },
  ]

  const openAddBanner = () => {
    setEditingBanner(null)
    setBannerForm({
      title: '',
      imageUrl: sampleBannerImages[0].url,
      altText: '',
      bannerLink: 'products',
      bannerLinkType: 'internal',
      buttons: [],
      order: banners.length + 1,
      isActive: true,
      naturalWidth: 1920,
      naturalHeight: 650,
      mobileCtaLayout: 'hotspot',
    })
    setSelectedBtnIndex(null)
    setDraggingBtnIndex(null)
    setBannerModalOpen(true)
  }

  const openEditBanner = (item: BannerSlideItem) => {
    setEditingBanner(item)
    const natW = item.naturalWidth || 1920
    const natH = item.naturalHeight || 650
    setImageNaturalSize({ width: natW, height: natH })
    setBannerForm({
      title: item.title,
      imageUrl: item.imageUrl,
      altText: item.altText || '',
      bannerLink: item.bannerLink || '',
      bannerLinkType: item.bannerLinkType || 'internal',
      buttons: (item.buttons || []).map((b) => ({
        ...b,
        pixelX: b.pixelX ?? Math.round((b.posX / 100) * natW),
        pixelY: b.pixelY ?? Math.round((b.posY / 100) * natH),
        origWidth: b.origWidth || natW,
        origHeight: b.origHeight || natH,
        mobileAlign: b.mobileAlign || 'auto',
      })),
      order: item.order,
      isActive: item.isActive,
      naturalWidth: natW,
      naturalHeight: natH,
      mobileCtaLayout: item.mobileCtaLayout || 'hotspot',
    })
    setSelectedBtnIndex(item.buttons && item.buttons.length > 0 ? 0 : null)
    setDraggingBtnIndex(null)
    setBannerModalOpen(true)
  }

  const saveBanner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bannerForm.title.trim()) {
      showToast('Vui lòng nhập tên chiến dịch banner')
      return
    }
    if (!bannerForm.imageUrl.trim()) {
      showToast('Vui lòng nhập URL hoặc tải ảnh banner')
      return
    }

    let updated: BannerSlideItem[]
    if (editingBanner) {
      updated = banners.map((b) =>
        b.id === editingBanner.id ? { ...bannerForm, id: editingBanner.id } : b
      )
      showToast('Đã cập nhật banner thành công!')
    } else {
      const newB: BannerSlideItem = {
        ...bannerForm,
        id: 'b_' + Date.now(),
      }
      updated = [...banners, newB]
      showToast('Đã thêm banner slider mới!')
    }
    saveStoredBanners(updated)
    setBanners(updated)
    setBannerModalOpen(false)
  }

  const handleDeleteBannerConfirm = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa Banner',
      message: `Bạn có chắc muốn xóa banner "${title}"?`,
      onConfirm: () => {
        const updated = banners.filter((b) => b.id !== id)
        saveStoredBanners(updated)
        setBanners(updated)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã xóa banner!')
      },
    })
  }

  const toggleBannerActive = (id: string) => {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    )
    saveStoredBanners(updated)
    setBanners(updated)
    const target = updated.find((b) => b.id === id)
    showToast(target?.isActive ? 'Đã bật hiển thị banner!' : 'Đã ẩn banner!')
  }

  const moveBannerOrder = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === banners.length - 1)
    ) {
      return
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[targetIndex]
    newBanners[targetIndex] = temp

    const updated = newBanners.map((b, i) => ({ ...b, order: i + 1 }))
    saveStoredBanners(updated)
    setBanners(updated)
    showToast('Đã thay đổi thứ tự hiển thị banner!')
  }

  // ── STRICT SAFE BOUNDARY POSITION CLAMPING & SMOOTH GLOBAL DRAGGING ────────
  const updateBtnPositionFromCoords = (clientX: number, clientY: number, targetBtnIdx: number) => {
    if (!bannerPreviewRef.current) return
    const rect = bannerPreviewRef.current.getBoundingClientRect()
    const rawX = Math.round(((clientX - rect.left) / rect.width) * 100)
    const rawY = Math.round(((clientY - rect.top) / rect.height) * 100)

    const isDesktop = previewDeviceMode === 'desktop' || previewDeviceMode === 'laptop'
    const minX = isDesktop ? BOUND_LEFT : 4
    const maxX = isDesktop ? BOUND_RIGHT : 96
    const minY = BOUND_TOP
    const maxY = BOUND_BOTTOM

    const clampedX = Math.max(minX, Math.min(maxX, rawX))
    const clampedY = Math.max(minY, Math.min(maxY, rawY))

    const natW = imageNaturalSize.width || 1920
    const natH = imageNaturalSize.height || 650
    const pxX = Math.round((clampedX / 100) * natW)
    const pxY = Math.round((clampedY / 100) * natH)

    setBannerForm((prev) => {
      const updatedButtons = [...prev.buttons]
      if (updatedButtons[targetBtnIdx]) {
        updatedButtons[targetBtnIdx] = {
          ...updatedButtons[targetBtnIdx],
          posX: clampedX,
          posY: clampedY,
          pixelX: pxX,
          pixelY: pxY,
          origWidth: natW,
          origHeight: natH,
        }
      }
      return { ...prev, buttons: updatedButtons }
    })
  }

  // Window-level mouse tracking during drag
  useEffect(() => {
    if (draggingBtnIndex === null) return

    const handleWindowMouseMove = (e: MouseEvent) => {
      updateBtnPositionFromCoords(e.clientX, e.clientY, draggingBtnIndex)
    }

    const handleWindowMouseUp = () => {
      setDraggingBtnIndex(null)
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [draggingBtnIndex, previewDeviceMode, imageNaturalSize])

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerPreviewRef.current) return
    const rect = bannerPreviewRef.current.getBoundingClientRect()
    const rawX = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const rawY = Math.round(((e.clientY - rect.top) / rect.height) * 100)

    const isDesktop = previewDeviceMode === 'desktop' || previewDeviceMode === 'laptop'
    const minX = isDesktop ? BOUND_LEFT : 4
    const maxX = isDesktop ? BOUND_RIGHT : 96
    const clampedX = Math.max(minX, Math.min(maxX, rawX))
    const clampedY = Math.max(BOUND_TOP, Math.min(BOUND_BOTTOM, rawY))

    const natW = imageNaturalSize.width || 1920
    const natH = imageNaturalSize.height || 650
    const pxX = Math.round((clampedX / 100) * natW)
    const pxY = Math.round((clampedY / 100) * natH)

    if (selectedBtnIndex !== null && bannerForm.buttons[selectedBtnIndex]) {
      updateBtnPositionFromCoords(e.clientX, e.clientY, selectedBtnIndex)
      setDraggingBtnIndex(selectedBtnIndex)
    } else {
      // Create new button at safe clamped point
      const newBtn: BannerButtonOverlay = {
        id: 'btn_' + Date.now(),
        label: 'Khám Phá Ngay →',
        actionType: 'internal',
        targetUrl: 'products',
        posX: clampedX,
        posY: clampedY,
        pixelX: pxX,
        pixelY: pxY,
        origWidth: natW,
        origHeight: natH,
        size: 'md',
        styleType: 'red',
        mobileAlign: 'auto',
      }
      setBannerForm((prev) => {
        const updated = [...prev.buttons, newBtn]
        setSelectedBtnIndex(updated.length - 1)
        setDraggingBtnIndex(updated.length - 1)
        return { ...prev, buttons: updated }
      })
      showToast(`Đã tạo nút mới tại X: ${pxX}px (${clampedX}%), Y: ${pxY}px (${clampedY}%)`)
    }
  }

  const handleButtonMouseDown = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    setSelectedBtnIndex(idx)
    setDraggingBtnIndex(idx)
  }

  const addNewButton = (style: 'red' | 'navy' | 'white' | 'glass' = 'red') => {
    const isDesktop = previewDeviceMode === 'desktop' || previewDeviceMode === 'laptop'
    const minX = isDesktop ? BOUND_LEFT : 4
    const newX = Math.min(
      isDesktop ? BOUND_RIGHT - 15 : 80,
      minX + 5 + bannerForm.buttons.length * 16
    )

    let defaultLabel = 'Xem Chi Tiết →'
    if (style === 'navy') defaultLabel = 'Tải Báo Giá PDF'
    else if (style === 'white') defaultLabel = 'Xem Catalogue'
    else if (style === 'glass') defaultLabel = 'Hotline Tư Vấn'

    const natW = imageNaturalSize.width || 1920
    const natH = imageNaturalSize.height || 650
    const pxX = Math.round((newX / 100) * natW)
    const pxY = Math.round((75 / 100) * natH)

    const newBtn: BannerButtonOverlay = {
      id: 'btn_' + Date.now(),
      label: defaultLabel,
      actionType: style === 'glass' ? 'phone' : 'internal',
      targetUrl: style === 'glass' ? '02839435276' : 'products',
      posX: newX,
      posY: 75,
      pixelX: pxX,
      pixelY: pxY,
      origWidth: natW,
      origHeight: natH,
      size: 'md',
      styleType: style,
      mobileAlign: 'auto',
    }
    setBannerForm((prev) => {
      const updatedButtons = [...prev.buttons, newBtn]
      setSelectedBtnIndex(updatedButtons.length - 1)
      return { ...prev, buttons: updatedButtons }
    })
    showToast(`Đã thêm ${style === 'white' ? 'Nút Trắng' : style === 'navy' ? 'Nút Xanh' : 'Nút Đỏ'} mới!`)
  }

  const removeButton = (idx: number) => {
    setBannerForm((prev) => {
      const updatedButtons = prev.buttons.filter((_, i) => i !== idx)
      setSelectedBtnIndex(updatedButtons.length > 0 ? 0 : null)
      return { ...prev, buttons: updatedButtons }
    })
    showToast('Đã xóa nút CTA!')
  }

  const updateButtonField = (
    idx: number,
    field: keyof BannerButtonOverlay,
    val: any
  ) => {
    const natW = imageNaturalSize.width || 1920
    const natH = imageNaturalSize.height || 650
    const isDesktop = previewDeviceMode === 'desktop' || previewDeviceMode === 'laptop'
    const minX = isDesktop ? BOUND_LEFT : 4
    const maxX = isDesktop ? BOUND_RIGHT : 96

    setBannerForm((prev) => {
      const updatedButtons = [...prev.buttons]
      if (updatedButtons[idx]) {
        let updatedBtn = { ...updatedButtons[idx] }

        if (field === 'posX') {
          const clampedX = Math.max(minX, Math.min(maxX, Number(val)))
          updatedBtn.posX = clampedX
          updatedBtn.pixelX = Math.round((clampedX / 100) * natW)
        } else if (field === 'posY') {
          const clampedY = Math.max(BOUND_TOP, Math.min(BOUND_BOTTOM, Number(val)))
          updatedBtn.posY = clampedY
          updatedBtn.pixelY = Math.round((clampedY / 100) * natH)
        } else if (field === 'pixelX') {
          const rawPx = Math.max(0, Math.min(natW, Number(val)))
          updatedBtn.pixelX = rawPx
          updatedBtn.posX = Math.round((rawPx / natW) * 100)
        } else if (field === 'pixelY') {
          const rawPy = Math.max(0, Math.min(natH, Number(val)))
          updatedBtn.pixelY = rawPy
          updatedBtn.posY = Math.round((rawPy / natH) * 100)
        } else {
          updatedBtn = { ...updatedBtn, [field]: val }
        }

        updatedButtons[idx] = updatedBtn
      }
      return { ...prev, buttons: updatedButtons }
    })
  }

  // Quick preset alignment helper
  const snapButtonTo = (idx: number, preset: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center-left' | 'center') => {
    let x = 15
    let y = 75
    if (preset === 'bottom-left') {
      x = 12
      y = 78
    } else if (preset === 'bottom-right') {
      x = 85
      y = 78
    } else if (preset === 'bottom-center') {
      x = 50
      y = 78
    } else if (preset === 'center-left') {
      x = 15
      y = 50
    } else if (preset === 'center') {
      x = 50
      y = 50
    }
    updateButtonField(idx, 'posX', x)
    updateButtonField(idx, 'posY', y)
    showToast(`Đã căn vị trí nút: ${preset}`)
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // VIDEO MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null)
  const [videoCatModalOpen, setVideoCatModalOpen] = useState(false)
  const [newVideoCatInput, setNewVideoCatInput] = useState('')

  const [videoForm, setVideoForm] = useState<Omit<VideoItem, 'id'>>({
    title: '',
    category: videoCats[0] || 'Sản phẩm mới',
    date: new Date().toLocaleDateString('vi-VN'),
    duration: '1:30',
    thumb: '',
    videoUrl: '',
    embedType: 'youtube',
    isFeatured: false,
    isHidden: false,
    linkedProductSku: '',
  })

  const openAddVideo = () => {
    setEditingVideo(null)
    setVideoForm({
      title: '',
      category: videoCats[0] || 'Sản phẩm mới',
      date: new Date().toLocaleDateString('vi-VN'),
      duration: '1:30',
      thumb: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&auto=format',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      embedType: 'youtube',
      isFeatured: false,
      isHidden: false,
      linkedProductSku: '',
    })
    setVideoModalOpen(true)
  }

  const openEditVideo = (item: VideoItem) => {
    setEditingVideo(item)
    setVideoForm({
      title: item.title,
      category: item.category,
      date: item.date,
      duration: item.duration,
      thumb: item.thumb,
      videoUrl: item.videoUrl,
      embedType: item.embedType,
      isFeatured: item.isFeatured || false,
      isHidden: item.isHidden || false,
      linkedProductSku: item.linkedProductSku || '',
    })
    setVideoModalOpen(true)
  }

  const saveVideo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoForm.title.trim()) {
      showToast('Vui lòng nhập tiêu đề video')
      return
    }

    let updated: VideoItem[]
    if (editingVideo) {
      updated = videos.map((v) =>
        v.id === editingVideo.id ? { ...videoForm, id: editingVideo.id } : v
      )
      showToast('Đã cập nhật video thành công!')
    } else {
      const newV: VideoItem = {
        ...videoForm,
        id: 'v_' + Date.now(),
        views: 0,
      }
      updated = [newV, ...videos]
      showToast('Đã thêm video mới thành công!')
    }
    saveStoredVideos(updated)
    setVideos(updated)
    setVideoModalOpen(false)
  }

  const handleDeleteVideoConfirm = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa Video',
      message: `Bạn có chắc chắn muốn xóa video "${title}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => {
        const updated = videos.filter((v) => v.id !== id)
        saveStoredVideos(updated)
        setVideos(updated)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã xóa video thành công!')
      },
    })
  }

  const toggleFeaturedVideo = (id: string) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, isFeatured: !v.isFeatured } : v
    )
    saveStoredVideos(updated)
    setVideos(updated)
    const target = updated.find((v) => v.id === id)
    showToast(
      target?.isFeatured
        ? 'Đã ghim video làm Nổi bật!'
        : 'Đã bỏ ghim video nổi bật!'
    )
  }

  const toggleHideVideo = (id: string) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, isHidden: !v.isHidden } : v
    )
    saveStoredVideos(updated)
    setVideos(updated)
    showToast('Đã cập nhật trạng thái hiển thị video!')
  }

  const addVideoCategory = () => {
    if (!newVideoCatInput.trim()) return
    if (videoCats.includes(newVideoCatInput.trim())) {
      showToast('Danh mục này đã tồn tại!')
      return
    }
    const updated = [...videoCats, newVideoCatInput.trim()]
    saveStoredVideoCategories(updated)
    setVideoCats(updated)
    setNewVideoCatInput('')
    showToast('Đã thêm nhóm video mới!')
  }

  const removeVideoCategory = (cat: string) => {
    if (videoCats.length <= 1) {
      showToast('Phải giữ lại ít nhất 1 nhóm video!')
      return
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa nhóm Video',
      message: `Bạn có muốn xóa nhóm "${cat}" không?`,
      onConfirm: () => {
        const updated = videoCats.filter((c) => c !== cat)
        saveStoredVideoCategories(updated)
        setVideoCats(updated)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã xóa nhóm video!')
      },
    })
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // NEWS MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════
  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [newsCatModalOpen, setNewsCatModalOpen] = useState(false)
  const [newNewsCatInput, setNewNewsCatInput] = useState('')

  const [newsForm, setNewsForm] = useState<Omit<NewsItem, 'id'>>({
    title: '',
    slug: '',
    category: newsCats[0] || 'Sản phẩm mới',
    tags: ['ABB', 'Viễn Đông'],
    date: new Date().toLocaleDateString('vi-VN'),
    author: 'Ban Kỹ Thuật Viễn Đông',
    readTime: '3 phút',
    thumb: '',
    summary: '',
    content: '<p>Nhập nội dung bài viết ở đây...</p>',
    quote: '',
    quoteAuthor: '',
    status: 'published',
    isFeatured: false,
  })

  const [tagInput, setTagInput] = useState('')

  const openAddNews = () => {
    setEditingNews(null)
    setNewsForm({
      title: '',
      slug: '',
      category: newsCats[0] || 'Sản phẩm mới',
      tags: ['ABB', 'Thiết bị điện'],
      date: new Date().toLocaleDateString('vi-VN'),
      author: 'Ban Kỹ Thuật Viễn Đông',
      readTime: '4 phút',
      thumb: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=450&fit=crop&auto=format',
      summary: '',
      content: '<p>Nhập nội dung chi tiết bài viết tại đây...</p>',
      quote: '',
      quoteAuthor: '',
      status: 'published',
      isFeatured: false,
    })
    setTagInput('ABB, Thiết bị điện')
    setNewsModalOpen(true)
  }

  const openEditNews = (item: NewsItem) => {
    setEditingNews(item)
    setNewsForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      tags: item.tags || [],
      date: item.date,
      author: item.author,
      readTime: item.readTime,
      thumb: item.thumb,
      summary: item.summary,
      content: item.content,
      quote: item.quote || '',
      quoteAuthor: item.quoteAuthor || '',
      status: item.status,
      isFeatured: item.isFeatured || false,
    })
    setTagInput(item.tags?.join(', ') || '')
    setNewsModalOpen(true)
  }

  const saveNews = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsForm.title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết')
      return
    }

    const processedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const slug =
      newsForm.slug.trim() ||
      createVietnameseSlug(newsForm.title)

    let updated: NewsItem[]
    if (editingNews) {
      updated = news.map((n) =>
        n.id === editingNews.id
          ? { ...newsForm, id: editingNews.id, tags: processedTags, slug }
          : n
      )
      showToast('Đã cập nhật bài viết thành công!')
    } else {
      const newN: NewsItem = {
        ...newsForm,
        id: 'n_' + Date.now(),
        slug,
        tags: processedTags,
        views: 0,
      }
      updated = [newN, ...news]
      showToast('Đã xuất bản bài viết mới!')
    }
    saveStoredNews(updated)
    setNews(updated)
    setNewsModalOpen(false)
  }

  const handleDeleteNewsConfirm = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa bài viết',
      message: `Bạn có chắc muốn xóa bài viết "${title}"?`,
      onConfirm: () => {
        const updated = news.filter((n) => n.id !== id)
        saveStoredNews(updated)
        setNews(updated)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã xóa bài viết thành công!')
      },
    })
  }

  const toggleFeaturedNews = (id: string) => {
    const updated = news.map((n) =>
      n.id === id ? { ...n, isFeatured: !n.isFeatured } : n
    )
    saveStoredNews(updated)
    setNews(updated)
    const target = updated.find((n) => n.id === id)
    showToast(
      target?.isFeatured
        ? 'Đã ghim bài viết làm Nổi bật!'
        : 'Đã bỏ ghim bài viết nổi bật!'
    )
  }

  const addNewsCategory = () => {
    if (!newNewsCatInput.trim()) return
    if (newsCats.includes(newNewsCatInput.trim())) {
      showToast('Chuyên mục này đã tồn tại!')
      return
    }
    const updated = [...newsCats, newNewsCatInput.trim()]
    saveStoredNewsCategories(updated)
    setNewsCats(updated)
    setNewNewsCatInput('')
    showToast('Đã thêm chuyên mục tin tức mới!')
  }

  const removeNewsCategory = (cat: string) => {
    if (newsCats.length <= 1) {
      showToast('Phải giữ lại ít nhất 1 chuyên mục!')
      return
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa chuyên mục Tin tức',
      message: `Bạn có chắc muốn xóa chuyên mục "${cat}"?`,
      onConfirm: () => {
        const updated = newsCats.filter((c) => c !== cat)
        saveStoredNewsCategories(updated)
        setNewsCats(updated)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã xóa chuyên mục!')
      },
    })
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // QUOTE REQUESTS MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequestItem | null>(null)

  const updateQuoteStatus = (id: string, status: QuoteRequestItem['status']) => {
    const updated = quotes.map((q) => (q.id === id ? { ...q, status } : q))
    saveStoredQuotes(updated)
    setQuotes(updated)
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote({ ...selectedQuote, status })
    }
    showToast('Đã cập nhật trạng thái đơn báo giá!')
  }

  const handleDeleteQuoteConfirm = (id: string, code: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa phiếu báo giá',
      message: `Bạn có muốn xóa phiếu yêu cầu mã "${code}" không?`,
      onConfirm: () => {
        const updated = quotes.filter((q) => q.id !== id)
        saveStoredQuotes(updated)
        setQuotes(updated)
        setSelectedQuote(null)
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã xóa đơn báo giá!')
      },
    })
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // SETTINGS MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    saveStoredSiteSettings(settingsForm)
    setSettings(settingsForm)
    showToast('Đã lưu cấu hình website thành công!')
  }

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Khôi phục Dữ liệu Mặc định Gốc',
      message:
        'CẢNH BÁO: Toàn bộ banner slider, video, tin tức và yêu cầu báo giá mới tạo sẽ được thiết lập lại về mặc định ban đầu của ABB Viễn Đông.',
      onConfirm: () => {
        resetAllToDefault()
        refreshData()
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        showToast('Đã khôi phục dữ liệu gốc thành công!')
      },
    })
  }

  const handleExportBackup = () => {
    const backupData = {
      banners,
      videos,
      videoCats,
      news,
      newsCats,
      quotes,
      settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `VienDong_ABB_Backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Đã xuất file sao lưu dữ liệu thành công!')
  }

  // Current active button for header display
  const currentActiveBtn =
    selectedBtnIndex !== null && bannerForm.buttons[selectedBtnIndex]
      ? bannerForm.buttons[selectedBtnIndex]
      : null

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSavingSource, setIsSavingSource] = useState(false)

  const handleSaveSource = async () => {
    setIsSavingSource(true)
    try {
      const res = await saveAllDataToSourceCode()
      showToast(res.message)
    } catch {
      showToast('Lỗi khi lưu vào source code!')
    } finally {
      setIsSavingSource(false)
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        const success = importAllDataFromJSON(parsed)
        if (success) {
          refreshData()
          showToast('Đã nạp dữ liệu từ file JSON thành công!')
        } else {
          showToast('File JSON không đúng định dạng!')
        }
      } catch {
        showToast('Không thể đọc file JSON!')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="bg-[#f1f5f9] min-h-screen font-['Roboto'] pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#1B4C98] text-white px-5 py-3 shadow-2xl border-l-4 border-[#FF000F] text-xs font-bold animate-fadeIn flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          {notification}
        </div>
      )}

      {/* ── CUSTOM IN-APP CONFIRMATION DIALOG ─────────────────────────────────── */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md border border-gray-300 shadow-2xl p-6 text-xs flex flex-col">
            <div className="flex items-center gap-2 text-red-600 font-bold uppercase mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <h4 className="text-sm font-bold text-gray-900">{confirmDialog.title}</h4>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="bg-[#1B4C98] text-white border-b-4 border-[#FF000F] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-[#FF000F] text-white font-black text-xs flex items-center justify-center tracking-wider">
              ABB
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight font-['Roboto_Condensed'] uppercase tracking-wide">
                Hệ Thống Quản Trị Viễn Đông Electric
              </h1>
              <p className="text-[10px] text-white/70">Cổng Quản Trị Slider, Nội Dung & Yêu Cầu Báo Giá</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input for JSON import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json,application/json"
              className="hidden"
            />

            {/* 1-Click Save to Source Code Button */}
            <button
              onClick={handleSaveSource}
              disabled={isSavingSource}
              className="px-3.5 py-1.5 text-xs font-bold text-[#1B4C98] bg-[#FFCC00] hover:bg-yellow-400 active:scale-95 transition-all shadow-md flex items-center gap-1.5 border border-yellow-500 disabled:opacity-50"
              title="Lưu toàn bộ chỉnh sửa này trực tiếp vào file mã nguồn của dự án (để chuẩn bị push GitHub)"
            >
              {isSavingSource ? (
                <svg className="animate-spin h-3.5 w-3.5 text-[#1B4C98]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                </svg>
              )}
              <span className="font-bold tracking-tight">💾 Lưu vào Mã Nguồn</span>
            </button>

            {/* Backup JSON dropdown/buttons */}
            <button
              onClick={exportAllDataAsJSON}
              className="px-2.5 py-1.5 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1"
              title="Tải file sao lưu JSON về máy tính"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              Xuất JSON
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1"
              title="Nhập dữ liệu từ file sao lưu JSON"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
              </svg>
              Nạp JSON
            </button>

            <div className="h-5 w-px bg-white/20 mx-1"></div>

            <button
              onClick={() => onNavigate('home')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white hover:text-[#1B4C98] transition-all flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Xem Website
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Container */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Quick KPI Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 border border-gray-200 border-l-4 border-l-[#FF000F] shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-500">Banner Slider</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#FF000F]">{banners.length}</span>
              <span className="text-xs text-green-600 font-bold">
                {banners.filter((b) => b.isActive).length} đang phát
              </span>
            </div>
          </div>

          <div className="bg-white p-4 border border-gray-200 border-l-4 border-l-[#1B4C98] shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-500">Video trực tuyến</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#1B4C98]">{videos.length}</span>
              <span className="text-xs text-green-600 font-bold">
                {videos.filter((v) => !v.isHidden).length} hiển thị
              </span>
            </div>
          </div>

          <div className="bg-white p-4 border border-gray-200 border-l-4 border-l-red-500 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-500">Bài viết tin tức</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-red-600">{news.length}</span>
              <span className="text-xs text-gray-500 font-bold">
                {news.filter((n) => n.status === 'published').length} xuất bản
              </span>
            </div>
          </div>

          <div className="bg-white p-4 border border-gray-200 border-l-4 border-l-amber-500 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-500">Yêu cầu Báo giá</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-600">{quotes.length}</span>
              <span className="text-xs text-amber-700 font-bold">
                {quotes.filter((q) => q.status === 'new').length} đơn mới
              </span>
            </div>
          </div>

          <div className="bg-white p-4 border border-gray-200 border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-[11px] font-bold uppercase text-gray-500">Lượt xem tổng</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-blue-600">
                {(
                  videos.reduce((acc, v) => acc + (v.views || 0), 0) +
                  news.reduce((acc, n) => acc + (n.views || 0), 0)
                ).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 font-medium">Lượt xem</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex flex-wrap mb-6">
          {[
            { id: 'banners', label: `Quản lý Banner Slider (${banners.filter((b) => b.isActive).length})`, icon: '🎠' },
            { id: 'videos', label: `Quản lý Video (${videos.length})`, icon: '📹' },
            { id: 'news', label: `Quản lý Tin tức (${news.length})`, icon: '📰' },
            {
              id: 'quotes',
              label: `Yêu cầu Báo giá (${quotes.filter((q) => q.status === 'new').length})`,
              icon: '📋',
            },
            { id: 'settings', label: 'Cài đặt Website', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#FF000F] text-[#FF000F] bg-red-50/40'
                  : 'border-transparent text-gray-600 hover:text-[#1B4C98] hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 0: QUẢN LÝ BANNER SLIDER */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">
                  Danh sách Hero Banner Slider Trang Chủ
                </h3>
                <p className="text-xs text-gray-500">
                  Hệ thống tự động lướt slide mỗi 10 giây. Nút CTA được bảo vệ trong đường biên cơ sở an toàn của website.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddBanner}
                className="px-5 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                style={{ backgroundColor: 'var(--red, #FF000F)' }}
              >
                <span className="text-base leading-none">+</span> Thêm Banner Mới
              </button>
            </div>

            {/* Banner Table */}
            <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#f8fafc] text-gray-900 border-b border-gray-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">Thứ tự</th>
                    <th className="py-3.5 px-4 w-36">Hình ảnh Banner</th>
                    <th className="py-3.5 px-4">Tên Chiến Dịch / Banner</th>
                    <th className="py-3.5 px-4">Liên kết toàn Banner</th>
                    <th className="py-3.5 px-4">Nút CTA Gắn Trên Ảnh</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {banners.map((b, idx) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      {/* Order Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveBannerOrder(idx, 'up')}
                            className="p-1 text-gray-500 hover:text-[#1B4C98] disabled:opacity-20 font-bold"
                            title="Di chuyển lên"
                          >
                            ▲
                          </button>
                          <span className="font-bold text-xs text-[#1B4C98]">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === banners.length - 1}
                            onClick={() => moveBannerOrder(idx, 'down')}
                            className="p-1 text-gray-500 hover:text-[#1B4C98] disabled:opacity-20 font-bold"
                            title="Di chuyển xuống"
                          >
                            ▼
                          </button>
                        </div>
                      </td>

                      {/* Image Preview */}
                      <td className="py-3 px-4">
                        <div className="w-32 aspect-[16/6] bg-gray-100 overflow-hidden relative border border-gray-300">
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 text-xs line-clamp-2">
                          {b.title}
                        </p>
                      </td>

                      {/* Banner Link */}
                      <td className="py-3 px-4">
                        {b.bannerLink ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-mono bg-blue-50 text-[#1B4C98] border border-blue-200">
                            🔗 {b.bannerLink}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Không có</span>
                        )}
                      </td>

                      {/* Buttons Count */}
                      <td className="py-3 px-4">
                        {b.buttons && b.buttons.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {b.buttons.map((btn) => (
                              <span
                                key={btn.id}
                                className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-xs"
                              >
                                🔘 {btn.label} ({btn.posX}%, {btn.posY}%)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Chưa gắn nút</span>
                        )}
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleBannerActive(b.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
                            b.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {b.isActive ? '✓ Đang phát' : '✕ Đang ẩn'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditBanner(b)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1B4C98] hover:opacity-90"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBannerConfirm(b.id, b.title)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: QUẢN LÝ VIDEO */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Nhóm:</span>
                <span className="text-xs text-gray-400">
                  {videoCats.length} danh mục đang có
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setVideoCatModalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  ⚙️ Quản lý Nhóm Video
                </button>
                <button
                  onClick={openAddVideo}
                  className="px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--red, #FF000F)' }}
                >
                  <span className="text-base leading-none">+</span> Đăng Video Mới
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#f8fafc] text-gray-900 border-b border-gray-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-28">Hình thu nhỏ</th>
                    <th className="py-3.5 px-4">Tiêu đề Video</th>
                    <th className="py-3.5 px-4">Nhóm Video</th>
                    <th className="py-3.5 px-4">Ngày đăng</th>
                    <th className="py-3.5 px-4">Nổi bật</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {videos.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-24 aspect-video bg-gray-100 overflow-hidden relative border border-gray-200">
                          <img
                            src={v.thumb}
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                          {v.isFeatured && (
                            <span className="absolute top-1 left-1 bg-[#FF000F] text-white text-[9px] font-bold px-1 py-0.5">
                              Nổi bật
                            </span>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 font-mono">
                            {v.duration}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 line-clamp-2 text-xs">
                          {v.title}
                        </p>
                        {v.linkedProductSku && (
                          <span className="inline-block mt-1 text-[10px] text-blue-600 font-mono">
                            SKU: {v.linkedProductSku}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                          style={{ backgroundColor: '#1B4C98' }}
                        >
                          {v.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-600">{v.date}</td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleFeaturedVideo(v.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1 ${
                            v.isFeatured
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span>{v.isFeatured ? '★' : '☆'}</span>
                          {v.isFeatured ? 'Nổi bật' : 'Bình thường'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        {v.isHidden ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-600 rounded">
                            Đang ẩn
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
                            Hiển thị
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleHideVideo(v.id)}
                            className="px-2 py-1 text-[11px] font-semibold border border-gray-200 hover:bg-gray-100 text-gray-600"
                          >
                            {v.isHidden ? '👁️ Hiện' : 'Ẩn'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditVideo(v)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1B4C98] hover:opacity-90"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideoConfirm(v.id, v.title)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: QUẢN LÝ TIN TỨC & KỸ THUẬT */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="bg-white p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Chuyên mục:</span>
                <span className="text-xs text-gray-400">
                  {newsCats.length} chuyên mục bài viết
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setNewsCatModalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  ⚙️ Quản lý Chuyên Mục Tin
                </button>
                <button
                  onClick={openAddNews}
                  className="px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--red, #FF000F)' }}
                >
                  <span className="text-base leading-none">+</span> Viết Bài Mới
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#f8fafc] text-gray-900 border-b border-gray-200 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-28">Hình đại diện</th>
                    <th className="py-3.5 px-4">Tiêu đề bài viết</th>
                    <th className="py-3.5 px-4">Chuyên mục & Tags</th>
                    <th className="py-3.5 px-4">Tác giả & Ngày</th>
                    <th className="py-3.5 px-4">Nổi bật</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {news.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-24 h-14 bg-gray-100 overflow-hidden border border-gray-200 relative">
                          <NewsThumbnailView
                            thumb={n.thumb}
                            alt={n.title}
                            className="w-full h-full"
                          />
                          {n.isFeatured && (
                            <span className="absolute top-1 left-1 bg-[#FF000F] text-white text-[8px] font-bold px-1 py-0.5">
                              Nổi bật
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-bold text-gray-900 line-clamp-2 text-xs">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {n.summary}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-[#1B4C98] uppercase mb-1">
                          {n.category}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {n.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-gray-900 font-semibold">{n.author}</p>
                        <p className="text-gray-400 text-[11px] font-mono">{n.date}</p>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleFeaturedNews(n.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1 ${
                            n.isFeatured
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span>{n.isFeatured ? '★' : '☆'}</span>
                          {n.isFeatured ? 'Nổi bật' : 'Bình thường'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        {n.status === 'published' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
                            Bản nháp
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigate('newsDetail', createVietnameseSlug(n.slug || n.title))}
                            className="px-2 py-1 text-[11px] font-semibold border border-gray-300 hover:bg-gray-100 text-gray-700"
                          >
                            Xem
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditNews(n)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1B4C98] hover:opacity-90"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNewsConfirm(n.id, n.title)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: QUẢN LÝ YÊU CẦU BÁO GIÁ */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="bg-white p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">
                  Hộp thư Yêu cầu Báo giá B2B
                </h3>
                <p className="text-xs text-gray-500">
                  Tổng hợp tất cả danh sách thiết bị điện mà khách hàng gửi yêu cầu báo giá từ website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-[#f8fafc] text-gray-900 border-b border-gray-200 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Mã đơn</th>
                      <th className="py-3 px-3">Khách hàng</th>
                      <th className="py-3 px-3">Số ĐT & Tỉnh</th>
                      <th className="py-3 px-3">Loại khách</th>
                      <th className="py-3 px-3">Trạng thái</th>
                      <th className="py-3 px-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {quotes.map((q) => (
                      <tr
                        key={q.id}
                        onClick={() => setSelectedQuote(q)}
                        className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${
                          selectedQuote?.id === q.id ? 'bg-blue-50/80 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#1B4C98]">
                          {q.code}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {q.createdAt}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-gray-900">{q.customerName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{q.company}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-mono text-gray-800">{q.phone}</p>
                          <p className="text-[11px] text-gray-500">{q.province}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded border">
                            {q.customerType}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {q.status === 'new' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded">
                              Mới
                            </span>
                          )}
                          {q.status === 'contacted' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
                              Đã liên hệ
                            </span>
                          )}
                          {q.status === 'completed' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
                              Hoàn thành
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedQuote(q)
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1B4C98] hover:opacity-90"
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
                {selectedQuote ? (
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400">
                          Chi tiết phiếu yêu cầu
                        </span>
                        <h4 className="text-lg font-bold text-[#1B4C98] font-mono">
                          {selectedQuote.code}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuoteConfirm(selectedQuote.id, selectedQuote.code)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Xóa phiếu
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-gray-700 mb-6 bg-[#f8fafc] p-4 border border-gray-100">
                      <p>
                        <strong>Khách hàng:</strong> {selectedQuote.customerName}
                      </p>
                      <p>
                        <strong>Công ty:</strong> {selectedQuote.company || '—'}
                      </p>
                      <p>
                        <strong>Điện thoại:</strong>{' '}
                        <a
                          href={`tel:${selectedQuote.phone}`}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          {selectedQuote.phone}
                        </a>
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedQuote.email}
                      </p>
                      <p>
                        <strong>Tỉnh / Thành:</strong> {selectedQuote.province}
                      </p>
                      <p>
                        <strong>Phân loại:</strong> {selectedQuote.customerType}
                      </p>
                      {selectedQuote.note && (
                        <p className="pt-2 text-gray-600 italic border-t border-gray-200">
                          " {selectedQuote.note} "
                        </p>
                      )}
                    </div>

                    <div className="mb-6">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                        Danh sách thiết bị ({selectedQuote.items.length} món)
                      </h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedQuote.items.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="font-mono text-[10px] text-gray-500">
                                SKU: {item.sku}
                              </p>
                            </div>
                            <div className="text-right font-bold text-[#1B4C98]">
                              SL: {item.qty}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                        Cập nhật trạng thái xử lý:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuoteStatus(selectedQuote.id, 'new')}
                          className={`py-1.5 text-xs font-bold rounded transition-colors ${
                            selectedQuote.status === 'new'
                              ? 'bg-red-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Mới
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuoteStatus(selectedQuote.id, 'contacted')}
                          className={`py-1.5 text-xs font-bold rounded transition-colors ${
                            selectedQuote.status === 'contacted'
                              ? 'bg-amber-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Đã liên hệ
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQuoteStatus(selectedQuote.id, 'completed')}
                          className={`py-1.5 text-xs font-bold rounded transition-colors ${
                            selectedQuote.status === 'completed'
                              ? 'bg-green-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Hoàn thành
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    <p className="text-2xl mb-2">📋</p>
                    Chọn một yêu cầu báo giá từ danh sách bên trái để xem chi tiết danh mục thiết bị và thông tin liên hệ.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: CÀI ĐẶT WEBSITE */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveSettings} className="bg-white p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-base font-bold text-[#1B4C98] uppercase font-['Roboto_Condensed']">
                  Cấu hình Thông tin Doanh Nghiệp Viễn Đông
                </h3>
                <p className="text-xs text-gray-500">
                  Các thông tin dưới đây sẽ tự động cập nhật đồng bộ lên toàn bộ Header, Topbar và Footer.
                </p>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Hotline hiển thị:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.hotline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email liên hệ:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Link Zalo Chat:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.zaloUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, zaloUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Địa chỉ trụ sở:
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--red, #FF000F)' }}
                >
                  Lưu thay đổi Cấu hình
                </button>
              </div>
            </form>

            {/* Backup & Restore Box */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-bold text-[#1B4C98] uppercase mb-1">
                Sao lưu & Khôi phục Cơ Sở Dữ Liệu
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Bạn có thể xuất toàn bộ banner slider, video, tin tức và yêu cầu báo giá ra file JSON để lưu trữ về máy tính cá nhân.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1B4C98] hover:opacity-90 flex items-center gap-1.5"
                >
                  📥 Xuất File Sao Lưu (.JSON)
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2 text-xs font-bold text-red-600 border border-red-600 hover:bg-red-50"
                >
                  ⚠️ Đặt lại Dữ liệu Mặc định Gốc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: THÊM / SỬA BANNER SLIDER (TRUE 1:1 WITH CONTENT GUIDES & CLEAN BTN)*/}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[94vh] overflow-y-auto border border-gray-300 shadow-2xl flex flex-col text-xs">
            {/* Modal Header */}
            <div className="p-4 bg-[#1B4C98] text-white flex items-center justify-between border-b-2 border-[#FF000F] sticky top-0 z-30 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-base">🎠</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {editingBanner ? 'Chỉnh Sửa Banner Slider & Định Vị Nút CTA' : 'Thêm Banner Slider Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveBanner} className="p-5 sm:p-6 space-y-5">
              {/* Basic Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Tên Chiến Dịch / Tiêu Đề Banner (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="VD: Chương trình khuyến mãi Aptomat khối Tmax XT..."
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98] font-bold text-gray-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700 uppercase">
                      Hình ảnh Poster Banner (*):
                    </label>
                    <label className="text-[11px] font-bold text-[#1B4C98] hover:text-blue-800 cursor-pointer flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
                      <span>📁</span> Tải ảnh từ máy tính
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('Kích thước ảnh tối đa 5MB!')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = (uploadEvent) => {
                              const result = uploadEvent.target?.result as string
                              if (result) {
                                setBannerForm({ ...bannerForm, imageUrl: result })
                                showToast('Đã tải ảnh từ máy tính lên banner!')
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    placeholder="Dán link ảnh https://... hoặc bấm nút Tải ảnh từ máy tính"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-semibold">Ảnh mẫu có sẵn:</span>
                    {sampleBannerImages.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, imageUrl: s.url })}
                        className="px-2 py-0.5 text-[9px] bg-gray-100 hover:bg-red-50 hover:text-[#FF000F] border border-gray-200 cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner-Wide Link Configuration */}
              <div className="p-3 bg-blue-50/70 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="font-bold text-[#1B4C98] uppercase text-[11px] flex items-center gap-1.5">
                    <span>🔗</span> Liên Kết Khi Bấm Vào Toàn Banner (Không qua nút)
                  </span>
                  <span className="text-[10px] text-gray-500">
                    (Khách hàng bấm vào bất kỳ vị trí nào trên ảnh cũng sẽ mở link này)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <select
                      value={bannerForm.bannerLinkType}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          bannerLinkType: e.target.value as any,
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white text-xs"
                    >
                      <option value="internal">Trang nội bộ website</option>
                      <option value="external">Đường link ngoài / PDF</option>
                      <option value="phone">Gọi Hotline</option>
                      <option value="zalo">Chat Zalo</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    {bannerForm.bannerLinkType === 'internal' ? (
                      <select
                        value={bannerForm.bannerLink}
                        onChange={(e) => setBannerForm({ ...bannerForm, bannerLink: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white text-xs"
                      >
                        <option value="">-- Không gán link (Chỉ xem ảnh) --</option>
                        <option value="products">Trang Sản Phẩm ABB</option>
                        <option value="cart">Trang Giỏ Hàng & Báo Giá</option>
                        <option value="map">Hệ Thống Đại Lý & Phân Phối</option>
                        <option value="videos">Trang Video Kỹ Thuật</option>
                        <option value="news">Trang Tin Tức & Khuyến Mãi</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={bannerForm.bannerLink}
                        onChange={(e) => setBannerForm({ ...bannerForm, bannerLink: e.target.value })}
                        placeholder={
                          bannerForm.bannerLinkType === 'phone'
                            ? '02839435276'
                            : 'https://...'
                        }
                        className="w-full px-2.5 py-1.5 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════════════════ */}
              {/* 1:1 LIVE WYSIWYG INTERACTIVE CANVAS WITH CONTENT GUIDES        */}
              {/* ═════════════════════════════════════════════════════════════════ */}
              <div className="p-4 bg-slate-900 border border-slate-700 shadow-xl space-y-3">
                {/* Canvas Controls Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-slate-700 text-white">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span>🎨</span> Canvas Banner Trực Quan (Khớp 100% Ảnh Gốc & Trang Chủ)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-cyan-300 border border-slate-600 rounded">
                      📐 Kích thước ảnh gốc: {imageNaturalSize.width} × {imageNaturalSize.height}px
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGuides(!showGuides)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                        showGuides
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-slate-800 text-gray-400 border-slate-600'
                      }`}
                    >
                      {showGuides ? '👁️ Đường Biên: BẬT' : 'Đường Biên: TẮT'}
                    </button>
                  </div>

                  {/* Device mode + Quick Add Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Device selector */}
                    <div className="flex bg-slate-800 p-0.5 rounded border border-slate-600 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPreviewDeviceMode('desktop')}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          previewDeviceMode === 'desktop'
                            ? 'bg-[#1B4C98] text-white font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Desktop màn hình chuẩn (1920px)"
                      >
                        🖥️ Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDeviceMode('laptop')}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          previewDeviceMode === 'laptop'
                            ? 'bg-[#1B4C98] text-white font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Laptop (1366px)"
                      >
                        💻 Laptop
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDeviceMode('mobile')}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          previewDeviceMode === 'mobile'
                            ? 'bg-[#1B4C98] text-white font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Mobile iPhone 15 / 16 (393px)"
                      >
                        📱 Mobile
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDeviceMode('mobile-sm')}
                        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          previewDeviceMode === 'mobile-sm'
                            ? 'bg-[#1B4C98] text-white font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Mobile nhỏ iPhone SE / Galaxy (375px)"
                      >
                        📱 Mini (375px)
                      </button>
                    </div>

                    {/* Button Creator */}
                    <button
                      type="button"
                      onClick={() => addNewButton('red')}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#FF000F] hover:bg-red-700 shadow-xs cursor-pointer"
                    >
                      + Nút Đỏ
                    </button>
                    <button
                      type="button"
                      onClick={() => addNewButton('navy')}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#1B4C98] hover:bg-blue-900 shadow-xs cursor-pointer"
                    >
                      + Nút Xanh
                    </button>
                    <button
                      type="button"
                      onClick={() => addNewButton('white')}
                      className="px-2.5 py-1 text-[11px] font-bold text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 shadow-xs cursor-pointer"
                    >
                      + Nút Trắng
                    </button>
                    <button
                      type="button"
                      onClick={() => addNewButton('glass')}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-600 border border-slate-500 shadow-xs cursor-pointer"
                    >
                      + Nút Kính
                    </button>
                  </div>
                </div>

                {/* HUD STATUS BAR: Displays exact coordinates cleanly without touching buttons */}
                <div className="px-3 py-2 bg-slate-800/90 border border-slate-700 rounded text-[11px] flex flex-wrap items-center justify-between text-gray-300 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-cyan-400">📍 Nút đang chọn:</span>
                    {selectedBtnIndex !== null && bannerForm.buttons[selectedBtnIndex] ? (
                      <span className="font-mono text-yellow-300 font-bold bg-black/60 px-2 py-0.5 rounded border border-yellow-500/40">
                        "{bannerForm.buttons[selectedBtnIndex].label}" ➔ Pixel: ({bannerForm.buttons[selectedBtnIndex].pixelX ?? Math.round((bannerForm.buttons[selectedBtnIndex].posX / 100) * imageNaturalSize.width)}px, {bannerForm.buttons[selectedBtnIndex].pixelY ?? Math.round((bannerForm.buttons[selectedBtnIndex].posY / 100) * imageNaturalSize.height)}px) | Tỉ lệ: ({bannerForm.buttons[selectedBtnIndex].posX}%, {bannerForm.buttons[selectedBtnIndex].posY}%)
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa chọn nút nào (Nhấn chuột lên ảnh hoặc nút để chỉnh sửa)</span>
                    )}
                  </div>

                  {/* Mode switcher & Presets */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Chế độ định vị:</span>
                    <button
                      type="button"
                      onClick={() => setPositionMode(positionMode === 'pixel' ? 'percent' : 'pixel')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-slate-700 text-yellow-300 border border-slate-500 rounded cursor-pointer"
                    >
                      {positionMode === 'pixel' ? '📏 Định vị Pixel Thực (Chuẩn 1:1)' : '📊 Định vị % (Fluid)'}
                    </button>
                  </div>
                </div>

                {/* The Interactive Drag Canvas (Rendered at exact natural aspect ratio of the banner image) */}
                <div
                  className="w-full flex items-center justify-center p-3 bg-black/70 overflow-hidden"
                >
                  <div
                    ref={bannerPreviewRef}
                    onMouseDown={handleCanvasMouseDown}
                    style={{
                      containerType: 'inline-size',
                      aspectRatio: `${imageNaturalSize.width} / ${imageNaturalSize.height}`,
                    }}
                    className={`relative bg-[#1a1a1a] select-none border-2 border-slate-600 shadow-2xl transition-all duration-300 ${
                      previewDeviceMode === 'desktop'
                        ? 'w-full max-w-[1200px]'
                        : previewDeviceMode === 'laptop'
                        ? 'w-[900px] max-w-full'
                        : previewDeviceMode === 'mobile'
                        ? 'w-[393px] max-w-full'
                        : 'w-[375px] max-w-full'
                    }`}
                  >
                    {/* Background Image */}
                    {bannerForm.imageUrl ? (
                      <img
                        src={bannerForm.imageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-contain object-center pointer-events-none select-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                        Chưa có hình ảnh poster
                      </div>
                    )}

                    {/* ── CONTENT CONTAINER BOUNDARY GUIDES ── */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-x-0 inset-y-0 border border-cyan-400/40">
                          <div
                            style={{ top: `${BOUND_TOP}%` }}
                            className="absolute left-0 right-0 h-px border-t border-dotted border-cyan-400/60"
                          />
                          <div
                            style={{ top: `${BOUND_BOTTOM}%` }}
                            className="absolute left-0 right-0 h-px border-b border-dotted border-cyan-400/60"
                          />
                        </div>
                      </div>
                    )}

                    {/* Dragging crosshair guide lines */}
                    {draggingBtnIndex !== null && (
                      <div className="absolute inset-0 pointer-events-none z-15">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 border-dashed" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 border-dashed" />
                      </div>
                    )}

                    {/* ── 100% CLEAN BUTTONS: PROPORTIONALLY SCALED VIA CONTAINER QUERY (1:1 KHỚP TRANG CHỦ) ── */}
                    {bannerForm.buttons.map((btn, idx) => {
                      const isSelected = selectedBtnIndex === idx

                      let styleClass =
                        'bg-[#FF000F] text-white hover:bg-red-700 shadow-md border-0'
                      if (btn.styleType === 'navy') {
                        styleClass =
                          'bg-[#1B4C98] text-white hover:bg-blue-900 shadow-md border-0'
                      } else if (btn.styleType === 'white') {
                        styleClass =
                          'bg-white text-gray-900 hover:bg-gray-100 shadow-md border border-gray-300'
                      } else if (btn.styleType === 'glass') {
                        styleClass =
                          'bg-black/75 backdrop-blur-md text-white hover:bg-black/90 shadow-md border border-white/30'
                      }

                      // Proportional font size & padding matching container width (1:1 identical to HeroSlider)
                      let fontSize = 'calc(1.15cqw + 2px)'
                      let padding = 'calc(0.45cqw + 2px) calc(1.2cqw + 6px)'
                      if (btn.size === 'sm') {
                        fontSize = 'calc(0.95cqw + 1px)'
                        padding = 'calc(0.35cqw + 1px) calc(0.9cqw + 4px)'
                      } else if (btn.size === 'lg') {
                        fontSize = 'calc(1.35cqw + 3px)'
                        padding = 'calc(0.55cqw + 3px) calc(1.5cqw + 8px)'
                      }

                      return (
                        <div
                          key={btn.id}
                          onMouseDown={(e) => handleButtonMouseDown(e, idx)}
                          style={{
                            left: `${btn.posX}%`,
                            top: `${btn.posY}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize,
                            padding,
                          }}
                          className={`absolute z-20 cursor-grab active:cursor-grabbing select-none flex items-center gap-[0.4cqw] font-bold tracking-tight rounded-[3px] transition-all whitespace-nowrap leading-none ${styleClass} ${
                            isSelected
                              ? 'outline-3 outline-yellow-400 z-30 shadow-2xl scale-105 ring-2 ring-black'
                              : 'opacity-95 hover:opacity-100 hover:scale-102'
                          }`}
                        >
                          <span>{btn.label || 'Nút ' + (idx + 1)}</span>
                          {btn.actionType === 'phone' && (
                            <svg style={{ width: '1.1cqw', height: '1.1cqw', minWidth: '7px', minHeight: '7px' }} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Helper Note */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-300 px-1 gap-2">
                  <span>
                    🖱️ <strong>Kéo thả:</strong> Nhấn giữ chuột lên nút để định vị chính xác. Tọa độ Pixel và % sẽ tự động đồng bộ.
                  </span>
                  <span>
                    🎯 <strong>Click ảnh:</strong> Bấm vào vùng trống để tạo nhanh nút mới tại điểm bấm.
                  </span>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════════════════ */}
              {/* MOBILE DISPLAY & CTA AUTO-ALIGN OPTIONS                         */}
              {/* ═════════════════════════════════════════════════════════════════ */}
              <div className="p-3 bg-amber-50 border border-amber-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
                    <span>📱</span> Tùy Chọn Hiển Thị Nút CTA Trên Màn Hình Điện Thoại (Mobile Responsive):
                  </span>
                  <span className="text-[10px] text-amber-800">
                    Tự động scale và sắp xếp chống chồng đè khi xem trên iPhone / Android
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'hotspot',
                      title: '🎯 Hotspot Pin (Cố định vị trí chuẩn tỉ lệ)',
                      desc: 'Nút bám đúng vị trí trên ảnh, tự động scale down kích thước font & padding siêu nhỏ gọn để tránh chồng đè.',
                    },
                    {
                      id: 'bottom-bar',
                      title: '📊 Bottom Bar (Khối ngang sát đáy banner)',
                      desc: 'Gom các nút CTA xuống sát mép dưới cùng của banner thành thanh ngang thanh lịch, không che lấp chi tiết poster.',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-2.5 border rounded cursor-pointer transition-all flex flex-col justify-between ${
                        bannerForm.mobileCtaLayout === opt.id
                          ? 'border-[#1B4C98] bg-white shadow-sm ring-1 ring-[#1B4C98]'
                          : 'border-amber-200 bg-amber-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="mobileCtaLayout"
                          checked={bannerForm.mobileCtaLayout === opt.id}
                          onChange={() => setBannerForm({ ...bannerForm, mobileCtaLayout: opt.id as any })}
                          className="accent-[#1B4C98]"
                        />
                        <span className="font-bold text-xs text-gray-900">{opt.title}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════════════════ */}
              {/* BUTTON PROPERTIES INSPECTOR & LIST                             */}
              {/* ═════════════════════════════════════════════════════════════════ */}
              {bannerForm.buttons.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 uppercase text-xs">
                      Chi Tiết Thuộc Tính Nút CTA Đang Chọn:
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Tổng số nút: <strong>{bannerForm.buttons.length}</strong>
                    </span>
                  </div>

                  {/* Tabs of Buttons */}
                  <div className="flex flex-wrap gap-1.5 pb-2 border-b border-gray-200">
                    {bannerForm.buttons.map((btn, idx) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setSelectedBtnIndex(idx)}
                        className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                          selectedBtnIndex === idx
                            ? 'bg-[#1B4C98] text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>🔘</span>
                        <span>{btn.label || `Nút ${idx + 1}`}</span>
                        <span className="text-[9px] font-mono opacity-80">
                          (X:{btn.posX}%, Y:{btn.posY}%)
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active Selected Button Property Editor */}
                  {selectedBtnIndex !== null && bannerForm.buttons[selectedBtnIndex] && (
                    <div className="p-3 bg-white border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1B4C98] text-xs">
                            Cấu hình: Nút {selectedBtnIndex + 1}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {bannerForm.buttons[selectedBtnIndex].id}
                          </span>
                        </div>

                        {/* Quick Snap Alignment Presets */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-semibold mr-1">Căn nhanh:</span>
                          <button
                            type="button"
                            onClick={() => snapButtonTo(selectedBtnIndex, 'bottom-left')}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer"
                            title="Góc dưới bên trái"
                          >
                            ↙ Trái dưới
                          </button>
                          <button
                            type="button"
                            onClick={() => snapButtonTo(selectedBtnIndex, 'bottom-center')}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer"
                            title="Chính giữa bên dưới"
                          >
                            ⬇ Giữa dưới
                          </button>
                          <button
                            type="button"
                            onClick={() => snapButtonTo(selectedBtnIndex, 'bottom-right')}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer"
                            title="Góc dưới bên phải"
                          >
                            ↘ Phải dưới
                          </button>
                          <button
                            type="button"
                            onClick={() => snapButtonTo(selectedBtnIndex, 'center-left')}
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer"
                            title="Chính giữa bên trái"
                          >
                            ⬅ Trái giữa
                          </button>

                          <div className="h-4 w-px bg-gray-300 mx-1" />

                          <button
                            type="button"
                            onClick={() => removeButton(selectedBtnIndex)}
                            className="text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer ml-1"
                          >
                            ✕ Xóa nút
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Tên hiển thị trên nút:
                          </label>
                          <input
                            type="text"
                            value={bannerForm.buttons[selectedBtnIndex].label}
                            onChange={(e) =>
                              updateButtonField(selectedBtnIndex, 'label', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 border border-gray-300 text-xs font-bold text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Hành động khi bấm:
                          </label>
                          <select
                            value={bannerForm.buttons[selectedBtnIndex].actionType}
                            onChange={(e) =>
                              updateButtonField(selectedBtnIndex, 'actionType', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 border border-gray-300 text-xs bg-white"
                          >
                            <option value="internal">Trang nội bộ website</option>
                            <option value="external">Link ngoài / Tải file PDF</option>
                            <option value="phone">Gọi điện Hotline</option>
                            <option value="zalo">Chat Zalo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Đích đến (Trang / URL / SĐT):
                          </label>
                          {bannerForm.buttons[selectedBtnIndex].actionType === 'internal' ? (
                            <select
                              value={bannerForm.buttons[selectedBtnIndex].targetUrl}
                              onChange={(e) =>
                                updateButtonField(selectedBtnIndex, 'targetUrl', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 border border-gray-300 text-xs bg-white"
                            >
                              <option value="products">Trang Sản Phẩm ABB</option>
                              <option value="cart">Trang Giỏ Hàng & Báo Giá</option>
                              <option value="map">Hệ Thống Đại Lý & Phân Phối</option>
                              <option value="videos">Trang Video</option>
                              <option value="news">Trang Tin Tức</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={bannerForm.buttons[selectedBtnIndex].targetUrl}
                              onChange={(e) =>
                                updateButtonField(selectedBtnIndex, 'targetUrl', e.target.value)
                              }
                              placeholder={
                                bannerForm.buttons[selectedBtnIndex].actionType === 'phone'
                                  ? '02839435276'
                                  : 'https://...'
                              }
                              className="w-full px-2.5 py-1.5 border border-gray-300 text-xs"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                            Màu sắc & Kích thước:
                          </label>
                          <div className="flex gap-1.5">
                            <select
                              value={bannerForm.buttons[selectedBtnIndex].styleType}
                              onChange={(e) =>
                                updateButtonField(selectedBtnIndex, 'styleType', e.target.value)
                              }
                              className="w-1/2 px-2 py-1.5 border border-gray-300 text-xs bg-white font-semibold"
                            >
                              <option value="red">Đỏ ABB</option>
                              <option value="navy">Xanh Viễn Đông</option>
                              <option value="white">Trắng tinh</option>
                              <option value="glass">Kính mờ</option>
                            </select>
                            <select
                              value={bannerForm.buttons[selectedBtnIndex].size}
                              onChange={(e) =>
                                updateButtonField(selectedBtnIndex, 'size', e.target.value)
                              }
                              className="w-1/2 px-2 py-1.5 border border-gray-300 text-xs bg-white font-semibold"
                            >
                              <option value="sm">Nhỏ</option>
                              <option value="md">Vừa</option>
                              <option value="lg">Lớn</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Precise Numeric Position Sliders with Dual Unit (Pixel & %) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 bg-gray-50/70 p-2.5 rounded">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-700 mb-1">
                            <span className="font-semibold">
                              Vị trí ngang X ({positionMode === 'pixel' ? 'Pixel thực trên ảnh' : 'Tỉ lệ %'}):
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-[#1B4C98] bg-white px-2 py-0.5 border rounded">
                                {bannerForm.buttons[selectedBtnIndex].pixelX ?? Math.round((bannerForm.buttons[selectedBtnIndex].posX / 100) * imageNaturalSize.width)} px
                              </span>
                              <span className="font-mono text-gray-500 text-[10px]">
                                ({bannerForm.buttons[selectedBtnIndex].posX}%)
                              </span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={BOUND_LEFT}
                            max={BOUND_RIGHT}
                            value={bannerForm.buttons[selectedBtnIndex].posX}
                            onChange={(e) =>
                              updateButtonField(
                                selectedBtnIndex,
                                'posX',
                                Number(e.target.value)
                              )
                            }
                            className="w-full accent-[#1B4C98] cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-700 mb-1">
                            <span className="font-semibold">
                              Vị trí dọc Y ({positionMode === 'pixel' ? 'Pixel thực trên ảnh' : 'Tỉ lệ %'}):
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-[#1B4C98] bg-white px-2 py-0.5 border rounded">
                                {bannerForm.buttons[selectedBtnIndex].pixelY ?? Math.round((bannerForm.buttons[selectedBtnIndex].posY / 100) * imageNaturalSize.height)} px
                              </span>
                              <span className="font-mono text-gray-500 text-[10px]">
                                ({bannerForm.buttons[selectedBtnIndex].posY}%)
                              </span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={BOUND_TOP}
                            max={BOUND_BOTTOM}
                            value={bannerForm.buttons[selectedBtnIndex].posY}
                            onChange={(e) =>
                              updateButtonField(
                                selectedBtnIndex,
                                'posY',
                                Number(e.target.value)
                              )
                            }
                            className="w-full accent-[#1B4C98] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={bannerForm.isActive}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, isActive: e.target.checked })
                    }
                  />
                  <span>Kích hoạt hiển thị banner này trên trang chủ</span>
                </label>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-7 py-2 font-bold text-white hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: 'var(--red, #FF000F)' }}
                >
                  {editingBanner ? 'Lưu cập nhật' : 'Thêm banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: THÊM / SỬA VIDEO */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-2xl flex flex-col">
            <div className="p-4 bg-[#1B4C98] text-white flex items-center justify-between border-b-2 border-[#FF000F]">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {editingVideo ? 'Chỉnh sửa Video' : 'Đăng tải Video Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveVideo} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Tiêu đề hiển thị của Video (*):
                </label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="Ví dụ: Giới thiệu dòng công tắc ABB Inora thế hệ mới"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Nhóm phân loại Video (*):
                  </label>
                  <select
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white"
                  >
                    {videoCats.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Ngày đăng (DD/MM/YYYY):
                  </label>
                  <input
                    type="text"
                    value={videoForm.date}
                    onChange={(e) => setVideoForm({ ...videoForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Nguồn Video (Nhúng hoặc Tải lên):
                </label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="embedType"
                      checked={videoForm.embedType === 'youtube'}
                      onChange={() => setVideoForm({ ...videoForm, embedType: 'youtube' })}
                    />
                    <span>YouTube Embed</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="embedType"
                      checked={videoForm.embedType === 'drive'}
                      onChange={() => setVideoForm({ ...videoForm, embedType: 'drive' })}
                    />
                    <span>Google Drive</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="embedType"
                      checked={videoForm.embedType === 'vimeo'}
                      onChange={() => setVideoForm({ ...videoForm, embedType: 'vimeo' })}
                    />
                    <span>Vimeo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="embedType"
                      checked={videoForm.embedType === 'direct'}
                      onChange={() => setVideoForm({ ...videoForm, embedType: 'direct' })}
                    />
                    <span>File Trực tiếp (MP4)</span>
                  </label>
                </div>

                <input
                  type="text"
                  required
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="Dán link YouTube / Vimeo / Drive hoặc link MP4..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Thời lượng hiển thị:
                  </label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Mã sản phẩm liên quan (SKU):
                  </label>
                  <input
                    type="text"
                    value={videoForm.linkedProductSku}
                    onChange={(e) => setVideoForm({ ...videoForm, linkedProductSku: e.target.value })}
                    placeholder="VD: FRAMIA-SW1-WH"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Hình ảnh Thu nhỏ (Thumbnail URL):
                </label>
                <input
                  type="text"
                  value={videoForm.thumb}
                  onChange={(e) => setVideoForm({ ...videoForm, thumb: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoForm.isFeatured}
                    onChange={(e) => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                  />
                  <span className="font-bold text-red-600">★ Ghim làm Video Nổi bật</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoForm.isHidden}
                    onChange={(e) => setVideoForm({ ...videoForm, isHidden: e.target.checked })}
                  />
                  <span className="font-bold text-gray-800">Ẩn video tạm thời</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: 'var(--red, #FF000F)' }}
                >
                  {editingVideo ? 'Lưu cập nhật' : 'Đăng video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: QUẢN LÝ NHÓM VIDEO */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {videoCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md border border-gray-300 shadow-2xl p-6 text-xs">
            <h3 className="text-sm font-bold uppercase text-[#1B4C98] pb-3 border-b border-gray-200 mb-4">
              Quản lý Danh mục Nhóm Video
            </h3>

            <div className="space-y-2 mb-6 max-h-56 overflow-y-auto">
              {videoCats.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200"
                >
                  <span className="font-bold text-gray-800">{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeVideoCategory(cat)}
                    className="text-red-600 hover:text-red-800 font-bold px-2 py-1 hover:bg-red-50 cursor-pointer"
                  >
                    ✕ Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newVideoCatInput}
                onChange={(e) => setNewVideoCatInput(e.target.value)}
                placeholder="Tên nhóm video mới..."
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
              />
              <button
                type="button"
                onClick={addVideoCategory}
                className="px-4 py-2 font-bold text-white bg-[#1B4C98] hover:opacity-90 cursor-pointer"
              >
                + Thêm
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setVideoCatModalOpen(false)}
                className="px-5 py-2 font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: THÊM / SỬA TIN TỨC */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-gray-300 shadow-2xl flex flex-col">
            <div className="p-4 bg-[#1B4C98] text-white flex items-center justify-between border-b-2 border-[#FF000F] sticky top-0 z-10">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {editingNews ? 'Chỉnh sửa Bài viết' : 'Soạn thảo Bài viết Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setNewsModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveNews} className="p-6 space-y-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Tiêu đề bài viết (*):
                </label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="Ví dụ: Hướng dẫn chọn MCB và RCBO đúng chuẩn cho căn hộ cao cấp..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-[#1B4C98] font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Chuyên mục bài viết (*):
                  </label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white"
                  >
                    {newsCats.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Tác giả:
                  </label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Ngày xuất bản:
                  </label>
                  <input
                    type="text"
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Đoạn mô tả ngắn:
                </label>
                <textarea
                  rows={2}
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  placeholder="Tóm tắt 1 - 2 câu nổi bật của bài viết..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                />
              </div>

              {/* Thumbnail Cropper & Viewport Tool */}
              <ThumbnailCropper
                value={newsForm.thumb}
                onChange={(val) => setNewsForm({ ...newsForm, thumb: val })}
                label="Ảnh đại diện bài viết (Thumbnail):"
              />

              {/* Rich-Text WYSIWYG Editor */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Nội dung chi tiết bài viết:
                </label>
                <RichTextEditor
                  value={newsForm.content}
                  onChange={(val) => setNewsForm({ ...newsForm, content: val })}
                  minHeight="280px"
                />
              </div>

              {/* Quote Configuration */}
              <div className="p-4 bg-gray-50 border border-gray-200">
                <h5 className="font-bold text-gray-800 uppercase mb-2">
                  Cấu hình Khung Trích dẫn nổi bật (Quote Box - Tùy chọn)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Câu trích dẫn nổi bật:
                    </label>
                    <input
                      type="text"
                      value={newsForm.quote}
                      onChange={(e) => setNewsForm({ ...newsForm, quote: e.target.value })}
                      placeholder="Câu danh ngôn hoặc nhận định của chuyên gia..."
                      className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Tên tác giả câu trích dẫn:
                    </label>
                    <input
                      type="text"
                      value={newsForm.quoteAuthor}
                      onChange={(e) => setNewsForm({ ...newsForm, quoteAuthor: e.target.value })}
                      placeholder="VD: Giám đốc Kỹ thuật ABB"
                      className="w-full px-3 py-1.5 border border-gray-300 focus:outline-none focus:border-[#1B4C98] bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Gắn Tags (Cách nhau bởi dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="MCCB, Tmax XT, ABB Vietnam, Kỹ thuật"
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsForm.isFeatured}
                      onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })}
                    />
                    <span className="font-bold text-red-600">★ Ghim làm Bài viết Nổi bật</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="postStatus"
                      checked={newsForm.status === 'published'}
                      onChange={() => setNewsForm({ ...newsForm, status: 'published' })}
                    />
                    <span className="font-bold text-green-700">Xuất bản công khai</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="postStatus"
                      checked={newsForm.status === 'draft'}
                      onChange={() => setNewsForm({ ...newsForm, status: 'draft' })}
                    />
                    <span className="font-bold text-amber-700">Lưu bản nháp</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 font-bold text-white hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: 'var(--red, #FF000F)' }}
                  >
                    {editingNews ? 'Lưu cập nhật' : 'Đăng bài viết'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: QUẢN LÝ CHUYÊN MỤC TIN TỨC */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {newsCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md border border-gray-300 shadow-2xl p-6 text-xs">
            <h3 className="text-sm font-bold uppercase text-[#1B4C98] pb-3 border-b border-gray-200 mb-4">
              Quản lý Chuyên mục Tin tức & Kỹ thuật
            </h3>

            <div className="space-y-2 mb-6 max-h-56 overflow-y-auto">
              {newsCats.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200"
                >
                  <span className="font-bold text-gray-800">{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeNewsCategory(cat)}
                    className="text-red-600 hover:text-red-800 font-bold px-2 py-1 hover:bg-red-50 cursor-pointer"
                  >
                    ✕ Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newNewsCatInput}
                onChange={(e) => setNewNewsCatInput(e.target.value)}
                placeholder="Tên chuyên mục mới..."
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#1B4C98]"
              />
              <button
                type="button"
                onClick={addNewsCategory}
                className="px-4 py-2 font-bold text-white bg-[#1B4C98] hover:opacity-90 cursor-pointer"
              >
                + Thêm
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setNewsCatModalOpen(false)}
                className="px-5 py-2 font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
