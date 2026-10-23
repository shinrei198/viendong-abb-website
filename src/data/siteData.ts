export interface VideoItem {
  id: string
  title: string
  category: string
  date: string
  duration: string
  thumb: string
  videoUrl: string
  embedType: 'youtube' | 'drive' | 'vimeo' | 'direct' | 'upload'
  isFeatured?: boolean
  isHidden?: boolean
  linkedProductSku?: string
  views?: number
}

export interface NewsItem {
  id: string
  title: string
  slug: string
  category: string
  tags: string[]
  date: string
  author: string
  readTime: string
  thumb: string
  summary: string
  content: string
  quote?: string
  quoteAuthor?: string
  status: 'published' | 'draft'
  isFeatured?: boolean
  views?: number
}

export interface QuoteRequestItem {
  id: string
  code: string
  createdAt: string
  customerName: string
  company: string
  phone: string
  email: string
  province: string
  customerType: 'Đại lý' | 'Nhà thầu' | 'Thợ điện' | 'Doanh nghiệp' | 'Khách lẻ' | 'Khác'
  note: string
  items: {
    id: string
    name: string
    sku: string
    qty: number
  }[]
  status: 'new' | 'contacted' | 'quoted' | 'completed' | 'cancelled'
}

export interface BannerButtonOverlay {
  id: string
  label: string
  actionType: 'internal' | 'external' | 'phone' | 'zalo'
  targetUrl: string
  posX: number // Percentage from left (0..100)
  posY: number // Percentage from top (0..100)
  pixelX?: number // Exact pixel on original image
  pixelY?: number // Exact pixel on original image
  origWidth?: number // Original image width when placed
  origHeight?: number // Original image height when placed
  size: 'sm' | 'md' | 'lg'
  styleType: 'red' | 'navy' | 'white' | 'glass'
  mobileAlign?: 'auto' | 'pin' | 'stack-bottom' | 'hide'
}

export interface BannerSlideItem {
  id: string
  title: string
  mainTitle?: string
  description?: string
  imageUrl: string
  mobileImageUrl?: string
  altText?: string
  bannerLink?: string
  bannerLinkType?: 'internal' | 'external' | 'phone' | 'zalo'
  buttons: BannerButtonOverlay[]
  order: number
  isActive: boolean
  naturalWidth?: number
  naturalHeight?: number
  mobileCtaLayout?: 'hotspot' | 'bottom-bar'
}

export interface SiteSettings {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroImage: string
  hotline: string
  hotlineFormatted: string
  email: string
  address: string
  zaloUrl: string
  catalogueUrl: string
  companyName: string
}

export type HomeBenefitIcon = 'shield' | 'truck' | 'support' | 'price'

export interface HomeCategoryItem {
  id: string
  name: string
  description: string
  count: number
  imageUrl: string
  targetCategory: string
  isActive: boolean
}

export interface HomeBenefitItem {
  id: string
  title: string
  description: string
  icon: HomeBenefitIcon
  isActive: boolean
}

export interface HomePageContent {
  partnerTitle: string
  partnerSubtitle: string
  categorySectionTitle: string
  categories: HomeCategoryItem[]
  featuredSectionTitle: string
  featuredProductIds: string[]
  videoSectionTitle: string
  whyTitle: string
  whySubtitle: string
  benefits: HomeBenefitItem[]
  ctaTitle: string
  ctaDescription: string
  ctaPrimaryLabel: string
  ctaPrimaryUrl: string
  ctaSecondaryLabel: string
  supportTitle: string
  supportDescription: string
  newsSectionTitle: string
}

export interface ProductVariant {
  color: string
  colorCode: string
  hex: string
  sku: string
  image: string
  enabled: boolean
}

export interface ProductItem {
  id: string
  name: string
  baseSku: string
  series: 'VELET 120' | 'MAYPLE 120' | 'MAYPLE' | 'VELET' | 'ZITA' | 'ACUS' | 'GSH200' | 'SH200' | 'SH200L'
  category: 'faceplate' | 'socket' | 'switch' | 'media-socket' | 'other' | 'accessories' | 'breaker'
  subCategory?: string
  specs: string
  pack?: number
  badge?: string
  inStock: boolean
  description?: string
  gallery?: string[]
  variants: ProductVariant[]
}

