# R2 合并方案：MOBI vs AZW3 三页争 → 一页吃整簇

> 状态：✅ 已执行（2026-08-11）
> 关联：`docs/ops/mobi-epub整簇意图分布总览.md` §R2（过饱和，最高优先之一）
> 模式：与 R1 一致（"一页吃整簇"：保留最权威页，败者 301 归档 + 独有资产并入）
> 铁律：归档一律 `git mv` 到 `_archived/`，绝不用 `git rm`/`rm`（见 MEMORY §7）

---

## 1. 问题确认（R2 内耗）

三页同抢「MOBI vs AZW3 for Kindle」意图，title 仅词序/修饰语不同：

| 页面 | 类型 | 线上 title | 注册 | ES | 内容量 |
|---|---|---|---|---|---|
| `/blog/azw3-vs-mobi` | 博客 | AZW3 vs MOBI: Which Format Should You Use for Kindle? | 2026-08-01 | ✅ | 8 段 + 11 FAQ（最丰富） |
| `/guide/mobi-vs-azw3` | 指南 | MOBI vs AZW3: Which Kindle Format Should You Actually Use? | 2026-08-02 | ❌ | 5 段 + 6 FAQ |
| `/blog/mobi-or-azw3-for-kindle` | 博客 | MOBI or AZW3 for Kindle: Which Should You Send to Your Device? | 2026-08-08 | ✅ | 6 段 + 6 FAQ |

**内耗证据**：三页意图完全一致（"哪个格式给 Kindle"），Google 将权重分散到三页，谁都难上首页。这正是整簇总览 R2 标红项。

---

## 2. 胜者判定 = `/blog/azw3-vs-mobi`

数据支撑（为何不是另两页）：

1. **内容最丰富**：8 段 + 11 FAQ + 最多内链（指向 /convert/azw3-to-mobi、/convert/mobi-to-epub、/convert/epub-to-azw3、/convert/epub-to-zip、/blog/ebook-formats-explained）——天然权威页。
2. **已被另外两页内链指向（de-facto hub）**：
   - `/guide/mobi-vs-azw3` 正文链向它（`[AZW3 vs MOBI](/blog/azw3-vs-mobi)`）
   - `/blog/mobi-or-azw3-for-kindle` 正文链向它（`[AZW3 vs MOBI breakdown](/blog/azw3-vs-mobi)`）
   → 合并时权重无损，反而集权。
3. **有 ES 版**（另两页合并后 301 的 `/es` 变体有承接页）。
4. **注册最早**（2026-08-01），积累信号更可能靠前。

> 备选（整簇总览原建议）：保留 `mobi-or-azw3-for-kindle` 作决策页、只合并另两页。
> 但 `azw3-vs-mobi` 现已成 hub 且更丰富，**3→1 集权更彻底、风险更低**，故主推 3→1。
> 若你更倾向"保留决策页"备选，执行时改为：仅 301 `mobi-vs-azw3`(guide)→`mobi-or-azw3-for-kindle`，不动 `azw3-vs-mobi`。

---

## 3. 败者命运（均 301 → 胜者）

| 败者 | 301 目标 | 备注 |
|---|---|---|
| `/guide/mobi-vs-azw3` | `/blog/azw3-vs-mobi` | 无 ES；其 `/es` URL 本不存在，无 ES 流量损失 |
| `/blog/mobi-or-azw3-for-kindle` | `/blog/azw3-vs-mobi` | 有 ES → `/es` 变体 301 到 `/es/blog/azw3-vs-mobi`（存在） |

---

## 4. 唯一资产合并（只并败者独有、胜者缺的内容）

胜者已有 11 个 FAQ，经比对**已覆盖两败者全部 FAQ 意图**（"Send to Kindle 收 MOBI 吗""AZW3=KFX?""Paperwhite 用哪个"等），故 **FAQ 不并，避免重复**。

只并两处独有正文资产：

### A. `mobi-or-azw3-for-kindle` 的「逐型号决策表」（有 ES 源，直接复用）
胜者现只有「2015+/更旧/不确定」粗表；败者有一张**具体型号表**（Paperwhite 3/Oasis/Voyage/Kindle Basic 2019-2024/Scribe/Keyboard/Touch/DX）。加到胜者「AZW3 vs MOBI for Kindle: The 10-Second Decision」段之后，作为补充小节 `Match the Format to Your Exact Kindle`。EN + ES 同步（ES 源取自败者 `es.content` 同名表）。

