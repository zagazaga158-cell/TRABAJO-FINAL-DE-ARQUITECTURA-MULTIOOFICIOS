# 05 — Plan Técnico, Matriz de Trazabilidad, QA y Roadmap SDD

> **Propósito:** Cerrar el ciclo **Spec-Driven Development (SDD)** conectando cada especificación con los archivos reales del repositorio, definiendo el plan de verificación/pruebas, auditando con rigor las brechas entre el prototipo actual y un despliegue productivo, y entregando un backlog atómico listo para ejecución.

---

## 1. Matriz de Trazabilidad Completa (Spec ↔ Código ↔ Verificación)

| Módulo SDD | Requisitos | Archivos de Implementación | Persistencia / API | Casos de Prueba Clave |
| :--- | :--- | :--- | :--- | :--- |
| **M1. Auth, RBAC y Correos** | `RF-M1-01` a `RF-M1-06` | `src/components/AuthScreen.tsx`, `src/context/ConectaContext.tsx` | `conecta_usuarios_pe_v2`, `conecta_current_user_pe_v2`, `conecta_correos_permitidos_pe_v2` | Registro DNI/CE/Pasaporte, bloqueo `SUSPENDIDO`, protección `ADM-001`, migración carrito `GUEST`, guardias de rol. |
| **M2. Catálogo y Perfiles** | `RF-M2-01` a `RF-M2-06` | `CatalogoView.tsx`, `ServiceDetailModal.tsx`, `PublicProfileModal.tsx`, `PerfilesView.tsx`, `PeruUbigeoSelector.tsx`, `src/data/peruUbigeo.ts` | `conecta_servicios_pe_v2` | Filtro 14 oficios + Ubigeo 25/196/1872, prioridad `PRO > DESTACADO > BASICO`, privacidad en `PublicProfileModal`, bloqueo no-Admin en `PerfilesView`. |
| **M3. Expediente 5 Bloques y Galería** | `RF-M3-01` a `RF-M3-05` | `PerfilView.tsx`, `ExpedienteCumplimientoSection.tsx`, `AdminInspectProfileView.tsx`, `src/utils/mediaUpload.ts` | `conecta_usuarios_pe_v2` | Compresión imágenes, subida PDFs/videos, paso a `PENDIENTE_REVISION`, firma contrato/reglamento/inventario, eliminación de archivos por Admin. |
| **M4. Publicaciones y Planes** | `RF-M4-01` a `RF-M4-04` | `PublicarAnuncioView.tsx`, `CulqiCheckoutModal.tsx`, `TecnicoAdminView.tsx` | `conecta_servicios_pe_v2`, `conecta_planes_publicacion_pe_v2`, `conecta_promo_lanzamiento_pe_v2`, `/api/payments/culqi/*` | `PRUEBA_7` 1 sola vez, cobro Culqi en planes pagos, estado `PENDIENTE_APROBACION`, reenvío de `RECHAZADO` tras edición. |
| **M5. Imprevistos y Ofertas** | `RF-M5-01` a `RF-M5-04` | `ImprevistosView.tsx`, `CulqiCheckoutModal.tsx`, `TecnicoAdminView.tsx` | `conecta_imprevistos_pe_v2`, `/api/payments/culqi/charge` | Pago obligatorio S/ 5.00, bloqueo auto-oferta, reemplazo de oferta duplicada, adjudicación genera `Orden` Escrow. |
| **M6. Carrito S/ 0.00, GPS y Despacho** | `RF-M6-01` a `RF-M6-05` | `CarritoView.tsx`, `OrdenConfirmadaModal.tsx`, `src/utils/whatsappSolicitud.ts`, `server.ts` | `conecta_carritos_por_usuario_pe_v2`, `POST /api/notifications/dispatch-order`, `.data/dispatch-log.json` | Cálculo `S/ 0.00`, GPS `navigator.geolocation`, etiqueta `Anónimo (No registrado)` para `GUEST`, despacho automático 3 canales. |
| **M7. Órdenes, Escrow, Culqi y Reseñas** | `RF-M7-01` a `RF-M7-07` | `OrdenesView.tsx`, `PedidoDetalleModal.tsx`, `CulqiCheckoutModal.tsx`, `ConectaContext.tsx` | `conecta_ordenes_pe_v2`, `.data/culqi-transactions.json` | Transiciones de 6 estados Escrow, aceptación exclusiva del técnico, restitución de turnos en `NO_DISPONIBLE`, liberación al calificar, impresión comprobante. |
| **M8. Chat WS y Llamadas** | `RF-M8-01` a `RF-M8-04` | `WhatsAppChatModal.tsx`, `CallModal.tsx`, `ConectaContext.tsx`, `server.ts` | `WS /ws/chat`, `/api/chat/*`, `.data/chat-store.json` | Rechazo `401` a `GUEST`, reconexión WS `2500ms`, idempotencia `messageId`, fallback WS en fallo HTTP, ocultamiento teléfono sin login. |
| **M9. Consola Admin y Billetera** | `RF-M9-01` a `RF-M9-03` | `TecnicoAdminView.tsx`, `ArchitectureModal.tsx`, `Sidebar.tsx`, `Header.tsx`, `Footer.tsx`, `Toast.tsx` | `conecta_certificados_pe_v2`, `GET /api/payments/culqi/transactions` | Las 7 pestañas Admin, ledger Culqi en vivo, fórmulas `billeteraTecnico`, ajuste de turnos y estado de certificados. |

