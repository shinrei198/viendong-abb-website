import logoABB from '@/imports/abb-seeklogo.png'

interface ProductImageBrandingProps {
  series: string
  badge?: string
  size?: 'compact' | 'card' | 'detail'
}

const sizeStyles = {
  compact: {
    logoX: 8,
    inset: 6,
    seriesClass: 'px-1.5 py-0.5 text-[8px]',
    badgeClass: 'px-1.5 py-0.5 text-[8px]',
  },
  card: {
    logoX: 12,
    inset: 8,
    seriesClass: 'px-2 py-0.5 text-[9px]',
    badgeClass: 'px-2 py-0.5 text-[9px]',
  },
  detail: {
    logoX: 18,
    inset: 16,
    seriesClass: 'px-3 py-1.5 text-xs',
    badgeClass: 'px-3 py-1.5 text-xs',
  },
} as const

export default function ProductImageBranding({ series, badge, size = 'card' }: ProductImageBrandingProps) {
  const styles = sizeStyles[size]

  return (
    <div
      className="pointer-events-none flex w-full flex-shrink-0 items-center justify-between gap-2"
      style={{
        padding: `${styles.inset}px ${styles.logoX}px ${styles.inset}px ${styles.inset}px`,
        minHeight: styles.logoX * 3,
      }}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className={`${styles.seriesClass} whitespace-nowrap rounded-md border border-blue-200 bg-blue-50/95 font-bold uppercase tracking-wide text-[#1B4C98] shadow-xs`}>
          {series}
        </span>
        {badge && (
          <span className={`${styles.badgeClass} whitespace-nowrap rounded-full bg-[#FF000F] font-bold text-white shadow-xs`}>
            {badge}
          </span>
        )}
      </div>

      <div
        className="flex-shrink-0"
        aria-label="Thương hiệu ABB"
      >
        <img
          src={logoABB}
          alt="ABB"
          className="block w-auto object-contain"
          style={{ height: styles.logoX }}
        />
      </div>
    </div>
  )
}
