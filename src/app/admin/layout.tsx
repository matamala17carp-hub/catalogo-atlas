import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminSidebar email={user.email ?? ''} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 28px', maxWidth: 1100 }}>
        {children}
      </main>
    </div>
  )
}
