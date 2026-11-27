# 04 — Especificaciones Funcionales por Módulo (SDD Specs + Gherkin)

> **Propósito:** Definir de forma verificable cada módulo del programa **TrabajaYa Perú (`conectaoficios`)** mediante **Requisitos Funcionales (RF)**, **Reglas de Negocio (RN)** y **Criterios de Aceptación Gherkin (`Given / When / Then`)**.

---

## Módulo 1 (M1): Autenticación, RBAC Estricto y Política de Correos

**Componentes / Código:** `AuthScreen.tsx`, `ConectaContext.tsx` (`registrarUsuario`, `iniciarSesion`, `cerrarSesion`, `esCorreoPermitido`, `agregarCorreoPermitido`, `eliminarCorreoPermitido`).

### Requisitos Funcionales
- **RF-M1-01 (Registro de Usuario):** Permitir el registro de nuevos usuarios asignando siempre `permiso = 'USUARIO'`, `estadoCuenta = 'PENDIENTE'` y modalidad funcional `tipoUsuario` (`CLIENTE_HOGAR`, `OFERTANTE_OFICIO`, `AMBOS`).
- **RF-M1-02 (Validación de Identidad y Contacto):** Validar tipo y número de documento (`DNI`: 8 dígitos; `CE`/`PASAPORTE`: 6–15 alfanuméricos), teléfono de 9 dígitos, dirección `>= 5` caracteres, contraseña `>= 6` caracteres y Ubigeo Perú.
- **RF-M1-03 (Política de Correos Permitidos):** Restringir registro e inicio de sesión a dominios o correos autorizados en `correosPermitidos` (inicialmente `@conectaoficios.pe`, `@gmail.com`, `@outlook.com`, `@hotmail.com`).
- **RF-M1-04 (Inicio y Cierre de Sesión):** Validar credenciales, bloquear cuentas en estado `SUSPENDIDO`, permitir adjuntar evidencia multimedia al iniciar sesión (`mediaOnLogin`) y redirigir automáticamente a `portal` si es `ADMIN` o a `catalogo` si es `USUARIO`.
- **RF-M1-05 (Migración de Carrito Invitado):** Al registrarse un usuario, transferir automáticamente los ítems del carrito `'GUEST'` a su nuevo `usuario.id`.
- **RF-M1-06 (Guardias de Navegación):** Un visitante sin sesión solo puede navegar por `catalogo`, `imprevistos`, `solicitud` y `acceso`. Las pestañas `portal`, `perfil-inspeccion` y `perfiles` son exclusivas de `ADMIN`.

### Reglas de Negocio
- **RN-M1-01:** `dni` y `email` (insensible a mayúsculas) deben ser únicos en toda la plataforma.
- **RN-M1-02:** Nadie puede registrarse con `adminUnico.email` (`admin@conectaoficios.pe`) ni elevar su permiso a `ADMIN`.
- **RN-M1-03:** El administrador no puede eliminar `@conectaoficios.pe` ni `admin@conectaoficios.pe` de la lista blanca.
- **RN-M1-04:** Si un usuario o el administrador cambia un correo hacia un dominio no listado, el correo exacto se agrega automáticamente a `correosPermitidos` para no bloquear su acceso futuro.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Autenticación y Control de Acceso (RBAC)

  Scenario: Registro exitoso de usuario ofertante con migración de carrito
    Given un visitante no autenticado con 1 servicio en su carrito GUEST
    When completa el registro en AuthScreen con DNI "72345678", correo "tecnico@gmail.com", teléfono "987654321", Ubigeo "Lima / Lima / Miraflores", dirección "Av. Larco 123" y contraseña de 6+ caracteres
    Then se crea la cuenta con permiso "USUARIO" y estadoCuenta "PENDIENTE"
    And el ítem del carrito GUEST se migra al nuevo usuario y el carrito GUEST queda vacío

  Scenario: Bloqueo de acceso a cuenta suspendida
    Given un usuario registrado con estadoCuenta "SUSPENDIDO"
    When intenta iniciar sesión con sus credenciales correctas
    Then iniciarSesion retorna ok = false con mensaje de cuenta suspendida
    And currentUser permanece en null

  Scenario: Protección de rutas administrativas
    Given un usuario autenticado con permiso "USUARIO"
    When intenta activar las pestañas "portal", "perfiles" o "perfil-inspeccion"
    Then el sistema rechaza la navegación y protege las vistas administrativas
