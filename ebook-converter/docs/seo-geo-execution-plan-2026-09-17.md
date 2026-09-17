# BookConv SEO/GEO 执行规划文档

**制定日期**: 2026-09-17
**最近更新**: 2026-09-17 21:45
**执行状态**: Batch 1a / 1b 已完成并线上验证；Batch 1c（Title + 内链）待执行
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

**⚠️ 双渠道背离格局**：GSC 日均印象 -89% vs Bing AI 近 7 天 +22.1%。
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
| R6 | 🆕 **`bf10c69` 在 `/convert/epub-to-mobi` 引入近重复章节**：`How to Convert EPUB to MOBI (Step-by-Step)` 与 `How to Convert EPUB to MOBI: Step by Step` 并存，同一页出现两个语义相同的"转换步骤"章节。**已提交已 push，尚未上线**（线上实测当前仍只有 1 个） | 🔴 高 | **待决策** | **建议改法**：删除较旧的 `(Step-by-Step)` 章节，保留信息更完整的新版（新版含界面说明与设备建议）。这正是 spam update 命中的重复模式，不宜上线。审计脚本已能捕获该类（已升级为归一化比对） |

---

## 七、变更记录

| 日期 | 变更内容 | 提交 |
|------|---------|------|
| 2026-09-17 07:26 | 初始版本创建 | — |
| 2026-09-17 21:30 | 发现部署已冻结：`epub-to-mobi.ts` 语法错误 + 重复 import | a0680f5 |
| 2026-09-17 21:38 | 移除 3 页重复的 `Conversion Quality Guarantee` 章节（并行进程提交） | 49096ba |
| 2026-09-17 21:45 | 修复裸 HTML 标签泄漏；新增 2 个诊断脚本；发现 20 页缺 metaDescription | 060a806 |
| 2026-09-17 21:45 | 本规划文档改版：新增 B1a/B1b、风险登记、门禁脚本 | — |

---

**文档版本**: v2.0
**下次更新**: 2026-09-18（B1c 执行前）
