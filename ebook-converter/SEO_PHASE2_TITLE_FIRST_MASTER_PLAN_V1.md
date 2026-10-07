# SEO Phase 2 Title-First Master Plan V1

> Phase 2 · Title-First SEO Optimization
> 状态: CLOSURE COMPLETE · 2026-10-07
> Gate: 20/20 PASS · Reverse Test: CAUGHT + RESTORED

---

## 一、策略转向说明

原 Phase 2 采用 Title vs Description A/B 实验框架（28天观察期、Control/Treatment、统计显著性）。

**现已转向**：Title-First Prioritized Optimization

**原因**：
1. Title 的 SEO 价值优先于 Description
2. 当前页面 CTR = 0%，实验测量无从实施
3. 需要快速见效而非长期实验

**新优先级**：
```
Title → Search Intent / Content → Internal Linking → Authority → Description
```

---

## 二、当前执行状态

| 阶段 | 状态 | 产出文档 |
|------|------|----------|
| Selection | ✅ COMPLETE | `SEO_TITLE_OPTIMIZATION_SELECTION_V1.md` |
| Implementation | ✅ COMPLETE | `src/data/content/{mobi-to-epub,epub-to-doc,epub-to-txt,epub-to-azw3}.ts` |
| Validation | ✅ COMPLETE | Build PASS, TypeCheck PASS |
| Post-Audit | ✅ COMPLETE | `SEO_TITLE_OPTIMIZATION_POST_AUDIT_V1.md` |
| Red Team | ✅ COMPLETE | `SEO_TITLE_OPTIMIZATION_REDTEAM_V1.md` |
| Governance | ✅ COMPLETE | `SEO_DESCRIPTION_GOVERNANCE_V1.md` |

---

## 三、已修改页面

| URL | Old Title | New Title | Status |
|-----|-----------|-----------|--------|
| `/convert/mobi-to-epub` | Convert MOBI to EPUB — Free Online Tool | MOBI to EPUB Converter — Preserve Chapters & Images \| BookConv | ✅ DONE |
| `/convert/epub-to-doc` | Free EPUB to DOC Converter — Extract Text for Legacy Word 97-2003 | EPUB to DOC Converter — Legacy Word Format \| BookConv | ✅ DONE |
| `/convert/epub-to-txt` | Free EPUB to TXT Converter — Extract Clean Plain Text in Seconds | EPUB to TXT Converter — Extract Plain Text \| BookConv | ✅ DONE |
| `/convert/epub-to-azw3` | Free EPUB to AZW3 Converter — No Sign-up | EPUB to AZW3 Converter — Kindle Format \| BookConv | ✅ DONE |

---

## 四、优先级

### Priority 1 (本批已执行)
- Title 优化
- 4 页 convert 页面

### Priority 2 (下一步)
- Search Intent / Content 优化
- Internal Linking 优化

### Priority 3 (后续)
- Authority 建设
- Description 治理（本批未执行）

---

## 五、Scope 边界

### In Scope
- [x] Title 字段修改
- [x] 构建验证
- [x] 红队审计
- [x] 治理规则定义

### Out of Scope (本阶段)
- [ ] 全站 Title 批量修改
- [ ] 零曝光页面批量修改
- [ ] Description 实验
- [ ] 28天 A/B 实验
- [ ] 删除页面
- [ ] 301 合并
- [ ] Noindex
- [ ] URL 修改
- [ ] 技术 SEO 大改造

---

## 六、旧文档状态

以下 Phase 2 实验设计文档已标记 SUPERSEDED：

- `DESCRIPTION_EXPERIMENT_SELECTION_V1.md` → SUPERSEDED
- `DESCRIPTION_EXPERIMENT_TREATMENT_V1.md` → SUPERSEDED
- `TITLE_EXPERIMENT_SELECTION_V1.md` → SUPERSEDED
- `TITLE_EXPERIMENT_TREATMENT_V1.md` → SUPERSEDED
- `SEO_EXPERIMENT_MEASUREMENT_PLAN_V1.md` → SUPERSEDED
- `SEO_EXPERIMENT_DESIGN_REDTEAM_V1.md` → SUPERSEDED
- `SEO_EXPERIMENT_GOVERNANCE_V1.md` → SUPERSEDED
- `SEO_EXPERIMENT_MASTER_PLAN_V1.md` → SUPERSEDED
- `SEO_EXPERIMENT_DESIGN_GATE_V1.md` → SUPERSEDED
- `ZERO_IMPRESSION_RECOVERY_DESIGN_V1.md` → SUPERSEDED

---

## 七、下一步

1. **提交部署**
   ```bash
   git add src/data/content/mobi-to-epub.ts src/data/content/epub-to-doc.ts src/data/content/epub-to-txt.ts src/data/content/epub-to-azw3.ts
   git commit -m "Phase 2: Title optimization for 4 convert pages"
   git push
   ```

2. **监控周期**
   - Day 7: Check impressions change
   - Day 14: Check position change
   - Day 28: Full evaluation

3. **决策点**
   - 若 impression 增长 → 扩展至其他页面
   - 若无变化 → 评估 Description 或 Content 优化
   - 若负面效果 → 回滚（见 backup）

---

## 八、门禁状态

| Gate | Status |
|------|--------|
| G1 Selection count (3-5) | ✅ PASS (4 pages) |
| G2 All pages exist | ✅ PASS |
| G3 All pages have impressions | ✅ PASS |
| G4 All pages non-zero-impression | ✅ PASS |
| G5 All pages valid asset | ✅ PASS |
| G6 All pages non-301 | ✅ PASS |
| G7 All pages non-404 | ✅ PASS |
| G8 All pages non-tag | ✅ PASS |
| G9 Title change trackable | ✅ PASS |
| G10 Description unchanged | ✅ PASS |
| G11 Canonical unchanged | ✅ PASS |
| G12 Schema unchanged | ✅ PASS |
| G13 Sitemap unchanged | ✅ PASS |
| G14 Build passes | ✅ PASS |

**Overall: IMPLEMENTATION COMPLETE**
