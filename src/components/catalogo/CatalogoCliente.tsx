'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { fmtUSD, fmtARS, calcARS, waURL, waMsg } from '@/utils'
import type { Producto, Marca, Categoria } from '@/types'

const ESTADO_LABEL: Record<string, string> = { nuevo: 'Nuevo', reacondicionado: 'Reacond.', usado: 'Usado' }

interface Props {
  productos: Producto[]
  cotizacion: number
  whatsapp: string
  marcas: Marca[]
  categorias: Categoria[]
  esRevendedor: boolean
  esAdmin: boolean
  user: { email: string; id: string } | null
}

export default function CatalogoCliente({ productos, cotizacion, whatsapp, marcas, categorias, esRevendedor, esAdmin, user }: Props) {
  const router = useRouter()
  const [busqueda, setBusqueda]     = useState('')
  const [catFiltro, setCatFiltro]   = useState('all')
  const [marcaFiltro, setMarcaFiltro] = useState('all')
  const [estadoFiltro, setEstadoFiltro] = useState('all')

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.refresh()
  }

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return productos.filter(p => {
      if (q && !p.nombre.toLowerCase().includes(q) && !(p.descripcion_corta ?? '').toLowerCase().includes(q)) return false
      if (catFiltro !== 'all' && String(p.categoria_id) !== catFiltro) return false
      if (marcaFiltro !== 'all' && String(p.marca_id) !== marcaFiltro) return false
      if (estadoFiltro !== 'all' && p.estado !== estadoFiltro) return false
      return true
    })
  }, [productos, busqueda, catFiltro, marcaFiltro, estadoFiltro])

  const limpiarFiltros = () => { setBusqueda(''); setCatFiltro('all'); setMarcaFiltro('all'); setEstadoFiltro('all') }
  const hayFiltros = busqueda || catFiltro !== 'all' || marcaFiltro !== 'all' || estadoFiltro !== 'all'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.3px' }}>
            Catálogo <span style={{ color: 'var(--accent)' }}>Atlas</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {esAdmin && (
              <a href="/admin" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', padding: '6px 14px', border: '1px solid rgba(79,110,247,0.3)', borderRadius: 8 }}>
                Panel Admin
              </a>
            )}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  {esRevendedor && !esAdmin && <span style={{ color: 'var(--accent)', fontWeight: 700, marginRight: 6 }}>Revendedor ·</span>}
                  {user.email}
                </span>
                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer' }}>
                  Salir
                </button>
              </div>
            ) : (
              <a href="/login" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textDecoration: 'none', padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8 }}>
                Acceso revendedores
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <header style={{ background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)', padding: '52px 24px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79,110,247,0.07), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.18)', borderRadius: 20, padding: '4px 14px', marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em' }}>
              {esRevendedor && !esAdmin ? 'Vista Mayorista activa' : 'Catálogo mayorista & minorista'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.05, marginBottom: 12 }}>
            Catálogo <span style={{ color: 'var(--accent)' }}>Atlas</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7 }}>
            Precios en USD · Conversión en tiempo real · 1 USD = {fmtARS(cotizacion)}
          </p>
          {esRevendedor && !esAdmin && (
            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, padding: '8px 16px' }}>
              <span style={{ fontSize: 12, color: '#8ba3fa', fontWeight: 600 }}>✓ Precios mayoristas y condiciones activos</span>
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 20px' }}>

        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10, marginBottom: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12 }}>🔍</span>
            <input className="inp" style={{ paddingLeft: 32 }} placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <select className="inp" value={catFiltro} onChange={e => setCatFiltro(e.target.value)}>
            <option value="all">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
          </select>
          <select className="inp" value={marcaFiltro} onChange={e => setMarcaFiltro(e.target.value)}>
            <option value="all">Todas las marcas</option>
            {marcas.map(m => <option key={m.id} value={String(m.id)}>{m.nombre}</option>)}
          </select>
          <select className="inp" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="reacondicionado">Reacondicionado</option>
            <option value="usado">Usado</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)', padding: '0 4px' }}>
            <span><strong style={{ color: 'var(--text)' }}>{filtrados.length}</strong> productos</span>
            {hayFiltros && (
              <button onClick={limpiarFiltros} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No se encontraron productos</p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Probá cambiando los filtros.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px,1fr))', gap: 16 }}>
            {filtrados.map(p => (
              <ProductoCard key={p.id} producto={p} cotizacion={cotizacion} whatsapp={whatsapp} esRevendedor={esRevendedor} />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '24px 20px', marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800 }}>Catálogo Atlas <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>© 2026</span></span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Precios en USD · Conversión automática a ARS</span>
        </div>
      </footer>
    </div>
  )
}

