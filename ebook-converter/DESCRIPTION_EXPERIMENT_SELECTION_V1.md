
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Description Experiment Selection V1

> Phase 2 · Strategy A · READ ONLY · 选择 3 个实验候选页面

## 一、筛选条件

| 条件 | 说明 |
|---|---|
| Convert page | 必须是 convert 类型页面 |
| 有 impressions | GSC 有真实曝光 |
| description >160 字符 | 当前有明显缺陷 |
| Index status 已知 | 已通过 URL Inspection API 确认 |
| Intent 清晰 | 核心转换意图明确 |
| 非 404/redirect | 页面可正常访问 |

---

## 二、选中 3 个实验页面

| # | URL | Impressions | Position | Desc Len | Intent | Selection Reason |
|---|---|---:|---:|---:|---|---|
| 1 | `/convert/epub-to-doc` | 131 | 51.2 | 178 | EPUB→DOC 核心转换 | 高曝光 + 超长 desc（178 字符）|
| 2 | `/convert/epub-to-zip` | 45 | 14.8 | 170 | EPUB→ZIP 核心转换 | 最佳排名但零点击，desc 过长 |
| 3 | `/convert/lit-to-epub` | 19 | 34.8 | 179 | LIT→EPUB 长尾转换 | desc 超长（179 字符）+ niche 格式 |

---

## 三、排除的页面

| URL | 排除原因 |
|---|---|
| `/convert/mobi-to-epub` | desc 149 字符，合规 |
| `/convert/epub-to-txt` | desc 159 字符，合规 |
| `/convert/epub-to-azw3` | desc 145 字符，合规 |
| 其他 | desc ≤160 或零曝光 |

---

## 四、选择依据

1. **epub-to-doc**: 131 曝光是第二大，desc 超长且卖点在段尾（被截断）
2. **epub-to-zip**: 排名最佳（pos 14.8）但零点击，snippet 可能不吸引
3. **lit-to-epub**: niche 格式，desc 最长（179 字符），优化空间大
