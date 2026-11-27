# Paso 2 — Análisis y Diseño del Sistema (UML, Flujos y Dominio Completo)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`) — Plataforma Web Nacional de Servicios Multioficios Certificados con Custodia Fiduciaria (Escrow).  
> **Notación Estándar:** UML 2.5 (Casos de Uso, Clases de Dominio, Secuencia, Estados y Actividad/Navegación) + Modelo Entidad-Relación (ER).  
> **Cobertura:** 100% de los módulos, entidades, pantallas, modales y algoritmos implementados en el programa.

---

## 1. Análisis de Casos de Uso del Sistema

### 1.1 Diagrama General de Casos de Uso (Actores vs. 24 Casos de Uso)

```mermaid
flowchart LR
    GUEST(["Visitante\n(GUEST)"])
    CLI(["Cliente Hogar\n(USUARIO)"])
    OFE(["Técnico Ofertante\n(USUARIO)"])
    ADM(["Administrador Único\n(ADM-001)"])
    EXT(["Sistemas Externos\nCulqi / SMTP / WA / Maps"])

    subgraph Sistema["Sistema TrabajaYa Perú (conectaoficios)"]
        subgraph M_AUTH["Acceso y Cumplimiento"]
            CU01["CU-01: Registrarse e Iniciar Sesión"]
            CU02["CU-02: Gestionar Perfil y Galería"]
            CU03["CU-03: Completar Expediente 5 Bloques"]
            CU04["CU-04: Auditar Perfil y Documentos"]
        end

        subgraph M_CAT["Catálogo y Anuncios"]
            CU05["CU-05: Explorar Catálogo y Ubigeo"]
            CU06["CU-06: Ver Detalle y Perfil Público"]
            CU07["CU-07: Publicar Anuncio + Plan Culqi"]
            CU08["CU-08: Editar Anuncio Propio"]
            CU09["CU-09: Moderar Anuncios y Planes"]
        end

        subgraph M_IMP["Imprevistos del Hogar"]
            CU10["CU-10: Publicar Imprevisto (S/ 5.00)"]
            CU11["CU-11: Enviar Cotización de Reparación"]
            CU12["CU-12: Adjudicar Oferta a Orden Escrow"]
        end

        subgraph M_ESC["Solicitudes, Escrow y Pagos"]
            CU13["CU-13: Gestionar Carrito y GPS"]
            CU14["CU-14: Solicitar Servicio (S/ 0.00)"]
            CU15["CU-15: Despacho Automático 3 Canales"]
            CU16["CU-16: Responder Disponibilidad"]
            CU17["CU-17: Actualizar Progreso Técnico"]
            CU18["CU-18: Pagar Orden Escrow con Culqi"]
            CU19["CU-19: Dar Conformidad / Calificar / Imprimir"]
            CU20["CU-20: Reportar y Resolver Garantía"]
        end

        subgraph M_COM["Comunicación y Consola Admin"]
            CU21["CU-21: Chat Directo WebSocket"]
            CU22["CU-22: Llamada Directa (+51)"]
            CU23["CU-23: Supervisar Billetera y Ledger Culqi"]
            CU24["CU-24: Gestionar Turnos, Certificados y Correos"]
        end
    end

    GUEST --> CU01
    GUEST --> CU05
    GUEST --> CU06
    GUEST --> CU13
    GUEST --> CU14

    CLI --> CU01
    CLI --> CU02
    CLI --> CU05
    CLI --> CU06
    CLI --> CU10
    CLI --> CU12
    CLI --> CU13
    CLI --> CU14
    CLI --> CU18
    CLI --> CU19
    CLI --> CU20
    CLI --> CU21
    CLI --> CU22

    OFE --> CU01
    OFE --> CU02
    OFE --> CU03
    OFE --> CU07
    OFE --> CU08
    OFE --> CU11
    OFE --> CU16
    OFE --> CU17
    OFE --> CU21
    OFE --> CU22

    ADM --> CU04
    ADM --> CU09
    ADM --> CU20
    ADM --> CU21
    ADM --> CU23
    ADM --> CU24

    CU07 --> EXT
    CU10 --> EXT
    CU13 --> EXT
    CU15 --> EXT
    CU18 --> EXT
    CU14 -. "include" .-> CU15
    CU12 -. "include" .-> CU15
```

