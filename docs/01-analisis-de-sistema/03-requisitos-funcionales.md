# Requisitos Funcionales — TrabajaYa Perú (`conectaoficios`)

## 1. Catálogo de Requisitos Funcionales

| ID | Módulo | Requisito funcional |
| :--- | :--- | :--- |
| **RF01** | Identidad y RBAC | El sistema debe permitir el registro e inicio de sesión bajo un modelo estricto de **2 permisos** (`USUARIO` con modalidades `CLIENTE_HOGAR`, `OFERTANTE_OFICIO`, `AMBOS`; y un único `ADMIN` Nacional `ADM-001`), validando unicidad de documento (`DNI` 8 dígitos, `CE`/`PASAPORTE` 6–15 chars), política de correos permitidos (`correosPermitidos`) y bloqueo de cuentas `SUSPENDIDO`. |
| **RF02** | Catálogo y Ubigeo | El sistema debe mostrar en el catálogo público únicamente anuncios `APROBADO`, ordenados por prioridad comercial (`PRO > DESTACADO > BASICO > PRUEBA`) y calificación, con búsqueda textual y filtrado combinado por **4 grupos**, **14 oficios** y **Ubigeo en cascada** (25 regiones, 196 provincias y 1,878 distritos + distrito personalizado). |
| **RF03** | Ficha y Perfiles | El sistema debe mostrar la ficha detallada del servicio (`ServiceDetailModal`) y el perfil público (`PublicProfileModal`) con credenciales (`SENATI`/`SENCICO`/`CAPECO`), insignias de cumplimiento, galería `fotosTrabajos` y reseñas consolidadas, ocultando estrictamente documentos privados y DNI/RUC completos a terceros no autorizados. |
| **RF04** | Expediente Legal (5 Bloques) | El sistema debe permitir gestionar el **Expediente de Cumplimiento Legal de 5 Bloques** (`ExpedienteCumplimientoSection`: identidad/domicilio/emergencia, RUC/SUNAT, antecedentes PNP/PJ/INPE, certificaciones/licencia MTC y contrato/reglamento/inventario firmado) y galería fotográfica comprimida en cliente (`mediaUpload.ts`), cambiando automáticamente el estado a `PENDIENTE_REVISION` ante cargas del usuario. |
| **RF05** | Publicaciones y Planes | El sistema debe permitir a usuarios `ACTIVO` publicar y editar anuncios seleccionando plan (`PRUEBA_7` S/ 0.00 una sola vez, `BASICO` S/ 4.90, `DESTACADO` S/ 24.90/29.90, `PRO` S/ 59.90), calculando `garantiaMonto = 10%` y `tarifaCliente = precioBase + 10%`, procesando pagos con Culqi, pasando a moderación `PENDIENTE_APROBACION` y reenviando automáticamente si se edita un anuncio `RECHAZADO`. |
| **RF06** | Imprevistos y Ofertas | El sistema debe permitir publicar **Imprevistos del Hogar** (`NORMAL`/`URGENTE`/`EMERGENCIA`, hasta 4 fotos) previo pago fijo de **`S/ 5.00`** vía Culqi, recibir cotizaciones (`montoOferta >= 10`, bloqueo de auto-oferta, reemplazo de puja previa) y adjudicar la oferta ganadora generando automáticamente una `Orden` en estado `EN_CUSTODIA`. |
| **RF07** | Carrito, GPS y Solicitud `S/ 0.00` | El sistema debe gestionar carritos aislados por usuario (migrando el carrito `GUEST` al registrarse), capturar fecha, hora exacta, turno y **geolocalización GPS** (`navigator.geolocation` + Google Maps), crear órdenes `SIN_COBRO_SOLICITUD` (`S/ 0.00`, código `SOL-PE-*`), descontar `turnosLibres` y etiquetar clientes no registrados como `Anónimo (No registrado)`. |
| **RF08** | Despacho Automático 3 Canales | Al confirmar una solicitud o adjudicar un imprevisto, el backend (`POST /api/notifications/dispatch-order`) debe entregar la orden simultáneamente por **Chat Directo in-app**, **Correo (SMTP Nodemailer / Webhook)** y **WhatsApp (Meta Cloud API v20.0 / Webhook)** con fallback a enlaces manuales y auditoría en `.data/dispatch-log.json`. |
| **RF09** | Ciclo Escrow y Disponibilidad | El sistema debe controlar la máquina de estados Escrow (`EN_CUSTODIA`, `EN_CAMINO`, `EN_EJECUCION`, `COMPLETADO_PENDIENTE_CONFORMIDAD`, `CONFORMIDAD_Y_LIBERADO`, `OBSERVADO_GARANTIA`), restringiendo la respuesta de disponibilidad (`ACEPTADA` / `NO_DISPONIBLE`, que restituye turnos) exclusivamente al especialista asignado. |
| **RF10** | Pasarela Culqi, Garantías y Comprobante | El sistema debe integrar **Culqi Perú** (`Checkout v4` + `Charges API v2` + `Sandbox`) para anuncios, imprevistos y órdenes (`ORDEN_CUSTODIA`), permitir conformidad/liberación de fondos, activación y resolución administrativa de garantías (`REVISITA` / `LIBERAR`) e impresión de comprobante digital (`window.print()`). |
| **RF11** | Calificaciones y Reputación | El sistema debe permitir calificar órdenes (1–5★ + puntualidad, calidad, limpieza y comentario), liberando fondos automáticamente si la orden estaba en `COMPLETADO_PENDIENTE_CONFORMIDAD`, agregando la reseña a los servicios del técnico y recalculando el promedio `[1, 5]`. |
| **RF12** | Chat Tiempo Real y Llamadas | El sistema debe proveer Chat Directo persistente vía REST + WebSocket (`/ws/chat`) con reconexión automática (`2500ms`), idempotencia por `messageId`, aislamiento RBAC y compuerta `401` para invitados, además de modal de llamada telefónica `+51` protegido por sesión. |
| **RF13** | Consola Nacional Admin (7 Pestañas) | El sistema debe brindar exclusivamente al `ADMIN` único (`ADM-001`) la Consola de 7 pestañas (`publicaciones`, `planes`, `imprevistos`, `usuarios`, `billetera` con 6 KPIs + ledger Culqi en vivo, `turnos`, `certificados`), el directorio `PerfilesView` y la inspección 360° `AdminInspectProfileView`. |
| **RF14** | Observabilidad de Caché y Salud | El servidor debe exponer `GET /api/health` y `GET /api/cache/stats`, aplicando Cache-Aside con `X-Cache: HIT|MISS`, `ETag`/`304 Not Modified` e invalidación automática ante escrituras de pagos y chat. |

