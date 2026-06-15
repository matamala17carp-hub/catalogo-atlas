'use client'
import { useState } from 'react'
import { actualizarCotizacion, actualizarWhatsapp } from '@/lib/supabase/actions'
import { fmtARS } from '@/utils'
import type { HistorialCotizacion } from '@/types'

interface Props { cotizacion: number; historial: HistorialCotizacion[] }

export default function CotizacionAdmin({ cotizacion, historial }: Props) {
  const [valor, setValor]       = useState(String(cotizacion))
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading]   = useState(false)
  const [ok, setOk]             = useState('')

  const handleCot = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(valor)
    if (isNaN(n) || n <= 0) return
    setLoading(true)
    await actualizarCotizacion(n)
    setOk(`Cotización actualizada a ${fmtARS(n)}`)
    setTimeout(() => setOk(''), 3000)
    setLoading(false)
  }

  const handleWA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!whatsapp.trim()) return
    setLoading(true)
    await actualizarWhatsapp(whatsapp.trim())
    setOk('Número de WhatsApp actualizado')
    setWhatsapp('')
    setTimeout(() => setOk(''), 3000)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {ok && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--green)' }}>
          ✓ {ok}
        </div>
      )}

      {/* Cotización */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Cotización del dólar</h3>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
          Actual: <strong style={{ color: 'var(--text)' }}>1 USD = {fmtARS(cotizacion)}</strong> — Afecta todos los precios del catálogo.
        </p>
        <form onSubmit={handleCot} style={{ display: 'flex', gap: 10 }}>
          <input className="inp" type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} style={{ fontWeight: 700, fontSize: 16, maxWidth: 180 }} />
          <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 14px', fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>ARS / USD</span>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? '...' : 'Actualizar'}</button>
        </form>
      </div>

      {/* WhatsApp */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Número de WhatsApp</h3>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>Con código de país, sin +, sin espacios. Ej: 5491133445566</p>
        <form onSubmit={handleWA} style={{ display: 'flex', gap: 10 }}>
          <input className="inp" type="text" placeholder="5491133445566" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={{ fontFamily: 'monospace' }} />
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? '...' : 'Guardar'}</button>
        </form>
      </div>

      {/* Historial */}
      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Historial de cambios</h3>
        {historial.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Sin cambios registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historial.map(h => (
              <div key={h.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                    {new Date(h.created_at).toLocaleString('es-AR')} · {h.usuario_email}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{fmtARS(h.cotizacion_anterior)}</span>
                    <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>→</span>
                    <strong style={{ color: 'var(--green)' }}>{fmtARS(h.cotizacion_nueva)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
