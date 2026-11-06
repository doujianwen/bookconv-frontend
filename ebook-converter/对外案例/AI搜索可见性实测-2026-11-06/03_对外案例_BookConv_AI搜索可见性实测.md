# 📈 案例 02｜bookconv.com · AI 搜索里的工具推荐位实测（对外版）

> **成果速览**：在 ChatGPT、Perplexity、Gemini 三个主流 AI 引擎里，用 7 个真实用户问题提问（**全部不含品牌词**），客户官网 **bookconv.com** 被 ChatGPT 主动列入「免费在线电子书转换器 Top 6」的**第 3 位并附官网链接**，被 Perplexity **两次标注为来源**——不是「品牌名被念到」，而是「**官网成为 AI 答案里可点击的工具入口**」。Gemini 首轮浏览器端因账号联网检索故障未产出，换用 API 补测后 7/7 完整作答但**均未提及 BookConv**——Gemini 是「已确认未推荐区」，而非「未验证区」。

| 关键结果 | 数值 |
|---|---|
| 三引擎实测提问 | **21 次**（7 问 × 3 引擎） |
| 拿到可判定答案 | **21 次**（全量产出） |
| BookConv 被推荐 / 被引用 | **3 次**（ChatGPT 1 · Perplexity 2） |
| 提问中提到品牌词的比例 | **0 / 7** |
| ChatGPT 推荐位 | **第 3 位**（共 6 个工具，含 `Visit BookConv` 链接） |
| Perplexity 来源引用 | **2 次**（格式对比 · 原理判断） |
| Gemini 判定 | **已确认未推荐**（API 补测 7/7 作答，0/7 提及 BookConv；首轮浏览器端故障已闭环） |
| 实测时间 | 2026-11-06 11:08–12:15（北京时间，含 API 补测） |

---

## 实证一｜用户问「哪个免费在线转换器好用」，AI 把官网放进推荐清单第 3 位

**用户提问**：`best free online ebook converter`（提问中没有任何品牌词）

**AI 回答原文**（ChatGPT，思考 24 秒后作答）：

> If you're looking for the best free online ebook converter in 2026, I recommend starting with ConvertKitty, FreeConvert, or **BookConv**, depending on the formats you need.

AI 随后给出 6 个工具的清单，第 3 位是：

> **3. BookConv**
> Best for ebook and document conversion
> Supports 28+ formats. EPUB, MOBI, AZW3, PDF, DOCX, LIT and more.
> Free personal conversions, no registration.
> Powered by the Calibre engine.
> **Visit BookConv**

**关键区别**：AI 不只是排了个名字——它**读过并复述了官网的能力边界**（28+ 格式、免注册、Calibre 引擎），并给出可点击的官网链接。这意味着官网已经进入生成式引擎的「理解 + 推荐 + 导流」链路，而不是单纯的关键词命中。

*证据：会话原文 https://chatgpt.com/c/6aed4594-ce6c-83e9-a796-03a349590862（可回访）；完整答案截图见 `evidence/chatgpt-p2.png`（含 Top 6 清单、Quick Comparison 对照表与最终推荐）；对照表特写见 `evidence/chatgpt-p2-bottom.png`。*

---

## 实证二｜用户问「AZW3 和 MOBI 哪个好」，AI 把官网当作对比结论的出处

**用户提问**：`azw3 vs mobi which is better for kindle`

**结果**：Perplexity 用表格对比 AZW3 / MOBI / EPUB 三种格式，其中两处结论把来源标为 **bookconv**，例如：

> Copying books to a compatible Kindle via USB → **AZW3** → *Preserves more styling and font information than legacy MOBI.*（**来源：bookconv**）

**为什么这条重要**：格式选择是「先选格式、再找工具」的前置决策。AI 在这里引用我们，等于把官网放进了用户决策链的**上游**——先被信任，才有后面的转化。

*证据：`evidence/perplexity-p1.png`；会话 https://www.perplexity.ai/search/4752a9d9-e191-45a6-ba42-114857bee4ef*

---

## 实证三｜用户问「怎么把 EPUB 转成 ZIP」，AI 引用官网的原理解释

**用户提问**：`convert epub to zip file online free`

**AI 回答原文**（Perplexity）：

> You don't actually need a converter: an EPUB is already a ZIP archive. Make a copy of your file, rename book.epub to book.zip, then extract it to access its text, images, and stylesheets.（**来源：bookconv**）

**为什么这条最能说明问题**：用户问的是「用哪个工具」，AI 却先解释了原理，而这条原理的出处是我们的页面。**内容被理解、被复述、被署名**——这是 GEO 里最难拿、也最难被抄走的一层。

*证据：`evidence/perplexity-p4.png`；会话 https://www.perplexity.ai/search/d205f91c-d776-4085-9eb2-bd5593be96a7*

---

## 数据印证：AI 结果不是运气，和真实搜索需求对得上

提问集不是拍脑袋定的，每一问都能指回自有后台的真实搜索量（Google Search Console，2026-08-05 ~ 11-03）。

