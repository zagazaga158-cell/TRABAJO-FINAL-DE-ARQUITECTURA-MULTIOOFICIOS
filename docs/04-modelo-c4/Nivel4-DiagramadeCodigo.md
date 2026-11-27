# Nivel 4 · Diagrama de Código (C4)

> **Proyecto:** TrabajaYa Perú (`conectaoficios`) · **Módulos Detallados:** Dominio Escrow, Pagos Culqi, Caché LRU/TTL y Despacho Multicanal  
> **Modelo:** C4 · Nivel 4 de 4 · **Notación:** UML (`classDiagram` y `sequenceDiagram`) · **Versión:** 2.0

---

## 1. Objetivo

Mostrar el diseño a nivel de **clases, interfaces, funciones puras y secuencias reales del código fuente** en los módulos más críticos de **TrabajaYa Perú**: reglas de dominio (`src/domain/businessRules.ts`), caché (`server/cache.ts`) y orquestación HTTP/WebSocket (`server.ts`).

| Aspecto | Descripción |
| :--- | :--- |
| Pregunta que responde | ¿Qué interfaces, clases, funciones y flujos exactos existen en el código fuente? |
| Nivel anterior | `Nivel3-Diagrama-de-Componentes.md` |
| Verificación automatizada | `tests/unit/*.test.ts` (27 tests) + `tests/integration/server.api.test.ts` (9 tests) |

---

## 2. Diagrama de Clases e Interfaces Reales (UML `classDiagram`)

![Diagrama de Clases C4 Nivel 4](../../img/nivel4-clases.png)

```mermaid
classDiagram
    class CacheStore {
        <<interface>>
        +get(key: string) CacheEntry
        +set(key: string, value: T, ttlMs: number) CacheEntry
        +del(key: string) boolean
        +invalidateByPrefix(prefix: string) number
        +clear() void
        +stats() CacheStats
    }

    class LruTtlCache {
        -store: Map~string, CacheEntry~
        -maxEntries: number
        -hits: number
        -misses: number
        -invalidations: number
        -evictions: number
        -computeEtag(value) string
        +get(key: string) CacheEntry
        +set(key: string, value: T, ttlMs: number) CacheEntry
        +del(key: string) boolean
        +invalidateByPrefix(prefix: string) number
        +stats() CacheStats
    }

    class DomainBusinessRules {
        <<module>>
        +IGV_PERU_RATE: 0.18
        +GARANTIA_ESCROW_RATE: 0.10
        +validarNumeroDocumento(valor, tipo)
        +esCorreoPermitidoEnLista(email, lista)
        +calcularTarifaServicio(precioBase)
        +calcularResumenCarrito(items)
        +calcularDesgloseCulqiOrden(montoPagado)
        +calcularBilletera(ordenes, servicios, imprevistos)
        +ordenarCatalogoAprobado(servicios)
        +puedeVerMediosPrivados(currentUser, targetId)
        +esTransicionEscrowValida(actual, siguiente)
    }

    class ServerAppFactory {
        <<server.ts>>
        +createAppServer(options)
        +upsertConversation(payload) ServerConversation
        +appendMessage(input) MessageResult
        +appendCulqiTransaction(tx) void
        +appendDispatchLog(entry) void
    }

    class Orden {
        +id: string
        +codigoAutorizacion: string
        +subtotalTecnico: number
        +garantiaTotal: number
        +igv: number
        +total: number
        +sinCobroSolicitud: boolean
        +aceptacionTrabajador: EstadoAceptacionTrabajador
        +estado: EstadoOrden
        +fondosLiberados: boolean
    }

    class CulqiTransactionRecord {
        +id: string
        +chargeId: string
        +tokenId: string
        +authorizationCode: string
        +amountCentimos: number
        +amountSoles: number
        +currency: PEN
        +method: TARJETA | YAPE_PLIN
        +concepto: IMPREVISTO | ANUNCIO | ORDEN_CUSTODIA
        +mode: live | test | sandbox
        +status: PAID | FAILED
    }

    class ServerConversation {
        +id: string
        +ordenId: string
        +clienteId: string
        +trabajadorId: string
        +updatedAt: number
        +messages: ServerChatMessage[]
    }

    class ServerChatMessage {
        +id: string
        +conversationId: string
        +senderId: string
        +senderRole: cliente | trabajador | sistema
        +text: string
        +createdAt: number
    }

    CacheStore <|.. LruTtlCache : implements
    ServerAppFactory --> CacheStore : usa puerto
    ServerAppFactory --> CulqiTransactionRecord : persiste
    ServerAppFactory --> ServerConversation : gestiona
    ServerConversation "1" *-- "0..*" ServerChatMessage : contiene
    DomainBusinessRules ..> Orden : valida y calcula
```

