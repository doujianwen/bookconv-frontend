# 电子书转换工具站 - 部署指南

> **最后更新**: 2026-10-05（VPS 状态更正：荧光云实例已到期未续费）

> 📘 **新人先看这篇**：[`docs/新人部署上手指南-GitHub到Vercel.md`](./docs/新人部署上手指南-GitHub到Vercel.md) — 面向刚接手项目的开发者，讲清从 GitHub push 到 Vercel 上线的完整步骤与常见坑。本文件偏「VPS + Vercel + Cloudflare 全量方案与接线细节」。

## 当前生产状态

| 组件 | 状态 | 说明 |
|------|------|------|
| 前端 + API（Vercel） | ✅ 已上线 | `bookconv.com` → Vercel Serverless |
| VPS 后端（Calibre） | ❌ 已到期未续费 | 荧光云 VPS（`149.104.69.126`）**已到期、未续费，实例不可用**；Calibre 委派路径整体不可用 |
| Redis 队列 | ❌ 未使用 | Vercel serverless 不支持常驻 Worker，异步队列已降级为同步请求内处理 |

## 生产地址

- 网站：https://bookconv.com（Vercel，Cloudflare 代理）
- API：https://bookconv.com/api/convert

---

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

## VPS 部署（荧光云，实例已到期 — 当前不可用）

> ❌ **状态：已到期、未续费，实例当前不可用**（2026-10-05 用户核实）。
>
> 本节保留为**历史方案存档**，供将来重新采购时复用。**不要**把下列步骤当作现行可执行方案：`docker compose up`、`ssh root@149.104.69.126` 等命令在实例续费并重装前一律无效。
>
> 现行生产路径：网站与 API **完全运行在 Vercel**；Calibre 类格式依赖 CloudConvert fallback（额度有限，见文末「已知限制」）。

### VPS 信息（荧光云控制台 · 历史存档）

| 项目 | 值 |
|------|-----|
| 供应商 | 荧光云（曾误记为「莹云」，2026-10-05 更正） |
| IP 地址 | `149.104.69.126`（**已到期，地址不再分配**） |
| 实例 ID | `ecs-di00005bwn85`（**已到期，实例不可用**） |
| 机房 | SoftBank 日本节点 |
| SSH 端口 | 22 |
| 状态 | ❌ **已到期未续费，实例不可用**（此前误记为「已购待部署」） |

### SSH 密钥注入（**仅在重新采购并续费后**才需要执行）

> 原实例已到期，荧光云控制台已无法操作。以下步骤仅在**重新采购新实例**后适用，届时请把新实例 ID 与 IP 一并更新本表。

在荧光云控制台 → 新实例 → **重置密钥**，注入以下公钥（⚠️ 原实例已到期，当前无法执行）：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE+6weQvfTbp63GiuwTZb2bAj57pxWfhAEtzvF3vNLxS 7701484@qq.com
```

注入成功后即可 SSH 登录 —— ⚠️ **原实例已到期，以下命令当前无效**：
```bash
# ❌ 实例已到期未续费，此地址不再分配，不要执行
ssh root@149.104.69.126
```

### 1. 服务器初始化（SSH 登录后执行）

```bash
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
git clone https://github.com/doujianwen/ebook-converter.git
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
NEXT_PUBLIC_APP_URL=https://bookconv.com

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

## Vercel 部署（当前生产方案）

网站目前部署在 Vercel，无需 VPS。

### 1. 部署方式

- 连接 GitHub 仓库 `doujianwen/ebook-converter`
- 在 Vercel Dashboard → Settings → Environment Variables 配置以下变量：

| 变量 | 值 | 说明 |
|------|-----|------|
| `REDIS_URL` | `redis://localhost:6379` | Vercel 上不生效，仅作模板 |
| `UPLOAD_DIR` | `/tmp/ebook-uploads` | 临时文件目录 |
| `MAX_FILE_SIZE_MB` | `10` | 最大上传文件大小 |
| `CALIBRE_PATH` | `ebook-convert` | Docker 部署时才需要 |
| `NEXT_PUBLIC_APP_URL` | `https://bookconv.com` | 生产域名 |
| `CORS_ORIGINS` | `https://bookconv.com` | 允许的来源 |
| `LEMON_SQUEEZY_API_KEY` | (从 .env.production 复制) | 支付 API 密钥 |
| `LEMON_SQUEEZY_STORE_ID` | `438949` | Lemon Squeezy Store ID |
| `CLOUD_CONVERT_API_KEY` | (CloudConvert API Key) | CloudConvert 转换后端 API Key |

### 2. 注意事项

- Vercel Serverless 限制：无常驻进程，maxDuration=60s（Pro）
- `api/health` 会超时（Redis 不可达），但不影响转换功能
- Calibre 格式转换（25 个）在 Vercel 上仍返回 500，需接入 VPS 后端

---

## Nginx 反向代理 + SSL

> **Vercel 部署无需此步骤**，SSL 由 Vercel 自动配置。以下仅适用于 VPS 部署。

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

## Cloudflare CDN 配置（可选）

> **当前状态**：bookconv.com 已接入 Cloudflare（Proxy: ON），DNS 指向 Vercel IP `216.198.79.1`。

### 切换到 VPS 作为后端时的 DNS 变更

如果后续启用 VPS 后端，只需在 Vercel 设置环境变量，**无需修改 DNS**：

- `bookconv.com` 继续指向 Vercel（前端 + 透传格式）
- VPS 仅作为后端 Calibre 转换节点，通过 `CONVERSION_BACKEND_URL` 访问

### SSL/TLS

- 模式：**Full**（或 Full Strict）
- 传输加密：TLS 1.2+

### 性能优化