```

---

## Módulo 2 (M2): Catálogo Nacional Multioficios y Perfiles Públicos

**Componentes / Código:** `CatalogoView.tsx`, `ServiceDetailModal.tsx`, `PublicProfileModal.tsx`, `PerfilesView.tsx`, `PeruUbigeoSelector.tsx`.

### Requisitos Funcionales
- **RF-M2-01 (Catálogo Moderado):** Mostrar exclusivamente anuncios en estado `APROBADO` (`serviciosAprobados`).
- **RF-M2-02 (Búsqueda y Filtros Reactivos):** Permitir búsqueda textual en vivo, filtro por 4 grupos (`GRUPOS_OFICIO`) / 14 especialidades (`CATEGORIAS_OFICIO`) y filtro geográfico en cascada (`Región → Provincia → Distrito`) cubriendo las 25 regiones del Perú.
- **RF-M2-03 (Ordenamiento Comercial por Prioridad):** Ordenar automáticamente el catálogo priorizando `PRO > DESTACADO > BASICO > PRUEBA`, desempatando por calificación descendente.
- **RF-M2-04 (Ficha Detallada y Reseñas):** En `ServiceDetailModal`, mostrar credenciales (SENATI/SENCICO/CAPECO), insignias de cumplimiento (Antecedentes 3/3, RUC, Domicilio, Contrato), portafolio fotográfico, reseñas consolidadas (del servicio + órdenes calificadas) y desglose de tarifa (`precioBase + 10% garantía`).
- **RF-M2-05 (Perfil Público con Privacidad):** En `PublicProfileModal`, exhibir portafolio de trabajos, servicios activos, reseñas e insignias sin exponer archivos privados de identidad ni DNI/RUC completos a terceros no autorizados.
- **RF-M2-06 (Directorio de Perfiles Admin):** En `PerfilesView`, listar y filtrar (`TODOS`, `OFERTANTES`, `CLIENTES`, `CON_FOTOS` + Ubigeo) todos los usuarios registrados únicamente cuando `currentRole === 'ADMIN'`.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Catálogo Nacional y Privacidad de Perfiles

  Scenario: Ordenamiento prioritario de anuncios aprobados
    Given existen anuncios APROBADOS de planes PRO, DESTACADO, BASICO y un anuncio PENDIENTE_APROBACION
    When un visitante abre CatalogoView sin filtros
    Then el anuncio PENDIENTE_APROBACION no aparece en el catálogo
    And los anuncios PRO aparecen antes que DESTACADO y BASICO

  Scenario: Protección de privacidad en perfil público
    Given un visitante o usuario diferente al propietario abre PublicProfileModal de "USR-002"
    Then visualiza fotosTrabajos, servicios activos e insignias de cumplimiento
    And NO visualiza dniFotoUrl, videoPersonaUrl ni el número completo de DNI o RUC
```

---

## Módulo 3 (M3): Perfil de Usuario, Expediente de Cumplimiento (5 Bloques) y Galería

**Componentes / Código:** `PerfilView.tsx`, `ExpedienteCumplimientoSection.tsx`, `AdminInspectProfileView.tsx`, `mediaUpload.ts`.

