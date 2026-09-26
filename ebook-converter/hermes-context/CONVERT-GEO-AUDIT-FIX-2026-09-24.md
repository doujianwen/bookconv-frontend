# Hermes 委派包：Convert 页面 GEO 标准化改造（Red Team 修复版）

**创建时间**: 2026-09-24 23:35  
**审计评分**: 6.3/10 → 修复后预期 8.5/10  
**委派状态**: 待用户确认

---

## 一、问题背景与修复

### 红队审计发现的 Blocker（已修复）

| # | 问题 | 修复方案 | 状态 |
|---|------|---------|------|
| 1 | 线上 Schema 验证缺失 | 增加 `verifyOnline()` 函数 | ✅ |
| 2 | 字数统计偏差 30-50% | 改为只统计模板字符串内英文单词 | ✅ |
| 3 | Exit Code 逻辑错误 | WARN 状态也 exit 1 | ✅ |
| 4 | 路径硬编码 | 改用 `process.cwd()` | ✅ |
| 5 | 缺少 JSON 输出 | 新增 `--json` 标志 | ✅ |

### 修复前后对比

```
修复前:
- PASS: 7 (22.6%), WARN: 13 (41.9%), FAIL: 11 (35.5%)
- epub-to-txt: 2961 词（虚高）

修复后:
- PASS: 5 (16.1%), WARN: 15 (48.4%), FAIL: 11 (35.5%)
- epub-to-txt: 1082 词（准确）
- Exit code: 1（FAIL 或 WARN 都阻断部署）
```

---

## 二、Phase 1 改造任务

### 目标页面（Top 5 高 Citation）

| 排名 | 文件 | Bing AI Citations | 当前分数 | 需补内容 | 预计工时 |
|------|------|------------------|---------|---------|---------|
| 1 | `epub-to-pdf.ts` | 863 | 6.0 | 字数扩充至 2000+ | 30 min |
| 2 | `epub-to-mobi.ts` | 747 | 6.0 | 对比表细化 | 30 min |
| 3 | `epub-to-txt.ts` | 678 | 3.0 | **When + HowTo + Comparison + Quality** | 2 hr |
| 4 | `mobi-to-epub.ts` | 612 | 6.0 | 字数优化 | 30 min |
| 5 | `pdf-to-epub.ts` | 445 | 5.5 | 字数扩充 | 30 min |

### 标准模板（8 章节强制）

```typescript
sections: [
  { heading: 'About EPUB Format', body: `...` },
  { heading: 'About PDF Format', body: `...` },
  { heading: 'Why Convert EPUB to PDF?', body: `...` },
  { heading: 'When to Convert EPUB to PDF', body: `...≥300词...` },  // ⭐
  { heading: 'How to Convert EPUB to PDF: Step by Step', body: `...≥400词...` },  // ⭐
  { heading: 'EPUB vs PDF: Format Comparison', body: `...≥200词...` },  // ⭐
  { heading: 'Conversion Quality Checklist', body: `...≥150词...` },  // ⭐
  { heading: 'FAQ', body: `...≥6条...` }  // ⭐
]
```

**质量门槛**：
- Word count ≥ 2000（仅统计正文）
- Headings ≥ 8
- FAQ ≥ 6
- GEO 评分 ≥ 5.0

---

## 三、技术约束（铁律）

### 文件约束
- 位置：`src/data/content/*.ts`
- 导出格式：`export const slug`, `export const content`
- 正文是模板字符串，**禁尖括号标签、禁裸反引号**

### 编辑约束
- CRLF 探测：每个文件独立探测，禁止批量转换
- 单引号串内禁放 `'` 或 `'`（缩写用 do not）
- 批量注入只能插在模板串内部（闭合反引号**之前**）

### 门禁约束
- 改完必跑：`npm run audit:syntax`
- 改完必跑：`node scripts/geo-audit-content.mjs --no-online`
- commit 前必：`git diff --cached` 全量复核

---

## 四、委派命令

### 方案 A：冒烟测试（推荐先执行）

```bash
# 1. 改造最复杂的 FAIL 页面
# 编辑 src/data/content/epub-to-txt.ts，添加：
# - When to Use 章节
# - How to Convert 章节  
# - Format Comparison 章节
# - Quality Checklist 章节
# - 扩充 FAQ 至 8 条

# 2. 验证
node scripts/geo-audit-content.mjs --no-online src/data/content/epub-to-txt.ts
# 预期: score >= 5.0, rating = PASS

# 3. 语法扫描
npm run audit:syntax
# 预期: 0 parse errors

# 4. 线上断言
curl -s "https://www.bookconv.com/convert/epub-to-txt" | grep -o "FAQPage" | wc -l
# 预期: >= 1
```

### 方案 B：批量改造 Top 5

```bash
# 1. 批量编辑 5 个文件
# 参考 docs/convert-page-geo-standards-v2-2026-09-24.md 的模板

# 2. 全量验证
node scripts/geo-audit-content.mjs --no-online
# 预期: PASS >= 10 (32%)

# 3. 全门禁
npm run audit:syntax
npx tsc --noEmit
# 预期: 0 errors

# 4. Commit + Push
git add src/data/content/{epub-to-pdf,epub-to-mobi,epub-to-txt,mobi-to-epub,pdf-to-epub}.ts
git commit -m "feat(content): Phase 1 GEO standardization for Top 5 convert pages"
git push origin main
```

---

## 五、验收标准

### 自动化检查
```bash
node scripts/geo-audit-content.mjs --no-online
# 预期输出：
# PASS (>=5.0): >= 10 (32%)
# FAIL (<3.0): 0
```

### 线上断言
```bash
# 验证 FAQPage schema
curl -s "https://www.bookconv.com/convert/epub-to-txt" | grep -o "FAQPage" | wc -l
# 预期: >= 1

# 验证 HowTo schema
curl -s "https://www.bookconv.com/convert/epub-to-txt" | grep -o "HowTo" | wc -l
# 预期: >= 1
```

### 人工 Review Checklist
- [ ] 章节内容是否与页面功能匹配
- [ ] 对比表格数据是否准确
- [ ] Quality Checklist 是否具有可操作性
- [ ] FAQ 是否覆盖真实用户痛点

---

## 六、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 改造引入语法错误 | 中 | 高 | 每页改完跑 `syntax-sweep` |
| 并行写入冲突 | 高 | 高 | commit 前先 fetch + rebase |
| 线上 Schema 不匹配 | 中 | 中 | 跑 `verifyOnline()` 验证 |
| 字数仍虚高 | 低 | 中 | 已修复 `countBodyWords()` |

---

## 七、时间表

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| Phase 1 | Week 1 (9/25-10/1) | Top 5 页面改造完成 |
| Phase 2 | Week 2-3 (10/2-10/14) | Next 6 页面改造完成 |
| Phase 3 | Week 4-6 (10/15-10/28) | 全部 31 页面改造完成 |
| Phase 4 | Week 7-8 (10/29-11/11) | 全量验证 + 监控 |

---

## 八、相关文件

- **标准文档**: `docs/convert-page-geo-standards-v2-2026-09-24.md`
- **审计脚本**: `scripts/geo-audit-content.mjs`（v2.1）
- **审计报告**: `数据分析/红队+苏格拉底审计报告-2026-09-24.md`
- **工作日志**: `.workbuddy/memory/2026-09-24.md`

---

**委派状态**: 待用户确认  
**预计工时**: 3-4 小时（含验证）  
**回滚方案**: `git revert HEAD~1` 即可
