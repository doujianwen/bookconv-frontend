
---
> **状态**: SUPERSEDED  
> ** superseded date**: 2026-10-07  
> ** reason**: Project moved from experimental comparison to prioritized SEO optimization. No production conclusion is derived from these obsolete experiment designs.

# Experiment Design Red Team V1

> Phase 2 · 攻击实验设计中的假设
> 每项标记: FACT / ASSUMPTION / UNKNOWN / RISK / VALIDATION

---

## H-A1: Description rewrite → CTR improvement

| 项目 | 内容 |
|---|---|
| **假设** | 优化 description 一定提高 CTR |
| **裁决** | **UNPROVEN** |
| **证据** | 81/121 页 description >160 字符是事实缺陷 |
| **验证** | 但 position 34-75 无展示位 ⇒ 无从测 CTR |
| **风险** | 优化后可能仍无展示机会 |

---

## H-A2: Title rewrite → CTR improvement

| 项目 | 内容 |
|---|---|
| **假设** | 优化 title 一定提高 CTR |
| **裁决** | **UNPROVEN** |
| **证据** | 标题已包含关键词但排名仍差 |
| **验证** | 排名受多因素影响（内容质量/外链/用户体验）|
| **风险** | 单改 title 可能无效 |

---

## H-A3: CTR improvement → SEO recovery

| 项目 | 内容 |
|---|---|
| **假设** | CTR 提升会带来 SEO 恢复 |
| **裁决** | **ASSUMPTION** |
| **证据** | 本项目 31 页共 633 曝光 0 点击 |
| **验证** | CTR 是排名信号但非唯一因素 |
| **风险** | 即使 CTR 提升，排名可能仍不改善 |

---

## H-A4: Position changes → experiment effect

| 项目 | 内容 |
|---|---|
| **假设** | Position 变化可直接归因于实验 |
| **裁决** | **UNPROVEN** |
| **证据** | GSC position 是平均值，真实分布未知 |
| **验证** | 需逐日数据才能确认趋势 |
| **风险** | 可能混淆 natural fluctuation 与 experiment effect |

---

## H-A5: 28 days → sufficient observation

| 项目 | 内容 |
|---|---|
| **假设** | 28 天观察期足够判断实验效果 |
| **裁决** | **ASSUMPTION** |
| **证据** | Google 算法更新周期不确定 |
| **验证** | 需结合 historical baseline 对比 |
| **风险** | 可能错过长期趋势或短期噪声 |

---

## H-A6: 3 pages → representative sample

| 项目 | 内容 |
|---|---|
| **假设** | 3 个页面足以代表整体效果 |
| **裁决** | **UNKNOWN** |
| **证据** | 样本量小，统计效力低 |
| **验证** | 需 multiple experiments 验证一致性 |
| **风险** | 结论可能不适用于其他页面 |

---

## H-A7: GSC CTR change → causal effect

| 项目 | 内容 |
|---|---|
| **假设** | GSC CTR 变化可直接归因于 title/description 修改 |
| **裁决** | **UNPROVEN** |
| **证据** | 可能有其他因素同时变化 |
| **验证** | 需控制混杂变量 |
| **风险** | 可能错误归因 |

---

## H-A8: Zero-impression pages → content problem

| 项目 | 内容 |
|---|---|
| **假设** | 零曝光页面是内容质量问题 |
| **裁决** | **REJECTED** |
| **证据** | `/convert/epub-to-zip` 零点击但 pos 14.8（全站最佳）|
| **验证** | 已收录 3 页零曝光可能是 niche 格式 |
| **风险** | 可能因 ranking/snippet 问题，非内容质量 |

---

## 统计

| 裁决 | 数量 |
|---|---|
| FACT | 0 |
| ASSUMPTION | 2 |
| UNPROVEN | 5 |
| REJECTED | 1 |

**关键洞察**: 5/8 假设无法证实。**实验设计必须包含对照和控制组，不能直接假设优化必然有效**。