### Requisitos Funcionales
- **RF-M3-01 (Edición de Datos Personales):** Permitir al usuario autenticado actualizar nombre, documento, correo, teléfono, Ubigeo, modalidad `tipoUsuario`, especialidad, dirección y contraseña, propagando cambios (`sincronizarPublicacionesConUsuario`) a sus servicios, carritos, imprevistos y ofertas.
- **RF-M3-02 (Verificación Multimedia Privada):** Permitir subir foto de persona, foto de documento (DNI), video de presentación (`<= 2.2 MB` en DataURL o `ObjectURL` de sesión) y certificado técnico opcional.
- **RF-M3-03 (Expediente de Cumplimiento Legal de 5 Bloques):** Gestionar en `ExpedienteCumplimientoSection` (modo `owner` y modo `admin`):
  1. Identidad, comprobante de domicilio (`AGUA`/`LUZ`/`TELEFONO`) y contacto familiar de emergencia.
  2. Datos tributarios: RUC (11 dígitos), condición SUNAT activo/habido, comprobante (`RECIBO_HONORARIOS`/`FACTURA`) y Ficha RUC.
  3. Certificados de Antecedentes Policiales (PNP), Penales (PJ) y Judiciales (INPE).
  4. Certificaciones técnicas y Licencia de Conducir MTC (número, categoría `A-I` a `B-IIc` y archivo).
  5. Firma digital de contrato (`LOCACION_SERVICIOS`/`CONTRATO_TRABAJO`), firma de Normas de Conducta e Inventario de Herramientas/EPP firmado (`EMPRESA`/`PROPIA`).
- **RF-M3-04 (Galería Pública de Trabajos):** Permitir cargar hasta 6 fotos comprimidas por lote (`compressImageToDataUrl`) con título, oficio, ubicación y descripción, con visor lightbox y eliminación por propietario o Admin.
- **RF-M3-05 (Auditoría Documental Admin):** Permitir al `ADMIN` aprobar (`VERIFICADO`), observar con motivo (`OBSERVADO`) o eliminar cualquier archivo individual (`eliminarArchivoVerificacionAdmin`), actualizando automáticamente el estado a `OBSERVADO` o `SIN_ADJUNTOS`.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Expediente de Cumplimiento Legal y Verificación

  Scenario: Subida de antecedente por usuario dispara revisión administrativa
    Given un usuario autenticado "USUARIO" en PerfilView
    When sube su archivo de Antecedentes Policiales en ExpedienteCumplimientoSection
    Then el archivo se almacena en el expediente del usuario
    And su estadoVerificacionMedia cambia automáticamente a "PENDIENTE_REVISION"

  Scenario: Eliminación de archivo por Admin recalcula estado de verificación
    Given un usuario con un único archivo de verificación "dniFotoUrl"
    When el ADMIN elimina "dniFotoUrl" desde AdminInspectProfileView
    Then el campo "dniFotoUrl" se limpia
    And estadoVerificacionMedia pasa a "SIN_ADJUNTOS"