### 1.2 Especificación Detallada de Casos de Uso Críticos

| ID y Nombre | Actor Principal | Precondiciones | Flujo Principal Resumido | Flujos Alternativos / Excepciones | Postcondiciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CU-01: Registro e Inicio de Sesión** | Visitante (`GUEST`) | Correo pertenece a `correosPermitidos`. | 1. Selecciona `tipoUsuario`, tipo de documento y Ubigeo. 2. Adjunta media/RUC/emergencia opcionales. 3. Valida unicidad de DNI/correo y crea cuenta `USUARIO` (`PENDIENTE`). | A1: Correo fuera de lista blanca → rechazo. A2: Cuenta `SUSPENDIDO` al loguear → acceso denegado. A3: `mediaOnLogin` adjuntada → pasa a `PENDIENTE_REVISION`. | Sesión activa en `conecta_current_user_pe_v2`; carrito `GUEST` migrado al nuevo usuario. |
| **CU-03 / CU-04: Expediente Legal (5 Bloques) y Auditoría** | Ofertante / `ADMIN` | Sesión iniciada. | 1. Usuario completa bloques 1–5 en `ExpedienteCumplimientoSection` (domicilio, RUC, antecedentes 3/3, MTC, contrato/reglamento/inventario). 2. Sistema marca `PENDIENTE_REVISION`. 3. `ADMIN` inspecciona en `AdminInspectProfileView` y aprueba (`VERIFICADO`). | A1: Documento borroso → `ADMIN` marca `OBSERVADO` con motivo o elimina archivo (`eliminarArchivoVerificacionAdmin`). | Expediente auditado; insignias (`Antecedentes 3/3`, `RUC`, `Reglamento`, `Verificado`) visibles en catálogo sin exponer archivos privados. |
| **CU-07 / CU-09: Publicación de Anuncio + Plan Culqi + Moderación** | Ofertante (`ACTIVO`) / `ADMIN` | `estadoCuenta === 'ACTIVO'`. | 1. Llena formulario (`precioBase >= 20`, habilidades, Ubigeo). 2. Elige plan (`PRUEBA_7`, `BASICO`, `DESTACADO`, `PRO`). 3. Paga con `CulqiCheckoutModal` si `precio > 0`. 4. Crea anuncio `PENDIENTE_APROBACION`. 5. `ADMIN` aprueba en pestaña `publicaciones`. | A1: `PRUEBA_7` solo si `0` anuncios previos y promo activa. A2: Rechazo Admin con motivo → autor edita (`editarMiPublicacion`) y reingresa a `PENDIENTE_APROBACION`. | Servicio visible en `CatalogoView` ordenado por prioridad (`PRO > DESTACADO > BASICO > PRUEBA`) y transacción registrada en ledger Culqi. |
| **CU-10 / CU-11 / CU-12: Imprevisto (`S/ 5.00`), Cotizaciones y Adjudicación** | Cliente / Ofertante | Sesión iniciada; pago `S/ 5.00` Culqi. | 1. Cliente publica emergencia con urgencia y hasta 4 fotos pagando `S/ 5.00`. 2. Ofertantes envían cotizaciones (`monto >= S/ 10`). 3. Cliente ordena por estrellas/precio y adjudica ganadora. 4. Sistema genera `Orden` Escrow y despacha 3 canales. | A1: Cliente sin rol ofertante pulsa `habilitarAmbosRoles`. A2: Auto-oferta bloqueada (salvo `ADMIN`). A3: Segunda oferta del mismo técnico reemplaza la anterior. | Imprevisto `ADJUDICADO`, ofertas restantes `DESCARTADA`, `Orden` creada en `EN_CUSTODIA` (`AUT-IMP-*`). |
| **CU-13 / CU-14 / CU-15: Carrito, GPS, Solicitud `S/ 0.00` y Despacho 3 Canales** | Cliente o `GUEST` | Carrito con `>= 1` ítem. | 1. Captura fecha, hora exacta, turno, dirección y GPS (`navigator.geolocation`). 2. Confirma solicitud `SIN_COBRO_SOLICITUD` (`S/ 0.00`). 3. Descuenta `turnosLibres`. 4. Backend ejecuta `POST /api/notifications/dispatch-order` (Chat WS + SMTP + WhatsApp). | A1: `GUEST` → orden marcada `Anónimo (No registrado)` sin DNI. A2: Sin credenciales SMTP/WA → en cola + respaldo manual (`Gmail`, `mailto:`, `wa.me`). | Orden `EN_CUSTODIA` (`SOL-PE-*`), conversación `ORD:*` creada, auditoría en `.data/dispatch-log.json`. |
| **CU-16 a CU-20: Ciclo Escrow, Pago Culqi, Garantía y Calificación** | Técnico / Cliente / `ADMIN` | Orden existente. | 1. Técnico asignado acepta (`ACEPTADA` → `EN_CAMINO`) → `EN_EJECUCION` → `COMPLETADO_PENDIENTE_CONFORMIDAD`. 2. Cliente paga vía Culqi (`ORDEN_CUSTODIA`), otorga conformidad o califica 1–5★ + 3 criterios. 3. Imprime comprobante. | A1: Técnico marca `NO_DISPONIBLE` → devuelve `turnosLibres`. A2: Cliente reporta falla → `OBSERVADO_GARANTIA` → `ADMIN` resuelve `REVISITA` o `LIBERAR`. | `CONFORMIDAD_Y_LIBERADO`, `fondosLiberados = true`, reseña propagada al catálogo y `billeteraTecnico` actualizada. |
| **CU-21 / CU-22: Chat Directo WebSocket y Llamada** | Usuario / `ADMIN` | Sesión iniciada (`currentUser !== null`). | 1. Abre hilo por orden/imprevisto/servicio (`POST /api/chat/conversations/ensure`). 2. Envía mensaje (`POST /api/chat/messages`) con `messageId` único. 3. Servidor guarda y emite broadcast WS `chat:message`. 4. Opcionalmente abre `CallModal` (`tel:+51...`). | A1: `GUEST` → bloqueo UI + `401` backend. A2: Fallo HTTP → fallback por `ws.send({ type: 'chat:send' })`. A3: Caída WS → reconexión cada `2500ms`. | Historial persistido en `.data/chat-store.json` sin mensajes duplicados. |

