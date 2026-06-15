# Catálogo Atlas

Catálogo profesional de productos con precios USD/ARS y ventas por WhatsApp.

## Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Vercel

---

## PASO 1 — Base de datos en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. En el menú izquierdo: **SQL Editor → New Query**.
3. Pegá todo el contenido de `supabase/migrations/001_initial.sql` y ejecutá.
4. Listo. Las tablas, RLS y datos de prueba quedan creados.

---

## PASO 2 — Crear usuario Admin

1. En Supabase: **Authentication → Users → Invite user** (o Add user).
2. Ingresá tu email y contraseña.
3. En la tabla `auth.users`, buscá tu usuario → editá el campo `raw_user_meta_data` y poné:
   ```json
   { "role": "admin" }
   ```
4. Guardá.

---

## PASO 3 — Variables de entorno

Editá el archivo `.env.local` con tus datos de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

Los valores los encontrás en: **Supabase → Settings → API**.

---

## PASO 4 — Deploy en Vercel

1. Subí esta carpeta a un repositorio de GitHub.
2. Entrá a [vercel.com](https://vercel.com) → **New Project** → importá el repo.
3. En **Environment Variables**, agregá las mismas 3 variables del `.env.local`.
4. Hacé clic en **Deploy**.

Vercel detecta Next.js automáticamente. El deploy tarda ~2 minutos.

---

## PASO 5 — Configuración inicial

Una vez deployado:
1. Entrá a `/login` con tu usuario admin.
2. Andá a **Admin → Cotización** y configurá el número de WhatsApp y la cotización actual.
3. Andá a **Admin → Productos** y cargá tus productos.

---

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| **Público** | Ve catálogo con precios minoristas |
| **Revendedor** | Ve precios mayoristas, mínimos y condiciones |
| **Admin** | Control total del sistema |

Para crear revendedores: **Admin → Revendedores → Nuevo revendedor**.
