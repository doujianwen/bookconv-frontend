# 电子书转换工具站 - 部署指南

## 快速开始

### 本地开发
```bash
cd ebook-converter
npm install
npm run dev
# 访问 http://localhost:3000
```

### Docker 一键启动（含 Redis）
```bash
cd ebook-converter
docker-compose up -d
# 访问 http://localhost:3000
# 健康检查: curl http://localhost:3000/api/health
```

---

## VPS 部署（Hetzner CX22 / $5/月）

### 1. 服务器初始化

```bash
# SSH 登录
ssh root@your-vps-ip

# 更新系统
apt update && apt upgrade -y

# 创建普通用户
useradd -m -s /bin/bash ebook
usermod -aG sudo ebook
su - ebook
```

### 2. 安装依赖

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # v20.x

# Calibre（转换引擎核心）
apt install -y calibre
ebook-convert --version  # 验证安装

# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ebook
newgrp docker

# Git
apt install -y git
```
### 3. 克隆项目

```bash
git clone https://github.com/your-username/ebook-converter.git
cd ebook-converter
```

### 4. 配置环境变量

```bash
cp .env.example .env.production
nano .env.production
```

**必须修改的配置：**
```env
# Redis 连接（Docker 部署时可用 redis://redis:6379）
REDIS_URL=redis://localhost:6379

# 上传目录
UPLOAD_DIR=/tmp/ebook-uploads
MAX_FILE_SIZE_MB=10

# Calibre 路径
CALIBRE_PATH=ebook-convert

# 应用地址（域名）
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Cloudflare R2（可选，不配则用本地存储）
# R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
# R2_ACCESS_KEY_ID=xxx
# R2_SECRET_ACCESS_KEY=xxx
# R2_BUCKET_NAME=ebook-temp

# Supabase（可选，用户系统）
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 5. 构建和部署

```bash
# 安装依赖
npm ci --production

# 构建生产版本
npm run build

# 使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "ebook-converter" -- start
pm2 save
pm2 startup systemd

# 或者使用 Docker
docker-compose up -d --build
```
---

## Nginx 反向代理 + SSL

### 1. 安装 Nginx

```bash
apt install nginx -y
systemctl enable nginx
```

### 2. 创建站点配置

```bash
nano /etc/nginx/sites-available/ebook-converter
```

**配置文件内容：**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 安全头
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # 前端代理
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

### 3. 启用站点

```bash
ln -s /etc/nginx/sites-available/ebook-converter /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl reload nginx
```

### 4. 配置 SSL（Let's Encrypt）

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
certbot renew --dry-run
```
---

## Cloudflare CDN 配置

### 1. DNS 设置

1. 登录 Cloudflare Dashboard
2. 添加域名 your-domain.com
3. 添加 A 记录：
   - @ → VPS IP 地址（Proxy: ON）
   - www → VPS IP 地址（Proxy: ON）

### 2. SSL/TLS

- 模式：**Full**（或 Full Strict）
- 传输加密：TLS 1.2+

### 3. 性能优化

- **Auto Minify**: JS/CSS/HTML 勾选
- **Brotli 压缩**: 开启
- **HTTP/2**: 默认开启
- **Cache Rules**: 静态资源缓存 1 小时

---

## 监控和维护

### 健康检查

```bash
# 应用健康
curl -s http://your-domain.com/api/health | jq

# Redis 连接
redis-cli ping

# Calibre 可用
ebook-convert --version

# Docker 容器状态
docker ps
```

### 日志查看

```bash
# PM2 日志
pm2 logs ebook-converter

# Docker 日志
docker-compose logs -f app

# Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 磁盘清理

```bash
# 清理超过 1 天的临时文件
find /tmp/ebook-uploads -type d -mtime +1 -exec rm -rf {} \;

# 定期任务（crontab）
crontab -e
# 添加: 0 3 * * * find /tmp/ebook-uploads -type d -mtime +1 -exec rm -rf {} \;

# Docker 磁盘使用
docker system df
docker system prune -af  # 清理未使用的镜像
```
### 备份策略

```bash
# 数据库备份（Supabase）
# 通过 Supabase Dashboard 设置自动备份

# 配置文件备份
tar czf config-backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  /etc/nginx/sites-available/ \
  /etc/letsencrypt/

# 上传到远程存储
scp config-backup-*.tar.gz user@backup-server:/backups/
```