---

## 2. Diagrama de Clases del Dominio (UML `classDiagram`)

Modela fielmente las entidades de `src/types/index.ts`, `src/context/ConectaContext.tsx` y `server.ts`:

```mermaid
classDiagram
    class UsuarioRegistrado {
        +string id
        +PermisoRol permiso
        +TipoUsuario tipoUsuario
        +EstadoCuentaUsuario estadoCuenta
        +TipoDocumentoIdentidad tipoDocumento
        +string dni
        +string nombreCompleto
        +string email
        +string telefonoWhatsapp
        +string region
        +string provincia
        +string distrito
        +string direccion
        +string rucNumero
        +boolean rucActivo
        +boolean contratoFirmado
        +boolean normasConductaFirmadas
        +boolean inventarioFirmado
        +EstadoVerificacionMedia estadoVerificacionMedia
        +validarDocumento()
        +sincronizarPublicaciones()
    }

    class InventarioHerramientaItem {
        +string id
        +string equipo
        +string codigoSerie
        +number cantidad
        +string estado
        +string origen
    }

    class FotoTrabajoRealizado {
        +string id
        +string imagenUrl
        +string titulo
        +OficioType oficio
        +string ubicacion
        +string fecha
    }

    class Servicio {
        +string id
        +OficioType oficio
        +string titulo
        +string descripcion
        +number precioBase
        +number garantiaMonto
        +number tarifaCliente
        +number turnosLibres
        +number calificacion
        +number numResenas
        +EstadoPublicacion estadoPublicacion
        +string nivelPlan
        +boolean destacado
        +boolean selloVerificadoPro
        +calcularTarifaCliente()
        +actualizarTurnos(delta)
    }

    class PlanPublicacion {
        +PlanPublicacionId id
        +string nombre
        +number duracionDias
        +number precio
        +number precioRegular
        +boolean destacado
        +number nivelPrioridad
        +string[] beneficios
    }

    class PagoPublicacion {
        +string codigoPago
        +string codigoAutorizacion
        +PlanPublicacionId planId
        +number montoPagado
        +MetodoPago metodoPago
        +string culqiChargeId
    }

    class ResenaPublicacion {
        +string ordenId
        +string autorNombre
        +number estrellas
        +string comentario
        +string fecha
    }

    class ImprevistoHogar {
        +string id
        +string autorUsuarioId
        +OficioType oficio
        +string titulo
        +UrgenciaImprevisto urgencia
        +number presupuestoReferencial
        +string[] imagenes
        +EstadoImprevisto estado
        +string ofertaAceptadaId
        +string ordenGeneradaId
        +adjudicarOferta(ofertaId)
    }

    class OfertaImprevisto {
        +string id
        +string imprevistoId
        +string ofertanteUsuarioId
        +number montoOferta
        +string tiempoEstimado
        +number garantiaDias
        +string mensajePropuesta
        +string estado
    }

    class Orden {
        +string id
        +string codigoAutorizacion
        +string clienteUsuarioId
        +number subtotalTecnico
        +number garantiaTotal
        +number igv
        +number total
        +number montoReferencial
        +boolean sinCobroSolicitud
        +EstadoAceptacionTrabajador aceptacionTrabajador
        +EstadoOrden estado
        +MetodoPago metodoPago
        +boolean fondosLiberados
        +responderDisponibilidad(decision)
        +liberarFondos()
        +activarGarantia(motivo)
        +calificar(calificacion)
    }

    class ItemCarrito {
        +string servicioId
        +number cantidadTurnos
        +number subtotal
    }

    class DatosVisita {
        +string clienteNombre
        +string clienteDni
        +string distrito
        +string direccion
        +string fechaVisita
        +string horaVisita
        +string turno
        +string enlaceMapa
    }

    class CalificacionServicio {
        +number estrellas
        +string comentario
        +string fecha
        +number puntualidad
        +number calidad
        +number limpieza
    }

    class CertificadoTecnico {
        +string id
        +string tecnicoNombre
        +string institucion
        +string especialidad
        +string codigoRegistro
        +string estado
        +number horasCapacitacion
    }

    class ServerConversation {
        +string id
        +string ordenId
        +string imprevistoId
        +string clienteId
        +string trabajadorId
        +number updatedAt
    }

    class ServerChatMessage {
        +string id
        +string conversationId
        +string senderId
        +string senderRole
        +string text
        +number createdAt
    }

    class CulqiTransactionRecord {
        +string id
        +string chargeId
        +string tokenId
        +number amountCentimos
        +number amountSoles
        +string method
        +string concepto
        +string mode
        +string status
    }

    UsuarioRegistrado "1" *-- "0..*" InventarioHerramientaItem : declara
    UsuarioRegistrado "1" *-- "0..*" FotoTrabajoRealizado : exhibe
    UsuarioRegistrado "1" --> "0..*" Servicio : publica
    UsuarioRegistrado "1" --> "0..*" ImprevistoHogar : reporta
    UsuarioRegistrado "1" --> "0..*" OfertaImprevisto : cotiza
    UsuarioRegistrado "1" --> "0..*" Orden : solicita

    Servicio "1" *-- "0..1" PagoPublicacion : financiado por
    PlanPublicacion "1" --> "0..*" PagoPublicacion : parametriza
    Servicio "1" *-- "0..*" ResenaPublicacion : acumula

    ImprevistoHogar "1" *-- "0..*" OfertaImprevisto : recibe
    ImprevistoHogar "0..1" --> "0..1" Orden : genera

    Orden "1" *-- "1..*" ItemCarrito : contiene
    ItemCarrito "*" --> "1" Servicio : referencia
    Orden "1" *-- "1" DatosVisita : programa
    Orden "1" *-- "0..1" CalificacionServicio : evalua
    Orden "0..1" --> "0..1" CulqiTransactionRecord : respaldada por

    ServerConversation "1" *-- "0..*" ServerChatMessage : almacena
    Orden "0..1" --> "0..*" ServerConversation : abre chat
```

