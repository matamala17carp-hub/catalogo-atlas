import { notFound } from 'next/navigation'
import { getProductoById, getMarcas, getCategorias, getSubcategorias, getProveedores, getHistorialProducto } from '@/lib/supabase/queries'
import ProductoForm from '@/components/admin/ProductoForm'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pid = parseInt(id)
  if (isNaN(pid)) notFound()

  const [producto, marcas, categorias, subcategorias, proveedores, historial] = await Promise.all([
    getProductoById(pid).catch(() => null),
    getMarcas(), getCategorias(), getSubcategorias(), getProveedores(),
    getHistorialProducto(pid),
  ])
  if (!producto) notFound()

  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Editar producto</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 28 }}>{producto.nombre}</p>
      <ProductoForm producto={producto} marcas={marcas} categorias={categorias} subcategorias={subcategorias} proveedores={proveedores} />

      {historial.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text-dim)' }}>Historial de cambios</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historial.map(h => (
              <div key={h.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {new Date(h.created_at).toLocaleString('es-AR')} · {h.usuario_email}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  <strong style={{ color: 'var(--text)' }}>{h.campo_modificado}</strong>:{' '}
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{h.valor_anterior}</span>
                  {' → '}
                  <span style={{ color: 'var(--text)' }}>{h.valor_nuevo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
