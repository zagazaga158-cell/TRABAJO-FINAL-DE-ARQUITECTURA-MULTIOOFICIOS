# INFORME FINAL — ARQUITECTURA DE SOFTWARE

---

## PORTADA

- **Universidad / Institución:** Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
- **Facultad / Escuela Profesional:** Ingeniería de Minas, Geología y Civil — Escuela Profesional de Ingeniería de Sistemas
- **Asignatura:** IS-488 Arquitectura de Software
- **Título del Proyecto:** **Diseño, Implementación y Escalabilidad de la Plataforma Web Nacional de Servicios Multioficios Certificados con Custodia Fiduciaria (Escrow) — TrabajaYa Perú (`conectaoficios`)**
- **Docente:** `[Completar nombre del Docente]`
- **Autor / Integrante:** Carlos Rodrigo Zaga Huayllasco
- **Ciudad y Fecha:** Ayacucho, Perú — Noviembre de 2026

---

## RESUMEN EJECUTIVO

El presente informe documenta integralmente la concepción, análisis, arquitectura, desarrollo basado en especificaciones (**SDD**), verificación automatizada y diseño de escalabilidad de **TrabajaYa Perú (`conectaoficios`)**, una plataforma web full-stack de alcance nacional diseñada para formalizar y asegurar la contratación de servicios multioficios a domicilio en las **25 regiones, 196 provincias y 1,878 distritos del Perú**.

La plataforma resuelve las principales brechas del mercado peruano —informalidad, falta de verificación legal/antecedentes, estafas por pagos adelantados, comisiones abusivas y ausencia de trazabilidad— combinando una arquitectura de **Monolito Modular bajo Clean Architecture** (React 19, TypeScript, Tailwind CSS v4, Vite 8, Node.js, Express y WebSocket) con:
1. **Control de Acceso Estricto (RBAC de 2 roles):** `USUARIO` (`CLIENTE_HOGAR`, `OFERTANTE_OFICIO`, `AMBOS`) y un único Administrador Nacional (`ADM-001`), más política dinámica de correos permitidos.
2. **Expediente de Cumplimiento Legal de 5 Bloques (Ley N.º 29733):** identidad/domicilio/emergencia, RUC/SUNAT, antecedentes 3/3 (PNP, PJ, INPE), certificaciones técnicas (SENATI, SENCICO, CAPECO) + licencia MTC, y acuerdos firmados (contrato, normas de conducta e inventario de herramientas/EPP).
3. **Catálogo Nacional de 14 Oficios en 4 Grupos** con moderación administrativa y planes comerciales (`PRUEBA_7`, `BASICO`, `DESTACADO`, `PRO`).
4. **Tablero de Imprevistos del Hogar (`S/ 5.00`)** con subasta competitiva de cotizaciones y adjudicación automática hacia órdenes Escrow.
5. **Modelo Justo de Contratación (`S/ 0.00` en solicitud) + Custodia Fiduciaria (Escrow con Garantía del 10%) + Pasarela Culqi Perú (`PEN`)** y despacho automático en 3 canales (Chat WebSocket + Correo SMTP/Webhook + WhatsApp Cloud API/Webhook) con geolocalización GPS.

Todas las propiedades arquitectónicas fueron validadas mediante evidencia real y reproducible: **`44/44`** pruebas unitarias e integración con **Jest + Supertest** (**`96.53%`** cobertura de sentencias/líneas y **`97.18%`** en funciones), **`6/6`** pruebas End-to-End en Chromium (Playwright), **`0`** errores TypeScript (`tsc --noEmit`), documentación viva **OpenAPI 3.0.3 / Swagger UI (`/api-docs`)**, colección **Postman**, build dividido con code splitting en **`554 ms`** (diferiendo `> 382 kB` crudos), motor de caché LRU/TTL con **`99.98%` de Cache Hit Ratio** y simulación progresiva de carga hasta **2,000 usuarios virtuales concurrentes** alcanzando **`7,961.2 req/s`**, **`p95 = 279.10 ms`** y **`0.29%`** de error (`0%` error y `p95 = 48.17 ms` a 100 VUs).

---

## TABLA DE CONTENIDOS Y TRAZABILIDAD DE CAPÍTULOS

