'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearProducto, actualizarProducto } from '@/lib/supabase/actions'
import type { Producto, Marca, Categoria, Subcategoria, Proveedor } from '@/types'

interface Props {
  producto?: Producto
  marcas: Marca[]
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  proveedores: Proveedor[]
}

export default function ProductoForm({
  producto,
  marcas,
  categorias,
  subcategorias,
  proveedores,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [catSel, setCatSel] = useState(
    producto?.categoria_id ? String(producto.categoria_id) : ''
  )

  const subsFiltradas = subcategorias.filter(
    (s) => String(s.categoria_id) === catSel
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)

    try {
      if (producto) await actualizarProducto(producto.id, fd)
      else await crearProducto(fd)

      router.push('/admin/productos')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // ✔️ FIX REAL: tipado seguro sin string libre
  const getValue = <K extends keyof Producto>(key: K) => {
    const value = producto?.[key]
    return value === null || value === undefined ? '' : String(value)
  }

  const f = (
    label: string,
    name: keyof Producto,
    type = 'text',
    opts?: {
      placeholder?: string
      required?: boolean
      step?: string
      style?: React.CSSProperties
    }
  ) => (
    <div>
      <label className="form-label">
        {label}
        {opts?.required && ' *'}
      </label>

      <input
        className="inp"
        type={type}
        name={String(name)}
        defaultValue={getValue(name)}
        {...opts}
      />
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Información básica */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          Información básica
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nombre *</label>
            <input
              className="inp"
              name="nombre"
              required
              defaultValue={producto?.nombre ?? ''}
            />
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
            <select
              className="inp"
              name="visible"
              defaultValue={producto ? String(producto.visible) : 'true'}
            >
              <option value="true">Visible</option>
              <option value="false">Oculto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          Precios
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          <input
            className="inp"
            name="precio_usd_minorista"
            type="number"
            step="0.01"
            defaultValue={producto?.precio_usd_minorista ?? ''}
          />

          <input
            className="inp"
            name="precio_usd_mayorista"
            type="number"
            step="0.01"
            defaultValue={producto?.precio_usd_mayorista ?? ''}
          />

          <input
            className="inp"
            name="cantidad_minima_mayorista"
            type="number"
            defaultValue={producto?.cantidad_minima_mayorista ?? 1}
          />

          <select
            className="inp"
            name="permite_mezcla"
            defaultValue={producto ? String(producto.permite_mezcla) : 'false'}
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>

      {/* Clasificación */}
      <div className="card">
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          Clasificación
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <select
            className="inp"
            name="categoria_id"
            value={catSel}
            onChange={(e) => setCatSel(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            className="inp"
            name="subcategoria_id"
            defaultValue={producto?.subcategoria_id ? String(producto.subcategoria_id) : ''}
          >
            <option value="">Sin subcategoría</option>
            {subsFiltradas.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.nombre}
              </option>
            ))}
          </select>

          <select
            className="inp"
            name="marca_id"
            defaultValue={producto?.marca_id ? String(producto.marca_id) : ''}
          >
            <option value="">Sin marca</option>
            {marcas.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.nombre}
              </option>
            ))}
          </select>

          <select
            className="inp"
            name="proveedor_id"
            defaultValue={producto?.proveedor_id ? String(producto.proveedor_id) : ''}
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: '#f87171', fontSize: 13 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={() => router.back()}>
          Cancelar
        </button>

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : producto ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}