```

---

## Módulo 4 (M4): Publicación de Anuncios, Planes Comerciales y Moderación

**Componentes / Código:** `PublicarAnuncioView.tsx`, `CulqiCheckoutModal.tsx`, `TecnicoAdminView.tsx` (pestañas `publicaciones` y `planes`).

### Requisitos Funcionales
- **RF-M4-01 (Creación de Anuncio):** Permitir a usuarios autenticados con `estadoCuenta === 'ACTIVO'` publicar servicios técnicos especificando oficio, título (`>= 8` chars), descripción (`>= 15` chars), DNI (8 dígitos), nombre (`>= 4` chars), teléfono (9 dígitos), `precioBase >= 20`, turnos libres, años de experiencia, Ubigeo y habilidades (`tareasComunes`).
- **RF-M4-02 (Selección de Plan y Promociones):**
  - Mostrar `PRUEBA_7` (`S/ 0.00`, 7 días) **solo** si `promoConfig.pruebaGratisActiva === true` y el usuario aún no ha publicado anuncios previos.
  - Mostrar `BASICO`, `DESTACADO` (aplicando `precio` o `precioRegular` según `promoConfig.descuentoDestacadoActivo`) y `PRO` (con `selloVerificadoPro = true`).
- **RF-M4-03 (Pago Integrado con Culqi):** Si el monto del plan es `> 0`, exigir pago exitoso en `CulqiCheckoutModal` (`concepto = 'ANUNCIO'`) antes de crear el anuncio; si es `S/ 0.00` (`PRUEBA_7`), omitir la pasarela.
- **RF-M4-04 (Moderación y Re-envío):** Todo anuncio creado entra como `PENDIENTE_APROBACION`. El `ADMIN` puede aprobarlo (`admitirPublicacion`) o rechazarlo con motivo (`rechazarPublicacion`). Si el propietario edita un anuncio `RECHAZADO` (`editarMiPublicacion`), vuelve automáticamente a `PENDIENTE_APROBACION`.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Publicación de Anuncios y Moderación

  Scenario: Publicación con Plan Destacado mediante Culqi
    Given un usuario con estadoCuenta "ACTIVO" en PublicarAnuncioView
    When completa un anuncio válido con precioBase 100 y selecciona el plan "DESTACADO" (S/ 24.90)
    And completa el pago en CulqiCheckoutModal
    Then se crea el servicio con garantiaMonto = 10.00, tarifaCliente = 110.00 y estadoPublicacion = "PENDIENTE_APROBACION"
    And el anuncio no aparece en CatalogoView hasta que el ADMIN ejecute admitirPublicacion

  Scenario: Reenvío automático al corregir un anuncio rechazado
    Given un anuncio del usuario en estado "RECHAZADO" con motivoRechazo
    When el usuario edita el anuncio mediante editarMiPublicacion
    Then estadoPublicacion cambia a "PENDIENTE_APROBACION" y motivoRechazo se limpia
```

---

## Módulo 5 (M5): Imprevistos del Hogar y Subasta de Cotizaciones

**Componentes / Código:** `ImprevistosView.tsx`, `CulqiCheckoutModal.tsx`, `TecnicoAdminView.tsx` (pestaña `imprevistos`).

### Requisitos Funcionales
- **RF-M5-01 (Publicación de Emergencia):** Permitir a cualquier usuario autenticado publicar un imprevisto (título `>= 3` chars, descripción `>= 5` chars, oficio, urgencia `NORMAL`/`URGENTE`/`EMERGENCIA`, Ubigeo, dirección, presupuesto referencial y hasta 4 fotos comprimidas) tras abonar la tarifa fija de **`S/ 5.00`** vía Culqi (`concepto = 'IMPREVISTO'`).
- **RF-M5-02 (Envío de Cotizaciones):** Permitir a usuarios autenticados con perfil `OFERTANTE_OFICIO`, `AMBOS` o `ADMIN` enviar una oferta (`montoOferta >= 10`, `tiempoEstimado`, `garantiaDias`, `mensajePropuesta >= 10` chars) sobre imprevistos `ABIERTO`. Los clientes pueden activar `AMBOS` en un clic (`habilitarAmbosRoles`).
- **RF-M5-03 (Regla Anti-Auto-Oferta y Actualización de Puja):** Impedir que el autor oferte en su propio imprevisto (salvo `ADMIN`); si el mismo ofertante envía otra oferta al mismo imprevisto, reemplaza su oferta previa.
- **RF-M5-04 (Adjudicación y Conversión a Orden Escrow):** El autor del imprevisto (o `ADMIN`) puede aceptar una oferta (`aceptarOfertaImprevisto`), cambiando el imprevisto a `ADJUDICADO`, marcando la ganadora como `ACEPTADA` y el resto como `DESCARTADA`, y generando automáticamente una `Orden` en estado `EN_CUSTODIA` con despacho multicanal.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Tablero de Imprevistos del Hogar y Cotizaciones

  Scenario: Adjudicación de oferta genera Orden en Custodia
    Given un ImprevistoHogar "IMP-2026-301" en estado "ABIERTO" con dos ofertas "OFR-901" y "OFR-902"
    When el autor del imprevisto acepta la oferta "OFR-901" de S/ 120.00
    Then "IMP-2026-301" pasa a estado "ADJUDICADO" con ofertaAceptadaId = "OFR-901"
    And "OFR-901" queda "ACEPTADA" y "OFR-902" queda "DESCARTADA"
    And se genera una Orden con garantiaTotal = 12.00, subtotalTecnico = 132.00, igv = 23.76 y total = 155.76 en estado "EN_CUSTODIA"
