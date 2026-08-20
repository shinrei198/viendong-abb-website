import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HomePage from '@/pages/HomePage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import MapPage from '@/pages/MapPage'
import VideosPage from '@/pages/VideosPage'
import NewsPage from '@/pages/NewsPage'
import NewsDetailPage from '@/pages/NewsDetailPage'
import AdminPage from '@/pages/AdminPage'
import FloatingButton from '@/components/FloatingButton'
import { fetchCloudflareSiteData, getStoredNews } from '@/data/siteData'

interface CartItem {
  id: string
  name: string
  sku: string
  qty: number
}

export type Page =
  | 'home'
  | 'products'
  | 'productDetail'
  | 'cart'
  | 'map'
  | 'about'
  | 'news'
  | 'newsDetail'
  | 'videos'
  | 'admin'

/** Parse clean SEO URL to application route state */
function parseRouteFromPath(): { page: Page; id?: string } {
  if (typeof window === 'undefined') return { page: 'home' }
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  // 1. Home
  if (path === '' || path === '/') {
    return { page: 'home' }
  }

  // 2. Products & Product Detail
  if (path === '/san-pham' || path === '/products') {
    return { page: 'products' }
  }
  if (path.startsWith('/san-pham/') || path.startsWith('/products/')) {
    const parts = path.split('/')
    const id = decodeURIComponent(parts[2] || 'p1')
    return { page: 'productDetail', id }
  }

  // 3. News & News Detail
  if (path === '/tin-tuc' || path === '/news') {
    return { page: 'news' }
  }
  if (path.startsWith('/tin-tuc/') || path.startsWith('/news/')) {
    const parts = path.split('/')
    const id = decodeURIComponent(parts[2] || 'n1')
    return { page: 'newsDetail', id }
  }

  // 4. Videos
  if (path === '/video' || path === '/videos') {
    return { page: 'videos' }
  }

  // 5. Distributors / Map / Contact
  if (
    path === '/he-thong-phan-phoi' ||
    path === '/dai-ly' ||
    path === '/map' ||
    path === '/lien-he' ||
    path === '/contact' ||
    path === '/about'
  ) {
    return { page: 'map' }
  }

  // 6. Cart & Quote Request
  if (path === '/gio-hang' || path === '/cart' || path === '/bao-gia') {
    return { page: 'cart' }
  }

  // 7. Admin Panel
  if (path === '/admin') {
    return { page: 'admin' }
  }

  return { page: 'home' }
}

/** Convert route to clean SEO URL path */
function getPathFromRoute(page: Page, id?: string): string {
  switch (page) {
    case 'home':
      return '/'
    case 'products':
      return '/san-pham'
    case 'productDetail':
      return `/san-pham/${encodeURIComponent(id || 'p1')}`
    case 'news':
      return '/tin-tuc'
    case 'newsDetail':
      return `/tin-tuc/${encodeURIComponent(id || 'n1')}`
    case 'videos':
      return '/video'
    case 'map':
    case 'about':
      return '/he-thong-phan-phoi'
    case 'cart':
      return '/gio-hang'
    case 'admin':
      return '/admin'
    default:
      return '/'
  }
}

/** Dynamically update document title & SEO meta tags */
function updateSeoMetadata(page: Page, id?: string) {
  if (typeof document === 'undefined') return

  let title = 'Thiết Bị Điện ABB | Viễn Đông Electric — Nhà Phân Phối Cấp 1'
  let description =
    'Viễn Đông Electric phân phối chính hãng thiết bị điện ABB: Aptomat MCB, MCCB, ACB, contactor, công tắc ổ cắm cao cấp.'

  switch (page) {
    case 'home':
      title = 'Thiết Bị Điện ABB Chính Hãng | Viễn Đông Electric'
      break
    case 'products':
      title = 'Danh Mục Thiết Bị Điện ABB | Viễn Đông Electric'
      description =
        'Xem bảng giá và thông số kỹ thuật các dòng MCB SH200, MCCB Tmax XT, ACB Emax 2, thiết bị chống sét và phụ kiện ABB.'
      break
    case 'productDetail':
      title = `Sản Phẩm ${id ? id.toUpperCase() : ''} — Thiết Bị Điện ABB | Viễn Đông Electric`
      break
    case 'news':
      title = 'Tin Tức & Kỹ Thuật Điện ABB | Viễn Đông Electric'
      description =
        'Tổng hợp tin tức công nghệ năng lượng ABB, cẩm nang chọn thiết bị điện an toàn cho căn hộ, nhà máy và dự án.'
      break
    case 'newsDetail': {
      const allNews = getStoredNews()
      const current = allNews.find((n) => n.id === id || n.slug === id)
      if (current) {
        title = `${current.title} | Viễn Đông Electric`
        description = current.summary || description
      } else {
        title = 'Chi Tiết Bài Viết | Viễn Đông Electric'
      }
      break
    }
    case 'videos':
      title = 'Video Hướng Dẫn & Giới Thiệu Thiết Bị ABB | Viễn Đông Electric'
      description =
        'Xem video thực tế hướng dẫn lắp đặt thiết bị đóng cắt MCB, MCCB, công nghệ chống hồ quang AFDD ABB.'
      break
    case 'map':
    case 'about':
      title = 'Hệ Thống Phân Phối & Đại Lý ABB Toàn Quốc | Viễn Đông Electric'
      description =
        'Tra cứu danh sách đại lý phân phối thiết bị điện ABB chính hãng của Viễn Đông Electric tại TP.HCM và các tỉnh.'
      break
    case 'cart':
      title = 'Yêu Cầu Báo Giá Thiết Bị Điện ABB | Viễn Đông Electric'
      description =
        'Gửi danh sách vật tư để nhận báo giá chiết khấu đại lý tốt nhất từ Viễn Đông Electric.'
      break
    case 'admin':
      title = 'Hệ Thống Quản Trị | Viễn Đông Electric'
      break
  }

  document.title = title
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute('content', description)
  }
}

