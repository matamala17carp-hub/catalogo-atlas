import { createClient } from '@/lib/supabase/server'
import { getCotizacion, getWhatsapp, getMarcas, getCategorias, esRevendedorActivo } from '@/lib/supabase/queries'
import CatalogoCliente from '@/components/catalogo/CatalogoCliente'

export const revalidate = 60

export default async function Home() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  const esAdmin = user?.user_metadata?.role === 'admin'
  const esRev   = user && !esAdmin ? await esRevendedorActivo(user.id) : false

  const [cotizacion, whatsapp, marcas, categorias] = await Promise.all([
    getCotizacion(), getWhatsapp(), getMarcas(), getCategorias(),
  ])

  let query = sb.from('productos')
    .select('*, marcas(nombre), categorias(nombre), subcategorias(nombre)')
    .order('orden', { ascending: true })
  if (!esAdmin) query = query.eq('visible', true)

  const { data: productos } = await query

  return (
    <CatalogoCliente
      productos={productos ?? []}
      cotizacion={cotizacion}
      whatsapp={whatsapp}
      marcas={marcas}
      categorias={categorias}
      esRevendedor={esRev || esAdmin}
      esAdmin={esAdmin}
      user={user ? { email: user.email ?? '', id: user.id } : null}
    />
  )
}
