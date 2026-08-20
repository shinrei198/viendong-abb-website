interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Generate page range around current page
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Previous button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-9 h-9 flex items-center justify-center transition-all duration-200 group ${
          currentPage === 1
            ? 'opacity-30 cursor-not-allowed text-[#b5b5b5]'
            : 'text-[#888888] hover:text-[#FF000F] hover:bg-red-50 cursor-pointer active:scale-95'
        }`}
        title="Trang trước"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="transition-colors group-hover:fill-[#FF000F]"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, index) => {
        if (p === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="w-9 h-9 flex items-center justify-center text-[#999999] text-sm font-bold"
            >
              ...
            </span>
          )
        }

        const pageNum = Number(p)
        const isActive = pageNum === currentPage

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
              isActive
                ? 'bg-[#FF000F] text-white shadow-sm'
                : 'text-[#888888] hover:bg-[#FF000F] hover:text-white hover:shadow-sm'
            }`}
            style={{
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {pageNum}
          </button>
        )
      })}

      {/* Next button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 flex items-center justify-center transition-all duration-200 group ${
          currentPage === totalPages
            ? 'opacity-30 cursor-not-allowed text-[#b5b5b5]'
            : 'text-[#888888] hover:text-[#FF000F] hover:bg-red-50 cursor-pointer active:scale-95'
        }`}
        title="Trang sau"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="transition-colors group-hover:fill-[#FF000F]"
        >
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  )
}