```

---

## Módulo 6 (M6): Solicitud/Carrito de Servicios (S/ 0.00), GPS y Despacho Automático

**Componentes / Código:** `CarritoView.tsx`, `OrdenConfirmadaModal.tsx`, `whatsappSolicitud.ts`, `server.ts`.

### Requisitos Funcionales
- **RF-M6-01 (Carrito Aislado por Usuario):** Gestionar ítems (`agregarAlCarrito`, `quitarDelCarrito`, `actualizarCantidadItem`, `limpiarCarrito`) respetando `turnosLibres` y separando carritos por `currentUser.id` o `'GUEST'`.
- **RF-M6-02 (Programación y Geolocalización):** Capturar fecha (`>= hoy`), hora exacta (`HH:mm` o chips rápidos), turno, Ubigeo, dirección, referencia, teléfono WhatsApp, correo opcional, notas y ubicación GPS vía `navigator.geolocation` (generando `https://www.google.com/maps?q=lat,lng`) o enlace Google Maps manual.
- **RF-M6-03 (Solicitud Sin Cobro Inicial):** Crear la orden con `metodoPago = 'SIN_COBRO_SOLICITUD'`, cobro inicial `S/ 0.00` (`sinCobroSolicitud = true`, `codigoAutorizacion = 'SOL-PE-XXXXXX'`), descontando `turnosLibres` y preservando `montoReferencial`.
- **RF-M6-04 (Identidad Invitada):** Si el solicitante no inició sesión, etiquetar obligatoriamente la orden con `clienteNombre = 'Anónimo (No registrado)'` y `clienteDni = ''`.
- **RF-M6-05 (Despacho Automático 3 Canales):** Invocar `POST /api/notifications/dispatch-order` para entregar automáticamente la solicitud a todos los técnicos únicos de la orden en: (1) Chat Directo in-app (instantáneo), (2) Correo SMTP/Webhook y (3) WhatsApp Cloud API/Webhook, mostrando respaldo manual (`Gmail`, `mailto:`, `wa.me`, copiar texto) en `OrdenConfirmadaModal`.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Solicitud de Servicios y Despacho Multicanal

  Scenario: Envío de solicitud sin cobro con despacho automático
    Given un usuario autenticado con 1 servicio de precioBase 80 y 5 turnosLibres en su carrito
    When llena los datos de visita y confirma la solicitud en CarritoView
    Then se crea una Orden con estado "EN_CUSTODIA", total = 0, montoReferencial = 80 y aceptacionTrabajador = "PENDIENTE"
    And el servicio reduce sus turnosLibres a 4
    And el servidor crea la conversación ORD:<ordenId>:<telefono> y entrega el resumen en Chat Directo
