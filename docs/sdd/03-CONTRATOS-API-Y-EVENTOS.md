# 03 — Especificación de Contratos API, WebSocket e Integraciones Externas (SDD)

> **Fuentes de Verdad en Código:** `server.ts`, `server/presentation/routes/apiRoutes.ts`, `server/infrastructure/docs/openapi.ts`, `docs/openapi.json`, `src/components/CulqiCheckoutModal.tsx`, `src/context/ConectaContext.tsx`, `src/utils/whatsappSolicitud.ts` y `.env.example`.  
> **Documentación OpenAPI / Swagger Interactiva:** `GET /api-docs` (Swagger UI) y `GET /api/openapi.json` (OpenAPI 3.0.3).  
> **Puerto por defecto:** `PORT=3000` (`http://0.0.0.0:3000`). **Límite de cuerpo JSON:** `2mb`.

---

## 1. Contratos API REST (`server.ts`)

### 1.1 Salud del Servicio

#### `GET /api/health`
Verifica operatividad del servidor HTTP y número de conversaciones cargadas en memoria.
- **Respuesta `200 OK`:**
```json
{
  "ok": true,
  "conversations": 3
}
```

---

### 1.2 Pasarela de Pagos Culqi Perú

#### `GET /api/payments/culqi/config`
Expone únicamente la configuración pública de Culqi (nunca `CULQI_SECRET_KEY`).
- **Regla de modo:**
  - Si `CULQI_PUBLIC_KEY` y `CULQI_SECRET_KEY` existen: `mode = publicKey.startsWith('pk_live_') ? 'live' : 'test'`, `configured = true`.
  - Si faltan: `mode = 'sandbox'`, `configured = false`, `publicKey = null`.
- **Respuesta `200 OK`:**
```json
{
  "configured": false,
  "publicKey": null,
  "mode": "sandbox",
  "currency": "PEN",
  "merchantName": "TrabajaYa Perú"
}
```

#### `GET /api/payments/culqi/transactions`
Retorna el libro histórico de transacciones registradas en `.data/culqi-transactions.json` (máximo 500 recientes). Consumido por la pestaña `billetera` de `TecnicoAdminView`.
- **Respuesta `200 OK`:**
```json
{
  "ok": true,
  "transactions": [
    {
      "id": "CLQ-1794975289100",
      "chargeId": "chr_test_clq_a1b2c3d4",
      "tokenId": "tkn_sandbox_...",
      "authorizationCode": "AUT-CLQ-548291",
      "referenceCode": "REF-CLQ-548291",
      "amountCentimos": 500,
      "amountSoles": 5,
      "currency": "PEN",
      "method": "YAPE_PLIN",
      "concepto": "IMPREVISTO",
      "referenceId": "IMP-NEW",
      "description": "Publicación de imprevisto en TrabajaYa Perú",
      "email": "cliente@gmail.com",
      "customerName": "Dr. Alejandro Palomino",
      "brand": "Yape",
      "last4": "6789",
      "mode": "sandbox",
      "status": "PAID",
      "createdAt": "25/11/2026, 03:05 p. m."
    }
  ]
}
```

#### `POST /api/payments/culqi/charge`
Ejecuta un cargo contra `https://api.culqi.com/v2/charges` (si `CULQI_SECRET_KEY` está configurada y `tokenId` no empieza con `tkn_sandbox_`) o en modo Sandbox auditado.

- **Request Body:**
```json
{
  "tokenId": "tkn_test_xxxxxxxxx",
  "email": "usuario@gmail.com",
  "amountCentimos": 2490,
  "description": "Plan Destacado 180 días - TrabajaYa Perú",
  "method": "TARJETA",
  "concepto": "ANUNCIO",
  "referenceId": "PUB-2026-200",
  "customerName": "Téc. Wilber Mendoza",
  "brand": "Visa",
  "last4": "4242"
}
```
- **Validaciones estrictas (`400 Bad Request`):**
  1. `tokenId` obligatorio.
  2. `email` obligatorio con formato `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`.
  3. `amountCentimos` finito y `>= 100` (mínimo `S/ 1.00`).
  4. `description` truncada a 80 caracteres.
  5. `concepto` normalizado a `'IMPREVISTO' | 'ORDEN_CUSTODIA' | 'ANUNCIO'`.