### B. `mobi-vs-azw3`(guide) 的「Calibre 桌面工作流」+ 钱页深链（无 ES 源，需译 ES）
败者「How to convert into each format」段含 Calibre 桌面 **Convert books** 对话框工作流，并链 `/convert/mobi-to-pdf`、`/convert/mobi-to-txt`（胜者未链）。并入胜者「Converting Between the Two」段，补一句桌面 Calibre 说明 + 这两条链接。EN 写后译 ES。

### C. 内容准确性修正（顺手）
胜者「What MOBI Actually Is」写 "Amazon bought [Mobipocket] in **2007**"，guide 写 "acquired in **2005**"。史实为 **2005**。并入时把胜者改为 2005（一处 EN + 一处 ES）。

---

## 5. 注册 / llms / middleware / 内链 改动清单

### 5.1 内链改指胜者（3 个活页，避免 301 链 + 集权）
- `src/data/blog/epub-vs-mobi.ts`（EN）line 55：
  `[MOBI vs AZW3 guide](/guide/mobi-vs-azw3)` → `[MOBI vs AZW3](/blog/azw3-vs-mobi)`
- `src/data/guides/azw3-to-mobi-keep-formatting.ts`（EN）line 35：
  `[/guide/mobi-vs-azw3](/guide/mobi-vs-azw3)` → `[/blog/azw3-vs-mobi](/blog/azw3-vs-mobi)`
- `src/data/blog/can-kindle-read-azw3.ts`（EN line 37 + ES line 125）：
  `[MOBI or AZW3 for Kindle](/blog/mobi-or-azw3-for-kindle)` → `[MOBI or AZW3 for Kindle](/blog/azw3-vs-mobi)`
- （可选卫生）`src/data/_archived/epub-vs-azw3-vs-mobi.ts` line 52 同样改指（归档文件不被 seo-critic 扫描，可不改；改了更整洁）

### 5.2 移除败者注册
- `src/data/blog/index.ts`：删 `import * as post21 from "./mobi-or-azw3-for-kindle"` + 从 `posts` 数组移除 `post21`；更新邻接注释。
- `src/data/guides/index.ts`：删 `import * as mobiVsAzw3 from './mobi-vs-azw3'` + 从 `all` 数组移除 `mobiVsAzw3`。

### 5.3 `public/llms.txt`
- 删 line 60：`[MOBI or AZW3 for Kindle …](…/blog/mobi-or-azw3-for-kindle)`
- 删 line 84：`[MOBI vs AZW3 …](…/guide/mobi-vs-azw3)`
- 保留 line 41（胜者 `azw3-vs-mobi`）
- （seo-critic 查博客↔llms.txt 同步；guide 同步亦建议清理，漏删会 CRITICAL）

### 5.4 `src/middleware.ts`
- 新增 `GUIDE_REDIRECTS` map（与 `BLOG_REDIRECTS` 并列）：
  ```ts
  const GUIDE_REDIRECTS: Record<string, string> = {
    '/guide/mobi-vs-azw3': '/blog/azw3-vs-mobi',
  };
  ```
- `BLOG_REDIRECTS` 加一行：
  ```ts
  '/blog/mobi-or-azw3-for-kindle': '/blog/azw3-vs-mobi',
  ```
- 重定向查找改为三表合并：
  ```ts
  const redirectTarget =
    CONVERSION_REDIRECTS[pathWithoutLocale] ??
    BLOG_REDIRECTS[pathWithoutLocale] ??
    GUIDE_REDIRECTS[pathWithoutLocale];
  ```
- locale 保留逻辑（已有）自动给 `/es` 变体 → `/es/blog/azw3-vs-mobi`（存在）。

### 5.5 归档（非删除）
```bash
cd E:/一人公司/电子书格式转换站
git mv ebook-converter/src/data/blog/mobi-or-azw3-for-kindle.ts ebook-converter/src/data/_archived/mobi-or-azw3-for-kindle.ts
git mv ebook-converter/src/data/guides/mobi-vs-azw3.ts ebook-converter/src/data/_archived/mobi-vs-azw3.ts
```
- rename 不触发 safe-delete 钩子；绝不用 `git rm`/`rm`。

---

## 6. 内容合并字段级（胜者 `azw3-vs-mobi.ts`）

### 6A — 插入「逐型号决策表」小节（源：败者 `mobi-or-azw3-for-kindle` sections[1]，有 ES）
插在现有 `AZW3 vs MOBI for Kindle: The 10-Second Decision` 段之后：
```ts
{
  heading: `Match the Format to Your Exact Kindle`,
  body: `The 2015 rule is the short version. If you know the model, here's the precise call.

