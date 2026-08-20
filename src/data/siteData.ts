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
  attachments?: { name: string; url: string; size: string }[]
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
  customerType: 'Đại lý' | 'Nhà thầu' | 'Thợ điện' | 'Doanh nghiệp' | 'Khách lẻ'
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
  size: 'sm' | 'md' | 'lg'
  styleType: 'red' | 'navy' | 'white' | 'glass'
}

export interface BannerSlideItem {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl?: string
  altText?: string
  bannerLink?: string
  bannerLinkType?: 'internal' | 'external' | 'phone' | 'zalo'
  buttons: BannerButtonOverlay[]
  order: number
  isActive: boolean
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

import defaultSiteData from './defaultSiteData.json'

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
}

export function getStoredVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS)
    return raw ? JSON.parse(raw) : initialVideos
  } catch {
    return initialVideos
  }
}

export function saveStoredVideos(data: VideoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
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
  } catch (err) {
    console.error('Failed to save video categories', err)
  }
}

export function getStoredNews(): NewsItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEWS)
    return raw ? JSON.parse(raw) : initialNews
  } catch {
    return initialNews
  }
}

export function saveStoredNews(data: NewsItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(data))
    window.dispatchEvent(new Event('viendong_storage_update'))
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
  } catch (err) {
    console.error('Failed to save site settings', err)
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
  window.dispatchEvent(new Event('viendong_storage_update'))
}

export function getCurrentFullSiteData() {
  return {
    initialVideoCategories: getStoredVideoCategories(),
    initialVideos: getStoredVideos(),
    initialNewsCategories: getStoredNewsCategories(),
    initialNews: getStoredNews(),
    initialQuoteRequests: getStoredQuotes(),
    initialBannerSlides: getStoredBanners(),
    initialSiteSettings: getStoredSiteSettings(),
  }
}

/**
 * Saves current local content directly to project's defaultSiteData.json via dev API.
 * This makes all changes permanent in the source code!
 */
export async function saveAllDataToSourceCode(): Promise<{ success: boolean; message: string }> {
  const fullData = getCurrentFullSiteData()
  try {
    const response = await fetch('/api/save-site-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullData, null, 2),
    })

    if (response.ok) {
      const result = await response.json()
      return {
        success: true,
        message: result.message || 'Đã lưu thành công tất cả dữ liệu vào mã nguồn (defaultSiteData.json)!',
      }
    } else {
      // If dev server API is not available (e.g. on production static build), offer JSON download
      exportAllDataAsJSON()
      return {
        success: true,
        message: 'Đã tự động tải file sao lưu defaultSiteData.json về máy của bạn!',
      }
    }
  } catch (err: any) {
    // Fallback: download JSON
    exportAllDataAsJSON()
    return {
      success: true,
      message: 'Đã tự động tải file sao lưu defaultSiteData.json về máy của bạn!',
    }
  }
}

/** Download complete current site data as a JSON file */
export function exportAllDataAsJSON() {
  const data = getCurrentFullSiteData()
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `viendong_sitedata_${new Date().toISOString().slice(0, 10)}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

/** Import and apply site data from JSON file */
export function importAllDataFromJSON(jsonData: any): boolean {
  try {
    if (jsonData.initialVideos) saveStoredVideos(jsonData.initialVideos)
    if (jsonData.initialVideoCategories) saveStoredVideoCategories(jsonData.initialVideoCategories)
    if (jsonData.initialNews) saveStoredNews(jsonData.initialNews)
    if (jsonData.initialNewsCategories) saveStoredNewsCategories(jsonData.initialNewsCategories)
    if (jsonData.initialBannerSlides) saveStoredBanners(jsonData.initialBannerSlides)
    if (jsonData.initialQuoteRequests) saveStoredQuotes(jsonData.initialQuoteRequests)
    if (jsonData.initialSiteSettings) saveStoredSiteSettings(jsonData.initialSiteSettings)
    window.dispatchEvent(new Event('viendong_storage_update'))
    return true
  } catch (err) {
    console.error('Failed to import data', err)
    return false
  }
}