---

## 2. Plan de Verificación y Pruebas (QA Checklist SDD)

### 2.1 Verificación Estática y de Compilación
| Comando | Criterio de Éxito |
| :--- | :--- |
| `npm run lint` (`tsc --noEmit`) | 0 errores de tipos en todo `src/` y `server.ts`. |
| `npm run build` (`vite build`) | Genera `dist/` limpio y copia `src/assets` hacia `dist/src/assets` mediante el plugin `copy-unbundled-src-assets`. |
| `GET /api/health` | Responde `200 OK` con `{ "ok": true, "conversations": N }`. |

### 2.2 Escenarios E2E Críticos (Flujos de Extremo a Extremo)
1. **E2E-01 (Ciclo Completo de Servicio desde Catálogo):**
   - Invitado busca por Región/Provincia/Distrito y Oficio → agrega servicio al carrito → inicia sesión como `USR-018` → envía solicitud `S/ 0.00` con GPS → verifica creación de orden `PED-*` y entrega en Chat Directo → inicia sesión como técnico asignado → acepta disponibilidad (`EN_CAMINO`) → marca `COMPLETADO_PENDIENTE_CONFORMIDAD` → cliente paga vía Culqi Sandbox (`ORDEN_CUSTODIA`) y califica 5★ → verifica `CONFORMIDAD_Y_LIBERADO`, actualización de reputación en `CatalogoView` y KPIs en Billetera Admin.
2. **E2E-02 (Ciclo Completo de Imprevisto del Hogar):**
   - Cliente publica imprevisto pagando S/ 5.00 con Culqi Sandbox (Yape) → Técnico ofertante envía cotización → Cliente adjudica oferta → verifica creación automática de `Orden` en `EN_CUSTODIA` y despacho en `.data/dispatch-log.json`.
3. **E2E-03 (Ciclo de Moderación y Cumplimiento):**
   - Nuevo usuario se registra → sube los 5 bloques del expediente en `PerfilView` → `ADM-001` inspecciona en `AdminInspectProfileView` → activa cuenta (`ACTIVO`) y aprueba verificación (`VERIFICADO`) → usuario publica anuncio con `PRUEBA_7` (`S/ 0.00`) → `ADM-001` aprueba anuncio en pestaña `publicaciones` → aparece en `CatalogoView`.
