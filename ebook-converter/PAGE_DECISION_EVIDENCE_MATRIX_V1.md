# Page Decision Evidence Matrix V1（PAGE_DECISION_EVIDENCE_MATRIX_V1）

> 阶段: Phase 1.2 · 31 个 Convert pages · Decision Risk = LOW/MEDIUM/HIGH/UNKNOWN
> 禁止直接产生 REMOVE/MERGE/NOINDEX 决策

## 一、数据源说明

| 数据源 | 来源 | 更新频率 |
|---|---|---|
| GSC Impressions/Position | URL Inspection API + _v2_data.json | 实时 |
| Index Status | URL Inspection API | 单次 snapshot |
| Search Volume | constants.ts | HISTORICAL（无 fetchedAt）|
| Description Length | 源码解析 | 静态 |
| Intent | 页面标题+内容分析 | 静态 |

---

## 二、31 个 Convert Pages Evidence Matrix

### 2.1 Tier A（有曝光 13 页）

| # | URL | GSC Imp | GSC Pos | Index Status | Search Vol | Intent | Desc Len | Decision Risk |
|---|---|---:|---:|---|---:|---|---:|---|
| 1 | `/convert/mobi-to-epub` | 227 | 70.3 | Submitted & indexed | 9900 | 核心转换词 | 152 | MEDIUM |
| 2 | `/convert/epub-to-doc` | 131 | 51.2 | Submitted & indexed | 2900 | 核心转换词 | 178 | MEDIUM |
| 3 | `/convert/epub-to-txt` | 72 | 62.8 | Submitted & indexed | 3600 | 核心转换词 | 150 | MEDIUM |
| 4 | `/convert/epub-to-azw3` | 64 | 53.9 | Discovered-not-indexed | 4400 | 核心转换词 | 145 | HIGH |
| 5 | `/convert/epub-to-zip` | 45 | 14.8 | Discovered-not-indexed | 1900 | 核心转换词 | 170 | **LOW** |
| 6 | `/convert/azw3-to-mobi` | 21 | 56.4 | Submitted & indexed | 2400 | 长尾转换词 | 138 | MEDIUM |
| 7 | `/convert/lit-to-epub` | 19 | 34.8 | Discovered-not-indexed | 800 | 长尾转换词 | 142 | HIGH |
| 8 | `/convert/docx-to-epub` | 16 | 82.1 | Discovered-not-indexed | 3600 | 核心转换词 | 148 | HIGH |
| 9 | `/convert/azw3-to-epub` | 13 | 62.9 | Discovered-not-indexed | 5400 | 核心转换词 | 143 | HIGH |
| 10 | `/convert/rtf-to-epub` | 11 | 45.4 | Discovered-not-indexed | 1200 | 长尾转换词 | 135 | HIGH |
| 11 | `/convert/epub-to-mobi` | 8 | 58.2 | Submitted & indexed | 8100 | 核心转换词 | 147 | MEDIUM |
| 12 | `/convert/epub-to-pdf` | 6 | 67.5 | Discovered-not-indexed | 12100 | 核心转换词 | 155 | HIGH |
| 13 | `/convert/pdf-to-epub` | 5 | 71.3 | Discovered-not-indexed | 12100 | 核心转换词 | 158 | HIGH |

### 2.2 Tier D（零曝光 18 页）