---

## 3. Diagramas de Secuencia del Sistema (UML `sequenceDiagram`)

### 3.1 Secuencia 1 — Registro, Expediente Legal de 5 Bloques y Auditoría Admin

```mermaid
sequenceDiagram
    actor U as Técnico (Usuario)
    participant AUTH as AuthScreen / PerfilView
    participant EXP as ExpedienteCumplimientoSection
    participant MEDIA as mediaUpload.ts
    participant CTX as ConectaContext
    actor A as Administrador Único (ADM-001)
    participant INSPECT as AdminInspectProfileView

    U->>AUTH: Registra cuenta (DNI/CE, correo permitido, Ubigeo)
    AUTH->>CTX: registrarUsuario(payload)
    CTX->>CTX: Valida documento + lista blanca + unicidad; asigna estadoCuenta = PENDIENTE
    CTX-->>AUTH: { ok: true } + migra carrito GUEST

    U->>EXP: Sube Domicilio, RUC, Antecedentes 3/3, Licencia MTC y firma Contrato/Inventario
    EXP->>MEDIA: compressImageToDataUrl / readCertificateFile / readPersonVideoFile
    MEDIA-->>EXP: DataURL comprimido o ObjectURL seguro
    EXP->>CTX: actualizarExpedienteCumplimiento(data)
    CTX->>CTX: Guarda expediente y cambia estadoVerificacionMedia = PENDIENTE_REVISION

    A->>INSPECT: Abre auditoría del usuario desde TecnicoAdminView
    A->>INSPECT: Verifica archivos privados y activa cuenta
    INSPECT->>CTX: cambiarEstadoCuentaUsuario(id, ACTIVO)
    INSPECT->>CTX: gestionarVerificacionUsuarioAdmin(id, VERIFICADO)
    CTX-->>U: Cuenta ACTIVA y VERIFICADA (habilitada para publicar anuncios)
```

