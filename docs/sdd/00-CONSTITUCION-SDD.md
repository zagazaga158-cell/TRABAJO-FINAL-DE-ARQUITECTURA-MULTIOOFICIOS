# 00 — Constitución del Proyecto (SDD Constitution)

> **Sistema:** TrabajaYa Perú (`conectaoficios`)  
> **Versión de Especificación:** 1.0.0  
> **Estado:** Vigente (Alineado con la implementación actual del repositorio)  

La **Constitución SDD** establece los principios arquitectónicos, invariantes de dominio, restricciones de seguridad y reglas de gobernanza que **ninguna modificación o nueva funcionalidad puede violar**.

---

## 1. Propósito y Alcance del Sistema

**TrabajaYa Perú** (`conectaoficios`) es una plataforma web de alcance nacional en las **25 regiones, 196 provincias y 1,872 distritos del Perú** diseñada para conectar a clientes residenciales con técnicos y profesionales multioficios acreditados (SENATI, SENCICO, CAPECO y formación técnica equivalente), respaldando la relación contractual mediante:

1. **Verificación de identidad y expediente de cumplimiento legal** (identidad, domicilio, RUC/SUNAT, antecedentes PNP/PJ/INPE, certificaciones, licencia MTC, contrato, reglamento de conducta e inventario de herramientas).
2. **Modelo transparente de contratación**: solicitud directa sin cobro al trabajador (`S/ 0.00` en envío de solicitud) y opción de **Pago Protegido en Custodia Fiduciaria (Escrow)** con garantía del 10%.
3. **Tablero de Imprevistos del Hogar** con publicación de emergencias (`S/ 5.00`) y competencia transparente mediante cotizaciones de técnicos verificados.
4. **Comunicación trazable** mediante Chat Directo en tiempo real (WebSocket + REST), despacho automático multicanal (Chat in-app + Correo SMTP/Webhook + WhatsApp Cloud API/Webhook) y coordinación telefónica.

---

## 2. Principios Arquitectónicos Inmutables

### P1. Clean Architecture y Separación de Responsabilidades
El diseño del sistema se rige por las 4 capas concéntricas de **Clean Architecture** (documentadas también en `src/components/ArchitectureModal.tsx`):
1. **Dominio (Core):** Entidades, tipos, estados finitos e invariantes de negocio independientes de la UI (`src/types/index.ts`).
2. **Aplicación (Casos de Uso):** Orquestación de flujos de negocio, validaciones y sincronización de estado (`src/context/ConectaContext.tsx` y servicios de aplicación).
3. **Infraestructura (Adaptadores):** Servidor Express/WebSocket (`server.ts`), pasarela de pagos Culqi, SMTP Nodemailer, WhatsApp Cloud API, almacenamiento local/JSON y arquitectura objetivo PostgreSQL + Redis.
4. **Presentación (UI):** Componentes React 19 + TypeScript + Tailwind CSS v4 (`src/components/*.tsx`).

### P2. Arquitectura de Monolito Modular
El sistema adopta un **Monolito Modular** (en lugar de microservicios distribuidos) para garantizar:
- Consistencia transaccional en reservas de turnos, pagos y liberaciones Escrow.
- Despliegue simplificado en un único runtime Node.js (`server.ts` sirviendo API REST, WebSocket y SPA).
- Fronteras de dominio explícitas (Catálogo, Agenda/Turnos, Escrow/Órdenes, Acreditación/Cumplimiento, Imprevistos, Publicaciones/Planes, Mensajería/Notificaciones y Administración).

### P3. Fuente Única de Verdad en Especificaciones (SDD)
- Ninguna regla de negocio crítica (cálculo de tarifas, estados de orden, permisos RBAC, esquemas de pago) puede modificarse en código sin actualizar previamente su especificación en `docs/sdd/`.
- Toda nueva funcionalidad debe definir: **Requisito Funcional (RF) → Reglas de Negocio (RN) → Contratos de Datos/API → Criterios de Aceptación Gherkin → Plan de Tareas**.

