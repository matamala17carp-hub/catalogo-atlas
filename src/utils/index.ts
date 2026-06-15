export const fmtUSD = (n: number) =>
  'USD ' + new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(n)

export const fmtARS = (n: number) =>
  '$ ' + new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(Math.round(n))

export const calcARS = (usd: number, cotizacion: number) => usd * cotizacion

export const slugify = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

export const waURL = (numero: string, msg: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`

export const waMsg = (nombre: string, precioUSD: number, precioARS: number, esMayorista: boolean, minimo?: number) => {
  const linea2 = esMayorista
    ? `Precio mayorista: *${fmtUSD(precioUSD)}* (~${fmtARS(precioARS)} ARS) · Mínimo: ${minimo} u.`
    : `Precio: *${fmtUSD(precioUSD)}* (~${fmtARS(precioARS)} ARS)`
  return `Hola, quiero consultar por:\n\n*${nombre}*\n${linea2}\n\n¿Tienen disponibilidad?`
}

export const cn = (...cls: (string | undefined | null | false)[]) => cls.filter(Boolean).join(' ')
