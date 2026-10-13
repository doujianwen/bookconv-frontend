# mobi↔epub 整簇意图分布总览

> 数据来源：从 `src/data/{content,blog,guides}/*.ts` 抽取全部页面 `slug`+`title`（2026-08-11 实测，非估算）。
> 关联：GSC 诊断（2026-08-11，簇过饱和"~15+ 页争同一意图"）、`数据分析/title意图对比-epub-to-mobi-2026-08-11.md`、`docs/ops/SEO改动溯源.md`
> 用途：看清整簇页面各自吃哪个意图、在哪一层漏斗，定位仍存的 cannibalization / 过饱和，指导后续治理与 Task F 外链发力。

## 簇定义
核心主题 = **mobi / epub / azw3 / Kindle 格式**。筛选后共 **29 页**（钱页 9 + 博客 11 + 指南 9）。PDF/DOC/TXT/FB2/LIT/CBR/DJVU 等属其他簇，已排除。

## 一、页面清单（按类型 + 意图）

### A. 钱页 /convert/*（交易意图 · 漏斗底部）
| URL | 线上 title | 主意图 |
|---|---|---|
| `/convert/epub-to-mobi` | Convert EPUB to MOBI Online — Free Converter, No Sign-up | 交易（#67，GSC ~67名） |
| `/convert/mobi-to-epub` | Convert MOBI to EPUB — Free Online Tool | 交易（#69，GSC ~69名） |
| `/convert/epub-to-azw3` | Free EPUB to AZW3 Converter — No Sign-up | 交易 / Kindle |
| `/convert/azw3-to-epub` | Free AZW3 to EPUB Converter — No Sign-up | 交易 |
| `/convert/azw3-to-mobi` | Free AZW3 to MOBI Converter — No Sign-up | 交易 |
| `/convert/azw-to-mobi` | Free AZW to MOBI Converter — No Sign-up | 交易（legacy AZW） |
| `/convert/mobi-to-pdf` | Free MOBI to PDF Converter — No Sign-up | 交易（PDF 邻接） |
| `/convert/mobi-to-txt` | MOBI to TXT Converter | 交易 |
| `/convert/lit-to-mobi` | Free LIT to MOBI Converter — No Sign-up | 交易（legacy LIT） |

