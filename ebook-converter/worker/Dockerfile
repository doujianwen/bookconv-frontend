FROM node:22-alpine

# Install Calibre and conversion tools
RUN apk add --no-cache \
    calibre \
    imagemagick \
    ghostscript \
    poppler-utils \
    libreoffice \
    djvulibre \
    curl

# Create non-root user
RUN addgroup -g 1001 -S worker && \
    adduser -S worker -u 1001 -G worker

WORKDIR /app

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy worker source
COPY dist/ ./dist/

# Create temp directory for conversions
RUN mkdir -p /tmp/conversions && chown -R worker:worker /tmp/conversions

USER worker

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]