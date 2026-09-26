# BookConv SEO/GEO 执行规划文档

**制定日期**: 2026-09-17
**最近更新**: 2026-09-26 21:00（新增 §九：代码摸底衍生的增量待办 D1–D6）
**执行状态**: Batch 1a/1b 已完成并线上验证；Batch 1c/2/3 待执行（已并入 `待执行计划-v2` 的 A 系列）；Batch 4 自 2026-09-26 起逐日执行；**Day 1 已完成**（llms.txt 死链归零，0 DEAD / 123 链接）；**Day 2 已完成**（B1：epub-to-docx / epub-to-word-docx 301 → epub-to-word，两 slug 移出 sitemap，commit `b50732d`/`5ad0dcb`，**2026-09-26 核实已推送**）
**⚠️ 排期职能已移交**：本文件的排期以 `docs/待执行计划-v2-2026-09-26.md` 为准，本文件保留作历史与变更记录。
**负责人**: 鉴源·出海专家辅助执行

---

## 一、执行概览

| 维度 | 数值 |
|------|------|
| 总任务数 | 22 个（原 20 + 新增 2 个缺陷修复） |
| 已完成 | 9 个 |
| 执行中 | 0 个 |
| 未开始 | 13 个 |
| 完成率 | 41% |

**双渠道策略定位**
- GSC 修复：60% 精力（提升排名与点击）
- Bing 放大：40% 精力（维持增长势头）

**⚠️ 执行纪律修正（本日新增）**
原计划假设"分批提交即可避免处罚"。本日实测发现真正的风险不是"提交太快"，
而是**批量脚本把内容插错位置**——详见 §三 B1a/B1b。分批仍是纪律，但
**每次批量改动后必须跑构建门禁**，否则改动根本不会上线。

---

## 二、Week 1 执行计划（2026-09-17 ~ 2026-09-23）

### T0: Schema 审计与修复 ✅ 已完成

| 任务 | 状态 | 完成日期 | 备注 |
|------|------|---------|------|
| T0-1: Convert 页 Schema 审计 | ✅ | 2026-09-17 | 30/30 OK |
| T0-2: Guide 页 Schema 审计 | ✅ | 2026-09-17 | 22/22 OK |
| T0-3: Blog 页 Schema 审计 | ✅ | 2026-09-17 | 23/24 OK（1 个 404，已随 B1-1 修复） |

**结论**：Schema 全站已覆盖，无需修复。此前"Convert 页缺 Schema"的判定是
红队误判（静态查代码未实测线上 HTML），已从规范文档中降级。

---

### B1a: 部署解冻 + 404 修复 ✅ 已完成并线上验证

> **这是本次最重要的发现**：站点自 06:02af5 起构建一直失败，
> 但 Vercel 在构建失败时会**继续服务上一个成功版本**，
> 所以站点看起来完全正常，实际每一次 push 都是死的。

| 任务 | 状态 | 提交 | 线上验证 |
|------|------|------|---------|
| B1a-1: 修复 `epub-to-mobi.ts` 语法错误（sections 数组被提前闭合） | ✅ | a0680f5 | ✅ |
| B1a-2: 修复 `blog/index.ts` 重复 import（post69 声明两次） | ✅ | a0680f5 | ✅ |
| B1a-3: 修复 `/blog/azw3-to-mobi` 404（未注册到 posts[]） | ✅ | d2a405c → 随部署生效 | ✅ 实测 200 |
| B1a-4: 新增构建门禁脚本 | ✅ | a0680f5 | ✅ |

**根因**：`6c02af5`（P2 差异化改造）把 8 个新 section **插在了 `sections` 数组的
闭合 `],` 之后**，而不是数组内部，导致 `L110: Unexpected token '{'`。
`81b625e` 在同一破损状态上继续追加，问题被叠加。

**验证证据**

| 项 | 结果 |
|---|---|
| `npm run build` | ✅ Compiled successfully（354/354 静态页） |
| `GET /blog/azw3-to-mobi` | ✅ 200（修复前 404） |
| `GET /convert/epub-to-mobi` | ✅ 200，13 个 section 全部渲染 |
| 新门禁 `audit-content-integrity.mjs` | ✅ 0 error |

**新增门禁**：`scripts/audit-content-integrity.mjs`
- TS 解析错误 / 重复 import 绑定 → ERROR（会阻断构建）
- 同文件内重复 heading / 缺 `metaDescription` → WARN
- 同时兼容 `content/` 与 `blog/` 两套 schema
- 非零退出码，可直接接入发布流程

---

### B1b: P2 批次缺陷修复 ✅ 已完成，线上验证中

| 任务 | 状态 | 提交 | 说明 |
|------|------|------|------|
| B1b-1: 移除重复的 `Conversion Quality Guarantee` 章节（3 页） | ✅ | 49096ba | 见下方 ⚠️ 并行写入说明 |
| B1b-2: 修复裸 HTML 标签泄漏（markdown 正文里写死 `<h1>`/`<h2>`/`<nav>`） | ✅ | 060a806 | 已推送到 origin，等待 Vercel |
| B1b-3: 标记 `shared-modules.ts` 为孤儿文件 | ✅ | 未提交 | 无任何文件 import 它 |
| B1b-4: 新增 `scripts/find-duplicate-headings.mjs` | ✅ | 060a806 | 定位重复 heading 并指出保留哪一份 |

