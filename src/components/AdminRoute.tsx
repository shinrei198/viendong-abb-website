import { lazy, Suspense, useEffect, useState } from 'react'
import type { AdminSession } from '@/types/admin'

const AdminPage = lazy(() => import('@/pages/AdminPage'))

interface AdminRouteProps {
  onNavigate: (page: string, id?: string) => void
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="min-h-[70vh] bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF000F]" />
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  )
}

export default function AdminRoute({ onNavigate }: AdminRouteProps) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/auth/session', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (!response.ok || !payload?.success || !payload?.user) {
          if (import.meta.env.DEV) {
            if (active) {
              setSession({
                email: 'admin@viendong.local',
                displayName: 'Quản trị viên (Local Dev)',
                role: 'admin',
                permissions: [
                  'users.manage',
                  'content.home.manage',
                  'content.news.manage',
                  'content.videos.manage',
                  'catalog.manage',
                  'quotes.read',
                  'quotes.update',
                  'quotes.delete',
                  'quotes.import',
                  'settings.manage',
                  'media.content.upload',
                  'media.products.upload',
                ],
              })
            }
            return
          }
          throw new Error(payload?.message || 'Bạn chưa được cấp quyền truy cập hệ thống quản trị.')
        }
        if (active) setSession(payload.user)
      })
      .catch((reason) => {
        if (import.meta.env.DEV) {
          if (active) {
            setSession({
              email: 'admin@viendong.local',
              displayName: 'Quản trị viên (Local Dev)',
              role: 'admin',
              permissions: [
                'users.manage',
                'content.home.manage',
                'content.news.manage',
                'content.videos.manage',
                'catalog.manage',
                'quotes.read',
                'quotes.update',
                'quotes.delete',
                'quotes.import',
                'settings.manage',
                'media.content.upload',
                'media.products.upload',
              ],
            })
          }
          return
        }
        if (active) setError(reason instanceof Error ? reason.message : 'Không thể xác minh tài khoản quản trị.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  if (loading) return <LoadingPanel message="Đang xác minh quyền quản trị…" />
  if (!session) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-xl border-t-4 border-[#FF000F] bg-white p-8 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF000F]">Truy cập được bảo vệ</p>
          <h1 className="mb-3 text-2xl font-bold text-[#1B4C98]">Không thể mở hệ thống quản trị</h1>
          <p className="mb-6 text-sm leading-6 text-slate-600">{error}</p>
          <button onClick={() => onNavigate('home')} className="bg-[#1B4C98] px-5 py-2.5 text-sm font-semibold text-white">Về trang chủ</button>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingPanel message="Đang tải hệ thống quản trị…" />}>
      <AdminPage onNavigate={onNavigate} session={session} />
    </Suspense>
  )
}