import defaultSiteData from './defaultSiteData.json'
import initialProductsData from './productsABB2026.json'
import { sanitizePlainText, sanitizeRichHtml } from '@/utils/sanitize'

/**
 * Tự động phân tích và chuyển đổi tiêu đề tiếng Việt có dấu thành tiếng Việt không dấu kèm ký tự _ chuẩn SEO
 */
export function createVietnameseSlug(title: string): string {
  if (!title) return ''
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_+|_+$)/g, '')
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL / SEED DATA (Synced from defaultSiteData.json)
// ─────────────────────────────────────────────────────────────────────────────

export const initialVideoCategories: string[] = defaultSiteData.initialVideoCategories
export const initialVideos: VideoItem[] = defaultSiteData.initialVideos as VideoItem[]
export const initialNewsCategories: string[] = defaultSiteData.initialNewsCategories
export const initialNews: NewsItem[] = defaultSiteData.initialNews as NewsItem[]
export const initialQuoteRequests: QuoteRequestItem[] = defaultSiteData.initialQuoteRequests as QuoteRequestItem[]
export const initialBannerSlides: BannerSlideItem[] = defaultSiteData.initialBannerSlides as BannerSlideItem[]
export const initialSiteSettings: SiteSettings = defaultSiteData.initialSiteSettings as SiteSettings
export const initialProducts: ProductItem[] = ((defaultSiteData as any).initialProducts || initialProductsData) as ProductItem[]
export const initialHomePageContent: HomePageContent = ((defaultSiteData as any).initialHomePageContent || {
  partnerTitle: 'Viễn Đông Electric — Nhà phân phối chính thức của ABB tại Việt Nam',
  partnerSubtitle: 'Authorized Distribution Partner · Hỗ trợ & Bảo hành chính hãng',
  categorySectionTitle: 'Danh mục sản phẩm',
  categories: [
    { id: 'home-cat-breaker', name: 'MCB · RCCB · RCBO', description: 'Dòng SH200, GSH201 — 111 sản phẩm', count: 111, imageUrl: '', targetCategory: 'breaker', isActive: true },
    { id: 'home-cat-afdd', name: 'Thiết bị bảo vệ chống hồ quang – AFDD', description: 'S-ARC1, DS-ARC1 — an toàn tuyệt đối', count: 24, imageUrl: '', targetCategory: 'breaker', isActive: true },
    { id: 'home-cat-switch', name: 'Công tắc ABB', description: 'Velet, Mayple, Zita, Acus — 110 sản phẩm', count: 110, imageUrl: '', targetCategory: 'switch', isActive: true },
    { id: 'home-cat-socket', name: 'Ổ cắm điện ABB', description: 'Đơn, đôi, USB Type-C & đa năng — 120 sản phẩm', count: 120, imageUrl: '', targetCategory: 'socket', isActive: true },
    { id: 'home-cat-surge', name: 'Chống sét lan truyền', description: 'OVR, OVR T1-T2 — bảo vệ thiết bị điện', count: 32, imageUrl: '', targetCategory: 'accessories', isActive: true },
  ],
  featuredSectionTitle: 'Sản phẩm nổi bật',
  featuredProductIds: [
    'prod-velet120-4tyx505221-0',
    'prod-mayple120-4tyx506221-42',
    'prod-mayple-4tya502111-82',
    'prod-velet-4tya503111-107',
    'prod-zita-4tya501111-146',
    'prod-acus-4tya500111-1',
  ],
  videoSectionTitle: 'Video mới cập nhật',
  whyTitle: 'Tại sao chọn Viễn Đông?',
  whySubtitle: 'Đối tác tin cậy của hàng nghìn đại lý và nhà thầu điện trên toàn quốc',
  benefits: [
    { id: 'benefit-authentic', title: 'Hàng chính hãng 100%', description: 'Nhập trực tiếp từ ABB với đầy đủ chứng từ và tem kiểm định.', icon: 'shield', isActive: true },
    { id: 'benefit-delivery', title: 'Giao hàng toàn quốc', description: 'Phủ khắp 63 tỉnh thành, nhanh trong 24–48 giờ.', icon: 'truck', isActive: true },
    { id: 'benefit-support', title: 'Hỗ trợ kỹ thuật 24/7', description: 'Đội ngũ kỹ sư điện tư vấn và giải đáp mọi thắc mắc.', icon: 'support', isActive: true },
    { id: 'benefit-price', title: 'Giá đại lý tốt nhất', description: 'Chính sách chiết khấu linh hoạt cho đại lý, nhà thầu và dự án.', icon: 'price', isActive: true },
  ],
  ctaTitle: 'Trở thành đại lý phân phối của Viễn Đông',
  ctaDescription: 'Tiếp cận toàn bộ danh mục ABB với chính sách chiết khấu tốt nhất thị trường.',
  ctaPrimaryLabel: 'Đăng ký làm đại lý',
  ctaPrimaryUrl: 'mailto:info@viendongelectric.vn?subject=Đăng ký làm đại lý',
  ctaSecondaryLabel: 'Về Viễn Đông Electric',
  supportTitle: 'Chúng tôi sẵn sàng hỗ trợ bạn',
  supportDescription: 'Hãy liên hệ với Viễn Đông nếu bạn cần tư vấn về sản phẩm, chương trình ưu đãi hoặc cách thức hợp tác bạn nhé!',
  newsSectionTitle: 'Tin tức & Kỹ thuật',
}) as HomePageContent