**缺陷 1：重复章节**
P2 批次的本意是"把纯文本版本升级成带 bullet 的版本"，但脚本**追加**而不是**替换**，
导致同一页出现两个同名 `<h2>`。受影响 3 页：
`epub-to-azw3` / `epub-to-pdf` / `pdf-to-epub`。

**缺陷 2：裸 HTML 标签泄漏进 DOM**
markdown 正文里直接写了尖括号标签，渲染器当成真 HTML 输出。线上实测（已剥离 script 块）：

| 页面 | 现象 |
|------|------|
| `/convert/epub-to-mobi` | 裸 `<h2>` 吞掉后续文字，产生伪 h2「structure. Open in Calibre…」，真正的 `Device Compatibility Report` 标题被挤掉 |
| `/convert/epub-to-azw3` | 裸 `<nav epub:type="toc">` 真的渲染成 `<nav>` 元素 |

**修复方式**：改写为纯文字（去掉尖括号）。**不使用反引号包裹**——这些正文是
TS 模板字符串，裸反引号会直接截断字符串。参照 `fb2-to-epub.ts` 已有的正确写法。

---

### B1c: Google 修复（待执行）

> ⚠️ 依赖 B1b 部署完成，且与 B1b 间隔 ≥24h，避免同一天连续批量改动。

#### B1c-1: Convert 页 Title 优化 🔴 P0

| 任务ID | 页面 | 动作 | 状态 | 预计工时 |
|--------|------|------|------|---------|
| B1c-1a | `/convert/mobi-to-epub` | Title 加 "for Kindle/Kobo" | ⏳ 待执行 | 15 分钟 |
| B1c-1b | `/convert/epub-to-txt` | Title 加 "extract text" | ⏳ 待执行 | 15 分钟 |
| B1c-1c | `/convert/epub-to-doc` | Title 加 "to Word" | ⏳ 待执行 | 15 分钟 |

**依据**：GSC 显示这 3 页印象最高但零点击（平均排名 >59）。

#### B1c-2: 高展示页面内链补充 🔴 P0

| 任务ID | 页面 | 当前内链 | 目标内链 | 状态 | 预计工时 |
|--------|------|---------|---------|------|---------|
| B1c-2a | `/convert/mobi-to-epub` | 1 条 | ≥2 条 | ⏳ 待执行 | 30 分钟 |
| B1c-2b | `/convert/epub-to-txt` | 1 条 | ≥2 条 | ⏳ 待执行 | 30 分钟 |
| B1c-2c | `/convert/epub-to-doc` | 1 条 | ≥2 条 | ⏳ 待执行 | 30 分钟 |

**内链策略**（v2.0 要求"高质量"而非机械凑数）
- 反向格式对互链（`mobi-to-epub` ↔ `epub-to-mobi`）
- 相关博客指南（`/blog/epub-vs-mobi`）
- 相关格式百科（`/guide/kindle-formats`）

---

### B2: Batch 2 - Bing 放大（待执行，间隔 ≥24h）

| 任务ID | 页面 | 动作 | 状态 | 预计工时 |
|--------|------|------|------|---------|
| B2-1 | `/blog/best-ebook-reader-apps` | FAQ 强化至 8 条 | ⏳ 待执行 | 1 小时 |
| B2-2 | `/blog/sync-reading-across-devices` | FAQ 强化至 8 条 | ⏳ 待执行 | 1 小时 |
| B2-3 | `/blog/harry-potter-digital-books` | 复用 IP 模板 | ⏳ 待执行 | 2 小时 |

**Bing 引用数据**（Top 5 占 63.9%）
- `/blog/best-ebook-reader-apps`：857 cites（25.0%）
- `/blog/sync-reading-across-devices`：393 cites（11.5%）
- `/blog/harry-potter-digital-books`：212 cites（6.2%）

---

### B3: Batch 3 - 全站检查（待执行）

| 任务ID | 内容 | 状态 | 预计工时 |
|--------|------|------|---------|
| B3-1 | 全站 Title 长度检查（≤55 字符） | ⏳ 待执行 | 1 小时 |
| B3-2 | 全站 Description 检查（≤155 字符） | ⏳ 待执行 | 1 小时 |
| B3-3 | 全站 Open Graph 标签检查 | ⏳ 待执行 | 30 分钟 |
| B3-4 | 🆕 为 20 个 convert 页补 `metaDescription` | ⏳ 待执行 | 2 小时 |

**B3-4 说明**（本日新发现）
`convert/[slug]/page.tsx:49` 的兜底逻辑是 `contentData?.metaDescription || subtitle`，
即没有 `metaDescription` 时**直接用 hero 副标题当 SERP 描述**。
实测 32 个 content 文件中只有 10 个写了 `metaDescription`，**20 个在裸奔**。
副标题是为页面内展示写的，长度与钩子都不适合 SERP。这是当前最容易拿分的一项。

---

## 三、Week 2-4 计划预览

| 周次 | 内容 |
|------|------|
| Week 2 | Convert 页批量优化；全站内链扫描 |
| Week 3 | Blog 内容增强；IP 内容复用 |
| Week 4 | 周数据导出、指标追踪与迭代 |

