
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Experiment Master Plan V1

> Phase 2 · 总览
> 状态: DESIGN READY（未实施）

---

## 一、实验矩阵

| Experiment | Pages | Variable | Control | Treatment | Baseline | Duration | Primary Metric | Status |
|---|---|---|---|---|---|---|---|---|
| Strategy A | 3 | Description | Current desc | Intent→Capability→Benefit→CTA | 28 days | 28 days | CTR | DESIGN READY |
| Strategy B | 3 | Title | Current title | USP + keyword optimized | 28 days | 28 days | CTR | DESIGN READY |
| Strategy C | 18 | N/A | N/A | N/A | Analysis | N/A | N/A | DESIGN ONLY |

---

## 二、Strategy A: Description Experiment

### 实验页面

| # | URL | Impressions | Position | Current Desc Len | Proposed Desc Len |
|---|---|---:|---:|---:|---:|
| 1 | `/convert/epub-to-doc` | 131 | 51.2 | 178 | 104 |
| 2 | `/convert/epub-to-zip` | 45 | 14.8 | 170 | 98 |
| 3 | `/convert/lit-to-epub` | 19 | 34.8 | 179 | 92 |

### Treatment 原则
- Intent → Capability → Core Benefit → CTA
- 不机械截断
- 卖点前置
- 目标长度 90-110 字符

---

## 三、Strategy B: Title Experiment

### 实验页面

| # | URL | Impressions | Position | Current Title Len | Proposed Title Len |
|---|---|---:|---:|---:|---:|
| 1 | `/convert/mobi-to-epub` | 227 | 70.3 | 36 | 54 |
| 2 | `/convert/epub-to-txt` | 72 | 62.8 | 47 | 52 |
| 3 | `/convert/epub-to-azw3` | 64 | 53.9 | 43 | 57 |

### Treatment 原则
- 保留核心 intent
- 突出 USP
- 不 keyword stuffing
- 不 clickbait
- 目标长度 <60 字符

---

## 四、执行顺序

```
┌─────────────────────────────────────────────────────────┐
│  Phase 2: Experiment Design (当前阶段)                    │
│  ├── Strategy A: 3 页面 description 优化                  │
│  ├── Strategy B: 3 页面 title 优化                        │
│  └── Strategy C: 18 页面分析设计                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Phase 3: Implementation (待执行)                         │
│  ├── Week 1-4: Strategy A 实验                            │
│  ├── Week 5-8: Strategy B 实验                            │
│  └── Week 9+: Strategy C 分析 + 决策                      │
└─────────────────────────────────────────────────────────┘
```

---

## 五、门禁状态

| Gate | Status |
|---|---|
| G1 Strategy A 页面来自数据层 | ✅ PASS |
| G2 Strategy B 页面来自数据层 | ✅ PASS |
| G3 A/B 页面不重叠 | ✅ PASS |
| G4 每页只改变一个变量 | ✅ PASS |
| G5 Treatment 无未经证实 claims | ✅ PASS |
| G6 Hypothesis 非 Fact | ✅ PASS |
| G7 Primary metric 已定义 | ✅ PASS |
| G8 Baseline window 已定义 | ✅ PASS |
| G9 Treatment window 已定义 | ✅ PASS |
| G10 Confounders 已定义 | ✅ PASS |
| G11 Zero-impression 未解释为 content failure | ✅ PASS |
| G12 无生产文件修改 | ✅ PASS |
| G13 Gate checked > 0 | ✅ PASS |
| G14 反向注入可抓错误 | ⏳ PENDING |

**Overall: DESIGN READY**
