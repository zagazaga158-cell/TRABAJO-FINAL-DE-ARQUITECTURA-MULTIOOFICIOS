# Base de Datos PostgreSQL 16 — TrabajaYa Perú (`conectaoficios`)

Esta carpeta contiene los scripts SQL oficiales, idempotentes y versionados para desplegar la base de datos relacional del proyecto.

## Orden de Ejecución

1. **`01_schema.sql`** — Crea las 14 tablas en 3FN, tipos `ENUM`, `CHECK` constraints, columnas generadas (`garantia_monto`, `tarifa_cliente`, `amount_soles`) y el índice único parcial `uq_single_admin_only` (Invariante I1).
2. **`02_indexes_and_scalability.sql`** — Crea índices compuestos parciales, índice GIN Full-Text Search en español (`pg_trgm`), particionamiento declarativo mensual (`audit_events_partitioned`), vista materializada `mv_admin_billetera_kpis` y procedimiento atómico `sp_reservar_turno_atomico` (`SELECT ... FOR UPDATE`).
3. **`03_seed_data.sql`** — Inserta datos semilla idempotentes (`allowed_emails`, `publication_plans`, `ADM-001`, usuarios y servicios base).

## Comandos de Inicialización

### Opción A — Usando `psql` en PostgreSQL local o remoto
```bash
createdb trabajaya_db
psql -d trabajaya_db -f database/01_schema.sql
psql -d trabajaya_db -f database/02_indexes_and_scalability.sql
psql -d trabajaya_db -f database/03_seed_data.sql
```

### Opción B — Automático con Docker Compose
`docker-compose.yml` monta `./database/01_schema.sql` en `/docker-entrypoint-initdb.d/`. Para aplicar índices y seed tras levantar el contenedor:
```bash
docker compose up -d postgres
docker exec -i trabajaya-postgres psql -U trabajaya -d trabajaya_db < database/02_indexes_and_scalability.sql
docker exec -i trabajaya-postgres psql -U trabajaya -d trabajaya_db < database/03_seed_data.sql
```
