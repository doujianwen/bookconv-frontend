# BookConv 实体描述符漂移审计（GEO 实体一致性 1.2）

**日期**：2026-10-19
**方法**：以 `docs/ENTITY.md` 规范实体陈述为基准，对 `src/app` + `src/data` 全量 grep 比对；逐条判定是否违反红线。
**结论**：发现 **2 项高严重度红线违反**、**1 项高严重度事实矛盾**、**3 类中严重度口径漂移**；另发现 `ENTITY.md` 自身 1 处过时假设。已合规项同步记录，避免误伤。

---

## 0. 对 ENTITY.md 自身的修正（审计反身发现）
- `ENTITY.md` §3 原假设「站点未公开创始人信息」**已过时**：`src/app/[locale]/founder/page.tsx`（/founder 路由）已公开 Hongjian Dou（Andy），含 Person schema（`name: Hongjian Dou`、`jobTitle: Founder & CEO`、`url: https://www.bookconv.com/founder`）。
- 处置：已就地修正 `ENTITY.md` §3（改为「已公开，以 /founder 为 canonical 载体」）并在 §5 sameAs 补入创始人页 URL。

---

## 1. 高严重度 —— 红线违反（AI 可抓取、用户可见）

### 1.1 红线 #2：「无限制 / no limits / unlimited」过度主张
规范口径：免费档有 **4MB 单文件上限**，Pro 面向批量/大文件；不得写「无限制」。

| 文件:行 | 当前表述 | 建议修正 |
|--------|---------|---------|
| `src/app/layout.tsx:24` | `…No registration, no watermarks, no limits.` | `…No registration, no watermarks, free for personal use.` |
| `src/app/[locale]/page.tsx:106` | 首页 hero `No registration, no watermarks, no limits.` | 同上 |
| `src/app/[locale]/convert/[slug]/ToolPageClient.tsx:210` | 工具页 subtitle `no registration, no watermarks, no limits.` | 同上 |
| `src/data/guides/best-ebook-converter.ts:162` | `BookConv is completely free with no limits.` + `no paid plans, no upgrade prompts` | 与 Pro 计划矛盾 → `Free for personal use; a Pro plan covers batch and larger files.` |
| `src/data/guides/best-ebook-converter.ts:169` | 对比表 `BookConv | Unlimited | N/A | Free` | `BookConv | Free (4 MB/file) | N/A | Free` |
| `src/data/blog/epub-to-text.ts:27` | `convert unlimited files without any costs` | `convert free files without any cost` |
| `src/data/blog/epub-to-word.ts:20` | `convert unlimited files without any hidden charges` | `convert free files without hidden charges` |

### 1.2 红线 #1：「BookConv 是开源」误述
规范口径：BookConv 是**托管服务、非开源**；只有 Calibre 引擎是开源。

| 文件:行 | 当前表述 | 建议修正 |
|--------|---------|---------|
| `src/app/[locale]/about/page.tsx:19` | `keywords: [… "open source" …]` | 删除 `"open source"`（或改为 `calibre`），避免信号误判 BookConv 为 OSS |
| `src/app/[locale]/about/page.tsx:177` | `Open-source transparency — No black-box algorithms, fully auditable codebase` | `Transparent process — No black-box algorithms; conversion runs on the auditable Calibre engine` |

> 注：其余 ~18 处 "open source" 均正确指向 Calibre（如 about:112/167、ToolPageClient:232、各 guide），**非漂移**，不动。

---

## 2. 中严重度 —— 口径漂移（一致性，非硬红线但喂给 AI 会稀释实体）

### 2.1 红线 #3：破折号 `--` 双连字符（标题/默认串优先）
规范：统一 em dash `—`。

| 文件:行 | 当前 | 建议 |
|--------|------|------|
| `src/app/layout.tsx:21, 39, 46, 52` | `BookConv -- Free Online Ebook Format Converter` | `BookConv — Free Online Ebook Format Converter` |
| `src/app/layout.tsx:185` | `BookConv -- Free online ebook converter. …` | `BookConv — Free online ebook converter. …` |
| `src/app/[locale]/convert/[slug]/page.tsx:50` | `${source} to ${target} Converter -- Free Online` | `… Converter — Free Online` |

### 2.2 beta 措辞不一致（需业主定调）
- **无条件「free」**：about:251、FAQSection.tsx:34、compare/bookconv-vs-calibre:51（与 Pro 计划并存，但已用「personal use」限定，合规）。
- **「free during open beta」**：batch/page.tsx:17/41/108、BatchUpload.tsx:491、guides/batch-converter.ts:10/11/42/52-57、guides/calibre-alternative.ts:14/41/59。
- **决策建议**：统一为「个人/单文件免费；批量在 open beta 期间免费；Pro 面向批量与更大文件」，消除「永久免费 vs beta 免费」的摇摆。

### 2.3 blog 正文破折号 / 单连字符（内容批，低优先，与 H1 整改同批顺手做）
- `src/data/blog/` 下 narnia / lotr / marvel / twilight / harry-potter 等 intro 用 `--` 代替 `—`（约 30+ 处）。
- `src/data/content/epub-to-azw3.ts` 用 ` - ` 代替 `—`（多处）。
- 建议：内容批统一为 em dash，避免中英混排断句歧义。

---

