import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCotizacion } from '@/lib/supabase/queries'
import { fmtARS } from '@/utils'

export default async function AdminDashboard() {
  const sb = await createClient()
  const cotizacion = await getCotizacion()

  const [
    { count: total },
    { count: visibles },
    { count: destacados },
    { count: marcas },
    { count: revendedores },
  ] = await Promise.all([
    sb.from('productos').select('*', { count: 'exact', head: true }),
    sb.from('productos').select('*', { count: 'exact', head: true }).eq('visible', true),
    sb.from('productos').select('*', { count: 'exact', head: true }).eq('destacado', true),
    sb.from('marcas').select('*', { count: 'exact', head: true }).eq('activa', true),
    sb.from('revendedores').select('*', { count: 'exact', head: true }).eq('activo', true),
  ])

  const stats = [
    { label: 'Productos', value: total ?? 0, href: '/admin/productos', color: '#4f6ef7' },
    { label: 'Visibles', value: visibles ?? 0, href: '/admin/productos', color: '#22c55e' },
    { label: 'Destacados', value: destacados ?? 0, href: '/admin/productos', color: '#f59e0b' },
    { label: 'Marcas', value: marcas ?? 0, href: '/admin/marcas', color: '#8b5cf6' },
    { label: 'Revendedores', value: revendedores ?? 0, href: '/admin/revendedores', color: '#06b6d4' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>Panel de administración</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Cotización actual: <strong style={{ color: 'var(--text)' }}>1 USD = {fmtARS(cotizacion)}</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginBottom: 40 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = s.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{ fontSize: 34, fontWeight: 900, color: s.color, marginBottom: 4, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
        {[
          { href: '/admin/productos/nuevo', icon: '＋', label: 'Nuevo producto', desc: 'Agregar al catálogo' },
          { href: '/admin/cotizacion',      icon: '💲', label: 'Cotización',     desc: `Actual: ${fmtARS(cotizacion)}` },
          { href: '/admin/marcas',          icon: '🏷',  label: 'Marcas',         desc: 'Gestionar marcas' },
          { href: '/admin/categorias',      icon: '📂', label: 'Categorías',     desc: 'Gestionar categorías' },
          { href: '/admin/proveedores',     icon: '🏭', label: 'Proveedores',    desc: 'Gestionar proveedores' },
          { href: '/admin/revendedores',    icon: '👥', label: 'Revendedores',   desc: 'Accesos mayoristas' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface-2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