// ─────────────────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  VIDEOS: 'viendong_videos_v1',
  VIDEO_CATS: 'viendong_video_cats_v1',
  NEWS: 'viendong_news_v1',
  NEWS_CATS: 'viendong_news_cats_v1',
  QUOTES: 'viendong_quotes_v1',
  BANNERS: 'viendong_banners_v1',
  SETTINGS: 'viendong_settings_v1',
  PRODUCTS: 'viendong_products_v1',
  PRODUCTS_SEED_VERSION: 'viendong_products_seed_version',
  HOME_PAGE: 'viendong_home_page_v1',
  CMS_REVISIONS: 'viendong_cms_revisions_v1',
}

const CURRENT_PRODUCT_SEED_VERSION = 'breaker-images-2026-10-13'

function mergeSeededBreakerProducts(products: ProductItem[]): ProductItem[] {
  const existingIds = new Set(products.map((product) => product.id))
  const missingBreakers = initialProducts.filter(
    (product) => product.category === 'breaker' && !existingIds.has(product.id)
  )
  return missingBreakers.length ? [...products, ...missingBreakers] : products
}

export function getStoredProducts(): ProductItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (!raw) return initialProducts
    const stored = JSON.parse(raw) as ProductItem[]
    if (!Array.isArray(stored)) return initialProducts
    if (localStorage.getItem(STORAGE_KEYS.PRODUCTS_SEED_VERSION) !== CURRENT_PRODUCT_SEED_VERSION) {
      const merged = mergeSeededBreakerProducts(stored)
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged))
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_SEED_VERSION, CURRENT_PRODUCT_SEED_VERSION)
      return merged
    }
    return stored
  } catch {
    return initialProducts
  }
}

export function saveStoredProducts(data: ProductItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('products', data)
  } catch (err) {
    console.error('Failed to save products', err)
  }
}

const LEGACY_PLACEHOLDER_VIDEO_IDS = new Set(['v1', 'v2', 'v3', 'v4', 'v5', 'v6'])

function removeLegacyPlaceholderVideos(data: VideoItem[]): VideoItem[] {
  return data.filter((item) => {
    if (!LEGACY_PLACEHOLDER_VIDEO_IDS.has(item.id)) return true
    return !(
      item.videoUrl?.includes('PPrxx0Y3v-U') ||
      item.videoUrl?.includes('dQw4w9WgXcQ')
    )
  })
}

export function getStoredVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS)
    const stored = raw ? JSON.parse(raw) : initialVideos
    return Array.isArray(stored) ? removeLegacyPlaceholderVideos(stored) : []
  } catch {
    return removeLegacyPlaceholderVideos(initialVideos)
  }
}

export type CmsSectionKey =
  | 'videoCategories'
  | 'videos'
  | 'newsCategories'
  | 'news'
  | 'banners'
  | 'settings'
  | 'products'
  | 'homePage'

const pendingSectionWrites = new Map<CmsSectionKey, unknown>()
const activeSectionWrites = new Set<CmsSectionKey>()

function dispatchSyncStatus(sectionKey: CmsSectionKey, status: 'saving' | 'saved' | 'error', message?: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('viendong_cloud_sync', {
    detail: { sectionKey, status, message },
  }))
}

