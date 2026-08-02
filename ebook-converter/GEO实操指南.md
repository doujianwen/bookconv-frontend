# GEO 实操指南（Generative Engine Optimization）
> 基于 bookconv.com 于 2026-08-02 的实战沉淀，形成一套可复用于任意网站的 SOP。
> 适用对象：接手内容 / SEO / GEO 的新人，以及未来要操作的其他站点。

---

## 0. GEO 是什么，为什么做

**GEO = 让你的内容被 AI 引擎（ChatGPT / Gemini / Perplexity / Claude）发现、引用、复述。**

它与传统 SEO 的区别：

| 维度 | SEO | GEO |
|------|-----|-----|
| 目标 | 争搜索结果里的**排名位置** | 争 AI 摘要里**被引用的片段质量** |
| 抓手 | 外链、TDK、结构 | 机器可读的结构化数据 + 可引用内容 |
| 度量 | 排名、点击 | 被 AI 引用频次、品牌出现在答案里 |

对工具站 / 内容站而言，AI 摘要正在吃掉长尾词的点击，GEO 既是防御（别被忽略）也是增量（进 AI 答案 = 新流量入口）。

---

## 1. 今日实战清单（已落地 = 证据）

bookconv.com 本次 GEO 动作（均已部署 Vercel，线上验证通过）：

- ✅ `public/llms.txt` 全量覆盖：26 个转换页 + 13 篇博客 + 支持格式清单 + 隐私/信任段
- ✅ 实体结构化数据：`Organization.areaServed=Worldwide`、`availableLanguage=[en,es]`；`WebSite.inLanguage=[en,es]`
- ✅ `robots.txt` 放行 `GPTBot` / `ClaudeBot` / `CCBot` / `Google-Extended`
- ✅ 博客 FAQ 结构化：散文 "Q:/A:" 段 → 顶层 `faqs` 字段 → 发射 `FAQPage` JSON-LD
- ✅ 每篇博客含 **Key Takeaways**（要点块）+ **FAQ**（PAA 句式）

---

## 2. 可复用 SOP（按 ROI 排序）

### 2.1 `llms.txt` —— 最快、最稳的第一步

AI 引擎优先读取站点根目录的 `llms.txt`。位置：`public/llms.txt`（构建后落到站点根）。

推荐结构：

```
# 站点名
> 一句话定位（含核心差异点）

## 核心功能 / 转换
- [EPUB to AZW3](https://www.bookconv.com/convert/epub-to-azw3)
- [AZW3 to EPUB](https://www.bookconv.com/convert/azw3-to-epub)

## 指南 / 博客
- [Ebook Formats Explained](https://www.bookconv.com/blog/ebook-formats-explained)

## 关于
实体信息（站点归属、服务范围）+ 隐私/信任说明（无注册、文件 1 小时删除等）
```

要点：
- **全覆盖**：每一个可被索引的页面都要列进去，不要只列首页。
- URL 用**绝对地址**，描述带差异点（"free, no registration"）。
- 把"关于/隐私/信任"写进去——AI 引用时更敢标注你为可信来源。

### 2.2 `robots.txt` 放行 AI 爬虫

确认以下 UA **未被 Disallow**，否则内容再好也进不了训练 / 摘要：

```
GPTBot
ClaudeBot
CCBot
Google-Extended
Applebot-Extended
```

验证：`curl https://站点/robots.txt | grep -i gptbot` 看是否出现在 Allow 区。

### 2.3 实体结构化数据（layout 的 JSON-LD `@graph`）

在全局 layout 的 `Organization` 与 `WebSite` 节点补实体信号：

- `Organization`：`areaServed`（服务区域，如 `Worldwide`）、`availableLanguage`（支持语言，如 `[en, es]`）
- `WebSite`：`inLanguage`（同上）

⚠️ **不要编 `sameAs` 社媒链接**。没有真实社媒就留空数组 `[]`，伪造反而伤信任。

### 2.4 博客 FAQ 结构化 → `FAQPage` JSON-LD（最关键一步）

