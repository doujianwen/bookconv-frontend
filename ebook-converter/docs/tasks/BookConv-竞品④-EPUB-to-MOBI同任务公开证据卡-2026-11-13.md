# BookConv 竞品④｜EPUB → MOBI 同任务公开证据卡

- 日期：2026-11-13（Asia/Shanghai）
- 对应任务：M13-13（11/13 周五·竞品④）
- 范围：EPUB → MOBI；BookConv 与 Convertio、FreeConvert 的公开产品流程/限制/差异
- 方法：官方页面与官方帮助/价格页核验；不上传用户文件、不购买服务、不做批量测试
- 裁定：**PARTIAL / PASS WITH RESIDUALS**。公开能力差异已核验；真实同样本转换质量、速度、成功率未实测，不能宣称优劣。

## 1. 事实底座与测试边界

BookConv 本地现行事实源（Product Facts v2，2026-11-13）规定：
- 单文件直传可用时上传上限 100 MB；这是上传上限，不是转换成功保证。
- multipart fallback 与 batch 每文件 4 MB。
- Calibre backend 默认入口上限 50 MB；更大文件可能走第三方路径。
- EPUB → MOBI 路由在 conversion map 中标记 Calibre。
- 50–100 MB 真实端到端成功率、各格式输出质量与 P50/P90 时延均未完成分层实测。
- 不承诺转换完成后所有副本即时删除；不得写“1小时自动删除”。
- Pro 在 Pricing 页面列价 $5/month，但真实 checkout 与 webhook 未验收。

**关键防误读**：BookConv “100 MB upload”不等于“100 MB EPUB→MOBI 一定成功”；本卡只对比可公开核验的流程和产品限制，不以配置值替代 E2E 结果。

## 2. 同任务证据卡 A｜Convertio

- 任务：EPUB → MOBI
- 官方转换页：https://convertio.co/epub-mobi/
- 官方免费层限制说明：https://support.convertio.co/hc/en-us/articles/360004386774-Free-tier-limit-for-file-conversions
- 可核验事实：
  1. 有独立 EPUB→MOBI 页面，支持本地文件及云端来源入口。
  2. 页面公开描述云端服务器处理、批量处理与转换后下载流程。
  3. 官方帮助中心列明免费层单文件最高 1 GB、每日 10 个转换额度、最多 10 个并发任务。
  4. 页面说明复杂 CSS 样式可能简化；未提供本卡可验证的同样本输出。
- 差异：公开免费层的单文件标称容量显著高于 BookConv 的 100 MB 直传配置上限；但额度、并发、实际格式处理和成功率不能仅凭标称值横向等同。
- 未测：真实文件转换成功率、质量、时延；账号登录对该用户实际可用性的影响。

## 3. 同任务证据卡 B｜FreeConvert

- 任务：EPUB → MOBI
- 官方转换页：https://www.freeconvert.com/epub-to-mobi
- 可核验事实：
  1. 有独立 EPUB→MOBI 页面。
  2. 页面标示最大文件大小 1 GB，并提供可选高级设置：阅读器优化、启发式处理、页边距、字体缩放、编码与元数据调整。
  3. 支持本地、Dropbox、Google Drive、OneDrive 与 URL 等输入来源。
  4. 页面说明免费转换、批量转换；页面所述文件自动删除时间为 8 小时。
  5. 页面提示用户需确认上传文件拥有相应权利。
- 差异：FreeConvert 在公开页面提供更细的转换参数控制；BookConv 当前重点是免注册、无水印和轻量流程，不应在未做同样本测试前声称输出质量更好。
- 未测：实际免费额度/并发在当前账户下的限制、真实输出质量、速度、不同 EPUB 结构的成功率。

## 4. 同维度对照

