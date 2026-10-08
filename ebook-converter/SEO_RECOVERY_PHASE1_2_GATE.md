# Phase 1.2 Gate（SEO_RECOVERY_PHASE1_2_GATE）

> 阶段: Phase 1.2 · Gates G1-G11

## G1: Manual Action 状态明确或 UNKNOWN

| # | Assertion | Status |
|---|---|---|
| G1.1 | Manual Action 状态标记为 UNKNOWN（非 VERIFIED_NO_ACTION）| PASS |
| G1.2 | 已生成人工验证指南 | PASS |
| G1.3 | 未假设无处罚 | PASS |

**Checked: 3/3**

## G2: U3 状态明确

| # | Assertion | Status |
|---|---|---|
| G2.1 | U3 = UNKNOWN（非 RESOLVED）| PASS |
| G2.2 | constants.ts 数据标记为 HISTORICAL | PASS |
| G2.3 | 无 fetchedAt 字段确认 | PASS |
| G2.4 | 提出替代方案（GSC query 数据）| PASS |

**Checked: 4/4**

## G3: 31 Convert 全部进入 Evidence Matrix

| # | Assertion | Status |
|---|---|---|
| G3.1 | Tier A（13 页）全部在矩阵 | PASS |
| G3.2 | Tier D（18 页）全部在矩阵 | PASS |
| G3.3 | 每页有 GSC Impression 字段 | PASS |
| G3.4 | 每页有 Index Status 字段 | PASS |
| G3.5 | 每页有 Decision Risk 字段 | PASS |

**Checked: 5/5**

## G4: 18 Zero-Impression 全部进入 Coverage 分组

| # | Assertion | Status |
|---|---|---|
| G4.1 | Group A（已收录）3 页 | PASS |
| G4.2 | Group B（已发现未抓取）14 页 | PASS |
| G4.3 | Group C（URL 未知）1 页 | PASS |
| G4.4 | 每页有 Interpretation | PASS |

**Checked: 4/4**

## G5: 没有把 UNKNOWN 转成 0

| # | Assertion | Status |
|---|---|---|
| G5.1 | 无 "Backlinks = 0" 表述 | PASS |
| G5.2 | 无 "Search Volume = 0" 表述 | PASS |
| G5.3 | 无 "No manual action" 断言 | PASS |
| G5.4 | UNKNOWN 保持 UNKNOWN | PASS |

**Checked: 4/4**

## G6: 没有 REMOVE / MERGE / NOINDEX 决策

| # | Assertion | Status |
|---|---|---|
| G6.1 | Evidence Matrix 无 REMOVE 列 | PASS |
| G6.2 | Coverage Grouping 无合并建议 | PASS |
| G6.3 | Red Team 无删除假设 | PASS |
| G6.4 | 所有决策标记为观察/实验 | PASS |

**Checked: 4/4**

## G7: 没有 production file modification

| # | Assertion | Status |
|---|---|---|
| G7.1 | src/ 目录未修改（git status --porcelain）| PASS |
| G7.2 | 仅生成新文档（*.md）| PASS |
| G7.3 | 无 commit / push | PASS |

**Checked: 3/3**

## G8: U5 保持 DEFER

| # | Assertion | Status |
|---|---|---|
| G8.1 | U5 = DEFER（非 RESOLVED）| PASS |
| G8.2 | 未引入第三方 backlink 工具 | PASS |
| G8.3 | 说明 DEFER 理由 | PASS |

**Checked: 3/3**

## G9: Experiment Design 阻塞条件符合定义

| # | Assertion | Status |
|---|---|---|
| G9.1 | U1 = RESOLVED | PASS |
| G9.2 | Sitemap reconciliation = RESOLVED | PASS |
| G9.3 | Manual Action ≠ VERIFIED_ACTION_PRESENT | PASS |
| G9.4 | 关键实验页面有 GSC baseline | PASS |
| G9.5 | 实验目标可被 GSC 测量 | PASS |
| G9.6 | 明确哪些实验可开始（Description/Title）| PASS |
| G9.7 | 明确哪些实验暂不开始（18 页批量修改）| PASS |

**Checked: 7/7**

## G10: checked > 0（门禁不空转）

| # | Assertion | Status |
|---|---|---|
| G10.1 | G1 评估断言数 > 0（3 项）| PASS |
| G10.2 | G2 评估断言数 > 0（4 项）| PASS |
| G10.3 | G3 评估断言数 > 0（5 项）| PASS |
| G10.4 | G4 评估断言数 > 0（4 项）| PASS |
| G10.5 | G5 评估断言数 > 0（4 项）| PASS |
| G10.6 | G6 评估断言数 > 0（4 项）| PASS |
| G10.7 | G7 评估断言数 > 0（3 项）| PASS |
| G10.8 | G8 评估断言数 > 0（3 项）| PASS |
| G10.9 | G9 评估断言数 > 0（7 项）| PASS |

**Checked: 9/9**

## G11: Reverse injection 能抓错

| # | Assertion | Status |
|---|---|---|
| G11.1 | 注入脚本存在 | PASS |
| G11.2 | 验证 G1-G9 的断言有效性 | TODO |
| G11.3 | 至少 1 次反向注入验证 | TODO |

**Checked: 1/3（pending）**

---

## Summary

| Metric | Value |
|---|---|
| Total gates | **11** |
| Gates with PASS | **10** |
| Gates pending | **1**（G11 reverse injection）|
| Total assertions | **47** |

**Verdict: CONDITIONAL PASS（需完成 G11 反向验证）|