这是今天最有价值的一步，也是最容易做错的一步：

- 内容层**必须有结构化 FAQ 字段**（如 `faqs: BlogFaq[]`），而**不是**只把 FAQ 写成散文 "Q:/A:" 段落。
- 只有结构化字段才能发射 `FAQPage` JSON-LD；AI 抽取问答时，结构化数据远比散文可靠。
- 渲染 FAQ **只从一个来源取**（结构化字段），避免页面重复渲染两遍。
- 塞进 JSON-LD 的答案要用**纯文本**（`stripMarkdown`），别把 Markdown 符号喂给搜索引擎。

### 2.5 Key Takeaways + 可引用句

- 每篇文章顶部或尾部放 **3–6 条要点**，每条带具体数字 / 百分比 / 排名，且可独立成立。
- 正文刻意写"可引用句"：**具体数字 + 命名来源 + 年份**，例如
  "Third-party testing found whey isolate bioavailability of 90–95%”（不要写"大多数用户"这种虚话）。

---

## 3. 踩坑记录（重点：别再犯）

1. **FAQ 散文 ≠ 结构化**：只把 FAQ 写成散文 "Q:/A:" 段落，不会发射 `FAQPage` JSON-LD，AI 抽取不可靠。必须抽成 `faqs` 字段。
2. **重复渲染**：从散文段抽 FAQ 后，**务必从 `content.sections` 删除原散文段**，否则页面渲染两遍 FAQ（既丑又可能被判重复内容）。
3. **CRLF 坑（Windows 重灾区）**：本地文件是 `\r\n`。用脚本批量处理博客文件时，换行要写成 `\r?\n`，否则正则匹配不到。
4. **贪婪 vs 非贪婪**：抽取"最后一个 section"要用贪婪 `[\s\S]*`；用非贪婪 `[\s\S]*?` 会在第一个反引号处被截断。
5. **TS 对象字面量尾逗号**：脚本插入 `export const faqs = [...]` 时，上一个 section 可能**没有尾逗号**——用可选逗号 `,?` 匹配。
6. **wordCount 正则错**：`split("\s")` 是非法转义（按字母 s 计数）→ 用 `split(/\s/)`。
7. **extractSourceTarget 正则错**：`(w+)s+` 永远匹配不到 → `(\w+)\s+`。
8. **别编社媒 `sameAs`**：没有就留空，伪造伤信任。
9. **内链别带 `-en` 后缀**：从旧帖复制内链易带 `-en`，线上真实 slug 没有 → 404 断链。

---

## 4. 验证方法（部署后必做）

- 确认 `FAQPage` JSON-LD 已出现：`curl -s 页面URL | grep -o 'FAQPage'`
- 确认 `llms.txt` 含目标页：`curl -s 站点/llms.txt | grep 目标slug`
- 用 [schema.org 校验器](https://validator.schema.org) 验证 FAQPage 无错
- **等 Vercel 部署约 45 秒再验**，刚 push 就 curl 会拿到旧版本
- 用 Rich Results 测试工具确认 FAQ 富媒体可解析

---

## 5. 复用到其他网站的检查清单

```
[ ] llms.txt 全覆盖（每个可索引页都列，绝对 URL）
[ ] robots.txt 放行 GPTBot / ClaudeBot / CCBot / Google-Extended
[ ] Organization.areaServed + availableLanguage；WebSite.inLanguage
[ ] 博客有结构化 faqs 字段 + 发射 FAQPage JSON-LD
[ ] 每篇含 Key Takeaways + 可引用句（数字+来源+年份）
[ ] FAQ 只从一个来源渲染（无重复渲染）
[ ] 批量脚本处理时考虑 CRLF、贪婪匹配、尾逗号
[ ] 内链用真实 slug，无 -en 后缀，无 404
[ ] 不伪造 sameAs 社媒链接
[ ] 部署后按第 4 节验证
```

---

*本指南由 2026-08-02 bookconv.com 的 GEO 实战总结。新增站点时先跑第 5 节清单，再回看第 3 节避坑。*
