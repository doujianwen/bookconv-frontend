
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Zero-Impression Recovery Design V1

> Phase 2 · Strategy C · 18 个零曝光页分组设计
> **禁止自动解释为 content problem 或 authority problem**

---

## 一、分组定义

基于 URL Inspection API 的真实 Coverage State：

| 分组 | Coverage State | 数量 | 含义 |
|---|---|---|---|
| **Group A** | Submitted and indexed | 3 | 已收录，等待曝光机会 |
| **Group B** | Discovered - currently not indexed | 14 | 已发现未抓取 |
| **Group C** | URL is unknown to Google | 1 | Google 尚未发现 |

---

## 二、Group A: Indexed + 0 Impressions（3 页）

### 页面列表

| URL | Subgroup | 备注 |
|---|---|---|
| `/convert/azw-to-mobi` | A1 | 已收录，无曝光 → 可能是 niche 格式组合 |
| `/convert/chm-to-mobi` | A1 | 已收录，无曝光 → 可能是 niche 格式组合 |
| `/convert/epub-to-word` | A1 | 已收录，无曝光 → 可能与 epub-to-doc 重叠 |

### Evidence

- GSC: 0 impressions
- URL Inspection: Submitted and indexed
- Sitemap: 全部在 sitemap

### Hypothesis

> H-C-A1: Group A 页面已收录但无搜索量，可能是 niche 格式组合或 query 需求极低。

### Required Data

- [ ] Search Volume 数据（constants.ts HISTORICAL，需验证）
- [ ] GSC query 数据（是否有相关 query 曝光）
- [ ] 竞品页面分析（类似格式组合是否有流量）

### Possible Interventions

1. **观察等待**：如果搜索量极低，可能无需干预
2. **内容扩展**：添加更多使用场景和 FAQ
3. **内链优化**：从相关页面增加指向

### Measurement

- GSC impressions 变化
- Position 变化（如果已有曝光）

### Risk

- 错误归因为内容质量
- 浪费资源在低需求页面上

---

## 三、Group B: Discovered - Currently Not Indexed（14 页）

### 页面列表

| URL | Priority | 备注 |
|---|---|---|
| `/convert/epub-to-pdf` | P1 | 核心词，高搜索量 12100 |
| `/convert/epub-to-html` | P1 | 核心词，搜索量 2400 |
| `/convert/txt-to-epub` | P1 | 核心词，搜索量 2900 |
| `/convert/mobi-to-pdf` | P1 | 核心词，搜索量 3600 |
| `/convert/azw3-to-epub` | P1 | 核心词，搜索量 5400 |
| `/convert/docx-to-epub` | P1 | 核心词，搜索量 3600 |
| `/convert/epub-to-azw3` | P2 | 有曝光但排名差 |
| `/convert/lit-to-epub` | P2 | 有曝光但排名差 |
| `/convert/rtf-to-epub` | P2 | 有曝光但排名差 |
| `/convert/epub-to-jpg` | P3 | 长尾 |
| `/convert/epub-to-png` | P3 | 长尾 |
| `/convert/azw3-to-pdf` | P3 | 长尾 |
| `/convert/djvu-to-pdf` | P3 | 长尾 |
| `/convert/fb2-to-epub` | P3 | 长尾 |

### Evidence

- GSC: 0 impressions（或极少）
- URL Inspection: Discovered - currently not indexed
- Sitemap: 17/18 在 sitemap

### Hypothesis

> H-C-B1: Group B 页面被 Google 发现但未抓取，根因需进一步调查。
>
> **禁止自动解释为**：authority problem / crawl budget problem / content quality problem

### Required Data

- [ ] Manual Action 确认（U_MANUAL_ACTION）
- [ ] Crawl stats（GSC Crawling 报告）
- [ ] Internal linking analysis（内链分布）
- [ ] Page speed metrics（Core Web Vitals）
- [ ] Content quality audit（与其他已收录页面对比）

### Possible Interventions

1. **增加内链**：从相关高权重页面指向
2. **Sitemap 优先级**：确保在 sitemap 中且有合适 lastmod
3. **内容扩展**：添加更多有用内容
4. **技术优化**：检查页面加载速度、结构完整性

### Measurement

- URL Inspection coverageState 变化
- GSC impressions 出现
- Position 出现

### Risk

- 错误归因为外链不足而盲目建链
- 忽视真正的问题（如技术障碍）

---

## 四、Group C: URL Unknown to Google（1 页）

### 页面列表

| URL | Issue |
|---|---|
| `/convert/epub-to-png` | Google 尚未发现 |

### Evidence

- GSC: 无数据
- URL Inspection: URL is unknown to Google
- Sitemap: 不在 sitemap（实测 GSC inSitemap 为空）

### Hypothesis

> H-C-C1: 该页面可能未被 sitemap 包含或存在技术障碍阻止 Google 发现。

### Required Data

- [ ] 线上 sitemap.xml 确认
- [ ] 页面 HTTP 状态
- [ ] robots.txt 检查
- [ ] canonical 检查

### Possible Interventions

1. **检查 sitemap**：确认页面是否在 sitemap 中
2. **手动提交**：通过 GSC URL Inspection 请求编入索引
3. **技术检查**：确认无 robots.txt 屏蔽

### Measurement

- URL Inspection coverageState 变化
- GSC 出现数据

### Risk

- 低优先级页面，投入产出比可能不高

---

## 五、禁止解释

❌ "零曝光 = 内容质量差"
❌ "Discovered-not-indexed = 外链不足"
❌ "已收录但零曝光 = 搜索量低"
❌ "URL unknown = 页面不存在"
❌ "Group B = authority problem"
❌ "Group B = crawl budget problem"

✅ "零曝光 = 需要进一步调查"
✅ "Discovered-not-indexed = 根因 UNKNOWN"
✅ "已收录但零曝光 = 排名问题或需求问题"

---

## 六、下一步行动

### 短期（本轮）
- [ ] 记录分组状态
- [ ] 禁止批量修改这 18 页
- [ ] 等待 Manual Action 确认

### 中期
- [ ] 如果 Manual Action = VERIFIED_NO_ACTION
- [ ] 则对 Group B 做详细技术分析
- [ ] 或对 Group A 做搜索量验证