### 3.2 Secuencia 2 — Publicación de Anuncio con Plan Comercial, Culqi y Moderación

```mermaid
sequenceDiagram
    actor T as Técnico (ACTIVO)
    participant PUB as PublicarAnuncioView
    participant CULQI as CulqiCheckoutModal
    participant SRV as server.ts (/api/payments/culqi/*)
    participant CTX as ConectaContext
    actor A as Administrador Único

    T->>PUB: Completa anuncio (precioBase, oficio, habilidades, Ubigeo) y selecciona Plan
    alt Plan pagado (BASICO / DESTACADO / PRO)
        PUB->>CULQI: Abre pasarela (concepto = ANUNCIO, amountCentimos)
        CULQI->>SRV: GET /api/payments/culqi/config
        SRV-->>CULQI: { configured, publicKey, mode }
        CULQI->>SRV: POST /api/payments/culqi/charge
        SRV->>SRV: Cobra vía Culqi API v2 o Sandbox y guarda culqi-transactions.json
        SRV-->>CULQI: { ok: true, transaction }
        CULQI-->>PUB: onSuccess(receipt)
    else Plan PRUEBA_7 (S/ 0.00 primera vez)
        PUB->>PUB: Omite pasarela (monto = 0)
    end
    PUB->>CTX: publicarAnuncioPagado(payload)
    CTX->>CTX: Calcula garantia 10% + tarifaCliente; estadoPublicacion = PENDIENTE_APROBACION
    A->>CTX: admitirPublicacion(servicioId)
    CTX-->>T: Anuncio APROBADO y visible en CatalogoView según prioridad de plan
```

### 3.3 Secuencia 3 — Imprevisto (`S/ 5.00`), Subasta de Cotizaciones y Adjudicación

```mermaid
sequenceDiagram
    actor C as Cliente Hogar
    actor T1 as Técnico 1
    actor T2 as Técnico 2
    participant IMP as ImprevistosView
    participant CULQI as CulqiCheckoutModal
    participant CTX as ConectaContext
    participant SRV as server.ts

    C->>IMP: Llena emergencia (urgencia, Ubigeo, hasta 4 fotos)
    IMP->>CULQI: Cobra tarifa fija S/ 5.00 (concepto = IMPREVISTO)
    CULQI-->>IMP: Recibo Culqi aprobado
    IMP->>CTX: publicarImprevisto(payload)
    CTX-->>IMP: Imprevisto creado (estado = ABIERTO)

    T1->>CTX: ofrecerServicioImprevisto(impId, S/ 120)
    T2->>CTX: ofrecerServicioImprevisto(impId, S/ 105)
    C->>IMP: Ordena ofertas por calificación o menor precio
    C->>CTX: aceptarOfertaImprevisto(impId, OFR_T2, crearOrdenEscrow = true)
    CTX->>CTX: Imprevisto = ADJUDICADO; OFR_T2 = ACEPTADA; OFR_T1 = DESCARTADA
    CTX->>CTX: Crea Orden Escrow (base + 10% garantía + 18% IGV) en EN_CUSTODIA
    CTX->>SRV: POST /api/notifications/dispatch-order
    SRV-->>T2: Notificación automática en Chat WS + Email + WhatsApp
```

