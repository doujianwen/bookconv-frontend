# BookConv 电子书格式转换站

> ⚠️ **文档可信度声明（2026-09-26 修订）**
> 本文件曾长期未随代码更新，以下描述已**失效**，请勿作为依据：
> - ❌「BullMQ + Redis 异步队列」→ 实际为**请求内同步转换**。异步队列在 Vercel serverless 上 100% 504（见 `诊断_转换管线生产故障_2026-08-04.md`），已刻意废弃
> - ❌「Supabase Auth」→ 实际为**手写 HS256 JWT + scrypt**（`src/lib/auth`），Supabase 已移除（见 `src/lib/auth.ts:4` 注释）
> - ❌「28+ 种格式 / 26 种转换路径」→ 实际 **31 个转换对**，涉及 **18 种格式标识**
> - ❌「`GET /api/convert/:jobId/status|result` 可用」→ 这两个端点查的是一个永不入队的空队列，属**孤儿端点**
> - ❌「`lib/storage/` R2 已接线」→ 代码存在但主链路**零引用**，仅 `api/download` 直连
>
> **唯一权威真相是代码**：`src/lib/conversion-map.ts`、`src/lib/convert-handler.ts`、`src/lib/auth`。
> 有疑问以 `docs/seo-geo-execution-plan-2026-09-17.md` 与代码实测为准。

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

BookConv 是一个基于 Next.js 的在线电子书格式转换平台，支持 **31 个格式转换对**（涉及 18 种格式标识），包括 EPUB、PDF、MOBI、AZW3、TXT、DOCX、FB2、LIT、RTF 等。

核心转换引擎使用 Calibre (`ebook-convert`)，**在请求内同步执行**并直接流式回吐文件字节（无队列、无落盘、无 jobId）。Vercel 侧无 Calibre，需通过 `CONVERSION_BACKEND_URL` 转发到具备 Calibre 的 Docker/VPS 后端（`POST /api/convert-internal`）。批量转换 `/batch` 有 Pro 门禁。

| 指标 | 数值（2026-09-26 实测） |
|------|------|
| 源代码文件 | 246 个（196 ts + 50 tsx） |
| 测试文件 | 10 个单元（`tests/unit/`）+ 边界 + 性能 + Playwright E2E |
| 支持的格式对 | **31 个**（`CONVERSION_MAP`） |
| 涉及格式标识 | **18 种** |
| sitemap URL 数 | **150 个**（en 129 + es 21）— 2026-09-26 运行 `sitemap.ts` 实测 |
| 各路由页面数 | convert **31** · formats **17** · guide **22** · blog **66**（其中 65 入 sitemap，1 篇 noindex）· compat **1** |
| ⚠️ sitemap 覆盖 | `formats/*`(17) 与 `compat/*`(1) **不在 sitemap 输出内**（实测计数均为 0），但它们仍是可访问路由。勿把"页面数"与"sitemap URL 数"混为一谈 |
| 多语言 | EN / ES（UI 文案全覆盖；**内容层西语仅 9 页**，为已知短板） |

---

## 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | Next.js | 16.2.10 | Web 框架、SSR、API Routes |
| **语言** | TypeScript | latest | 类型安全 |
| **样式** | Tailwind CSS | v4 | 原子化 CSS |
| **国际化** | next-intl | 4.13.2 | EN/ES 双语言 |
| **任务队列** | BullMQ | 5.80.2 | ⚠️ **已废弃死代码**，全仓无 `.add()` 调用，勿恢复（详见顶部声明） |
| **Redis** | ioredis | 5.11.1 | 仅用于**限速**与订阅态缓存（30d TTL），不再承载队列 |
| **存储** | AWS S3 SDK | 3.1085 | ⚠️ `lib/storage/` 已编码但**主链路零引用**，仅 `api/download` 直连 |
| **支付** | Lemon Squeezy | — | Pro/API 订阅支付（真实可用：checkout + webhook HMAC） |
| **认证** | 手写 JWT + scrypt | — | HS256（Web Crypto）+ scrypt 哈希；有 `DATABASE_URL` 走 Postgres，否则内存 Map（重启丢失） |
| **构建** | Webpack | `next build --webpack` | 见 `package.json`（README 旧称 Turbopack，实际脚本带 `--webpack`） |
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
│   │   ├── queue.ts              # ⚠️ BullMQ 队列 + Worker — 死代码（无 .add()，勿用）
│   │   ├── convert-handler.ts    # ★ 真实转换执行与流式回吐入口
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
│   │   ├── conversion-map.ts     # 31 个转换对映射（key 形如 epub-azw3）
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
| **单文件转换** | 上传一个文件，指定目标格式，**同步返回文件字节** | `POST /api/convert` |
| **批量转换** | 一次上传多个文件，统一格式输出（Pro 门禁） | `POST /api/convert/batch` |
| ~~Job 状态查询~~ | ⚠️ **孤儿端点**，查询永不入队的空队列，勿用 | ~~`GET /api/convert/:jobId/status`~~ |
| ~~获取结果~~ | ⚠️ **孤儿端点**，同上 | ~~`GET /api/convert/:jobId/result`~~ |
| **下载文件** | 带速率限制的下载接口 | `GET /api/download` |
| **健康检查** | 检查 Redis + Calibre 可用性 | `GET /api/health` |
| **内部转换端** | VPS/Docker 上的 Calibre 执行端，共享密钥保护 | `POST /api/convert-internal` |

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
- **Redis** — 仅用于**限流**与订阅态缓存（可选：未配置时降级为内存限流）。**不再承载作业队列**
- **Calibre** — 转换引擎（Windows: 下载后设置环境变量 `CALIBRE_PATH`）。Vercel 运行时**不含** Calibre，需 `CONVERSION_BACKEND_URL` 转发到 VPS/Docker

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

