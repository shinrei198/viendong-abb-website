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

interface CartItem {
  id: string
  name: string
  sku: string
  qty: number
}

type Page =
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [currentProductId, setCurrentProductId] = useState<string>('p1')
  const [currentArticleId, setCurrentArticleId] = useState<string>('n1')
  const [cart, setCart] = useState<CartItem[]>([])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage, currentArticleId, currentProductId])

  const navigate = (page: string, id?: string) => {
    setCurrentPage(page as Page)
    if (page === 'productDetail' && id) {
      setCurrentProductId(id)
    } else if (page === 'newsDetail' && id) {
      setCurrentArticleId(id)
    }
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
      {/* Hide public header on full admin dashboard if desired, or keep uniform */}
      <Header currentPage={currentPage} onNavigate={navigate} cartCount={cart.length} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      {currentPage !== 'admin' && <Footer onNavigate={navigate} />}
      {currentPage !== 'admin' && <FloatingButton />}
    </div>
  )
}
