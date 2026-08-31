# BookConv Ebook Format Converter — Complete Newcomer Setup Guide

> Build a professional online ebook conversion website from scratch, supporting 28+ format inter-conversions.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Environment Prep](#2-environment-prep)
3. [Local Development](#3-local-development)
4. [Configuration Guide](#4-configuration-guide)
5. [Production Deployment](#5-production-deployment)
6. [SEO Optimization](#6-seo-optimization)
7. [Monitoring & Maintenance](#7-monitoring--maintenance)
8. [FAQ](#8-faq)

---

## 1. Project Overview

### What is this?

BookConv is an online ebook format conversion platform based on **Next.js + Calibre**, supporting:
- 28+ format conversion combinations
- Async queue processing (BullMQ + Redis)
- Multi-language support (English, Spanish)
- Paid subscription system (Lemon Squeezy)
- SEO-friendly structure

### Tech Stack

| Layer | Technology | Version |
|------|------|------|
| Framework | Next.js | 16.2.10 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Conversion engine | Calibre CLI | latest |
| Async queue | BullMQ + Redis | BullMQ 5.x |
| Auth | Supabase | optional |
| Storage | Cloudflare R2 | optional |
| Payments | Lemon Squeezy | - |
| Deployment | Docker / Vercel / VPS | - |

### Supported formats (28 types)

| Category | Formats |
|------|------|
| eBook | EPUB, AZW3, MOBI, LIT, FB2 |
| Document | DOC, DOCX, RTF, TXT, HTML |
| PDF | PDF |
| Image | JPG, PNG |
| Comic | CBR |

---

## 2. Environment Prep

### System Requirements

**Development:**
- Node.js >= 20
- npm >= 9 or yarn
- Git

**Production (VPS):**
- Ubuntu 22.04 LTS
- 2vCPU / 4GB RAM
- 20GB SSD

**Optional services:**
- Redis (recommended, for the queue)
- Cloudflare R2 (object storage)
- Supabase (user auth)

### Domain purchase recommendations

| Provider | Price | Notes |
|--------|------|------|
| Namecheap | ~$/year | cheap, free privacy protection |
| Cloudflare | ~$0.12/year | transparent pricing, includes CDN |
| GoDaddy | ~$/year | common but pricey |

**Recommendation**: use Cloudflare for DNS management, with Namecheap for domain purchase.

### Server selection

| Provider | Entry config | Monthly | Recommended for |
|--------|----------|------|----------|
| Hetzner | CX22 |  | best price/performance |
| DigitalOcean | Basic |  | great docs |
| Vultr | 1 vCPU/1GB | $3.5 | testing |
| Vercel | Hobby |  | static-focused |

---

## 3. Local Development

### Step 1: Clone the repo

```bash
git clone https://github.com/your-username/bookconv.git
cd bookconv/ebook-converter
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit config
nano .env.local
```

**Minimal config (dev only):**

```env
# Required
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=/tmp/ebook-uploads
MAX_FILE_SIZE_MB=10
CALIBRE_PATH=ebook-convert

# Optional - Cloudflare R2
# R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
# R2_ACCESS_KEY_ID=xxx
# R2_SECRET_ACCESS_KEY=xxx
# R2_BUCKET_NAME=ebook-temp

# Optional - Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Optional - Lemon Squeezy
# LEMON_SQUEEZY_API_KEY=
# LEMON_SQUEEZY_STORE_ID=
# LEMON_SQUEEZY_WEBHOOK_SECRET=
# LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID=
# LEMON_SQUEEZY_API_MONTHLY_VARIANT_ID=
```

### Step 4: Start the service

**Option A: Docker (recommended, includes Redis automatically)**

```bash
docker-compose up -d
# Visit http://localhost:3000
```

**Option B: Local Node.js**

```bash
# Redis must be installed first
npm run dev
# Visit http://localhost:3000
```

### Step 5: Verify it's running

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"2026-08-02T..."}
```

---

## 4. Configuration Guide

### 4.1 Payment system config (Lemon Squeezy)

1. Sign up: https://lemonsqueezy.com
2. Create a Store
3. Create products:
   - Pro plan: $/month, variant ID like `v_1947491`
   - API plan: $/month, variant ID like `v_1947478`
4. Get API Key: Settings → API
5. Configure Webhook: Settings → Webhooks → add `https://yourdomain.com/api/payments/webhook`

**Env config:**

```env
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=438949
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID=v_1947491
LEMON_SQUEEZY_API_MONTHLY_VARIANT_ID=v_1947478
```

### 4.2 Object storage config (Cloudflare R2)

1. Sign up: https://cloudflare.com
2. Create R2 bucket: `ebook-temp`
3. Create API Token:
   - Permissions: Objects Read & Write
   - Scope: your Account ID
4. Get Endpoint: `https://<account-id>.r2.cloudflarestorage.com`

**Env config:**

```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=ebook-temp
```

### 4.3 User auth config (Supabase)

1. Sign up: https://supabase.com
2. Create a new project
3. Get config: Settings → API
4. Enable Email auth

**Env config:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4.4 Basic SEO config

1. **Google Search Console**
   - Verify domain: https://search.google.com/search-console
   - Submit sitemap: `https://www.bookconv.com/sitemap.xml`

2. **Bing Webmaster Tools**
   - Add site: https://www.bing.com/webmasters
   - Submit sitemap

3. **robots.txt**
   - Ensure `https://www.bookconv.com/robots.txt` is reachable

---

## 5. Production Deployment

### Plan A: One-click Docker deploy (recommended for newcomers)

**Prerequisite:** Docker installed on the server

```bash
# Clone repo
git clone https://github.com/your-username/bookconv.git
cd bookconv/ebook-converter

# Configure env
cp .env.example .env.production
nano .env.production

# Start service
docker-compose up -d

# Check status
docker ps
curl http://localhost:3000/api/health
```

**Access**: `http://your-server-ip:3000`

### Plan B: VPS + Nginx + PM2 (recommended for production)

#### Step 1: Server initialization

```bash
# SSH login
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Create user
useradd -m -s /bin/bash ebook
usermod -aG sudo ebook
su - ebook
```

#### Step 2: Install dependencies

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # v20.x

# Calibre (conversion engine)
apt install -y calibre
ebook-convert --version

# Docker (optional, for Redis)
curl -fsSL https://get.docker.com | sh
usermod -aG docker ebook
newgrp docker

# Git
apt install -y git
```

#### Step 3: Deploy the app

```bash
# Clone project
git clone https://github.com/your-username/bookconv.git
cd bookconv/ebook-converter

# Install dependencies
npm ci --production

# Build
npm run build

# Configure env
cp .env.example .env.production
nano .env.production

# Start with PM2
npm install -g pm2
pm2 start npm --name "bookconv" -- start
pm2 save
pm2 startup systemd
```

#### Step 4: Configure Nginx

```bash
# Install Nginx
apt install nginx -y

# Create site config
nano /etc/nginx/sites-available/bookconv
```

**Nginx config:**

```nginx
server {
    listen 80;
    server_name www.bookconv.com bookconv.com;

    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static asset caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Enable site:**

```bash
ln -s /etc/nginx/sites-available/bookconv /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### Step 5: Configure SSL (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d www.bookconv.com -d bookconv.com

# Test auto-renewal
certbot renew --dry-run
```

### Plan C: Vercel deploy (simplest)

1. Sign up: https://vercel.com
2. Import the GitHub repo
3. Configure env variables (Dashboard → Settings → Environment Variables)
4. Deploy

**Note**: Vercel Serverless doesn't support long-lived processes; the Queue Worker needs a separate deploy or use Vercel Cron.

---

## 6. SEO Optimization

### 6.1 On-site SEO

**Implemented features:**
- ✅ Automatic sitemap (`/sitemap.xml`)
- ✅ robots.txt
- ✅ Open Graph tags
- ✅ Twitter Card
- ✅ FAQ Schema
- ✅ Breadcrumb Schema
- ✅ SoftwareApplication Schema
- ✅ Multi-language support (en/es)

### 6.2 Content strategy

**Blog post suggestions:**

| Type | Title example | Keyword |
|------|----------|--------|
| Tutorial | "How to Convert EPUB to MOBI (Complete Guide)" | epub to mobi, kindle conversion |
| Comparison | "EPUB vs MOBI vs AZW3: Format Comparison" | epub mobi azw3 difference |
| Tool | "Best Free Ebook Converter 2024" | free ebook converter |
| Question | "Why Doesn't Kindle Support EPUB?" | kindle epub not supported |

### 6.3 External submissions

**Done:**
- ✅ Google Search Console
- ✅ Bing Webmaster Tools
- ✅ Product Hunt
- ✅ Open Source Handbook

**Suggested additions:**
- GitHub Awesome Lists
- Hacker News
- Reddit (r/ebooks, r/technology)
- Indie Hackers

---

## 7. Monitoring & Maintenance

### 7.1 Health checks

```bash
# App health
curl -s https://www.bookconv.com/api/health | jq

# Redis connection
redis-cli ping

# Calibre available
ebook-convert --version

# Docker containers
docker ps
```

### 7.2 View logs

```bash
# PM2 logs
pm2 logs bookconv

# Docker logs
docker-compose logs -f app

# Nginx error log
tail -f /var/log/nginx/error.log
```

### 7.3 Scheduled cleanup

```bash
# Add crontab to clean temp files
crontab -e

# Every day at 3am, delete files older than 1 day
0 3 * * * find /tmp/ebook-uploads -type d -mtime +1 -exec rm -rf {} \;
```

### 7.4 Backup strategy

```bash
# Back up config files
tar czf config-backup-$(date +%F).tar.gz \
  .env.production \
  /etc/nginx/sites-available/ \
  /etc/letsencrypt/
```

---

## 8. FAQ

### Q1: Conversion failed, what now?

```bash
# Check Calibre
which ebook-convert

# Test conversion
ebook-convert test.epub test.pdf

# Check permissions
ls -la /tmp/ebook-uploads/
```

### Q2: Redis connection failed?

```bash
# Check Redis status
systemctl status redis
redis-cli ping

# Restart Redis
systemctl restart redis
```

### Q3: Out of memory?

```bash
# Check memory
free -h

# Add swap
dd if=/dev/zero of=/swapfile bs=1M count=1024
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Q4: Static page 404?

```bash
# Check .next dir
ls -la .next/

# Rebuild
npm run build

# Check routes
npm run build 2>&1 | grep -E "Route|page"
```

---

## 📚 Appendix

### A. Cost estimate (VPS plan)

| Item | Monthly | Notes |
|------|------|------|
| Hetzner CX22 |  | 2vCPU/4GB/20GB |
| Domain (.com) | $0.83 | ~$/year |
| Cloudflare CDN |  | free tier is enough |
| R2 storage |  | ~10GB |
| **Total** | **~$/month** | |

### B. Quick command reference

```bash
# Dev
npm run dev

# Build
npm run build

# Start production
npm start

# Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Restart
pm2 restart bookconv
```

### C. Related files

| File | Purpose |
|------|------|
| `.env.example` | env var template |
| `docker-compose.yml` | Docker config |
| `Dockerfile` | image build |
| `next.config.ts` | Next.js config |
| `src/lib/payments/service.ts` | payment logic |
| `src/lib/queue.ts` | queue logic |

---

*Last updated: 2026-08-02*
*Version: v1.0*
