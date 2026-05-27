FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Bring the generated Prisma client + CLI over from builder
COPY --from=builder /app/node_modules/.prisma        ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client  ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma          ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma     ./node_modules/.bin/prisma

COPY --from=builder /app/dist ./dist
EXPOSE 3000

# Run pending migrations, then start the server
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/server.cjs"]
