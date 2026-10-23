export interface Env {
  ASSETS: any
  VIENDONG_KV?: any
  DB?: any
  MEDIA?: any
  IMAGES?: any
}

const QUOTE_STATUSES = new Set(['new', 'contacted', 'quoted', 'completed', 'cancelled'])
const MEDIA_FOLDERS = new Set(['banners', 'news', 'products', 'homepage', 'videos', 'content'])
const CMS_SECTION_KEYS = [
  'videoCategories',
  'videos',
  'newsCategories',
  'news',
  'banners',
  'settings',
  'products',
  'homePage',
] as const
type CmsSectionKey = typeof CMS_SECTION_KEYS[number]
const CMS_SECTION_KEY_SET = new Set<string>(CMS_SECTION_KEYS)
const CMS_ARRAY_SECTIONS = new Set<CmsSectionKey>([
  'videoCategories',
  'videos',
  'newsCategories',
  'news',
  'banners',
  'products',
])
const LEGACY_TO_CMS_SECTION: Record<string, CmsSectionKey> = {
  initialVideoCategories: 'videoCategories',
  initialVideos: 'videos',
  initialNewsCategories: 'newsCategories',
  initialNews: 'news',
  initialBannerSlides: 'banners',
  initialSiteSettings: 'settings',
  initialProducts: 'products',
  initialHomePageContent: 'homePage',
}
const CMS_TO_LEGACY_SECTION = Object.fromEntries(
  Object.entries(LEGACY_TO_CMS_SECTION).map(([legacyKey, sectionKey]) => [sectionKey, legacyKey]),
) as Record<CmsSectionKey, string>

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

function cleanText(value: unknown, maxLength = 5000) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, maxLength)
}

function sanitizeHtmlServer(value: unknown) {
  return String(value ?? '')
    .replace(/<(script|iframe|object|embed|form|input|button|style|link|meta)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|form|input|button|style|link|meta)\b[^>]*\/?\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*(javascript|vbscript):[\s\S]*?\2/gi, '$1="#"')
    .replace(/style\s*=\s*(["'])[^"']*(expression\s*\(|url\s*\(\s*javascript:)[^"']*\1/gi, '')
}

function sanitizeSiteData(data: any) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Dữ liệu website không hợp lệ.')
  if (Array.isArray(data.initialNews)) {
    data.initialNews = data.initialNews.map((item: any) => ({
      ...item,
      title: cleanText(item?.title, 300),
      summary: cleanText(item?.summary, 1000),
      content: sanitizeHtmlServer(item?.content),
      quote: cleanText(item?.quote, 1000),
      quoteAuthor: cleanText(item?.quoteAuthor, 200),
    }))
  }
  return data
}

