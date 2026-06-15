import { getMarcas } from '@/lib/supabase/queries'
import EntidadAdmin from '@/components/admin/EntidadAdmin'

export default async function MarcasPage() {
  const marcas = await getMarcas()
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Marcas</h1>
      <EntidadAdmin tipo="marcas" items={marcas} />
    </div>
  )
}