- **Auto Minify**：JS/CSS/HTML 勾选
- **Brotli 压缩**：开启
- **HTTP/2**：默认开启

---

## 运维命令

### Docker 管理

```bash
cd /opt/ebook-converter
docker-compose down
docker-compose up -d
docker logs -f app
docker image prune -af  # 清理未使用的镜像
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
free -h

# 添加 Swap
dd if=/dev/zero of=/swapfile bs=1M count=1024
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## Vercel 与 VPS 转换后端接线（Calibre 委派）

> ❌ **当前状态：此路径已不可用**（2026-10-05）。VPS 实例已到期未续费，不存在可委派的 Calibre 后端。
>
> 下文三步接线方案**仅作历史存档**。若将来重新采购 VPS，需先确认 CloudConvert 额度与 Vercel Hobby 60s 超时上限这两个已知限制是否已解决 —— 详见文末「已知限制」。
>
> 另注：本节原稿在此处与后文「前置条件」自相矛盾（一处写「尚未部署」、一处写「已安装 Calibre」）；两者均与「实例已到期」不符，已一并更正。

Vercel serverless 运行时**没有 Calibre 二进制**，因此 25 个走 Calibre 的格式在 Vercel 上无法转换。方案：Vercel 的 `/api/convert` 在设了 `CONVERSION_BACKEND_URL` 时，把上传**转发**到装 Calibre 的 VPS 的 `/api/convert-internal`，再把结果流式返回。epub→zip 等纯透传格式无需后端，Vercel 本地即可完成。

### 前置条件

- ~~VPS（荧光云 `149.104.69.126`）已安装 Calibre~~ ❌ **不成立**：该实例已到期，Calibre 从未在本项目部署成功
- ~~VPS 已从 `main` 重新部署~~ ❌ **不成立**：无实例可部署

> 这两条前置条件在原稿中写作已满足，实际均未发生。留着会让人以为「只差配两个环境变量就能上线」。

### 步骤 1：VPS 重部署（拉取含 convert-internal 的新镜像）

```bash
# ❌ 实例已到期未续费，以下步骤当前无效，仅供将来重购新实例时参考
ssh root@149.104.69.126
cd /opt/ebook-converter
# 生成并写入内部密钥（与 Vercel 侧一致）
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
| `CONVERSION_BACKEND_URL` | ~~`http://149.104.69.126`~~ ❌ 实例已到期，**当前无有效值** | 重新采购 VPS 后填入新公网地址（需能被 Vercel 出站访问） |
| `CONVERSION_INTERNAL_SECRET` | 与步骤 1 中 VPS `.env` 里的随机串完全一致 | 校验转发请求，防开放代理 |

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

> 注意：`deploy-production` 的 Verify 步骤从 `curl https://bookconv.com/api/health`（命中 Vercel），不会校验 VPS。VPS 健康请单独 `curl http://localhost:3000/api/health`（VPS 本地 Redis+Calibre）自查。

---

## 已知限制（2026-10-05 实测，VPS 关闭后）

VPS Calibre 后端已到期关闭后，转换能力受两条**互相独立**的限制约束：

| 限制 | 判据 | 影响 | 花钱能否解决 |
|------|------|------|--------------|
| **CloudConvert 额度** | 402 `Your account has run out of conversion credits`；免费档 10 credits/日 | 除 epub→txt、epub→zip 外的格式全部失败 | ✅ 充值可解（Package $17 / 1000 credits，不过期） |
| **Vercel Hobby 60s 硬上限** | 唯一生产锚点：`epub→mobi @ 2MB = 55098ms` | 余量仅 5s；线性外推 3MB≈83s✗ / 10MB≈275s✗ | ❌ **不可解** —— `maxDuration=300` 在 Hobby 上被静默忽略 |

**因此充值只能解 402，解不了超时。** 站点 `MAX_FILE_SIZE_MB = 10` 与 60s 上限互相矛盾，
大文件必然超时。若要支持大文件，只有三条路：升 Vercel Pro（$20/月）、换无平台上限的机器、
或改为异步 webhook（基础设施具备：`.env.production` 含 `SUPABASE_*`、`src/lib/queue.ts` 存在）。

⚠️ `MAX_POLL_ATTEMPTS = 55 × 2s = 110s` 的轮询设计永远等不到 50s 预算之外的结果。

## 成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| Vercel Hobby | $0/月 | 当前生产部署 |
| 域名 (.com) | ~$10/年 | Namecheap / Cloudflare |
| Cloudflare CDN | $0 | 免费计划足够 |
| Supabase | $0 | 免费层 500MB DB |
| Cloudflare R2 | ~$1/月 | 10GB 存储 |
| 荧光云 VPS | ❌ $0（已到期未续费） | 已停用；若恢复需重新采购 + 续费 |
| **当前总计** | **~$1/月** | 仅域名+R2 |

---

## 下一步优化

1. ~~**启用 VPS Calibre 后端**~~ ❌ 已作废：荧光云实例已到期未续费。Calibre 类格式现走 CloudConvert fallback，受额度与 60s 超时双重限制（见文末「已知限制」）
2. **CI/CD 自动化** — GitHub Actions 自动构建部署
3. **日志聚合** — 接入 Sentry 错误追踪
4. **性能监控** — 接入 Plausible 或自建 Statsig
5. **批量转换** — 增加队列并发数和优先级
6. **用户系统** — 完整实现注册/登录/历史记录

---

*最后更新：2026-10-05*
*当前生产：Vercel（bookconv.com）*
*后端：荧光云 VPS 149.104.69.126 —— **已到期未续费，实例不可用**（2026-10-05 核实；供应商名此前误记为「莹云」）*
*Calibre 委派路径已关闭；Vercel 本地仅 epub→txt / epub→zip 可用，其余格式依赖 CloudConvert*