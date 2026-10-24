import { useEffect, useState } from 'react'
import type { AdminRole, AdminSession } from '@/types/admin'

interface ManagedUser {
  email: string
  displayName: string
  role: AdminRole
  active: number
  createdAt: string
  updatedAt: string
}

interface AdminUsersTabProps {
  session: AdminSession
  showToast: (message: string) => void
}

const roleLabels: Record<AdminRole, string> = {
  admin: 'Admin',
  content: 'Content',
  business: 'Business',
}

const roleDescriptions: Record<AdminRole, string> = {
  admin: 'Toàn quyền nội dung, sản phẩm, báo giá, cài đặt và quản lý tài khoản.',
  content: 'Quản lý trang chủ, banner, tin tức, video và media nội dung.',
  business: 'Quản lý danh mục sản phẩm; xem và cập nhật trạng thái báo giá.',
}

export default function AdminUsersTab({ session, showToast }: AdminUsersTabProps) {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<AdminRole>('content')

  const request = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options?.headers || {}) },
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.success) throw new Error(payload?.message || 'Không thể cập nhật tài khoản.')
    return payload
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const payload = await request('/api/admin/users')
      setUsers(payload.users || [])
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể tải danh sách tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadUsers() }, [])

  const addUser = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await request('/api/admin/users', { method: 'POST', body: JSON.stringify({ email, displayName, role }) })
      setEmail('')
      setDisplayName('')
      setRole('content')
      await loadUsers()
      showToast('Đã thêm tài khoản và cấp vai trò.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể thêm tài khoản.')
    }
  }

  const updateUser = async (user: ManagedUser, patch: Partial<Pick<ManagedUser, 'role' | 'active'>>) => {
    try {
      await request(`/api/admin/users/${encodeURIComponent(user.email)}`, { method: 'PATCH', body: JSON.stringify(patch) })
      await loadUsers()
      showToast('Đã cập nhật quyền tài khoản.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể cập nhật tài khoản.')
    }
  }

  return (
    <section className="space-y-5">
      <div className="border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF000F]">Phân quyền truy cập</p>
        <h2 className="mt-1 text-xl font-bold text-[#1B4C98]">Tài khoản quản trị</h2>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
          Tài khoản được nhận diện bởi email đã xác minh qua Cloudflare Access. Hệ thống không lưu mật khẩu. “Vô hiệu hóa” được dùng thay cho xóa vĩnh viễn để giữ lịch sử kiểm toán.
        </p>
      </div>

      <form onSubmit={addUser} className="grid gap-3 border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_180px_auto] md:items-end">
        <label className="text-xs font-semibold text-slate-700">Email được phép
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B4C98]" />
        </label>
        <label className="text-xs font-semibold text-slate-700">Tên hiển thị
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B4C98]" />
        </label>
        <label className="text-xs font-semibold text-slate-700">Vai trò
          <select value={role} onChange={(event) => setRole(event.target.value as AdminRole)} className="mt-1 w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#1B4C98]">
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="submit" className="bg-[#FF000F] px-5 py-2.5 text-sm font-bold text-white">Thêm tài khoản</button>
        <p className="md:col-span-4 text-[11px] text-slate-500">{roleDescriptions[role]}</p>
      </form>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-sm text-slate-500">Đang tải tài khoản…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isSelf = user.email.toLowerCase() === session.email.toLowerCase()
                  return (
                    <tr key={user.email} className={user.active ? '' : 'bg-slate-50 opacity-70'}>
                      <td className="px-4 py-3"><p className="font-bold text-slate-800">{user.displayName || user.email}</p><p className="mt-0.5 text-slate-500">{user.email}{isSelf ? ' · Bạn' : ''}</p></td>
                      <td className="px-4 py-3">
                        <select disabled={isSelf} value={user.role} onChange={(event) => void updateUser(user, { role: event.target.value as AdminRole })} className="border border-slate-300 bg-white px-2 py-1.5">
                          {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><span className={user.active ? 'font-bold text-emerald-700' : 'font-bold text-slate-400'}>{user.active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}</span></td>
                      <td className="px-4 py-3 text-right">
                        {!isSelf && <button onClick={() => void updateUser(user, { active: user.active ? 0 : 1 })} className={user.active ? 'font-bold text-red-600 hover:underline' : 'font-bold text-[#1B4C98] hover:underline'}>{user.active ? 'Vô hiệu hóa' : 'Kích hoạt lại'}</button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
