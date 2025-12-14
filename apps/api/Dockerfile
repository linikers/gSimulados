FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configuration
COPY package.json yarn.lock tsconfig.base.json ./

# Copy packages
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies
RUN yarn install --frozen-lockfile

# Build API
WORKDIR /app/apps/api
RUN yarn build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/server.js"]
