# ?? 电子书转换工具站

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Calibre](https://img.shields.io/badge/Engine-Calibre-green)](https://calibre-ebook.com)

基于 Next.js + Calibre 的电子书在线转换平台，支持 28 种格式组合。

## ? 功能特性

- **28 种格式转换** — EPUB、AZW3、MOBI、PDF、TXT、DOCX 等主流格式互转
- **异步队列处理** — BullMQ + Redis，支持并发转换不阻塞
- **响应式设计** — Tailwind CSS 4，移动端优先
- **SEO 优化** — SSG 静态生成 + 程序化 SEO + Schema 结构化数据
- **用户系统** — Supabase OAuth 登录（可选）
- **对象存储** — Cloudflare R2 临时文件管理（可选）

## ?? 快速开始

### 环境要求

- Node.js >= 20
- Calibre（ebook-convert 命令）
- Redis（异步队列，可选但推荐）

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

- 域名：https://bookconv.com
- 源代码：https://github.com/doujianwen/ebook-converter
- **当前无需 VPS**，纯透传格式（epub→zip 等）在 Vercel 本地可完成
- Calibre 格式转换（25 个）需接入 VPS 后端，详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

### VPS 部署

详细指南见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## ?? API 文档

### 异步转换 API

`ash
# 提交转换任务
curl -X POST http://localhost:3000/api/convert \
  -F 'file=@test.epub' \
  -F 'source_format=epub' \
  -F 'target_format=azw3'

# 查询状态
curl http://localhost:3000/api/convert/{jobId}/status

# 下载结果
curl -O http://localhost:3000/api/convert/{jobId}/result
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
│   ├── convert/[slug]/   # 工具页（28 个）
│   └── page.tsx          # 首页
├── src/components/       # React 组件
├── src/data/content/     # 格式化内容
├── src/lib/              # 工具库
│   ├── queue.ts          # BullMQ 队列
│   ├── redis.ts          # Redis 连接
│   ├── conversion-map.ts # 28 种格式映射
│   ├── storage/r2.ts     # R2 存储
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
| 转换引擎 | Calibre CLI | 28 种格式支持 |
| 异步队列 | BullMQ + Redis | 非阻塞转换 |
| 存储 | Cloudflare R2 / 本地 | 临时文件 |
| 数据库 | Supabase (PostgreSQL) | 用户系统（可选）|
| 部署 \| Vercel（已上线）+ Docker/VPS（可选） |

## ?? 支持的格式（28 种）

| 类别 | 格式 | 数量 |
|------|------|------|
| eBook | EPUB, AZW3, MOBI, LIT, FB2 | 5 |
| 文档 | DOC, DOCX, RTF, TXT, HTML | 5 |
| PDF | PDF | 1 |
| 图像 | JPG, PNG | 2 |
| 漫画 | CBR | 1 |
| **转换组合** | 28 种格式互转 | **28** |

## ?? 内容策略

| 级别 | 关键词数 | 每页字数 | 示例 |
|------|---------|---------|------|
| S 级 | 3 | 3000+ | lit→epub, pdf→epub, epub→txt |
| A 级 | 7 | 2000+ | epub→azw3, azw3→epub 等 |
| B 级 | 18 | 1000+ | 长尾低流量词 |

## ?? 环境变量

`env
# 必填
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=/tmp/ebook-uploads
CALIBRE_PATH=ebook-convert

# 可选 - Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=ebook-temp

# 可选 - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
`

## ?? 故障排查

| 问题 | 解决方案 |
|------|----------|
| 转换失败 | 检查 Calibre: \ebook-convert --version\ |
| Redis 连接失败 | 检查 Redis: \edis-cli ping\ |
| 内存不足 | 添加 Swap: \dd if=/dev/zero of=/swapfile bs=1M count=1024\ |

## ?? License

MIT

---

*Built with ?? using Next.js + Calibre*