### 3.4 Secuencia 4 — Solicitud (`S/ 0.00`) con GPS, Despacho 3 Canales, Escrow y Calificación

```mermaid
sequenceDiagram
    actor C as Cliente
    participant CART as CarritoView
    participant CTX as ConectaContext
    participant SRV as server.ts
    actor T as Técnico Asignado
    participant ORD as OrdenesView / PedidoDetalleModal

    C->>CART: Captura GPS (navigator.geolocation) y confirma solicitud S/ 0.00
    CART->>CTX: confirmarOrdenYEscrow(datosVisita, SIN_COBRO_SOLICITUD)
    CTX->>CTX: Descuenta turnosLibres; Orden en EN_CUSTODIA (total = 0, montoReferencial)
    CTX->>SRV: POST /api/notifications/dispatch-order
    SRV-->>T: Entrega inmediata en Chat WS + cola/envío SMTP + WhatsApp

    T->>ORD: Abre PedidoDetalleModal y acepta horario
    ORD->>CTX: responderDisponibilidadOrden(ordenId, ACEPTADA)
    CTX->>CTX: Transición automática EN_CUSTODIA -> EN_CAMINO
    T->>CTX: actualizarEstadoOrdenManual(EN_EJECUCION -> COMPLETADO_PENDIENTE_CONFORMIDAD)

    C->>ORD: Paga con Culqi (ORDEN_CUSTODIA) y registra calificación 5★
    ORD->>CTX: pagarOrdenConCulqi(ordenId, receipt)
    ORD->>CTX: calificarOrden(ordenId, calificacion)
    CTX->>CTX: Libera fondos (CONFORMIDAD_Y_LIBERADO), agrega reseña y recalcula promedio
```

### 3.5 Secuencia 5 — Chat Directo en Tiempo Real (REST + WebSocket + Fallback)

```mermaid
sequenceDiagram
    actor U1 as Usuario Emisor
    participant MODAL as WhatsAppChatModal
    participant CTX as ConectaContext
    participant SRV as server.ts (HTTP + WS)
    actor U2 as Destinatario / Admin

    U1->>MODAL: Escribe mensaje y envía
    MODAL->>CTX: enviarMensajeChat(convId, text)
    CTX->>CTX: Genera messageId único (idempotencia)
    CTX->>SRV: POST /api/chat/messages
    alt HTTP OK
        SRV->>SRV: Verifica sesión (!GUEST), deduplica por messageId y guarda chat-store.json
        SRV-->>U1: 200 OK { conversation, message }
        SRV-->>U2: WebSocket broadcast chat:message
    else Error de red HTTP y WS OPEN
        CTX->>SRV: ws.send({ type: "chat:send", messageId, ... })
        SRV->>SRV: Guarda y emite broadcast chat:message
        SRV-->>U2: WebSocket broadcast chat:message
    end
```

---

## 4. Máquinas de Estado del Sistema (`stateDiagram-v2`)

### 4.1 Ciclo de Vida de Publicaciones (`EstadoPublicacion`)
```mermaid
stateDiagram-v2
    [*] --> PENDIENTE_APROBACION : publicarAnuncioPagado()\n(PRUEBA_7 o Culqi aprobado)
    PENDIENTE_APROBACION --> APROBADO : admitirPublicacion()\n[Visible en CatalogoView]
    PENDIENTE_APROBACION --> RECHAZADO : rechazarPublicacion(motivo)
    RECHAZADO --> PENDIENTE_APROBACION : editarMiPublicacion()\n[Limpia motivoRechazo]
    APROBADO --> APROBADO : editarMiPublicacion()\n[Actualiza precios y carrito]
```

