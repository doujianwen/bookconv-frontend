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
- **Commit**：`<待 push 后补>`
- **关联**：Item 4 收尾 / Task F 内页外链；GSC 诊断 `数据分析/GSC诊断_epub-to-mobi-guide_2026-08-11.md`
- **复测**：2026-08-24 自动化提醒拉 #67（epub→mobi）GSC 数据，看是否随权威提升 + title 修正进入前 30。