4. **E2E-04 (Ciclo de Garantía Escrow):**
   - Cliente reporta observación sobre orden terminada → estado `OBSERVADO_GARANTIA` (fondos congelados) → `ADM-001` resuelve como `REVISITA` (`EN_CAMINO`) o `LIBERAR` (`CONFORMIDAD_Y_LIBERADO`).
5. **E2E-05 (Comunicación en Tiempo Real):**
   - Abrir 2 ventanas con sesiones distintas (cliente y técnico) → enviar mensaje desde cliente → verificar aparición inmediata sin recarga vía `/ws/chat` y persistencia tras reiniciar `server.ts`.

---

## 3. Auditoría de Brechas Técnicas (Estado Actual vs. Producción)

Una práctica esencial del **Desarrollo Basado en SDD** es documentar explícitamente las diferencias entre la arquitectura implementada en fase prototipo/académica y los requisitos de puesta en producción real:

| ID Brecha | Categoría | Estado Actual en el Código | Riesgo en Producción | Remediación Requerida |
| :---: | :--- | :--- | :--- | :--- |
| **GAP-01** | Seguridad / Auth | Contraseñas almacenadas en texto plano en `localStorage` (`UsuarioRegistrado.password`) y validación de login en cliente. | **Crítico:** exposición de credenciales y bypass de RBAC desde DevTools. | Migrar autenticación al backend con `bcrypt`/`argon2`, sesiones JWT en cookies `HttpOnly; Secure; SameSite=Lax` y middleware RBAC en Express. |
| **GAP-02** | Persistencia | Usuarios, servicios, órdenes, imprevistos y planes viven en `localStorage` del navegador; solo chat, dispatch y Culqi persisten en `.data/*.json`. | **Crítico:** datos no compartidos entre navegadores/dispositivos y riesgo de pérdida al limpiar caché. | Migrar las 10 entidades a **PostgreSQL** (transacciones ACID Escrow) y mover `ConectaContext` a llamadas API REST con React Query / SWR. |
| **GAP-03** | Concurrencia / Agenda | Descuento de `turnosLibres` ocurre en memoria cliente (`setServicios`). | **Alto:** condiciones de carrera (doble reserva simultánea). | Implementar candados distribuidos en **Redis** (`SET key val NX PX`) + transacción `SELECT ... FOR UPDATE` en PostgreSQL. |
| **GAP-04** | Seguridad Chat WS | `GET /api/chat/conversations` y `/ws/chat` confían en `role`/`userId` enviados por el cliente y hacen broadcast global a todos los sockets (el cliente filtra visibilidad). | **Alto:** fuga de mensajes entre usuarios si se inspecciona el tráfico WS. | Autenticar el handshake WebSocket con token de sesión y enrutar eventos solo a sockets suscritos a sus salas autorizadas (`Map<userId, Set<WebSocket>>`). |
| **GAP-05** | Almacenamiento Media | Fotos, PDFs y videos se comprimen como Base64/DataURL o `ObjectURL` de sesión en `localStorage`. | **Medio:** límite ~5–10 MB del navegador y pérdida de archivos grandes al recargar. | Implementar subida directa mediante URLs prefirmadas a **Cloud Storage / S3** con bucket privado para documentos de identidad/antecedentes. |
| **GAP-06** | Modularidad Frontend | `ConectaContext.tsx` concentra ~3,810 líneas con toda la lógica de negocio y estado global. | **Medio:** acoplamiento alto y re-renders innecesarios. | Dividir en contextos/stores por dominio (`AuthStore`, `CatalogStore`, `OrdersStore`, `ImprevistosStore`, `ChatStore`) y servicios API dedicados. |
| **GAP-07** | Higiene de Código | Existen componentes legados sin montar en `App.tsx` (`AuthModal.tsx`, `PortalSelectorModal.tsx`) y marca histórica mixta (`conectaoficios` vs `TrabajaYa Perú`). | **Bajo:** confusión de mantenimiento y peso muerto. | Retirar o archivar componentes legados y unificar branding/identificadores de marca. |
| **GAP-08** | Pruebas Automatizadas | No existe suite automatizada (`vitest` / `playwright` / `supertest`) configurada en `package.json`. | **Medio:** regresiones silenciosas al evolucionar especificaciones. | Incorporar tests unitarios de dominio (fórmulas Escrow, validadores, Ubigeo), tests de API (`supertest`) y E2E (`playwright`). |