- **Errores posibles:**
  - `400`: Validación fallida o rechazo de Culqi (`user_message` / `merchant_message`).
  - `502`: Error de red al conectar con `api.culqi.com`.
- **Respuesta `200 OK`:** `{ "ok": true, "transaction": CulqiTransactionRecord }`.

---

### 1.3 Mensajería y Conversaciones de Chat Directo

#### `GET /api/chat/conversations`
Lista conversaciones según el rol y los identificadores del solicitante.
- **Query Params:**
  - `role`: `'ADMIN' | 'USUARIO' | 'GUEST'`
  - `userId`: ID del usuario (`USR-XXX`)
  - `dni`: DNI del usuario
  - `telefono`: teléfono (normalizado removiendo caracteres no numéricos y prefijo `51` si excede 9 dígitos)
- **Reglas de visibilidad:**
  - `role === 'ADMIN'` → devuelve **todas** las conversaciones.
  - `role === 'GUEST'` o sin `userId` → devuelve `{ "conversations": [] }`.
  - `role === 'USUARIO'` → devuelve solo conversaciones donde `userId`, `dni` o `telefono` normalizado coinciden como `cliente*` o `trabajador*`.
- **Respuesta `200 OK`:** `{ "conversations": ServerConversation[] }`.

#### `POST /api/chat/conversations/ensure`
Crea una conversación si no existe o enriquece metadatos faltantes en una existente, persiste en `.data/chat-store.json` y emite evento WebSocket `chat:conversation`.
- **Request Body:**
```json
{
  "conversationId": "ORD:PED-2026-9045:986864822",
  "ordenId": "PED-2026-9045",
  "imprevistoId": null,
  "servicioTitulo": "Instalación de Pozos a Tierra",
  "clienteId": "USR-018",
  "clienteNombre": "Dr. Alejandro Palomino",
  "clienteDni": "28401928",
  "clienteTelefono": "999 456 789",
  "trabajadorId": "USR-002",
  "trabajadorNombre": "Téc. Wilber Mendoza Huayhua",
  "trabajadorDni": "41829304",
  "trabajadorTelefono": "986864822",
  "trabajadorAvatar": "⚡",
  "trabajadorInstitucion": "SENATI",
  "initialSystemText": "🔒 Chat Directo TrabajaYa..."
}
```
- **Regla de anonimato:** Si `clienteId` falta o es `'GUEST'`, se fuerza `clienteId = 'GUEST'`, `clienteNombre = 'Anónimo (No registrado)'`, `clienteDni = undefined`.
- **Validación:** `conversationId` requerido (`400`).
- **Respuesta `200 OK`:** `{ "ok": true, "conversation": ServerConversation }`.

#### `POST /api/chat/messages`
Registra un mensaje con idempotencia por `messageId`, actualiza `updatedAt`, mueve la conversación al tope y emite broadcast WebSocket `chat:message`.
- **Request Body:**
```json
{
  "conversationId": "ORD:PED-2026-9045:986864822",
  "messageId": "msg-1794975289100-ab12c",
  "senderId": "USR-018",
  "senderName": "Dr. Alejandro Palomino",
  "senderRole": "cliente",
  "text": "Hola, confirmo la dirección exacta para las 10:00 hrs."
}
```
- **Validaciones:**
  - `400`: falta `conversationId` o `text`.
  - `401`: `senderId` vacío / `'GUEST'` / `'anon'` y `senderRole !== 'sistema'` (*"Debes registrarte o iniciar sesión para enviar mensajes en el chat."*).
  - `404`: conversación no encontrada o texto vacío tras `trim()`.
