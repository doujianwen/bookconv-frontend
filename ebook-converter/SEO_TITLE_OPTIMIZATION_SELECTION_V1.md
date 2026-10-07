# SEO Title Optimization Selection V1

> Phase 2 · Title-First Optimization
> 状态: SELECTION COMPLETE · 2026-10-07
> 数据源: `_wb_tmp/_v2_data.json` (GSC 91天, 2026-07-04→10-02)

---

## 一、选择标准

| 条件 | 要求 |
|------|------|
| 类型 | Convert 页面 |
| GSC 曝光 | > 0 impressions |
| 平均位置 | 10–75（有展示机会） |
| Index 状态 | Submitted and indexed 或 Discovered-not-indexed |
| URL 有效性 | 非 301 / 404 / tag / homepage |
| 意图清晰度 | 搜索意图明确 |
| Title 优化空间 | 当前 Title 有改进潜力 |

---

## 二、选中页面（4 页）

| # | URL | 类型 | Impressions | Clicks | CTR | Position | Index Status | 当前 Title | 主要意图 | 优化理由 | Priority |
|---|---|---|---:|---:|---:|---:|---|---|---|---|---|
| 1 | `/convert/mobi-to-epub` | Convert | 227 | 0 | 0% | 70.3 | Submitted+indexed | Convert MOBI to EPUB — Free Online Tool | MOBI→EPUB 转换 | Title 缺乏品牌，keyword 顺序可优化 | P1 |
| 2 | `/convert/epub-to-doc` | Convert | 131 | 0 | 0% | 51.2 | Submitted+indexed | Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003 | EPUB→DOC 转换 | Title 过长(66 chars)，"Legacy Word 97-2003" 冗余 | P1 |
| 3 | `/convert/epub-to-txt` | Convert | 72 | 0 | 0% | 62.8 | Submitted+indexed | Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds | EPUB→TXT 转换 | Title 过长(63 chars)，"in Seconds" 无法验证 | P1 |
| 4 | `/convert/epub-to-azw3` | Convert | 64 | 0 | 0% | 53.9 | Submitted+indexed | Free EPUB to AZW3 Converter — No Sign-up | EPUB→AZW3 转换 | Title 中等(43 chars)，缺少品牌 | P2 |

---

## 三、Title 优化假设

### H1: Title 优化可能提高 CTR
- **依据**: 当前 Title 或缺少品牌、或过长、或关键词顺序不佳
- **不确定性**: NOT PROVEN — CTR 受 snippet、position、query 意图多重影响
- **观测指标**: GSC impressions、clicks、CTR、position

### H2: Title 优化可能改善排名
- **依据**: Keyword placement 是排名因素之一
- **不确定性**: NOT PROVEN — 排名受内容质量、外链、权威等多因素影响
- **观测指标**: GSC average position（周级变化）

---

## 四、禁止事项

- ❌ 不承诺「一定排名提升」
- ❌ 不承诺「一定 CTR 提升」
- ❌ 不修改 Description（本批）
- ❌ 不修改 body content
- ❌ 不修改 slug / canonical / sitemap
- ❌ 不修改零曝光页面（独立工作流）
- ❌ 不做 A/B 实验框架

---

## 五、预期修改

| URL | 当前 Title (chars) | 提议 Title (chars) | 修改类型 |
|-----|-------------------|-------------------|----------|
| `/convert/mobi-to-epub` | Convert MOBI to EPUB — Free Online Tool (40) | MOBI to EPUB Converter — Preserve Chapters & Images (51) | 品牌 + 卖点前置 |
| `/convert/epub-to-doc` | Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003 (66) | EPUB to DOC Converter — Legacy Word Format (41) | 缩短 + 品牌 |
| `/convert/epub-to-txt` | Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds (63) | EPUB to TXT Converter — Extract Plain Text (41) | 缩短 + 品牌 |
| `/convert/epub-to-azw3` | Free EPUB to AZW3 Converter — No Sign-up (43) | EPUB to AZW3 Converter — Kindle Format (39) | 品牌 + 场景化 |

---

## 六、数据来源

- GSC query×page 数据: `_wb_tmp/gsc-qpage.json`
- 页面元数据: `_wb_tmp/_v2_data.json`
- 源文件: `src/data/content/*.ts`

---

## 七、下一步

1. ✅ 选择完成
2. ⏳ 修改源文件
3. ⏳ 构建验证
4. ⏳ 红队审计
5. ⏳ 提交部署
