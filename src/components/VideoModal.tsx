import { useEffect } from 'react'
import { VideoItem } from '@/data/siteData'

interface VideoModalProps {
  video: VideoItem | null
  onClose: () => void
  onNavigate?: (page: string, productId?: string) => void
}

export default function VideoModal({ video, onClose, onNavigate }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (video) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [video, onClose])

  if (!video) return null

  // Format embed url if needed
  const getEmbedUrl = (url: string, type: VideoItem['embedType']) => {
    if (!url) return ''
    if (type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('embed/')) {
        return url + (url.includes('?') ? '&autoplay=1' : '?autoplay=1')
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || ''
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url
    }
    if (type === 'vimeo' || url.includes('vimeo.com')) {
      const vimeoId = url.split('/').pop()?.split('?')[0]
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
    }
    if (type === 'drive' || url.includes('drive.google.com')) {
      if (url.includes('/view')) return url.replace('/view', '/preview')
      return url
    }
    return url
  }

  const isDirectVideo =
    video.embedType === 'direct' ||
    video.embedType === 'upload' ||
    video.videoUrl.endsWith('.mp4') ||
    video.videoUrl.endsWith('.webm') ||
    video.videoUrl.endsWith('.mov') ||
    video.videoUrl.startsWith('blob:') ||
    video.videoUrl.startsWith('data:')

  const embedSrc = getEmbedUrl(video.videoUrl, video.embedType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-[#111827] text-white rounded-none shadow-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider"
              style={{ backgroundColor: 'var(--red)', color: 'white' }}
            >
              {video.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">{video.date}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng (ESC)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {isDirectVideo ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          ) : (
            <iframe
              src={embedSrc}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-[#0f172a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white leading-snug mb-1 font-['Roboto']">
              {video.title}
            </h3>
            <p className="text-xs text-gray-400">
              Thời lượng: <strong className="text-gray-200">{video.duration || '0:30'}</strong> • Phát hành bởi Viễn Đông Electric & ABB
            </p>
          </div>

          {video.linkedProductSku && onNavigate && (
            <button
              onClick={() => {
                onClose()
                onNavigate('products')
              }}
              className="px-5 py-2.5 text-xs font-bold text-white flex-shrink-0 transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'var(--red)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              Xem sản phẩm liên quan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
