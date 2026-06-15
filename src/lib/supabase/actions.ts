'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from './server'
import { slugify } from '@/utils'

async function getAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') throw new Error('Sin permisos')
  return { sb, user }
}

// ── Cotización ────────────────────────────────────────────────
export async function actualizarCotizacion(nueva: number) {
  const { sb, user } = await getAdmin()
  const { data: actual } = await sb.from('configuracion').select('valor').eq('clave', 'cotizacion_dolar').single()
  await sb.from('configuracion').update({ valor: String(nueva), updated_by: user.id }).eq('clave', 'cotizacion_dolar')
  await sb.from('historial_cotizaciones').insert({
    cotizacion_anterior: parseFloat(actual?.valor ?? '0'),
    cotizacion_nueva: nueva, usuario_email: user.email,
  })
  revalidatePath('/'); revalidatePath('/admin/cotizacion')
}

export async function actualizarWhatsapp(numero: string) {
  const { sb, user } = await getAdmin()
  await sb.from('configuracion').update({ valor: numero, updated_by: user.id }).eq('clave', 'whatsapp_numero')
  revalidatePath('/')
}

// ── Productos ─────────────────────────────────────────────────
export async function crearProducto(formData: FormData) {
  const { sb, user } = await getAdmin()
  const nombre = formData.get('nombre') as string
  let slug = slugify(nombre); let counter = 1
  while ((await sb.from('productos').select('id').eq('slug', slug).single()).data) {
    slug = `${slugify(nombre)}-${counter++}`
  }
  const datos = {
    nombre, slug,
    marca_id:                  formData.get('marca_id') ? Number(formData.get('marca_id')) : null,
    categoria_id:              formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null,
    subcategoria_id:           formData.get('subcategoria_id') ? Number(formData.get('subcategoria_id')) : null,
    proveedor_id:              formData.get('proveedor_id') ? Number(formData.get('proveedor_id')) : null,
    descripcion_corta:         formData.get('descripcion_corta') as string || null,
    estado:                    formData.get('estado') as string || 'nuevo',
    precio_usd_minorista:      parseFloat(formData.get('precio_usd_minorista') as string),
    precio_usd_mayorista:      parseFloat(formData.get('precio_usd_mayorista') as string),
    cantidad_minima_mayorista: parseInt(formData.get('cantidad_minima_mayorista') as string) || 1,
    permite_mezcla:            formData.get('permite_mezcla') === 'true',
    visible:                   formData.get('visible') === 'true',
    destacado:                 formData.get('destacado') === 'true',
    updated_by:                user.id,
  }
  const { error } = await sb.from('productos').insert(datos)
  if (error) throw error
  revalidatePath('/'); revalidatePath('/admin/productos')
}

export async function actualizarProducto(id: number, formData: FormData) {
  const { sb, user } = await getAdmin()
  const actual = await sb.from('productos').select('*').eq('id', id).single()
  const datos: Record<string, unknown> = {
    nombre:                    formData.get('nombre'),
    marca_id:                  formData.get('marca_id') ? Number(formData.get('marca_id')) : null,
    categoria_id:              formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null,
    subcategoria_id:           formData.get('subcategoria_id') ? Number(formData.get('subcategoria_id')) : null,
    proveedor_id:              formData.get('proveedor_id') ? Number(formData.get('proveedor_id')) : null,
    descripcion_corta:         formData.get('descripcion_corta') || null,
    estado:                    formData.get('estado'),
    precio_usd_minorista:      parseFloat(formData.get('precio_usd_minorista') as string),
    precio_usd_mayorista:      parseFloat(formData.get('precio_usd_mayorista') as string),
    cantidad_minima_mayorista: parseInt(formData.get('cantidad_minima_mayorista') as string) || 1,
    permite_mezcla:            formData.get('permite_mezcla') === 'true',
    visible:                   formData.get('visible') === 'true',
    destacado:                 formData.get('destacado') === 'true',
    updated_by:                user.id,
  }
  await sb.from('productos').update(datos).eq('id', id)
  // historial
  const campos = Object.keys(datos).filter(k => k !== 'updated_by')
  const historial = campos
    .filter(k => String((actual.data as Record<string,unknown>)?.[k] ?? '') !== String(datos[k]))
    .map(k => ({
      producto_id: id, producto_nombre: actual.data?.nombre ?? '',
      campo_modificado: k,
      valor_anterior: String((actual.data as Record<string,unknown>)?.[k] ?? ''),
      valor_nuevo: String(datos[k]),
      usuario_email: user.email,
    }))
  if (historial.length > 0) await sb.from('historial_productos').insert(historial)
  revalidatePath('/'); revalidatePath('/admin/productos')
}

