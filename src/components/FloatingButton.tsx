import { useState, useEffect } from 'react'
import { getStoredSiteSettings, type FloatingContactAction } from '@/data/siteData'
import CmsIcon from '@/components/CmsIcon'

export default function FloatingButton() {
  const [open, setOpen] = useState(false)
  const [actions, setActions] = useState<FloatingContactAction[]>([])

  useEffect(() => {
    const loadActions = () => {
      const s = getStoredSiteSettings()
      const list = s.floatingActions || []
      setActions(list.filter((a) => a.isActive !== false))
    }

    loadActions()
    window.addEventListener('viendong_storage_update', loadActions)
    return () => window.removeEventListener('viendong_storage_update', loadActions)
  }, [])

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">
      {/* Action items */}
      <div
        className="flex flex-col items-center gap-3 transition-all duration-300 origin-bottom"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(10px)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {actions.map((a) => (
          <a
            key={a.id || a.label}
            href={a.href}
            title={a.label}
            target={a.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
            style={{ backgroundColor: a.bg || '#1B4C98' }}
          >
            <CmsIcon
              config={{
                ...a.iconConfig,
                type: a.iconConfig?.type || 'builtin',
                builtinName: a.iconConfig?.builtinName || 'phone',
                showBox: false,
                tint: true,
              }}
              inverted={true}
              overrideSize={22}
            />
          </a>
        ))}

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
          style={{ backgroundColor: '#a78bfa' }}
          title="Đóng"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {/* Main toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #FF000F 0%, #b30000 100%)' }}
          title="Liên hệ hỗ trợ"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        </button>
      )}
    </div>
  )
}
