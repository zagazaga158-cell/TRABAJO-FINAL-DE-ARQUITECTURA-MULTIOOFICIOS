# Estilo Arquitectónico — TrabajaYa Perú (`conectaoficios`)

Se adopta el estilo arquitectónico: **Monolito Modular en Capas (Full-Stack Stateless-Ready)**.

## 1. Principios del Estilo Elegido

- **Monolito Modular:** Todos los módulos funcionales (`Identidad/RBAC`, `Cumplimiento/Acreditación`, `Catálogo/Ubigeo`, `Publicaciones/Planes`, `Imprevistos/Ofertas`, `Solicitudes/Escrow`, `Pagos Culqi`, `Chat WS/Notificaciones` y `Administración Nacional`) se empaquetan y despliegan en una única unidad (`server.ts` + SPA `dist/`), eliminando latencia entre servicios y transacciones distribuidas complejas, pero preservando fronteras claras de dominio.
- **Capas Concéntricas (Clean Architecture):** Internamente cada capacidad respeta la separación Presentación → Aplicación → Dominio ← Infraestructura, garantizando alta cohesión interna y bajo acoplamiento.
- **Preparado para Escalado Horizontal:** Aunque se despliega como monolito modular, el contenedor (`Dockerfile`) es replicable detrás de un balanceador de carga **Nginx (`least_conn`)** con estado externo compartido (**PostgreSQL 16 + PgBouncer + Redis 7**) como se configura en `docker-compose.yml` e `infra/nginx.conf`.

---

## 2. Diagrama del Estilo Monolito Modular en Capas

![Arquitectura Monolítica en Capas de TrabajaYa Perú](../../img/ArquitecturaMonoliticaMarketplaceEnCapas.png)

```mermaid
flowchart TB
    CLIENT(["Navegadores Desktop y Móvil\n(25 Regiones del Perú)"])

    subgraph EDGE["Borde y Balanceo"]
        CDN["Cloudflare DNS + CDN + WAF\n(PoP Lima — SSL Full Strict)"]
        NGINX["Nginx Load Balancer\n(least_conn + Gzip + WS Upgrade)"]
    end

    subgraph MONOLITO["Monolito Modular — TrabajaYa Perú (Node.js + Express + WS + React 19 SPA)"]
        subgraph PRES["Capa de Presentación"]
            SPA["SPA React 19 + Vite Code Splitting"]
            GW["REST API (/api/*) + WebSocket (/ws/chat)"]
        end

        subgraph MODS["Módulos de Dominio y Aplicación"]
            M1["Identidad y RBAC"]
            M2["Expediente 5 Bloques"]
            M3["Catálogo y Ubigeo"]
            M4["Publicaciones y Planes"]
            M5["Imprevistos y Ofertas"]
            M6["Escrow y Órdenes"]
            M7["Pagos Culqi"]
            M8["Chat y Despacho 3 Canales"]
        end

        subgraph INFRA["Capa de Infraestructura (Puertos y Adaptadores)"]
            ADP_CACHE["CacheStore (LruTtlCache / Redis)"]
            ADP_DB["Persistencia (.data / PostgreSQL)"]
            ADP_EXT["Adaptadores Culqi / SMTP / WhatsApp"]
        end
    end

    CLIENT --> CDN --> NGINX --> PRES
    PRES --> MODS --> INFRA
```

---

## 3. Comparativa frente a Microservicios

| Criterio | Monolito Modular (Elegido) | Microservicios Distribuidos |
| :--- | :--- | :--- |
| **Consistencia Escrow + Agenda** | Transacción ACID local directa (`FOR UPDATE`). | Requiere Sagas, compensaciones y consistencia eventual. |
| **Latencia entre módulos** | Llamadas en memoria (`< 1 ms`). | Serialización HTTP/gRPC en cada salto. |
| **Complejidad DevOps / CI-CD** | 1 repositorio, 1 `Dockerfile`, 1 pipeline (`ci.yml`/`cd.yml`). | Múltiples repos, service mesh, trazado distribuido. |
| **Ruta de evolución futura** | Cualquier módulo (ej. Pagos o Chat) puede extraerse gracias a las fronteras y puertos ya definidos. | Alto costo fijo desde el día 1. |