### 4.2 Ciclo de Vida de Imprevistos (`EstadoImprevisto`)
```mermaid
stateDiagram-v2
    [*] --> ABIERTO : publicarImprevisto()\n[Pago Culqi S/ 5.00]
    ABIERTO --> ABIERTO : ofrecerServicioImprevisto()\n[Nuevas o actualizadas ofertas]
    ABIERTO --> ADJUDICADO : aceptarOfertaImprevisto()\n[Genera Orden EN_CUSTODIA]
    ABIERTO --> CERRADO : cambiarEstadoImprevistoAdmin(CERRADO)
    ABIERTO --> RETIRADO_ADMIN : cambiarEstadoImprevistoAdmin(RETIRADO_ADMIN)
    CERRADO --> ABIERTO : cambiarEstadoImprevistoAdmin(ABIERTO)
    RETIRADO_ADMIN --> ABIERTO : cambiarEstadoImprevistoAdmin(ABIERTO)
```

### 4.3 Ciclo de Vida de Cuenta y Verificación Documental
```mermaid
stateDiagram-v2
    state "Estado de Cuenta (EstadoCuentaUsuario)" as CTA {
        [*] --> PENDIENTE : registrarUsuario()
        PENDIENTE --> ACTIVO : Admin activa cuenta
        ACTIVO --> SUSPENDIDO : Admin suspende\n(bloquea login; prohibido en ADM-001)
        SUSPENDIDO --> ACTIVO : Admin reactiva cuenta
    }

    state "Verificación Documental (EstadoVerificacionMedia)" as VER {
        [*] --> SIN_ADJUNTOS : Registro sin archivos
        [*] --> PENDIENTE_REVISION : Registro con archivos
        SIN_ADJUNTOS --> PENDIENTE_REVISION : Usuario sube documento/media
        PENDIENTE_REVISION --> VERIFICADO : Admin aprueba verificación
        PENDIENTE_REVISION --> OBSERVADO : Admin observa / borra archivo
        VERIFICADO --> PENDIENTE_REVISION : Usuario reemplaza documento
        OBSERVADO --> PENDIENTE_REVISION : Usuario subsana archivo
        OBSERVADO --> SIN_ADJUNTOS : Admin borra último archivo
    }
```

*(La Máquina de Estados del Contrato Escrow de 6 estados — `EN_CUSTODIA`, `EN_CAMINO`, `EN_EJECUCION`, `COMPLETADO_PENDIENTE_CONFORMIDAD`, `CONFORMIDAD_Y_LIBERADO`, `OBSERVADO_GARANTIA` — está especificada en detalle en `docs/sdd/01-ARQUITECTURA-Y-DISENO-SDD.md`.)*

---

## 5. Diseño de Navegación y Arquitectura de Información (10 Vistas + Modales)

```mermaid
flowchart TB
    SHELL["AppShell (Sidebar + Header + Footer + Toast)"]

    subgraph Publicas["Vistas Públicas (GUEST / USUARIO / ADMIN)"]
        V_CAT["catalogo\n(CatalogoView)"]
        V_IMP["imprevistos\n(ImprevistosView)"]
        V_SOL["solicitud\n(CarritoView)"]
        V_ACC["acceso\n(AuthScreen)"]
    end

    subgraph Autenticadas["Vistas Autenticadas (USUARIO / ADMIN)"]
        V_PUB["publicar\n(PublicarAnuncioView)"]
        V_ORD["ordenes\n(OrdenesView)"]
        V_PRF["perfil\n(PerfilView +\nExpedienteCumplimientoSection)"]
    end

    subgraph AdminOnly["Vistas Exclusivas ADMIN (ADM-001)"]
        V_POR["portal\n(TecnicoAdminView\n7 Pestañas)"]
        V_PER["perfiles\n(PerfilesView)"]
        V_INS["perfil-inspeccion\n(AdminInspectProfileView +\nExpedienteCumplimientoSection)"]
    end

    subgraph Modales["Modales Globales y Contextuales"]
        M1["ServiceDetailModal"]
        M2["PublicProfileModal"]
        M3["OrdenConfirmadaModal"]
        M4["PedidoDetalleModal"]
        M5["WhatsAppChatModal"]
        M6["CallModal"]
        M7["CulqiCheckoutModal"]
        M8["ArchitectureModal"]
    end

    SHELL --> Publicas
    SHELL --> Autenticadas
    SHELL --> AdminOnly
    SHELL -. "Overlays" .-> Modales

    V_CAT --> M1
    V_CAT --> M2
    V_SOL --> M3
    V_ORD --> M4
    V_ORD --> M7
    V_PUB --> M7
    V_IMP --> M7
    V_POR --> V_INS
```