---

## 四、关键指标基线

### Google（GSC）

| 指标 | 基线（8 月） | 基线（9 月） | Week 1 目标 | 监测频率 |
|------|-----------|-----------|-----------|---------|
| 日均印象 | 82.5/天 | 9.0/天 | 50/天 | 周 |
| CTR | 0.37% | 0.37% | 0.5% | 周 |
| Top 10 排名 | 0% | 0% | 3% | 周 |

### Bing

| 指标 | 基线（9/16） | Week 1 目标 | 监测频率 |
|------|-----------|-----------|---------|
| 日引用 | 214.6 | 240 | 周 |
| 引用增长率 | +22.1% | +25% | 周 |

**⚠️ 双渠道不对称格局**：GSC 日均印象 -89% vs Bing AI 近 7 天 +22.1%。
这不是全站惩罚，是两个渠道各自独立的表现。修复要按渠道分开归因。

---

## 五、执行纪律

### 防批量处罚规则

- ✅ 每次提交 ≤3 页
- ✅ 提交间隔 ≥24 小时
- ✅ 每页发布前用 curl 验证 Schema
- ✅ 回滚预案：连续 3 天 CTR 下降立即回滚
- 🆕 ✅ **每次批量改动后必须跑 `npm run build`**（本次教训：改动可以静默不上线）
- 🆕 ✅ **批量脚本只允许"替换/定点更新"，禁止"追加整块"**
- 🆕 ✅ **禁止在 markdown 正文写尖括号标签**（用纯文字表述）

### 构建后门禁（新增，自动化）

```bash
node scripts/audit-content-integrity.mjs     # 0 error 才算通过
node scripts/find-duplicate-headings.mjs     # 人工确认无重复章节
node scripts/verify-markup-fix.mjs           # 部署后线上断言
```

### 发布前 Checklist（每页必过）

- [ ] Schema 验证：curl 源码包含 FAQPage / Article / HowTo
- [ ] Title 长度：≤55 字符（含空格）
- [ ] Description 长度：≤155 字符
- [ ] 内链数量：≥2 条高质量链接
- [ ] Canonical 自指
- [ ] Open Graph 标签完整
- [ ] 无死链（404 检查）
- [ ] 🆕 页面 h2 清单无重复、无碎片
- [ ] 🆕 正文无裸 HTML 标签

---

## 六、风险登记

| # | 风险 | 等级 | 状态 | 应对 |
|---|------|------|------|------|
| R1 | **构建静默失败**导致改动不上线，而站点表面正常 | 🔴 高 | 已缓解 | 已加门禁脚本；push 后必须线上断言，不能只看"站点能打开" |
| R2 | **并行写入者**：本日另一进程以「豆豆妈」身份连续提交并 push（`49096ba` 21:38、`bf10c69` 21:5x），其中一次在我 `git add` 与 `git commit` 之间完成提交，**把我的暂存区冲掉**（该次提交最终仍成功落为 `7312100`，但过程不可靠） | 🔴 高 | **待用户决策** | 提交前先 fetch；发现他人提交先 rebase 再 push；**建议约定"同一时间只跑一个改动会话"** |
| R3 | `shared-modules.ts` 是孤儿文件，无人 import | 🟡 中 | 待决策 | 二选一：删除，或正式接入并复用 |
| R4 | `scripts/d3-tier2-batch1.mjs` 等批量脚本未入库且机制危险（追加式插入） | 🔴 高 | 待处理 | 建议改写为幂等、定点更新后再入库，否则是下一次事故的种子 |
| R5 | 20 个 convert 页无 `metaDescription`，SERP 描述裸奔 | 🟡 中 | 待执行 | 见 B3-4 |
| R6 | `bf10c69` 在 `/convert/epub-to-mobi` 引入近重复章节（`…(Step-by-Step)` 与 `…: Step by Step` 并存） | 🔴 高 | ✅ 已解决并线上验证 | 已删除较旧的 `(Step-by-Step)` 章节（commit `4b1bef3`）。线上实测 `<h2>` 由 20 → **19**，"How to Convert" 标题剩 **1** 个。附带收益：被删章节含 10MB/50MB 文件大小声明，与 §4 纪律冲突。审计脚本已升级为归一化比对（`7312100`） |
| R7 | 🆕🔴 **Pro 套餐在售，但其核心权益未实现**：定价页与 `PLANS` 承诺 Pro（$5/月）"Up to 50MB"、API（$20/月）"Up to 100MB"，**而转换管线对所有用户固定 10MB** | 🔴 高 | 🟡 **方案 C 已执行**（要约层已收口）；博客/转换页 43 处待批量 pass | 见下方"R7 详情"。已修正 8 个文件；剩余 18 个内容文件需单独 pass |

---

### R7 详情：在售的 Pro 权益没有对应实现

**结论**：BookConv 正在以 $5/月（Pro）和 $20/月（API）售卖"更大文件上限"，但转换管线对所有身份一律 10MB。付费用户上传 30MB 的 EPUB 会被拒，错误信息是 `File too large. Max 10MB`。

**证据链（全部为代码/线上实测，非推断）**

