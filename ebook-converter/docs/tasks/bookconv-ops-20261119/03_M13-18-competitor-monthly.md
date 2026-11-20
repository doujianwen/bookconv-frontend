# M13-18｜BookConv 竞品月度深度结论｜2026-11-19补交

## 经营结论
BookConv 当前在本轮监测的 23 个关键词中，11/16 搜索快照的 `ownRank=0` 为 23/23；该字段仅表示**未进入本次实际返回的前 6–9 条自然结果**，绝不等于未进入 Top-100。转换类词的直接竞争主要是 CloudConvert、FreeConvert、Convertio；阅读/打开/设备生态类词则由应用商店、Amazon、EDRLab、Reddit 等占位，不能把它们都当成转换器竞品。

本月结论不是“某一家竞品全面领先”，而是**不同任务意图对应不同竞争集合**。BookConv 应先把现有转换器的真实可用性、上传边界、隐私说明和任务完成率做扎实，不扩建阅读器产品，不打无证据的容量/质量口水战。

## 1. 本月证据范围与可信边界

| 证据 | 观测结果 | 使用边界 |
|---|---|---|
| `data/competitor-series.json` | 2026-11-16生成；13个快照；149条域名×query矩阵 | 作为固定竞品面板的汇总，不把历史 null 当作缺席 |
| 11/16原始SERP快照 `docs/tasks/bookconv-90d-A1A5B4-20261116/raw/competitor-serp-2026-11-16.json` | 23词；29个固定竞品命中；请求100条，实际每词仅返回6–9条；`goto-aware-v2`；BookConv `ownRank=0` 23/23 | 只能说“未进入实际观测前6–9条”；不是Top100结论 |
| 采集元数据 | `gl`、`hl` 未设置；`location` 不足以建立跨地区可比口径 | 只作11/16单日截面；不解释11/4→11/16排名涨跌，不外推全球 |
| 11/4竞品基线 `docs/竞品①-谁在抢同一个答案-2026-11-04.md` | 23词、固定5家；此前动态发现层曾有缺口 | 仅用于方法演进与历史事实，不与11/16直接相减 |
| 11/13同任务卡 `docs/tasks/BookConv-竞品④-EPUB-to-MOBI同任务公开证据卡-2026-11-13.md` | Convertio、FreeConvert公开功能/容量/参数比较 | 官方公开声明，不是同样本实测 |
| 11/13阅读器卡 `docs/tasks/bookconv-growth-20261105/竞品证据卡_EPUB阅读与打开任务_2026-11-13.md` | Silent Book、EPUBReader解决打开/阅读任务 | 官方公开声明；未安装、未抓包、未测性能 |

## 2. 领先 / 落后 / 值得测试 / 明确不做

| 维度 | 本月判断 | 证据与边界 |
|---|---|---|
| 领先者（转换词） | CloudConvert 在 `convert epub to mobi`、`epub to azw3`、`mobi to epub`、`pdf to mobi` 均位列第1；FreeConvert在 `convert epub to mobi`、`epub to azw3` 位列第2；Convertio在多项核心词稳定靠前 | 11/16实际返回前6–9条；不是全网排名 |
| 落后项（BookConv可见度） | 23个监测词的 `ownRank` 全为0，表示本次返回的6–9条中未出现BookConv | 不能写成“未进Top100”；需要继续补足自己的query×page与地区采样 |
| SERP意图结构 | `ebook converter` 的前列包含在线转换器、Google Play、App Store、Calibre；`ebook reader app` 由Google Play/Reddit/ReadEra占位；`open epub file` 由Microsoft Store/EDRLab/Google Play占位；`send to kindle` 由Amazon/Chrome Web Store/Google Play占位 | broad query 混合了工具、应用、教程、社区；不能把所有域名列为直接转换竞品 |
| 值得测试 | 用同一份自有原创 EPUB 对 BookConv、Convertio、FreeConvert 做同任务EPUB→MOBI验收 | 现有11/13证据卡明确：质量、成功率、速度未实测；不先做产品结论 |
| 明确不做 | 不开发独立EPUB Reader；不复制离线阅读、书签、批注功能；不声称BookConv转换质量优于竞品；不把100MB上传上限写成100MB转换成功保证 | 缺少需求/单位经济/同样本证据；避免偏离当前转换器业务主线 |

## 3. 至少四项经营决策（含本站URL与验证指标）

### D1｜DO：守住高意图转换任务，优先提升真实完成率，不打1GB容量战
- 竞品事实：11/16 `convert epub to mobi`：CloudConvert #1、FreeConvert #2、Convertio #3、ebook.online-convert.com #4；BookConv未进入该词实际返回的前9条。`epub to azw3` 也是 CloudConvert #1、FreeConvert #2、Convertio #3。
- 本站承接页：<https://www.bookconv.com/convert/epub-to-mobi>、<https://www.bookconv.com/convert/epub-to-azw3>。
- 决策：保留免注册、无水印、轻量单任务定位；不把“100MB upload”表述成“100MB转换保证”，不为了追平竞品标称1GB而扩大上传链路风险。
- 验证指标：GSC query×page 28天曝光/点击/CTR；GA4 `conversion_attempt → conversion_complete` 完成率；按文件大小（≤4MB、4–50MB、50–100MB）及路由分层；P50/P90转换时长。发布后按实际部署SHA划分前后窗。

