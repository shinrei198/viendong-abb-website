export type AdminRole = 'admin' | 'content' | 'business'

export type AdminPermission =
  | 'users.manage'
  | 'content.home.manage'
  | 'content.news.manage'
  | 'content.videos.manage'
  | 'catalog.manage'
  | 'quotes.read'
  | 'quotes.update'
  | 'quotes.delete'
  | 'quotes.import'
  | 'settings.manage'
  | 'media.content.upload'
  | 'media.products.upload'

export interface AdminSession {
  email: string
  displayName: string
  role: AdminRole
  permissions: AdminPermission[]
}
