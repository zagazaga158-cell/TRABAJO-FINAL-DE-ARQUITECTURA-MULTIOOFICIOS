-- ==============================================================================
-- TrabajaYa Perú (conectaoficios) — Esquema Relacional PostgreSQL 16 (3FN + ACID)
-- Alineado al 100% con docs/sdd/02-MODELO-DE-DATOS-Y-DOMINIO.md
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Tipos ENUM del dominio
DO $$ BEGIN
  CREATE TYPE permiso_rol_enum AS ENUM ('USUARIO', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_usuario_enum AS ENUM ('CLIENTE_HOGAR', 'OFERTANTE_OFICIO', 'AMBOS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_cuenta_enum AS ENUM ('PENDIENTE', 'ACTIVO', 'SUSPENDIDO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_verificacion_enum AS ENUM ('SIN_ADJUNTOS', 'PENDIENTE_REVISION', 'VERIFICADO', 'OBSERVADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_documento_enum AS ENUM ('DNI', 'CE', 'PASAPORTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE oficio_enum AS ENUM (
    'GASFITERIA', 'ELECTRICIDAD', 'CERRAJERIA', 'PINTURA', 'ALBANILERIA',
    'DRYWALL', 'CARPINTERIA', 'SOLDADURA', 'ELECTRODOMESTICOS', 'CLIMATIZACION',
    'VIDRIERIA', 'LIMPIEZA', 'JARDINERIA', 'SOPORTE_TI'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_publicacion_enum AS ENUM ('PENDIENTE_APROBACION', 'APROBADO', 'RECHAZADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE plan_publicacion_enum AS ENUM ('PRUEBA_7', 'BASICO', 'DESTACADO', 'PRO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE urgencia_imprevisto_enum AS ENUM ('NORMAL', 'URGENTE', 'EMERGENCIA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_imprevisto_enum AS ENUM ('ABIERTO', 'ADJUDICADO', 'CERRADO', 'RETIRADO_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_oferta_enum AS ENUM ('ENVIADA', 'ACEPTADA', 'DESCARTADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_orden_enum AS ENUM (
    'EN_CUSTODIA', 'EN_CAMINO', 'EN_EJECUCION',
    'COMPLETADO_PENDIENTE_CONFORMIDAD', 'CONFORMIDAD_Y_LIBERADO', 'OBSERVADO_GARANTIA'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE metodo_pago_enum AS ENUM ('SIN_COBRO_SOLICITUD', 'TARJETA', 'YAPE_PLIN', 'PAGO_EFECTIVO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE aceptacion_trabajador_enum AS ENUM ('PENDIENTE', 'ACEPTADA', 'NO_DISPONIBLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Política de Correos Permitidos
CREATE TABLE IF NOT EXISTS allowed_emails (
  regla VARCHAR(160) PRIMARY KEY,
  protected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Usuarios y RBAC Estricto (2 Roles + Garantía de Administrador Único en BD)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(40) PRIMARY KEY,
  permiso permiso_rol_enum NOT NULL DEFAULT 'USUARIO',
  tipo_usuario tipo_usuario_enum NOT NULL DEFAULT 'AMBOS',
  estado_cuenta estado_cuenta_enum NOT NULL DEFAULT 'PENDIENTE',
  tipo_documento tipo_documento_enum NOT NULL DEFAULT 'DNI',
  dni VARCHAR(20) NOT NULL UNIQUE,
  nombre_completo VARCHAR(180) NOT NULL,
  telefono_whatsapp VARCHAR(25) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  region VARCHAR(80) NOT NULL DEFAULT 'Lima',
  provincia VARCHAR(80) NOT NULL DEFAULT 'Lima',
  distrito VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  especialidad_principal VARCHAR(160),
  estado_verificacion_media estado_verificacion_enum NOT NULL DEFAULT 'SIN_ADJUNTOS',
  observacion_verificacion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_admin_always_active CHECK (permiso <> 'ADMIN' OR estado_cuenta = 'ACTIVO')
);

-- INVARIANTE I1 A NIVEL DE MOTOR SQL: Estrictamente un único ADMIN en toda la tabla
CREATE UNIQUE INDEX IF NOT EXISTS uq_single_admin_only
  ON users (permiso)
  WHERE permiso = 'ADMIN';

-- 4. Expediente de Cumplimiento Legal (5 Bloques — Privado Ley N.º 29733)
CREATE TABLE IF NOT EXISTS compliance_dossiers (
  user_id VARCHAR(40) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Bloque 1: Identidad, Domicilio y Emergencias
  dni_foto_key TEXT,
  foto_persona_key TEXT,
  video_persona_key TEXT,
  comprobante_domicilio_tipo VARCHAR(20) CHECK (comprobante_domicilio_tipo IN ('AGUA', 'LUZ', 'TELEFONO')),
  comprobante_domicilio_key TEXT,
  emergencia_familiar_nombre VARCHAR(160),
  emergencia_familiar_parentesco VARCHAR(80),
  emergencia_familiar_telefono VARCHAR(25),
  -- Bloque 2: Legal y Tributario (SUNAT)
  ruc_numero VARCHAR(11) CHECK (ruc_numero IS NULL OR ruc_numero ~ '^[0-9]{11}$'),
  ruc_activo BOOLEAN DEFAULT FALSE,
  tipo_comprobante_tributario VARCHAR(30) CHECK (tipo_comprobante_tributario IN ('RECIBO_HONORARIOS', 'FACTURA')),
  ficha_ruc_key TEXT,
  -- Bloque 3: Seguridad y Antecedentes (3/3)
  antecedentes_policiales_key TEXT,
  antecedentes_penales_key TEXT,
  antecedentes_judiciales_key TEXT,
  -- Bloque 4: Validaciones Técnicas y Licencia MTC
  certificacion_tecnica_detalle TEXT,
  certificado_opcional_key TEXT,
  licencia_conducir_numero VARCHAR(30),
  licencia_conducir_categoria VARCHAR(15),
  licencia_conducir_key TEXT,
  -- Bloque 5: Acuerdos y Firmas Digitales
  contrato_tipo VARCHAR(30) CHECK (contrato_tipo IN ('LOCACION_SERVICIOS', 'CONTRATO_TRABAJO')),
  contrato_firmado BOOLEAN NOT NULL DEFAULT FALSE,
  contrato_firma_nombre VARCHAR(180),
  contrato_fecha_firma TIMESTAMPTZ,
  normas_conducta_firmadas BOOLEAN NOT NULL DEFAULT FALSE,
  normas_conducta_fecha TIMESTAMPTZ,
  inventario_firmado BOOLEAN NOT NULL DEFAULT FALSE,
  inventario_fecha_firma TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Inventario de Herramientas / EPP (Bloque 5)
CREATE TABLE IF NOT EXISTS tool_inventories (
  id VARCHAR(40) PRIMARY KEY,
  user_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipo VARCHAR(160) NOT NULL,
  codigo_serie VARCHAR(80) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('OPERATIVO', 'NUEVO', 'DEVUELTO')),
  origen VARCHAR(20) NOT NULL CHECK (origen IN ('EMPRESA', 'PROPIA'))
);

-- 6. Galería Pública de Fotos de Trabajos Realizados
CREATE TABLE IF NOT EXISTS work_photos (
  id VARCHAR(40) PRIMARY KEY,
  user_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  imagen_url TEXT NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT,
  oficio oficio_enum,
  ubicacion VARCHAR(140),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Planes Comerciales de Publicación (Editables por ADMIN)
CREATE TABLE IF NOT EXISTS publication_plans (
  id plan_publicacion_enum PRIMARY KEY,
  categoria_etiqueta VARCHAR(80) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  subtitulo_tag VARCHAR(120) NOT NULL,
  duracion_dias INTEGER NOT NULL CHECK (duracion_dias BETWEEN 1 AND 3650),
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  precio_regular NUMERIC(10,2),
  beneficios JSONB NOT NULL DEFAULT '[]'::jsonb,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  nivel_prioridad SMALLINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Servicios / Anuncios del Catálogo Nacional
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(40) PRIMARY KEY,
  autor_usuario_id VARCHAR(40) REFERENCES users(id) ON DELETE SET NULL,
  oficio oficio_enum NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  tecnico_nombre VARCHAR(180) NOT NULL,
  tecnico_dni VARCHAR(20) NOT NULL,
  tecnico_telefono VARCHAR(25) NOT NULL,
  tecnico_email VARCHAR(160),
  institucion_certificadora VARCHAR(60) NOT NULL,
  codigo_certificado VARCHAR(80) NOT NULL,
  precio_base NUMERIC(10,2) NOT NULL CHECK (precio_base >= 20),
  garantia_monto NUMERIC(10,2) GENERATED ALWAYS AS (ROUND(precio_base * 0.10, 2)) STORED,
  tarifa_cliente NUMERIC(10,2) GENERATED ALWAYS AS (ROUND(precio_base * 1.10, 2)) STORED,
  turnos_libres INTEGER NOT NULL DEFAULT 1 CHECK (turnos_libres >= 0),
  calificacion NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (calificacion BETWEEN 1.00 AND 5.00),
  num_resenas INTEGER NOT NULL DEFAULT 0 CHECK (num_resenas >= 0),
  experiencia_anos SMALLINT NOT NULL DEFAULT 1 CHECK (experiencia_anos >= 0),
  region VARCHAR(80) NOT NULL,
  provincia VARCHAR(80) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  imagen_url TEXT,
  habilidades JSONB NOT NULL DEFAULT '[]'::jsonb,
  estado_publicacion estado_publicacion_enum NOT NULL DEFAULT 'PENDIENTE_APROBACION',
  motivo_rechazo TEXT,
  plan_id plan_publicacion_enum REFERENCES publication_plans(id),
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  sello_verificado_pro BOOLEAN NOT NULL DEFAULT FALSE,
  culqi_charge_id VARCHAR(80),
  monto_pagado_plan NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Tablero de Imprevistos del Hogar (S/ 5.00) y Ofertas
CREATE TABLE IF NOT EXISTS imprevistos (
  id VARCHAR(40) PRIMARY KEY,
  autor_usuario_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  oficio oficio_enum NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  urgencia urgencia_imprevisto_enum NOT NULL DEFAULT 'NORMAL',
  presupuesto_referencial NUMERIC(10,2),
  region VARCHAR(80) NOT NULL,
  provincia VARCHAR(80) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  imagenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  estado estado_imprevisto_enum NOT NULL DEFAULT 'ABIERTO',
  monto_pagado NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  culqi_charge_id VARCHAR(80),
  oferta_aceptada_id VARCHAR(40),
  orden_generada_id VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imprevisto_offers (
  id VARCHAR(40) PRIMARY KEY,
  imprevisto_id VARCHAR(40) NOT NULL REFERENCES imprevistos(id) ON DELETE CASCADE,
  ofertante_usuario_id VARCHAR(40) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monto_oferta NUMERIC(10,2) NOT NULL CHECK (monto_oferta >= 10),
  tiempo_estimado VARCHAR(80) NOT NULL,
  garantia_dias SMALLINT NOT NULL DEFAULT 7 CHECK (garantia_dias >= 0),
  mensaje_propuesta TEXT NOT NULL,
  estado estado_oferta_enum NOT NULL DEFAULT 'ENVIADA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_one_active_offer_per_user UNIQUE (imprevisto_id, ofertante_usuario_id)
);

-- 10. Órdenes, Ítems, Historial Escrow y Reseñas
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(40) PRIMARY KEY,
  codigo_autorizacion VARCHAR(40) NOT NULL,
  cliente_usuario_id VARCHAR(40) REFERENCES users(id) ON DELETE SET NULL,
  cliente_nombre VARCHAR(180) NOT NULL,
  cliente_dni VARCHAR(20),
  cliente_telefono VARCHAR(25) NOT NULL,
  cliente_email VARCHAR(160),
  region VARCHAR(80) NOT NULL,
  provincia VARCHAR(80) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  referencia VARCHAR(255),
  fecha_visita DATE,
  hora_visita VARCHAR(10),
  turno VARCHAR(60) NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  enlace_mapa TEXT,
  subtotal_tecnico NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal_tecnico >= 0),
  garantia_total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (garantia_total >= 0),
  igv NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (igv >= 0),
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  monto_referencial NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  sin_cobro_solicitud BOOLEAN NOT NULL DEFAULT TRUE,
  aceptacion_trabajador aceptacion_trabajador_enum NOT NULL DEFAULT 'PENDIENTE',
  fecha_respuesta_trabajador TIMESTAMPTZ,
  nota_disponibilidad_trabajador TEXT,
  estado estado_orden_enum NOT NULL DEFAULT 'EN_CUSTODIA',
  metodo_pago metodo_pago_enum NOT NULL DEFAULT 'SIN_COBRO_SOLICITUD',
  fondos_liberados BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_liberacion TIMESTAMPTZ,
  calificacion_estrellas SMALLINT CHECK (calificacion_estrellas BETWEEN 1 AND 5),
  calificacion_puntualidad SMALLINT CHECK (calificacion_puntualidad BETWEEN 1 AND 5),
  calificacion_calidad SMALLINT CHECK (calificacion_calidad BETWEEN 1 AND 5),
  calificacion_limpieza SMALLINT CHECK (calificacion_limpieza BETWEEN 1 AND 5),
  calificacion_comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  orden_id VARCHAR(40) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  servicio_id VARCHAR(40) REFERENCES services(id) ON DELETE SET NULL,
  servicio_titulo VARCHAR(200) NOT NULL,
  tecnico_usuario_id VARCHAR(40) REFERENCES users(id) ON DELETE SET NULL,
  cantidad_turnos INTEGER NOT NULL CHECK (cantidad_turnos > 0),
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGSERIAL PRIMARY KEY,
  orden_id VARCHAR(40) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  estado estado_orden_enum NOT NULL,
  descripcion TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Certificados SENATI / SENCICO / CAPECO
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(40) PRIMARY KEY,
  user_id VARCHAR(40) REFERENCES users(id) ON DELETE SET NULL,
  tecnico_nombre VARCHAR(180) NOT NULL,
  institucion VARCHAR(40) NOT NULL,
  especialidad VARCHAR(140) NOT NULL,
  codigo_registro VARCHAR(80) NOT NULL UNIQUE,
  fecha_emision VARCHAR(30) NOT NULL,
  vigencia VARCHAR(30) NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('VERIFICADO', 'EN_REVISION')),
  horas_capacitacion INTEGER NOT NULL CHECK (horas_capacitacion > 0)
);

-- 12. Ledger de Transacciones Culqi Perú (PEN)
CREATE TABLE IF NOT EXISTS culqi_transactions (
  id VARCHAR(40) PRIMARY KEY,
  charge_id VARCHAR(80) NOT NULL UNIQUE,
  token_id VARCHAR(100) NOT NULL,
  authorization_code VARCHAR(60) NOT NULL,
  reference_code VARCHAR(60) NOT NULL,
  amount_centimos INTEGER NOT NULL CHECK (amount_centimos >= 100),
  amount_soles NUMERIC(10,2) GENERATED ALWAYS AS (ROUND(amount_centimos / 100.0, 2)) STORED,
  currency CHAR(3) NOT NULL DEFAULT 'PEN' CHECK (currency = 'PEN'),
  method VARCHAR(20) NOT NULL CHECK (method IN ('TARJETA', 'YAPE_PLIN')),
  concepto VARCHAR(30) NOT NULL CHECK (concepto IN ('IMPREVISTO', 'ANUNCIO', 'ORDEN_CUSTODIA')),
  reference_id VARCHAR(60),
  description VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  mode VARCHAR(15) NOT NULL CHECK (mode IN ('live', 'test', 'sandbox')),
  status VARCHAR(15) NOT NULL CHECK (status IN ('PAID', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Conversaciones de Chat Directo y Mensajes (Idempotencia por id)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id VARCHAR(120) PRIMARY KEY,
  orden_id VARCHAR(40) REFERENCES orders(id) ON DELETE SET NULL,
  imprevisto_id VARCHAR(40) REFERENCES imprevistos(id) ON DELETE SET NULL,
  servicio_titulo VARCHAR(200) NOT NULL,
  cliente_id VARCHAR(40),
  cliente_nombre VARCHAR(180) NOT NULL,
  trabajador_id VARCHAR(40),
  trabajador_nombre VARCHAR(180) NOT NULL,
  trabajador_telefono VARCHAR(25) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(80) NOT NULL,
  conversation_id VARCHAR(120) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(40) NOT NULL,
  sender_name VARCHAR(180) NOT NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('cliente', 'trabajador', 'sistema')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, id)
);

-- 14. Auditoría de Despacho Multicanal (Email + WhatsApp + Chat)
CREATE TABLE IF NOT EXISTS dispatch_logs (
  id VARCHAR(40) PRIMARY KEY,
  orden_id VARCHAR(40) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_queued BOOLEAN NOT NULL DEFAULT TRUE,
  email_detail TEXT,
  whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_queued BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_detail TEXT,
  chat_delivered BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
