'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { eliminarProducto, actualizarOrden, toggleVisible } from '@/lib/supabase/actions'
import { fmtUSD } from '@/utils'
import type { Producto, Marca, Categoria } from '@/types'

const ESTADO_LABEL: Record<string, string> = { nuevo: 'Nuevo', reacondicionado: 'Reacond.', usado: 'Usado' }

interface Props { productos: Producto[]; marcas: Marca[]; categorias: Categoria[] }

export default function ProductosAdmin({ productos: inicial, marcas, categorias }: Props) {
  const router = useRouter()
  const [lista, setLista] = useState(inicial)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = lista.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const mover = async (idx: number, dir: number) => {
    const arr   = [...lista]
    const to    = idx + dir
    const iReal = lista.indexOf(filtrados[idx])
    const jReal = lista.indexOf(filtrados[to])
    if (to < 0 || to >= filtrados.length) return;
    [arr[iReal], arr[jReal]] = [arr[jReal], arr[iReal]]
    const actualizado = arr.map((p, i) => ({ ...p, orden: i }))
    setLista(actualizado)
    await actualizarOrden(actualizado.map(p => p.id))
    router.refresh()
  }

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
    await eliminarProducto(id)
    setLista(lista.filter(p => p.id !== id))
    router.refresh()
  }

  const handleToggle = async (id: number, visible: boolean) => {
    await toggleVisible(id, !visible)
    setLista(lista.map(p => p.id === id ? { ...p, visible: !visible } : p))
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input className="inp" style={{ maxWidth: 340 }} placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['Orden', 'Producto', 'Estado', 'Minorista', 'Mayorista', 'Visible', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', textAlign: h === 'Orden' || h === 'Acciones' ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <button onClick={() => mover(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: i === 0 ? 0.3 : 1, fontSize: 14, padding: '2px 4px' }}>▲</button>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)', minWidth: 18, textAlign: 'center' }}>{p.orden}</span>
                      <button onClick={() => mover(i, 1)} disabled={i === filtrados.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: i === filtrados.length - 1 ? 0.3 : 1, fontSize: 14, padding: '2px 4px' }}>▼</button>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: 'var(--text)', maxWidth: 200 }}>
                    {p.nombre}
                    {(p.marcas as { nombre: string } | null)?.nombre && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginTop: 1 }}>{(p.marcas as { nombre: string }).nombre}</div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`badge badge-${p.estado}`}>{ESTADO_LABEL[p.estado]}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700 }}>{fmtUSD(p.precio_usd_minorista)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{fmtUSD(p.precio_usd_mayorista)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => handleToggle(p.id, p.visible)} style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, border: '1px solid', cursor: 'pointer',
                      background: p.visible ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
                      borderColor: p.visible ? 'rgba(34,197,94,0.25)' : 'var(--border)',
                      color: p.visible ? 'var(--green)' : 'var(--text-muted)',
                      fontFamily: 'inherit',
                    }}>
                      {p.visible ? 'Público' : 'Oculto'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <Link href={`/admin/productos/${p.id}`}>
                        <button style={{ background: 'var(--surface-2)', border: '1px solid var(--border-s)', color: 'var(--text)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }} title="Editar">✏️</button>
                      </Link>
                      <button onClick={() => handleEliminar(p.id, p.nombre)} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }} title="Eliminar">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: 13 }}>
              No hay productos{busqueda ? ' con ese nombre' : ' aún'}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