~~Worker 会自动启动（已在 queue.ts 中配置 dev 模式自动启动）。~~
> ⚠️ 该描述已失效：**没有 worker**。转换在请求内同步完成（`src/lib/convert-handler.ts`）。
> `src/lib/queue.ts` 与 `worker/` 均为死代码，见顶部声明。

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

> ⚠️ **本节已失效，保留仅为存档**：`tests/e2e/convert-full-test.js` **当前不存在**
> （`tests/e2e/` 下只有 `fixtures/` 与 `health.spec.ts`）。下方命令无法执行，结果输出为 2026-08 快照。
> 与当前代码的差异：转换路径应为 **31**（非 26）；**无轮询**——提交后同步返回文件字节。

```bash
node tests/e2e/convert-full-test.js   # ⚠️ 文件已不存在，命令会失败
```

历史快照（2026-08）声称的流程：
1. 自动生成 10 种格式的测试文件（EPUB、PDF、TXT、DOCX 等）
2. 遍历转换路径（旧称 26 个，实为 31 个）
3. 通过 API 提交每个转换
4. ~~轮询等待完成并验证状态~~ → 实际为**同步返回文件字节**后直接校验

```
📊 历史输出结果（勿当作当前状态）
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
- 2026-08-04 实测教训：**不支持后台 Worker 曾导致 100% 转换 504**。解法不是换 Edge Functions，而是**取消队列、改为请求内同步转换**（`maxDuration = 300`）。详见 `诊断_转换管线生产故障_2026-08-04.md`

---

## API 文档

完整的 OpenAPI 规范在 `public/api-docs/openapi.json`。

### 主要端点

```
POST /api/convert              # 上传文件，同步执行并返回转换后文件字节
POST /api/convert/batch        # 批量转换（Pro 门禁）
POST /api/convert-internal     # 内部端：VPS/Docker 上的 Calibre 执行端（共享密钥保护）
GET  /api/download             # 下载转换后的文件
GET  /api/health               # 健康检查
~~GET  /api/convert/:jobId/status~~  # ⚠️ 孤儿端点（空队列），勿用
~~GET  /api/convert/:jobId/result~~  # ⚠️ 孤儿端点（空队列），勿用
```

### 请求示例

```bash
# 1. 提交转换
curl -X POST http://localhost:3000/api/convert \
  -F "file=@book.epub" \
  -F "source_format=epub" \
  -F "target_format=pdf"

# 返回：转换后的文件字节流（不是 jobId）
# 例：Content-Type 为目标格式 mime，body 即文件内容
curl -X POST http://localhost:3000/api/convert \
  -F "file=@book.epub" \
  -F "source_format=epub" \
  -F "target_format=pdf" \
  -o book.pdf

# 注意：不存在 jobId / 轮询流程。旧版的 status、result 端点是孤儿端点，已废弃。
```

---

## 环境变量配置

完整的环境变量说明见 `.env.example`，关键项如下：

### 必须配置

| 变量 | 说明 | 示例 |
|------|------|------|
| `UPLOAD_DIR` | 临时文件存储路径 | `/tmp/ebook-uploads` |
| `CALIBRE_PATH` | Calibre 可执行路径 | `ebook-convert` |

> `REDIS_URL` 已从「必须」降级为**可选**：仅用于限流与订阅态缓存，未配置时降级为内存限流。
> ⚠️ 若配置了一个**网络不可达**的 Redis，曾导致 `/api/health` 与转换接口整体挂死（ioredis `maxRetriesPerRequest: null` 使 Promise 永不 resolve）。**不确定就不要配。**

### 可选配置

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_*` | ⚠️ 配置项保留但**代码未接线**（Supabase 已移除）。认证实际走 `DATABASE_URL`（Postgres）或内存 Map |
| `DATABASE_URL` | 用户持久化；未设置时退化为内存 Map（重启即丢） |
| `CONVERSION_BACKEND_URL` | 具备 Calibre 的后端地址；设置后 Vercel 转发转换请求 |
| `CONVERSION_INTERNAL_SECRET` | 上述内部端的共享密钥 |
| `CLOUD_CONVERT_API_KEY` | Calibre 不可用时的付费兜底 |
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
