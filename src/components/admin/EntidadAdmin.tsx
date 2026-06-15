'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearMarca, eliminarMarca, toggleMarca, crearCategoria, eliminarCategoria, toggleCategoria, crearProveedor, eliminarProveedor } from '@/lib/supabase/actions'

type Tipo = 'marcas' | 'categorias' | 'proveedores'
interface Item { id: number; nombre: string; activa?: boolean; activo?: boolean; notas?: string | null }

interface Props { tipo: Tipo; items: Item[] }

const CONFIG: Record<Tipo, { label: string; tieneToggle: boolean; tieneNotas: boolean }> = {
  marcas:      { label: 'marca',      tieneToggle: true,  tieneNotas: false },
  categorias:  { label: 'categoría',  tieneToggle: true,  tieneNotas: false },
  proveedores: { label: 'proveedor',  tieneToggle: false, tieneNotas: true  },
}

export default function EntidadAdmin({ tipo, items: inicial }: Props) {
  const router = useRouter()
  const [items, setItems]   = useState(inicial)
  const [nombre, setNombre] = useState('')
  const [notas, setNotas]   = useState('')
  const [loading, setLoading] = useState(false)
  const cfg = CONFIG[tipo]

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    if (tipo === 'marcas')      await crearMarca(nombre.trim())
    if (tipo === 'categorias')  await crearCategoria(nombre.trim())
    if (tipo === 'proveedores') await crearProveedor(nombre.trim(), notas.trim() || undefined)
    setNombre(''); setNotas('')
    router.refresh()
    setLoading(false)
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar? No se puede deshacer.')) return
    if (tipo === 'marcas')      await eliminarMarca(id)
    if (tipo === 'categorias')  await eliminarCategoria(id)
    if (tipo === 'proveedores') await eliminarProveedor(id)
    setItems(items.filter(i => i.id !== id))
    router.refresh()
  }

  const handleToggle = async (id: number, activa: boolean) => {
    if (tipo === 'marcas')     await toggleMarca(id, !activa)
    if (tipo === 'categorias') await toggleCategoria(id, !activa)
    setItems(items.map(i => i.id === id ? { ...i, activa: !activa, activo: !activa } : i))
  }

  const estaActivo = (item: Item) => item.activa ?? item.activo ?? true

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Formulario de alta */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
          Nueva {cfg.label}
        </h3>
        <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="inp" placeholder={`Nombre de la ${cfg.label}`} value={nombre} onChange={e => setNombre(e.target.value)} required />
          {cfg.tieneNotas && (
            <input className="inp" placeholder="Notas / contacto (opcional)" value={notas} onChange={e => setNotas(e.target.value)} />
          )}
          <button className="btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '9px 20px' }}>
            {loading ? 'Guardando...' : `Agregar ${cfg.label}`}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No hay {tipo} aún.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', textAlign: 'left' }}>Nombre</th>
                {cfg.tieneToggle && <th style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>Estado</th>}
                {cfg.tieneNotas && <th style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', textAlign: 'left' }}>Notas</th>}
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>Acc.</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600, fontSize: 13 }}>{item.nombre}</td>
                  {cfg.tieneToggle && (
                    <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                      <button onClick={() => handleToggle(item.id, estaActivo(item))} style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                        background: estaActivo(item) ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
                        borderColor: estaActivo(item) ? 'rgba(34,197,94,0.25)' : 'var(--border)',
                        color: estaActivo(item) ? 'var(--green)' : 'var(--text-muted)',
                      }}>
                        {estaActivo(item) ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                  )}
                  {cfg.tieneNotas && (
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-dim)' }}>{item.notas ?? '—'}</td>
                  )}
                  <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                    <button onClick={() => handleEliminar(item.id)} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