- **Idempotencia:** Si ya existe un mensaje con el mismo `messageId` dentro de la conversación, devuelve el mensaje existente sin duplicarlo ni reemitir broadcast.
- **Respuesta `200 OK`:** `{ "ok": true, "message": ServerChatMessage, "conversation": ServerConversation }`.

---

### 1.4 Despacho Automático Multicanal de Órdenes

#### `POST /api/notifications/dispatch-order`
Orquesta en una sola llamada los **3 canales de entrega** hacia cada especialista único incluido en una orden.

- **Request Body:**
```json
{
  "ordenId": "PED-2026-7684",
  "servicioTitulo": "Mantenimiento de Rejas",
  "clienteId": "USR-018",
  "clienteNombre": "Dr. Alejandro Palomino",
  "clienteDni": "28401928",
  "clienteTelefono": "999 456 789",
  "workers": [
    {
      "usuarioId": "USR-007",
      "nombre": "Mtro. Freddy Ccahuana",
      "dni": "43512908",
      "telefono": "965 882 310",
      "email": "freddy.soldadura@gmail.com",
      "avatar": "🔥",
      "institucion": "SENATI",
      "titulo": "Mantenimiento y Reparación de Rejas..."
    }
  ],
  "whatsappMessage": "*NUEVA SOLICITUD DE ENCARGO - TrabajaYa Perú*...",
  "emailSubject": "Nueva Solicitud de Encargo PED-2026-7684...",
  "emailBody": "Hola Mtro. Freddy Ccahuana..."
}
```
- **Validación:** `400` si falta `ordenId` o `workers` no es un arreglo no vacío.
- **Pipeline de 3 pasos en servidor:**
  1. **Chat In-App (Siempre activo e instantáneo):** Crea/asegura la conversación `ORD:${ordenId}:${normalizePhone(w.telefono) || w.nombre}` e inserta el mensaje inicial de sistema + el mensaje idempotente `auto-order-${ordenId}-${normalizePhone(w.telefono)}`, emitiendo broadcast WebSocket.
  2. **Correo Electrónico Automático:**
     - Prioridad 1: `SMTP_USER` + `SMTP_PASS` vía `nodemailer` (`SMTP_HOST` default `smtp.gmail.com`, `SMTP_PORT` default `587`, `secure` automático si puerto `465`).
     - Prioridad 2: `EMAIL_WEBHOOK_URL` vía `POST` JSON.
     - Fallback: `sent: false, queued: true` con detalle instructivo.
  3. **WhatsApp Automático:**
     - Prioridad 1: `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` vía `POST https://graph.facebook.com/v20.0/${waPhoneId}/messages` (prefijo automático `+51`).
     - Prioridad 2: `WHATSAPP_WEBHOOK_URL` vía `POST` JSON.
     - Fallback: `sent: false, queued: true` (el mensaje ya quedó entregado en el Chat in-app).
  4. **Auditoría:** Registra `DispatchLogEntry` en `.data/dispatch-log.json`.
- **Respuesta `200 OK`:**
```json
{
  "ok": true,
  "emailStatus": { "sent": false, "queued": true, "to": ["..."], "detail": "..." },
  "whatsappStatus": { "sent": false, "queued": true, "to": ["..."], "detail": "..." },
  "chatDelivered": true,
  "timestamp": "25/11/2026, 03:10:00 p. m."
}
```

---

## 2. Contrato WebSocket (`/ws/chat`)

- **URL:** `ws(s)://<host>/ws/chat`
- **Reconexión Cliente (`ConectaContext.tsx`):** Reconexión automática cada `2500ms` ante `onclose`; al conectar (`onopen`), sincroniza historial invocando `GET /api/chat/conversations`.