| Capítulo | Tema del Sílabo | Entregable Técnico Detallado |
| :---: | :--- | :--- |
| **I** | Identificación del problema y requerimientos (`42 RF`, `16 RNF`, `15 RN`) | [`01-IDENTIFICACION-PROBLEMA-Y-REQUERIMIENTOS.md`](./01-IDENTIFICACION-PROBLEMA-Y-REQUERIMIENTOS.md) |
| **II** | Análisis y diseño del sistema (24 Casos de Uso, UML, 5 Secuencias, 3 Máquinas de Estado) | [`02-ANALISIS-Y-DISENO-DEL-SISTEMA.md`](./02-ANALISIS-Y-DISENO-DEL-SISTEMA.md) |
| **III** | Arquitectura de Alto y Bajo Nivel (Modelo C4 Niveles 1–4, 4+1 Kruchten, STRIDE) | [`03-ARQUITECTURA-BAJO-Y-ALTO-NIVEL.md`](./03-ARQUITECTURA-BAJO-Y-ALTO-NIVEL.md) |
| **IV** | Desarrollo Basado en SDD (Constitución, Specs Gherkin, Contratos API y Plan) | [`04-DESARROLLO-BASADO-EN-SDD.md`](./04-DESARROLLO-BASADO-EN-SDD.md) y [`docs/sdd/`](../sdd/README.md) |
| **V** | Pruebas unitarias e integración (Vitest + Supertest + WebSocket) | [`05-PRUEBAS-UNITARIAS-E-INTEGRACION.md`](./05-PRUEBAS-UNITARIAS-E-INTEGRACION.md) |
| **VI** | Pruebas End to End (Playwright + Chromium) | [`06-PRUEBAS-END-TO-END.md`](./06-PRUEBAS-END-TO-END.md) |
| **VII** | Interfaz y experiencia de usuario (Design System, 10 Heurísticas de Nielsen, WCAG 2.1 AA) | [`07-INTERFAZ-Y-EXPERIENCIA-DE-USUARIO.md`](./07-INTERFAZ-Y-EXPERIENCIA-DE-USUARIO.md) |
| **VIII** | Escalabilidad del Frontend y Backend (Code Splitting, Rate Limit, Nginx, Docker) | [`08-ESCALABILIDAD-FRONTEND-Y-BACKEND.md`](./08-ESCALABILIDAD-FRONTEND-Y-BACKEND.md) |
| **IX** | Escalabilidad de Base de Datos (PostgreSQL 16, Índices, Particiones, PgBouncer) | [`09-ESCALABILIDAD-BASE-DE-DATOS.md`](./09-ESCALABILIDAD-BASE-DE-DATOS.md) |
| **X** | Configuración de dominio, subdominios, DNS y CDN (Cloudflare PoP Lima, WAF, SSL) | [`10-DOMINIO-DNS-Y-CDN.md`](./10-DOMINIO-DNS-Y-CDN.md) |
| **XI** | Implementación de Caché (LRU/TTL + ETag `304` + `/api/cache/stats` + Redis) | [`11-IMPLEMENTACION-CACHE.md`](./11-IMPLEMENTACION-CACHE.md) |
| **XII** | CI/CD (GitHub Actions: `ci.yml` + `cd.yml`, GHCR, Zero-Downtime) | [`12-CICD.md`](./12-CICD.md) |
| **XIII** | Pruebas de Carga con k6 (`smoke`, `load`, `stress/spike` + Benchmark real) | [`13-PRUEBAS-DE-CARGA-K6.md`](./13-PRUEBAS-DE-CARGA-K6.md) |
| **XIV** | Código fuente y base de datos en GitHub (`README`, `.gitignore`, `database/`) | [`14-CODIGO-FUENTE-Y-BASE-DE-DATOS-EN-GITHUB.md`](./14-CODIGO-FUENTE-Y-BASE-DE-DATOS-EN-GITHUB.md) |

---

## 1. INTRODUCCIÓN

La transformación digital del sector de servicios técnicos domiciliarios en el Perú demanda no solo una interfaz amigable, sino una **arquitectura de software rigurosa** capaz de garantizar simultáneamente confianza legal, integridad financiera, baja latencia y escalabilidad nacional.

Este proyecto aplica prácticas modernas de ingeniería de software de extremo a extremo sobre el sistema operativo real **TrabajaYa Perú (`conectaoficios`)**, integrando especificaciones ejecutables (**SDD**), verificación automatizada en todos los niveles de la pirámide de pruebas, observabilidad de caché, diseño relacional ACID en PostgreSQL 16, resiliencia de infraestructura y automatización DevOps.

---

## 2. SÍNTESIS TÉCNICA DE RESULTADOS POR DIMENSIÓN

### 2.1 Problema, Requerimientos y Modelado (Capítulos I y II)
- Se identificaron las 6 fallas críticas del mercado peruano de multioficios y se especificaron **42 Requisitos Funcionales (`RF-01` a `RF-42`)** bajo prioridad MoSCoW, **16 Requisitos No Funcionales (`RNF-01` a `RNF-16`)** según ISO/IEC 25010 y **15 Reglas de Negocio (`RN-01` a `RN-15`)**.
- Se modeló el sistema en UML 2.5: **24 Casos de Uso**, **17 Clases de Dominio**, **5 Diagramas de Secuencia** y **4 Máquinas de Estado** (Escrow 6 estados, Publicaciones, Imprevistos y Cuenta/Verificación).

