# 选型结论与技术约束（课程工程规范）

> 适用范围：课程演示产物代码 + 所有录制内容 + 配套图文。
> 本文件是 Spec 的一部分，与 `01-tech-outline.md`、`02-demo-candidates.md` 同级生效。

---

## 一、锁定依赖（演示产物必须与主站一致，禁止另起炉灶）

| 层 | 锁定选型 | 版本 | 锁定理由 |
|----|----------|------|----------|
| 框架 | Next.js App Router | **16.2.10** | 与主站一致，录屏与代码不能对不上 |
| UI | React | 19.2.4 | 随框架 |
| 样式 | Tailwind CSS | 4.3.2 | 主站已用，v4 配置方式与 v3 差异大，必须统一 |
| **图标** | **lucide-react** | **1.24.0（锁定，不随手升级）** | 见 ADR-001 |
| i18n | next-intl | 4.13.2，locale = `en` / `es` | 主站既有 |
| 校验 | zod | 4.4.3 | 入参校验统一入口 |
| 单测 | jest + @swc/jest | 30.4.2 | 主站既有 |
| E2E | playwright | 1.62.1 | 主站既有 |
| 部署 | Vercel | — | 主站既有 |

**新增依赖需走 ADR。** 课程演示产物的目标依赖新增数 = **0**。

---

## 二、P0 绝对规则的工程落地

### 规则 1：禁止 emoji 作为功能图标

- **唯一图标来源：`lucide-react`。** 全项目不混用第二套图标库。
- Lucide 1.x 已移除品牌图标（brand icons）。如需平台 logo，走 `public/` 下的本地 SVG，不引入 simple-icons。
- 用 `LucideProvider` 在根布局统一设定 `size` / `strokeWidth` / `color` 默认值，调用点不重复传参。
- Lucide 1.0 起 `aria-hidden` 默认为 `true`，装饰性图标无需额外处理；**承载语义的图标必须显式给 `aria-label`**。

**当前仓库存在 P0 违规**：12 个文件含 `✅` `❌` `✓` 等字符（`components/tools/TrustBar.tsx:26`、`components/tools/BatchConversionGuide.tsx:37,40,43`、`data/content/djvu-to-pdf.ts:80-85`、`data/content/azw3-to-pdf.ts:43-44`、`data/content/epub-to-jpg.ts:87` 等）。

处置：作为第 6 章的现场整改素材，改完把检测脚本接进 CI（见下）。

```bash
# scripts/check-no-emoji.sh —— 接入 CI 的门禁脚本
# 命中 emoji 与常见符号图标即失败
if grep -rlP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src --include='*.ts' --include='*.tsx' ; then
  echo "P0 违规：源码中发现 emoji / 符号图标，请改用 lucide-react 组件"
  exit 1
fi
```

### 规则 2：禁止紫色→粉色渐变
课程演示产物配色从主站现有 Tailwind token 中取，不引入渐变主视觉。此条移交设计师在 Phase 3 明确色板。

### 规则 3：禁止 AI 模板味文案
- 课程文稿与演示产物的界面文案，禁止「赋能」「一站式」「打造闭环」这类空转词。
- 页面上的每个数字都必须有来源。演示产物的兼容性报告页只能写机器实测出来的结果，不写推测值。

---

## 三、代码组织约束

| 约束 | 阈值 | 检查方式 |
|------|------|----------|
| 单文件行数 | ≤ 300 行 | CI 门禁 |
| 单一职责 | 一个文件一件事 | Code Review |
| 入口只装配 | `route.ts` / `page.tsx` 不写业务逻辑，只调 `src/lib` | Code Review |
| 按资源分包 | `src/lib/<domain>/` 组织 | Code Review |

**现存超标**：`src/lib/queue.ts` 661 行。第 8 章拿它做拆分演示。

**分层依赖方向（单向，不可逆）**：
```
src/app/[locale]/**  ──┐
src/app/api/**       ──┼──►  src/lib/**  ──►  src/data/**
                       │           │
                       └───────────┴──►  外部 SDK（redis / s3 / sentry）
```
- `src/data` 是纯数据，**不得** import `src/lib`
- `src/lib` **不得** import `src/app`
- 组件不直接调外部 SDK，一律经 `src/lib`

---

## 四、演示产物的目录结构（照搬现有模式）

```
src/data/compat/
├── epub-on-kindle-paperwhite.ts     单个实测报告数据
├── ...                              首批 ≤ 30 个
└── index.ts                         COMPAT_MAP 注册表（照 content/index.ts）

src/lib/compat/
├── schema.ts        zod schema + TS interface（不用 any）
├── generator.ts     调 verifyConversion 产出实测数据
└── report.ts        数据 → 视图模型

src/app/[locale]/compat/[slug]/page.tsx    generateStaticParams 取自 COMPAT_MAP
src/app/sitemap.ts                          新增一段 Object.keys(COMPAT_MAP) 派生
```

**类型约束**：`COMPAT_MAP` 必须是 `Record<string, CompatReport>`，**不许照抄现有 `CONTENT_MAP: Record<string, any>` 的 `any`**。这是课程要当场纠正的反面样例。

---

## 五、API 约定

- **存量不改**：现有 `/api/auth/*`、`/api/convert/*`、`/api/payments/*` 无版本前缀，保持原样，不为教学而重构线上接口。
- **新增遵循**：演示产物若新增接口，一律 `/api/v1/` 前缀。
- 统一响应体：`{ code: 0, data: {}, message: "" }`，`code` 非 0 即错误。
- 入参一律 zod 校验，schema 与 `openapi.yaml` 保持同源。
- **无 `openapi.yaml` 不进入 Phase 4。**

---

## 六、录制与工程规范（课程特有）

| 项 | 规定 |
|----|------|
| 分支 | 每章一个分支 `course/ch-NN-<topic>`，录制前打 tag，学员可 checkout 到任意章节起点 |
| 提交 | 每个可运行状态一个 commit，commit message 即字幕锚点 |
| 环境变量 | 录屏中一律用 `.env.example` 的占位值；真实 key 走终端外部注入，**不得出现在画面里** |
| 终端 | 字号 ≥ 16px，深色主题，窗口宽度固定 120 列，避免换行错乱 |
| 失败镜头 | **保留**。AI 生成错代码、构建报错、测试挂掉的片段不剪掉——这是课程差异化价值所在 |
| 依赖安装 | 提前装好，录制时不等 `npm install` 进度条 |
| 数据 | 演示用样本书只用公共领域书目（Project Gutenberg），规避版权 |
| 命名 | 录屏中出现的项目名、路径与仓库真实一致，不用化名 |

---

## 七、风险登记

| # | 风险 | 等级 | 处置 |
|---|------|------|------|
| R1 | 批量页触发 Google 规模化内容滥用政策 | **高** | 每页必须是机器实测独有数据；首批 ≤30 页；人工审核闸门；GSC 观察 2 周再扩量 |
| R2 | 课程录完后 Next.js / Lucide 出新版，画面与最新文档不符 | 中 | 版本在 Spec 中锁死并在片头标注；图文补充维护「版本差异附录」 |
| R3 | `REDIS_URL` 未就绪导致 Pro 链路演示中断 | 中 | 第 16 章录制前置检查项；备选用本地 Redis 容器 |
| R4 | 主站现有 12 处 emoji 违规若先于课程被修复，第 6 章素材消失 | 低 | 提前打 tag 固定素材快照 |
| R5 | 实测样本准备不足，兼容性页退化为编造数据 | **高** | Phase 1 就把样本清单列进 PRD 验收标准，样本不齐不进 Phase 4 |
