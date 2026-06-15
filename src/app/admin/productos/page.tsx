import { getProductosAdmin, getMarcas, getCategorias } from '@/lib/supabase/queries'
import ProductosAdmin from '@/components/admin/ProductosAdmin'
import Link from 'next/link'

export default async function ProductosPage() {
  const [productos, marcas, categorias] = await Promise.all([
    getProductosAdmin(), getMarcas(), getCategorias(),
  ])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Productos</h1>
        <Link href="/admin/productos/nuevo">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>＋</span> Nuevo producto
          </button>
        </Link>
      </div>
      <ProductosAdmin productos={productos} marcas={marcas} categorias={categorias} />
    </div>
  )
}