---

## 3. Invariantes de Dominio (Reglas No Negociables)

### I1. Modelo Estricto de 2 Permisos RBAC y Administrador Único
- En toda la plataforma existen **exactamente dos permisos**: `PermisoRol = 'USUARIO' | 'ADMIN'`.
- Dentro de `USUARIO`, la modalidad operativa se clasifica mediante `TipoUsuario = 'CLIENTE_HOGAR' | 'OFERTANTE_OFICIO' | 'AMBOS'`.
- Existe **estrictamente un único Administrador Nacional** (`ADM-001`, `admin@conectaoficios.pe`):
  - No se pueden registrar cuentas con permiso `ADMIN`.
  - Si el almacenamiento corrupto contuviera más de un `ADMIN`, la hidratación depura duplicados manteniendo solo el primero; si faltara, restaura `ADM-001`.
  - La cuenta `ADMIN` no puede ser suspendida ni eliminada.

### I2. Invariantes Financieras y de Custodia Fiduciaria (Escrow)
- **Fórmula de Garantía y Tarifa Cliente:**
  $$\text{garantiaMonto} = \text{round}_2(\text{precioBase} \times 0.10)$$
  $$\text{tarifaCliente} = \text{round}_2(\text{precioBase} + \text{garantiaMonto})$$
- **Fórmula del Carrito e Impuesto (IGV 18%):**
  $$\text{subtotalItem} = \text{round}_2(\text{cantidadTurnos} \times \text{tarifaCliente})$$
  $$\text{subtotalCarrito} = \sum \text{subtotalItem}, \qquad \text{igvCarrito} = \text{round}_2(\text{subtotalCarrito} \times 0.18)$$
  $$\text{totalCarrito} = \text{round}_2(\text{subtotalCarrito} + \text{igvCarrito})$$
- **Regla de Solicitud sin Cobro al Trabajador:** Al solicitar un encargo con `metodoPago = 'SIN_COBRO_SOLICITUD'`, el cobro inicial es estrictamente `S/ 0.00` (`subtotalTecnico = 0`, `garantiaTotal = 0`, `igv = 0`, `total = 0`), conservando `montoReferencial = sum(precioBase * cantidadTurnos)`.
- **Regla de Liberación Escrow:** Los fondos en custodia (`fondosLiberados = false`) se liberan **únicamente** cuando:
  1. El cliente otorga conformidad expresa (`darConformidadYLiberarFondos`), o
  2. El cliente califica una orden en estado `COMPLETADO_PENDIENTE_CONFORMIDAD` (`calificarOrden`), o
  3. El administrador resuelve una garantía a favor de liberación (`resolverGarantiaAdmin(..., 'LIBERAR')`).
- **Tarifa Fija de Publicación de Imprevisto:** Publicar una emergencia en `ImprevistosView` tiene un costo único de **`S/ 5.00`** (`PRECIO_PUBLICACION_IMPREVISTO = 5.0`), pagadero vía Culqi (`TARJETA` o `YAPE_PLIN`).

### I3. Privacidad y Control de Acceso a Documentación Sensible
- Los archivos privados de identidad y cumplimiento (`dniFotoUrl`, `fotoPersonaUrl`, `videoPersonaUrl`, `certificadoOpcionalUrl`, `comprobanteDomicilioUrl`, `fichaRucUrl`, `antecedentes*Url`, `licenciaConducirUrl`, número completo de DNI y RUC) solo son visibles para:
  1. El **propietario autenticado** de la cuenta, y
  2. El **Administrador Único (`ADMIN`)**.
- Ningún visitante anónimo ni otro usuario puede inspeccionar archivos privados de terceros ni acceder al directorio completo de perfiles (`PerfilesView` es exclusivo de `ADMIN`).

