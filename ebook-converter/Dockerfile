FROM node:20-alpine AS base

# Install Calibre and conversion tools (needed by the conversion worker)
RUN apk add --no-cache \
    calibre \
    imagemagick \
    ghostscript \
    poppler-utils \
    curl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3000

# Start app (worker auto-starts via queue.ts in production)
CMD ["npm", "start"]