### 2.2 Arquitectura de Alto/Bajo Nivel y SDD (Capítulos III y IV)
- **Estilo Arquitectónico:** **Clean Architecture (4 capas concéntricas)** + **Monolito Modular** full-stack (`server.ts` + SPA React 19).
- Se documentaron los **4 niveles del Modelo C4** (Contexto, Contenedores Actual vs. Objetivo, Componentes Internos y Código), las **Vistas 4+1 de Kruchten**, **8 patrones de diseño** y el **análisis de amenazas STRIDE**.
- Bajo **SDD (`docs/sdd/`)**, se consolidaron la Constitución de 6 Invariantes (`I1–I6`), el Modelo de Datos, los Contratos REST/WebSocket, los escenarios Gherkin de los 9 módulos y la auditoría de 8 brechas técnicas (`GAP-01` a `GAP-08`) con su plan de remediación hacia producción.

### 2.3 Calidad Verificada: Unitarias, Integración, E2E y Carga k6 (Capítulos V, VI y XIII)

| Nivel de Prueba | Herramienta | Suite / Evidencia | Resultado Medido |
| :--- | :--- | :--- | :---: |
| **Estático (Tipos)** | TypeScript (`tsc --noEmit`) | Todo `src/`, `server/`, `server.ts`, `tests/` | **0 errores** ✅ |
| **Unitarias** | **Jest** (`jest.config.cjs`) | 6 suites (`businessRules`, `server.useCases`, `peruUbigeo`, `whatsappSolicitud`, `initialData`, `cache`) | **32/32 aprobadas** ✅ |
| **Integración** | **Jest** + Supertest + `ws` | `server.api.test.ts` (`IT-01` a `IT-12`: Health, **OpenAPI/Swagger**, Catálogo/Escrow, Culqi, Chat `401`/idempotencia, Dispatch, WS `/ws/chat`, Caché/ETag `304`, Rate Limit `429`) | **12/12 aprobadas** ✅ |
| **Cobertura de Código** | **Jest V8 Coverage** (`npm run test:coverage`) | Reporte HTML/LCOV en `coverage/` | **`96.53%` Lines/Stmts · `97.18%` Funcs** ✅ |
| **End-to-End** | Playwright + Chromium | `trabajaya.e2e.spec.ts` (`E2E-01` a `E2E-06`, desktop + móvil `375×812`) | **6/6 aprobadas (13.5 s)** ✅ |
| **Carga hasta 2,000 VUs** | k6 (`stress-2000vu.k6.js`) + Benchmark (`npm run test:load`) + Postman | 23,411 solicitudes progresivas (`10 → 100 → 500 → 1,000 → 1,500 → 2,000 VUs`) | **`7,961.2 RPS` · `p95 = 279.10 ms` @ 2,000 VUs · `99.98%` Cache Hit** ✅ |

### 2.4 UI/UX, Caché y Escalabilidad Full-Stack (Capítulos VII, VIII, IX, X y XI)
- **UI/UX:** Design System (`Plus Jakarta Sans` + `JetBrains Mono`, Navy `#0d3b66` / Amber `#f4d06f` / Sky para `ADMIN`), evaluación de las 10 Heurísticas de Nielsen y auditoría WCAG 2.1 AA.
- **Escalabilidad Frontend:** `React.lazy` + `<Suspense>` en `App.tsx` y `manualChunks` en `vite.config.ts` (`vite build` en **`374 ms`**, difiriendo **`> 382 kB`** de vistas secundarias y consola Admin).
- **Escalabilidad Backend y Caché:** Motor `LruTtlCache` (`server/cache.ts`) con `ETag`/`304`, invalidación automática por escritura/prefijo, `/api/cache/stats` (**`99.87%` hit ratio**), Rate Limiter L7, Graceful Shutdown (`SIGTERM`), `Dockerfile` multi-stage, `infra/nginx.conf` (`least_conn` + WS Upgrade) y `docker-compose.yml`.
- **Base de Datos y Borde:** Esquema PostgreSQL 16 (`database/01_schema.sql` con `uq_single_admin_only`), índices compuestos + GIN FTS + particionamiento mensual + `sp_reservar_turno_atomico` (`02_indexes_and_scalability.sql`), PgBouncer (`infra/pgbouncer.ini`), zona DNS `trabajaya.pe` con SPF/DKIM/DMARC/CAA (`infra/dns-zone-trabajaya.pe.txt`) y Cloudflare CDN/WAF.