---

## 4. Roadmap y Backlog de Tareas Ejecutables (SDD Tasks)

El siguiente plan divide la evolución hacia producción en **4 fases atómicas y verificables**:

### Fase 1 — Cimientos Backend y Seguridad (Resuelve GAP-01, GAP-02, GAP-04)
- **T1.1:** Definir esquema relacional SQL (Prisma/Drizzle + PostgreSQL) espejo exacto del Documento `02-MODELO-DE-DATOS-Y-DOMINIO.md` (`users`, `compliance_dossiers`, `services`, `publication_plans`, `imprevistos`, `ofertas`, `orders`, `order_items`, `order_history`, `certificates`, `culqi_transactions`, `conversations`, `messages`, `dispatch_logs`).
- **T1.2:** Implementar módulo de autenticación backend (`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`) con hashing `argon2`/`bcrypt` y middleware `requireAuth` + `requireAdmin`.
- **T1.3:** Asegurar `/api/chat/*` y `/ws/chat` validando sesión en servidor y despachando eventos WebSocket únicamente a los participantes de cada conversación y al `ADMIN`.

### Fase 2 — Migración de Casos de Uso del Dominio a API Autoritativa (Resuelve GAP-02, GAP-03, GAP-05)
- **T2.1:** Implementar endpoints REST para Catálogo, Publicaciones y Planes (`/api/services`, `/api/plans`, `/api/admin/services/:id/moderate`).
- **T2.2:** Implementar endpoints de Imprevistos y Adjudicación transaccional (`/api/imprevistos`, `/api/imprevistos/:id/offers`, `/api/imprevistos/:id/adjudicate`).
- **T2.3:** Implementar Motor Escrow transaccional (`/api/orders`, `/api/orders/:id/availability`, `/api/orders/:id/conform`, `/api/orders/:id/warranty`, `/api/orders/:id/rate`) con bloqueo optimista/Redis para `turnosLibres`.
- **T2.4:** Integrar almacenamiento de objetos (S3/GCS) con URLs prefirmadas privadas para el Expediente de Cumplimiento de 5 Bloques y públicas (CDN) para `fotosTrabajos`.

### Fase 3 — Refactorización Modular del Frontend (Resuelve GAP-06, GAP-07)
- **T3.1:** Extraer funciones puras de cálculo financiero Escrow e invariantes a `src/domain/escrow.ts` y `src/domain/validators.ts`.
- **T3.2:** Segmentar `ConectaContext.tsx` en módulos de estado por dominio conectados a la API REST.
- **T3.3:** Depurar componentes legados (`AuthModal.tsx`, `PortalSelectorModal.tsx`) y estandarizar el nombre de marca en textos/metadatos.

### Fase 4 — Automatización QA, Observabilidad e IA (Resuelve GAP-08)
- **T4.1:** Configurar `vitest` para pruebas unitarias de `src/domain/*`, `peruUbigeo.ts` y `whatsappSolicitud.ts`.
- **T4.2:** Configurar `supertest` para validar contratos del Documento `03-CONTRATOS-API-Y-EVENTOS.md` (Culqi, Chat, Dispatch, Auth).
- **T4.3:** Configurar `playwright` ejecutando los 5 escenarios `E2E-01` a `E2E-05` en CI.
- **T4.4:** Habilitar capacidad preparada `@google/genai` (`GEMINI_API_KEY`) del lado del servidor para asistencia inteligente (clasificación automática de oficio/urgencia en `ImprevistosView` y validación preliminar de descripciones).
