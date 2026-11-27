-- ==============================================================================
-- TrabajaYa Perú — Índices Compuestos, Full-Text Search, Particionamiento,
-- Vista Materializada de Billetera y Bloqueo Transaccional de Turnos (ACID)
-- ==============================================================================

-- 1. Índice compuesto parcial para el Catálogo Nacional (solo APROBADOS)
-- Acelera filtros por Oficio + Ubigeo + Ranking Comercial (PRO > DESTACADO > BASICO)
CREATE INDEX IF NOT EXISTS idx_services_catalogo_aprobado
  ON services (oficio, region, provincia, distrito, sello_verificado_pro DESC, destacado DESC, calificacion DESC)
  WHERE estado_publicacion = 'APROBADO';

-- 2. Índice GIN Full-Text Search en español sobre título y descripción de servicios
CREATE INDEX IF NOT EXISTS idx_services_fts_es
  ON services
  USING GIN (to_tsvector('spanish', coalesce(titulo, '') || ' ' || coalesce(descripcion, '') || ' ' || coalesce(tecnico_nombre, '')));

-- 3. Índices parciales para colas operativas de alta frecuencia
CREATE INDEX IF NOT EXISTS idx_services_moderacion_pendiente
  ON services (created_at DESC)
  WHERE estado_publicacion = 'PENDIENTE_APROBACION';

CREATE INDEX IF NOT EXISTS idx_imprevistos_abiertos_ubigeo
  ON imprevistos (oficio, region, distrito, urgencia, created_at DESC)
  WHERE estado = 'ABIERTO';

CREATE INDEX IF NOT EXISTS idx_orders_activas_escrow
  ON orders (estado, aceptacion_trabajador, created_at DESC)
  WHERE estado <> 'CONFORMIDAD_Y_LIBERADO';

CREATE INDEX IF NOT EXISTS idx_orders_cliente_fecha
  ON orders (cliente_usuario_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conv_participantes
  ON chat_conversations (cliente_id, trabajador_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_culqi_tx_fecha
  ON culqi_transactions (created_at DESC, concepto);

-- 4. Particionamiento declarativo por rango mensual para auditoría masiva
CREATE TABLE IF NOT EXISTS audit_events_partitioned (
  id BIGSERIAL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id VARCHAR(60) NOT NULL,
  action VARCHAR(60) NOT NULL,
  actor_id VARCHAR(40),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS audit_events_2026_11
  PARTITION OF audit_events_partitioned
  FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS audit_events_2026_12
  PARTITION OF audit_events_partitioned
  FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS audit_events_default
  PARTITION OF audit_events_partitioned DEFAULT;

-- 5. Vista Materializada de KPIs de Billetera Fiduciaria (lectura instantánea Admin)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_admin_billetera_kpis AS
SELECT
  1 AS singleton_key,
  COALESCE((SELECT SUM(subtotal_tecnico - garantia_total) FROM orders WHERE estado = 'CONFORMIDAD_Y_LIBERADO'), 0)::NUMERIC(12,2) AS fondos_liberados,
  COALESCE((SELECT SUM(subtotal_tecnico) FROM orders WHERE estado <> 'CONFORMIDAD_Y_LIBERADO'), 0)::NUMERIC(12,2) AS fondos_en_custodia,
  COALESCE((SELECT SUM(garantia_total) FROM orders), 0)::NUMERIC(12,2) AS fondo_garantia,
  (SELECT COUNT(*) FROM orders)::INTEGER AS total_contratos,
  COALESCE((SELECT SUM(monto_pagado_plan) FROM services), 0)::NUMERIC(12,2) AS ingresos_publicaciones,
  COALESCE((SELECT SUM(monto_pagado) FROM imprevistos), 0)::NUMERIC(12,2) AS ingresos_imprevistos,
  NOW() AS refreshed_at;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mv_admin_billetera_kpis
  ON mv_admin_billetera_kpis (singleton_key);

-- 6. Procedimiento Atómico con Bloqueo Pesimista (FOR UPDATE) contra doble reserva
CREATE OR REPLACE FUNCTION sp_reservar_turno_atomico(
  p_servicio_id VARCHAR(40),
  p_cantidad INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_disponibles INTEGER;
BEGIN
  IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
    RETURN FALSE;
  END IF;

  SELECT turnos_libres
    INTO v_disponibles
    FROM services
   WHERE id = p_servicio_id
     AND estado_publicacion = 'APROBADO'
   FOR UPDATE;

  IF NOT FOUND OR v_disponibles < p_cantidad THEN
    RETURN FALSE;
  END IF;

  UPDATE services
     SET turnos_libres = turnos_libres - p_cantidad,
         updated_at = NOW()
   WHERE id = p_servicio_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
