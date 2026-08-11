# 「AI 独立开发实战课」技术章节大纲

> 骨架：MVP 开发专家团 6 阶段方法论
> 案例：bookconv.com（真实仓库，见 `00-fact-check.md`）
> 形态：视频实战为主 + 图文为辅
> 原则：每章的「真实操作」必须在真实仓库里可复现，禁止演示用假数据。

## 阶段映射总表

| Phase | 阶段名 | 章 | 主责角色 | 产出物 |
|-------|--------|----|----------|--------|
| Phase 1 | 需求澄清与立项 | 第 1-2 章 | 产品经理 | PRD、验收标准 |
| Phase 2 | 调研 · 选型 · Spec | 第 3-5 章 | 首席架构师 | 技术 Spec、openapi.yaml、ADR |
| Phase 3 | UI/UX 设计 | 第 6-7 章 | 设计师 | 设计规范、组件清单 |
| Phase 4 | 前端 + 后端开发 | 第 8-11 章 | 前端 / 后端 | 可运行代码 |
| Phase 5 | 测试与质量门禁 | 第 12-13 章 | 测试 | 测试套件、CI 门禁 |
| Phase 6 | 部署 · 增长 · 数据 | 第 14-17 章 | 全员 | 线上站点、GA4/GSC 数据 |

---

## Phase 1 — 需求澄清与立项

### 第 1 章：从「我想做个网站」到可验收的需求
- **要演示的真实操作**：打开 bookconv 的 GSC 后台，用真实 query 数据反推「用户到底在搜什么」，而不是拍脑袋定需求。展示 `sitemap-urls.txt` 与实际收录量的差距。
- 讲：如何把模糊想法逼问成「谁 / 在什么场景 / 现在怎么解决 / 为什么不满意」。
- 图文补充：需求澄清提问清单。

### 第 2 章：写一份 AI 能执行的 PRD
- **要演示的真实操作**：现场写演示产物的 PRD，然后把同一份 PRD 分别喂给 AI，对比「模糊 PRD」与「带验收标准的 PRD」生成结果的差距。
- 讲：验收标准怎么写才不会被 AI 糊弄过去；为什么「做得好看点」是无效需求。

---

## Phase 2 — 调研 · 选型 · Spec（本阶段为架构师主场）

### 第 3 章：技术调研的正确姿势——查文档，不查「A vs B 哪个好」
- **要演示的真实操作**：现场演示两种检索路径的差异。反例：搜「Next.js vs Remix」看营销对比文。正例：查 Vercel 官方文档的函数执行时长限制、查 Lucide 1.0 迁移指南发现 **brand icons 已被移除**（bookconv 用的 lucide-react 1.24.0 属 1.x，若代码里还 import 品牌图标会直接编译失败）。
- 讲：官方文档里的「限制」和「破坏性变更」才是选型依据。
- 图文补充：调研记录模板。

### 第 4 章：MVP 技术选型——恰到好处，不多不少
- **要演示的真实操作**：打开 bookconv 真实 `package.json`，逐条解释每个依赖「为什么在」以及「当初可以不加什么」。重点复盘 bullmq + ioredis + S3 这套重型组合对一个 MVP 是否过度。
- 讲：选型决策矩阵（学习成本 / 生态成熟度 / 部署成本 / 团队熟悉度权重高，扩展性权重低）。
- **锁定图标库**：现场把 lucide-react 写进 Spec 依赖锁，并说明为什么 emoji 不能当功能图标（跨平台字形不一致、无法着色、无 `aria-hidden`、不可 tree-shake）。

### 第 5 章：Spec 即契约——先写 openapi.yaml，再写代码
- **要演示的真实操作**：为演示产物现场写 `openapi.yaml`；打开 bookconv 现有的 `src/app/api-docs`（Redoc）展示契约文档长什么样；指出 bookconv 现有 API **没有 `/api/v1/` 版本前缀**这一既有偏差，并讲「存量不改、新增遵循」的决策逻辑。
- 讲：为什么前后端各自对着 spec 干活比互相喊话快；ADR 怎么写。
- 图文补充：`openapi.yaml` 骨架模板 + ADR（MADR 格式）模板。

---

## Phase 3 — UI/UX 设计

### 第 6 章：设计规范先行——Token、间距、图标
- **要演示的真实操作**：打开 bookconv 的 Tailwind v4 配置与现有组件，抽出实际在用的色板与间距；演示 Lucide 1.0 的 `LucideProvider` 统一设置 size/color/strokeWidth，避免每个调用点重复传参。
- 讲：设计 token 如何直接映射到 Tailwind v4；为什么「配色随手挑」会在第 20 个组件时崩盘。
- **P0 红线现场演示**：在真实仓库里跑 emoji 扫描，命中 12 个文件（`TrustBar.tsx`、`BatchConversionGuide.tsx`、`data/content/djvu-to-pdf.ts` 等），当场整改为 Lucide 组件。

### 第 7 章：把设计稿变成 AI 看得懂的组件清单
- **要演示的真实操作**：把演示产物的页面拆成组件树，标注每个组件的 props 契约，再交给 AI 生成。
- 讲：为什么「给张图让 AI 还原」不如「给组件清单 + props 契约」。

