# SEO Description Governance V1

> Phase 2 · Title-First Optimization
> 状态: GOVERNANCE RULES DEFINED
> 执行日期: 2026-10-07

---

## 一、当前状态

### 事实记录

| 指标 | 数值 | 来源 |
|------|------|------|
| 全站页面 | 121 | `_wb_tmp/_v2_data.json` |
| Description >160 chars | ~81 | Phase 1 Audit |
| Description <100 chars | ~28 | Phase 1 Audit |
| Convert 页面 | 31 | 源文件统计 |
| Convert Description 合规 (140-160) | 23/31 | Phase 1 Audit |

### Runtime Metadata 确认

- `blog/[slug]/page.tsx:57` = `displayContent.intro \|\| displayTitle`
- `guide/[slug]/page.tsx:40` = `g.problem \|\| g.content.intro \|\| g.title`
- `convert` 页面 = `metaDescription \|\| subtitle`
- 两处均**无长度截断**，Google 可能自行生成 snippet

---

## 二、治理原则

### 2.1 Title-First 纪律

1. **第一批只改 Title**：Description 本批不修改
2. **避免变量混淆**：Title 和 Description 不同时改，否则无法判断效果来源
3. **观察期后评估**：Title 优化效果评估后再决定 Description 是否需要优化

### 2.2 Description 优化标准

当 Description 需要优化时，遵循：

```
Intent → Capability → Core Benefit
```

**示例（epub-to-azw3）**：
```
Convert EPUB files to AZW3 online with BookConv. Preserve ebook formatting and convert your file directly in the browser without registration.
```

**禁止**：
- 机械截断（丢弃核心卖点）
- 关键词堆砌
- 虚假承诺（fastest/best/#1）
- 与 Title 重复

---

## 三、待优化页面（第二批）

| 优先级 | URL | Current Desc Len | Issue |
|--------|-----|------------------|-------|
| P1 | `/convert/epub-to-doc` | 178 | 超长，卖点后置 |
| P1 | `/convert/epub-to-txt` | 170 | 超长，可精简 |
| P1 | `/convert/epub-to-azw3` | 179 | 超长，可精简 |
| P2 | `/convert/lit-to-epub` | 179 | 超长，可精简 |
| P2 | `/convert/epub-to-zip` | 170 | 超长，可精简 |

---

## 四、执行纪律

- ❌ 本阶段不批量修改 Description
- ✅ 建立治理规则供后续执行参考
- ⏳ Description 优化需等待 Title 效果评估后决策

---

## 五、数据来源

- 当前 Description 数据：Phase 1 Audit (`_wb_tmp/_audit_meta.json`)
- 页面元数据：`src/data/content/*.ts`
