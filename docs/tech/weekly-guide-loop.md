# Weekly Guide Loop — 找词 → 建页 → 验证 SOP

> 适用：bookconv.com 的 `/guide/*` 痛点长尾页常态运营
> 建立：2026-08-02 | 模式来源：哥飞《2025 年度网站比赛复盘》+ 本站已验证的 `/guide` 单一数据源架构

---

## 0. 为什么是这套机制（指标纪律）

bookconv.com 是**工具/订阅站**，不是广告站。增长靠长尾痛点页承接搜索意图 → 引导到 `/convert/*` 转化。

- **核心指标**：注册率 / 付费转化率 / 留存 —— **不是** PV/UV（广告站指标不适用）
- **绝不弹广告**（破坏工具站信任）
- **单页单关键词**（one page one keyword），模板化批量产出
- 外部链接视作长期资源，不是一次性引流

---

## 1. 四步闭环总览

```
[Step 1 找词] → [Step 2 建页] → [Step 3 门禁] → [Step 4 验证]
  每周一          周二~周四        提交前          推送后 ~90s
```

---

## 2. Step 1 — 找词（每周一，~30min）

### 种子源（按优先级）

1. **`竞品外链分析与推广计划.md` §2.1 高机会词**（KD=0，已验证低竞争，直接可用）
2. **`src/lib/conversion-map.ts`** 真实存在的转换对（保证 CTA 不悬空）
3. **`brave_serp_report.md`** 的 PAA（People Also Ask）→ 直接变成 FAQ 素材
4. 已发布 `/guide` 页的站内关联（related guides 互链）

### 筛选评分（每词打分，选 ≥8 分建页）

| 维度 | 权重 | 标准 |
|------|------|------|
| 流量潜力 | 3 | 竞品报告月流量，或 KD=0 高潜 |
| CTA 真实 | 3 | `conversion-map.ts` 有对应键（否则 **0 分**，不做） |
| 内链生态 | 2 | 已有相关博客/指南可互链 |
| 意图纯度 | 2 | 单一明确意图（transactional / informational）|

> 已发布的指南要从候选池排除（读 `src/data/guides/index.ts` 的 `all` 数组）。

---

## 3. Step 2 — 建页（周二~周四）

### 单一数据源（照 `src/data/guides/mobi-to-epub-keep-formatting.ts` 模式）

新建 `src/data/guides/{slug}.ts`，必含字段：

```ts
export const slug = '{slug}'
export const title = '...'
export const problem = '...'        // 首屏痛点 hook
export const date = 'YYYY-MM-DD'
export const tags = [...]
export const formats = { source: 'x', target: 'y' }  // 有则 CTA 链 /convert/x-to-y
export const keyTakeaways = [4 条]    // Key Takeaways 框
export const content = {
  intro: '...',
  sections: [ 5 个 { heading, body } ],
}
export const faqs: BlogFaq[] = [ 6 个 { question, answer } ]  // 照 PAA 写
```

### 硬规则（来自用户 + 已验证坑）

- ✅ **正文全部英文**（bookconv.com 是英文 SEO 站，用户硬性要求）
- ❌ **禁用反引号**（renderMarkdownToHtml 不支持 inline code）
- CTA：有 `formats` → `/convert/{source}-to-{target}`；无 → `/convert`
- 内链用真实 slug（博客读 `src/data/blog/*.ts`、指南读 `index.ts`）

### 注册 + 同步（缺一不可，否则 seo-critic 报 CRITICAL）

1. `src/data/guides/index.ts`：import 并加入 `all` 数组
2. `public/llms.txt` 的 `## Troubleshooting Guides` 段：**条数必须 = `getAllGuides().length`**

---

## 4. Step 3 — 门禁（提交前必跑）

```bash
node scripts/seo-critic.mjs     # 须 0 critical / 0 warn
node_modules/.bin/tsc --noEmit  # 须 0 类型错误
```

> ⚠️ 本地 Windows `next build --webpack` 可能在静态生成阶段环境性崩溃（worker exit 0xC0000409），**与代码无关**。Vercel/Linux 才是构建真源，以线上 curl 验证为准。

---

## 5. Step 4 — 验证（push 后 ~90s）

```bash
git push origin main   # Vercel 自动部署
```

等 ~90s 后 curl 验证每条新页：

