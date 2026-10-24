import { lazy, Suspense, useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingButton from '@/components/FloatingButton'
import NotFoundPage from '@/pages/NotFoundPage'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const VideosPage = lazy(() => import('@/pages/VideosPage'))
const NewsPage = lazy(() => import('@/pages/NewsPage'))
const NewsDetailPage = lazy(() => import('@/pages/NewsDetailPage'))
const AdminRoute = lazy(() => import('@/components/AdminRoute'))

interface CartItem {
  id: string
  productId: string
  name: string
  sku: string
  qty: number
}

const CART_STORAGE_KEY = 'viendong_cart_v1'

function createCartLineId(productId: string, sku: string) {
  return `${productId}::${sku}`
}

function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.sku === 'string')
      .map((item) => {
        const productId = typeof item.productId === 'string' ? item.productId : item.id.split('::')[0]
        return {
          id: createCartLineId(productId, item.sku),
          productId,
          name: item.name,
          sku: item.sku,
          qty: Math.max(1, Math.min(999, Number(item.qty) || 1)),
        }
      })
  } catch {
    return []
  }
}

function persistCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // Keep the in-memory cart usable when browser storage is unavailable.
  }
}

export type Page =
  | 'home'
  | 'products'
  | 'productDetail'
  | 'cart'
  | 'about'
  | 'news'
  | 'newsDetail'
  | 'videos'
  | 'admin'
  | 'notFound'

/** Parse clean SEO URL to application route state */
function parseRouteFromPath(): { page: Page; id?: string } {
  if (typeof window === 'undefined') return { page: 'home' }
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  // 1. Home
  if (path === '' || path === '/') {
    return { page: 'home' }
  }

  // 2. About / Gioi thieu
  if (path === '/gioi-thieu' || path === '/about') {
    return { page: 'about' }
  }

  // 3. Products & Product Detail
  if (path === '/san-pham' || path === '/products') {
    const category = new URLSearchParams(window.location.search).get('category') || undefined
    return { page: 'products', id: category }
  }
  if (path.startsWith('/san-pham/') || path.startsWith('/products/')) {
    const parts = path.split('/')
    const id = decodeURIComponent(parts[2] || 'p1')
    return { page: 'productDetail', id }
  }

  // 4. News & News Detail
  if (path === '/tin-tuc' || path === '/news') {
    return { page: 'news' }
  }
  if (path.startsWith('/tin-tuc/') || path.startsWith('/news/')) {
    const parts = path.split('/')
    const id = decodeURIComponent(parts[2] || 'n1')
    return { page: 'newsDetail', id }
  }

  // 5. Videos
  if (path === '/video' || path === '/videos') {
    return { page: 'videos', id: new URLSearchParams(window.location.search).get('video') || undefined }
  }

  // Contact remains available through the About page. The dormant map/distributor routes stay hidden.
  if (path === '/lien-he' || path === '/contact') {
    return { page: 'about' }
  }
  if (path === '/he-thong-phan-phoi' || path === '/dai-ly' || path === '/map') return { page: 'notFound' }

  // 7. Cart & Quote Request
  if (path === '/gio-hang' || path === '/cart' || path === '/bao-gia') {
    return { page: 'cart' }
  }

  // 8. Admin Panel
  if (path === '/admin') {
    return { page: 'admin' }
  }

  return { page: 'notFound' }
}

/** Convert route to clean SEO URL path */
function getPathFromRoute(page: Page, id?: string): string {
  switch (page) {
    case 'home':
      return '/'
    case 'about':
      return '/gioi-thieu'
    case 'products':
      return id ? `/san-pham?category=${encodeURIComponent(id)}` : '/san-pham'
    case 'productDetail':
      return `/san-pham/${encodeURIComponent(id || 'p1')}`
    case 'news':
      return '/tin-tuc'
    case 'newsDetail':
      return `/tin-tuc/${encodeURIComponent(id || 'n1')}`
    case 'videos':
      return id ? `/video?video=${encodeURIComponent(id)}` : '/video'
    case 'cart':
      return '/gio-hang'
    case 'admin':
      return '/admin'
    case 'notFound':
      return '/404'
    default:
      return '/'
  }
}

