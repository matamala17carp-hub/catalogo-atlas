-- ============================================================
-- CATÁLOGO ATLAS — Migración inicial completa
-- Ejecutar en: Supabase → SQL Editor (una sola vez)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CONFIGURACIÓN GLOBAL
CREATE TABLE configuracion (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clave      TEXT NOT NULL UNIQUE,
  valor      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- HISTORIAL DE COTIZACIONES
CREATE TABLE historial_cotizaciones (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cotizacion_anterior NUMERIC(12,2) NOT NULL,
  cotizacion_nueva    NUMERIC(12,2) NOT NULL,
  usuario_email       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- MARCAS
CREATE TABLE marcas (
  id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  slug   TEXT NOT NULL UNIQUE,
  activa BOOLEAN DEFAULT TRUE,
  orden  INT DEFAULT 0
);

-- CATEGORÍAS
CREATE TABLE categorias (
  id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  slug   TEXT NOT NULL UNIQUE,
  activa BOOLEAN DEFAULT TRUE,
  orden  INT DEFAULT 0
);

-- SUBCATEGORÍAS
CREATE TABLE subcategorias (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  nombre       TEXT NOT NULL,
  slug         TEXT NOT NULL,
  activa       BOOLEAN DEFAULT TRUE,
  orden        INT DEFAULT 0,
  UNIQUE(categoria_id, slug)
);

-- PROVEEDORES
CREATE TABLE proveedores (
  id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  notas  TEXT
);

-- PRODUCTOS
CREATE TABLE productos (
  id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre                      TEXT NOT NULL,
  slug                        TEXT NOT NULL UNIQUE,
  marca_id                    BIGINT REFERENCES marcas(id),
  categoria_id                BIGINT REFERENCES categorias(id),
  subcategoria_id             BIGINT REFERENCES subcategorias(id),
  proveedor_id                BIGINT REFERENCES proveedores(id),
  descripcion_corta           TEXT,
  descripcion_larga           TEXT,
  estado                      TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (estado IN ('nuevo', 'reacondicionado', 'usado')),
  precio_usd_minorista        NUMERIC(12,2) NOT NULL CHECK (precio_usd_minorista >= 0),
  precio_usd_mayorista        NUMERIC(12,2) NOT NULL CHECK (precio_usd_mayorista >= 0),
  cantidad_minima_mayorista   INT DEFAULT 1,
  permite_mezcla              BOOLEAN DEFAULT FALSE,
  destacado                   BOOLEAN DEFAULT FALSE,
  visible                     BOOLEAN DEFAULT TRUE,
  orden                       INT DEFAULT 0,
  imagen_url                  TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_by                  UUID REFERENCES auth.users(id),
  CONSTRAINT precio_mayorista_lte_minorista
    CHECK (precio_usd_mayorista <= precio_usd_minorista)
);

CREATE INDEX idx_productos_visible   ON productos(visible);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_marca     ON productos(marca_id);
CREATE INDEX idx_productos_orden     ON productos(orden);

-- HISTORIAL DE PRODUCTOS
CREATE TABLE historial_productos (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_id      BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  producto_nombre  TEXT NOT NULL,
  campo_modificado TEXT NOT NULL,
  valor_anterior   TEXT,
  valor_nuevo      TEXT,
  usuario_email    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hist_prod ON historial_productos(producto_id, created_at DESC);

-- REVENDEDORES
CREATE TABLE revendedores (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_comercial TEXT NOT NULL,
  activo           BOOLEAN DEFAULT TRUE,
  notas            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRIGGER: updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_config_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE configuracion        ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias        ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_productos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE revendedores         ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION es_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((auth.jwt()->'user_metadata'->>'role') = 'admin', FALSE);
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION es_revendedor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM revendedores WHERE user_id = auth.uid() AND activo = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Configuracion
CREATE POLICY "config_lectura_publica" ON configuracion FOR SELECT USING (TRUE);
CREATE POLICY "config_admin_escribe"   ON configuracion FOR ALL  USING (es_admin());

-- Historial cotizaciones
CREATE POLICY "histcot_admin" ON historial_cotizaciones FOR ALL USING (es_admin());

-- Marcas
CREATE POLICY "marcas_lectura"   ON marcas FOR SELECT USING (activa = TRUE OR es_admin());
CREATE POLICY "marcas_admin"     ON marcas FOR ALL    USING (es_admin());

-- Categorías
CREATE POLICY "cats_lectura"  ON categorias FOR SELECT USING (activa = TRUE OR es_admin());
CREATE POLICY "cats_admin"    ON categorias FOR ALL   USING (es_admin());

-- Subcategorías
CREATE POLICY "subcats_lectura" ON subcategorias FOR SELECT USING (activa = TRUE OR es_admin());
CREATE POLICY "subcats_admin"   ON subcategorias FOR ALL   USING (es_admin());

-- Proveedores
CREATE POLICY "prov_admin" ON proveedores FOR ALL USING (es_admin());

-- Productos
CREATE POLICY "productos_lectura_publica" ON productos FOR SELECT
  USING (visible = TRUE OR es_admin());
CREATE POLICY "productos_admin" ON productos FOR ALL USING (es_admin());

-- Historial productos
CREATE POLICY "histprod_admin" ON historial_productos FOR ALL USING (es_admin());

-- Revendedores
CREATE POLICY "rev_admin"     ON revendedores FOR ALL    USING (es_admin());
CREATE POLICY "rev_self_read" ON revendedores FOR SELECT USING (user_id = auth.uid());

-- ── DATOS INICIALES ──────────────────────────────────────────
INSERT INTO configuracion (clave, valor) VALUES
  ('cotizacion_dolar', '1200'),
  ('whatsapp_numero',  '5491100000000');

INSERT INTO marcas (nombre, slug, activa, orden) VALUES
  ('Samsung',  'samsung',  TRUE, 1),
  ('Apple',    'apple',    TRUE, 2),
  ('Motorola', 'motorola', TRUE, 3),
  ('Xiaomi',   'xiaomi',   TRUE, 4);

INSERT INTO categorias (nombre, slug, activa, orden) VALUES
  ('Celulares',  'celulares',  TRUE, 1),
  ('Accesorios', 'accesorios', TRUE, 2),
  ('Tablets',    'tablets',    TRUE, 3);

INSERT INTO proveedores (nombre, activo) VALUES ('Proveedor Principal', TRUE);
