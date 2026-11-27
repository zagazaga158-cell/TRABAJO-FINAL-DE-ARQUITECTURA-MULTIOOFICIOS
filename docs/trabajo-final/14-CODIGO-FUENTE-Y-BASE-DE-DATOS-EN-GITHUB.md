# Paso 14 — Código Fuente y Base de Datos en GitHub

> **Proyecto:** TrabajaYa Perú (`conectaoficios`)  
> **Artefactos Preparados:** [`.gitignore`](../../.gitignore), [`README.md`](../../README.md), [`database/README.md`](../../database/README.md), [`database/01_schema.sql`](../../database/01_schema.sql), [`database/02_indexes_and_scalability.sql`](../../database/02_indexes_and_scalability.sql) y [`database/03_seed_data.sql`](../../database/03_seed_data.sql).

---

## 1. Estándares de Repositorio y Seguridad Aplicados

Antes de publicar en GitHub se verificó la higiene completa del repositorio:
1. **Protección de Secretos (`.gitignore`):** Excluye estrictamente `.env*` (preservando solo `!.env.example`), `node_modules/`, `dist/`, `build/`, `.data/`, `playwright-report/`, `test-results/`, `coverage/` y `.aistudio/`.
2. **Base de Datos Versionada como Código (*Database-as-Code*):** En lugar de subir dumps binarios opacos, la carpeta `database/` versiona esquema (`01_schema.sql`), optimización/escalabilidad (`02_indexes_and_scalability.sql`), datos semilla idempotentes (`03_seed_data.sql`) y pooling (`infra/pgbouncer.ini`), permitiendo auditoría por diffs en Pull Requests.
3. **Convención de Commits (*Conventional Commits*):**
   - `feat(escrow): ...` · `fix(chat): ...` · `test(e2e): ...` · `docs(sdd): ...` · `chore(ci): ...` · `perf(cache): ...`
4. **Integración Automática con GitHub Actions:** Al hacer `git push` a `main` o abrir un Pull Request, `.github/workflows/ci.yml` valida automáticamente `lint + unit + integration + build + E2E + Docker`.

---

## 2. Inventario Versionado en GitHub

| Carpeta / Archivo | Contenido Versionado |
| :--- | :--- |
| `src/` + `server.ts` + `server/` | Código fuente completo React 19 + TypeScript + Express + WebSocket + Caché LRU/TTL. |
| `database/` | Esquema PostgreSQL 16 (3FN), índices/particiones/vistas/procedimientos y datos semilla. |
| `tests/` | 27 pruebas unitarias, 9 de integración, 6 E2E Playwright y 3 scripts k6 + benchmark local. |
| `infra/` + `Dockerfile` + `docker-compose.yml` | Nginx Load Balancer, PgBouncer, zona DNS `trabajaya.pe` y topología multi-contenedor. |
| `.github/workflows/` | Pipelines `ci.yml` y `cd.yml` listos para ejecución en GitHub Actions. |
| `docs/sdd/` + `docs/trabajo-final/` | Suite SDD completa (7 docs) + los 16 capítulos del Trabajo Final de Arquitectura. |

---

## 3. Pasos Exactos para Publicar el Repositorio en GitHub

Ejecuta los siguientes comandos desde la carpeta `d:\TRABAJO FINAL DE ARQUITECTURA MULTIOOFICIOS\conectaoficios` (reemplazando `<TU_USUARIO>` y `<NOMBRE_REPO>` por tu cuenta de GitHub):

```powershell
# 1. Inicializar repositorio local en rama principal 'main'
git init
git branch -M main

# 2. Verificar que .env, node_modules, dist y .data están ignorados
git status

# 3. Registrar primer commit estructurado (Código + BD + Tests + CI/CD + SDD)
git add .
git commit -m "feat: plataforma completa TrabajaYa Peru con SDD, pruebas, cache, PostgreSQL, k6 y CI/CD"

# 4. Conectar con tu repositorio remoto en GitHub y subir
git remote add origin https://github.com/<TU_USUARIO>/<NOMBRE_REPO>.git
git push -u origin main

# 5. (Opcional) Crear etiqueta de lanzamiento v1.0.0 para disparar cd.yml
git tag -a v1.0.0 -m "Release v1.0.0 — Trabajo Final de Arquitectura TrabajaYa Peru"
git push origin v1.0.0
```

> **Recomendación para la sustentación:** En GitHub → *Settings → Branches → Add branch protection rule* sobre `main`, activa **"Require status checks to pass before merging"** seleccionando los jobs `Lint + Unit + Integration + Build` y `Pruebas End-to-End (Playwright Chromium)`.