function ProductoCard({ producto: p, cotizacion, whatsapp, esRevendedor }: {
  producto: Producto; cotizacion: number; whatsapp: string; esRevendedor: boolean
}) {
  const precio    = esRevendedor ? p.precio_usd_mayorista : p.precio_usd_minorista
  const ars       = calcARS(precio, cotizacion)
  const ahorro    = p.precio_usd_minorista - p.precio_usd_mayorista

  const handleWA = () => {
    const msg = waMsg(p.nombre, precio, ars, esRevendedor, p.cantidad_minima_mayorista)
    window.open(waURL(whatsapp, msg), '_blank')
  }

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${p.visible ? 'var(--border)' : 'var(--border-s)'}`,
      borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', transition: 'border-color 0.2s, box-shadow 0.2s',
      opacity: p.visible ? 1 : 0.65,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-s)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = p.visible ? 'var(--border)' : 'var(--border-s)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {(p.marcas as { nombre: string } | null)?.nombre && (
            <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--surface-3)', border: '1px solid var(--border-s)', borderRadius: 20, padding: '2px 8px', color: 'var(--text-dim)' }}>
              {(p.marcas as { nombre: string }).nombre}
            </span>
          )}
          {(p.categorias as { nombre: string } | null)?.nombre && (
            <span style={{ fontSize: 10, background: 'var(--surface-2)', borderRadius: 20, padding: '2px 8px', color: 'var(--text-muted)' }}>
              {(p.categorias as { nombre: string }).nombre}
            </span>
          )}
          <span className={`badge badge-${p.estado}`}>{ESTADO_LABEL[p.estado] ?? p.estado}</span>
          {!p.visible && (
            <span style={{ fontSize: 10, background: 'var(--surface-3)', border: '1px solid var(--border-s)', borderRadius: 6, padding: '2px 8px', color: 'var(--text-muted)', fontWeight: 700 }}>
              OCULTO
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.2px' }}>
          {p.nombre}
        </h3>
        {p.descripcion_corta && (
          <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {p.descripcion_corta}
          </p>
        )}

        {/* Mezcla (revendedor) */}
        {esRevendedor && p.permite_mezcla && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(79,110,247,0.07)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#8ba3fa', fontWeight: 600, marginBottom: 6 }}>
            ⇄ Permite mezcla de modelos
          </div>
        )}
      </div>

      {/* Precios */}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
        {esRevendedor && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              Minorista: {fmtUSD(p.precio_usd_minorista)}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '2px 8px', color: 'var(--green)' }}>
              −{fmtUSD(ahorro)}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              {esRevendedor ? 'Mayorista' : 'Precio'}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {fmtUSD(precio)} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>USD</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              Equivale a
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
              {fmtARS(ars)} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-dim)' }}>ARS</span>
            </div>
          </div>
        </div>

        {esRevendedor && (
          <div style={{ background: 'rgba(79,110,247,0.07)', border: '1px solid rgba(79,110,247,0.15)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#8ba3fa', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>Mínimo: <strong>{p.cantidad_minima_mayorista} unidades</strong></span>
            {p.permite_mezcla && <span style={{ color: 'var(--text-muted)' }}>Mezcla ✓</span>}
          </div>
        )}

        <button className="btn-wa" onClick={handleWA}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  )
}
