# BookConv 数据资产化案例 · 教学演示材料

## 项目定位

本案例展示**如何把一个 SEO/GEO 项目的原始数据，加工成可对外引用、可重复使用、可教学传递的证据库**。

不是"展示成功案例"——而是展示"如何从杂乱数据到可引用证据"的完整方法。

## 适用场景

| 场景 | 使用哪些文件 | 目标读者 |
|---|---|---|
| 客户提案 | `海外接单/TOP_10_PROOF_POINTS.md` | 潜在客户 |
| 团队培训 | `教学演示/` 全套 | 初级分析师 / 学生 |
| 每日分析 SOP 教学 | `case_dual_channel_analysis_2026-09-24.md` | 初级分析师 / 数据分析学员 |
| 方法论沉淀 | `bookconv_data_asset/` + `教学演示/methodology.md` | 同行参考 |
| 服务产品化 | `case_study_template.md` | 内部销售工具 |

## 数据概览（截至 2026-09-08）

| 数据源 | 行数 / 规模 | 时间跨度 | 状态 |
|---|---|---|---|
| GSC 日级序列 | 6,876 行 | 2026-07-23 → 2026-09-04 | ★★ 可用 |
| Bing AI citations | 829 行 | 2026-07-27 → 2026-09-05 | ★★★ 核心 |
| 意图系统 | 14 表 / 267 questions | 2026-08-15 快照 | ★★★ 独特 |
| 页面收录状态 | 525 行 | 2026-09-04 快照 | ★★ 可用 |
| 全量候选证据 | 44 条 | 多时点 | ★★★ 可用 |
| 精选证据（A/B/C 分级） | 10 条 | — | A 级 3 条可直接对外 |

## 目录结构

```
bookconv_data_asset/          # 原始证据库
├── events/growth_evidence.csv     # 44 条全量
├── reports/
│   ├── TOP_10_PROOF_POINTS.md     # 精简版（提案用）
│   └── GROWTH_EVIDENCE_MINING.md  # 策展版（深度用）

海外接单/                        # 对外弹药库
├── TOP_10_PROOF_POINTS.md         # 已复制副本
├── TOP_10_PROOF_POINTS.csv
└── GROWTH_EVIDENCE_MINING.md      # 已复制副本

教学演示/                        # 本目录：培训与教学
├── README.md                      # 本文件
├── evidence_for_training.md       # 带教学注释的全量证据
├── methodology.md                 # 数据资产化方法论
├── case_study_template.md        # 案例写作模板
└── case_dual_channel_analysis_2026-09-24.md  # 双渠道每日分析 SOP 案例（含教学注释）
```

## 教学建议

### 单次培训（1 小时）
1. 看 README（5 分钟）
2. 过一遍 methodology.md（15 分钟）
3. 对照 evidence_for_training.md 解释 3 个关键选择（15 分钟）
4. 让学员用 case_study_template.md 写一条证据（20 分钟）

### 项目实战演练（半天）
用同一套数据，让学员独立完成：
- 证据筛选（从 44 条选出 10 条）
- 分级（A/B/C 判定）
- 撰写 Proposal 段落

### 进阶讨论
- GSC vs Bing 数据质量对比
- 快照对比 vs 日级序列的价值差异
- 「证据」vs「结论」的边界在哪里

---

**原始数据位置**：`bookconv_data_asset/`  
**提案直接用**：`海外接单/TOP_10_PROOF_POINTS.md`  
**教学用**：本目录
