# ChatGPT 免费网页通道探测记录（首跑冒烟）

- 日期：2026-11-01 15:30–15:45（北京时间）
- 通道：chatgpt.com 免费网页账号（浏览器登录态，tabbit 实抓）；模型模式：Instant（未联网搜索）
- 独立基线声明：本通道为消费端网页采样，与 API probe（Gemini/Brave）历史序列**分开记分，不混算**（对齐 docs/规划红队审计-2026-11-01.md R05/R07）
- 执行者：WorkBuddy（用户指令：处理 7 项问题清单 P1-3）

## 冒烟测试（管线验证）

| 项 | 结果 |
|---|---|
| 固定 prompt | `epub to mobi converter`（逐字符固定） |
| 回答完整性 | 完整生成，推荐 3 项：Calibre（桌面）、CloudConvert、Convertio；并提示 MOBI 为 legacy 格式 |
| bookconv 出现 | **未检出品牌/域名文本（原字段cited=false，不等于已核验的引用状态）** |
| 管线判据 | prompt 发送 → 回答完成检测 → 全文/链接提取 → 判定，全部通过 |

## 正向对照（判据 true 分支验证）

- prompt：`What is bookconv.com and what does it offer?`
- 结果：ChatGPT 正确描述 BookConv（在线电子书转换平台、EPUB 转换、Kindle 兼容、指南资源），`bookconv` 文本检出 → **品牌提及检测true分支通过**；原cited=true字段不应解释为来源引用
- 结论：本样本仅验证品牌文本检测的两个分支；不足以证明来源引用检测或整个测量管线可靠。

## 已知边界（如实登记）

1. Instant 模式回答基于模型内部知识，**不代表 ChatGPT 联网搜索行为**；两模式应分开记录（联网状态字段必填）。
2. 回答中的推荐链接 href 为 chatgpt.com 内部重定向，直接抓外链为 0——本次只能记录**全文品牌/域名提及**；来源引用必须另行解析并核实引用链接，不能以品牌匹配代替。
3. 会话 DOM 无 `data-message-author-role` 属性（UI 变更），提取以页面全文 `ChatGPT 说：` 分段 + 正则匹配实现；SOP 后续版本需固化此选择器说明。
4. 本次 fixed-prompt 结果 cited=false 与 BWT「epub to mobi 已被引」**不矛盾**：BWT 引用来自 Bing 搜索 grounding，非 ChatGPT 无搜索回答。
5. 侧边栏「最近」存在历史会话「EPUB转MOBI转换器」「EPUB转MOBI工具」（此前探测留下），本次为新建独立会话，无污染。

## 后续

- 是否将 ChatGPT 网页通道纳入 R07 周采样（Bing/豆包 之外扩容）→ 待人工拍板（周采样容量 24 条已定）。
- 下次 R_post 周期可用本通道补齐 ChatGPT 消费端基线（独立 ID，不续接 API 序列）。


## 11/1交付审计更正

本记录是Instant未联网的文本提及冒烟，不是ChatGPT Search引用实验。品牌提问是检测正向对照，不能计入非品牌自然推荐成绩；后续以brandMention和verifiedCitation分开记录。