---

## 6. Diseño de Algoritmos y Motores Críticos del Sistema

### 6.1 Motor de Resolución Geográfica (`inferUbicacionPeru` — 6 Niveles)
Resuelve ubicaciones completas `{ region, provincia, distrito }` sobre el dataset de **25 regiones / 196 provincias / 1,872 distritos** (`src/data/peruUbigeo.ts`):
1. Si los 3 niveles ya vienen informados → retorna directamente.
2. Busca coincidencia en `LEGACY_CITY_MAP` (16 alias históricos como `"lima metropolitana"` o `"trujillo (la libertad)"`).
3. Busca coincidencia exacta de `distrito` en `PERU_UBIGEO` (acotado por `region`/`provincia` si existen).
4. Comprueba si el texto ingresado corresponde al nombre de una `provincia` o `region`.
5. Si existe `region` válida, asigna su primera provincia y primer distrito.
6. Fallback determinístico seguro: `{ region: 'Lima', provincia: 'Lima', distrito: raw || 'Miraflores' }`.

### 6.2 Algoritmo de Priorización Comercial del Catálogo (`CatalogoView.tsx`)
1. Filtra estrictamente `s.estadoPublicacion === 'APROBADO'`.
2. Aplica filtros reactivos acumulativos: búsqueda de texto (título, descripción, oficio, técnico, habilidades, distrito) + `filtroOficio` + `filtroRegion` + `filtroProvincia` + `filtroDistrito`.
3. Asigna peso comercial por plan: `PRO = 3`, `DESTACADO = 2`, `BASICO = 1`, `PRUEBA = 0`.
4. Ordena por `(pesoPlan desc, calificacion desc)`.

### 6.3 Motor Financiero Escrow y Billetera (`ConectaContext.tsx`)
- **Tarifa por Servicio:** `garantia = round2(precioBase * 0.10)`, `tarifaCliente = round2(precioBase + garantia)`.
- **Carrito / Contrato:** `subtotal = sum(cantidad * tarifaCliente)`, `igv = round2(subtotal * 0.18)`, `total = round2(subtotal + igv)`.
- **Conversión de Solicitud `S/ 0.00` a Pago Culqi (`pagarOrdenConCulqi`):**
  - Si la orden tenía `subtotalTecnico === 0`, calcula inversamente: `subtotalTecnico = round2(montoPagado / 1.1)` y `garantiaTotal = round2(montoPagado - subtotalTecnico)`.
- **Consolidación de `billeteraTecnico`:**
  - `fondosLiberados` = $\sum (\text{subtotalTecnico} - \text{garantiaTotal})$ donde `estado === 'CONFORMIDAD_Y_LIBERADO'`.
  - `fondosEnCustodia` = $\sum \text{subtotalTecnico}$ donde `estado !== 'CONFORMIDAD_Y_LIBERADO'`.
  - `fondoGarantia` = $\sum \text{garantiaTotal}$ de todas las órdenes.
  - `ingresosPublicaciones` = $\sum \text{pagoPublicacion.montoPagado}$ de servicios.
  - `ingresosImprevistos` = $\sum \text{pagoPublicacion.montoPagado}$ de imprevistos.

### 6.4 Propagación de Identidad y Reputación
- **`sincronizarPublicacionesConUsuario`:** Cada edición en `PerfilView` o `TecnicoAdminView` propaga instantáneamente nombre, DNI, teléfono, correo, Ubigeo y foto a todos los `servicios`, `carritosPorUsuario`, `selectedServiceForModal`, `imprevistos` y `ofertas` asociados al usuario.
- **`calificarOrden`:** Inserta o actualiza `ResenaPublicacion` por `ordenId` en todos los servicios coincidentes del técnico y recalcula el promedio ponderado acotado al intervalo `[1, 5]`.
