
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Experiment Governance V1

> Phase 2 · 实验治理规则
> 核心原则：**一次实验只改变一个主要变量**

---

## 一、变量隔离原则

| Experiment | 变量 | 禁止同时改变 |
|---|---|---|
| Strategy A | Description only | Title, Content, Canonical |
| Strategy B | Title only | Description, Content, Canonical |

**不得**同时修改：
- ❌ Title + Description
- ❌ Title + Content
- ❌ Description + Canonical

---

## 二、实验顺序

建议按以下顺序执行：

1. **Strategy A（Description）** → 观察 28 天 → 评估
2. **Strategy B（Title）** → 观察 28 天 → 评估
3. **Strategy C（Zero-impression）** → 分析数据 → 决定下一步

**不要**同时进行多个实验。

---

## 三、页面选择规则

### Strategy A
- 3 个页面
- 有曝光（imp > 0）
- description >160 字符
- 不与 Strategy B 重叠

### Strategy B
- 2-3 个页面
- Tier A 排名
- 有曝光（imp > 0）
- 不与 Strategy A 重叠

### Strategy C
- 18 个页面分组
- 暂不实施
- 仅设计

---

## 四、数据收集规则

### Baseline
- 时间范围：过去 28 天
- 数据来源：GSC Search Analytics
- 最低要求：10 impressions

### Treatment
- 时间范围：至少 28 天
- 检查点：Day 7 / Day 14 / Day 28
- 最终评估：Day 28

### 记录要求
- 每次修改记录 commit hash
- 记录修改时间
- 记录修改内容 diff
- 记录任何 confounder 事件

---

## 五、评估规则

### 评估时间
- Day 7: 初步观察（不做最终判断）
- Day 14: 中期评估
- Day 28: 最终评估

### 评估标准
见 `SEO_EXPERIMENT_MEASUREMENT_PLAN_V1.md`

### 争议处理
如对评估结果有异议：
1. 检查是否有 confounder
2. 延长观察期到 56 天
3. 如仍有争议，标记 INCONCLUSIVE