| 检查项 | 期望值 |
|--------|--------|
| `/guide/{slug}` 状态码 | 200 |
| canonical 数量 | **1**（根 layout 不得手写 canonical，只靠 generateMetadata） |
| FAQPage JSON-LD | 出现，Question = 6 |
| CTA `/convert/*` | 200（无悬空链接） |
| `sitemap.xml` | 含 `/guide/{slug}`（en + es） |
| `llms.txt` | `## Troubleshooting Guides` 段 +1 |

es 变体 canonical **回退到 en URL**（本站 es→en 既定约定，非 bug）。

---

## 6. 提交纪律

- 只 `git add` 指南相关文件（数据文件 + index.ts + llms.txt），**严禁 `git add -A`**（仓库根有兄弟垃圾文件 f2148…txt / sitemap-urls.txt / gefei_articles.json，不属于本项目）
- 提交信息：`feat(guides): add Px pain-point guides (...)`
- 推送走 HTTPS + Git Credential Manager（SSH 22 端口已关）

---

## 7. 本周候选词池（滚动清单）

> 已发布 11 篇后剩余高机会候选（全部有真实 CTA，来自竞品分析 §2.1 + conversion-map）：

| 候选词 | 流量/KD | 真实 CTA（带 `to`，否则 500）| 已有内链博客 | 评分 | 状态 |
|--------|---------|----------|--------------|------|------|
| lit to epub | 10.8K / 0 | /convert/lit-to-epub | why-convert-lit-to-epub, lit-ebook-format | 10 | ✅ 本周实跑 |
| epub to txt | 6.5K / 2 | /convert/epub-to-txt | txt-to-epub | 9 | ✅ 本周实跑 |
| fb2 to epub | 242 / 0 | /convert/fb2-to-epub | fb2-to-epub | 8 | 待排期 |
| azw3 to mobi | 0 / 0 | /convert/azw3-to-mobi | azw3-vs-mobi | 8 | 待排期 |
| txt to epub | 0 / 0 | /convert/txt-to-epub | txt-to-epub | 8 | 待排期 |
| rtf to epub | 0 / 0 | /convert/rtf-to-epub | — | 7 | 待排期 |
| html to epub | 0 / 0 | /convert/html-to-epub | — | 7 | 待排期 |
| mobi to txt | 0 / 0 | /convert/mobi-to-txt | — | 7 | 待排期 |
| epub to rtf | 0 / 0 | /convert/epub-to-rtf | — | 7 | 待排期 |
| epub to html | 0 / 0 | /convert/epub-to-html | — | 7 | 待排期 |
| epub to doc | — | /convert/epub-to-doc | — | 6 | 待排期 |
| epub to jpg | — | /convert/epub-to-jpg | — | 6 | 待排期 |
| doc to epub | — | /convert/doc-to-epub | — | 6 | 待排期 |
| mobi to pdf | — | /convert/mobi-to-pdf | — | 6 | 待排期 |
| azw3 to pdf | — | /convert/azw3-to-pdf | — | 6 | 待排期 |
| epub to png | 0 / 0 | /convert/epub-to-png | — | 5 | 弱意图，P3+ |

> ⚠️ **CTA 格式铁律**：URL 用 `{source}-to-{target}`（如 `lit-to-epub`），**不是** conversion-map 的键格式 `{source}-{target}`（如 `lit-epub`）。`convert/[slug]/page.tsx` 用 `slug.split('-to-')` 解析，漏掉 `to` 会让 `target=undefined` → 500。

---

## 8. 自动化 / 定时触发

- **目标节奏**：每周一自动跑"找词 + 生成本周候选周报"（**不自动推 main**，人工确认后由我执行建页+门禁+推送），其余时间常态产出。
- **当前状态**：本会话 `automation_update` 工具不可用，定时任务未能通过工具创建。改用**人工触发 + SOP 驱动**：每周一你（或我）按 §2 种子源跑一遍找词 → 产出候选周报 → 你确认后我执行建页。
- **待补**：工具可用时，创建 recurring automation（schedule: 每周一），prompt = "读 `src/data/guides/index.ts` 的 `all` 数组 + `src/lib/conversion-map.ts` 键 + `竞品外链分析与推广计划.md`、`brave_serp_report.md`，按 §2 评分表产出本周建页候选周报（排除已发布 slug），不执行任何 git/推送操作。"
- **安全边界**：建页推送永远保留人工确认，不全自动推生产。