| 维度 | BookConv | Convertio | FreeConvert |
|---|---|---|---|
| 独立 EPUB→MOBI 入口 | 有 | 有 | 有 |
| 公开单文件容量 | 直传可用时上传 100 MB；转换成功不保证 | 免费层最高 1 GB | 页面标示最高 1 GB |
| Batch | 每文件 4 MB；当前 public beta 免费 | 支持批量；免费层并发最多 10 | 支持批量 |
| 免费层额度 | 个人使用免费；batch beta 期间免费 | 10 次/24h | 页面未给出统一免费次数 |
| 高级转换参数 | 当前公开页面未见同等参数组 | 页面可选项有限/需进一步核实 | 阅读器优化、启发式、页边距、字体、编码、标题作者等 |
| 隐私/删除口径 | 不保证所有副本即时删除；以 Privacy Policy 为准 | 官方页面与帮助中心需进一步核对具体保留政策 | 页面声称自动删除 8 小时 |
| 同样本输出质量 | 未测 | 未测 | 未测 |
| 同样本转换速度 | 未测 | 未测 | 未测 |

## 5. 对 BookConv 的经营判断

1. **不打容量口水战**：竞品公开标称容量为 1 GB，BookConv 100 MB 仍有差距；而且 BookConv 50 MB backend 入口与 50–100 MB 回退链路未完成 E2E，不能把 100 MB 直接写成可转换容量。
2. **不打“质量更好”口号**：FreeConvert 提供更丰富的公开高级参数；BookConv 需要以同一合法样本、同一输出格式、同一验收清单实测后再决定是否建立质量差异化。
3. **可保留的产品差异**：BookConv 的免注册、无水印、轻量单任务流程值得保留，但需用实际用户任务验证其价值，不能用自述代替转化数据。
4. **优先补产品可信度**：上传能力、转换能力、引擎归属、隐私保留口径必须一致。当前生产页仍可见旧的“所有转换均通过 Calibre”表述，与本地 Product Facts v2 不一致；在生产发布修复前，不能将本地门禁通过说成线上口径已修复。

## 6. 后续验证设计（不在本轮执行）

使用同一份自有/原创 EPUB 样本，固定输入 SHA256、文件大小、章节数、图片数、CSS复杂度与元数据；在三个工具上分别执行 EPUB→MOBI。记录：
- 是否无需注册即可开始；
- 上传限制与实际路由；
- 从选择文件到可下载输出的总时长（至少重复 3 次，记录中位数，不混合网络环境）；
- 输出是否可打开；
- 章节顺序、正文文本、图片、目录、编码、元数据的保留情况；
- 是否产生水印、广告、付费墙或隐性限制；
- 每个平台的隐私/删除说明及实际可观察证据。

没有完成该矩阵前，不形成“BookConv 转换质量优于竞品”的结论。

## 7. 红队回执

- 断言 A：Convertio 与 FreeConvert 在公开页面支持 EPUB→MOBI。攻击：确认来源为官方页面而非第三方目录。裁定：通过。
- 断言 B：两竞品公开容量高于 BookConv。攻击：区分产品标称上传上限与转换成功保证。裁定：修正为“公开标称上传容量更高”，不比较成功率。
- 断言 C：FreeConvert 参数能力更丰富。攻击：只比较页面列出的可配置项，不推断最终质量。裁定：通过（仅功能表面层）。
- 断言 D：BookConv 有质量优势。攻击：没有同样本 E2E 证据。裁定：推翻，不作此结论。
- 残余：同样本 E2E、竞品真实免费额度、BookConv 50–100 MB 成功率、隐私条款逐条对齐未完成。

红队：L2 · 裁定 修正(#B)·推翻(#D)·通过(#A,#C) · 回执 本文件 §7。未上传文件、未付费、未对外联系或发布。

## 8. 来源

- Convertio EPUB→MOBI 官方页：https://convertio.co/epub-mobi/
- Convertio Free-tier 官方帮助：https://support.convertio.co/hc/en-us/articles/360004386774-Free-tier-limit-for-file-conversions
- FreeConvert EPUB→MOBI 官方页：https://www.freeconvert.com/epub-to-mobi
- BookConv 事实源：docs/BookConv-Product-Facts-v2-2026-11-13.md
- BookConv 转换路由：src/lib/conversion-map.ts（epub-mobi）