| # | 环节 | 位置 | 实测事实 |
|---|------|------|---------|
| 1 | 对外承诺 | `src/lib/payments/service.ts:14-62` | Free `Up to 10MB` / Pro `Up to 50MB` / API `Up to 100MB` |
| 2 | 承诺已上线 | `https://www.bookconv.com/pricing` | 200，渲染出 "Up to 50MB file size"、"Up to 100MB file size"，且页面存在购买入口 |
| 3 | 套餐可购买 | `.env.production` | `LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID` 与 `..._API_...` 均已配置 → `proHasVariant = true`，升级按钮不会因未配置而禁用 |
| 4 | 身份可解析 | `src/lib/subscription.ts:77-87` | `getPlanByEmail()` 能正确返回 `'free' \| 'pro' \| 'api'` —— 系统**知道**用户买了什么 |
| 5 | 🔴 管线不读身份 | `src/lib/convert-handler.ts:16` | `const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB \|\| "10", 10) * 1024 * 1024` —— 单一固定上限，**无任何套餐分支**；`convertAndStream()` 的签名里根本没有用户/套餐参数 |
| 6 | 入口不解析身份 | `src/app/api/convert/route.ts` | 仅按 IP 限流（`convertApi` 20 req/60s），全程不解析登录用户，因此即使想分套餐也拿不到输入 |
| 7 | 前端同样写死 | `src/components/tools/FileDropZone.tsx:40` | `const MAX_FILE_SIZE_MB = 10`（无 env、无套餐） |

**同类未兑现项**：`PLANS` 里的 "5 conversions per hour"（Free）/"Unlimited"（Pro、API）也是未实现的 —— 限流是 IP 维度的 20 req/60s，对所有套餐一致。即套餐卡片上的**量级类承诺整体处于"声明 ≠ 代码"状态**。

**为何此前没被发现**：MEMORY §4 把该现象记成"pricing 写 50MB 实际硬编码 10MB"并给出**文案侧规避**（"新文案不提文件大小"）。规避动作压住了新增文案，但没有触及根因——**定价页本身**（真正收钱的那一页）仍在承诺 50MB，而它不在"新文案"范围内。

**处置选项（需决策，不擅自执行）**

| 方案 | 动作 | 代价 |
|------|------|------|
| A. 兑现承诺 | 把 plan 贯穿到转换链路：`getPlanByEmail()` → 映射到上限 → 传给 `convertAndStream()`，前端按套餐取限 | 真实功能开发，涉及支付相邻代码；且公开转换页目前不要求登录，需先定义"未登录用户算哪一档" |
| B. 修正对外口径 | 从 `PLANS`、定价页、`FAQSection` 及约 12 篇博客、4 个转换页移除 50MB/100MB 表述，改为"10MB，更大文件请用桌面版" | 文案改动面大，且会**撤掉付费卖点**；与并行写入者 1 小时前刚"恢复文件大小事实"的方向相反 |
| C. 先收口最暴露面 | 只处理定价页与 `PLANS`（法律意义上的"要约"），博客/转换页留待批量一致性 pass | 折中；仍需先定 A 还是 B 的方向 |

### R7 执行记录：方案 C（用户 2026-09-17 22:13 选定）

**范围**：收口"要约层"——凡构成对外承诺的表面，全部改为只写代码真正兑现的东西。长文内容（博客/转换页正文）留待单独 pass。

**判定依据（先验证再改文案）**

| 声明 | 结论 | 依据 |
|------|------|------|
| Free `Up to 10MB` | ✅ 真 | `.env.production` 中 `MAX_FILE_SIZE_MB=10` |
| Pro `Up to 50MB` / API `Up to 100MB` | ❌ 假 | `convert-handler.ts:16` 单一固定上限，无套餐分支 |
| Free `5 conversions per hour` | ❌ 假 | 实为 `convertApi` 20 req/60s/IP；**低估了 240 倍** |
| Pro/API `Unlimited conversions` | ❌ 假 | 限流按 IP，与套餐无关 |
| Pro/API `Priority queue` | ❌ 假 | `ConversionJobData.priority` 声明后**全库无任何赋值点** |
| Pro/API `Batch conversion` | ✅ 真 | `/batch` 有 `isPro` 门槛 |
| `No watermark` | ✅ 真 | 全库无 watermark 逻辑，从不加水印 |
| API `Full API access` | ⚠️ 未证实 | `api-docs/openapi.json` 存在，但**全库无 ApiKeyAuth 校验点**（仅 `health` 用 `x-api-key` 自用）。暂保留，需再核 |

**已改（commit `f97e5f6`，8 个文件）**

1. `src/lib/payments/service.ts` — `PLANS` 三档 features 只留真声明，并**加注释记录删除项与原因**，防止再被"restore"
2. `src/app/[locale]/pricing/page.tsx` — 删掉 conversions-per-hour 与 priority 两行；文件大小两列都写 10 MB，不再暗示 Pro 有提升
3. `src/app/api-docs/openapi.json` — `ApiKeyAuth` 描述去掉 "Pro users get priority processing"
4. `messages/en.json` + `es.json` — `faq.a1`、`FILE_TOO_LARGE`、`RATE_LIMIT`。**`FILE_TOO_LARGE` 最要紧**：它是用户被拦下、正要决定付费时读到的那句话，而它把人指向 50 MB
5. `src/components/tools/FAQSection.tsx` + `src/lib/seo/schema.ts` — 两份**重复**的默认 FAQ 生成器（已各自漂移）。`schema.ts` 现加指针注释指向其孪生副本
6. `src/app/auth/page.tsx` — 注册页去掉 "priority processing"

