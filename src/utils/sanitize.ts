import DOMPurify from 'dompurify'

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,/i

export function isSafeContentUrl(value: string): boolean {
  const url = value.trim()
  return !url || (!/[\u0000-\u001f"'<>\\]/.test(url) && (SAFE_URL.test(url) || SAFE_DATA_IMAGE.test(url)))
}

export function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function sanitizeRichHtml(value: string): string {
  if (!value) return ''
  if (typeof window === 'undefined' || typeof DOMPurify.sanitize !== 'function') {
    return value
      .replace(/<(script|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<(script|iframe|object|embed|form|input|button)\b[^>]*\/?\s*>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"')
  }

  const clean = DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style', 'link', 'meta'],
    FORBID_ATTR: ['srcdoc'],
    ALLOW_DATA_ATTR: true,
  })

  const documentFragment = new DOMParser().parseFromString(clean, 'text/html')
  documentFragment.querySelectorAll<HTMLElement>('[href], [src]').forEach((element) => {
    const attribute = element.hasAttribute('href') ? 'href' : 'src'
    const url = element.getAttribute(attribute) || ''
    if (!isSafeContentUrl(url)) element.removeAttribute(attribute)
    if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer')
    }
  })
  return documentFragment.body.innerHTML
}

export function sanitizePlainText(value: unknown, maxLength = 5000): string {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, maxLength)
}