```

---

## Módulo 7 (M7): Órdenes, Custodia Fiduciaria (Escrow), Pagos Culqi y Calificaciones

**Componentes / Código:** `OrdenesView.tsx`, `PedidoDetalleModal.tsx`, `CulqiCheckoutModal.tsx`, `ConectaContext.tsx`.

### Requisitos Funcionales
- **RF-M7-01 (Visibilidad por Participación):** Mostrar todas las órdenes al `ADMIN` y únicamente las órdenes donde el usuario es cliente o técnico asignado para el rol `USUARIO`.
- **RF-M7-02 (Aceptación Exclusiva del Especialista):** Solo el especialista asignado a la orden puede ejecutar `responderDisponibilidadOrden`:
  - `ACEPTADA`: si la orden estaba en `EN_CUSTODIA`, avanza automáticamente a `EN_CAMINO`.
  - `NO_DISPONIBLE`: registra la nota y restaura automáticamente los `turnosLibres` reservados.
- **RF-M7-03 (Progreso Operativo):** Permitir al técnico o `ADMIN` avanzar estados: `EN_CAMINO` → `EN_EJECUCION` → `COMPLETADO_PENDIENTE_CONFORMIDAD`.
- **RF-M7-04 (Pago de Orden en Custodia con Culqi):** Permitir al cliente pagar una orden mediante `CulqiCheckoutModal` (`concepto = 'ORDEN_CUSTODIA'`) invocando `pagarOrdenConCulqi`, desglosando `subtotalTecnico = round2(monto / 1.1)` y `garantiaTotal = round2(monto - subtotalTecnico)` si provenía de una solicitud sin cobro.
- **RF-M7-05 (Conformidad, Garantía y Resolución Admin):**
  - El cliente otorga conformidad (`darConformidadYLiberarFondos`) → `CONFORMIDAD_Y_LIBERADO`, `fondosLiberados = true`.
  - El cliente reporta anomalía (`reportarObservacion`) → `OBSERVADO_GARANTIA`, congelando fondos.
  - El `ADMIN` resuelve garantía (`resolverGarantiaAdmin`) como `REVISITA` (regresa a `EN_CAMINO`) o `LIBERAR` (`CONFORMIDAD_Y_LIBERADO`).
- **RF-M7-06 (Calificación y Reputación en Vivo):** Al calificar (1–5 estrellas + puntualidad, calidad, limpieza + comentario), `calificarOrden` libera automáticamente la orden si estaba pendiente de conformidad, inserta la `ResenaPublicacion` en los servicios del técnico y recalcula su promedio (`[1, 5]`).
- **RF-M7-07 (Comprobante Imprimible):** Generar constancia/certificado digital imprimible (`window.print()`) por cada orden.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Ciclo de Vida Escrow y Calificaciones

  Scenario: Rechazo de disponibilidad del técnico restaura turnos
    Given una orden "PED-2026-9045" asignada al técnico "USR-002" con 1 turno reservado
    When "USR-002" responde "NO_DISPONIBLE" en PedidoDetalleModal
    Then aceptacionTrabajador se guarda como "NO_DISPONIBLE"
    And los turnosLibres del servicio se incrementan en 1

  Scenario: Calificación en estado pendiente libera fondos y actualiza reputación
    Given una orden en estado "COMPLETADO_PENDIENTE_CONFORMIDAD" con fondosLiberados = false
    When el cliente registra una calificación de 5 estrellas con comentario
    Then la orden pasa a "CONFORMIDAD_Y_LIBERADO" con fondosLiberados = true
    And la reseña aparece en resenasPublicadas del servicio y actualiza su calificación promedio
```

---

## Módulo 8 (M8): Comunicación Directa en Tiempo Real (Chat WebSocket + Llamadas)

**Componentes / Código:** `WhatsAppChatModal.tsx`, `CallModal.tsx`, `ConectaContext.tsx`, `server.ts`.

### Requisitos Funcionales
- **RF-M8-01 (Compuerta de Autenticación):** Bloquear el acceso al Chat Directo y a la visualización del número telefónico en `CallModal` para usuarios no autenticados (`!currentUser`), mostrando un aviso y botón directo hacia `AuthScreen`.
- **RF-M8-02 (Bandeja y Mensajería en Tiempo Real):** Sincronizar conversaciones vía `GET /api/chat/conversations`, `POST /api/chat/conversations/ensure`, `POST /api/chat/messages` y eventos WebSocket `/ws/chat` con reconexión automática cada `2500ms`, detección automática de rol (`cliente` vs `trabajador` vs supervisión `ADMIN`) e idempotencia por `messageId`.
- **RF-M8-03 (Fallback Resiliente):** Si `POST /api/chat/messages` falla por red y el socket está en estado `WebSocket.OPEN`, reenviar el mensaje mediante evento WS `chat:send`.
- **RF-M8-04 (Puente Externo):** Proveer botones de salto directo a WhatsApp Web (`https://wa.me/51...`) y marcador telefónico (`tel:+51...`) con botón de copiado rápido.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Chat Directo en Tiempo Real y Llamadas

  Scenario: Bloqueo de mensajería para visitantes anónimos
    Given un visitante sin sesión iniciada
    When intenta enviar un mensaje a POST /api/chat/messages con senderId "GUEST"
    Then el servidor responde 401 Unauthorized exigiendo registro o inicio de sesión

  Scenario: Entrega en vivo sin duplicados por WebSocket
    Given cliente "USR-018" y técnico "USR-002" conectados a /ws/chat
    When "USR-018" envía un mensaje con messageId único en su conversación
    Then ambos clientes reciben el evento chat:message en tiempo real
    And un reenvío con el mismo messageId no duplica el mensaje en chat-store.json