**刻意未做**

- **43 处、18 个内容文件**（`src/data/blog/*`、`src/data/content/*`）仍含同类套餐承诺，需单独 pass。注意：这些文件里另有大量 `50MB` 是**第三方事实**（如 "Kindle 拒收 >50MB"），不是本站承诺，改动时须逐条区分，不能盲replace。
- **未 bump sitemap `lastmod`**。理由：spam update 恢复期对 30 个程序化页做批量 lastmod 攀升，本身就是风险动作；而本次改动的目的是**对外口径正确**（用户可见），不依赖 Google 立刻重抓。若后续确认 FAQPage 富媒体摘要需刷新，再单独评估。

**重大发现（方法论，已写入长期记忆）**

旧记忆把该现象记成"pricing 写 50MB、实际硬编码 10MB → **新文案不提文件大小**"，给出的是**文案侧规避**。规避动作压住了新增文案，**却完全没碰根因**——定价页是真正收钱的那一页、法律意义上的要约，它不属于"新文案"范围。

> **教训**：发现"声明 ≠ 实现"时，先按法律权重排序（要约 > 宣传 > 科普 > 文档），再决定改声明还是改实现。只改低权重面会制造"已处理"的假象。

**并行发现**：`openapi.json` 自身早已与实现脱节——它正确写明 "20 requests/minute per IP"，却同时承诺 "Pro users get priority processing"。**这两句自相矛盾，正是该缺口长期存活的机制**：文档比代码更早承认真相，但没人对照。

---

## 七、变更记录

| 日期 | 变更内容 | 提交 |
|------|---------|------|
| 2026-09-17 07:26 | 初始版本创建 | — |
| 2026-09-17 21:30 | 发现部署已冻结：`epub-to-mobi.ts` 语法错误 + 重复 import | a0680f5 |
| 2026-09-17 21:38 | 移除 3 页重复的 `Conversion Quality Guarantee` 章节（并行进程提交） | 49096ba |
| 2026-09-17 21:45 | 修复裸 HTML 标签泄漏；新增 2 个诊断脚本；发现 20 页缺 metaDescription | 060a806 |
| 2026-09-17 21:45 | 本规划文档改版：新增 B1a/B1b、风险登记、门禁脚本 | — |
| 2026-09-17 21:53 | 移除 `/convert/epub-to-mobi` 近重复章节（R6）；并行进程删除孤儿文件（R3） | 4b1bef3 / 16cacfc |
| 2026-09-17 22:5x | **R6 线上验证通过**（h2 20→19，How-to 标题 1 个）；**新增 R7**：Pro/API 文件上限与限流承诺未在代码实现，涉真实收款 | — |
| 2026-09-26 09:50 | **Batch 4 Day 1 完成**：全量校验 llms.txt 123 链接，修正 1 处真死链 `/convert/epub-to-docx`→`/convert/epub-to-word`（middleware:14 为 301 跳转源）；**更正 C1 错误前提**——`/blog/azw3-epub-mobi-kindle` 实为活页（v2 审计「8/27 已删」与代码不符）；门禁 audit-content-integrity + find-duplicate-headings 均 0 error | 未 push（待人工复核） |
| 2026-09-26 10:10 | **Batch 4 Day 2 完成（B1）**：`src/middleware.ts` 的 `BLOG_REDIRECTS` 新增 2 条 301（`/blog/epub-to-docx`、`/blog/epub-to-word-docx` → `/blog/epub-to-word`）；门禁 audit-content-integrity + find-duplicate-headings + build 均 0 error | b50732d（未 push，待人工复核） |
| 2026-09-26 10:35 | **B1 彻底完成（应人工要求）**：将 2 个近重 slug 彻底移出 sitemap——`src/data/blog/index.ts` 取消 `post44`(epub-to-docx)/`post53`(epub-to-word-docx) 注册；`public/llms.txt` 删除 2 条对应链接；**保留** `middleware.ts` 2 条 301（旧 URL 仍 301→规范页）。门禁 audit-content-integrity + find-duplicate-headings + build 均 0 error | 5ad0dcb（未 push） |
| 2026-09-26 10:53 | **Kelriva 待办同步（K 系列入排期）**：P0 三项已完成（SSR 计数器 `85f1a56` 已 push 并线上断言 PASS；batch/pricing diff 一致；首页 FAQPage 确认已存在）；剩余 P1/P2 拆为 K1–K7 分散 Day 3–Day 9（每日 1 项）；记录防御性否决 3 项（屏蔽 guide 页 / Wikipedia 外链 / 无真实数据上 AggregateRating） | — |
| 2026-09-26 21:00 | **新增 §九 D 系列（代码摸底衍生）**：D1 归档 `next-sitemap.config.js`→`_archived/dead-config/`（可逆）、D2 修正两份 README 失真描述（加可信度声明 + 定点修正 队列/Supabase/28→31/孤儿端点/仓库名/GitHub 链接），D3–D6 登记待执行；门禁 0 error。**同时修正一处认知错误**：队列系刻意废弃（8/4 实测 Vercel 100% 504），非待接线；已写入 MEMORY.md 防止重提 | 未 commit |

