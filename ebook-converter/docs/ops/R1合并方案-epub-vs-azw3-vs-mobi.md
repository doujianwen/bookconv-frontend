# R1 合并方案：epub-vs-azw3-vs-mobi → ebook-formats-explained

> 来源：整簇总览 `docs/ops/mobi-epub整簇意图分布总览.md` 中的 R1（最高优先级内耗）
> 策略：一页吃整簇（One Page, One Cluster）—— 把重复对比页合并到权威页，301 收敛权重
> 状态：✅ 已执行（commit `f6a8a1d`，待用户本机 push + 线上核验）
> 日期：2026-08-11

---

## 1. 问题确认（证据）

| 维度 | 胜者候选 `ebook-formats-explained` | 败者 `epub-vs-azw3-vs-mobi` |
|---|---|---|
| 注册位置 | `index.ts` post2（第 2 个注册） | `index.ts` post28（第 28 个） |
| 发布日期 | **2026-07-12**（更早，积累信号多） | 2026-08-09（新建） |
| 标题 | `EPUB vs AZW3 vs MOBI: Which Ebook Format Should You Use?` | `EPUB vs AZW3 vs MOBI: Which Kindle Format Should You Use in 2026?` |
| 西语版 | ✅ 有 `es` 字段（i18n 完整） | ❌ 无 es |
| 内容侧重 | 三格式详解 + BookConv 功能/定价宣发 | 三格式对比表 + Kindle 决策 + Send-to-Kindle FAQ |
| 独有资产 | 定价段（10/50/100MB）、DRM/装 Calibre FAQ | **「At a Glance」紧凑对比表**、**Send to Kindle 期望格式 FAQ**、2026 新鲜度 |

**内耗本质**：两页 H1 前 22 字符完全一致（`EPUB vs AZW3 vs MOBI: Which`），同抢查询 `epub vs azw3 vs mobi` / `which ebook format should i use` → Google 在两页间分散权重，谁都难进前 30。

**入链核查（已 grep 全仓 `src/`）**：除 `index.ts:28` 的 import 与文件自身 slug 外，**无任何页面链向败者** → 移除败者不产生入链死链，风险面最小。

---

## 2. 决策：胜者 = `ebook-formats-explained`

理由：
1. **更早建立**，相对 accumulation 信号更可能靠前（站点 7/26 才上线，post2 几乎是首发批次）。
2. **带西语版** → 301 目标保留 i18n 覆盖；若反向（把无 es 的败者立为权威）需新建 es slug 映射，徒增复杂度。
3. **范围更宽**（对比 + 产品），天然适合做「格式选择」支柱页。
4. 败者无 inbound 死链风险（见 §1），合并代价低。

败者命运：**301 重定向 → 胜者**，源文件 `git mv` 归档（绝不用 `git rm`/`rm`），其唯一高价值内容并入胜者。

---

## 3. 执行步骤（checklist）

> 每步改完跑 `seo-critic` 局部校验；全部完成后跑 tsc + build + 部署核验。
> ⚠️ 删文件一律 `git mv` 到 `src/data/_archived/`，触发 §7 铁律（沙箱 safe-delete 会连带删父目录）。

- [ ] **Step 1 — 合并唯一内容到胜者**
  - 文件：`src/data/blog/ebook-formats-explained.ts`
  - 在 `content.sections` 的 intro 之后、首节之前插入新 section **`At a Glance`**（紧凑对比表，取自败者 lines 12–22，见 §4A）。
  - 在 `faqs` 数组追加 2 条（取自败者 lines 97–98、93–94，见 §4B）。
  - 可选：title 末尾加 ` in 2026` 强化新鲜度（默认不改，避免 churn；如加需同步 llms.txt 文案）。

- [ ] **Step 2 — 注册表移除败者**
  - 文件：`src/data/blog/index.ts`
  - 删 `import * as post28 from "./epub-vs-azw3-vs-mobi";`（line 28）
  - 从 `posts` 数组（line 43）移除 `post28`
  - 同步删注释行 28 关联说明（如有）

- [ ] **Step 3 — llms.txt 删除败者行**
  - 文件：`public/llms.txt`
  - 删 line 68：`- [EPUB vs AZW3 vs MOBI: Which Kindle Format Should You Use in 2026?](https://www.bookconv.com/blog/epub-vs-azw3-vs-mobi)`
  - （seo-critic 门禁查博客↔llms.txt 同步，漏删会 CRITICAL）

- [ ] **Step 4 — middleware 加 301**
  - 文件：`src/middleware.ts`
  - 在 `BLOG_REDIRECTS`（line 22–24）加一行：
    ```ts
    '/blog/epub-vs-azw3-vs-mobi': '/blog/ebook-formats-explained',
    ```
  - 复用 Item 4 已验证的 locale 保留逻辑（/es 前缀自动带上）。

- [ ] **Step 5 — 归档源文件（非删除）**
  ```bash
  cd E:/一人公司/电子书格式转换站
  git mv ebook-converter/src/data/blog/epub-vs-azw3-vs-mobi.ts ebook-converter/src/data/_archived/epub-vs-azw3-vs-mobi.ts
  ```
  - 用 `git mv`（rename 不触发 safe-delete 钩子）；绝不用 `git rm`/`rm`。

- [ ] **Step 6 — 质量门禁**
  ```bash
  node node_modules/typescript/bin/tsc --noEmit   # 0 错
  node scripts/seo-critic.mjs                       # 0 严重 / 0 警告
  ```

