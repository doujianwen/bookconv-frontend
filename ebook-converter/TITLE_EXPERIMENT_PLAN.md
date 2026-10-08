# Title 实验方案（TITLE_EXPERIMENT_PLAN）

> 阶段：**DESIGN ONLY** — 未修改任何 title 字段
> 范围：**不做全站改 title**。仅三类页面进入实验池。

## 〇、进入实验池的判定

| 准入条件 | 页数 | 说明 |
|---|---|---|
| Tier A Convert（imp>20）| 6 | 曝光最大的一批 |
| 已进入 Top20 的 Convert | 1 | `/convert/epub-to-zip` |
| 有曝光但 CTR=0 | 27 | 🔴 全站 91 天点击 **0**，故「有曝光」=「CTR 0」 |
| **实验池（去重后）** | **6** | Tier A 已覆盖 Top20 与有曝光页 |

**排除**：Tier B/C/D 的 25 个 Convert 页、全部 90 个 blog/guide 页（title 问题需先解决 intent 分工，见 INTENT_PARTITION_PLAN_V2）。

## 一、实验池（6 页）

| # | URL | 曝光 | Pos | 桶 | 当前 Title | 字数 |
|---|---|---|---|---|---|---|
| 1 | `/convert/azw3-to-mobi` | 21 | 56.4 | Top51+ | AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015) | 55 |
| 2 | `/convert/epub-to-azw3` | 64 | 53.9 | Top51+ | Free EPUB to AZW3 Converter — No Sign-up | 40 |
| 3 | `/convert/epub-to-doc` | 131 | 51.2 | Top51+ | Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003 | 65 |
| 4 | `/convert/epub-to-txt` | 72 | 62.8 | Top51+ | Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds | 64 |
| 5 | `/convert/epub-to-zip` | 45 | 14.8 | Top20 | Free EPUB to ZIP Converter — Extract XHTML, CSS & Images in Seconds | 67 |
| 6 | `/convert/mobi-to-epub` | 227 | 70.3 | Top51+ | Convert MOBI to EPUB — Free Online Tool | 39 |

## 二、逐页实验设计

### 通用原则

| 原则 | 说明 |
|---|---|
| 保留现有 modifier | 6 页已含 Free / 免注册 / 工具词，**只做加法不减法** |
| Title 50–60 字符 | Google 桌面截断阈值 |
| Description 140–160 | 同时修正（DESIGN_REWRITE_PLAN_V1）|
| 不改 slug / canonical / sitemap | 保证实验变量单一 |
| 一次性全改，不做 A/B | 无多版本框架；用 30 天前后对比 + VI v1.0 口径 |

### 逐页方案

#### `/convert/azw3-to-mobi`
- **Current Title**（55）：AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015)
- **Proposed Title**（57）：AZW3 to MOBI Converter — Free Online for Pre-2015 Kindles
- **Target Query**：azw3 to mobi converter
- **constants.ts 记录的词**：`azw3 to mobi converter` KD=0 vol=2400（⚠️ 该数据未经验证，见 SEARCH_VOLUME_DATA_GAP）
- **Intent**：Transactional / Tool
- **Expected Benefit**：当前 title 缺 "Converter"；需同时锁定「旧 Kindle」场景
- **Risk**：低 — 补工具词 + 保留场景限定词
- **GSC 实际带来曝光的 query**：`azw3 to mobi`（imp 11, pos 49.8）、`azw to mobi`（imp 7, pos 67.6）、`convert azw3 to mobi`（imp 3, pos 54.7）

#### `/convert/epub-to-azw3`
- **Current Title**（40）：Free EPUB to AZW3 Converter — No Sign-up
- **Proposed Title**（56）：EPUB to AZW3 Converter — Free Online, Keeps Kindle Fonts
- **Target Query**：epub to azw3 converter
- **constants.ts 记录的词**：`epub to azw3 converter` KD=0 vol=4400（⚠️ 该数据未经验证，见 SEARCH_VOLUME_DATA_GAP）
- **Intent**：Transactional / Tool
- **Expected Benefit**：🔴 与 /blog/epub-to-azw3（54 曝光 pos 46.1）**直接竞争**，且 blog 页 pos 更好 ⇒ convert 页 title 需强化工具属性以拉开差距
- **Risk**：中 — 若 blog 页 title 不改，分工效果无法验证（见 INTENT_PARTITION 第 4 节）
- **GSC 实际带来曝光的 query**：`epub to azw3`（imp 24, pos 50.0）、`epub to azw`（imp 6, pos 50.7）、`epub a azw3`（imp 4, pos 55.0）

