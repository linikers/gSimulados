FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configuration
COPY package.json yarn.lock tsconfig.base.json ./

# Copy packages
COPY packages ./packages
COPY apps/web ./apps/web
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev
RUN yarn install --frozen-lockfile

# Build shared package
WORKDIR /app/packages/shared
RUN yarn build

# Build web app
WORKDIR /app/apps/web
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN yarn build

# Production image
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