## 3. 低严重度 —— 咨询建议（未触硬红线）
- `ToolPageClient.tsx:355` 标题 `Instant & Free` 与 `best-ebook-converter.ts:44` `Instant browser conversion`：软性速度词，未达「always instant」硬红线；建议保留但确保同页有「in seconds」佐证（多数已具备）。
- `src/data/blog/selection-intercept-converter.ts:6` `tags: ["BOOKCONV"]` 全大写：标签字段、非可见正文，暂不改。

---

## 4. 已合规（确认无漂移，勿误伤）
- **Calibre 为开源引擎**的表述全部正确（约 18 处，均指向 Calibre）。
- **速度「in seconds」** 表述约 30 处，符合 canonical。
- **28+ formats** 口径全站一致。
- **no registration / no watermarks** 一致。
- **反混淆 BookReverb / BookConvert** 仅出现在 about FAQ（正确上下文）。
- **创始人** 已在 /founder 页公开，Person schema 齐备。

---

## 5. 修复映射（供 1.3 对齐执行）
- **1.3 目标**：将上述 §1 高严重度 + §2.1 破折号项，按「定点替换、≤3 文件/批、改后 `audit:syntax` + `build`、commit 不 push」落地。
- **优先序**：§1.1（7 处「无限制」）> §1.2（2 处「开源」）> §2.1（7 处「--」）> §2.2（beta 定调，需业主拍板）。
- **§2.3 blog 正文破折号**并入 H1 整改批次（≤3 页/批）顺手做。
- 改完任一批，复跑 `node scripts/audit-content-integrity.mjs` + `node scripts/find-duplicate-headings.mjs` + `npm run build` 确认 0 error。

---

## 6. 整改状态（2026-10-19）

- **§1.1（无限制 7 处）**：✅ 已修。commit 分两批（§1.1a 3 文件 / §1.1b 3 文件），门禁 0 error（audit-content-integrity / find-duplicate-headings / build 全过）。
  - §1.1a：`layout.tsx`、`[locale]/page.tsx`、`ToolPageClient.tsx` 的 "No registration, no watermarks, no limits." → "…free for personal use."
  - §1.1b：`best-ebook-converter.ts`（正文 "completely free with no limits" + "no paid plans" → "free for personal use" + Pro 说明；对比表 BookConv 行 `Unlimited` → `Free (4 MB/file) | Pro | Free during beta`）、`epub-to-text.ts`、`epub-to-word.ts` 的 "unlimited files" → "your personal files"。
- **§2.2（beta 口径）**：✅ 无需改动。业主定调「个人/单文件免费（for personal use）；批量 open beta 期间免费；Pro 面向批量与更大文件」。核查代码：about FAQ、batch 页、BatchUpload、batch-converter / calibre-alternative 指南已一致落地；审计所引路径 `src/components/FAQSection.tsx`、`src/data/guides/bookconv-vs-calibre.ts` 经核查不存在（实际 about-FAQ 与 calibre-alternative 已合规）。口径已写入 `ENTITY.md` §7 作为 canon。
- **遗留待办（非原 §1.1 清单，验证时新发现，建议下一批）**：另有 3 处 "no limits" 框架表述未在原 §1.1 清单——`about/page.tsx:100`（"no limits on personal use"，已带 personal use 限定，合规）、`compare/bookconv-vs-calibre/page.tsx:146`（粗体 "No limits:" 但正文 "Free for personal use"，建议弱化标签）、`blog/why-bookconv.ts:20`（标题 "Free, With No Limits on the Basics"，"on the Basics" 限定）。均带限定语，暂判合规；建议下一批统一弱化为 "free for personal use" 风格以防 AI 误读。
- **§1.2（开源 2 处）**：✅ 已修（2026-10-19 同批）。about/page.tsx:19 keywords 删除 `"open source"`；about/page.tsx:177 "Open-source transparency" → "Transparent process — No black-box algorithms; conversion runs on the auditable Calibre engine"（保留透明口径、正确归功 Calibre 开源引擎）。grep 复核 about 页零 "open source/Open-source" 残留。门禁 0 error。
- **§2.1（-- 破折号 7 处）**：✅ 已修（2026-10-19 同批）。layout.tsx 5 处（line 21/39/46/52 的 "BookConv -- Free Online Ebook Format Converter" + line 185 footer "BookConv -- Free online ebook converter"）+ convert/[slug]/page.tsx:50 的 "Converter -- Free Online" → 全部统一为 em dash "—"。grep 复核两文件零 `--` 残留。门禁 0 error。
- **§2.3（blog 正文破折号 41 处）+ 遗留 3 处 "no limits" 框架表述（about:100 / compare/bookconv-vs-calibre:146 / blog/why-bookconv:20）**：✅ 已收口（2026-10-19 同批）。
  - §2.3：仅替换「两侧空格包裹的 `--`」(`(?<= )--(?= )`) 为 em dash `—`，保守规则天然排除 markdown 表格 `|---|`、HR `---`、CLI 标志 `--flag`（`epub-to-pdf-linux.ts` 代码块未动）。5 文件共 41 处（chronicles 9 / harry 11 / lotr 8 / marvel 5 / twilight 8；sync-reading 散文 dash 非空格包裹，保守保留）。commit `86d42e1` + `378107e`。验证：5 文件零残留空格 `--`、6 文件零 `--[A-Za-z]`。
  - 遗留 3 处 no-limits：about:100 "No hidden fees, no limits on personal use" → "No hidden fees; free for personal use"；compare/bookconv-vs-calibre:146 粗体 "No limits:" → "Free for personal use — no feature caps on individual conversions"；blog/why-bookconv:20 heading "Free, With No Limits on the Basics" → "Free for Personal Use"。commit `787043e`。
