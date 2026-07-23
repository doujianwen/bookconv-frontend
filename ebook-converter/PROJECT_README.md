# BookConv 电子书格式转换站

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [功能列表](#功能列表)
- [开发环境搭建](#开发环境搭建)
- [本地运行](#本地运行)
- [测试](#测试)
- [生产部署](#生产部署)
- [API 文档](#api-文档)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)

---

## 项目概述

BookConv 是一个基于 Next.js 的在线电子书格式转换平台，支持 **28+ 种格式的互相转换**，包括 EPUB、PDF、MOBI、AZW3、TXT、DOCX、FB2、LIT、RTF 等。

核心转换引擎使用 Calibre (`ebook-convert`)，通过 BullMQ + Redis 队列实现异步处理，支持 Pro 用户批量转换和优先队列。

| 指标 | 数值 |
|------|------|
| 源代码文件 | ~115 个 (TypeScript/TSX) |
| 测试文件 | ~16 个 (Jest + Playwright) |
| 支持的格式对 | 26 种转换路径 |
| 页面数量 | ~40+ (含 SEO 内容页) |
| 多语言 | EN / ES |

---

## 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | Next.js | 16.2.10 | Web 框架、SSR、API Routes |
| **语言** | TypeScript | latest | 类型安全 |
| **样式** | Tailwind CSS | v4 | 原子化 CSS |
| **国际化** | next-intl | 4.13.2 | EN/ES 双语言 |
| **任务队列** | BullMQ | 5.80.2 | 异步转换任务管理 |
| **Redis** | ioredis | 5.11.1 | 队列持久化 + 限速 |
| **存储** | AWS S3 SDK | 3.1085 | Cloudflare R2 对象存储 |
| **支付** | Lemon Squeezy | — | Pro/Plan 订阅支付 |
| **认证** | Supabase Auth | — | 用户注册登录 |
| **构建** | Turbopack | Next.js 内置 | 快速编译 |
| **测试** | Jest + Playwright | latest | 单元测试 + E2E 测试 |
| **文件上传** | Busboy | 1.6.0 | Multipart/form-data 解析 |
| **测试文件生成** | adm-zip, form-data | latest | 自动化测试 fixture |

---

## 项目结构

```
ebook-converter/
├── src/                          # 源代码
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── convert/          # 转换 API (单文件 + 批量)
│   │   │   │   ├── route.ts      # POST /api/convert - 上传并排队
│   │   │   │   ├── [jobId]/      # GET status/result 查询
│   │   │   │   └── batch/        # POST/GET batch conversion
│   │   │   ├── download/         # GET /api/download - 下载结果
│   │   │   ├── health/           # GET /api/health - 健康检查
│   │   │   └── payments/         # Lemon Squeezy webhook
│   │   ├── auth/                 # 认证路由 (Supabase callback)
│   │   ├── blog/                 # 博客页面
│   │   ├── convert/[slug]/       # 转换工具页面
│   │   │   └── ToolPageClient.tsx # 核心转换 UI 组件
│   │   ├── formats/              # 格式科普页
│   │   ├── pricing/              # 定价页
│   │   ├── privacy/              # 隐私政策
│   │   ├── terms/                # 服务条款
│   │   ├── page.tsx              # 首页
│   │   └── sitemap.ts            # 动态站点地图
│   ├── lib/                      # 核心业务逻辑
│   │   ├── queue.ts              # BullMQ 队列 + Worker
│   │   ├── rate-limit.ts         # Redis 滑动窗口限速
│   │   ├── redis.ts              # Redis 客户端
│   │   ├── batch-store.ts        # 批量转换持久化
│   │   ├── storage/              # 存储策略 (R2 + 本地)
│   │   ├── auth.ts               # 用户认证辅助
│   │   ├── payments/             # 支付服务
│   │   ├── subscription.ts       # 订阅管理
│   │   ├── seo/                  # JSON-LD Schema
│   │   ├── logger.ts             # 结构化日志
│   │   ├── error-handler.ts      # 错误脱敏
│   │   ├── constants.ts          # SEO 关键词
│   │   ├── conversion-map.ts     # 28+ 格式映射
│   │   └── utils.ts              # 通用工具
│   ├── components/               # React 组件
│   │   ├── tools/                # 转换页面专用组件
│   │   └── ui/                   # 共享 UI 组件
│   └── data/                     # 静态数据
│       ├── formats.ts            # 格式信息
│       ├── testimonials.ts       # 用户评价
│       └── blog/                 # 博客文章
├── tests/                        # 测试套件
│   ├── unit/                     # 单元测试 (12 files)
│   ├── boundary/                 # 边界测试
│   ├── performance/              # 性能测试
│   ├── e2e/                      # E2E 测试
│   │   └── convert-full-test.js  # 全量转换测试脚本
│   └── fixtures/                 # 测试用样例文件
├── public/                       # 静态资源
├── messages/                     # i18n 翻译文件
├── package.json                  # 依赖配置
├── Dockerfile                    # Docker 镜像定义
├── playwright.config.ts          # Playwright 配置
└── jest.config.cjs               # Jest 配置
```

---

## 功能列表

### 核心功能

| 功能 | 说明 | API |
|------|------|-----|
| **单文件转换** | 上传一个文件，指定目标格式 | `POST /api/convert` |
| **批量转换** | 一次上传多个文件，统一格式输出 | `POST /api/convert/batch` |
| **Job 状态查询** | 轮询查看转换进度 | `GET /api/convert/:jobId/status` |
| **获取结果** | 获取转换后的文件或下载链接 | `GET /api/convert/:jobId/result` |
| **下载文件** | 带速率限制的下载接口 | `GET /api/download` |
| **健康检查** | 检查 Redis + Calibre 可用性 | `GET /api/health` |

### 安全特性

- **CSP** — Content Security Policy 头部
- **限流** — Redis 滑动窗口速率限制（按 IP）
- **错误脱敏** — 堆栈跟踪和内部路径过滤
- **文件验证** — Magic byte 格式校验
- **文件大小** — 10MB 限制
- **临时清理** — 自动清理过期 temp 目录

### SEO

- 动态 `sitemap.xml`
- `robots.txt` 保护 API 端点
- Open Graph + Twitter Card
- JSON-LD Schema（HowTo, FAQ, SoftwareApplication）
- 40+ SEO 内容页面（每页 1200-6000 字）
- 内部链接矩阵（RelatedConversions 组件）

---

## 开发环境搭建

### 前置条件

- **Node.js ≥ 20**
- **Redis** — 用于作业队列和限流
- **Calibre** — 转换引擎（Windows: 下载后设置环境变量 `CALIBRE_PATH`）

### 安装步骤

```bash
# 克隆项目
cd ebook-converter

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，确保 REDIS_URL 指向你的 Redis
```

### Redis

安装 Redis（推荐用 WSL2、Docker 或 Windows 版）：

```bash
# 本地 Redis 默认端口 6379
# .env 中配置: REDIS_URL=redis://localhost:6379
```

### 启动开发服务器

```bash
npm run dev
# → http://localhost:3000
```

Worker 会自动启动（已在 queue.ts 中配置 dev 模式自动启动）。

---

## 测试

### 单元测试

```bash
npm test
```

覆盖模块：
- 转换 map 和数据常量
- 文件格式识别
- MIME 类型映射
- 限速策略
- API 验证逻辑
- 边界条件测试

### E2E 全量转换测试

```bash
node tests/e2e/convert-full-test.js
```

测试脚本会：
1. 自动生成 10 种格式的测试文件（EPUB、PDF、TXT、DOCX 等）
2. 遍历所有 26 个转换路径
3. 通过 API 提交每个转换
4. 轮询等待完成并验证状态
5. 输出完整报告（通过率、耗时、失败详情）

```
📊 测试结果汇总
  转换路径: 26  |  ✅ 17  |  ❌ 0  |  ⊘ 9
  总耗时:   35.0s  |  通过率:   65.4%
```

跳过的是 azw3/mobi/cbr/djvu 等二进制格式（无法程序化生成 valid fixture）。

---

## 生产部署

### Standalone 部署（推荐）

Next.js standalone 输出已包含所有必要文件：

```bash
# 1. 构建生产版本
npx next build --webpack

# 2. 产物位于 .next/standalone/
#    包含: server.js + node_modules + .next/static

# 3. 复制到服务器后启动:
NODE_ENV=production node server.js
```

### Docker 部署

```bash
# 构建镜像（需要联网拉取 calibre）
docker build -t bookconv:test .

# 运行
docker run -p 3000:3000 \
  --env-file .env.production \
  bookconv:test
```

### 推荐的服务器

根据项目的轻量级特性（Node.js 单进程 + Redis），推荐以下方案：

| 提供商 | 推荐套餐 | 月费 | 适用场景 |
|--------|---------|------|---------|
| **Vercel** | Hobby 免费 | ¥0 | 首选推荐，国内 CDN 加速，自动 CI/CD |
| **Railway** | Starter | $5 | 内置 Redis，零配置部署 |
| **Hetzner** | CX22 | €4 | 性价比最高，但需自行管理 Redis |
| **DigitalOcean** | Droplet 2GB | $12 | 稳定可靠，有台湾节点 |
| **阿里云 ECS** | 入门型 | ¥30+ | 国内访问快，需自行安装依赖 |

**推荐 Vercel** 的原因：
- 直接连接 GitHub，push 自动部署
- 国内 CDN 加速（这对电子书站点的用户体验很关键）
- 免费版足以支撑初期流量
- 支持自定义域名和 HTTPS
- 内建环境变量管理
- 唯一的缺点：**不支持后台 Worker**，需要改用 Supabase Edge Functions 或 Serverless Cron

---

## API 文档

完整的 OpenAPI 规范在 `public/api-docs/openapi.json`。

### 主要端点

```
POST /api/convert              # 上传文件并创建转换任务
GET  /api/convert/:jobId/status # 查询任务状态
GET  /api/convert/:jobId/result # 获取转换结果
GET  /api/download             # 下载转换后的文件
GET  /api/health               # 健康检查
POST /api/convert/batch        # 批量转换
```

### 请求示例

```bash
# 1. 提交转换
curl -X POST http://localhost:3000/api/convert \
  -F "file=@book.epub" \
  -F "source_format=epub" \
  -F "target_format=pdf"

# 返回: {"jobId": "uuid", "status": "queued", "message": "Conversion started"}

# 2. 查询状态
curl http://localhost:3000/api/convert/<jobId>/status

# 3. 获取结果（当 status=completed 时）
curl http://localhost:3000/api/convert/<jobId>/result
```

---

## 环境变量配置

完整的环境变量说明见 `.env.example`，关键项如下：

### 必须配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `REDIS_URL` | Redis 连接地址 | `redis://your-redis-host:6379` |
| `UPLOAD_DIR` | 临时文件存储路径 | `/tmp/ebook-uploads` |
| `CALIBRE_PATH` | Calibre 可执行路径 | `ebook-convert` |

### 可选配置

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_*` | Supabase 认证 |
| `LEMON_SQUEEZY_*` | 订阅支付 |
| `R2_*` | Cloudflare R2 存储 |
| `CONVERT_RATE_LIMIT_MAX` | 单 IP 每分钟转换次数上限 |
| `ANONYMOUS_RATE_LIMIT_MAX` | 单 IP 每分钟普通请求上限 |

---

## 常见问题

### Q: Worker 没有启动？

A: 检查 Redis 是否可达。`/api/health?verbose=true` 可查看所有依赖状态。

### Q: 转换失败怎么办？

A: 检查 Calibre 安装：
```bash
ebook-convert --version
```

### Q: 如何修改最大文件大小？

A: 设置环境变量 `MAX_FILE_SIZE_MB=10`。

### Q: 如何自定义限流阈值？

A: 修改 `.env` 中的 `CONVERT_RATE_LIMIT_MAX` 和 `ANONYMOUS_RATE_LIMIT_MAX`。

---

## 贡献指南

### 代码规范

- 使用 TypeScript strict mode
- API 路由必须有错误处理和速率限制
- 新格式需要更新 `conversion-map.ts`
- 所有功能变更应附带测试

### 测试覆盖率

当前测试覆盖了核心业务逻辑（转换队列、限速、边界条件等）。新增功能建议：
1. 添加单元测试
2. 将测试文件加入 `tests/fixtures/`
3. 跑全量 E2E 确认无回归
