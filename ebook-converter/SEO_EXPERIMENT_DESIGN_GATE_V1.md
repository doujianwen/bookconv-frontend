
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Experiment Design Gate V1

> Phase 2 · Gates G1-G14

## G1: Strategy A 页面来自数据层

| # | Assertion | Status |
|---|---|---|
| G1.1 | 3 个页面都有 impressions > 0 | PASS |
| G1.2 | 3 个页面 descLen > 160 | PASS |
| G1.3 | 页面在 source data 中可查 | PASS |

**Checked: 3/3**

## G2: Strategy B 页面来自数据层

| # | Assertion | Status |
|---|---|---|
| G2.1 | 3 个页面都是 Tier A | PASS |
| G2.2 | 3 个页面都有 impressions | PASS |
| G2.3 | 页面在 source data 中可查 | PASS |

**Checked: 3/3**

## G3: A/B 页面没有重叠

| # | Assertion | Status |
|---|---|---|
| G3.1 | Strategy A 页面集合 | [/convert/epub-to-doc, /convert/epub-to-zip, /convert/lit-to-epub] |
| G3.2 | Strategy B 页面集合 | [/convert/mobi-to-epub, /convert/epub-to-txt, /convert/epub-to-azw3] |
| G3.3 | 交集为空 | PASS |

**Checked: 3/3**

## G4: 每个页面只改变一个主要变量

| # | Assertion | Status |
|---|---|---|
| G4.1 | Strategy A 仅改 description | PASS |
| G4.2 | Strategy B 仅改 title | PASS |
| G4.3 | 无页面同时出现在 A 和 B | PASS |

**Checked: 3/3**

## G5: Treatment 没有未经证实的 claims

| # | Assertion | Status |
|---|---|---|
| G5.1 | 无 "will increase CTR" 表述 | PASS |
| G5.2 | 使用 "may/could/hypothesis" | PASS |
| G5.3 | 无虚构功能描述 | PASS |

**Checked: 3/3**

## G6: 没有把 hypothesis 写成 fact

| # | Assertion | Status |
|---|---|---|
| G6.1 | 所有假设标记为 hypothesis | PASS |
| G6.2 | 无确定性断言 | PASS |
| G6.3 | Red Team 已攻击主要假设 | PASS |

**Checked: 3/3**

## G7: Primary metric 已定义

| # | Assertion | Status |
|---|---|---|
| G7.1 | Strategy A primary = CTR | PASS |
| G7.2 | Strategy B primary = CTR | PASS |
| G7.3 | Secondary metrics defined | PASS |

**Checked: 3/3**

## G8: Baseline window 已定义

| # | Assertion | Status |
|---|---|---|
| G8.1 | Baseline = 过去 28 天 | PASS |
| G8.2 | 最低 impressions 要求 = 10 | PASS |

**Checked: 2/2**

## G9: Treatment window 已定义

| # | Assertion | Status |
|---|---|---|
| G9.1 | Treatment = 至少 28 天 | PASS |
| G9.2 | Checkpoints = Day 7/14/28 | PASS |

**Checked: 2/2**

## G10: Confounders 已定义

| # | Assertion | Status |
|---|---|---|
| G10.1 | Google Algorithm Update 已列出 | PASS |
| G10.2 | Sitemap/Canonical/Content 变更已列出 | PASS |
| G10.3 | Technical Incident 已列出 | PASS |

**Checked: 3/3**

## G11: Zero-impression pages 没有被解释成 content failure

| # | Assertion | Status |
|---|---|---|
| G11.1 | 禁止解释列表存在 | PASS |
| G11.2 | 允许解释为 UNKNOWN | PASS |
| G11.3 | Group B 未自动归因为 authority problem | PASS |

**Checked: 3/3**

## G12: 没有生产文件修改

| # | Assertion | Status |
|---|---|---|
| G12.1 | src/ 目录未修改 | PASS |
| G12.2 | 仅生成新文档（*.md）| PASS |
| G12.3 | 无 commit / push | PASS |

**Checked: 3/3**

## G13: Gate checked > 0

| Gate | Assertions |
|---|---|
| G1 | 3 |
| G2 | 3 |
| G3 | 3 |
| G4 | 3 |
| G5 | 3 |
| G6 | 3 |
| G7 | 3 |
| G8 | 2 |
| G9 | 2 |
| G10 | 3 |
| G11 | 3 |
| G12 | 3 |
| **Total** | **32** |

**Checked: 12/12 gates have assertions > 0**

## G14: 反向注入可以抓到至少 3 类错误

| # | 注入类型 | 预期结果 | Status |
|---|---|---|---|
| G14.1 | 添加 REMOVE 决策到 matrix | CAUGHT | PENDING |
| G14.2 | 同时修改 title+description | CAUGHT | PENDING |
| G14.3 | 把 hypothesis 写成 fact | CAUGHT | PENDING |

**Checked: 0/3（需创建反向注入脚本）|

---

## Summary

| Metric | Value |
|---|---|
| Total gates | **14** |
| Gates with PASS | **13** |
| Gates pending | **1**（G14 reverse injection）|
| Total assertions | **32** |
| Total checked | **32** |

**Verdict: CONDITIONAL PASS（需完成 G14 反向验证）|
