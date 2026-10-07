# SEO Title Optimization Red Team V1

> Phase 2 · Title-First Optimization
> 执行日期: 2026-10-07
> 模式: RED TEAM AUDIT
> 状态: REVIEWED + FACT-CHECKED

---

## 红队攻击假设

### H1: Title 优化一定提高排名
- **攻击**: Title 是排名因素之一，但权重低于内容质量、外链、权威度
- **反证**: epub-to-zip 无任何 guide 内链却 pos 14.8（全站最佳）
- **裁决**: `NOT PROVEN` — Title 可能有助于 CTR，但不保证排名提升
- **缓解**: 本批选择已有曝光的页面，排名的基线已存在

---

### H2: Title 优化一定提高 CTR
- **攻击**: CTR 受 position、snippet 质量、用户意图匹配度多重影响
- **反证**: 当前 4 页 CTR 均为 0%（position 51-70），无展示位
- **裁决**: `NOT PROVEN` — 在位置 50+ 时 CTR 无从测试
- **缓解**: 关注 impression 增长作为间接指标；position 改善后才可测 CTR

---

### H3: Google 一定使用我们写的 Title
- **攻击**: Google 经常重写 title tag，基于查询意图和用户行为
- **反证**: 无官方文档保证 title tag 会被直接使用
- **裁决**: `NOT GUARANTEED`
- **缓解**: 保持 title 符合 Google 最佳实践（简洁、相关、无堆砌）

---

### H4: Title 更短一定更好
- **攻击**: 过短可能丢失语义，过长可能被截断
- **当前状态**: 2 页缩短（epub-to-doc: 66→49, epub-to-txt: 63→46），2 页略增（mobi-to-epub: 40→59, epub-to-azw3: 43→44）
- **裁决**: `NOT PROVEN` — 长度不是唯一因素，intent clarity 更重要
- **缓解**: 所有 title 保持在 40-60 字符合理区间

---

### H5: 第一批页面代表全站
- **攻击**: 仅选 4 页，无法代表 31 页 convert 的整体情况
- **反证**: 27 页未被优化，策略是否适用于全站未知
- **裁决**: `NOT PROVEN`
- **缓解**: 本批为试点，成功后可扩展；零曝光页独立处理

---

### H6: 当前 organic 下降完全由 Title 导致
- **攻击**: 多因素可能导致流量下降（Spam Update、技术故障、竞争变化）
- **反证**: U6 结构同质是否被降权 = UNKNOWN；U_MANUAL_ACTION = UNKNOWN
- **裁决**: `NOT PROVEN`
- **缓解**: Title 优化是低风险高收益尝试，但不假设是主因

---

### H7: Spam Update 导致当前表现下降
- **攻击**: 无官方 Manual Action 证据（U_MANUAL_ACTION = UNKNOWN）
- **反证**: 不能排除其他因素（算法调整、竞争加剧、技术 SEO 问题）
- **裁决**: `RECOVERY HYPOTHESIS` — 仅作为假设，非结论
- **缓解**: 避免在文档中使用"Google penalty"等确定性表述

---

### H8: 新 Title 声明均有事实依据
- **攻击**: 检查每个 Title 中的声明是否在页面内容中得到支持
- **验证结果**:
  - mobi-to-epub: "Preserve Chapters & Images" → ✓ 内容中有 "Keep chapters, images & metadata intact"
  - epub-to-doc: "Legacy Word Format" → ✓ 内容中有 "legacy Word 97-2003"
  - epub-to-txt: "Extract Plain Text" → ✓ 内容中有 "extract clean plain text"
  - epub-to-azw3: "Kindle Format" → ✓ 内容中有 "Kindle Format 8"
- **裁决**: `FACT-SUPPORTED` — 所有声明均有事实依据
- **缓解**: Title 遵循 SEO relevance > marketing language 原则

---

## 红队总结

| 假设 | 裁决 | 风险等级 |
|------|------|----------|
| H1 排名提升 | NOT PROVEN | 中 |
| H2 CTR 提升 | NOT PROVEN | 低 |
| H3 Google 使用 Title | NOT GUARANTEED | 中 |
| H4 更短更好 | NOT PROVEN | 低 |
| H5 代表全站 | NOT PROVEN | 高 |
| H6 Title 是主因 | NOT PROVEN | 中 |
| H7 Spam Update | RECOVERY HYPOTHESIS | 低 |
| H8 事实支持 | FACT-SUPPORTED | ✓ 通过 |

**整体评估**: Title 优化是低风险尝试（仅改 title 字段），预期收益有限但负面风险可控。关键观测指标应为 impression 变化和 position 移动，而非 CTR（当前无展示位）。

> **重要声明**: This phase is an SEO optimization deployment, not a causal experiment.
