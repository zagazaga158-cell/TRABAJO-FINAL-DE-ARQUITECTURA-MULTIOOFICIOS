# Enfoque Arquitectónico — TrabajaYa Perú (`conectaoficios`)

Se utiliza el enfoque **Clean Architecture (Arquitectura Limpia)** complementado con **Spec-Driven Development (SDD)** para separar las reglas esenciales del negocio de servicios multioficios de los detalles de implementación tecnológica.

## 1. Resumen del Enfoque

| Elemento | Descripción aplicada a TrabajaYa Perú (`conectaoficios`) |
| :--- | :--- |
| **Patrón / Enfoque Arquitectónico** | **Clean Architecture** (Robert C. Martin) + **Domain Escrow Pattern** + **SDD** (`docs/sdd/`). |
| **Objetivo** | Aislar las invariantes de negocio (tarifa cliente = `precioBase + 10%` garantía, IGV 18%, máquina de estados Escrow de 6 estados, RBAC estricto de 2 permisos con Admin único, validación de DNI/CE/Pasaporte y privacidad Ley N.º 29733) dirigiendo todas las dependencias hacia el Dominio central. |
| **¿Qué problema resuelve?** | Evita el acoplamiento directo entre la interfaz **React 19 + Tailwind CSS v4**, los endpoints **Express/WebSocket (`server.ts`)**, la persistencia (`localStorage`/`.data/*.json` → **PostgreSQL 16 + Redis 7**) y las pasarelas externas (**Culqi Perú**, **SMTP Nodemailer**, **Meta WhatsApp Cloud API**). |
| **Capas Definidas** | **1. Dominio (Core)** · **2. Aplicación (Casos de Uso)** · **3. Infraestructura (Adaptadores)** · **4. Presentación (UI React 19 / HTTP-WS)**. |
| **Beneficios Comprobados** | • Las reglas de negocio y el motor de caché se prueban al 100% sin navegador (`npm test` → **36/36** aprobadas en `< 1 s`).<br>• Permite conmutar entre **Culqi API v2** y **Sandbox**, o entre **`LruTtlCache`** y **Redis 7**, sin modificar reglas de negocio.<br>• Facilita incorporar nuevos oficios, planes comerciales o integraciones IA (`@google/genai`) sin regresiones. |

---

## 2. Diagrama de Capas Concéntricas (Clean Architecture)

![Clean Architecture de TrabajaYa Perú](../../img/ArquitecturalimpiadelMarketplaceWeb.png)

```mermaid
flowchart TB
    subgraph L4["Capa 4 — Presentación (UI React 19 + Controladores HTTP/WS)"]
        UI["24 Componentes Activos React 19 + Tailwind v4\n(Catalogo, Imprevistos, Carrito, Ordenes, Perfil, Consola Admin)"]
        CTRL["Rutas Express (/api/*) + WebSocket (/ws/chat)\nRate Limiter L7 + Cabeceras de Seguridad"]
    end

    subgraph L3["Capa 3 — Infraestructura (Adaptadores Externos y Persistencia)"]
        CULQI["Culqi Gateway Adapter\n(Checkout v4 + Charges API v2 + Sandbox)"]
        NOTIF["Dispatch Adapters\n(SMTP Nodemailer + Meta WhatsApp Cloud API v20)"]
        CACHE["Cache Adapter\n(server/cache.ts LruTtlCache -> Redis 7)"]
        PERS["Persistencia\n(.data/*.json + localStorage -> PostgreSQL 16 + PgBouncer + S3)"]
    end

    subgraph L2["Capa 2 — Aplicación (Casos de Uso y Orquestación)"]
        UC["ConectaContext.tsx (45+ Casos de Uso) +\nOrquestación Backend (dispatch-order, upsertConversation, appendMessage)"]
    end

    subgraph L1["Capa 1 — Dominio (Core Puro sin Dependencias Externas)"]
        DOM["src/types/index.ts + src/domain/businessRules.ts\n17 Entidades · 4 Grupos / 14 Oficios · Máquina de Estados Escrow\nValidadores Perú · Invariantes Financieras · Privacidad Ley 29733"]
    end

    L4 --> L2
    L3 --> L1
    L2 --> L1
    L4 -. "Composición" .-> L3
```
