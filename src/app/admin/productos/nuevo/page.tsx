import { getMarcas, getCategorias, getSubcategorias, getProveedores } from '@/lib/supabase/queries'
import ProductoForm from '@/components/admin/ProductoForm'

export default async function NuevoProductoPage() {
  const [marcas, categorias, subcategorias, proveedores] = await Promise.all([
    getMarcas(), getCategorias(), getSubcategorias(), getProveedores(),
  ])
  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Nuevo producto</h1>
      <ProductoForm marcas={marcas} categorias={categorias} subcategorias={subcategorias} proveedores={proveedores} />
    </div>
  )
}
