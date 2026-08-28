# SEO 改动溯源记录

> 用途：每次 SEO 相关代码改动（title / meta / 内链 / 重定向 / 结构化数据等）在此留痕，便于以后做溯源比对。
> 字段：日期 | 页面/文件 | 改动类型 | 改动前 | 改动后 | 原因 | Commit | 关联任务
> 位置：本文件在 `docs/`（gitignore，属本地 Source of Truth），需本地备份。Git diff 本身是权威溯源，本表为人工可读索引。

---

## 2026-08-11 — /convert/epub-to-mobi 强化 title 交易意图
- **文件**：`src/data/content/epub-to-mobi.ts`（第 2 行 `title` 字段）
- **类型**：页面 `<title>` 标签（GSC 搜索结果展示用，全局模板自动追 ` | BookConv`）
- **改动前**：`EPUB to MOBI Online — Free Converter, No Sign-up`
- **改动后**：`Convert EPUB to MOBI Online — Free Converter, No Sign-up`
- **原因**：原 title 不含独立动词 "Convert"，无法精确匹配 #1 交易查询 `convert epub to mobi`（"convert" 只藏在 `Converter` 里）。GSC 诊断（2026-08-11）显示该交易词被指南页 `/blog/epub-to-mobi-guide`（title 含完整短语 "Convert EPUB to MOBI"）以 ~50 名吃下，钱页 ~67 名反被压——cannibalization 优先级颠倒。把动词提到最前可夺回交易意图，并与 Task F 内页外链（提钱页权威）协同把交易词抢回钱页。
- **未动部分**：`metaDescription`、H1（`EPUB to MOBI — Convert EPUB Files for Kindle` 已含动词）、页面正文与内链均未改。
- **Commit**：`c81ee89`（已推送 origin/main 并由 Vercel 构建上线）
- **构建**：`next build --webpack` 成功（266 路由）；tsc 0 错；seo-critic 0 严重/0 警告
- **线上核验（2026-08-11）**：`<title>` 已变为 `Convert EPUB to MOBI Online — Free Converter, No Sign-up | BookConv`；Item 4 内链（`/blog/epub-vs-mobi`、`/convert/mobi-to-epub`）仍存活。
- **关联**：Item 4 收尾 / Task F 内页外链；GSC 诊断 `数据分析/GSC诊断_epub-to-mobi-guide_2026-08-11.md`
- **复测**：2026-08-24 自动化提醒拉 #67（epub→mobi）GSC 数据，看是否随权威提升 + title 修正进入前 30。

---

## 2026-08-11 — R1 合并：epub-vs-azw3-vs-mobi → ebook-formats-explained
- **文件**：`src/data/blog/epub-vs-azw3-vs-mobi.ts`（归档）、`src/data/blog/ebook-formats-explained.ts`（合并内容）、`src/data/blog/index.ts`、`src/middleware.ts`、`public/llms.txt`
- **类型**：博客近重复页合并（cannibalization 治理）+ 301 重定向
- **改动前**：两页 H1 前 22 字符一致（`EPUB vs AZW3 vs MOBI: Which…`），同抢「epub vs azw3 vs mobi」三向对比词，权重分散互拖
- **改动后**：败者归档至 `src/data/_archived/` 并 301 → 胜者 `ebook-formats-explained`；其唯一高价值内容（At a Glance 紧凑对比表 + Send to Kindle FAQ）并入胜者（EN + ES 同步）；胜者保留为「格式选择」支柱
- **原因**：整簇总览 R1（最高优先级内耗）。胜者更早注册、带西语版、范围更宽，适合做权威页；grep 全仓确认败者无任何入链 → 合并零死链风险
- **Commit**：`f6a8a1d`（已推送 origin/main 并由 Vercel 构建上线）
- **线上核验（2026-08-11）**：败者 `/blog/epub-vs-azw3-vs-mobi` → 301 `location: /blog/ebook-formats-explained`（含 `/es`）；胜者 200 + 含 `At a Glance` 表 + `Send to Kindle` FAQ。R1 内耗已解除。
- **构建**：`next build --webpack` 成功（路由表完整）；tsc 0 错；seo-critic 0 严重/0 警告
- **关联**：整簇治理 `docs/ops/mobi-epub整簇意图分布总览.md` R1；计划 `docs/ops/R1合并方案-epub-vs-azw3-vs-mobi.md`
- **复测**：2026-08-24 自动化提醒拉 `ebook-formats-explained` 的「epub vs azw3 vs mobi」展示/位置，看是否进前 30；败者 URL 应被 GSC 摘出索引
- **铁律**：归档用 `git mv`（非 `git rm`/`rm`），避免触发沙箱 safe-delete 连带删父目录（见 MEMORY §7）

---

## 2026-08-11 — R2 合并：MOBI vs AZW3 三页 → azw3-vs-mobi（一页吃整簇）
- **文件**：败者 `src/data/blog/mobi-or-azw3-for-kindle.ts`、`src/data/guides/mobi-vs-azw3.ts`（归档）；胜者 `src/data/blog/azw3-vs-mobi.ts`（合并内容）；`src/data/blog/index.ts`、`src/data/guides/index.ts`、`src/middleware.ts`、`public/llms.txt`；3 处活页内链改指（`epub-vs-mobi.ts`、`azw3-to-mobi-keep-formatting.ts`、`can-kindle-read-azw3.ts` EN+ES）
- **类型**：博客/指南近重复页合并（cannibalization 治理）+ 301 重定向 ×2
- **改动前**：三页同抢「MOBI vs AZW3 for Kindle」意图，title 仅词序不同，权重分散互拖
- **改动后**：两败者归档至 `src/data/_archived/` 并 301 → 胜者 `azw3-vs-mobi`（blog，更早注册、已是 hub、含 ES）；败者独有资产并入胜者——逐型号决策表（从 3 行粗表扩展为 7 行精确表，EN+ES）、Calibre 桌面「Convert books」工作流 + `/convert/mobi-to-pdf`、`/convert/mobi-to-txt` 深链、FAQ「Does Send to Kindle accept MOBI?」（EN+ES）、史实修正 Mobipocket 收购年 2007→2005（EN+ES）
- **原因**：整簇总览 R2（过饱和，最高优先之一）。胜者内容最丰富、已被另两页内链指向（de-facto hub）、含 ES、注册最早；合并权重无损反集权
- **Commit**：`<待 push>`（本地已提交；用户本机 `git push origin main`）
- **构建**：`next build --webpack` 成功；tsc 0 错；seo-critic 0 严重/0 警告（注册博文 33 篇；CONVERSION_MAP 30 条）
- **关键修复**：执行中发现 `blog/index.ts` 的 `posts` 数组仍引用已删除 import 的 `post21`（undefined），已移除避免 tsc/运行期报错
- **关联**：整簇治理 `docs/ops/mobi-epub整簇意图分布总览.md` R2；计划 `docs/ops/R2合并方案-mobi-vs-azw3.md`
- **复测**：2026-08-24 自动化复测拉 `azw3-vs-mobi` 的「azw3 vs mobi」「mobi vs azw3」「mobi or azw3 for kindle」展示/位置，看是否进前 30；两败者 URL 应被 GSC 摘出索引
- **铁律**：归档用 `git mv`（非 `git rm`/`rm`）
