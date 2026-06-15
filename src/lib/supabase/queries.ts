import { createClient } from './server'

export async function getCotizacion() {
  const sb = await createClient()
  const { data } = await sb.from('configuracion').select('valor').eq('clave', 'cotizacion_dolar').single()
  return data ? parseFloat(data.valor) : 1200
}
export async function getWhatsapp() {
  const sb = await createClient()
  const { data } = await sb.from('configuracion').select('valor').eq('clave', 'whatsapp_numero').single()
  return data?.valor ?? '5491100000000'
}
export async function getMarcas() {
  const sb = await createClient()
  const { data } = await sb.from('marcas').select('*').eq('activa', true).order('orden')
  return data ?? []
}
export async function getCategorias() {
  const sb = await createClient()
  const { data } = await sb.from('categorias').select('*').eq('activa', true).order('orden')
  return data ?? []
}
export async function getSubcategorias(catId?: number) {
  const sb = await createClient()
  let q = sb.from('subcategorias').select('*').eq('activa', true).order('orden')
  if (catId) q = q.eq('categoria_id', catId)
  const { data } = await q
  return data ?? []
}
export async function getProveedores() {
  const sb = await createClient()
  const { data } = await sb.from('proveedores').select('*').eq('activo', true).order('nombre')
  return data ?? []
}
export async function getProductosPublicos() {
  const sb = await createClient()
  const { data } = await sb.from('productos')
    .select('*, marcas(nombre), categorias(nombre), subcategorias(nombre)')
    .eq('visible', true).order('orden')
  return data ?? []
}
export async function getProductosAdmin() {
  const sb = await createClient()
  const { data } = await sb.from('productos')
    .select('*, marcas(nombre), categorias(nombre), subcategorias(nombre), proveedores(nombre)')
    .order('orden')
  return data ?? []
}
export async function getProductoById(id: number) {
  const sb = await createClient()
  const { data } = await sb.from('productos')
    .select('*, marcas(nombre), categorias(nombre), subcategorias(nombre)')
    .eq('id', id).single()
  return data
}
export async function getHistorialCotizaciones() {
  const sb = await createClient()
  const { data } = await sb.from('historial_cotizaciones').select('*').order('created_at', { ascending: false }).limit(50)
  return data ?? []
}
export async function getHistorialProducto(id: number) {
  const sb = await createClient()
  const { data } = await sb.from('historial_productos').select('*').eq('producto_id', id).order('created_at', { ascending: false }).limit(100)
  return data ?? []
}
export async function getRevendedores() {
  const sb = await createClient()
  const { data } = await sb.from('revendedores').select('*').order('created_at', { ascending: false })
  return data ?? []
}
export async function esRevendedorActivo(userId: string) {
  const sb = await createClient()
  const { data } = await sb.from('revendedores').select('id').eq('user_id', userId).eq('activo', true).single()
  return !!data
}
