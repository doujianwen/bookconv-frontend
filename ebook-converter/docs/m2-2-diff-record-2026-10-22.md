# M2-2 结构同质度达标 · 差异化 diff 记录

> 任务：M2-2（P0，due 2026-10-22，tier CORE）
> 验收：脚本基线由 FAIL 2/4 变为 PASS ≥3/4；Jaccard 仍 <0.5（不引入克隆）
> 判据脚本：`scripts/audit-convert-differentiation.mjs`（唯一判据，勿手改）
> 档期：Batch b1（≤3 页/批，2026-10-22）

---

## 一、判据真值（读脚本确认，不采信文档转述）

`scripts/audit-convert-differentiation.mjs` 的 TARGET 常量：

| 判据项 | 阈值 | 含义 |
|---|---|---|
| `maxSharedSkeletons` | **≤ 3** | 归一化后出现在 **≥8 页**的共用骨架数上限 |
| `minShare` | 8 | 「共用」的页数阈值 |
| `maxTopHeadingPages` | **≤ 8** | 最高频共用章节覆盖页数上限 |
| `maxAvgJaccard` | < 0.1 | 两两 Jaccard 均值 |
| `maxTopJaccard` | < 0.4 | 两两 Jaccard 最高值 |

**归一化规则**：抹掉格式名（19 个 FORMATS），使 `What is EPUB Format?` 与 `What is MOBI Format?` 视为同一骨架 ⇒ **共用骨架的本质是「同一句式模板跨转换对复用」**，不是字面重复。

⚠️ 治理提示：板面 M2-2 的 `detail` 写「通用小节占比降到 <50%（共用同一小节的页面数 <16/31）」，与脚本实际阈值（≤3 骨架 / ≤8 页覆盖）**不一致**。以**脚本为准**（唯一真相 = 实测）。

---

## 二、基线（2026-10-22 实测）

```
FAIL  共用骨架数（出现在 >=8 页）: 7      (目标 <= 3)
FAIL  最高频共用章节覆盖页数: 18          (目标 <= 8)
PASS  两两 Jaccard 平均: 0.002            (目标 < 0.1)
PASS  两两 Jaccard 最高: 0.143            (目标 < 0.4)
FAIL  2/4 项达标
```

7 条共用骨架明细（页数降序）：

| # | 归一化骨架 | 页数 | 需改几页跌破阈值 |
|---|---|---|---|
| 1 | `howtoconvert<>to<>` | **18** | 11 |
| 2 | `<>vs<>formatcomparison` | 16 | 9 |
| 3 | `whatis<>format` | 11 | 4 |
| 4 | `convertinginreverse<>to<>` | 11 | 4 |
| 5 | `howtoconvert<>to<>stepbystep` | 10 | 3 |
| 6 | `beforeyouconvertcheckyour<>` | 10 | 3 |
| 7 | `beforeyouconvertprepareyour<>` | 8 | 1 |

**达标算术**：两项 FAIL 同源——都指向骨架#1。覆盖超标（18 > 8）的唯一根因是骨架#1；要让骨架数从 7 降到 ≤3，需至少 2 条跌破 8 页阈值。**最少改动 = 改骨架#1 的 11 页**（18 → 7），即可让覆盖降到 7（PASS）且骨架数开始下降。

---

## 三、Batch b1（2026-10-22，3 页）

改动原则：按各页**正文真实内容**定制句式（非模板填充），且新句式不与其他页碰撞（不新增共用骨架）。

| 页面 | 原 heading | 新 heading | 定制依据（正文语义） |
|---|---|---|---|
| `epub-to-jpg.ts` | How to Convert EPUB to JPG | **Turning Each EPUB Page into a JPG Image** | 正文讲「Calibre 排版后每页 300 DPI 栅格化，page-001.jpg 编号下载」⇒ 强调「逐页成图」 |
| `epub-to-png.ts` | How to Convert EPUB to PNG | **Rendering EPUB Pages as PNG Images** | 同上（PNG 变体），强调「渲染为图像」 |
| `fb2-to-epub.ts` | How to Convert FB2 to EPUB | **Bringing FB2 Fiction Back into EPUB** | 正文讲「XML 树解析 → XHTML 章节、Dublin Core 映射、base64 图提取」⇒ 强调「回流/救回」语义 |

### 判据变化（逐页实测，非模拟推演）

| 节点 | 共用骨架数 | 覆盖页数 | 达标项 |
|---|---|---|---|
| 基线（b1 前） | 7 | 18 | 2/4 |
| 改 1 页（epub-to-jpg 单页试点） | 7 | **17** | 2/4 |
| **b1 完成（3 页）** | **7** | **16** | **2/4** |

- 单页试点证明判据**敏感且方向正确**（18→17，各 -1），非无效改动。
- 未引入新骨架（骨架数保持 7，未 +1）。
- 文本层 Jaccard 保持低位（avg 0.002 / top 0.143），**未引入克隆**（验收要求 Jaccard <0.5，实测远低于）。

---

## 四、剩余批次规划（达成 PASS ≥3/4）

**主线**：继续压骨架#1（`How to Convert X to Y` 句式），每批 ≤3 页。

| 批次 | 页数 | 目标页（骨架#1 剩余） | 累计覆盖预估 |
|---|---|---|---|
| b1 ✅ | 3 | epub-to-jpg / epub-to-png / fb2-to-epub | 16 |
| b2 | 3 | html-to-epub / rtf-to-epub / doc-to-epub | 13 |
| b3 | 3 | cbr-to-pdf / djvu-to-pdf / chm-to-mobi | 10 |
| b4 | 3 | lit-to-mobi / mobi-to-pdf / mobi-to-txt | **7 ⇒ 覆盖 PASS** |
| b5（按需） | ≤5 | azw-to-mobi / azw3-to-mobi / mobi-to-azw3 / mobi-to-txt 等残留 | 骨架#1 跌破 8 ⇒ 骨架数降 |

判定里程碑：
- **覆盖 ≤8** 在 b4 达成（预估 7）⇒ 判据 2 由 FAIL 转 PASS ⇒ **PASS 3/4**（达成 M2-2 验收线）
- **骨架数 ≤3** 需骨架#1 与骨架#2（各再改 9 页）都跌破阈值，属长线；M2-2 验收只要求 ≥3/4，故 b4 完成即可收口，骨架#2 留作后续优化

---

## 五、门禁记录（b1）

| 门禁 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ 0 error |
| `node scripts/audit-content-integrity.mjs` | ✅ 0 error / 0 warning |
| `node scripts/find-duplicate-headings.mjs` | ✅ 0 重复 |
| `node scripts/audit-convert-differentiation.mjs` | ⚠️ FAIL 2/4（**预期**——尚未达标，b1 只是推进） |

差异化门禁仍 FAIL 属预期状态：b1 是渐进推进，未达 PASS 前门禁必须如实报 FAIL（不得为让它通过而放宽阈值）。