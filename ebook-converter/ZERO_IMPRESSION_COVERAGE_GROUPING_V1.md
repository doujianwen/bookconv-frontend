# Zero-Impression Coverage Grouping V1（ZERO_IMPRESSION_COVERAGE_GROUPING_V1）

> 阶段: Phase 1.2 · 18 个零曝光页分组
> 禁止将 0 impressions 等同于 poor content

## 一、分组依据

基于 URL Inspection API 的真实 Coverage State：

| 分组 | Coverage State | 数量 | 含义 |
|---|---|---|---|
| **Group A** | Submitted and indexed | 3 | 已收录，等待曝光机会 |
| **Group B** | Discovered - currently not indexed | 14 | 已发现未抓取 |
| **Group C** | URL is unknown to Google | 1 | Google 尚未发现 |

---

## 二、Group A：已收录但零曝光（3 页）

| URL | Subgroup | 判断 |
|---|---|---|
| `/convert/azw-to-mobi` | A1 | 已收录，无曝光 → 可能是 niche 格式组合 |
| `/convert/chm-to-mobi` | A1 | 已收录，无曝光 → 可能是 niche 格式组合 |
| `/convert/epub-to-word` | A1 | 已收录，无曝光 → 可能与 epub-to-doc 重叠 |

**Interpretation**:
- ✅ 已收录 = Google 认可页面价值
- ⚠️ 零曝光 = 无搜索量 OR 排名极差
- **禁止假设**: "内容质量问题"

---

## 三、Group B：已发现未抓取（14 页）

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

**Interpretation**:
- ⚠️ **禁止归因为单一因素**
- 可能: crawl prioritization / internal linking / authority / freshness / site-level signals / technical issues / Google scheduling
- **当前数据无法区分**

---

## 四、Group C：URL 未知（1 页）

| URL | Issue |
|---|---|
| `/convert/epub-to-png` | Google 尚未发现 |

**Interpretation**:
- ⚠️ 可能在 sitemap 之外（实测: sitemap 标记 N）
- 需确认: 是否为有效页面 / 是否需要收录

---

## 五、禁止解释

❌ "零曝光 = 内容质量差"
❌ "Discovered-not-indexed = 外链不足"
❌ "已收录但零曝光 = 搜索量低"
❌ "URL unknown = 页面不存在"

✅ "零曝光 = 需要进一步调查"
✅ "Discovered-not-indexed = 根因 UNKNOWN"
✅ "已收录但零曝光 = 排名问题或需求问题"

---

## 六、下一步行动

### 短期（本轮）
- [ ] 记录分组状态
- [ ] 禁止批量修改这 18 页
- [ ] 等待更多数据（如 Manual Action 确认）

### 中期
- [ ] 如果 Manual Action = VERIFIED_NO_ACTION
- [ ] 则考虑对 Group B 做 crawl budget 优化
- [ ] 或对 Group A 做 position 优化实验
