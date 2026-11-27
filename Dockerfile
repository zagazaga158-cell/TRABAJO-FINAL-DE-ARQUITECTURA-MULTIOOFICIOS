# ==============================================================================
# Multi-stage Dockerfile — TrabajaYa Perú (conectaoficios)
# Optimizado para despliegue horizontal stateless en Docker / Cloud Run / K8s
# ==============================================================================

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Imagen productiva ligera sin herramientas de compilación innecesarias
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S trabajaya && adduser -S trabajaya -G trabajaya

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx

RUN mkdir -p /app/.data && chown -R trabajaya:trabajaya /app
USER trabajaya

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["npx", "tsx", "server.ts"]
