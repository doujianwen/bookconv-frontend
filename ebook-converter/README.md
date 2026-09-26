# ?? 电子书转换工具站

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Calibre](https://img.shields.io/badge/Engine-Calibre-green)](https://calibre-ebook.com)

基于 Next.js + Calibre 的电子书在线转换平台，支持 **31 个格式转换对**（18 种格式标识）。

> ⚠️ **2026-09-26 修订**：本文件曾与代码脱节。以下旧描述已失效——
> 「异步队列 BullMQ + Redis」（实为**请求内同步转换**，队列已废弃，见 `诊断_转换管线生产故障_2026-08-04.md`）、
> 「Supabase OAuth」（实为**手写 HS256 JWT + scrypt**，Supabase 已移除）、「28 种格式」（实为 **31**）。
> 详见 [PROJECT_README.md](./PROJECT_README.md) 顶部声明。

## ? 功能特性

- **31 个格式转换对** — EPUB、AZW3、MOBI、PDF、TXT、DOCX 等主流格式互转
- **请求内同步转换** — 上传后直接流式返回文件，无队列、无轮询、无 jobId
- **响应式设计** — Tailwind CSS 4，移动端优先
- **SEO 优化** — SSG 静态生成 + 程序化 SEO + Schema 结构化数据
- **用户系统** — 手写 JWT（HS256）+ scrypt 密码哈希；`DATABASE_URL` 存在时持久化到 Postgres
- **对象存储** — Cloudflare R2（`lib/storage/` 已编码但主链路未接线，仅 `api/download` 直连）

## ?? 快速开始

### 环境要求

- Node.js >= 20
- Calibre（`ebook-convert` 命令；Vercel 运行时不含，需转发到 VPS/Docker 后端）
- Redis（可选，仅用于限流与订阅态缓存；**不配置会降级为内存限流**）

### 本地开发

`ash
npm install
npm run dev
# 访问 http://localhost:3000
`

### Docker 部署

`ash
docker-compose up -d
curl http://localhost:3000/api/health
`

### Vercel 部署（当前生产）

网站已部署在 [Vercel](https://vercel.com)，自动从 GitHub `main` 分支构建。

- 域名：https://www.bookconv.com
- 源代码：https://github.com/doujianwen/bookconv-frontend（⚠️ 旧文档写作 `ebook-converter`，仓库名已更正）
- **纯透传格式**（epub→zip 等）在 Vercel 本地可完成，无需 VPS
- 依赖 Calibre 的转换需设置 `CONVERSION_BACKEND_URL` 转发到 VPS 后端，详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

### VPS 部署

详细指南见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## ?? API 文档

### 同步转换 API（无 jobId 轮询）

`ash
# 提交转换：直接返回转换后的文件字节（不是 jobId）
curl -X POST http://localhost:3000/api/convert \
  -F 'file=@test.epub' \
  -F 'source_format=epub' \
  -F 'target_format=azw3' \
  -o result.azw3

# ⚠️ 不存在 /status、/result 轮询流程
#    这两个端点是孤儿端点（查询一个永不入队的空队列），已废弃
`

### 健康检查

`ash
curl http://localhost:3000/api/health
# 返回: { status: "ok", timestamp: "..." }
`

## ??? 项目结构

`
ebook-converter/
├── src/app/              # Next.js App Router
│   ├── api/convert/      # 转换 API 路由
│   ├── blog/[slug]/      # 博客文章页
│   ├── convert/[slug]/   # 工具页（31 个）
│   └── page.tsx          # 首页
├── src/components/       # React 组件
├── src/data/content/     # 格式化内容
├── src/lib/              # 工具库
│   ├── convert-handler.ts# ★ 真实转换执行与流式回吐
│   ├── conversion.ts     # ★ Calibre / 纯 JS / CloudConvert
│   ├── queue.ts          # ⚠️ BullMQ 队列 — 死代码（无 .add()，勿用）
│   ├── redis.ts          # Redis 连接（仅限流 / 订阅缓存）
│   ├── conversion-map.ts # 31 个转换对映射
│   ├── storage/r2.ts     # R2 存储（主链路未接线）
│   └── seo/              # SEO 工具
├── DEPLOYMENT.md         # 部署指南
├── docker-compose.yml    # Docker Compose
├── Dockerfile            # Docker 镜像
└── .env.example          # 环境变量模板
`

## ?? 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16 + React 19 | SSR/SSG，App Router |
| 样式 | Tailwind CSS 4 | 原子化 CSS |
| 转换引擎 | Calibre CLI | 31 个转换对；`epub→txt` 走纯 JS，无需 Calibre |
| 转换模式 | **请求内同步**（`convert-handler.ts`） | 直接流式回吐文件字节 |
| 异步队列 | ⚠️ BullMQ + Redis — **死代码** | 已废弃，勿恢复（曾致 100% 504） |
| 存储 | Cloudflare R2 / 本地 | `lib/storage/` 主链路未接线 |
| 数据库 | PostgreSQL（可选） | 手写 JWT 用户存储；无 `DATABASE_URL` 时退化为内存 Map |
| 认证 | HS256 JWT + scrypt | Supabase 已移除 |
| 支付 | Lemon Squeezy | Pro / API 订阅（真实可用） |
| 部署 | Vercel（已上线）+ Docker/VPS（Calibre 后端） | Vercel 经 `CONVERSION_BACKEND_URL` 转发 |

## ?? 支持的格式（18 种标识 / 31 个转换对）

| 类别 | 格式 | 数量 |
|------|------|------|
| eBook | EPUB, AZW3, MOBI, AZW, LIT, FB2 | 6 |
| 文档 | DOC, DOCX, RTF, TXT, HTML, CHM | 6 |
| PDF / 扫描 | PDF, DJVU | 2 |
| 图像 | JPG, PNG | 2 |
| 漫画 / 归档 | CBR, ZIP | 2 |
| **转换组合** | 见 `src/lib/conversion-map.ts` | **31** |

## ?? 内容策略

| 级别 | 关键词数 | 每页字数 | 示例 |
|------|---------|---------|------|
| S 级 | 3 | 3000+ | lit→epub, pdf→epub, epub→txt |
| A 级 | 7 | 2000+ | epub→azw3, azw3→epub 等 |
| B 级 | 18 | 1000+ | 长尾低流量词 |

## ?? 环境变量

`env
# 必填
UPLOAD_DIR=/tmp/ebook-uploads
CALIBRE_PATH=ebook-convert

# 可选（仅限流与订阅缓存；不配则降级为内存限流）
# ⚠️ 配了但网络不可达会让 /api/health 与转换接口整体挂死，不确定就别配
# REDIS_URL=redis://localhost:6379

# 可选 - Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=ebook-temp

# 可选 - 用户持久化（认证实际为手写 JWT，不走 Supabase）
# DATABASE_URL=postgres://...
# ⚠️ NEXT_PUBLIC_SUPABASE_* 配置项仍在 .env.example 中，但代码已移除 Supabase（见 src/lib/auth.ts）
`

## ?? 故障排查

| 问题 | 解决方案 |
|------|----------|
| 转换失败（Vercel 上） | Vercel 运行时**不含 Calibre**：设置 CONVERSION_BACKEND_URL 转发到 VPS/Docker 后端 |
| 转换失败（本地） | 检查 Calibre：ebook-convert --version，或确认 CALIBRE_PATH 指向正确路径 |
| /api/health 挂起超时 | 极可能 REDIS_URL 指向不可达主机（ioredis 无限重连）。摘掉该变量即可恢复 |
| 改动 push 后没生效 | 构建失败时 Vercel 会继续服务旧版本，站点看起来正常。必须跑 npm run build 并做线上断言 |
| 内存不足 | 添加 Swap：dd if=/dev/zero of=/swapfile bs=1M count=1024 |

## ?? License

MIT

---

*Built with ?? using Next.js + Calibre*
