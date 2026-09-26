# 核心关键词 Top5 竞品分析 — Convert 页面对比与落地改进

> 2026-09-25 | 检索词：① "epub to pdf converter online free no registration" ② "convert mobi to azw3 online free kindle format 8"

## 一、Top5 竞品盘点

### 词 1（epub to pdf）：pdfedit / CleverPDF / mediaconvert / toolhq
| 竞品 | 核心卖点 | 内容结构 |
|------|---------|---------|
| **pdfedit.com** | 100% 浏览器本地转换（无上传）| 4 步 HowTo + **vs Calibre 对比表** + 页尺寸选项（Letter/A4/A5/Kindle 600×800）|
| **CleverPDF** | 20MB 限制、30 分钟自动删除 | 简短 FAQ + 安全说明 |
| **mediaconvert.org** | 24h 自动删除、免费 embed widget | FAQ 结构化 + EPUB vs PDF 表 + **"Add this converter to your site"** 外链钩子 |
| **toolhq.app** | 浏览器本地、无上传 | Key Takeaways 摘要块 + mini-story 使用案例 + 打印/归档场景清单 |

### 词 2（mobi to azw3）：mediaconvert / megaconvert / miconv / anyconv
| 竞品 | 核心卖点 | 内容结构 |
|------|---------|---------|
| **mediaconvert.org** | 同上模板（两个词都第 1）| 同上 + 全转换对内链网格 |
| **megaconvert.io** | 25MB 免费 / 2GB 付费、多语言（fr/hr）| "What matters most to you?" 交互选择器 + 格式百科卡（名称/开发商/年份/MIME）|
| **miconv.com** | 75MB、2h 删除 | **at-a-glance 参数块**（⏱平均 20 秒 / 📏75MB / 分类）|
| **anyconv.com** | 100MB、批量 | **Key facts 事实卡**（Full name/Extension/MIME/Developer/Initial release）+ 双向转换网格 |

## 二、与我方页面的逐项对比

**我方已领先**（保持）：内容深度（竞品普遍 4–8 条 FAQ + 短对比表；我方 6–12 FAQ + 8–13 标题节 + Quality Checklist + Troubleshooting，GEO 31/31 PASS）；When/Checklist 节竞品几乎全部缺失；en/es 双语。

**竞品有而我没有的差距**（按 ROI 排序）：

| # | 差距 | 证据 | 落地改进 |
|---|------|------|---------|
| 1 | **Key facts 结构化事实卡** | anyconv/megaconvert 均有 Full name/Extension/MIME/Developer/Release year 卡；AI 引擎摘录事实块的成本远低于段落 | 每个 convert 页 "What is X" 节头部加统一 5 行事实小表（数据可静态写死，无实现成本）|
| 2 | **隐私删除窗口的具体数字** | 竞品全部给出具体值（24h/2h/1h/30min）；我方只说 "private"，**模糊值不会被 AI 引用** | 先核实真实删除策略（代码），再在 FAQ 补一条"上传文件保留多久"——⚠️ 数据不可用即不写，禁止虚构 |
| 3 | **at-a-glance 参数行** | miconv 页首即给平均耗时/上限/平台 | hero 副标题后加一行 "10MB · ~30s · browser-based"（数字须与实现核实）|
| 4 | **免费 embed widget 外链钩子** | mediaconvert 两个词都第 1，embed = 天然外链来源 | 中期规划：提供 iframe 嵌入代码 + 归属链接（工程量 1–2 天，列入 backlog）|
| 5 | **10MB 上限的正面框架** | 竞品 25MB–2GB 但多收费；我方 10MB 免费 + 诚实 | 保留诚实，但把"10MB covers virtually all novels"上移到 hero/meta 第一屏（现在藏在 FAQ）|

## 三、核心洞察（GEO 视角）

mediaconvert 在两个不同转换对都排第 1，其模板 = **短 FAQ + 对比表 + 事实卡 + embed 外链**，内容远不如我方深——但它赢在"**结构化、事实密集、可整块摘录**"。这与本项目 Bing AI 引用机制（AI 引擎偏好可直接摘录的结构化块）完全一致。

**结论**：我方 31/31 PASS 的内容深度是护城河，但要转化为引用份额，需补齐「具体数字 + 事实卡」这两个 AI 引用的最小摘录单元。改进 #1（Key facts 表）是零风险零成本的第一步，建议下一轮内容迭代时批量套用（脚本化注入，沿用本次 patch 脚本模式）。
