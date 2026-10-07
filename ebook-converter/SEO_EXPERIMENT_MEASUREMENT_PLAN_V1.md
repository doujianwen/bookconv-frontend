
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Experiment Measurement Plan V1

> Phase 2 · 核心交付物
> 定义 Primary/Secondary Metrics、Baseline/Treatment Windows、Confounders

---

## 一、Experiment 概览

| Experiment | Type | Pages | Variable | Start Date | End Date |
|---|---|---|---|---|---|
| Strategy A | Description | 3 | Description only | TBD | TBD + 28 days |
| Strategy B | Title | 3 | Title only | TBD | TBD + 28 days |

**重要**：两个实验必须错开执行，不得同时进行（避免混杂变量）。

建议顺序：
1. 先做 Strategy A（Description）→ 观察 28 天 → 评估
2. 再做 Strategy B（Title）→ 观察 28 天 → 评估

---

## 二、Primary Metrics

### Strategy A: Description Experiment

| Metric | 说明 | 测量方式 |
|---|---|---|
| **CTR** | Click-Through Rate = Clicks / Impressions | GSC Search Analytics |
| Impressions | 曝光次数 | GSC |
| Clicks | 点击次数 | GSC |
| Average Position | 平均排名 | GSC |

**判断标准**：
- CTR 提升 ≥ 10% = 积极信号
- CTR 无变化或下降 = 无效或负向

### Strategy B: Title Experiment

| Metric | 说明 | 测量方式 |
|---|---|---|
| **CTR** | Click-Through Rate | GSC Search Analytics |
| Impressions | 曝光次数 | GSC |
| Clicks | 点击次数 | GSC |
| Average Position | 平均排名 | GSC |

**判断标准**：
- CTR 提升 ≥ 10% = 积极信号
- Position 提升 ≥ 5 位 = 额外积极信号

---

## 三、Baseline Window

| 参数 | 值 | 说明 |
|---|---|---|
| Duration | **过去 28 天** | 覆盖完整月度周期 |
| Data Source | GSC Search Analytics | query × page 维度 |
| Condition | 页面必须有 ≥ 10 impressions | 数据不足则排除 |

如果某个页面 28 天数据不足 10 impressions：
- 延长 baseline 到 60 天
- 若仍不足，该页面排除出实验

---

## 四、Treatment Window

| 参数 | 值 | 说明 |
|---|---|---|
| Duration | **至少 28 天** | 不要因为 3-7 天变化就宣布成功 |
| Checkpoints | Day 7 / Day 14 / Day 28 | 分阶段观察 |
| Decision Point | Day 28 | 最终评估 |

**重要**：
- Day 7 数据仅作参考，不做最终判断
- Day 14 数据可做初步评估
- Day 28 数据做最终评估

---

## 五、Confounders（混杂变量）

实验期间必须记录以下事件，如有发生标记 `CONTAMINATED`：

| Confounder | 说明 | 标记方式 |
|---|---|---|
| Google Algorithm Update | 核心算法更新 | 记录日期 + 影响评估 |
| Sitemap 修改 | 新增/删除 URL | 记录 commit hash |
| Canonical 变更 | URL 规范化变化 | 记录具体变更 |
| Page Content 修改 | 正文内容改动 | 记录 diff |
| Technical Incident | 服务器宕机/部署故障 | 记录时间 + 影响范围 |
| Major Traffic Change | 流量突然暴涨/暴跌 | 记录原因 |
| Index Status Change | 页面被收录/移除 | GSC URL Inspection |

---

## 六、Acceptance Criteria

### PASS

满足以下所有条件：
1. CTR 提升 ≥ 10%
2. Impressions 无明显异常下降（> 20% 下降需调查）
3. 无重大 confounder 发生
4. 效果持续至少两个 measurement periods（Day 14 和 Day 28 都稳定）

### HOLD

数据不足，无法判定：
- Impressions < 100 在整个实验期间
- 有重大 confounder 但影响范围不明

### FAIL

CTR 无改善或下降，且：
- 数据充足（Impressions > 100）
- 无重大 confounder

### INCONCLUSIVE

存在重大混杂因素，实验结果不可信：
- Google 算法更新
- 技术性故障
- 其他页面同时修改

---

## 七、统计说明

**禁止**使用 "statistically significant" 除非完成适当统计检验。

**允许**使用：
- "directional improvement"（方向性改善）
- "observed improvement"（观察到的改善）
- "insufficient evidence"（证据不足）

---

## 八、实验日志模板

每次检查点记录：

```markdown
## Checkpoint: Day X

### Data
- Strategy A CTR: X.XX% (baseline: Y.YY%)
- Strategy B CTR: X.XX% (baseline: Y.YY%)

### Observations
- [ ] CTR 提升
- [ ] CTR 下降
- [ ] 无变化

### Confounders
- [ ] 无
- [ ] 有（记录）

### Decision
- CONTINUE / HOLD / STOP
```
