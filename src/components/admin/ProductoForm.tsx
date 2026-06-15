'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearProducto, actualizarProducto } from '@/lib/supabase/actions'
import type { Producto, Marca, Categoria, Subcategoria, Proveedor } from '@/types'

interface Props {
  producto?: Producto
  marcas: Marca[]; categorias: Categoria[]; subcategorias: Subcategoria[]; proveedores: Proveedor[]
}

export default function ProductoForm({ producto, marcas, categorias, subcategorias, proveedores }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [catSel, setCatSel]   = useState(producto?.categoria_id ? String(producto.categoria_id) : '')

  const subsFiltradas = subcategorias.filter(s => String(s.categoria_id) === catSel)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)
    try {
      if (producto) await actualizarProducto(producto.id, fd)
      else await crearProducto(fd)
      router.push('/admin/productos'); router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally { setLoading(false) }
  }

  const f = (label: string, name: string, type = 'text', opts?: { placeholder?: string; required?: boolean; step?: string; style?: React.CSSProperties }) => (
    <div>
      <label className="form-label">{label}{opts?.required && ' *'}</label>
      <input className="inp" type={type} name={name} defaultValue={producto ? String((producto as Record<string,unknown>)[name] ?? '') : ''} {...opts} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Bloque 1: Básicos */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Información básica</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nombre *</label>
            <input className="inp" name="nombre" required defaultValue={producto?.nombre ?? ''} placeholder="Ej: iPhone 15 Pro Max 256GB" />
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select className="inp" name="estado" defaultValue={producto?.estado ?? 'nuevo'}>
              <option value="nuevo">Nuevo</option>
              <option value="reacondicionado">Reacondicionado</option>
              <option value="usado">Usado</option>
            </select>
          </div>
          <div>
            <label className="form-label">Visibilidad</label>
            <select className="inp" name="visible" defaultValue={producto ? String(producto.visible) : 'true'}>
              <option value="true">Visible (público)</option>
              <option value="false">Oculto (solo admin)</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Descripción corta</label>
            <textarea className="inp" name="descripcion_corta" rows={2} defaultValue={producto?.descripcion_corta ?? ''} placeholder="Especificaciones clave del producto..." style={{ resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* Bloque 2: Precios */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Precios (USD)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label className="form-label">Minorista (USD) *</label>
            <input className="inp" name="precio_usd_minorista" type="number" required step="0.01" defaultValue={producto?.precio_usd_minorista ?? ''} placeholder="0.00" style={{ fontWeight: 700 }} />
          </div>
          <div>
            <label className="form-label">Mayorista (USD) *</label>
            <input className="inp" name="precio_usd_mayorista" type="number" required step="0.01" defaultValue={producto?.precio_usd_mayorista ?? ''} placeholder="0.00" style={{ fontWeight: 700, color: 'var(--accent)' }} />
          </div>
          <div>
            <label className="form-label">Mínimo mayorista</label>
            <input className="inp" name="cantidad_minima_mayorista" type="number" defaultValue={producto?.cantidad_minima_mayorista ?? 1} />
          </div>
          <div>
            <label className="form-label">Permite mezcla</label>
            <select className="inp" name="permite_mezcla" defaultValue={producto ? String(producto.permite_mezcla) : 'false'}>
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bloque 3: Clasificación */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Clasificación</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label className="form-label">Categoría</label>
            <select className="inp" name="categoria_id" value={catSel} onChange={e => setCatSel(e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Subcategoría</label>
            <select className="inp" name="subcategoria_id" defaultValue={producto?.subcategoria_id ? String(producto.subcategoria_id) : ''}>
              <option value="">Sin subcategoría</option>
              {subsFiltradas.map(s => <option key={s.id} value={String(s.id)}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Marca</label>
            <select className="inp" name="marca_id" defaultValue={producto?.marca_id ? String(producto.marca_id) : ''}>
              <option value="">Sin marca</option>
              {marcas.map(m => <option key={m.id} value={String(m.id)}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Proveedor (interno)</label>
            <select className="inp" name="proveedor_id" defaultValue={producto?.proveedor_id ? String(producto.proveedor_id) : ''}>
              <option value="">Sin proveedor</option>
              {proveedores.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Destacado</label>
            <select className="inp" name="destacado" defaultValue={producto ? String(producto.destacado) : 'false'}>
              <option value="false">No destacado</option>
              <option value="true">Destacado</option>
            </select>
          </div>
          <div>
            <label className="form-label">URL de imagen (opcional)</label>
            <input className="inp" name="imagen_url" type="url" defaultValue={producto?.imagen_url ?? ''} placeholder="https://..." />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171' }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.back()} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: 13, color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancelar
        </button>
        <button className="btn-primary" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