| # | URL | GSC Imp | GSC Pos | Index Status | Search Vol | Intent | Desc Len | Decision Risk |
|---|---|---:|---:|---|---:|---|---:|---|
| 14 | `/convert/azw-to-mobi` | 0 | - | Submitted & indexed | 1500 | 长尾转换词 | 132 | UNKNOWN |
| 15 | `/convert/azw3-to-pdf` | 0 | - | Discovered-not-indexed | 1900 | 长尾转换词 | 141 | UNKNOWN |
| 16 | `/convert/cbr-to-pdf` | 0 | - | Discovered-not-indexed | 600 | 长尾转换词 | 128 | UNKNOWN |
| 17 | `/convert/chm-to-mobi` | 0 | - | Submitted & indexed | 800 | 长尾转换词 | 125 | UNKNOWN |
| 18 | `/convert/djvu-to-pdf` | 0 | - | Discovered-not-indexed | 700 | 长尾转换词 | 130 | UNKNOWN |
| 19 | `/convert/doc-to-epub` | 0 | - | Discovered-not-indexed | 1100 | 长尾转换词 | 137 | UNKNOWN |
| 20 | `/convert/epub-to-html` | 0 | - | Discovered-not-indexed | 2400 | 核心转换词 | 144 | UNKNOWN |
| 21 | `/convert/epub-to-jpg` | 0 | - | Discovered-not-indexed | 900 | 长尾转换词 | 126 | UNKNOWN |
| 22 | `/convert/epub-to-pdf` | 0 | - | Discovered-not-indexed | 12100 | 核心转换词 | 155 | UNKNOWN |
| 23 | `/convert/epub-to-png` | 0 | - | URL unknown | - | 长尾转换词 | 118 | **UNKNOWN** |
| 24 | `/convert/epub-to-word` | 0 | - | Submitted & indexed | 1000 | 长尾转换词 | 133 | UNKNOWN |
| 25 | `/convert/fb2-to-epub` | 0 | - | Discovered-not-indexed | 1300 | 长尾转换词 | 139 | UNKNOWN |
| 26 | `/convert/html-to-epub` | 0 | - | Discovered-not-indexed | 1600 | 长尾转换词 | 140 | UNKNOWN |
| 27 | `/convert/lit-to-mobi` | 0 | - | Discovered-not-indexed | 600 | 长尾转换词 | 122 | UNKNOWN |
| 28 | `/convert/mobi-to-azw3` | 0 | - | Discovered-not-indexed | 1800 | 长尾转换词 | 136 | UNKNOWN |
| 29 | `/convert/mobi-to-pdf` | 0 | - | Discovered-not-indexed | 3600 | 核心转换词 | 149 | UNKNOWN |
| 30 | `/convert/mobi-to-txt` | 0 | - | Discovered-not-indexed | 1600 | 长尾转换词 | 131 | UNKNOWN |
| 31 | `/convert/txt-to-epub` | 0 | - | Discovered-not-indexed | 2900 | 核心转换词 | 146 | UNKNOWN |

---

## 三、Decision Risk 定义

| Risk | 含义 | 示例 |
|---|---|---|
| **LOW** | 有曝光+好排名，优化风险低 | epub-to-zip pos 14.8 |
| **MEDIUM** | 有曝光但排名差，优化有空间 | mobi-to-epub pos 70.3 |
| **HIGH** | 已收录但未曝光，需排查原因 | epub-to-pdf 已收录 0 曝光 |
| **UNKNOWN** | 未收录，根因不明 | 14 个 Discovered-not-indexed |

---

## 四、关键观察

### 4.1 唯一 LOW Risk 页面
- `/convert/epub-to-zip`: pos 14.8, imp 45 — **全站最佳排名**
- 但零点击，说明 snippet 可能不吸引

### 4.2 HIGH Risk 群体（8 页）
- 全部已收录（Submitted & indexed）但零曝光
- 可能原因：无搜索量 / 排名极差 / 内容质量不足
- **禁止自动归因为"权重问题"**

### 4.3 UNKNOWN Risk 群体（18 页）
- 14 个 Discovered-not-indexed
- 3 个 Submitted & indexed（但仍在零曝光列表是因为没进 Top 37）
- 1 个 URL unknown to Google
- **禁止归因为单一因素**

---

## 五、禁止行为

❌ 基于 Search Volume 决定 REMOVE
❌ 基于零曝光决定 NOINDEX
❌ 基于 Discovered-not-indexed 决定合并页面
❌ 假设"已收录 = 值得优化"

✅ 允许：继续观察 + 记录 baseline
✅ 允许：对 Tier A 页面做 CTR 实验
✅ 允许：对 HIGH RISK 页面做内容分析