---

## 2. Relación entre Historias de Usuario y Requisitos Funcionales

| Historia de usuario | Requisitos funcionales relacionados |
| :--- | :--- |
| **HU01** Registro, acceso y migración de carrito | `RF01`, `RF07` |
| **HU02** Búsqueda y filtrado en catálogo nacional (14 oficios + Ubigeo) | `RF02` |
| **HU03** Consulta de ficha técnica y perfil público con privacidad | `RF03` |
| **HU04** Expediente de Cumplimiento Legal (5 Bloques) y Galería | `RF04` |
| **HU05** Publicación de anuncios con planes y pago Culqi | `RF05`, `RF10` |
| **HU06** Publicación de Imprevistos del Hogar (`S/ 5.00`) | `RF06`, `RF10` |
| **HU07** Cotización y adjudicación de imprevistos a orden Escrow | `RF06`, `RF08`, `RF09` |
| **HU08** Carrito, GPS y solicitud de servicio (`S/ 0.00`) + 3 canales | `RF07`, `RF08` |
| **HU09** Aceptación exclusiva de disponibilidad y progreso técnico | `RF09` |
| **HU10** Pago Culqi Escrow, conformidad, garantías y comprobante | `RF09`, `RF10` |
| **HU11** Calificación con estrellas, criterios y actualización de reputación | `RF11` |
| **HU12** Chat Directo WebSocket en tiempo real y llamada protegida | `RF12`, `RF14` |
| **HU13** Consola Nacional de Administración (7 pestañas) y auditoría | `RF01`, `RF04`, `RF05`, `RF10`, `RF13`, `RF14` |