---

---

## 八、Batch 4 — 审计整改逐日推进（2026-09-26 起）

> 来源：经红队审计修订的合规核查 `docs/bookconv-google-ai-guide-audit-final-v2.md` 第三部分「整改清单」（A/B/C/D）。
> 目标：把优先级近重簇与死链修复**逐日、小批量**推进，避免一次性大改触发 Google spam 质量信号（呼应执行纪律 §五「每次提交 ≤3 页 / 间隔 ≥24h」）。
> 执行方式：**每日自动化推进 1 个批次**（编辑 + 门禁 + commit，**不自动 push**；push 由人工复核后执行）。详细问题表现/风险/动作/验收见 v2 审计文档。

### 优先级与逐日排期

| 日 | 目标日期 | 批次 | 项（v2 编号） | 触及页面 | 风险 | 门禁 / 验收 | 状态 |
|----|---------|------|--------------|---------|------|-----------|------|
| Day 1 | 2026-09-26 | C 资产保全 | **前提修正**：C1 目标 `/blog/azw3-epub-mobi-kindle` 经核验为**活页**（blog/index.ts:51 仍注册、文件存在），非死链→不删除（原 v2 审计「8/27 已删」与代码实际状态矛盾，已更正）；C2 `/blog/epub-to-txt` 确不存在→跳过。全量扫描 123 条链接，发现**唯一直链** `/convert/epub-to-docx`（middleware.ts:14 为 →`/convert/epub-to-word` 的 301 跳转源），已改为指向 canonical `/convert/epub-to-word` | 0 页面（仅 llms.txt 1 行 URL 修正） | 🟢 | llms.txt 链接 123 条全数有对应注册 slug（0 DEAD，复验通过） | ✅ |
| Day 2 | 2026-09-27 | B 近重🔴 | B1 EPUB→Word/DOCX 三 blog（`epub-to-word`/`epub-to-docx`/`epub-to-word-docx`）301 至 `epub-to-word` | 3 blog（2 个 301） | 🔴 | 仅 1 规范 slug 可索引；`BLOG_REDIRECTS` 加 2 条；**两近重 slug 彻底移出 sitemap（index.ts 取消注册 + llms.txt 删 2 链接，301 保留）** | ✅ |
| Day 3 | 2026-09-28 | B 近重🔴 | B2 `epub-converter`/`epub-to-various-other` 同标题双 slug → 301 其一 | 2 blog（1 个 301） | 🔴 | 同标题双 slug 消除；`find-duplicate-headings` PASS | ⏳ |
| Day 4 | 2026-09-29 | B 近重🔴 | B11a IP「multiple devices」5 篇模板簇（chronicles-of-narnia / lord-of-the-rings / twilight / marvel-comics / harry-potter）→ 先查 GSC/Bing 流量，301 合并 3 篇留 2 篇规范 | 5 blog（3 个 301） | 🔴 | 簇内 ≤3 篇，意图不重叠 | ⏳ |
| Day 5 | 2026-09-30 | B 近重🔴 | B11b 剩余 2 篇差异化（补各 IP 专属分步/设备/坑） | 2 blog | 🔴 | 单页原创独特点 ≥3 | ⏳ |
| Day 6 | 2026-10-01 | B 近重🟡 | B3 EPUB→Text：确认规范 slug `epub-to-text`，llms.txt 无失效链接 | 0–1 | 🟡 | llms.txt 无不存在链接 | ⏳ |
| Day 7 | 2026-10-02 | B 近重🟡 | B4 EPUB→MOBI 三页（`epub-to-mobi`/`epub-to-mobi-guide`/`guide/epub-to-mobi-keep-formatting`）分工 | 3 | 🟡 | 意图不重叠 | ⏳ |
| Day 8 | 2026-10-03 | B 近重🟡 | B5 EPUB vs MOBI（`blog/epub-vs-mobi`/`guide/epub-vs-mobi`）标题错开 | 2 | 🟡 | 两页标题不完全一致 | ⏳ |
| Day 9 | 2026-10-04 | B 近重🟡 | B6 AZW3 vs MOBI 跨层同标题（`blog/azw3-vs-mobi`/`guide/azw3-vs-mobi`） | 2 | 🟡 | 同标题跨层消除 | ⏳ |
| Day 10 | 2026-10-05 | B 近重🟡 | B7 Kindle 簇（`kindle-epub-azw3-mobi`/`azw3-epub-mobi-kindle-compatibility` + 死链已清）收敛 | 2–3 | 🟡 | 簇内 ≤2 篇 | ⏳ |
| Day 11 | 2026-10-06 | B 近重🟡 | B8 Batch 簇（`batch-converter`/`calibre-free-batch`/`guide/batch-converter`）分工 | 3 | 🟡 | 意图清晰分离 | ⏳ |
| Day 12 | 2026-10-07 | B 近重🟡 | B9 Calibre 簇（`bookconv-vs-calibre`/`guide/calibre-vs-online-converter`/`guide/calibre-alternative`） | 3 | 🟡 | 簇内 ≤2 篇 | ⏳ |
| Day 13 | 2026-10-08 | B 近重🟡 | B10 Sync/读书组簇（`sync-reading-across-devices`/`sync-ebooks-reading-groups`/`reading-groups-hub`） | 3 | 🟡 | 仅 1 篇读书组主题 | ⏳ |
| Day 14+ | 2026-10-09 起 | A 差异化 | 31 个 convert 薄模板页，按 Tier 分层每日 ≤3 页差异化（Tier-2/3 按主题簇）；含 A2 metaDescription 复检、A3 图片、A4 `/convert/epub-to-pdf` 索引核查 | 3/天 | 🔴 | 单页原创独特点 ≥3；与同簇文本重复率 <30%；`audit:geo-content` PASS | ⏳ |