async function persistCmsSection(sectionKey: CmsSectionKey, data: unknown) {
  let revisions: Record<string, number> = {}
  try {
    revisions = JSON.parse(localStorage.getItem(STORAGE_KEYS.CMS_REVISIONS) || '{}')
  } catch {
    revisions = {}
  }
  const expectedRevision = Number.isInteger(revisions[sectionKey])
    ? revisions[sectionKey]
    : undefined
  const response = await fetch(`/api/content/${encodeURIComponent(sectionKey)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, expectedRevision }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || `Không thể lưu nhóm nội dung ${sectionKey} lên Cloudflare.`)
  }
  if (Number.isInteger(result.revision)) {
    revisions[sectionKey] = result.revision
    localStorage.setItem(STORAGE_KEYS.CMS_REVISIONS, JSON.stringify(revisions))
  }
}

async function drainSectionWrites(sectionKey: CmsSectionKey) {
  if (activeSectionWrites.has(sectionKey)) return
  activeSectionWrites.add(sectionKey)
  dispatchSyncStatus(sectionKey, 'saving')
  try {
    while (pendingSectionWrites.has(sectionKey)) {
      const latestData = pendingSectionWrites.get(sectionKey)
      pendingSectionWrites.delete(sectionKey)
      await persistCmsSection(sectionKey, latestData)
    }
    dispatchSyncStatus(sectionKey, 'saved')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lưu dữ liệu lên Cloudflare.'
    dispatchSyncStatus(sectionKey, 'error', message)
    console.error(`Failed to sync ${sectionKey} to Cloudflare`, error)
  } finally {
    activeSectionWrites.delete(sectionKey)
    if (pendingSectionWrites.has(sectionKey)) void drainSectionWrites(sectionKey)
  }
}

export function scheduleCloudflareSync(sectionKey?: CmsSectionKey, data?: unknown) {
  if (typeof window === 'undefined') return
  if (!sectionKey) {
    void saveAllDataToSourceCode().catch((error) => console.error('Failed to sync site data', error))
    return
  }
  pendingSectionWrites.set(sectionKey, data)
  void drainSectionWrites(sectionKey)
}

export function saveStoredVideos(data: VideoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(removeLegacyPlaceholderVideos(data)))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('videos', removeLegacyPlaceholderVideos(data))
  } catch (err) {
    console.error('Failed to save videos', err)
  }
}

export function getStoredVideoCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEO_CATS)
    return raw ? JSON.parse(raw) : initialVideoCategories
  } catch {
    return initialVideoCategories
  }
}

export function saveStoredVideoCategories(data: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEO_CATS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('videoCategories', data)
  } catch (err) {
    console.error('Failed to save video categories', err)
  }
}

function sanitizeNewsRecord(item: NewsItem): NewsItem {
  // Legacy seed data contained PDF attachments that could not be managed in Admin.
  // Keep the public data model limited to fields that administrators can edit.
  const { attachments: _unsupportedAttachments, ...supportedItem } = item as NewsItem & {
    attachments?: unknown
  }
  return {
    ...supportedItem,
    title: sanitizePlainText(supportedItem.title, 300),
    summary: sanitizePlainText(supportedItem.summary, 1000),
    quote: supportedItem.quote ? sanitizePlainText(supportedItem.quote, 1000) : undefined,
    quoteAuthor: supportedItem.quoteAuthor ? sanitizePlainText(supportedItem.quoteAuthor, 200) : undefined,
    content: sanitizeRichHtml(supportedItem.content),
  }
}

export function getStoredNews(): NewsItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEWS)
    const stored = raw ? JSON.parse(raw) : initialNews
    return Array.isArray(stored) ? stored.map(sanitizeNewsRecord) : []
  } catch {
    return initialNews.map(sanitizeNewsRecord)
  }
}

export function saveStoredNews(data: NewsItem[]) {
  try {
    const sanitized = data.map(sanitizeNewsRecord)
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(sanitized))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('news', sanitized)
  } catch (err) {
    console.error('Failed to save news', err)
  }
}

export function getStoredNewsCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEWS_CATS)
    return raw ? JSON.parse(raw) : initialNewsCategories
  } catch {
    return initialNewsCategories
  }
}

export function saveStoredNewsCategories(data: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NEWS_CATS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('newsCategories', data)
  } catch (err) {
    console.error('Failed to save news categories', err)
  }
}

export function getStoredBanners(): BannerSlideItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANNERS)
    return raw ? JSON.parse(raw) : initialBannerSlides
  } catch {
    return initialBannerSlides
  }
}

export function saveStoredBanners(data: BannerSlideItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('banners', data)
  } catch (err) {
    console.error('Failed to save banners', err)
  }
}

export function getStoredQuotes(): QuoteRequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES)
    return raw ? JSON.parse(raw) : initialQuoteRequests
  } catch {
    return initialQuoteRequests
  }
}

export function saveStoredQuotes(data: QuoteRequestItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
  } catch (err) {
    console.error('Failed to save quotes', err)
  }
}

export function addQuoteRequest(
  quote: Omit<QuoteRequestItem, 'id' | 'code' | 'createdAt' | 'status'>
): QuoteRequestItem {
  const current = getStoredQuotes()
  const newQuote: QuoteRequestItem = {
    ...quote,
    id: 'q_' + Date.now(),
    code: 'VD-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'new',
  }
  const updated = [newQuote, ...current]
  saveStoredQuotes(updated)
  return newQuote
}

type QuoteSubmission = Omit<QuoteRequestItem, 'id' | 'code' | 'createdAt' | 'status'>

export async function submitQuoteRequest(quote: QuoteSubmission, idempotencyKey: string): Promise<QuoteRequestItem> {
  try {
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...quote, idempotencyKey }),
    })
    const result = await response.json()
    if (!response.ok || !result?.success || !result?.quote) throw new Error(result?.message || 'Không thể gửi yêu cầu báo giá.')
    return result.quote as QuoteRequestItem
  } catch (error) {
    if (import.meta.env.DEV) return addQuoteRequest(quote)
    throw error
  }
}

export async function fetchQuoteRequests(): Promise<QuoteRequestItem[]> {
  try {
    const response = await fetch('/api/quotes')
    const result = await response.json()
    if (!response.ok || !result?.success || !Array.isArray(result.quotes)) throw new Error('Không thể tải yêu cầu báo giá.')
    return result.quotes as QuoteRequestItem[]
  } catch (error) {
    if (import.meta.env.DEV) return getStoredQuotes()
    throw error
  }
}

export async function updateRemoteQuoteStatus(id: string, status: QuoteRequestItem['status']): Promise<QuoteRequestItem> {
  try {
    const response = await fetch(`/api/quotes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const result = await response.json()
    if (!response.ok || !result?.success || !result?.quote) throw new Error(result?.message || 'Không thể cập nhật yêu cầu báo giá.')
    return result.quote as QuoteRequestItem
  } catch (error) {
    if (import.meta.env.DEV) {
      const updated = getStoredQuotes().map((quote) => quote.id === id ? { ...quote, status } : quote)
      saveStoredQuotes(updated)
      return updated.find((quote) => quote.id === id) as QuoteRequestItem
    }
    throw error
  }
}