---

## Phase 4 — 前端 + 后端开发

### 第 8 章：项目结构与代码组织约束
- **要演示的真实操作**：展示 bookconv 的 `src/app`（api / [locale] 分层）、`src/data`（单源数据）、`src/lib`（领域逻辑）三层划分；用 `wc -l` 当场查出 `src/lib/queue.ts` **661 行**，超出单文件 300 行约束，讲怎么拆。
- 讲：单文件 ≤300 行、单一职责、入口只装配、按资源分包。

### 第 9 章：单源数据 + 注册表模式（bookconv 的核心资产）
- **要演示的真实操作**：完整走一遍 `src/data/content/*.ts` → `index.ts` 的 `CONTENT_MAP` → `[locale]/convert/[slug]` 页面 → `sitemap.ts` 自动派生的全链路。
- **真实 bug 教案**：`sitemap.ts` 源码注释里记录的历史事故——曾用 `CONVERSION_MAP` 推导 slug，把 `epub-docx` 错推成 `epub-to-docx`，而真实 slug 是 `epub-to-word`，导致 sitemap 提交了不存在的 URL。这是「单一数据源为什么重要」的最好证据。
- 讲：注册表模式如何让「加一个页面」从改 5 个文件降到改 2 个文件。
- **顺带修**：`CONTENT_MAP: Record<string, any>` 的 `any` 应收紧为具体 interface，让缺字段在编译期报错。

### 第 10 章：后端与 API 实现
- **要演示的真实操作**：读 bookconv 真实的 `api/payments/webhook/route.ts`，讲解为什么用 `custom_data.email` 作订阅键、以及源码注释里那句「解析不出 email 就必须跳过，不能静默用错的键」的防御思路。
- 讲：zod 做入参校验；统一响应格式；错误码规范。

### 第 11 章：AI 写的代码，哪里最容易出事
- **要演示的真实操作**：现场审查 `src/lib/auth/storage.ts`（57 行，真实生产代码），当场找出两个缺陷：
  1. `verifyPassword` 里 `providedKey` 算完**根本没用**（典型 AI 生成的死代码）；
  2. 密码哈希用字符串 `===` 比较，**非常量时间**，有时序侧信道，应改 `crypto.timingSafeEqual`。
- 讲：生成式代码的典型失效模式——看起来对、跑起来也对、但安全性/边界是错的。
- 图文补充：AI 代码审查检查清单。

---

## Phase 5 — 测试与质量门禁

### 第 12 章：测试写多少才够
- **要演示的真实操作**：跑 bookconv 真实测试（`tests/unit`、`tests/boundary`、`tests/e2e`、`tests/performance` 四类），展示 jest + @swc/jest + playwright + supertest 的分工。
- 讲：MVP 阶段测什么、不测什么。

### 第 13 章：把规则变成 CI 门禁
- **要演示的真实操作**：把第 6 章的 emoji 扫描脚本接进 `.github` workflow，让 P0 规则从「靠记性」变成「靠流水线」；同时加单文件行数门禁。
- 讲：规则不进 CI 等于不存在。

---

## Phase 6 — 部署 · 增长 · 数据

### 第 14 章：部署到 Vercel 与环境边界
- **要演示的真实操作**：对照真实 `.env.example`（3.2KB）讲环境变量分层；展示 `docker-compose.yml` + `worker/` 说明「为什么转换任务不能跑在 serverless 函数里」——这是 Vercel 执行时长限制倒逼出的架构决策。
- 讲：serverless 的真实约束如何反向决定架构。

### 第 15 章：SEO 是架构问题，不是文案问题
- **要演示的真实操作**：走查 `sitemap.ts` 的双 locale 派生、`public/llms.txt`、`robots.txt` 对 GPTBot / ClaudeBot 的放行策略；用 `next-sitemap.config.js` 与 `scripts/submit-indexnow.mjs` 演示提交流程。
- 讲：为什么 sitemap 必须从数据源派生而不是手写。

### 第 16 章：付费链路与数据闭环
- **要演示的真实操作**：走通 checkout → webhook → Redis 订阅态 → 前端 Pro 门禁；打开 GA4 看真实自定义关键事件。
- **真实待办演示**：`src/lib/auth/storage.ts` 的内存 Map 迁移到持久化存储——这是 bookconv 目前真实未完成的事，课程可以真的把它做完。

### 第 17 章：灰度发布与迭代
- **要演示的真实操作**：给演示产物加一个轻量 Feature Flag，按 5% → 50% → 100% 放量。
- 讲：MVP 上线不是终点，是开始测量的起点。

---

## 章节形态配比建议

| 阶段 | 视频占比 | 图文占比 | 说明 |
|------|----------|----------|------|
| Phase 1 | 40% | 60% | 方法论为主，模板可复用 |
| Phase 2 | 60% | 40% | 调研过程必须录屏 |
| Phase 3 | 70% | 30% | 视觉工作强依赖画面 |
| Phase 4 | 85% | 15% | 编码全程录屏 |
| Phase 5 | 70% | 30% | 跑测试要看真实输出 |
| Phase 6 | 75% | 25% | 部署与数据看板必须真实 |
