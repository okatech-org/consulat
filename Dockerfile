# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:20-slim AS builder
WORKDIR /app

# Optimisations build Next/Prisma
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    SKIP_ENV_VALIDATION=1

# Installe les deps (pas de lock -> npm install)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Copie du code et build
COPY . .
RUN npm run build


# --- Runtime stage ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

# Dépendances système min pour Prisma/openssl (Debian)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
 && rm -rf /var/lib/apt/lists/*

# Copie des assets statiques et du serveur standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Assure la présence des engines Prisma dans node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# (Optionnel) garder les migrations Prisma si besoin de les exécuter via job
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

# Démarre le serveur Next standalone
CMD ["node", "server.js"]