export async function deleteRemoteQuote(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) throw new Error(result?.message || 'Không thể xóa yêu cầu báo giá.')
  } catch (error) {
    if (import.meta.env.DEV) {
      saveStoredQuotes(getStoredQuotes().filter((quote) => quote.id !== id))
      return
    }
    throw error
  }
}

export function getStoredSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return raw ? JSON.parse(raw) : initialSiteSettings
  } catch {
    return initialSiteSettings
  }
}

export function saveStoredSiteSettings(data: SiteSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('settings', data)
  } catch (err) {
    console.error('Failed to save site settings', err)
  }
}

export function getStoredHomePageContent(): HomePageContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOME_PAGE)
    if (!raw) return initialHomePageContent
    return { ...initialHomePageContent, ...JSON.parse(raw) }
  } catch {
    return initialHomePageContent
  }
}

export function saveStoredHomePageContent(data: HomePageContent) {
  try {
    localStorage.setItem(STORAGE_KEYS.HOME_PAGE, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
    scheduleCloudflareSync('homePage', data)
  } catch (err) {
    console.error('Failed to save home page content', err)
  }
}


export function resetAllToDefault() {
  localStorage.removeItem(STORAGE_KEYS.VIDEOS)
  localStorage.removeItem(STORAGE_KEYS.VIDEO_CATS)
  localStorage.removeItem(STORAGE_KEYS.NEWS)
  localStorage.removeItem(STORAGE_KEYS.NEWS_CATS)
  localStorage.removeItem(STORAGE_KEYS.BANNERS)
  localStorage.removeItem(STORAGE_KEYS.QUOTES)
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS)
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS_SEED_VERSION)
  localStorage.removeItem(STORAGE_KEYS.HOME_PAGE)
  window.dispatchEvent(new Event('viendong_storage_update'))
  scheduleCloudflareSync()
}

