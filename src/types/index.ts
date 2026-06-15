export type Rol = 'publico' | 'revendedor' | 'admin'

export interface Configuracion {
  id: number; clave: string; valor: string; updated_at: string
}
export interface HistorialCotizacion {
  id: number; cotizacion_anterior: number; cotizacion_nueva: number
  usuario_email: string | null; created_at: string
}
export interface Marca {
  id: number; nombre: string; slug: string; activa: boolean; orden: number
}
export interface Categoria {
  id: number; nombre: string; slug: string; activa: boolean; orden: number
}
export interface Subcategoria {
  id: number; categoria_id: number; nombre: string; slug: string; activa: boolean; orden: number
}
export interface Proveedor {
  id: number; nombre: string; activo: boolean; notas: string | null
}
export interface Producto {
  id: number; nombre: string; slug: string
  marca_id: number | null; categoria_id: number | null
  subcategoria_id: number | null; proveedor_id: number | null
  descripcion_corta: string | null; descripcion_larga: string | null
  estado: 'nuevo' | 'reacondicionado' | 'usado'
  precio_usd_minorista: number; precio_usd_mayorista: number
  cantidad_minima_mayorista: number; permite_mezcla: boolean
  destacado: boolean; visible: boolean; orden: number
  imagen_url: string | null; created_at: string; updated_at: string
  marcas?: { nombre: string } | null
  categorias?: { nombre: string } | null
  subcategorias?: { nombre: string } | null
}
export interface HistorialProducto {
  id: number; producto_id: number; producto_nombre: string
  campo_modificado: string; valor_anterior: string | null
  valor_nuevo: string | null; usuario_email: string | null; created_at: string
}
export interface Revendedor {
  id: number; user_id: string; nombre_comercial: string
  activo: boolean; notas: string | null; created_at: string
}
