# Stage 1: Production deps only (clean Alpine, no devDeps, no cache conflict)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Full build (devDeps available for tsx, esbuild, prisma CLI)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

# Stage 3: Lean production image — no npm install at all
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Clean production node_modules from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Override with Prisma-generated client + CLI from stage 2
COPY --from=builder /app/node_modules/.prisma          ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client   ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma           ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma      ./node_modules/.bin/prisma

# Built frontend + compiled server
COPY --from=builder /app/dist ./dist

# Schema needed for migrate deploy
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/server.cjs"]
