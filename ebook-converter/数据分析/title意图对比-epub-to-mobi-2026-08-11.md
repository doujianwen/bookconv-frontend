# Title 意图对比清单：epub→mobi 三页 cannibalization 诊断

> 关联：2026-08-11 钱页 title 交易意图强化（commit `c81ee89`，已部署）；GSC 诊断 `数据分析/GSC诊断_epub-to-mobi-guide_2026-08-11.md`；溯源 `docs/ops/SEO改动溯源.md`
> 目的：确认钱页 title 修正后，与指南页/支柱页的「Convert EPUB to MOBI」短语分布是否仍内耗，还是已各归其位。

## 一、三页线上 title（2026-08-11 实测）

| 页面 | 类型 | 线上 `<title>`（已部署） |
|---|---|---|
| `/convert/epub-to-mobi` | 钱页·交易 | `Convert EPUB to MOBI Online — Free Converter, No Sign-up \| BookConv` |
| `/blog/epub-to-mobi-guide` | 指南·信息 | `How to Convert EPUB to MOBI Online: The BookConv Guide \| BookConv` |
| `/blog/epub-vs-mobi` | 支柱·对比 | `EPUB vs MOBI: Which Ebook Format Should You Actually Use? \| BookConv` |

## 二、意图与短语分布矩阵

| 信号 | 钱页 | 指南页 | 支柱页 |
|---|---|---|---|
| 含 "Convert EPUB to MOBI"（精确短语） | ✅ 最前 | ✅（夹在 How to … Online 中） | ❌ 仅 "EPUB vs MOBI" |
| "How to" 信息意图标记 | ❌ | ✅ 最前 | ❌ |
| "Free Converter / No Sign-up" 工具标记 | ✅ | ❌ | ❌ |
| "Guide" 标记 | ❌ | ✅ 末尾 | ❌ |
| 主搜索意图 | 交易（用工具） | 信息（学怎么转） | 信息（选格式） |
| H1 是否含动词 Convert | ✅ `…Convert EPUB Files for Kindle` | ✅ `How to Convert EPUB to MOBI Online…` | ❌ 对比句 |

## 三、Before / After（钱页 title 修正的影响）

- **修正前**：钱页 `EPUB to MOBI Online — Free Converter, No Sign-up` → 缺独立动词 "Convert"，"convert" 只藏在 `Converter` 里。
  → 交易查询 `convert epub to mobi` 被指南页（`How to Convert EPUB to MOBI Online`，含完整精确短语）以 ~50 名吃下，钱页 ~67 名反被压 → **cannibalization 优先级颠倒**。
- **修正后**：钱页补前置动词 "Convert" → 现在钱页与指南页**都含** "Convert EPUB to MOBI" 精确短语，但靠修饰语区分意图：
  - 钱页 = `…— Free Converter, No Sign-up`（工具/去摩擦）
  - 指南页 = `How to … : The BookConv Guide`（教学）
  → 同头词、不同漏斗层，属**健康配对**（how-to 喂钱页），非内耗。

## 四、内链方向（结构健康度）

指南页正文向钱页**多次内链**（已实测存活）：
- `EPUB to MOBI converter` → `/convert/epub-to-mobi`
- `Convert EPUB to MOBI` → `/convert/epub-to-mobi`
- `MOBI to EPUB` → `/convert/mobi-to-epub`

→ 信息页（guide）向交易页（money）传递权重，结构正确：**guide 当入口，money 收转化**。

## 五、结论与遗留风险

✅ **title 层内耗已解除**：钱页现在能精确匹配 #1 交易查询，与指南页靠意图修饰语区分，不再重复。
⚠️ **最终归属仍看权威**：两页同含核心短语，纯查询 `convert epub to mobi`（无 how to / online）归谁，取决于页面权威。钱页当前整体 ~67 名 < 指南 ~50 名，故**指南仍可能压钱页**——需 Task F 内页外链把 `/convert/epub-to-mobi` 权威做上去才能反超。
🔒 **无需再改 title**：钱页已含 `Convert EPUB to MOBI` + `Online` + `Converter`（兼顾 `mobi converter` 查询），与指南差异靠 `How to` vs `Free Converter, No Sign-up` 维持，再改会重新引入内耗。

## 六、验收

- 2026-08-24 自动化提醒拉 #67（epub→mobi）GSC 展示/排名，看权威提升 + title 修正后是否进前 30、交易词是否从指南回流钱页。
- 同步观察 `/blog/epub-to-mobi-guide` 的 `convert epub to mobi` 等交易词展示是否回落（被钱页接管即成功）。
