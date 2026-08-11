# 案例项目事实核对表（bookconv.com）

> 核对方式：直接读取仓库 `package.json` / `node_modules` / `src` 源码，非二手描述。
> 核对时间：2026-08-10。工作目录 `ebook-converter`。
> 用途：课程所有技术表述以本表为准。任务简报中与本表冲突的部分，以本表为准。

## 一、与任务简报不一致处（必须修正课程文案）

| # | 简报表述 | 仓库实际 | 证据 | 影响 |
|---|----------|----------|------|------|
| F1 | Next.js 15 App Router | **Next.js 16.2.10** / React 19.2.4 | `node_modules/next/package.json` | 课程若讲 15，与录屏画面不符 |
| F2 | Calibre「仅做输入格式校验，缺输出验证」 | **输出验证已落地并已接线** | `src/lib/conversion-verifier.ts:162 verifyConversion()`，被 `conversion.ts:370,396` 与 `queue.ts:315` 调用 | 不能再作为「待办」讲；应改为「已有能力，可作为讲解素材」 |
| F3 | 用户存储内存 Map 需持久化 | **属实**，且仍未持久化 | `src/lib/auth/storage.ts:15` `const users: Map<string, StoredUser> = new Map()` | 真实待办，可作为课程改造对象 |
| F4 | 订阅状态待 Upstash 就绪 | **订阅已走 Redis**，非内存 | `src/lib/subscription.ts:2-4` 注释与 `getRedisClient()` | 待办应表述为「Redis 连接实例待就绪」，而非「未实现」 |
| F5 | 付费 webhook 用 `custom_data.email` 作订阅键 | **属实** | `src/app/api/payments/webhook/route.ts:66` | 可直接作为课程讲解案例 |

## 二、已确认为事实的技术栈

| 层 | 实际依赖 | 版本（已安装） |
|----|----------|----------------|
| 框架 | next | 16.2.10 |
| UI | react / react-dom | 19.2.4 |
| 样式 | tailwindcss | 4.3.2 |
| i18n | next-intl | 4.13.2（locale：en / es） |
| **图标** | **lucide-react** | **1.24.0（已在 23 个文件中使用）** |
| 校验 | zod | 4.4.3 |
| 队列 | bullmq + ioredis | 5.80.2 / 5.11.1 |
| 对象存储 | @aws-sdk/client-s3 + lib-storage | 3.1085.0（R2 策略见 `src/lib/storage/r2.ts`） |
| 监控 | @sentry/nextjs | 10.68.0 |
| API 文档 | redoc | 2.5.3（`src/app/api-docs`） |
| 测试 | jest + @swc/jest + playwright + supertest | 30.4.2 / 1.62.1 |

## 三、真实架构形态（源码读出，非推测）

### 路由
```
src/app/
├── api/                          非本地化 API 层
│   ├── auth/{login,logout,me,register}/route.ts
│   ├── convert/route.ts
│   ├── convert/[jobId]/{status,result}/route.ts
│   ├── convert-internal/route.ts
│   ├── payments/{checkout,webhook}/route.ts
│   ├── download/route.ts
│   └── health/route.ts
├── api-docs/                     Redoc 渲染
├── sitemap.ts                    全站派生入口
└── [locale]/                     本地化页面层
    ├── convert/[slug]            ← CONTENT_MAP 驱动
    ├── blog/[slug] + tag/[tag] + feed.xml
    ├── guide/[slug]
    ├── formats/[format]
    └── batch / pricing / tutorial / privacy / terms
```

**注意**：API 路由**没有** `/api/v1/` 版本前缀。这是与专家团 API 规范的既有偏差，课程中需明确说明「存量不改、新增遵循」。

### 单源数据 + index 注册（课程核心可复用模式）
- `src/data/content/*.ts` — 31 个转换页数据文件
- `src/data/content/index.ts` — 显式 `import * as X` + `CONTENT_MAP: Record<string, any>` 注册表
- `src/data/blog/` — 37 篇；`src/data/guides/` — 指南集；`src/data/formats.ts` — 格式元数据

### SEO 自动派生（`src/app/sitemap.ts`，89 行）
- `CONVERSION_PAGES = Object.keys(CONTENT_MAP)` — 直接以注册表为唯一真源
- `getAllPosts()` 过滤 `p.noindex` 后进入 sitemap
- 双 locale 循环：`en` 无前缀、`es` 加 `/es`
- 源码注释记录了一个真实历史 bug：曾用 `CONVERSION_MAP` 推导 slug，把 `epub-docx` 错推成 `epub-to-docx`（真实 slug 是 `epub-to-word`）——**这是课程「单一数据源为什么重要」的最佳真实教案**

### 产物
`public/`：`llms.txt`、`robots.txt`、`manifest.json`、`sw.js`、`og-image.svg`、`logo.svg`

## 四、仓库中发现的真实缺陷（课程「代码审查」环节现成素材）

| # | 位置 | 问题 | 严重度 |
|---|------|------|--------|
| D1 | `src/lib/auth/storage.ts:24-29` | `verifyPassword` 中 `providedKey` 计算后**从未使用**（死代码）；比较用字符串 `===`，**非常量时间**，存在时序侧信道 | 高 |
| D2 | `src/lib/auth/storage.ts:15` | 用户存 `Map`，serverless 多实例/冷启动即丢失 | 高 |
| D3 | `src/data/content/index.ts:32` | `CONTENT_MAP: Record<string, any>` — `any` 擦除类型，新增内容文件缺字段不报错 | 中 |
| D4 | 12 个源文件 | 含 emoji 字符（`✅` `❌` `✓`），违反 P0 规则；如 `components/tools/TrustBar.tsx:26`、`components/tools/BatchConversionGuide.tsx:37,40,43`、`data/content/djvu-to-pdf.ts:80-85` | P0 |
| D5 | `src/lib/queue.ts` | 661 行，超出单文件 300 行组织约束 | 中 |
| D6 | `src/app/api/test-post/route.ts` | 测试路由进入生产路由表 | 中 |

> D4 是 P0 违规，且**已存在于线上代码**。课程 Phase 5「质量门禁」可用它做真实整改演示，并把检测脚本固化为 CI 门禁。
