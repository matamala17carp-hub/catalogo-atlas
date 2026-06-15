'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    const role = data.user.user_metadata?.role
    if (role === 'admin') router.push('/admin')
    else router.push('/')
    router.refresh()
  }

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Catálogo <span style={{ color: 'var(--accent)' }}>Atlas</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Acceso para revendedores y administradores</p>
      </div>

      <div className="card">
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Email</label>
            <input className="inp" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          <div>
            <label className="form-label">Contraseña</label>
            <input className="inp" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171' }}>
              {error}
            </div>
          )}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a href="/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}>
            ← Volver al catálogo
          </a>
        </div>
      </div>
    </div>
  )
}
