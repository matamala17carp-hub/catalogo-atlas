'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin',              icon: '⊞', label: 'Dashboard' },
  { href: '/admin/productos',    icon: '📦', label: 'Productos' },
  { href: '/admin/cotizacion',   icon: '💲', label: 'Cotización' },
  { href: '/admin/marcas',       icon: '🏷', label: 'Marcas' },
  { href: '/admin/categorias',   icon: '📂', label: 'Categorías' },
  { href: '/admin/proveedores',  icon: '🏭', label: 'Proveedores' },
  { href: '/admin/revendedores', icon: '👥', label: 'Revendedores' },
]

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ width: 220, minHeight: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.3px', marginBottom: 2 }}>
          Catálogo <span style={{ color: 'var(--accent)' }}>Atlas</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? 'rgba(79,110,247,0.12)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-dim)',
                fontSize: 13, fontWeight: active ? 700 : 500,
                transition: 'background 0.1s, color 0.1s',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Ver catálogo / Salir */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer' }}>
            ← Ver catálogo
          </div>
        </Link>
        <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
