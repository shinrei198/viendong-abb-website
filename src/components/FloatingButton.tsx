import { useState } from 'react'

export default function FloatingButton() {
  const [open, setOpen] = useState(false)

  const actions = [
    {
      label: 'Gọi điện',
      bg: '#22c55e',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      ),
      href: 'tel:02839435276',
    },
    {
      label: 'Email',
      bg: '#f97316',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      href: 'mailto:viendongelectric@gmail.com',
    },
  ]

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
            key={a.label}
            href={a.href}
            title={a.label}
            target={a.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
            style={{ backgroundColor: a.bg }}
          >
            {a.icon}
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