| Dirección | Tipo (`type`) | Payload | Comportamiento |
| :--- | :--- | :--- | :--- |
| Servidor → Cliente | `chat:connected` | `{ type, timestamp }` | Acuse de conexión inicial. |
| Cliente → Servidor | `chat:send` | `{ type, conversationId, messageId?, senderId, senderName, senderRole, text }` | Usado como fallback si `POST /api/chat/messages` falla por red. Persiste y hace broadcast si no es duplicado. |
| Servidor → Todos | `chat:conversation` | `{ type, conversation }` | Notifica creación/actualización de conversación; cada cliente filtra si le corresponde por `ADMIN` o ID/DNI. |
| Servidor → Todos | `chat:message` | `{ type, conversationId, message, conversation }` | Entrega en vivo de nuevos mensajes; el cliente deduplica por `conversation.id` y reordena por `updatedAt` descendente. |

### Convención Determinística de `conversationId`
- **Vinculada a Orden:** `ORD:${ordenId}:${cleanPhone || trabajadorNombre}`
- **Vinculada a Imprevisto:** `IMP:${imprevistoId}:${cleanPhone || trabajadorNombre}`
- **Consulta Directa de Servicio:** `SRV:${cleanPhone || trabajadorNombre}:${clientKey}`

---

## 3. Contratos de Integraciones Externas en Cliente

| Integración | Componente / Utilidad | Contrato |
| :--- | :--- | :--- |
| **Culqi Checkout v4 SDK** | `CulqiCheckoutModal.tsx` | Carga dinámica de `https://checkout.culqi.com/js/v4`. Configura `window.Culqi.publicKey`, `settings({ title, currency: 'PEN', amount: amountCentimos })`, `options({ lang: 'es', paymentMethods: { tarjeta: true, yape: true } })` y callback global `window.culqi()`. |
| **Geolocalización GPS** | `CarritoView.tsx` | `navigator.geolocation.getCurrentPosition(..., { enableHighAccuracy: true, timeout: 8000 })` → almacena `{ lat, lng }` y genera `https://www.google.com/maps?q=lat,lng`. |
| **Google Maps Search** | `whatsappSolicitud.ts` | `buildOrdenMapsUrl(orden)`: prioriza `enlaceMapa`, luego `coordenadas`, o construye `https://www.google.com/maps/search/?api=1&query=...`. |
| **WhatsApp Web / App** | `whatsappSolicitud.ts` | `buildWhatsAppUrl(telefono, mensaje)` → `https://wa.me/51<9digitos>?text=<encoded>`. |
| **Correo Manual** | `whatsappSolicitud.ts` | `buildMailtoUrl(email, subject, body)` y `buildGmailComposeUrl(email, subject, body)`. |
| **Marcador Telefónico** | `CallModal.tsx` | Enlace nativo `tel:+51<digitos>` (solo disponible con sesión iniciada). |

---

## 4. Variables de Entorno (`.env.example`)

| Variable | Obligatoria | Uso |
| :--- | :---: | :--- |
| `PORT` | No (default `3000`) | Puerto de escucha HTTP + WebSocket en `server.ts`. |
| `NODE_ENV` | No | `production` sirve estáticos desde `dist/`; otro valor monta `vite.middlewares`. |
| `DISABLE_HMR` | No | Si es `'true'`, desactiva HMR y file watching de Vite (`vite.config.ts`). |
| `CULQI_PUBLIC_KEY` | Opcional (live/test) | Clave pública (`pk_test_*` o `pk_live_*`) enviada al cliente para Culqi Checkout v4. |
| `CULQI_SECRET_KEY` | Opcional (live/test) | Clave secreta (`sk_test_*` o `sk_live_*`) usada **solo en servidor** para `POST /v2/charges`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Opcional | Credenciales SMTP para envío automático con Nodemailer. |
| `EMAIL_WEBHOOK_URL` | Opcional | Webhook alternativo para envío de correos (ej. Resend/Make). |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` | Opcional | Credenciales Meta WhatsApp Cloud API v20.0. |
| `WHATSAPP_WEBHOOK_URL` | Opcional | Webhook alternativo para notificaciones WhatsApp. |
| `GEMINI_API_KEY`, `APP_URL` | Preparadas | Reservadas para funciones futuras de IA del lado del servidor y URL pública de despliegue. |
