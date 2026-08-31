# BookConv 电子书格式转换站 — 新手建站完整指南

> 从零开始搭建一个专业的在线电子书转换网站，支持 28+ 格式互转

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [环境准备](#2-环境准备)
3. [本地开发](#3-本地开发)
4. [配置指南](#4-配置指南)
5. [生产部署](#5-生产部署)
6. [SEO 优化](#6-seo-优化)
7. [监控维护](#7-监控维护)
8. [常见问题](#8-常见问题)

---

## 1. 项目概述

### 这是什么？

BookConv 是一个基于 **Next.js + Calibre** 的在线电子书格式转换平台，支持：
- 28+ 种格式转换组合
- 异步队列处理（BullMQ + Redis）
- 多语言支持（英文、西班牙语）
- 付费订阅系统（Lemon Squeezy）
- SEO 友好结构

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.2.10 |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 转换引擎 | Calibre CLI | 最新版 |
| 异步队列 | BullMQ + Redis | BullMQ 5.x |
| 认证 | Supabase | 可选 |
| 存储 | Cloudflare R2 | 可选 |
| 支付 | Lemon Squeezy | - |
| 部署 | Docker / Vercel / VPS | - |

### 支持的格式（28 种）

| 类别 | 格式 |
|------|------|
| eBook | EPUB, AZW3, MOBI, LIT, FB2 |
| 文档 | DOC, DOCX, RTF, TXT, HTML |
| PDF | PDF |
| 图像 | JPG, PNG |
| 漫画 | CBR |



---

## 2. 环境准备

### 系统要求

**开发环境：**
- Node.js >= 20
- npm >= 9 或 yarn
- Git

**生产环境（VPS）：**
- Ubuntu 22.04 LTS
- 2vCPU / 4GB RAM
- 20GB SSD

**可选服务：**
- Redis（推荐，用于队列）
- Cloudflare R2（对象存储）
- Supabase（用户认证）

### 域名购买建议

| 服务商 | 价格 | 特点 |
|--------|------|------|
| Namecheap | ~/年 | 便宜，隐私保护免费 |
| Cloudflare | ~.12/年 | 透明定价，含 CDN |
| GoDaddy | ~/年 | 常用但偏贵 |

**推荐**：使用 Cloudflare 管理 DNS，配合 Namecheap 购买域名。

### 服务器选择

| 服务商 | 入门配置 | 月费 | 推荐场景 |
|--------|----------|------|----------|
| Hetzner | CX22 |  | 性价比首选 |
| DigitalOcean | Basic |  | 文档完善 |
| Vultr | 1 vCPU/1GB | .5 | 测试用 |
| Vercel | Hobby |  | 静态为主 |

---

## 3. 本地开发

### 步骤 1：克隆仓库

\\\ash
git clone https://github.com/your-username/bookconv.git
cd bookconv/ebook-converter
\\\

### 步骤 2：安装依赖

\\\ash
npm install
\\\

### 步骤 3：配置环境变量

\\\ash
# 复制示例文件
cp .env.example .env.local

# 编辑配置
nano .env.local
\\\

**最小化配置（仅开发）：**

\\\env
# 必填
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=/tmp/ebook-uploads
MAX_FILE_SIZE_MB=10
CALIBRE_PATH=ebook-convert

# 可选 - Cloudflare R2
# R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
# R2_ACCESS_KEY_ID=xxx
# R2_SECRET_ACCESS_KEY=xxx
# R2_BUCKET_NAME=ebook-temp

# 可选 - Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 可选 - Lemon Squeezy
# LEMON_SQUEEZY_API_KEY=
# LEMON_SQUEEZY_STORE_ID=
# LEMON_SQUEEZY_WEBHOOK_SECRET=
# LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID=
# LEMON_SQUEEZY_API_MONTHLY_VARIANT_ID=
\\\

### 步骤 4：启动服务

**方式一：Docker（推荐，自动包含 Redis）**

\\\ash
docker-compose up -d
# 访问 http://localhost:3000
\\\

**方式二：本地 Node.js**

\\\ash
# 需要先安装 Redis
npm run dev
# 访问 http://localhost:3000
\\\

### 步骤 5：验证运行

\\\ash
# 健康检查
curl http://localhost:3000/api/health

# 应该返回：
# {\"status\":\"ok\",\"timestamp\":\"2026-08-02T...\"}
\\\


---

## 4. 配置指南

### 4.1 支付系统配置（Lemon Squeezy）

1. 注册账号：https://lemonsqueezy.com
2. 创建 Store
3. 创建产品：
   - Pro 计划：/月，变体 ID 如 \_1947491\
   - API 计划：/月，变体 ID 如 \_1947478\
4. 获取 API Key：Settings → API
5. 配置 Webhook：Settings → Webhooks → 添加 \https://yourdomain.com/api/payments/webhook\

**环境配置：**

\\\env
LEMON_SQUEEZY_API_KEY=你的API密钥
LEMON_SQUEEZY_STORE_ID=438949
LEMON_SQUEEZY_WEBHOOK_SECRET=你的Webhook密钥
LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID=v_1947491
LEMON_SQUEEZY_API_MONTHLY_VARIANT_ID=v_1947478
\\\

### 4.2 对象存储配置（Cloudflare R2）

1. 创建账号：https://cloudflare.com
2. 创建 R2 存储桶：\ebook-temp\
3. 创建 API Token：
   - 权限：Objects Read & Write
   - 范围：你的 Account ID
4. 获取 Endpoint：\https://<account-id>.r2.cloudflarestorage.com\

**环境配置：**

\\\env
R2_ENDPOINT=https://你的account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=你的access-key
R2_SECRET_ACCESS_KEY=你的secret-key
R2_BUCKET_NAME=ebook-temp
\\\

### 4.3 用户认证配置（Supabase）

1. 注册：https://supabase.com
2. 创建新项目
3. 获取配置：Settings → API
4. 启用 Email 认证

**环境配置：**

\\\env
NEXT_PUBLIC_SUPABASE_URL=你的project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
SUPABASE_SERVICE_ROLE_KEY=你的service-role-key
\\\

### 4.4 SEO 基础配置

1. **Google Search Console**
   - 验证域名：https://search.google.com/search-console
   - 提交 sitemap：\https://www.bookconv.com/sitemap.xml\

2. **Bing Webmaster Tools**
   - 添加网站：https://www.bing.com/webmasters
   - 提交 sitemap

3. **robots.txt**
   - 确保 \https://www.bookconv.com/robots.txt\ 可访问


---

## 5. 生产部署

### 方案 A：Docker 一键部署（推荐新手）

**前提条件：** 服务器已安装 Docker

\\\ash
# 克隆仓库
git clone https://github.com/your-username/bookconv.git
cd bookconv/ebook-converter

# 配置环境变量
cp .env.example .env.production
nano .env.production

# 启动服务
docker-compose up -d

# 检查状态
docker ps
curl http://localhost:3000/api/health
\\\

**访问**：\http://你的服务器IP:3000\

### 方案 B：VPS + Nginx + PM2（生产推荐）

#### 步骤 1：服务器初始化

\\\ash
# SSH 登录
ssh root@your-vps-ip

# 更新系统
apt update && apt upgrade -y

# 创建用户
useradd -m -s /bin/bash ebook
usermod -aG sudo ebook
su - ebook
\\\

#### 步骤 2：安装依赖

\\\ash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # v20.x

# Calibre（转换引擎）
apt install -y calibre
ebook-convert --version

# Docker（可选，用于 Redis）
curl -fsSL https://get.docker.com | sh
usermod -aG docker ebook
newgrp docker

# Git
apt install -y git
\\\

#### 步骤 3：部署应用

\\\ash
# 克隆项目
git clone https://github.com/your-username/bookconv.git
cd bookconv/ebook-converter

# 安装依赖
npm ci --production

# 构建
npm run build

# 配置环境变量
cp .env.example .env.production
nano .env.production

# PM2 启动
npm install -g pm2
pm2 start npm --name "bookconv" -- start
pm2 save
pm2 startup systemd
\\\

#### 步骤 4：配置 Nginx

\\\ash
# 安装 Nginx
apt install nginx -y

# 创建站点配置
nano /etc/nginx/sites-available/bookconv
\\\

**Nginx 配置：**

\\\
ginx
server {
    listen 80;
    server_name www.bookconv.com bookconv.com;

    # 安全头
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 静态资源缓存
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
        proxy_read_timeout 120s;
    }

    # 前端代理
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
    }
}
\\\

**启用站点：**

\\\ash
ln -s /etc/nginx/sites-available/bookconv /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
\\\

#### 步骤 5：配置 SSL（Let's Encrypt）

\\\ash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d www.bookconv.com -d bookconv.com

# 测试自动续期
certbot renew --dry-run
\\\

### 方案 C：Vercel 部署（最简单）

1. 注册：https://vercel.com
2. 导入 GitHub 仓库
3. 配置环境变量（Dashboard → Settings → Environment Variables）
4. 部署

**注意**：Vercel Serverless 不支持常驻进程，Queue Worker 需要单独部署或使用 Vercel Cron。


---

## 6. SEO 优化

### 6.1 站内 SEO

**已实现功能：**
- ✅ Sitemap 自动生成（\/sitemap.xml\）
- ✅ robots.txt
- ✅ Open Graph 标签
- ✅ Twitter Card
- ✅ FAQ Schema
- ✅ Breadcrumb Schema
- ✅ SoftwareApplication Schema
- ✅ 多语言支持（en/es）

### 6.2 内容策略

**博客文章建议：**

| 类型 | 标题示例 | 关键词 |
|------|----------|--------|
| 教程 | \"如何将 EPUB 转换为 MOBI（完整指南）\" | epub to mobi, kindle转换 |
| 对比 | \"EPUB vs MOBI vs AZW3：格式对比\" | epub mobi azw3 区别 |
| 工具 | \"2024 年最佳免费电子书转换器\" | free ebook converter |
| 问题 | \"为什么 Kindle 不支持 EPUB？\" | kindle epub 不支持 |

### 6.3 外部提交

**已完成：**
- ✅ Google Search Console
- ✅ Bing Webmaster Tools
- ✅ Product Hunt
- ✅ Open Source Handbook

**建议补充：**
- GitHub Awesome Lists
- Hacker News
- Reddit (r/ebooks, r/technology)
- Indie Hackers

---

## 7. 监控维护

### 7.1 健康检查

\\\ash
# 应用健康
curl -s https://www.bookconv.com/api/health | jq

# Redis 连接
redis-cli ping

# Calibre 可用
ebook-convert --version

# Docker 容器
docker ps
\\\

### 7.2 日志查看

\\\ash
# PM2 日志
pm2 logs bookconv

# Docker 日志
docker-compose logs -f app

# Nginx 错误日志
tail -f /var/log/nginx/error.log
\\\

### 7.3 定时清理

\\\ash
# 添加 crontab 清理临时文件
crontab -e

# 每天凌晨 3 点清理超过 1 天的文件
0 3 * * * find /tmp/ebook-uploads -type d -mtime +1 -exec rm -rf {} \\;
\\\

### 7.4 备份策略

\\\ash
# 配置文件备份
tar czf config-backup-.tar.gz \\
  .env.production \\
  /etc/nginx/sites-available/ \\
  /etc/letsencrypt/
\\\

---

## 8. 常见问题

### Q1：转换失败怎么办？

\\\ash
# 检查 Calibre
which ebook-convert

# 测试转换
ebook-convert test.epub test.pdf

# 检查权限
ls -la /tmp/ebook-uploads/
\\\

### Q2：Redis 连接失败？

\\\ash
# 检查 Redis 状态
systemctl status redis
redis-cli ping

# 重启 Redis
systemctl restart redis
\\\

### Q3：内存不足？

\\\ash
# 检查内存
free -h

# 添加 Swap
dd if=/dev/zero of=/swapfile bs=1M count=1024
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
\\\

### Q4：静态页面 404？

\\\ash
# 检查 .next 目录
ls -la .next/

# 重新构建
npm run build

# 检查路由
npm run build 2>&1 | grep -E \"Route|page\"
\\\

---

## 📚 附录

### A. 成本估算（VPS 方案）

| 项目 | 月费 | 说明 |
|------|------|------|
| Hetzner CX22 |  | 2vCPU/4GB/20GB |
| 域名 (.com) | .83 | ~/年 |
| Cloudflare CDN |  | 免费版够用 |
| R2 存储 |  | ~10GB |
| **总计** | **~/月** | |

### B. 快速命令参考

\\\ash
# 开发
npm run dev

# 构建
npm run build

# 启动生产
npm start

# Docker
docker-compose up -d

# 查看日志
docker-compose logs -f

# 重启
pm2 restart bookconv
\\\

### C. 相关文件

| 文件 | 用途 |
|------|------|
| \.env.example\ | 环境变量模板 |
| \docker-compose.yml\ | Docker 配置 |
| \Dockerfile\ | 镜像构建 |
| \
ext.config.ts\ | Next.js 配置 |
| \src/lib/payments/service.ts\ | 支付逻辑 |
| \src/lib/queue.ts\ | 队列逻辑 |

---

*最后更新：2026-08-02*
*版本：v1.0*
