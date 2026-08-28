# SERP 审计：azw3 vs mobi & epub to zip（2026-08-11）

> 审计目的：检查 GSC 位置 7-20 关键词的竞争态势，判断点击潜力
> 数据来源：DuckDuckGo 手动搜索（模拟用户视角）

---

## 一、azw3 vs mobi（GSC pos 10.53 / 17 展示）

### 竞争对手分析

| 排名 | 来源 | URL | 内容类型 | 优势 |
|------|------|-----|----------|------|
| 1 | Reddit | r/kindle | 社区讨论 | 高互动（40+评论）|
| 2 | Quora | quora.com | 问答平台 | 多回答覆盖 |
| 3 | PDFMate | pdfmate.com | 工具站 | 技术对比详细 |
| 4 | VnReview | vnreview.vn | 越南博客 | 本地化内容 |
| 5 | WizRead | wizread.io | 博客 | 三格式对比 |
| 6 | MobileRead | mobileread.com | 论坛 | 技术深度 |
| **书 conv** | **bookconv.com** | **/guide/mobi-vs-azw3** | **指南页** | **结构化对比** |
| 8 | Kindle Forum | kboards.com | 论坛 | 老用户背书 |
| 9 | Convertio | convertio.co | 工具站 | 强品牌+转换入口 |

### 竞争态势判断

✅ **机会点：**
- 前三名（Reddit/Quora/PDFMate）都是**信息聚合型**内容，无转换 CTA
- 我们的 `/guide/mobi-vs-azw3` 在 DDG 第 2 位出现（可能 GSC 排序因国家/设备不同）
- **关键缺口**：没有竞品页面同时提供「对比 + 转换工具」双功能

⚠️ **威胁：**
- Convertio（第 9）是成熟转换工具站，有强品牌心智
- Reddit 社区讨论活跃，用户信任度高

### 优化建议

1. **强化标题差异化**：当前标题缺「2026」年份信号，建议加 `2026` 提升时效性
2. **添加 FAQ 段落**：针对「people also ask」类问题（如「MOBI 还能用吗？」）做结构化问答
3. **内链集权已完成**：已从 6 个高排名页链接到 `/convert/mobi-to-epub`

---

## 二、epub to zip（GSC pos 9.70 / 10 展示）

### 竞争对手分析

| 排名 | 来源 | URL | 内容类型 | 优势 |
|------|------|-----|----------|------|
| 1 | ezyZip | ezyzip.com | **工具站** | 实时转换，无上传 |
| 2 | FreeFileConvert | freefileconvert.com | 工具站 | 免费版心智 |
| 3 | Online-Convert | online-convert.com | **老牌工具站** | 强域名权威 |
| 4 | CompressZIP | compresszip.com | 工具站 | 专注压缩 |
| 5 | EPUB.to | epub.to | 工具站 | 专业电子书工具 |
| 6 | Converter.App | converter.app | 工具站 | 新品牌 |
| 7 | FreeConvert | freeconvert.com | 工具站 | 多格式支持 |
| 8 | ZIPConverter | epub.to/zip | 工具站 | 同一域名 |
| 9 | ZipArchives | ziparchives.com | 工具站 | 垂直领域 |
| 10 | MadeInText | madeintext.com | 工具站 | SEO 优化好 |
| **书 conv** | **bookconv.com** | **/convert/epub-to-zip** | **交易页** | **纯转换工具** |

### 竞争态势判断

❌ **高竞争区：**
- 前 10 名**全是工具站**，无信息内容页
- 竞品都有**实际转换功能**（非纯展示）
- 我们的页面是**真实转换工具**，匹配意图 ✅

✅ **机会点：**
- 我们位置 20.2（页面层）/ 9.7（词层）说明**已进可点击区**
- 竞品标题普遍简单粗暴（"Convert X to Y"），我们的标题可以更具体
- 无 featured snippet，可尝试通过结构化内容抢占

### 优化建议

1. **标题强化**：当前标题可能偏通用，建议加入差异化卖点（如「No Upload」「100% Free」「Keep Formatting」）
2. **Meta Description 测试**：检查是否含清晰 CTA（如「Convert EPUB to ZIP in seconds. No signup, no limits.」）
3. **内容深化**：添加「How to extract EPUB」教程段，捕获 informational 流量并自然过渡到转换
4. **FAQ 结构化**：针对「EPUB is a ZIP?」「Can I open EPUB in Windows?」等 PAA 问题做问答

---

## 三、综合结论

| 关键词 | GSC 位置 | 竞争强度 | 点击潜力 | 优先级 |
|--------|----------|----------|----------|--------|
| azw3 vs mobi | 10.53 | 中（信息页混战） | 中高 | **P1** — 内链集权已完成，等 8/12 数据验证 |
| epub to zip | 9.70 / 20.2 | 高（全是工具站） | 高 | **P0** — 最接近点击的词，需优化标题/meta |

### 立即行动（本周）

1. **优化 `/convert/epub-to-zip` 的 title + meta description**
   - 加入差异化卖点
   - 测试 CTA 文案
   
2. **为 `/guide/mobi-vs-azw3` 添加 FAQ 段落**
   - 覆盖 People Also Ask 类问题
   - 发 FAQPage JSON-LD

3. **8/12 拉新 GSC 数据**
   - 验证 R4+内链集权效果
   - 检查 8/9 峰值是否持续

---

## 四、后续跟踪

| 日期 | 动作 | 验证指标 |
|------|------|----------|
| 8/12 | 拉 GSC 新导出 | 对比 8/9 峰值是否持续 |
| 8/13 | 执行标题优化 | 监控 48h 后位置变化 |
| 8/15 | 添加 FAQ 段落 | 检查能否抢 featured snippet |

---

_审计完成时间：2026-08-11 23:30_