export function getCurrentFullSiteData() {
  return {
    schemaVersion: 3,
    initialVideoCategories: getStoredVideoCategories(),
    initialVideos: getStoredVideos(),
    initialNewsCategories: getStoredNewsCategories(),
    initialNews: getStoredNews(),
    initialQuoteRequests: getStoredQuotes(),
    initialBannerSlides: getStoredBanners(),
    initialSiteSettings: getStoredSiteSettings(),
    initialProducts: getStoredProducts(),
    initialHomePageContent: getStoredHomePageContent(),
  }
}

/**
 * Fetch and sync site data from Cloudflare KV Database on startup
 */
export async function fetchCloudflareSiteData(): Promise<boolean> {
  try {
    const contentResponse = await fetch('/api/content')
    if (contentResponse.ok) {
      const contentResult = await contentResponse.json()
      if (contentResult?.success && contentResult.sections && typeof contentResult.sections === 'object') {
        const sections = contentResult.sections
        if (contentResult.revisions && typeof contentResult.revisions === 'object') {
          const revisions = Object.fromEntries(
            Object.entries(contentResult.revisions)
              .filter(([, value]: [string, any]) => Number.isInteger(value?.revision))
              .map(([key, value]: [string, any]) => [key, value.revision]),
          )
          localStorage.setItem(STORAGE_KEYS.CMS_REVISIONS, JSON.stringify(revisions))
        }
        const imported = importAllDataFromJSON({
          initialVideoCategories: sections.videoCategories,
          initialVideos: sections.videos,
          initialNewsCategories: sections.newsCategories,
          initialNews: sections.news,
          initialBannerSlides: sections.banners,
          initialSiteSettings: sections.settings,
          initialProducts: sections.products,
          initialHomePageContent: sections.homePage,
        }, { syncToCloudflare: false })
        if (imported) return true
      }
    }

    // Compatibility fallback while production is being migrated from KV to D1.
    const res = await fetch('/api/site-data')
    if (res.ok) {
      const data = await res.json()
      if (data && data.exists !== false && (data.initialVideos || data.initialNews || data.initialBannerSlides || data.initialProducts)) {
        importAllDataFromJSON(data, { syncToCloudflare: false })
        return true
      }
    }
  } catch (err) {
    // Silently fall back to seed/localStorage
  }
  return false
}

/**
 * Saves current local content directly to Cloudflare Database or local source code.
 * Will NEVER force a file download on save!
 */
export async function saveAllDataToSourceCode(): Promise<{ success: boolean; message: string }> {
  const fullData = getCurrentFullSiteData()

  // 1. Save each editable group independently in Cloudflare D1.
  try {
    const sections: Array<[CmsSectionKey, unknown]> = [
      ['videoCategories', fullData.initialVideoCategories],
      ['videos', fullData.initialVideos],
      ['newsCategories', fullData.initialNewsCategories],
      ['news', fullData.initialNews],
      ['banners', fullData.initialBannerSlides],
      ['settings', fullData.initialSiteSettings],
      ['products', fullData.initialProducts],
      ['homePage', fullData.initialHomePageContent],
    ]
    for (const [sectionKey, data] of sections) {
      await persistCmsSection(sectionKey, data)
    }
    return {
      success: true,
      message: '✅ Đã lưu thành công từng nhóm nội dung vào Cloudflare D1!',
    }
  } catch (err) {
    // Continue to local fallback
  }

  // 2. Try Vite local dev server endpoint (/api/save-site-data)
  try {
    const devResponse = await fetch('/api/save-site-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData, null, 2),
    })
    if (devResponse.ok) {
      const result = await devResponse.json()
      return {
        success: true,
        message: result.message || '✅ Đã lưu thành công vào mã nguồn dự án!',
      }
    }
  } catch (err) {
    // Continue
  }

  return {
    success: false,
    message: 'Không thể lưu lên Cloudflare. Dữ liệu chỉ còn trong trình duyệt này; vui lòng không đóng trang và thử lại.',
  }
}

