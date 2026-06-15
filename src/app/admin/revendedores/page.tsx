import { getRevendedores } from '@/lib/supabase/queries'
import RevendedoresAdmin from '@/components/admin/RevendedoresAdmin'

export default async function RevendedoresPage() {
  const revendedores = await getRevendedores()
  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Revendedores</h1>
      <RevendedoresAdmin revendedores={revendedores} />
    </div>
  )
}