export default function App() {
  const initialRoute = parseRouteFromPath()
  const [currentPage, setCurrentPage] = useState<Page>(initialRoute.page)
  const [currentProductId, setCurrentProductId] = useState<string>(initialRoute.id || 'p1')
  const [currentArticleId, setCurrentArticleId] = useState<string>(initialRoute.id || 'n1')
  const [cart, setCart] = useState<CartItem[]>([])

  // Initialize data from Cloudflare KV and sync route on mount
  useEffect(() => {
    fetchCloudflareSiteData()
    updateSeoMetadata(initialRoute.page, initialRoute.id)
  }, [])

  // Listen to browser Back/Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromPath()
      setCurrentPage(route.page)
      if (route.page === 'productDetail' && route.id) setCurrentProductId(route.id)
      if (route.page === 'newsDetail' && route.id) setCurrentArticleId(route.id)
      updateSeoMetadata(route.page, route.id)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, currentArticleId, currentProductId])

  const navigate = (page: string, id?: string) => {
    const targetPage = (page === 'contact' || page === 'about' ? 'map' : page) as Page
    const targetId = id || (targetPage === 'productDetail' ? currentProductId : targetPage === 'newsDetail' ? currentArticleId : undefined)
    const newPath = getPathFromRoute(targetPage, targetId)

    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.pushState({ page: targetPage, id: targetId }, '', newPath)
    }

    setCurrentPage(targetPage)
    if (targetPage === 'productDetail' && id) {
      setCurrentProductId(id)
    } else if (targetPage === 'newsDetail' && id) {
      setCurrentArticleId(id)
    }

    updateSeoMetadata(targetPage, targetId)
  }

  const addToCart = (product: { id: string; name: string; sku: string }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setCart([])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} onAddToCart={addToCart} />
      case 'products':
        return <ProductsPage onNavigate={navigate} onAddToCart={addToCart} />
      case 'productDetail':
        return (
          <ProductDetailPage
            productId={currentProductId}
            onNavigate={navigate}
            onAddToCart={addToCart}
          />
        )
      case 'videos':
        return <VideosPage onNavigate={navigate} />
      case 'news':
        return <NewsPage onNavigate={navigate} />
      case 'newsDetail':
        return <NewsDetailPage articleId={currentArticleId} onNavigate={navigate} />
      case 'admin':
        return <AdminPage onNavigate={navigate} />
      case 'cart':
        return (
          <CartPage
            items={cart}
            onNavigate={navigate}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onClear={clearCart}
          />
        )
      case 'map':
      case 'about':
        return <MapPage onNavigate={navigate} />
      default:
        return (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--navy)' }}
            >
              Trang đang được cập nhật
            </h2>
            <p className="text-gray-500 mb-6 text-sm">Nội dung sẽ sớm được bổ sung.</p>
            <button
              onClick={() => navigate('home')}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded"
              style={{ backgroundColor: 'var(--red)' }}
            >
              Về trang chủ
            </button>
          </div>
        )
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header currentPage={currentPage} onNavigate={navigate} cartCount={cart.length} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      {currentPage !== 'admin' && <Footer onNavigate={navigate} />}
      {currentPage !== 'admin' && <FloatingButton />}
    </div>
  )
}