#### `/convert/epub-to-doc`
- **Current Title**（65）：Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003
- **Proposed Title**（60）：EPUB to Word Converter — Free Online DOCX Export, No Sign-up
- **Target Query**：epub to word converter / epub to docx
- **constants.ts 记录的词**：`epub to word converter` KD=1 vol=2900（⚠️ 该数据未经验证，见 SEARCH_VOLUME_DATA_GAP）
- **Intent**：Transactional / Tool
- **Expected Benefit**：曝光 131（第 3）⇒ 目标格式在 title 中不可见（现用 Word，实为 DOCX）
- **Risk**：中 — title 含 "Word" 而非 "DOCX"，改与不改都有依据；需确认用户搜索词实际用哪个
- **GSC 实际带来曝光的 query**：`epub para doc`（imp 90, pos 45.7）、`epub to word`（imp 5, pos 61.0）、`epub to doc`（imp 4, pos 50.0）

#### `/convert/epub-to-txt`
- **Current Title**（64）：Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds
- **Proposed Title**（53）：EPUB to TXT Converter — Free Online, Instant Download
- **Target Query**：epub to text converter / epub to txt
- **constants.ts 记录的词**：`epub to text converter` KD=2 vol=3600（⚠️ 该数据未经验证，见 SEARCH_VOLUME_DATA_GAP）
- **Intent**：Transactional / Tool
- **Expected Benefit**：当前 title 缺 "Converter" 一词（全站仅 2 页缺）
- **Risk**：低 — 补工具词属纯加法
- **GSC 实际带来曝光的 query**：`epub to txt`（imp 20, pos 65.8）、`epub para txt`（imp 15, pos 49.5）、`convert epub to txt`（imp 5, pos 69.4）

#### `/convert/epub-to-zip`
- **Current Title**（67）：Free EPUB to ZIP Converter — Extract XHTML, CSS & Images in Seconds
- **Proposed Title**（53）：EPUB to ZIP Converter — Free Online, Instant Download
- **Target Query**：epub to zip converter / epub to zip
- **constants.ts 记录的词**：`epub to zip` KD=15 vol=400（⚠️ 该数据未经验证，见 SEARCH_VOLUME_DATA_GAP）
- **Intent**：Transactional / Tool
- **Expected Benefit**：🔴 唯一 pos<20（14.8）⇒ 唯一「有展示机会」的页，CTR 变化可直接观测
- **Risk**：低 — 已是 Top20，改 title 可能小幅波动；建议观察 30 天
- **GSC 实际带来曝光的 query**：`epub to zip`（imp 27, pos 12.1）、`epub to zip converter`（imp 10, pos 15.6）、`convert epub to zip`（imp 5, pos 8.2）

#### `/convert/mobi-to-epub`
- **Current Title**（39）：Convert MOBI to EPUB — Free Online Tool
- **Proposed Title**（52）：MOBI to EPUB Converter — Free Online, Keeps Chapters
- **Target Query**：mobi to epub converter / mobi to epub
- **constants.ts 记录的词**：`mobi to epub converter` KD=2 vol=9900（⚠️ 该数据未经验证，见 SEARCH_VOLUME_DATA_GAP）
- **Intent**：Transactional / Tool
- **Expected Benefit**：曝光 227（全站最高）⇒ 基数最大，title 变化的影响最易被观测
- **Risk**：中 — 曝光高说明 Google 已认可当前 title；改动或导致短期波动
- **GSC 实际带来曝光的 query**：`mobi to epub`（imp 67, pos 69.6）、`convert mobi to epub`（imp 26, pos 70.7）、`mobi to epub converter`（imp 13, pos 71.4）

## 三、字符合规自检

| URL | 现 title | 新 title | 50–60 | 现 desc | 新 desc | 140–160 |
|---|---|---|---|---|---|---|
| `/convert/azw3-to-mobi` | 55 | 57 | OK | 146 | 144 | OK |
| `/convert/epub-to-azw3` | 40 | 56 | OK | 145 | 157 | OK |
| `/convert/epub-to-doc` | 65 | 60 | OK | 178 | 142 | OK |
| `/convert/epub-to-txt` | 64 | 53 | OK | 159 | 150 | OK |
| `/convert/epub-to-zip` | 67 | 53 | OK | 170 | 153 | OK |
| `/convert/mobi-to-epub` | 39 | 52 | OK | 149 | 142 | OK |

## 四、验证设计

| 项 | 设计 |
|---|---|
| 观测窗口 | 改动后 30 天（GSC 有 2 天延迟）|
| 口径 | VI v1.0：|VI|<10% 无信号 / 10–20% 弱 / ≥20% 信号成立 |
| 主指标 | Tier A 六页的曝光与加权 position |
| 次指标 | 6 页中 pos<20 的数量（当前 1）|
| 反事实对照 | 未改动的 Tier B（5 页）作为对照组 |

⚠️ **无法做的**：CTR 的 A/B（同页 title 分版本）。Next.js 静态渲染无此能力。
⚠️ **当前全站点击 0** ⇒ CTR 无基线。首轮实验的观测指标只能是 position，不是 CTR。
