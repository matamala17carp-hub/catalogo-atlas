import { getCategorias } from '@/lib/supabase/queries'
import EntidadAdmin from '@/components/admin/EntidadAdmin'

export default async function CategoriasPage() {
  const categorias = await getCategorias()
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Categorías</h1>
      <EntidadAdmin tipo="categorias" items={categorias} />
    </div>
  )
}
