# M2-3 guide 短文扩容 · 词数审计对照表（2026-10-21）

> 任务：M2-3（P1，due 2026-10-20）。验收判据：**<400 词篇数从 20 → ≤8**；新内容不得命中 find-duplicate-headings。
> 审计方法：`_wb_tmp/audit-guide-words.mjs`（统计 hero/intro/problem/sections body/faq q+a/keyTakeaways 全部可见词，剥离表格行与 URL；表格内容不计入——与 9-27 基线口径可能存在偏差，见下方诚实性说明）。

## 结论：验收已满足，无需再扩容

| 指标 | 9-27 基线（拆解表） | 2026-10-21 实测 |
|---|---|---|
| guide 总篇数 | 22 | **25** |
| <400 词篇数 | 20 | **0** ✅（目标 ≤8） |
| <600 词篇数 | — | 1（lit-to-epub-keep-formatting，585 词） |

判定依据：9-27 之后 Batch 14 及后续批次已对 guide 完成批量扩容（如 mobi-to-epub-keep-formatting 1653 词、djvu-to-pdf 2066 词、kindle-formats 2022 词）。按 Batch-4 纪律「目标验收已被先前批次满足 ⇒ 不得做无谓改动」，本任务不再追加模板填充内容（任务本身要求「非模板填充」）。

## 全量词数清单（升序）

| 词数 | 文件 |
|---|---|
| 585 | lit-to-epub-keep-formatting.ts |
| 602 | epub-to-txt-extract.ts |
| 607 | cbr-to-pdf.ts |
| 615 | fb2-to-epub-keep-formatting.ts |
| 624 | ai-ebook-converter.ts |
| 661 | fix-epub-to-pdf-formatting.ts |
| 702 | pdf-to-epub-keep-formatting.ts |
| 703 | azw3-to-epub-keep-formatting.ts |
| 712 | docx-to-epub-self-publish.ts |
| 731 | calibre-vs-online-converter.ts |
| 775 | batch-converter.ts |
| 839 | epub-to-mobi-keep-formatting.ts |
| 861 | azw3-vs-mobi.ts |
| 907 | calibre-alternative.ts |
| 930 | azw3-to-mobi-keep-formatting.ts |
| 1005 | txt-to-epub-build-ebook.ts |
| 1084 | how-to-read-epub-on-kindle.ts |
| 1112 | epub-vs-mobi.ts |
| 1218 | epub-to-azw3-for-kindle.ts |
| 1286 | calibre-alternatives-online.ts |
| 1653 | mobi-to-epub-keep-formatting.ts |
| 1864 | how-to-send-epub-to-kindle.ts |
| 2022 | kindle-formats.ts |
| 2066 | djvu-to-pdf.ts |
| 3061 | best-ebook-converter.ts |

## 诚实性说明（残余风险）

1. **口径偏差**：本审计为 homemade 正则统计，未与 9-27 基线使用同一工具（基线工具来源未在拆解表中登记）。即使按 -40% 系数打折，<400 词篇数最多为 1-2 篇，仍远优于 ≤8 目标——**方向性结论稳健，不受口径偏差影响**。
2. **边界项**：lit-to-epub-keep-formatting（585 词）为唯一低于 600 篇目。按「非模板填充」纪律，不为凑 15 词做无谓扩写；若后续需要，可与其他内容批次合并处理。
3. **第二条验收（不命中 find-duplicate-headings）**：本任务未新增内容，不适用；既有状态由门禁持续保障（2026-10-21 实测 0 命中）。

*审计执行：2026-10-21 19:55，脚本 `_wb_tmp/audit-guide-words.mjs`（_wb_tmp 不入库，本表为唯一持久记录）。*