```

---

## Módulo 9 (M9): Consola Nacional de Administración (7 Pestañas), Billetera y Arquitectura

**Componentes / Código:** `TecnicoAdminView.tsx`, `AdminInspectProfileView.tsx`, `ArchitectureModal.tsx`, `Sidebar.tsx`, `Header.tsx`, `Footer.tsx`, `Toast.tsx`.

### Requisitos Funcionales
- **RF-M9-01 (7 Pestañas Administrativas):** Proveer al `ADMIN` único gestión centralizada en `TecnicoAdminView`:
  1. `publicaciones`: cola de moderación con filtros (`TODAS`, `PENDIENTE_APROBACION`, `APROBADO`, `RECHAZADO`), aprobación/rechazo e inspección de perfil.
  2. `planes`: edición en vivo de `BASICO`, `DESTACADO`, `PRO` (nombre `>= 3` chars, duración `1–3650` días, precio `>= S/ 1`, `>= 1` beneficio), toggles de promociones de lanzamiento y botón de restablecimiento.
  3. `imprevistos`: moderación de emergencias y eliminación de ofertas o publicaciones.
  4. `usuarios`: visualización de política de Admin Único, gestor de lista blanca `correosPermitidos`, filtros de usuarios, activación/suspensión, verificación multimedia, edición completa y eliminación (con protección de `ADM-001`).
  5. `billetera`: métricas en tiempo real (`fondosLiberados`, `fondosEnCustodia`, `fondoGarantia`, `totalContratos`, `ingresosPublicaciones`, `ingresosImprevistos`), libro en vivo de transacciones Culqi (`GET /api/payments/culqi/transactions`) y despacho/resolución de garantías de órdenes.
  6. `turnos`: ajuste `+/-` de `turnosLibres` por servicio.
  7. `certificados`: cambio de estado `VERIFICADO` / `EN_REVISION` de diplomas SENATI, SENCICO y CAPECO.
- **RF-M9-02 (Contadores Reactivos y Feedback):** Mantener badges en vivo en `Sidebar` y notificaciones globales vía `Toast` (`success`, `warning`, `info`).
- **RF-M9-03 (Transparencia Arquitectónica):** Exponer la especificación de Clean Architecture, Monolito Modular y Máquina de Estados Escrow en `ArchitectureModal`.

### Criterios de Aceptación (Gherkin)
```gherkin
Feature: Consola Nacional de Administración y Billetera

  Scenario: Actualización de precio de Plan Comercial solo por Admin
    Given el Administrador Único autenticado en TecnicoAdminView pestaña "planes"
    When actualiza el Plan Básico a precio S/ 9.90 y duración 45 días
    Then el cambio persiste en conecta_planes_publicacion_pe_v2
    And PublicarAnuncioView refleja inmediatamente el nuevo precio S/ 9.90

  Scenario: Cálculo íntegro de la Billetera Fiduciaria
    Given órdenes en estado CONFORMIDAD_Y_LIBERADO y órdenes en EN_CUSTODIA
    When el ADMIN abre la pestaña "billetera"
    Then fondosLiberados suma (subtotalTecnico - garantiaTotal) de las órdenes liberadas
    And fondosEnCustodia suma subtotalTecnico de las órdenes no liberadas
    And se muestra el ledger actualizado desde GET /api/payments/culqi/transactions
```