### B. 博客 /blog/*（信息意图 · 对比 / how-to）
| URL | 线上 title | 主意图 | 层 |
|---|---|---|---|
| `/blog/epub-vs-mobi` | EPUB vs MOBI: Which Ebook Format Should You Actually Use? | 对比（**支柱页**） | 顶部 |
| `/blog/epub-to-mobi-guide` | How to Convert EPUB to MOBI Online: The BookConv Guide | how-to | 中部 |
| `/blog/mobi-to-epub` | How to Convert MOBI to EPUB (And Why You'd Want To) | how-to | 中部 |
| `/blog/azw3-vs-mobi` | AZW3 vs MOBI: Which Format Should You Use for Kindle? | 对比 | 顶部 |
| `/blog/epub-vs-azw3-vs-mobi` | EPUB vs AZW3 vs MOBI: Which Kindle Format Should You Use in 2026? | 对比（三格式） | 顶部 |
| `/blog/ebook-formats-explained` | EPUB vs AZW3 vs MOBI: Which Ebook Format Should You Use? | 对比（广义） | 顶部 |
| `/blog/mobi-or-azw3-for-kindle` | MOBI or AZW3 for Kindle: Which Should You Send to Your Device? | Kindle 决策 | 中部 |
| `/blog/mobi-to-kobo` | MOBI to Kobo: How to Read Your MOBI Books on a Kobo Reader | 设备场景 | 中部 |
| `/blog/can-kindle-read-azw3` | Can Kindle Read AZW3? Compatibility by Model, Explained | Kindle 兼容 | 中部 |
| `/blog/why-ebook-wont-open-kindle` | 5 Reasons Your Ebook Won't Open on Kindle (and How to Fix Each One) | Kindle 排错 | 中部 |
| `/blog/epub-to-azw3` | Free EPUB to AZW3: Get Your Ebooks Onto Kindle Natively | Kindle | 中部 |

### C. 指南 /guide/*（教学 / 格式化权威 · 漏斗中部）
| URL | 线上 title | 主意图 |
|---|---|---|
| `/guide/mobi-to-epub-keep-formatting` | MOBI to EPUB: Keep Formatting and Read Your Kindle Books Anywhere | 格式化保全权威（**方案A 重定位**） |
| `/guide/epub-to-mobi-keep-formatting` | EPUB to MOBI: Keep Formatting and Read on Any Kindle | 格式化保全 |
| `/guide/mobi-vs-azw3` | MOBI vs AZW3: Which Kindle Format Should You Actually Use? | 对比 |
| `/guide/kindle-formats` | Kindle Formats Explained: AZW3, KFX, MOBI & What to Convert To | Kindle 总览 |
| `/guide/epub-to-azw3-for-kindle` | EPUB to AZW3: Send Your Ebook to Kindle Without Losing Formatting | Kindle |
| `/guide/azw3-to-epub-keep-formatting` | AZW3 to EPUB: Remove Kindle Lock-in and Read Anywhere | 格式化 |
| `/guide/azw3-to-mobi-keep-formatting` | AZW3 to MOBI: Convert for Older Kindles Without Losing Your Book | 格式化 |
| `/guide/best-ebook-converter` | Best Ebook Converter in 2026: How to Choose (Not Just a List) | 选型（簇外但相关） |
| `/guide/calibre-alternative` | Calibre Alternative: Free Online Ebook Converter, No Install | 工具（簇外但相关） |

## 二、意图分布矩阵（同一意图被几页覆盖）

| 意图主题 | 覆盖页面 | 数量 | 健康度 |
|---|---|---|---|
| **epub→mobi 交易** | 钱页 + 指南(how-to) + 指南(keep-formatting) | 3 | ✅ 健康（靠 "Free Converter/How to/Keep Formatting" 修饰语分三层） |
| **mobi→epub 交易** | 钱页 + 博客(how-to) + 指南(keep-formatting·方案A) | 3 | ✅ 健康（方案A 独占"排版保全/排错"，与 how-to 拉开） |
| **epub vs mobi 对比** | 支柱页 epub-vs-mobi | 1 | ✅ 独占（立为支柱） |
| **epub vs azw3 vs mobi 三格式对比** | `epub-vs-azw3-vs-mobi` + `ebook-formats-explained` | **2** | 🔴 **近重复**（title 几乎一致，见 R1） |
| **mobi vs azw3 对比** | `azw3-vs-mobi`(blog) + `mobi-vs-azw3`(guide) + `mobi-or-azw3-for-kindle`(blog) | **3** | 🔴 **过饱和**（见 R2） |
| **Kindle 格式总览/决策** | `kindle-formats` + `mobi-or-azw3-for-kindle` + `can-kindle-read-azw3` + `why-ebook-wont-open-kindle` + `epub-to-azw3`(blog) + `epub-to-azw3-for-kindle`(guide) | **6** | 🟡 偏密（见 R4） |
| **azw3→mobi / azw3→epub 交易** | 钱页 ×2 + 指南(keep-formatting) ×2 | 4 | 🟡 可合并潜力（legacy 需求小） |

## 三、Cannibalization / 过饱和风险点

### 🔴 R1 — 三格式对比近重复（最高优先）
- `/blog/epub-vs-azw3-vs-mobi`：「EPUB vs AZW3 vs MOBI: Which Kindle Format Should You Use in 2026?」
- `/blog/ebook-formats-explained`：「EPUB vs AZW3 vs MOBI: Which Ebook Format Should You Use?」
- **问题**：title 几乎一字不差，同吃 "epub vs azw3 vs mobi" 查询，权重分散，谁都难上首页。
- **建议**：合并或强分。任选其一为权威页（建议 `epub-vs-azw3-vs-mobi` 带 "2026/Kindle" 更具体 → 立为主），`ebook-formats-explained` 退为广义"所有格式导览"并 301 或弱化；或反过来。需先比两页 GSC 展示再定。

### 🔴 R2 — MOBI vs AZW3 三页争
- `/blog/azw3-vs-mobi`、`/guide/mobi-vs-azw3`、`/blog/mobi-or-azw3-for-kindle`
- **问题**：三页意图高度重叠（都是"MOBI 还是 AZW3 给 Kindle"）。blog 两篇标题仅词序不同。
- **建议**：保留 `mobi-or-azw3-for-kindle`（"Send to Your Device" 场景更具体）为决策页；`azw3-vs-mobi`(blog) 与 `mobi-vs-azw3`(guide) 二选一，另一篇改指向前者的内链 + 加独有角度（如 guide 专注"sideload 操作"，blog 专注"型号兼容表"）。

### 🟡 R3 — epub→mobi 钱页 vs 指南（已治理 ✅）
- 钱页 `Convert EPUB to MOBI Online — Free Converter` + 指南 `How to Convert EPUB to MOBI Online: The BookConv Guide`
- **状态**：title 修正后（commit `c81ee89`，已部署）同含精确短语但靠 "Free Converter/No Sign-up" vs "How to/Guide" 区分，结构健康（guide→money 内链）。**无需再改**，最终归属看 Task F 权威。

### 🟡 R4 — Kindle 子簇过饱和（6 页）
- 6 页环绕"Kindle 用哪个格式"，含兼容/排错/决策/工具多角度。
- **建议**：以 `kindle-formats` 为 Kindle 子簇支柱，其余做其卫星（内链集权 + 各补独有角度），避免互抢 "kindle format" 类词。

## 四、内链集权结构（应然 → 实测）

```
                 /blog/epub-vs-mobi  (支柱·对比)
                        ▲  ▲  ▲ 内链
        /blog/mobi-to-epub   /blog/epub-to-mobi-guide   /guide/*-keep-formatting
                        │  │  │
                        ▼  ▼  ▼
        /convert/mobi-to-epub  +  /convert/epub-to-mobi   (钱页·收转化)
                        ▲
        Kindle 子簇 (kindle-formats 等) ──内链──▶ 对应钱页
```
- ✅ 实测 guide/blog 均向钱页内链（如 guide/mobi-to-epub-keep-formatting → /convert/mobi-to-epub；blog/epub-to-mobi-guide → /convert/epub-to-mobi）。
- ✅ 钱页互相指 + 共指支柱 epub-vs-mobi（Item 4 已建）。

## 五、结论与下一步

**已健康（不动）：**
- epub↔mobi 三层配对（钱页 + how-to + keep-formatting），靠意图修饰语区分，无内耗。
- 支柱 epub-vs-mobi 独占 "epub vs mobi" 对比意图。

**待治理（建议排期，属"一页吃整簇"下一轮）：**
- **R1**（三格式对比近重复）与 **R2**（MOBI vs AZW3 三页）是整簇最大内耗，优先于新增页面。
- **R4** Kindle 子簇需立 `kindle-formats` 为支柱并集权。

**外链发力（Task F）：**
- 当前钱页 #67/#69 仍 ~60–80 名，整簇权威不足是根因；R1/R2 治理 + 钱页深链（Task F 手册）双管齐下才见效。
- 验收：2026-08-24 自动化提醒拉 #67/#69 GSC 数据。

> ⚠️ 本文件在 `docs/ops/`（gitignore，本地 Source of Truth），需本地备份。