- [ ] **Step 7 — 构建 + 部署 + 核验**
  ```bash
  $env:NODE_OPTIONS="--use-system-ca"
  node node_modules/next/dist/bin/next build --webpack
  git add -A && git commit -m "..." && git push origin main
  ```
  - 部署后（等 75–90s）用 Node fetch + 剥离 `<script>` 核验：
    - 败者 URL `→ 301` 且 `location: /blog/ebook-formats-explained`（含 `/es` 变体）
    - 胜者 `200` + 正文含 `At a Glance` 表 + 新增 `Send to Kindle` FAQ
    - 胜者内链 `/convert/epub-to-azw3`、`/convert/mobi-to-epub` 仍存活

---

## 4. 内容合并具体改法（字段级）

### 4A — 插入的 `At a Glance` section（源：败者 lines 12–22）

加到 `ebook-formats-explained.ts` 的 `content.sections`，作为 intro 后的**第一个 section**：

```ts
{
  heading: `At a Glance`,
  body: `If you remember one table, make it this one.

| | EPUB | AZW3 | MOBI |
|---|---|---|---|
| Backed by | Open standard (IDPF) | Amazon (KF8) | Amazon (legacy) |
| Best on | Kobo, Apple Books, most e-readers | All modern Kindles | Pre-2015 Kindles |
| Styling | Full CSS, embedded fonts | Full CSS, embedded fonts | Limited; flattens layout |
| Open or locked | Open, portable | Amazon-centric | Amazon-centric |
| Future | Actively developed | Amazon's current standard | Frozen; deprecated |

The short version: EPUB for everything non-Kindle, AZW3 for any current Kindle, MOBI only for ancient hardware.`
}
```

### 4B — 追加的 FAQ（源：败者 lines 93–94、97–98）

```ts
{
  question: `How do I convert EPUB to AZW3?`,
  answer: `For one or two books, use a browser converter: upload the EPUB, choose AZW3, download. No Calibre install required.`
},
{
  question: `What format does Send to Kindle expect?`,
  answer: `Send to Kindle accepts EPUB and PDF by email and converts them to AZW3 in the cloud. It no longer accepts MOBI. If you sideload over USB, pre-convert to AZW3 yourself.`
}
```

> 注：败者其余 FAQ（AZW3 vs MOBI、Kindle 读 EPUB、存 EPUB 或 AZW3、MOBI 还在用）与胜者 FAQ 高度重叠，不并入，避免重复。

---

## 5. 风险与回滚

**风险**
- 301 短期（数周）权重波动；但胜者权威足够承接，且败者几无 inbound 链接，损失极小。
- 已 grep 确认无页面链向败者 → 无入链死链（seo-critic 不会因本合并报 dead-internal-link）。
- 出链死链：败者正文链向 `/blog/azw3-vs-mobi`、`/guide/mobi-vs-azw3` 等，随页删除自然消失，不影响其它页。

**回滚**
```bash
# 撤 301
# 编辑 src/middleware.ts 删 BLOG_REDIRECTS 该项
git mv ebook-converter/src/data/_archived/epub-vs-azw3-vs-mobi.ts ebook-converter/src/data/blog/
# 恢复 index.ts import + posts 项、llms.txt line 68
# 撤胜者合并内容（Step 1 改动）
git add -A && git commit && git push
```

---

## 6. 验收标准（GSC，对齐 2026-08-24 自动化复测）

- 败者 URL 在 GSC 覆盖率报告显示为 301 / 被摘出索引。
- 胜者 `ebook-formats-explained` 的查询 `epub vs azw3 vs mobi`、`which ebook format should i use` 展示上升、平均位置前移（目标进前 30）。
- 合并后整站「格式选择」意图集中度提升：同一查询不再两页分散。

---

## 7. 关联与后续（同簇其它内耗，不在本轮）

- **R2（过饱和）**：`azw3-vs-mobi`(博客) / `mobi-vs-azw3`(指南) / `mobi-or-azw3-for-kindle`(博客) 三页争 MOBI vs AZW3 → 下一轮合并。
- **R4（偏密）**：Kindle 子簇 6 页，立 `kindle-formats` 为支柱集权。
- 本轮只解 R1，避免一次动太多导致难以归因。

## 8. 已知约束提醒（不要在本轮触碰）

- **50MB 不实声明**：`ebook-formats-explained.ts` line 87 写 Pro「Up to 50MB」，与 `convert-handler.ts` 硬编码 10MB 矛盾（见 MEMORY §4）。本轮合并**不新增、不扩写**定价段；如需修正属独立议题（依赖 Pro/REDIS 链路，见待办#4/#5），不在 R1 范围。
- 文案全英文（硬约束），禁反引号，内链用真实 slug。

---

## 执行记录（2026-08-11）

- **Commit**：`f6a8a1d`（5 文件，48 insertions / 3 deletions，rename `blog → _archived`）
- **门禁**：tsc 0 错 · seo-critic 0 严重/0 警告 · `next build --webpack` 成功
- **Push**：✅ 用户本机 `git push origin main` 已上线（沙箱 GCM `/dev/tty` 不可用语交互凭据失败，与 c81ee89 同模式；真实推送走用户机器网络）
- **核验（2026-08-11，Vercel 重建后 curl 剥离 `<script>` 实测）**：
  - 败者 `/blog/epub-vs-azw3-vs-mobi` → **301** 且 `location: /blog/ebook-formats-explained` ✅（含 `/es` 变体，locale 保留逻辑生效）
  - 胜者 200 + 正文含 **`At a Glance` 表**（PASS）+ **`Send to Kindle` FAQ**（PASS）✅
  - 胜者内链 `/convert/epub-to-azw3`、`/convert/mobi-to-epub` 存活 ✅
- **溯源**：`docs/ops/SEO改动溯源.md` 已追加 R1 条目