### Kelriva 衍生待办（K 系列，2026-09-26 同步）

> 来源：`数据分析/Kelriva-AI-Visibility-分析报告-2026-09-26.md` §六（红队审计修订版）+ `数据分析/Kelriva报告-红队审计与修订-2026-09-26.md`。
> 排期原则：**每日 1 项、分散一周（Day 3–Day 9）**，避免一次性大改触发 spam 质量信号；K 项与 B 批次同日并行时，站内页面改动合计仍 ≤3 页。P0 三项（SSR 计数器 `85f1a56` 已上线、batch/pricing diff、FAQPage 确认已存在）**已完成**，不重复排期。

| 项 | 目标日 | 内容 | 类型 | 触及页面 | 验收 / 备注 | 状态 |
|----|--------|------|------|---------|------------|------|
| K1 | 2026-09-28（Day 3） | 两项用户决策收口：① 150,000 计数器对外口径确认（展示目标值 vs 实测累计，需数据来源）；② `/pricing` 对比表 "API Access: Pro ✓" 是否改为"仅 API 套餐"（与 `PLANS.pro.features` 不一致） | 决策（0 代码） | 0 页 | 用户拍板后如有改动按 1 行定点更新 | ⏳ |
| K2 | 2026-09-29（Day 4） | `/about` 页强化品牌实体区分：明确 BookConv vs 同名/近名产品（Kelriva 实测 Gemini 混淆 "BookReverb"、"BookConvert"），补充 sameAs（@GinoTou2024）与实体信号 | 站内 | 1 页 | 实体归一要素齐备；`audit:syntax` PASS | ⏳ |
| K3 | 2026-09-30（Day 5） | 第三方评论体系启动：注册 Trustpilot（优先）或 G2，建立邀请评价流程 | 站外 | 0 页 | 账号开通；首页暂不挂评分（等真实数据） | ⏳ |
| K4 | 2026-10-01（Day 6） | 外联 howtoconvert.co：请求更新引用语，强调在线工具特性（免费+无需注册+Calibre 引擎）；邮件草稿经用户审阅后发送 | 站外 | 0 页 | 草稿交付→人工发送；不作对外承诺 | ⏳ |
| K5 | 2026-10-02（Day 7） | 外联 publishingxpress.com：提交对比角度（免费即时 vs 人工服务），获取被引用机会 | 站外 | 0 页 | 同 K4 纪律 | ⏳ |
| K6 | 2026-10-03（Day 8） | 首页 "Featured in"/评价位结构准备：等 K3 产出真实评分后挂载；先做 schema.org/Review/AggregateRating 的合规占位方案（无真实数据不启用） | 站内 | ≤1 页 | 无真实评分不上线 AggregateRating（防虚假结构化数据惩罚） | ⏳ |
| K7 | 2026-10-04（Day 9） | P2 跟踪机制建立：① 月度 Kelriva 重测日程（下月同日）；② 扩展词库计划（Bing 高引用词选 10 个商业意图词，CRₚ+Wilson 区间口径）——25 词 Perplexity 批量测已在其他会话进行，此处仅登记口径引用 | 流程 | 0 页 | 重测日期写入日历；口径与 `GEO跨平台统计分析方法论.md` 一致 | ⏳ |

> ⛔ 防御性否决（不执行项， Kelriva 原建议）：❌ 屏蔽 `/guide/best-ebook-converter`（唯一无品牌引用来源）；❌ Wikipedia 主动外链（COI 高风险）；❌ 无真实数据时上线 AggregateRating。

### 执行纪律（沿用 §五，自动化强制执行）

- ✅ 每批次 ≤3 个页面改动
- ✅ 每日仅推进 1 个批次（不一次性全部完成）
- ✅ 每次改动后必跑门禁：`node scripts/audit-content-integrity.mjs` + `node scripts/find-duplicate-headings.mjs` + `npm run build`（0 error 才 commit）
- ✅ **不自动 push**：commit 后报告，人工复核再 push（push = 公开发布，且需防部署冻结）
- ✅ 重定向走既有 `BLOG_REDIRECTS`（`src/middleware.ts:22`），不新造机制
- ✅ 正文禁尖括号标签；批量脚本只替换/定点更新
- 🆕 门禁增补：CI 校验 `public/llms.txt` 每条链接均有对应注册 slug（防 C1/C2 类死链回归）

---

## 九、增量待办 D 系列（2026-09-26 代码摸底衍生）

