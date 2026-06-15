import { getProveedores } from '@/lib/supabase/queries'
import EntidadAdmin from '@/components/admin/EntidadAdmin'

export default async function ProveedoresPage() {
  const proveedores = await getProveedores()
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Proveedores</h1>
      <EntidadAdmin tipo="proveedores" items={proveedores} />
    </div>
  )
}