### D2｜DO：把“打开/阅读EPUB”与“转换EPUB”分开承接，不造阅读器产品
- 竞品事实：11/16 `ebook reader app` 前列为Google Play、Reddit、ReadEra；`open epub file` 前列为Microsoft Store、EDRLab、Google Play；`send to kindle` 前列为Amazon、Chrome Web Store、Google Play。11/13 Silent Book、EPUBReader证据卡也表明这是本地阅读器/浏览器扩展任务，不是格式转换。
- 本站承接页：<https://www.bookconv.com/blog/best-ebook-reader-apps>、<https://www.bookconv.com/blog/best-free-epub-reader>。
- 决策：保留现有信息型内容，清晰解释 Reader（打开/阅读）与 Converter（格式转换）的任务边界；只在已有页面有真实需求时做简短说明，不新建阅读器功能或重复页面。
- 验证指标：GSC `ebook reader app`、`open epub file`、`send to kindle` query×page曝光/点击；文章到转换页的内部点击率；从该入口进入的 `conversion_attempt` 与完成数。若曝光增长但无后续任务行为，不扩大投入。

### D3｜DO：Calibre意图用现有对比页承接，不把Calibre包装成在线转换器
- 竞品事实：11/16 `calibre online` 前列为 calibre-ebook.com #1、calibre.online #2、Reddit #3；`best ebook converter` 前列包含 howtoconvert.co、Reddit、Calibre。查询明显混合了桌面工具、教程和替代品意图。
- 本站承接页：<https://www.bookconv.com/guide/calibre-alternative>、<https://www.bookconv.com/compare/bookconv-vs-calibre>。
- 决策：维持“Calibre适合桌面/批量/高级控制，BookConv适合免安装的在线单任务”这一诚实区分；不暗示BookConv就是在线版Calibre，也不宣称全格式/质量优势。
- 验证指标：GSC `calibre online`、`calibre alternative`、`can i use calibre online without installing` 的页面曝光/点击/CTR；对比页到转换工具的点击率；后续转换完成数。以28天窗口评估，不按单日排名波动改标题。

### D4｜TEST：做一次同样本EPUB→MOBI对照，验证是否存在可说的质量差异
- 竞品事实：FreeConvert公开页面提供阅读器优化、启发式、页边距、字体、编码和元数据等参数；Convertio与FreeConvert公开标称容量可到1GB。公开参数不等于最终输出质量更好。
- 本站承接页：<https://www.bookconv.com/convert/epub-to-mobi>。
- 决策：列入后续低成本验证，不在本轮上传或购买。使用自有原创样本固定SHA256、大小、章节/图片/CSS/元数据；每个平台至少3次，检查输出能否打开、章节顺序、正文、图片、目录、编码、元数据、总时长中位数。
- 验证指标：成功率、有效输出率、结构保留项通过率、P50/P90时长、免费层实际限制；未完成前禁止“质量更好/更快”的营销主张。

### D5｜DO NOT：不因SERP混合词而新建泛化页面或追加实验链接
- 证据：`ebook converter` 与 `online ebook converter` 的前列混合应用商店、内容站、社区和在线转换工具；`gl/hl` 未设置，且每词只返回6–9条。
- 本站承接页：<https://www.bookconv.com/>、<https://www.bookconv.com/convert/epub-to-pdf>。
- 决策：不把混合意图关键词全部塞进一个新页，不向参考页追加实验链接；按具体任务（转换/阅读/设备兼容/Calibre替代）复用现有页面。
- 验证指标：每个意图簇的GSC query×page分布、目标页CTR、到工具页的有效点击、GA4完成数；若查询主要落到其他意图页，先修正意图匹配而非增加页面数量。

## 4. 红队复核

- 「CloudConvert 11/16仍统治所有转换词」：不成立。它在4个核心转换词占第1，但 `epub to pdf` 前列为PDF Agile等其他域名；不泛化。
- 「BookConv未进Top100」：推翻。实际只返回6–9条，`ownRank=0` 只表示未出现在实际观测集合。
- 「竞品排名较11/4上升/下降」：UNKNOWN。11/16 `gl/hl` 为空，采集地区/语言未锁定；不计算跨日趋势。
- 「FreeConvert参数更多=输出质量更好」：推翻。无同样本E2E结果。
- 「Reader是BookConv必须新增的产品」：推翻。任务意图不同，且没有需求/单位经济证据。
- 「100MB上传=100MB转换成功」：推翻。上传上限、转换路由与成功率是不同指标。

## 5. 顺延与执行边界
- 本轮只交付决策与验证设计；不改生产页面、不部署、不付费、不上传样本、不启动新实验。
- 同样本E2E对照可在后续周评审决定是否安排；需先确认合法原创样本和零成本路径。
- 第三方AI引用来源数据仍不完整，不把SERP排名当作AI引用排名。

**裁定：M13-18 月度竞品深度结论交付完成（5项决策，全部绑定本站URL与验证指标）；跨日排名变化、Top100、实际质量优劣均明确保留UNKNOWN。**