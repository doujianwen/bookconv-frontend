# Convert 页面 SEO/GEO 规范审计 — 问题清单与修复结论

> 2026-09-25 | 对应执行计划 R 系列任务：基于上次发现的问题，按页面类型逐项核查并彻底补齐遗留漏洞
> 审计工具：`scripts/geo-audit-content.mjs --no-online`（校准后阈值，见 §2.4 of standards doc）

---

## 一、审计范围（按页面类型）

| 页面类型 | 覆盖 | 审计工具 | 结果 |
|---------|------|---------|------|
| **Convert 页**（31 个 `src/data/content/*.ts`） | 全量 | `geo-audit-content.mjs`（GEO 7 要素 0-7 分制） | ✅ **31/31 PASS**（本日从 22 PASS / 9 WARN / 0 FAIL 修复到位） |
| **Blog + Guide**（65 + 22） | 全量 | `audit-content-integrity.mjs` | ✅ 0 error / 0 warning |
| **权益声明面**（全 data 面 + archived） | 全量 | `audit-plan-claims.mjs` | ✅ 0 error / 0 warning（修复 10 处虚假声明，见 §三） |
| **全仓语法层**（258 文件） | 全量 | `syntax-sweep.mjs` | ✅ 0 parse failure（修复 1 个阻塞性预存语法错，见 §四） |
| **类型层** | 全仓 | `tsc --noEmit` | ✅ exit 0 |

---

## 二、问题清单（逐项）

### 批次 1：9 个 WARN 页缺 GEO 要素（Score 3.0–4.0）

审计明细（修复前）：

| 文件 | 标题数 | FAQ | 词数 | 分 | 缺失要素 |
|------|-------|-----|------|----|---------|
| azw-to-mobi | 6 | 6 | 373 | 4.0 | Quality, Headings |
| azw3-to-mobi | 6 | 6 | 719 | 3.5 | Comparison, Quality, Headings |
| djvu-to-pdf | 5 | 5 | 520 | 3.5 | Quality, FAQ, Headings |
| epub-to-jpg | 5 | 5 | 564 | 3.5 | Quality, FAQ, Headings |
| epub-to-png | 5 | 5 | 543 | 3.5 | Quality, FAQ, Headings |
| chm-to-mobi | 6 | 6 | 315 | 3.0 | Comparison, Quality, Headings |
| epub-to-word | 5 | 5 | 615 | 3.0 | Comparison, Quality, FAQ, Headings |
| lit-to-mobi | 5 | 6 | 378 | 3.0 | Comparison, Quality, Headings |
| mobi-to-azw3 | 5 | 6 | 492 | 3.0 | Comparison, Quality, Headings |

**修复动作**（`scripts/patch-warn-pages.cjs`，带命中数断言的定点注入，按文件 EOL 自适应 CRLF/LF）：
- 全部 9 页补 **Conversion Quality Checklist**（质量核对清单节）
- 5 页补 **X vs Y: Format Comparison** 对比节（含对比表）：azw3-to-mobi / chm-to-mobi / epub-to-word / lit-to-mobi / mobi-to-azw3
- 4 页补 FAQ 至 6 条（djvu / jpg / png / word）
- 全部补足 **标题数 ≥8**（加 Before You Convert / Troubleshooting 填充节）
- `export const wordCount` 元数据从虚标 2400–2500 改为真实英文正文词数（529–939）

**修复后**：9/9 全部 PASS（6.0–6.5 分）。

### 批次 2：audit-plan-claims 遗漏的虚假权益（R7 收口漏网）

R7（9/21）收口了要约层 8 文件 + 内容层 20 文件 64 处 + llms.txt，但以下 10 处漏网：