---

## 故障排查

### 问题 1: 转换失败

```bash
# 检查 Calibre 是否安装
which ebook-convert

# 检查权限
ls -la /tmp/ebook-uploads/

# 手动测试转换
ebook-convert test.epub test.pdf
```

### 问题 2: Redis 连接失败

```bash
# 检查 Redis 状态
systemctl status redis

# 检查端口
netstat -tlnp | grep 6379

# 重启 Redis
systemctl restart redis
```

### 问题 3: 内存不足

```bash
# 检查内存
freet -h

# 添加 Swap
dd if=/dev/zero of=/swapfile bs=1M count=1024
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

---

## Vercel 与 VPS 转换后端接线（Calibre 委派）

Vercel serverless 运行时**没有 Calibre 二进制**，因此 25 个走 Calibre 的格式在 Vercel 上无法转换。方案：Vercel 的 `/api/convert` 在设了 `CONVERSION_BACKEND_URL` 时，把上传**转发到装有 Calibre 的 VPS** 的 `/api/convert-internal`，再把结果流式返回。epub→zip 等纯透传格式无需后端，Vercel 本地即可完成。

### 前置条件

- VPS（`deploy-production` 部署的那台 Hetzner）已安装 Calibre（`ebook-convert --version` 可用）
- VPS 已从 `main` 重新部署，包含新的 `/api/convert-internal` 路由（见下）

### 步骤 1：重部署 VPS（拉取含 convert-internal 的新镜像）

```bash
ssh <你的 VPS>
cd /opt/ebook-converter
# 在 VPS 的 .env 中加入内部密钥（与 Vercel 侧一致）
echo "CONVERSION_INTERNAL_SECRET=$(openssl rand -hex 32)" >> .env
docker compose pull app
docker compose up -d app
# 校验内部端点已就绪（无密钥应返回 403）
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/convert-internal
# 期望输出: 403
```

### 步骤 2：在 Vercel 设置两个环境变量

Vercel Dashboard → 项目 → Settings → Environment Variables，添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CONVERSION_BACKEND_URL` | `https://<你的 VPS 域名或 IP>` | VPS 公网地址（需能被 Vercel 出网访问，建议套 Cloudflare/反向代理 + HTTPS） |
| `CONVERSION_INTERNAL_SECRET` | 与步骤 1 中 VPS `.env` 里的随机串**完全一致** | 校验转发请求，防开放代理 |

保存后 Vercel 会自动重建。

### 步骤 3：验证

```bash
# 1) 纯透传（Vercel 本地，无需后端）：应直接返回合法 ZIP
curl -F "file=@sample.epub" -F "source_format=epub" -F "target_format=zip" https://www.bookconv.com/api/convert -o out.zip
file out.zip   # 期望: Zip archive

# 2) Calibre 格式（经 VPS 委派）：应返回目标格式
curl -F "file=@sample.epub" -F "source_format=epub" -F "target_format=txt" https://www.bookconv.com/api/convert -o out.txt
file out.txt
```

> 注意：`deploy-production` 的 Verify 步骤仍 `curl https://bookconv.com/api/health`（命中 Vercel），不会校验 VPS。VPS 健康请单独 `curl http://localhost:3000/api/health`（VPS 本地 Redis+Calibre）自查。

---

## 成本估算

| 项目 | 费用 | 备注 |
|------|------|------|
| Hetzner CX22 VPS | $5/月 | 2vCPU/4GB/20GB SSD |
| 域名 (.com) | ~$10/年 | Namecheap / Cloudflare |
| Cloudflare CDN | $0 | 免费计划足够 |
| Supabase | $0 | 免费层 500MB DB |
| Cloudflare R2 | ~$1/月 | 10GB 存储 |
| **总计** | **~$7/月** | |

---

## 下一步优化

1. **CI/CD 自动化** — GitHub Actions 自动构建部署
2. **日志聚合** — 接入 Sentry 错误追踪
3. **性能监控** — 接入 Plausible 或自建 Statsig
4. **数据库迁移** — 从 Supabase 迁移到 PostgreSQL 托管
5. **批量转换** — 增加队列并发数和优先级
6. **用户系统** — 完整实现注册/登录/历史记录

---

*最后更新: 2026-07-12*