| Your Kindle | Best format | Why |
|-------------|-------------|-----|
| Paperwhite 3 or later (2015+) | AZW3 | Full styling engine, embedded fonts |
| Oasis, Voyage, any current model | AZW3 | Designed around KF8 |
| Kindle Basic (2019, 2022, 2024) | AZW3 | Modern firmware expects it |
| Kindle Scribe | AZW3 | Handles typography and layouts |
| Kindle Keyboard / 4 / Touch | MOBI | Cleanest sideload over USB |
| First-gen Paperwhite (2012) | MOBI | Limited AZW3 styling support |
| Kindle DX / DXG | MOBI | Pre-KF8 hardware |

For the broader Kindle format picture including KFX, see [Kindle Formats Explained](/guide/kindle-formats).`
}
```
ES 同步：用败者 `es.content` 中同名表（已是西语）插入胜者 `es.content` 对应位置，并加 `[Kindle Formats Explained](/guide/kindle-formats)` 西语锚。

### 6B — 「Converting Between the Two」段补 Calibre 桌面工作流（源：败者 `mobi-vs-azw3` sections[4]，译 ES）
在胜者该段末追加：
```ts
body 末追加：
`For a desktop workflow with full output-profile control, Calibre's **Convert books** dialog lets you pick the exact format and tweak margins, headings, and reading order. Already have a MOBI and need a different output? You can also turn it into a printable document ([MOBI to PDF](/convert/mobi-to-pdf)) or pull just the words ([MOBI to TXT](/convert/mobi-to-txt)).`
```
ES 同步：将上述译西语插入胜者 `es.content` 对应段。

### 6C — 史实修正
胜者 `What MOBI Actually Is` 段 "Amazon bought in **2007**" → "**2005**"（EN + ES 各一处）。

> 注：胜者其余 FAQ/段落与败者高度重叠，不并，避免内耗。

---

## 7. 风险与回滚

**风险**
- 301 短期（数周）权重波动；但胜者已是 hub 且内容最丰，承接无忧；两败者 inbound 极少（仅互链 + 3 处活页内链已改指）。
- `mobi-vs-azw3` 无 ES → 其 `/es` URL 本不存在，301 无 ES 流量损失。
- seo-critic：移除注册 + llms.txt 同步后不会报 dead-internal-link（活页内链已改指胜者，非 404）。

**回滚**
```bash
# 撤 301（middleware 删 GUIDE_REDIRECTS 项 + BLOG_REDIRECTS 该项）
git mv ebook-converter/src/data/_archived/mobi-vs-azw3.ts ebook-converter/src/data/guides/
git mv ebook-converter/src/data/_archived/mobi-or-azw3-for-kindle.ts ebook-converter/src/data/blog/
# 恢复 index.ts / guides/index.ts / llms.txt / 内链改指 / 胜者合并内容
git add -A && git commit && git push
```

---

## 8. 验收标准（GSC，对齐 2026-08-24 自动化复测）

- 两败者 URL 在 GSC 覆盖率报告显示 301 / 被摘出索引。
- 胜者 `azw3-vs-mobi` 的查询 `azw3 vs mobi`、`mobi vs azw3`、`mobi or azw3 for kindle` 展示上升、平均位置前移（目标进前 30）；同一查询不再三页分散。
- 合并后整站「MOBI vs AZW3」意图集中度提升。

---

## 9. 关联与后续（同簇其它内耗，不在本轮）

- **R4（偏密）**：Kindle 子簇 6 页，立 `kindle-formats` 为支柱集权（本轮已在胜者并表处加 `/guide/kindle-formats` 链接，预埋）。
- 本轮只解 R2，避免一次动太多难归因。

## 10. 已知约束提醒（不要在本轮触碰）

- **50MB 不实声明**：在 `ebook-formats-explained.ts`（R1 胜者），**不在 R2 三页** → 本轮不碰（属独立议题待办#4/#5）。
- 文案全英文（硬约束），禁反引号，内链用真实 slug；ES 与 EN 须同步。

## 11. 执行记录（2026-08-11）
- **状态**：已执行，本地已提交（commit 待用户本机 `git push origin main` 上线）。
- **关键修正**：执行中发现 `blog/index.ts` 的 `posts` 数组仍引用已删除 import 的 `post21`（undefined），已移除避免 tsc 报错。
- **门禁**：tsc 0 错；seo-critic 0 严重/0 警告（注册博文 33 篇；CONVERSION_MAP 30 条）；`next build --webpack` 成功。
- **核验**：push 后 Vercel 重建（约 75–90s），curl 剥离 `<script>` 验：两败者 → 301（location `/blog/azw3-vs-mobi`，含 `/es`）；胜者 200 + 含扩展决策表 + Calibre「Convert books」段 + `mobi-to-pdf`/`mobi-to-txt` 深链；史实 2005 生效。
- **commit 哈希回填**：见 `docs/ops/SEO改动溯源.md` R2 条目。
