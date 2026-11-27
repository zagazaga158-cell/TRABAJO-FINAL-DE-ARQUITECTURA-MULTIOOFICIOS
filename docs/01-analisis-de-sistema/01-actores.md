# Actores — TrabajaYa Perú (`conectaoficios`)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`) — Plataforma Web Nacional de Servicios Multioficios Certificados con Custodia Fiduciaria (Escrow).  
> **Cobertura:** 25 regiones, 196 provincias y 1,878 distritos del Perú (`src/data/peruUbigeo.ts`).

## 1. Actores Humanos y Sistemas Externos

| Actor | Tipo / Permiso Técnico | ¿Qué necesita realizar en el sistema? |
| :--- | :--- | :--- |
| **Visitante Anónimo** | Humano (`GUEST` — sin sesión) | Explorar el catálogo nacional aprobado de **14 oficios en 4 grupos**, filtrar por Ubigeo (Región → Provincia → Distrito), consultar fichas detalladas (`ServiceDetailModal`) y perfiles públicos (sin archivos privados), revisar el tablero de imprevistos y enviar una solicitud de servicio sin cobro (`S/ 0.00`, registrada como `Anónimo (No registrado)`). Está bloqueado en Chat Directo y llamadas telefónicas hasta registrarse. |
| **Cliente del Hogar** | Humano (`USUARIO` · `CLIENTE_HOGAR`) | Buscar especialistas acreditados (SENATI, SENCICO, CAPECO), agendar visitas domiciliarias con fecha/hora exacta y coordenadas GPS de Google Maps, publicar **Imprevistos del Hogar** (`S/ 5.00` vía Culqi) con hasta 4 fotos, comparar y adjudicar cotizaciones, chatear en tiempo real por WebSocket (`/ws/chat`), pagar órdenes en custodia (Escrow con garantía del 10%), otorgar conformidad para liberar fondos o reportar garantía, imprimir comprobantes y calificar (1–5★ + puntualidad, calidad y limpieza). |
| **Profesional / Ofertante de Oficio** | Humano (`USUARIO` · `OFERTANTE_OFICIO`) | Registrarse con documento peruano (`DNI`, `CE` o `Pasaporte`), completar su **Expediente de Cumplimiento Legal de 5 Bloques** (identidad/domicilio/emergencia, RUC/SUNAT, antecedentes PNP/PJ/INPE, certificaciones/licencia MTC, contrato/reglamento/inventario firmado), subir su galería pública de trabajos realizados, publicar anuncios bajo planes comerciales (`PRUEBA_7`, `BASICO`, `DESTACADO`, `PRO`), cotizar imprevistos, recibir solicitudes sin comisión (`S/ 0.00`), aceptar o rechazar disponibilidad horaria, actualizar el avance técnico de la orden y chatear en tiempo real. |
| **Usuario Mixto (Cliente y Ofertante)** | Humano (`USUARIO` · `AMBOS`) | Operar con una única cuenta tanto para contratar servicios/publicar imprevistos del hogar como para ofrecer su oficio, cotizar reparaciones y gestionar anuncios publicados. |
| **Administrador Nacional Único** | Humano (`ADMIN` · `ADM-001`) | Operar la **Consola Nacional de Administración de 7 pestañas** (`publicaciones`, `planes`, `imprevistos`, `usuarios`, `billetera`, `turnos`, `certificados`): moderar anuncios, editar precios/promociones de planes, gestionar la lista blanca de correos permitidos, auditar el expediente privado de 5 bloques en `AdminInspectProfileView`, activar/suspender usuarios, consultar el directorio `PerfilesView`, supervisar conversaciones de chat, revisar el ledger Culqi y resolver reclamos de garantía (`REVISITA` o `LIBERAR`). |
| **Pasarela de Pago (Culqi Perú)** | Sistema Externo (`Checkout v4` + `Charges API v2` / `Sandbox`) | Tokenizar tarjetas (Visa, Mastercard, Amex, Diners) y pagos Yape/Plin en el navegador y ejecutar cargos seguros en Soles (`PEN`, mínimo `S/ 1.00` = `100` céntimos) desde el servidor para planes de anuncios, publicación de imprevistos (`S/ 5.00`) y pagos Escrow de órdenes, manteniendo `CULQI_SECRET_KEY` estrictamente en el backend. |
| **Servicio de Correo Automático (SMTP / Webhook)** | Sistema Externo (`Nodemailer` / `EMAIL_WEBHOOK_URL`) | Enviar automáticamente por correo electrónico los datos completos de cada nueva solicitud de encargo (horario, cliente, dirección y enlace GPS) al especialista asignado, con degradación elegante a cola local y enlaces manuales (`Gmail` / `mailto:`). |
| **Servicio de Mensajería WhatsApp** | Sistema Externo (`Meta WhatsApp Cloud API v20.0` / `WHATSAPP_WEBHOOK_URL` / `wa.me`) | Despachar alertas automáticas de nuevas órdenes al número `+51` del técnico y habilitar la continuación de conversación por WhatsApp Web junto con el Chat Directo in-app. |
| **Servicios de Geolocalización y Mapas** | Sistema Externo (`Browser Geolocation API` + `Google Maps`) | Capturar coordenadas GPS (`lat`, `lng`) del domicilio en `CarritoView` y generar enlaces directos de ubicación en Google Maps para reducir errores de dirección. |

---

## 2. Matriz de Control de Acceso por Actor (RBAC Estricto de 2 Permisos)

| Capacidad | `GUEST` | `USUARIO` (`CLIENTE_HOGAR`) | `USUARIO` (`OFERTANTE_OFICIO` / `AMBOS`) | `ADMIN` (`ADM-001`) |
| :--- | :---: | :---: | :---: | :---: |
| Explorar catálogo `APROBADO` y filtros Ubigeo (25/196/1,878) | Sí | Sí | Sí | Sí |
| Solicitar servicio a domicilio (`S/ 0.00`) con GPS | Sí *(Anónimo)* | Sí | Sí | Sí |
| Chat Directo WebSocket (`/ws/chat`) y ver teléfono en `CallModal` | No (`401`) | Sí | Sí | Sí *(Global)* |
| Editar perfil, Expediente de 5 Bloques y Galería | No | Sí *(Propio)* | Sí *(Propio)* | Sí *(Todos)* |
| Publicar anuncios (`PRUEBA_7` / `BASICO` / `DESTACADO` / `PRO`) | No | Sí *(Si `ACTIVO`)* | Sí *(Si `ACTIVO`)* | Sí |
| Publicar Imprevisto (`S/ 5.00`) y adjudicar oferta propia | No | Sí | Sí | Sí |
| Enviar cotizaciones (`OfertaImprevisto`) en emergencias | No | Activando `AMBOS` | Sí | Sí |
| Aceptar/rechazar disponibilidad y avanzar ejecución de orden | No | Solo si asignado | Exclusivo asignado | Control manual |
| Pagar orden Culqi, dar conformidad, reportar garantía y calificar | No | Sí *(Sus órdenes)* | Sí *(Sus órdenes)* | Sí |
| Consola Admin (7 pestañas), `PerfilesView` y `AdminInspectProfileView` | No | No | No | Sí *(Exclusivo)* |