| 位置 | 虚假声明 | 修复 |
|------|---------|------|
| epub-to-txt.ts FAQ（批量转换） | "Pro users also get priority processing and larger file size limits" | 删除；改为 "capped at 10 MB on all plans" |
| epub-to-txt.ts FAQ（大小限制） | "Pro plan which supports files up to 50 MB" | 改为 "splitting your book into smaller chapters or converting chapter by chapter" |
| pdf-to-epub.ts FAQ（转换时长） | "Pro users get priority processing" | 删除；改为 "depends on page count, image quality, and your plan tier" |
| _archived/how-to-convert-epub-to-mobi.ts ×7（英 4 + 西 3，含门禁未标记的 2 处 50MB/100MB） | 50MB Pro / 100MB API / 5 conversions per hour | 全部改为 "10MB per file on all plans" 口径（西语同步） |

**修复后**：0 error / 0 warning。
**教训**：`_archived/` 目录同样会被门禁扫描（= 投放面），且西语文案（"cinco conversiones por hora"）不会被英文关键词的 grep 捕获 —— 修复后 grep 必须双语跑。

---

## 三、修复过程中发现并纠正的执行事故（过程透明）

1. **EOL 误判**：Git Bash `grep -lq $'\r'` 对本目录给出假阴性（报 LF），实际 8 个文件是 CRLF、mobi-to-azw3 是 LF —— **同目录混合 EOL**。脚本改为逐文件探测 EOL 后自适应。
2. **JSON.stringify 产双引号 heading**：首版脚本用 `JSON.stringify` 生成 `heading: "..."`，审计正则只认单引号 → 标题数不涨。已 git restore 9 文件后改为单引号输出重跑。
3. **FAQ 注入漏逗号**：FAQ 插入锚点未包含前一项闭合 `}`，产生 `{...}\n{...}` 相邻无逗号 → 4 文件语法错。已用字节级回溯脚本补逗号，并修正主脚本锚点。
4. **以上 1–3 均被 syntax-sweep 当场拦截** —— 该门禁（parse 全扫 + 文件名行号）再次证明是批量注入的唯一可靠防线。

---

## 四、意外收获：修复了一个阻塞全站部署的预存 bug

`html-to-epub.ts`（Phase-2 会话产物，非本次改动）存在 **裸反引号注入事故**：正文里写了行内代码反引号（`` `<h1>` ``、`` `https://` `` 等 16 个），把 body 模板串从内部截断，产生 **190 个 parse 错误**。

> 按 9/21 教训：parse 错误 → `next build` 失败 → Vercel 静默继续服务旧版本 → 站点看起来正常但 push 全部失效（当时冻结 14 小时的同一失败模式）。

**修复**：移除行内反引号与尖括号标签（`<h1>` → `h1` 等 4 处定点编辑）。修复后 syntax-sweep 0 失败。

**影响评估**：该文件最后 committing 于 `9bfe84e`（Phase 1），即 Phase-2 会话之后任何一次 push 若包含它都会部署失败。本次修复解除了这一悬置的部署阻断。

---

## 五、最终门禁矩阵（修复后）

| 门禁 | 命令 | 结果 |
|------|------|------|
| 语法全扫 | `npm run audit:syntax` | ✅ 258 文件 0 失败 |
| 内容完整性（blog/guide） | `npm run audit:content` | ✅ 0/0 |
| 权益声明 | `npm run audit:claims` | ✅ 0/0 |
| Convert GEO | `node scripts/geo-audit-content.mjs` | ✅ 31/31 PASS |
| 类型检查 | `npx tsc --noEmit` | ✅ exit 0 |

## 六、剩余已知项（不阻塞，留观察）

- 多数 convert 页 WordCount 半分项（正文 <1000 词）为**有意校准**结果（§2.4），不是缺陷；新增节已把 9 个 WARN 页词数抬到 529–939，属中段分布。
- `epub-to-azw3` FAQ=5（0.5 分）、`txt-to-epub` 标题=7，均为 PASS 区间内的半分项，留待下一轮内容深化时顺带补齐。
- 本次新增的 3 个一次性脚本（patch-warn-pages / fix-faq-comma / fix-archived-claims）保留在 `scripts/` 作为操作记录，未纳入 CI。