/** Download complete current site data as a JSON file */
export function exportAllDataAsJSON(overrides: Partial<ReturnType<typeof getCurrentFullSiteData>> = {}) {
  const data = { ...getCurrentFullSiteData(), ...overrides, exportedAt: new Date().toISOString() }
  const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', blobUrl)
  downloadAnchor.setAttribute('download', `viendong_sitedata_${new Date().toISOString().slice(0, 10)}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

export async function importRemoteQuotes(quotes: QuoteRequestItem[]): Promise<void> {
  if (!Array.isArray(quotes) || quotes.length === 0) return
  try {
    const response = await fetch('/api/quotes/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotes }),
    })
    const result = await response.json()
    if (!response.ok || !result?.success) throw new Error(result?.message || 'Không thể nhập dữ liệu báo giá.')
  } catch (error) {
    if (import.meta.env.DEV) {
      saveStoredQuotes(quotes)
      return
    }
    throw error
  }
}

/** Import and apply site data from JSON file */
export function importAllDataFromJSON(
  jsonData: any,
  options: { syncToCloudflare?: boolean } = { syncToCloudflare: true },
): boolean {
  if (!jsonData || typeof jsonData !== 'object' || Array.isArray(jsonData)) return false

  // Accept both the current portable backup format and the older Settings-tab format.
  const normalized = {
    initialVideos: jsonData.initialVideos ?? jsonData.videos,
    initialVideoCategories: jsonData.initialVideoCategories ?? jsonData.videoCats,
    initialNews: jsonData.initialNews ?? jsonData.news,
    initialNewsCategories: jsonData.initialNewsCategories ?? jsonData.newsCats,
    initialBannerSlides: jsonData.initialBannerSlides ?? jsonData.banners,
    initialQuoteRequests: jsonData.initialQuoteRequests ?? jsonData.quotes,
    initialSiteSettings: jsonData.initialSiteSettings ?? jsonData.settings,
    initialProducts: Array.isArray(jsonData.initialProducts ?? jsonData.products)
      ? mergeSeededBreakerProducts(jsonData.initialProducts ?? jsonData.products)
      : jsonData.initialProducts ?? jsonData.products,
    initialHomePageContent: jsonData.initialHomePageContent ?? jsonData.homePageContent,
  }

  const entries: Array<[string, unknown, 'array' | 'object']> = [
    [STORAGE_KEYS.VIDEOS, Array.isArray(normalized.initialVideos) ? removeLegacyPlaceholderVideos(normalized.initialVideos) : normalized.initialVideos, 'array'],
    [STORAGE_KEYS.VIDEO_CATS, normalized.initialVideoCategories, 'array'],
    [STORAGE_KEYS.NEWS, Array.isArray(normalized.initialNews) ? normalized.initialNews.map(sanitizeNewsRecord) : normalized.initialNews, 'array'],
    [STORAGE_KEYS.NEWS_CATS, normalized.initialNewsCategories, 'array'],
    [STORAGE_KEYS.BANNERS, normalized.initialBannerSlides, 'array'],
    [STORAGE_KEYS.QUOTES, normalized.initialQuoteRequests, 'array'],
    [STORAGE_KEYS.SETTINGS, normalized.initialSiteSettings, 'object'],
    [STORAGE_KEYS.PRODUCTS, normalized.initialProducts, 'array'],
    [STORAGE_KEYS.HOME_PAGE, normalized.initialHomePageContent, 'object'],
  ].filter(([, value]) => value !== undefined) as Array<[string, unknown, 'array' | 'object']>

  if (entries.length === 0) return false
  if (entries.some(([, value, kind]) => kind === 'array' ? !Array.isArray(value) : !value || typeof value !== 'object' || Array.isArray(value))) {
    return false
  }

  const previousValues = new Map<string, string | null>()
  try {
    entries.forEach(([key, value]) => {
      previousValues.set(key, localStorage.getItem(key))
      localStorage.setItem(key, JSON.stringify(value))
    })
    if (normalized.initialProducts !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS_SEED_VERSION, CURRENT_PRODUCT_SEED_VERSION)
    }
    window.dispatchEvent(new Event('viendong_storage_update'))
    if (options.syncToCloudflare !== false) scheduleCloudflareSync()
    return true
  } catch (err) {
    previousValues.forEach((value, key) => {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    })
    console.error('Failed to import data', err)
    return false
  }
}
