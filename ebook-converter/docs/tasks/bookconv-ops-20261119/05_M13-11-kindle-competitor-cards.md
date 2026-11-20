# M13-11｜竞品③：Kindle转入与设备选择证据卡｜2026-11-19补交

## 结论
Kindle相关搜索分成两个任务：**把个人文件送入Kindle**与**选择Kindle/Kobo设备**。Amazon Send to Kindle 已接受 EPUB 文件，因此“为了Kindle必须先转MOBI”不是普遍成立的用户需求。BookConv 应保留现有“Kindle是否能读EPUB”解释页，讲清原生支持与Amazon云端转入的区别；不新建阅读器功能，也不把MOBI描述成唯一必需格式。

## SERP基线（本地11/16原始快照）
- `send to kindle`：Amazon.com #1、Chrome Web Store #2、Google Play #3；BookConv未进入实际返回的6–9条。
- `kindle vs kobo`：TheDailyFeature #1、Reddit #2、Facebook #3；BookConv未进入实际返回的6–9条。
- `ownRank=0`仅表示未进入实际返回集合，不等于未进Top100；采集`gl/hl`未设置，不作跨地区或跨日排名结论。

## 证据卡 A｜Amazon Send to Kindle 官方帮助
- 来源：Amazon Kindle Support，*Learn About Sending Documents to Your Kindle Library*。
- URL：https://digprjsurvey.amazon.co.uk/csad/help/node/G5WYD9SAF7PGXRNA
- 发布/更新：页面未显示明确发布日期或最后更新时间，标为UNKNOWN；本轮于2026-11-19回读。
- 官方明确：Send to Kindle无需额外费用；支持网页、授权邮箱、iOS/Android应用、桌面应用和Chrome扩展；Web上传上限200MB；支持HTML、RTF、TXT、JPEG、GIF、PNG、BMP、PDF、EPUB；文件传输使用端到端加密。
- 外部提及：11/16 `send to kindle` 搜索快照中Amazon域名排名第1，Chrome扩展与Google Play应用分别第2、第3。
- 任务相关性：高。对“把EPUB送进Kindle”的用户，官方Send to Kindle本身就是替代转换器的路径；不能把MOBI预转换包装成必需步骤。
- 证据边界：官方服务说明，不等于所有设备/地区/账户均无差异；不代表BookConv的转换质量。

## 证据卡 B｜Kindle vs Kobo设备选择（新加坡本地编辑内容）
- 来源：HardwareZone Singapore，Ken Wong，*Kobo or Kindle in 2026: Which e-reader is the better buy?*。
- URL：https://www.hardwarezone.com.sg/guides/kobo-or-kindle-which-best-ereader-you
- 发布：2026-02-18；页面说明最初发表于2026-01-23。Straits Times于2026-03-06转载/改编，作者同为Ken Wong，不能算独立第二次验证。
- 内容依据：比较2025–2026 Kindle/Kobo产品、生态、原生EPUB、侧载、图书馆借阅、彩色E-Ink与新加坡本地购买/订阅可用性；属于编辑评测，不是BookConv格式转换同样本测试。
- 外部提及：11/16 `kindle vs kobo` 快照显示TheDailyFeature和Reddit等域名在前列；TheDailyFeature结果本身为2024文章，过旧，不用于当前硬件结论。Reddit社区在2026年仍有Kindle/Kobo侧载与生态选择讨论。
- 任务相关性：中高。它说明设备选择依赖生态、原生EPUB和图书馆服务，不是单纯格式转换问题。
- 证据边界：新加坡本地市场；不外推其他地区的图书馆/订阅政策；文章无自有实验数据。

## 社区交叉验证（非代表性样本）
- Reddit r/ereader，*Kobo or Kindle*，2026-04-11：https://www.reddit.com/r/ereader/comments/1siof4g/kobo_or_kindle/
- 讨论中有用户认为Kindle的Send to Kindle网页上传更方便，也有用户偏好Kobo原生EPUB、开放格式与侧载自由；意见分歧正好说明“设备选择”取决于个人生态。
- 该帖是自选样本社区讨论，不是统计调查，不据此声称市场份额或普遍偏好。

## 本站决策（链接URL与验证指标）
- 现有解释页：<https://www.bookconv.com/guide/how-to-read-epub-on-kindle>。
- 相关转换页：<https://www.bookconv.com/convert/epub-to-mobi>、<https://www.bookconv.com/convert/epub-to-azw3>。
- 11/17 CEO经营日报记录：`can kindle read epub` 对应指南在Bing有19次曝光，观察到排名6→5→4→3；这不是Google排名，也不代表已产生转化。
- 决策：不新增页面、不扩写重复FAQ；现有指南只需明确三点：Kindle不原生打开EPUB；Send to Kindle可接收EPUB并转入Kindle库；只有特定设备/旧流程/用户需要时才考虑转换为其他格式。
- 验证指标：Bing Webmaster Tools与GSC分别跟踪 `can kindle read epub`、`send to kindle epub`、`epub to mobi` 的query×page曝光、点击、CTR、平均排名；GA4跟踪指南→转换页点击和后续 `conversion_complete`。以28天窗评估，不按单日名次改内容。

## 红队裁定
- 「Kindle必须先转MOBI」：推翻；Amazon官方已支持EPUB经Send to Kindle传送。
- 「Kobo/Kindle设备比较可以证明转换器质量」：推翻；任务与指标不同。
- 「TheDailyFeature 2024文章代表2026设备现状」：推翻；仅保留为SERP域名证据，不作当前规格依据。
- 「Reddit意见代表所有用户」：推翻；仅作需求语言和痛点线索。
- 「BookConv应做Reader产品」：无单位经济与需求证据，不做。

**裁定：M13-11两张竞品证据卡与本站承接决策已完成；无须新增页面或改动生产内容。**