### 2.5 DevOps CI/CD y Repositorio GitHub (Capítulos XII y XIV)
- Pipelines reales en `.github/workflows/ci.yml` y `.github/workflows/cd.yml` cubriendo calidad, pruebas, Chromium E2E, imagen Docker inmutable en GHCR, Staging, aprobación de Producción, Rolling Update y purga selectiva de CDN.
- Repositorio estructurado con `.gitignore` endurecido, `README.md` profesional y *Database-as-Code* en `database/`.

---

## 3. CONCLUSIONES

1. **Alineamiento Problema–Arquitectura:** El modelo **Monolito Modular bajo Clean Architecture** resultó óptimo para **TrabajaYa Perú**, permitiendo modelar con claridad 9 módulos de negocio, garantizar las invariantes Escrow/RBAC y preparar una ruta de escalado horizontal sin la sobrecarga prematura de microservicios.
2. **Valor Comprobado del Desarrollo Basado en SDD:** Formalizar la Constitución (`I1–I6`), los contratos REST/WS y los escenarios Gherkin permitió derivar pruebas automatizadas de alto valor —llegando incluso a detectar mediante `peruUbigeo.test.ts` el conteo exacto real de **1,878 distritos** en el código fuente.
3. **Eficacia Medida de la Caché y Escalabilidad hasta 2,000 VUs:** La combinación de `React.lazy` + `manualChunks` en frontend y `LruTtlCache` + `ETag 304` en backend permitió lograr un build de `554 ms`, diferir más de `382 kB` de la carga inicial y sostener una simulación progresiva hasta **2,000 usuarios virtuales concurrentes** alcanzando **`7,961.2 req/s`** con **`99.98%` de aciertos de caché**, **`p95 = 48.17 ms` a 100 VUs** y **`p95 = 279.10 ms` a 2,000 VUs** (`0.29%` error).
4. **Madurez Operativa y Transparencia Técnica:** La documentación explícita de las brechas entre la persistencia demostrativa (`localStorage` + `.data/*.json`) y el despliegue productivo (`PostgreSQL 16 + PgBouncer + Redis + S3 + Auth JWT`) demuestra criterio arquitectónico realista y proporciona un plan ejecutable inmediato.

---

## 4. RECOMENDACIONES PARA PRODUCCIÓN

1. **Conectar la Persistencia Productiva (Fase 1 del Backlog SDD):** Reemplazar el almacenamiento `localStorage`/JSON por el esquema `database/01_schema.sql` en PostgreSQL 16 + hashing `argon2` + cookies `HttpOnly` JWT y activar `RedisCacheStore` sobre el puerto `CacheStore` ya creado.
2. **Privacidad de Expedientes en Nube:** Almacenar los documentos sensibles de los 5 bloques (DNI, antecedentes PNP/PJ/INPE, Ficha RUC) en un bucket S3/R2 privado servido exclusivamente por URLs prefirmadas de corta expiración en cumplimiento de la Ley N.º 29733.
3. **Observabilidad y Monitoreo Continuo:** Integrar OpenTelemetry + Prometheus/Grafana consumiendo `/api/health`, `/api/cache/stats` y métricas de latencia p95/p99 de Nginx y PostgreSQL.
4. **Asistencia con IA (`@google/genai`):** Aprovechar la dependencia ya instalada en el proyecto para clasificar automáticamente el oficio y nivel de urgencia de los imprevistos a partir del texto y las fotografías subidas por el cliente.

---

## 5. REFERENCIAS BIBLIOGRÁFICAS (APA 7)

- Bass, L., Clements, P., & Kazman, R. (2021). *Software Architecture in Practice* (4th ed.). Addison-Wesley Professional.
- Brown, S. (2024). *The C4 Model for Visualising Software Architecture*. https://c4model.com/
- IEEE Computer Society. (2009). *IEEE Std 1016-2009: IEEE Standard for Information Technology — Systems Design — Software Design Descriptions*. IEEE.
- ISO/IEC. (2011). *ISO/IEC 25010: Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)*. International Organization for Standardization.
- ISO/IEC/IEEE. (2018). *ISO/IEC/IEEE 29148: Systems and software engineering — Life cycle processes — Requirements engineering*.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media.
- Kruchten, P. (1995). The 4+1 View Model of Architecture. *IEEE Software*, 12(6), 42–50.
- Martin, R. C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
- Nielsen, J. (2024). *10 Usability Heuristics for User Interface Design*. Nielsen Norman Group.
- República del Perú. (2011). *Ley N.º 29733 — Ley de Protección de Datos Personales*. Diario Oficial El Peruano.
- W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.1*. World Wide Web Consortium.