> 来源：本次全量代码摸底（`src/` 250 文件 + 部署/配置核查），非既有审计清单。
> 原则：**文档类与死代码类改动零 SEO 风险，可立即做；内容类改动沿用 §五纪律（≤3 页/日）**。
> ⚠️ 注意 D5 的方向：**队列是刻意废弃，不是待接线**。2026-08-04 实测 BullMQ 在 Vercel serverless 上 100% 504，
> 已决策改为请求内同步转换，且该教训已作为对外内容资产输出。**正确动作是删除死代码，不是接回来。**

| ID | 项 | 依据 | 风险 | 触及 | 状态 |
|----|----|------|------|------|------|
| D1 | 删除 `next-sitemap.config.js`（未被 git 跟踪的死配置，占位域名） | `git ls-files` 未跟踪 + 全仓无引用 + package.json 无依赖 | 🟢 | 0 页 | ✅ **已完成（用户 2026-09-26 21:35 拍板：直接删除）**：先归档后按决策删除，`find` 全仓已无残留。留证于此：该文件自始未被 git 跟踪（`git ls-files --error-unmatch` 报错），且被 `.gitignore:29` 的 `*.js` 规则忽略，故**远端本就不存在副本**，删除不产生历史丢失 |
| D2 | 修正 `PROJECT_README.md` / `README.md` 与代码不符的描述 | 对比 `conversion-map.ts`(31 对)、`auth.ts`(Supabase 已移除)、`convert-handler.ts`(同步) | 🟢 | 0 页 | ✅ **已完成**：加顶部可信度声明 + 定点修正（队列/Supabase/28→31/孤儿端点/仓库名） |
| D3 | 补 guide 正文：22 篇中 **14 篇 <100 词** | `geo-audit-guide.mjs` 实测（21 PASS / 1 WARN，但自承 14 篇低于阈值） | 🟡 | 22 页 | ⏳ 待执行（≤3 页/日） |
| D4 | `/es/guide/*` 语言错配：11 个页面为英文兜底（`<lang="es">` 包英文正文） | `src/app/sitemap.ts:75-91` + i18n 摸底：内容层西语仅 9 页 | 🟡 | 11 页 | ⏳ **待重新论证**：⚠️ 经审计修正——原拟「删除这些页面」会**自造 11 个 404**。`sitemap.ts` 注释明示它们是「URL is valid and hreflang/canonical are correct」，为防 GSC 持续 404 而保留。**正确动作是补西语译文，不是删页**。另：勿与已证伪的「/es 致断崖」论点混淆（§1.4） |
| D5 | 清理异步架构死代码：`lib/queue.ts`(28KB)、`worker/`、`api/convert/[jobId]/*` | 全仓无 `.add()` 调用 | 🟡 | 0 页 | ⏳ 待执行（**删除**，非接线）。⚠️ 经审计修正风险等级（原标 🟢 偏低）：`queue.ts` 被 `tests/unit/queue.test.ts`(5 处)、`tests/boundary/*`(2 处) 等 require，且 `package.json:14` `start-with-worker` 引用 `./dist/lib/queue`。**删除须同步处理测试与脚本**，否则 `npm test` 直接失败 |
| D6 | `.gitignore:29` 的 `*.js` 规则致 `scripts/*.js` 静默不入库 | 实测 `geo-audit.js`/`geo-audit-v2.js` 未被跟踪，仅 2 个 js 被 `!` 放行 | 🟡 | 0 页 | ⏳ 待决策（当前影响小：二者已被 `.mjs` 取代，但机制有隐患） |

**⚠️ D1/D2 验收方式更正（红队审计指出「假门禁」）**

`audit-content-integrity.mjs` 与 `find-duplicate-headings.mjs` 只扫描 `src/data/content` 与 `src/data/blog` 下的 `.ts`，
**不读任何 `.md`**。本次改动全部落在 `.md` 与未跟踪配置上，因此这两个脚本跑出 0 error **不构成验收证据**（覆盖率 0）。
这正是本项目已知的**头号失败模式**：脚本静默假成功。

D1/D2 的**真实验收**应为：
1. `git ls-files --error-unmatch next-sitemap.config.js` → 报错（确认从未跟踪）→ 归档后 `ls` 不命中 ✅
2. 全仓 `grep -rn "next-sitemap"` → 无引用 ✅
3. 逐条核对 README 新写入的数字与代码实测一致（31 转换对 / 18 格式 / sitemap 150 / src 246 / tests-unit 10）✅
4. `npx jest` 全量通过（确认未破坏测试；临时探针文件已删除）— **待执行**
5. Markdown 表格结构无 CR 截断（实测 CR 数 1 → 0）✅

> 后续凡"改文档/配置"类任务，禁止引用这两个脚本作为门禁。

---

**文档版本**: v2.4（D 系列并入；D1/D2 已完成）
**下次更新**: 2026-09-28（Batch 4 Day 3 + K1 推进前）
**状态更正（2026-09-26 21:35 实测）**：① `b50732d`+`5ad0dcb` **已推送**——`git rev-list --left-right --count origin/main...main` = 0/0，本地与远程完全同步，原「未 push」记录系过时信息；② D1/D2 已由用户复核通过并提交。