export async function eliminarProducto(id: number) {
  const { sb } = await getAdmin()
  await sb.from('productos').delete().eq('id', id)
  revalidatePath('/'); revalidatePath('/admin/productos')
}

export async function actualizarOrden(ids: number[]) {
  const { sb } = await getAdmin()
  await Promise.all(ids.map((id, i) => sb.from('productos').update({ orden: i }).eq('id', id)))
  revalidatePath('/'); revalidatePath('/admin/productos')
}

export async function toggleVisible(id: number, visible: boolean) {
  const { sb } = await getAdmin()
  await sb.from('productos').update({ visible }).eq('id', id)
  revalidatePath('/'); revalidatePath('/admin/productos')
}

// ── Marcas ────────────────────────────────────────────────────
export async function crearMarca(nombre: string) {
  const { sb } = await getAdmin()
  await sb.from('marcas').insert({ nombre, slug: slugify(nombre) })
  revalidatePath('/admin/marcas')
}
export async function toggleMarca(id: number, activa: boolean) {
  const { sb } = await getAdmin()
  await sb.from('marcas').update({ activa }).eq('id', id)
  revalidatePath('/admin/marcas')
}
export async function eliminarMarca(id: number) {
  const { sb } = await getAdmin()
  await sb.from('marcas').delete().eq('id', id)
  revalidatePath('/admin/marcas')
}

// ── Categorías ────────────────────────────────────────────────
export async function crearCategoria(nombre: string) {
  const { sb } = await getAdmin()
  await sb.from('categorias').insert({ nombre, slug: slugify(nombre) })
  revalidatePath('/admin/categorias')
}
export async function toggleCategoria(id: number, activa: boolean) {
  const { sb } = await getAdmin()
  await sb.from('categorias').update({ activa }).eq('id', id)
  revalidatePath('/admin/categorias')
}
export async function eliminarCategoria(id: number) {
  const { sb } = await getAdmin()
  await sb.from('categorias').delete().eq('id', id)
  revalidatePath('/admin/categorias')
}

// ── Proveedores ───────────────────────────────────────────────
export async function crearProveedor(nombre: string, notas?: string) {
  const { sb } = await getAdmin()
  await sb.from('proveedores').insert({ nombre, notas: notas || null })
  revalidatePath('/admin/proveedores')
}
export async function eliminarProveedor(id: number) {
  const { sb } = await getAdmin()
  await sb.from('proveedores').delete().eq('id', id)
  revalidatePath('/admin/proveedores')
}

// ── Revendedores ──────────────────────────────────────────────
export async function crearRevendedor(email: string, password: string, nombre_comercial: string) {
  const { sb } = await getAdmin()
  const sbAdmin = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await sbAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { role: 'revendedor' },
  })
  if (error) throw error
  await sb.from('revendedores').insert({ user_id: data.user.id, nombre_comercial })
  revalidatePath('/admin/revendedores')
}
export async function toggleRevendedor(id: number, activo: boolean) {
  const { sb } = await getAdmin()
  await sb.from('revendedores').update({ activo }).eq('id', id)
  revalidatePath('/admin/revendedores')
}
