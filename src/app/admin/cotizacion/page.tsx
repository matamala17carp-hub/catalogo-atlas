import { getCotizacion, getHistorialCotizaciones } from '@/lib/supabase/queries'
import CotizacionAdmin from '@/components/admin/CotizacionAdmin'

export default async function CotizacionPage() {
  const [cotizacion, historial] = await Promise.all([getCotizacion(), getHistorialCotizaciones()])
  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28 }}>Cotización del dólar</h1>
      <CotizacionAdmin cotizacion={cotizacion} historial={historial} />
    </div>
  )
}
