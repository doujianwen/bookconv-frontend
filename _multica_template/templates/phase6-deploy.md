## Phase 6: 生产部署

### 任务概述
完成 VPS 部署，包括 Nginx 反向代理、SSL 证书、监控。

### 具体要求
#### 1. VPS 准备
- Hetzner CX22 (2vCPU/4GB)
- Ubuntu 22.04 LTS
- Docker + Docker Compose

#### 2. Nginx 配置
- 反向代理 Next.js
- Gzip/Brotli 压缩
- HTTP → HTTPS 重定向

#### 3. SSL
- Let's Encrypt 证书
- 自动续期（certbot）

#### 4. 监控
- UptimeRobot / 自建 Health Check
- 错误日志告警
- 资源使用监控

### 参考文件
- DEPLOYMENT.md
- docker-compose.yml

### 优先级
P0 — 最高优先级
---