function sanitizeCmsSection(sectionKey: CmsSectionKey, value: unknown) {
  if (CMS_ARRAY_SECTIONS.has(sectionKey)) {
    if (!Array.isArray(value)) throw new Error(`Dữ liệu ${sectionKey} phải là danh sách.`)
  } else if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Dữ liệu ${sectionKey} phải là đối tượng.`)
  }

  if (sectionKey === 'news') {
    return (value as any[]).map((item) => ({
      ...item,
      title: cleanText(item?.title, 300),
      summary: cleanText(item?.summary, 1000),
      content: sanitizeHtmlServer(item?.content),
      quote: cleanText(item?.quote, 1000),
      quoteAuthor: cleanText(item?.quoteAuthor, 200),
    }))
  }
  return value
}

function legacyDataToSections(data: any): Partial<Record<CmsSectionKey, unknown>> {
  const sanitized = sanitizeSiteData(data)
  const sections: Partial<Record<CmsSectionKey, unknown>> = {}
  for (const [legacyKey, sectionKey] of Object.entries(LEGACY_TO_CMS_SECTION)) {
    if (sanitized[legacyKey] !== undefined) {
      sections[sectionKey] = sanitizeCmsSection(sectionKey, sanitized[legacyKey])
    }
  }
  return sections
}

async function writeCmsSections(env: Env, sections: Partial<Record<CmsSectionKey, unknown>>) {
  if (!env.DB) throw new Error('D1 chưa được cấu hình.')
  const now = new Date().toISOString()
  const statements = Object.entries(sections).map(([sectionKey, value]) => env.DB.prepare(`
    INSERT INTO cms_sections (section_key, payload_json, revision, updated_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(section_key) DO UPDATE SET
      payload_json = excluded.payload_json,
      revision = cms_sections.revision + 1,
      updated_at = excluded.updated_at
  `).bind(sectionKey, JSON.stringify(value), now))
  if (statements.length) await env.DB.batch(statements)
}

async function writeSingleCmsSection(
  env: Env,
  sectionKey: CmsSectionKey,
  value: unknown,
  expectedRevision?: number,
) {
  if (!env.DB) throw new Error('D1 chưa được cấu hình.')
  const now = new Date().toISOString()
  const current = await env.DB.prepare(
    'SELECT revision FROM cms_sections WHERE section_key = ?',
  ).bind(sectionKey).first() as any

  if (!current) {
    if (expectedRevision !== undefined && expectedRevision !== 0) return null
    const insert = await env.DB.prepare(`
      INSERT OR IGNORE INTO cms_sections (section_key, payload_json, revision, updated_at)
      VALUES (?, ?, 1, ?)
    `).bind(sectionKey, JSON.stringify(value), now).run()
    return Number(insert.meta?.changes || 0) === 1 ? { revision: 1, updatedAt: now } : null
  }

  const currentRevision = Number(current.revision)
  if (expectedRevision === undefined || expectedRevision !== currentRevision) return null
  const update = await env.DB.prepare(`
    UPDATE cms_sections
    SET payload_json = ?, revision = revision + 1, updated_at = ?
    WHERE section_key = ? AND revision = ?
  `).bind(JSON.stringify(value), now, sectionKey, currentRevision).run()
  if (Number(update.meta?.changes || 0) !== 1) return null
  return { revision: currentRevision + 1, updatedAt: now }
}

async function migrateLegacyKvIfNeeded(env: Env) {
  if (!env.DB) return false
  const existing = await env.DB.prepare('SELECT COUNT(*) AS count FROM cms_sections').first() as any
  if (Number(existing?.count || 0) > 0) return false

  const legacyJson = await env.VIENDONG_KV?.get('site_data')
  if (!legacyJson) return false
  const sections = legacyDataToSections(JSON.parse(legacyJson))
  if (Object.keys(sections).length === 0) return false

  await writeCmsSections(env, sections)
  await env.DB.prepare(`
    INSERT OR IGNORE INTO cms_migrations (migration_key, completed_at, details_json)
    VALUES ('legacy-kv-site-data-v1', ?, ?)
  `).bind(new Date().toISOString(), JSON.stringify({ sections: Object.keys(sections) })).run()
  return true
}

async function readCmsSections(env: Env) {
  if (!env.DB) throw new Error('D1 chưa được cấu hình.')
  await migrateLegacyKvIfNeeded(env)
  const result = await env.DB.prepare(
    'SELECT section_key, payload_json, revision, updated_at FROM cms_sections',
  ).all()
  const sections: Record<string, unknown> = {}
  const revisions: Record<string, { revision: number; updatedAt: string }> = {}
  for (const row of result.results || []) {
    const sectionKey = String((row as any).section_key)
    if (!CMS_SECTION_KEY_SET.has(sectionKey)) continue
    sections[sectionKey] = JSON.parse(String((row as any).payload_json))
    revisions[sectionKey] = {
      revision: Number((row as any).revision || 1),
      updatedAt: String((row as any).updated_at || ''),
    }
  }
  return { sections, revisions }
}

function sectionsToLegacyData(sections: Record<string, unknown>) {
  const data: Record<string, unknown> = { schemaVersion: 3 }
  for (const sectionKey of CMS_SECTION_KEYS) {
    if (sections[sectionKey] !== undefined) {
      data[CMS_TO_LEGACY_SECTION[sectionKey]] = sections[sectionKey]
    }
  }
  return data
}

async function handleCms(request: Request, env: Env, url: URL) {
  if (!env.DB) return json({ success: false, message: 'D1 chưa được cấu hình.' }, 503)

  if (request.method === 'GET' && url.pathname === '/api/content') {
    const { sections, revisions } = await readCmsSections(env)
    return json({ success: true, schemaVersion: 3, sections, revisions })
  }

  const sectionKey = decodeURIComponent(url.pathname.slice('/api/content/'.length))
  if (!CMS_SECTION_KEY_SET.has(sectionKey)) {
    return json({ success: false, message: 'Nhóm nội dung không hợp lệ.' }, 404)
  }
  if (request.method !== 'PUT') return json({ success: false, message: 'Method not allowed.' }, 405)

  const body = await request.json() as any
  const value = sanitizeCmsSection(sectionKey as CmsSectionKey, body?.data)
  const serialized = JSON.stringify(value)
  if (serialized.length > 8 * 1024 * 1024) {
    return json({ success: false, message: 'Nhóm nội dung quá lớn.' }, 413)
  }
  const expectedRevision = Number.isInteger(body?.expectedRevision) && body.expectedRevision >= 0
    ? Number(body.expectedRevision)
    : undefined
  const saved = await writeSingleCmsSection(env, sectionKey as CmsSectionKey, value, expectedRevision)
  if (!saved) {
    return json({
      success: false,
      conflict: true,
      message: 'Nội dung đã được một phiên quản trị khác cập nhật. Hãy tải lại trang trước khi lưu tiếp.',
    }, 409)
  }
  return json({
    success: true,
    sectionKey,
    revision: saved.revision,
    updatedAt: saved.updatedAt,
  })
}

function quoteFromRow(row: any) {
  return {
    id: row.id,
    code: row.code,
    createdAt: row.created_at,
    customerName: row.customer_name,
    company: row.company || '',
    phone: row.phone,
    email: row.email,
    province: row.province || '',
    customerType: row.customer_type,
    note: row.note || '',
    items: JSON.parse(row.items_json || '[]'),
    status: row.status,
  }
}

async function handleQuotes(request: Request, env: Env, url: URL) {
  if (!env.DB) return json({ success: false, message: 'D1 chưa được cấu hình.' }, 503)

  const id = url.pathname.startsWith('/api/quotes/') ? decodeURIComponent(url.pathname.slice('/api/quotes/'.length)) : ''
  if (request.method === 'POST' && id === 'import') {
    const body = await request.json() as any
    if (!Array.isArray(body.quotes) || body.quotes.length > 5000) return json({ success: false, message: 'Danh sách quote import không hợp lệ.' }, 400)
    const statements = body.quotes.map((quote: any) => env.DB.prepare(`
      INSERT INTO quotes (
        id, code, idempotency_key, created_at, customer_name, company, phone, email,
        province, customer_type, note, items_json, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code, customer_name = excluded.customer_name, company = excluded.company,
        phone = excluded.phone, email = excluded.email, province = excluded.province,
        customer_type = excluded.customer_type, note = excluded.note, items_json = excluded.items_json,
        status = excluded.status, updated_at = excluded.updated_at
    `).bind(
      cleanText(quote.id, 160) || crypto.randomUUID(),
      cleanText(quote.code, 40) || `VD-${crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(-6).padStart(6, '0')}`,
      `import-${cleanText(quote.id, 160) || crypto.randomUUID()}`,
      cleanText(quote.createdAt, 80) || new Date().toISOString(),
      cleanText(quote.customerName, 200),
      cleanText(quote.company, 300),
      cleanText(quote.phone, 50),
      cleanText(quote.email, 200),
      cleanText(quote.province, 160),
      cleanText(quote.customerType, 80),
      cleanText(quote.note, 3000),
      JSON.stringify(Array.isArray(quote.items) ? quote.items.slice(0, 200) : []),
      QUOTE_STATUSES.has(quote.status) ? quote.status : 'new',
      new Date().toISOString(),
    ))
    if (statements.length) await env.DB.batch(statements)
    return json({ success: true, imported: statements.length })
  }

  if (request.method === 'GET' && !id) {
    const result = await env.DB.prepare('SELECT * FROM quotes ORDER BY created_at DESC LIMIT 1000').all()
    return json({ success: true, quotes: (result.results || []).map(quoteFromRow) })
  }

  if (request.method === 'POST' && !id) {
    const body = await request.json() as any
    const items = Array.isArray(body.items) ? body.items.slice(0, 200).map((item: any) => ({
      id: cleanText(item.id, 160),
      name: cleanText(item.name, 300),
      sku: cleanText(item.sku, 160),
      qty: Math.max(1, Math.min(999, Number(item.qty) || 1)),
    })) : []
    const customerName = cleanText(body.customerName, 200)
    const phone = cleanText(body.phone, 50)
    const email = cleanText(body.email, 200)
    if (!customerName || !phone || !email || items.length === 0) {
      return json({ success: false, message: 'Thiếu thông tin bắt buộc hoặc danh sách sản phẩm trống.' }, 400)
    }

    const quoteId = crypto.randomUUID()
    const idempotencyKey = cleanText(body.idempotencyKey, 160) || crypto.randomUUID()
    const code = `VD-${crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(-6).padStart(6, '0')}`
    const createdAt = new Date().toISOString()
    await env.DB.prepare(`
      INSERT OR IGNORE INTO quotes (
        id, code, idempotency_key, created_at, customer_name, company, phone, email,
        province, customer_type, note, items_json, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `).bind(
      quoteId,
      code,
      idempotencyKey,
      createdAt,
      customerName,
      cleanText(body.company, 300),
      phone,
      email,
      cleanText(body.province, 160),
      cleanText(body.customerType, 80),
      cleanText(body.note, 3000),
      JSON.stringify(items),
    ).run()
    const row = await env.DB.prepare('SELECT * FROM quotes WHERE idempotency_key = ?').bind(idempotencyKey).first()
    return json({ success: true, quote: quoteFromRow(row) }, 201)
  }

  if (request.method === 'PATCH' && id) {
    const body = await request.json() as any
    if (!QUOTE_STATUSES.has(body.status)) return json({ success: false, message: 'Trạng thái không hợp lệ.' }, 400)
    await env.DB.prepare('UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?').bind(body.status, new Date().toISOString(), id).run()
    const row = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first()
    return row ? json({ success: true, quote: quoteFromRow(row) }) : json({ success: false, message: 'Không tìm thấy yêu cầu.' }, 404)
  }

  if (request.method === 'DELETE' && id) {
    await env.DB.prepare('DELETE FROM quotes WHERE id = ?').bind(id).run()
    return json({ success: true })
  }

  return json({ success: false, message: 'Method not allowed.' }, 405)
}

async function handleMediaUpload(request: Request, env: Env, url: URL) {
  if (!env.MEDIA) return json({ success: false, message: 'R2 chưa được cấu hình.' }, 503)
  const folder = cleanText(url.searchParams.get('folder'), 40)
  if (!MEDIA_FOLDERS.has(folder)) return json({ success: false, message: 'Nhóm media không hợp lệ.' }, 400)
  const source = await request.arrayBuffer()
  if (!source.byteLength || source.byteLength > 20 * 1024 * 1024) return json({ success: false, message: 'Ảnh phải nhỏ hơn 20 MB.' }, 413)

  let webpBytes: ArrayBuffer = source
  if (env.IMAGES) {
    const transformed = await env.IMAGES
      .input(new Blob([source], { type: request.headers.get('Content-Type') || 'application/octet-stream' }).stream())
      .output({ format: 'image/webp', quality: 82, anim: false })
    const transformedResponse = transformed.response()
    if (!transformedResponse.ok) return json({ success: false, message: 'Cloudflare không thể xử lý ảnh.' }, 415)
    webpBytes = await transformedResponse.arrayBuffer()
  } else if (request.headers.get('Content-Type') !== 'image/webp') {
    return json({ success: false, message: 'Images binding chưa bật; máy khách phải gửi WebP.' }, 415)
  }

  const requestedName = cleanText(request.headers.get('X-File-Name'), 160).replace(/[^a-zA-Z0-9._-]/g, '-')
  const baseName = requestedName.replace(/\.webp$/i, '') || 'image'
  const key = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${baseName}.webp`
  await env.MEDIA.put(key, webpBytes, {
    httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: {
      originalName: requestedName,
      width: cleanText(request.headers.get('X-Image-Width'), 10),
      height: cleanText(request.headers.get('X-Image-Height'), 10),
    },
  })
  return json({ success: true, url: `/media/${key}`, key, bytes: webpBytes.byteLength })
}

async function serveMedia(env: Env, key: string) {
  if (!env.MEDIA) return new Response('Media storage is not configured.', { status: 503 })
  if (!key || key.includes('..') || key.startsWith('/')) return new Response('Invalid media key.', { status: 400 })
  const object = await env.MEDIA.get(key)
  if (!object) return new Response('Not found', { status: 404 })
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(object.body, { headers })
}

function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: https:; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'")
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    try {
      if (url.pathname === '/api/content' || url.pathname.startsWith('/api/content/')) {
        return await handleCms(request, env, url)
      }
      if (url.pathname === '/api/quotes' || url.pathname.startsWith('/api/quotes/')) {
        return await handleQuotes(request, env, url)
      }
      if (url.pathname === '/api/media' && request.method === 'POST') {
        return await handleMediaUpload(request, env, url)
      }
      if (url.pathname.startsWith('/media/') && request.method === 'GET') {
        const r2Response = await serveMedia(env, decodeURIComponent(url.pathname.slice('/media/'.length)))
        if (r2Response.ok) return r2Response
        return withSecurityHeaders(await env.ASSETS.fetch(request))
      }
      if (url.pathname.startsWith('/products/') && request.method === 'GET' && env.MEDIA) {
        const r2Response = await serveMedia(env, decodeURIComponent(url.pathname.slice(1)))
        if (r2Response.ok) return r2Response
      }

      if (url.pathname === '/api/site-data') {
        if (request.method === 'GET') {
          if (env.DB) {
            const { sections, revisions } = await readCmsSections(env)
            if (Object.keys(sections).length) {
              return json({ ...sectionsToLegacyData(sections), revisions })
            }
          }
          const legacyStored = await env.VIENDONG_KV?.get('site_data')
          return legacyStored
            ? new Response(legacyStored, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } })
            : json({ exists: false })
        }
        if (request.method === 'POST') {
          return json({
            success: false,
            message: 'API lưu toàn bộ site đã ngừng hoạt động. Hãy tải lại trang quản trị để dùng API D1 theo từng nhóm nội dung.',
          }, 410)
        }
        return json({ success: false, message: 'Method not allowed.' }, 405)
      }
    } catch (error: any) {
      console.error('API error:', error)
      return json({ success: false, message: error?.message || 'Lỗi máy chủ.' }, 500)
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request))
  },
}