---

## 3. Inventario de Clases y Módulos Clave en el Código

| Elemento | Archivo | Capa | Responsabilidad Exacta |
| :--- | :--- | :--- | :--- |
| `DomainBusinessRules` | `src/domain/businessRules.ts` | Dominio | Funciones puras de Escrow (+10%), IGV (18%), desglose Culqi, Billetera, validadores DNI/CE/Pasaporte, privacidad Ley N.º 29733 y FSM de 6 estados. |
| `UsuarioRegistrado`, `Servicio`, `ImprevistoHogar`, `Orden` | `src/types/index.ts` | Dominio | Entidades tipadas + taxonomía `GRUPOS_OFICIO` (4) y `CATEGORIAS_OFICIO` (14). |
| `CacheStore` / `LruTtlCache` | `server/cache.ts` | Dominio / Infraestructura | Puerto de caché y motor O(1) con LRU, TTL, `ETag` SHA-1 e invalidación por prefijo. |
| `createAppServer(options)` | `server.ts` | Composición / Presentación | Instancia Express, Rate Limiter, cabeceras de seguridad, `LruTtlCache`, rutas `/api/*`, `WebSocketServer /ws/chat` y host SPA opcional. |
| `ConectaProvider` / `useConecta()` | `src/context/ConectaContext.tsx` | Aplicación | Orquesta los 45+ casos de uso de UI, sincronización `localStorage`, reconexión WebSocket y métricas reactivas. |
| `CulqiCheckoutModal` | `src/components/CulqiCheckoutModal.tsx` | Presentación / Adaptador | Carga dinámica de `https://checkout.culqi.com/js/v4` + formulario Sandbox Tarjeta/Yape y ejecución contra `POST /api/payments/culqi/charge`. |
| `sp_reservar_turno_atomico` | `database/02_indexes_and_scalability.sql` | Infraestructura SQL | Procedimiento PL/pgSQL con `SELECT ... FOR UPDATE` para evitar doble reserva simultánea de `turnos_libres`. |

---

## 4. Diagrama de Secuencia a Nivel de Código: Cobro Culqi + Invalidación de Caché + ETag 304

![Diagrama de Secuencia C4 Nivel 4](../../img/nivel4-secuencia.png)

```mermaid
sequenceDiagram
    actor U as Usuario Autenticado
    participant MODAL as CulqiCheckoutModal.tsx
    participant ROUTE as server.ts (/api/payments/culqi/*)
    participant CACHE as LruTtlCache (server/cache.ts)
    participant CULQI as api.culqi.com/v2/charges
    participant FS as .data/culqi-transactions.json

    U->>MODAL: Abre pasarela (Imprevisto S/ 5, Plan u Orden)
    MODAL->>ROUTE: GET /api/payments/culqi/config
    ROUTE->>CACHE: get("culqi:config")
    alt Cache HIT + If-None-Match coincide
        ROUTE-->>MODAL: 304 Not Modified (X-Cache: HIT)
    else Cache MISS
        ROUTE->>CACHE: set("culqi:config", cfg, 60000)
        ROUTE-->>MODAL: 200 OK (X-Cache: MISS, ETag)
    end

    U->>MODAL: Confirma Tarjeta o Yape (genera tokenId)
    MODAL->>ROUTE: POST /api/payments/culqi/charge
    ROUTE->>ROUTE: Valida tokenId, email regex y amountCentimos >= 100
    alt CULQI_SECRET_KEY configurada y token real
        ROUTE->>CULQI: POST /v2/charges (Bearer CULQI_SECRET_KEY)
        CULQI-->>ROUTE: 201 Charge Approved
    else Modo Sandbox
        ROUTE->>ROUTE: Genera CulqiTransactionRecord (chr_test_clq_*)
    end
    ROUTE->>FS: appendCulqiTransaction(tx) [max 500]
    ROUTE->>CACHE: del("culqi:transactions")
    ROUTE-->>MODAL: 200 OK { ok: true, transaction }
```

---

## 5. Patrones y Principios Visibles en este Nivel

- **Port & Adapter + LSP:** `LruTtlCache` implementa `CacheStore`, dejando lista la sustitución por `RedisCacheStore` sin alterar los controladores de `server.ts`.
- **Single Responsibility + Pure Domain:** `src/domain/businessRules.ts` concentra las fórmulas financieras y validadores peruanos sin depender de React ni Express, permitiendo **27 pruebas unitarias en milisegundos**.
- **Idempotency & Graceful Degradation:** `appendMessage` valida duplicados por `messageId` y `dispatch-order` asegura entrega en Chat in-app aunque SMTP o WhatsApp API estén sin configurar.