| 用户意图 | 真实搜索证据（GSC） | AI 侧结果 |
|---|---|---|
| 找工具：我要一个能用的转换器 | `ebook converter` 90 次展示 | ✅ ChatGPT 推荐位第 3 + 官网链接 |
| 选格式：AZW3 还是 MOBI | `azw3 vs mobi` 35 次展示，平均位置 **9.0** | ✅ Perplexity 2 处来源引用 |
| 原理型长尾：EPUB 能不能变 ZIP | `epub to zip` 19 次展示，位置 12.9 | ✅ Perplexity 引用原理解释 |
| 具体操作：LIT 怎么转 EPUB | `lit to epub` 24 次展示 | 未进入答案（明确的提升窗口） |
| 西语区：epub para doc | `epub para doc` **118 次展示（全站单查询第一）** | ✅ 已补采：ChatGPT / Perplexity 均完整作答但**均未提 BookConv**（明确缺口）；Gemini API 补测 2,810 字符完整作答，亦**未提及 BookConv**（13 个联网来源） |

**读法**：被 AI 采用的三个问题，正好是官网内容最具体、最能给出确定结论的三个；没被采用的，要么竞争极强（LIT 有大量老教程），要么我们还没有对应语种的页面。**这不是随机，是内容结构决定的。**

---

## 需求画像：一个真实存在、且以「换格式」为核心的工具型市场

| 维度 | 数据（GSC，91 天） |
|---|---|
| 总查询数 / 总展示 | 386 / 1,644 |
| 格式互换（转换工具型） | 219 查询，**62.3% 展示** |
| 西语区转换需求 | 25 查询，**10.9% 展示** |
| 格式对比 / 选型 | 13 查询，5.0% 展示，平均位置 **9.x**（已贴首页） |
| 品牌词 | 2 查询，71 展示，**17 次点击**（CTR 24%） |

**解读**：这类用户不打开十个标签页做对比——他们手里有一个打不开的文件，直接问 AI「哪个工具能转」。AI 答案里有没有我们，直接决定他会不会走进来。

---

## 下一步：可放大的增量空间

目前已建立的优势：

- ✅ 官网能力描述**可被 AI 准确复述**（格式数、免注册、Calibre 引擎）
- ✅ 在「格式对比」这类前置决策问题上**已被当作可信来源**
- ✅ 有一批页面给出了 AI **无法自己编的具体结论**（EPUB 即 ZIP、AZW3 保留排版）

尚未开发的空间：

- **具体操作类问题（LIT、DRM 相关）尚未进入答案**——这类问题用户意图最急，是最近的一步。
- **西语区几乎空白**：`epub para doc` 是全站第一大查询，但对应语种的页面尚未能进入 ChatGPT / Perplexity 的候选池（本轮两平台均完整作答但均**未提 BookConv**）。
- **Gemini 已确认零提及**：API 补测 7/7 完整作答，0/7 提及 BookConv。Gemini 基于 Google Search grounding，这提示我们需要在 Google 搜索生态中提升 BookConv 的可见性——Google 不推荐，Gemini 就不会引用。
- **设备兼容类问题（Kobo / Kindle 打不开）未纳入**：这是「有文件、很着急」的高转化场景。

> **一句话**：官网已经证明「能被 AI 读懂、能被 AI 推荐、能被 AI 署名」；接下来的工作是把这件事从 3 个入口扩到整站，把偶发浮现变成稳定位置。

---

## 证据边界（客户尽调必读）

| 项 | 状态 | 说明 |
|---|---|---|
| ChatGPT 旗舰证据（p2） | ✅ 已重拍为完整画面 | 原截图卡在流式生成瞬间，已于 12:05 重拍；见 `evidence/chatgpt-p2.png`（全页含 Top 6 清单 + 对照表）与 `evidence/chatgpt-p2-bottom.png`（对照表特写） |
| Gemini 7/7 问（API 补测） | ✅ 已闭环 | 浏览器端账号故障 → API 补测：7/7 联网搜索成功，0/7 提及 BookConv，判定为「已确认未推荐」 |
| 西语提问（p7） | ✅ 已补采 | ChatGPT / Perplexity 均完整作答但**均未提 BookConv**，是真实缺口而非漏采 |
| Perplexity 被引用的具体页面 URL | ⚠️ 仅记录到域名级 | 来源卡片折叠，未能展开定位到具体 bookconv.com 子页面 |
| 设备兼容类意图（Kobo / Kindle 打不开） | ⚠️ 未测 | 属于「有文件、很着急」的高转化场景，建议下一轮补测 |
| 是否稳定排名 | ⚠️ 不能承诺 | AI 输出天然随机，同问题不同时间/账号答案可能不同；本文数字是**单轮实测**，不代表稳定排名 |

---

*说明：本文所有截图均为真实提问的实时输出，提问原文已在各节标注，全部不含品牌词与域名。数据来自 Google Search Console 官方导出，可现场调取。AI 输出为实时生成内容，每次回答可能不同；本文数字是 2026-11-06 单轮实测结果，不代表稳定排名承诺。Perplexity 的来源卡片在页面内折叠，本轮只记录到域名级引用，未能定位到具体被引用的页面 URL。*