/** Dynamically update document title & SEO meta tags */
async function updateSeoMetadata(page: Page, id?: string) {
  if (typeof document === 'undefined') return

  let title = 'Viễn Đông Electric | Nhà phân phối thiết bị điện dân dụng của ABB'
  let description =
    'Viễn Đông Electric phân phối chính hãng thiết bị điện ABB: Aptomat MCB, MCCB, ACB, contactor, công tắc ổ cắm cao cấp.'

  switch (page) {
    case 'home':
      title = 'Viễn Đông Electric | Nhà phân phối thiết bị điện dân dụng của ABB'
      break
    case 'about':
      title = 'Giới Thiệu Doanh Nghiệp | Công Ty TNHH Thiết Bị Điện Viễn Đông'
      description =
        'Công ty TNHH Thiết Bị Điện Viễn Đông - Nhà phân phối chính thức thiết bị điện ABB Thụy Sĩ hàng đầu tại Việt Nam. Tầm nhìn, sứ mệnh và giá trị cốt lõi.'
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
      const { getStoredNews, createVietnameseSlug } = await import('@/data/siteData')
      const allNews = getStoredNews()
      const normalize = (s?: string) => (s || '').toLowerCase().replace(/[-_]+/g, '_')
      const target = normalize(id)
      const current = allNews.find(
        (n) =>
          n.id === id ||
          normalize(n.slug) === target ||
          normalize(createVietnameseSlug(n.title)) === target
      )
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
    case 'cart':
      title = 'Yêu Cầu Báo Giá Thiết Bị Điện ABB | Viễn Đông Electric'
      description =
        'Gửi danh sách vật tư để nhận báo giá chiết khấu đại lý tốt nhất từ Viễn Đông Electric.'
      break
    case 'admin':
      title = 'Hệ Thống Quản Trị | Viễn Đông Electric'
      break
    case 'notFound':
      title = '404 · Không Tìm Thấy Trang | Viễn Đông Electric'
      description = 'Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.'
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
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(initialRoute.page === 'videos' ? initialRoute.id : undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialRoute.page === 'products' ? initialRoute.id : undefined
  )
  const [cart, setCart] = useState<CartItem[]>(getStoredCart)

  // Initialize data from Cloudflare KV and sync route on mount
  useEffect(() => {
    void import('@/data/siteData').then((module) => module.fetchCloudflareSiteData())
    void updateSeoMetadata(initialRoute.page, initialRoute.id)
  }, [])

  // Listen to browser Back/Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromPath()
      setCurrentPage(route.page)
      if (route.page === 'products') setSelectedCategory(route.id)
      if (route.page === 'productDetail' && route.id) setCurrentProductId(route.id)
      if (route.page === 'newsDetail' && route.id) setCurrentArticleId(route.id)
      if (route.page === 'videos') setCurrentVideoId(route.id)
      void updateSeoMetadata(route.page, route.id)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, currentArticleId, currentProductId, currentVideoId, selectedCategory])

  const navigate = (page: string, id?: string) => {
    // The map/distributor page is intentionally dormant for now.
    const targetPage = (page === 'contact' ? 'about' : page === 'map' ? 'notFound' : page) as Page
    const targetId = id || (targetPage === 'productDetail' ? currentProductId : targetPage === 'newsDetail' ? currentArticleId : undefined)
    const newPath = getPathFromRoute(targetPage, targetId)

    const currentPath = typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : ''
    if (typeof window !== 'undefined' && currentPath !== newPath) {
      window.history.pushState({ page: targetPage, id: targetId }, '', newPath)
    }

    setCurrentPage(targetPage)
    if (targetPage === 'products') {
      setSelectedCategory(id)
    } else if (targetPage === 'productDetail' && id) {
      setCurrentProductId(id)
    } else if (targetPage === 'newsDetail' && id) {
      setCurrentArticleId(id)
    } else if (targetPage === 'videos') {
      setCurrentVideoId(id)
    }

    void updateSeoMetadata(targetPage, targetId)
  }

  const addToCart = (product: { id: string; name: string; sku: string }) => {
    const lineId = createCartLineId(product.id, product.sku)
    setCart((prev) => {
      const existing = prev.find((i) => i.id === lineId)
      const next = existing
        ? prev.map((i) => (i.id === lineId ? { ...i, qty: Math.min(999, i.qty + 1) } : i))
        : [...prev, { id: lineId, productId: product.id, name: product.name, sku: product.sku, qty: 1 }]
      persistCart(next)
      return next
    })
  }

  const updateQty = (id: string, qty: number) => {
    setCart((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(999, qty)) } : i))
      persistCart(next)
      return next
    })
  }

  const removeItem = (id: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id)
      persistCart(next)
      return next
    })
  }

  const clearCart = () => {
    persistCart([])
    setCart([])
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} onAddToCart={addToCart} />
      case 'about':
        return <AboutPage onNavigate={navigate} />
      case 'products':
        return <ProductsPage onNavigate={navigate} onAddToCart={addToCart} initialCategory={selectedCategory} />
      case 'productDetail':
        return (
          <ProductDetailPage
            productId={currentProductId}
            onNavigate={navigate}
            onAddToCart={addToCart}
          />
        )
      case 'videos':
        return <VideosPage onNavigate={navigate} initialVideoId={currentVideoId} />
      case 'news':
        return <NewsPage onNavigate={navigate} />
      case 'newsDetail':
        return <NewsDetailPage articleId={currentArticleId} onNavigate={navigate} />
      case 'admin':
        return <AdminRoute onNavigate={navigate} />
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
      case 'notFound':
        return <NotFoundPage onNavigate={navigate} />
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
      <Header currentPage={currentPage} onNavigate={navigate} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div className="flex min-h-[45vh] items-center justify-center text-sm font-semibold text-slate-500">Đang tải nội dung…</div>}>
          {renderPage()}
        </Suspense>
      </main>
      {currentPage !== 'admin' && <Footer onNavigate={navigate} />}
      {currentPage !== 'admin' && <FloatingButton />}
    </div>
  )
}