### I4. Trazabilidad e Identidad en Comunicación
- El **Chat Directo en Tiempo Real** (`WhatsAppChatModal`, `POST /api/chat/messages`) y la **visualización de teléfono para llamada directa** (`CallModal`) requieren **sesión iniciada** (`currentUser !== null`).
- Un cliente invitado (`GUEST`) puede enviar una solicitud de encargo desde `CarritoView`, la cual queda etiquetada explícitamente como **`Anónimo (No registrado)`** sin DNI, y no puede enviar mensajes de seguimiento en el chat hasta registrarse.

### I5. Seguridad de Pasarela de Pagos (Culqi)
- La clave secreta `CULQI_SECRET_KEY` reside **exclusivamente en el servidor (`server.ts`)** y jamás se expone al cliente.
- El frontend solo consulta `GET /api/payments/culqi/config` para recibir `publicKey` y el modo (`live`, `test` o `sandbox`).
- El monto mínimo procesable en Culqi es `100` céntimos (`S/ 1.00`) en moneda `PEN`.

### I6. Integridad de Moderación y Disponibilidad
- El catálogo público (`serviciosAprobados`) muestra **exclusivamente** anuncios con `estadoPublicacion === 'APROBADO'`.
- Todo anuncio nuevo publicado por un usuario entra en `PENDIENTE_APROBACION`.
- Si un usuario edita un anuncio `RECHAZADO`, su estado vuelve automáticamente a `PENDIENTE_APROBACION` para nueva revisión.
- Solo el técnico asignado a una orden puede aceptar (`ACEPTADA`) o rechazar (`NO_DISPONIBLE`) disponibilidad en `responderDisponibilidadOrden`; si marca `NO_DISPONIBLE`, los `turnosLibres` se restauran automáticamente.

---

## 4. Estándares Técnicos y de Calidad

| Dimensión | Estándar Obligatorio |
| :--- | :--- |
| **Lenguaje y Tipado** | TypeScript estricto (`npm run lint` → `tsc --noEmit` sin errores). |
| **Frontend** | React 19 (componentes funcionales + hooks), Tailwind CSS v4, Lucide Icons, Motion. |
| **Backend** | Node.js ESM (`type: "module"`), Express 4, `ws` WebSocketServer, `nodemailer`, `dotenv`. |
| **Localización** | Idioma español (Perú `es-PE`), moneda Soles (`PEN`, `S/`), prefijo telefónico `+51`, validación de documentos peruanos (`DNI` 8 dígitos, `CE`/`PASAPORTE` 6–15 caracteres, `RUC` 11 dígitos). |
| **Persistencia Segura en Navegador** | Toda escritura a `localStorage` debe ejecutarse mediante `safeLocalStorageSet` y compresión previa de imágenes (`compressImageToDataUrl`) para evitar fallos por cuota. |
| **Diseño Visual** | Paleta institucional Navy (`#0d3b66`, `#001e3d`), Gold/Amber (`#f4d06f`), Success (`#16a34a`), tipografías `Plus Jakarta Sans` y `JetBrains Mono`, diseño 100% responsive (móvil + escritorio). |

---

## 5. Protocolo de Evolución Basado en SDD

Para introducir cualquier cambio en el proyecto, el desarrollador o agente debe ejecutar estrictamente estos 4 pasos:

1. **Actualizar Especificación:** Registrar o modificar el RF/RN y escenario Gherkin en `04-ESPECIFICACIONES-FUNCIONALES-MODULOS.md` (y en `02-MODELO-DE-DATOS-Y-DOMINIO.md` / `03-CONTRATOS-API-Y-EVENTOS.md` si cambian tipos o APIs).
2. **Validar Invariantes:** Verificar cumplimiento contra las invariantes `I1–I6` de esta Constitución.
3. **Implementar y Trazar:** Escribir el código manteniendo el mapeo en `05-PLAN-TECNICO-TAREAS-Y-MATRIZ-VERIFICACION.md`.
4. **Verificar:** Ejecutar `npm run lint` (`tsc --noEmit`), `npm run build` (`vite build`) y comprobar los criterios Gherkin afectados.
