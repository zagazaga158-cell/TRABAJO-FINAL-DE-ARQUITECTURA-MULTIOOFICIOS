-- ==============================================================================
-- TrabajaYa Perú — Datos Semilla Oficiales (Idempotentes)
-- Alineado con src/data/initialData.ts
-- ==============================================================================

-- 1. Lista blanca inicial de correos permitidos
INSERT INTO allowed_emails (regla, protected) VALUES
  ('@conectaoficios.pe', TRUE),
  ('@gmail.com', FALSE),
  ('@outlook.com', FALSE),
  ('@hotmail.com', FALSE)
ON CONFLICT (regla) DO NOTHING;

-- 2. Planes comerciales de publicación
INSERT INTO publication_plans (
  id, categoria_etiqueta, nombre, subtitulo_tag, duracion_dias, precio, precio_regular, beneficios, destacado, nivel_prioridad
) VALUES
  ('PRUEBA_7', 'PRIMERA PUBLICACIÓN PROMOCIONAL', 'Prueba Gratis de Lanzamiento', '1 sola vez · Funciones básicas', 7, 0.00, NULL,
   '["7 días gratis en tu primera publicación.","1 publicación activa con funciones limitadas.","Contacto por WhatsApp y teléfono."]'::jsonb, FALSE, 0),
  ('BASICO', 'PLAN DE ENTRADA', 'Plan Básico', 'Ideal para captar usuarios', 30, 4.90, NULL,
   '["1 publicación activa.","Perfil público del profesional.","Contacto por WhatsApp y teléfono."]'::jsonb, FALSE, 0),
  ('DESTACADO', 'PLAN INTERMEDIO', 'Plan Destacado', 'Mi recomendación principal', 180, 24.90, 29.90,
   '["Todo lo del plan Básico.","Prioridad en resultados de búsqueda.","Insignia de profesional destacado."]'::jsonb, TRUE, 1),
  ('PRO', 'PLAN PREMIUM', 'Especialista PRO', 'Mejor ahorro anual', 365, 59.90, NULL,
   '["Todo lo del plan Destacado.","Perfil PRO y sello de verificación.","Posicionamiento prioritario nacional."]'::jsonb, TRUE, 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Administrador Nacional Único (ADM-001) y cuentas base de prueba
-- Nota: en producción reemplazar password_hash por hash argon2id / bcrypt generado en backend.
INSERT INTO users (
  id, permiso, tipo_usuario, estado_cuenta, tipo_documento, dni, nombre_completo,
  telefono_whatsapp, email, password_hash, region, provincia, distrito, direccion,
  especialidad_principal, estado_verificacion_media
) VALUES
  ('ADM-001', 'ADMIN', 'AMBOS', 'ACTIVO', 'DNI', '28201144', 'Ing. Lizbeth Jaico Quispe (Admin Nacional)',
   '966 000 100', 'admin@conectaoficios.pe', '$argon2id$demo-placeholder-admin123',
   'Lima', 'Lima', 'Miraflores', 'Av. Pardo 620 - Miraflores, Lima',
   'Administración Nacional TrabajaYa Perú', 'VERIFICADO'),
  ('USR-000', 'USUARIO', 'AMBOS', 'ACTIVO', 'DNI', '72458910', 'Usuario Principal Perú',
   '966 852 147', 'zagazaga158@gmail.com', '$argon2id$demo-placeholder-usuario123',
   'Lima', 'Lima', 'Lince', 'Av. Arequipa 1840 - Lince, Lima',
   'Cliente y Ofertante de Servicios', 'SIN_ADJUNTOS'),
  ('USR-002', 'USUARIO', 'OFERTANTE_OFICIO', 'ACTIVO', 'DNI', '41829304', 'Téc. Wilber Mendoza Huayhua',
   '966 784 210', 'wilber.electricidad@gmail.com', '$argon2id$demo-placeholder-tecnico123',
   'Lima', 'Lima', 'Miraflores', 'Calle Schell 340 - Miraflores, Lima',
   'Electricidad Residencial e Industrial', 'VERIFICADO'),
  ('USR-018', 'USUARIO', 'CLIENTE_HOGAR', 'ACTIVO', 'DNI', '28401928', 'Dr. Alejandro Palomino',
   '999 456 789', 'alejandro.palomino@gmail.com', '$argon2id$demo-placeholder-cliente123',
   'Lima', 'Lima', 'Lince', 'Av. Petit Thouars 2450 - Lince, Lima',
   'Cliente Residencial', 'VERIFICADO')
ON CONFLICT (id) DO NOTHING;

-- 4. Servicios representativos del catálogo
INSERT INTO services (
  id, autor_usuario_id, oficio, titulo, descripcion, tecnico_nombre, tecnico_dni, tecnico_telefono,
  tecnico_email, institucion_certificadora, codigo_certificado, precio_base, turnos_libres,
  calificacion, num_resenas, experiencia_anos, region, provincia, distrito,
  estado_publicacion, plan_id, destacado, sello_verificado_pro, monto_pagado_plan
) VALUES
  ('SRV-E01', 'USR-002', 'ELECTRICIDAD',
   'Instalación de Pozos a Tierra y Medición Certificada con Telurómetro',
   'Diagnóstico y ejecución de pozo a tierra, tableros con llaves termomagnéticas y diferenciales bajo norma CNE.',
   'Téc. Wilber Mendoza Huayhua', '41829304', '966 784 210', 'wilber.electricidad@gmail.com',
   'SENATI', 'SEN-EL-2024-8821', 140.00, 6, 4.90, 42, 9,
   'Lima', 'Lima', 'Miraflores', 'APROBADO', 'PRO', TRUE, TRUE, 59.90)
ON CONFLICT (id) DO NOTHING;
