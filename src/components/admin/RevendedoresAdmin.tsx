'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearRevendedor, toggleRevendedor } from '@/lib/supabase/actions'
import type { Revendedor } from '@/types'

export default function RevendedoresAdmin({ revendedores: inicial }: { revendedores: Revendedor[] }) {
  const router = useRouter()
  const [lista, setLista]     = useState(inicial)
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [nombre, setNombre]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [ok, setOk]           = useState('')

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await crearRevendedor(email.trim(), pass, nombre.trim())
      setOk(`Revendedor "${nombre}" creado exitosamente.`)
      setEmail(''); setPass(''); setNombre('')
      setTimeout(() => setOk(''), 4000)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear revendedor')
    } finally { setLoading(false) }
  }

  const handleToggle = async (id: number, activo: boolean) => {
    await toggleRevendedor(id, !activo)
    setLista(lista.map(r => r.id === id ? { ...r, activo: !activo } : r))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {ok && <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--green)' }}>✓ {ok}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171' }}>✗ {error}</div>}

      {/* Formulario */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Nuevo revendedor</h3>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
          Se crea un usuario en Supabase Auth con acceso a precios mayoristas.
        </p>
        <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label className="form-label">Nombre comercial *</label>
            <input className="inp" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: TechStore Palermo" />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input className="inp" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="revendedor@email.com" />
          </div>
          <div>
            <label className="form-label">Contraseña inicial *</label>
            <input className="inp" type="password" required value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creando...' : 'Crear revendedor'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700 }}>
          Revendedores registrados ({lista.length})
        </div>
        {lista.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No hay revendedores aún.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['Nombre comercial', 'Creado', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{r.nombre_comercial}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-dim)' }}>
                    {new Date(r.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleToggle(r.id, r.activo)} style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                      background: r.activo ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.07)',
                      borderColor: r.activo ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.15)',
                      color: r.activo ? 'var(--green)' : '#f87171',
                    }}>
                      {r.activo ? 'Activo' : 'Inactivo'}
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
