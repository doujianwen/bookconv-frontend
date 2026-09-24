# Convert 页面 GEO 标准化改造方案 v2.0

**创建日期**: 2026-09-24  
**背景**: 对抗式审计发现 convert 页面 GEO 合规率仅 22.6%（7/31 PASS）  
**根因**: 博客写作指南（`英文博客写作指南.md`）未覆盖 convert 页面 schema，且 `correction-guards.blog.mjs` 仅检查 blog 内容，convert 页面完全无 GEO 门禁

---

## 一、根因分析

### 1.1 标准体系缺口

| 内容类型 | 是否有 GEO 标准 | 门禁脚本 | 审计频率 |
|---------|---------------|---------|---------|
| Blog Posts | ✅ 有（`英文博客写作指南.md` §7） | ✅ `correction-guards.blog.mjs` | 每次发布前 |
| Convert Pages | ❌ 无 | ❌ 无 | 从未审计 |
| Guides | ⚠️ 部分（依赖 blog 标准） | ⚠️ 半覆盖 | 随机检查 |

### 1.2 Schema 差异导致无法复用

```
Blog Schema:  Article + FAQPage + Key Takeaways
Convert Schema: SoftwareApplication + HowTo + FAQPage + BreadcrumbList
```

- Blog 要求 "Key Takeaways" 章节 → Convert 不需要
- Convert 要求 "How to Convert" 步骤章节 → Blog 不需要
- Convert 特有需求：格式对比（Comparison）、质量检查表（Quality Checklist）

### 1.3 历史原因

1. **2026-07-30**: 创建 `英文博客写作指南.md`，仅覆盖 blog 场景
2. **2026-09-17**: 创建 `correction-guards.blog.mjs`，仅检查 blog posts
3. **2026-09-24**: 对抗式审计发现 convert 页面 GEO 问题

---

## 二、解决方案

### 2.1 新增文件

| 文件 | 用途 | 状态 |
|------|------|------|
| `docs/convert-page-geo-standards.md` | Convert 页面 GEO 标准文档 | 📝 待创建 |
| `scripts/geo-audit-content.mjs` | Convert 页面 GEO 合规审计脚本 | ✅ 已创建 |
| `scripts/correction-guards.content.mjs` | Convert 页面发布前守卫插件 | 📝 待创建 |

### 2.2 Convert 页面 GEO 标准（强制）

每个 convert 页面必须包含以下 7 个核心要素：

| # | 要素 | 标题关键词 | 字数要求 | GEO 价值 |
|---|------|-----------|---------|---------|
| 1 | About Source Format | "About.*Format" | - | 建立主题权威性 |
| 2 | About Target Format | "About.*Format" | - | 建立主题权威性 |
| 3 | Why Convert | "Why Convert" | - | 匹配搜索意图 |
| 4 | **When to Use** | "When.*Use|When.*Need" | ≥300词 | 捕获长尾关键词 |
| 5 | **How to Convert** | "How to|Step by Step" | ≥400词 | 配合 HowTo Schema |
| 6 | **Format Comparison** | "Comparison|vs\b" | ≥200词 | 捕获对比类搜索词 |
| 7 | **Quality Checklist** | "Quality|Checklist" | ≥150词 | 提升权威性 |
| 8 | FAQ | "FAQ|Frequently Asked" | ≥6条 | 配合 FAQPage Schema |

**质量标准**:
- 总字数 ≥ 2000 词
- Headings 数量 ≥ 8 个
- FAQ 数量 ≥ 6 条
- GEO 评分 ≥ 5.0（满分 7）

### 2.3 标准模板（Markdown 格式）

```typescript
export const slug = 'epub-to-pdf';
export const title = 'Free EPUB to PDF Converter — No Sign-up';
export const metaDescription = 'Convert EPUB to PDF free — no sign-up...';
export const level = 'A' as const;
export const wordCount = 2000;

export const content = {
  hero: {
    title: 'EPUB to PDF - From Fluid Reading to Fixed Layout',
    subtitle: 'Free EPUB to PDF converter...'
  },

  sections: [
    {
      heading: 'About EPUB Format',
      body: `...技术规格 + 使用场景 + 限制...`
    },
    {
      heading: 'About PDF Format',
      body: `...技术规格 + 使用场景 + 限制...`
    },
    {
      heading: 'Why Convert EPUB to PDF?',
      body: `...转换动机 + 具体场景...`
    },
    {
      heading: 'When to Convert EPUB to PDF',  // ✅ 新增
      body: `
        **Choose this conversion when:**
        - You need [specific use case]
        - Your workflow requires [specific requirement]
        - You want to [specific benefit]

        **Consider alternative formats if:**
        - You need reflowable text → try EPUB
        - You need interactive features → try EPUB 3

        **Real-world example:**
        [具体场景描述，≥3句]
      `
    },
    {
      heading: 'How to Convert EPUB to PDF: Step by Step',  // ✅ 新增
      body: `
        **Step 1 — Upload your EPUB**
        [详细说明，含截图描述]

        **Step 2 — Wait for processing**
        [时间预期 + 技术说明]

        **Step 3 — Download the PDF**
        [下载提示 + 安全声明]
      `
    },
    {
      heading: 'EPUB vs PDF: Format Comparison',  // ✅ 新增
      body: `
        | Feature | EPUB | PDF |
        |---------|------|-----|
        | Reflowable | ✅ Yes | ❌ No |
        | Print Ready | ⚠️ Limited | ✅ Yes |
        | ... | ... | ... |

        **Bottom Line:**
        [对比结论，≥2句]
      `
    },
    {
      heading: 'Conversion Quality Checklist',  // ✅ 新增
      body: `
        Before downloading, verify:

        | Check Item | Expected Result | How to Verify |
        |-----------|----------------|---------------|
        | Text formatting | Preserved | Open in reader |
        | Images | Clear | Zoom to 200% |
        | File size | Reasonable | Compare with source |

        **Known limitations:**
        - [本转换对的特定限制]
      `
    },
    {
      heading: 'FAQ',
      body: `...6-8条Q&A...`
    }
  ],

  faq: [
    { q: '...', a: '...' },
    // ≥6条
  ],

  authorship: {
    author: 'BookConv Team',
    lastVerified: '2026-09-24',
    credentials: '...',
    estimatedConversions: '...'
  }
};
```

---

## 三、改造优先级

### Phase 1: P0 紧急（Top 5 高 Citation 页面）

| 页面 | Bing AI Citations | 当前分数 | 需补内容 | 预计工时 |
|------|------------------|---------|---------|---------|
| `epub-to-pdf.ts` | 863 | 6.5 ✅ | 字数扩充至 2000+ | 30分钟 |
| `epub-to-mobi.ts` | 747 | 7.0 ✅ | 对比表细化 | 30分钟 |
| `epub-to-txt.ts` | 678 | 4.0 🟡 | **Comparison + Quality + HowTo** | 2小时 |
| `mobi-to-epub.ts` | 612 | 7.0 ✅ | 字数优化 | 30分钟 |
| `pdf-to-epub.ts` | 445 | 6.0 ✅ | 字数扩充 | 30分钟 |

### Phase 2: P1 重要（Next 6 页面）

```
epub-to-azw3.ts (6.0 ✅) → 字数扩充
epub-to-doc.ts (5.0 ✅) → 补充 Comparison + Quality
lit-to-epub.ts (5.0 ✅) → 新增 When + HowTo
epub-to-zip.ts (4.0 🟡) → 补充 Quality
html-to-epub.ts (4.0 🟡) → 补充 Quality
cbr-to-pdf.ts (3.5 🟡) → 补充 Comparison + FAQ
```

### Phase 3: P2 常规（剩余 20 页面）

按 Citation 排序逐批改造，优先处理低分页面。

---

## 四、验收标准

### 4.1 自动化检查

```bash
# 运行 GEO 审计
node scripts/geo-audit-content.mjs

# 预期输出
=== GEO Audit: Convert Pages ===
Total pages: 31
PASS (>=5.0): 31 (100%)
WARN (3.0-4.9): 0 (0%)
FAIL (<3.0): 0 (0%)
✅ ALL PAGES PASS GEO STANDARDS
```

### 4.2 线上断言

```bash
# 验证 Schema 存在
curl -s "https://www.bookconv.com/convert/epub-to-txt" | grep -c "FAQPage"
# 预期: ≥1

curl -s "https://www.bookconv.com/convert/epub-to-txt" | grep -c "HowTo"
# 预期: ≥1
```

### 4.3 人工 review

- [ ] 章节内容是否与页面功能匹配
- [ ] 对比表格数据是否准确
- [ ] Quality Checklist 是否具有可操作性
- [ ] FAQ 是否覆盖真实用户痛点

---

## 五、Skill 创建计划

基于本次工作，需要创建以下 skill：

### 5.1 `convert-page-geo-auditor`（新建）

**触发词**: "审计convert页面"、"GEO检查convert"、"convert页面GEO"

**工作流程**:
1. 运行 `scripts/geo-audit-content.mjs` 扫描所有 convert 页面
2. 生成评分矩阵和改造清单
3. 输出优先级排序的改造计划
4. 每完成一个页面，重新运行审计验证

**输入**: 可选文件路径（默认扫描全部）  
**输出**: GEO 合规报告 + 改造建议

### 5.2 `convert-page-writer`（新建）

**触发词**: "写convert页面"、"创建转换页"、"generate conversion page"

**工作流程**:
1. 加载 `docs/convert-page-geo-standards.md`
2. 根据源格式和目标格式生成内容框架
3. 填充标准 8 章节模板
4. 运行 `geo-audit-content.mjs` 验证合规性
5. 输出符合 GEO 标准的 TypeScript 文件

**输入**: 源格式、目标格式  
**输出**: 符合标准的 `.ts` 文件

### 5.3 更新 `bookconv-daily-analysis`

在每日分析流程中增加 convert 页面 GEO 合规率追踪：
- 统计 PASS/WARN/FAIL 比例
- 监控 Top 10 高 Citation 页面的 GEO 评分变化
- 生成趋势图（周维度）

---

## 六、时间表

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| Phase 1 | Week 1 (9/25-10/1) | Top 5 页面改造完成 |
| Phase 2 | Week 2-3 (10/2-10/14) | Next 6 页面改造完成 |
| Phase 3 | Week 4-6 (10/15-10/28) | 全部 31 页面改造完成 |
| Phase 4 | Week 7-8 (10/29-11/11) | 全量验证 + 监控 |
| Skill 创建 | Week 1 | `convert-page-geo-auditor` + `convert-page-writer` |

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 改造引入语法错误 | 中 | 高 | 每页改完跑 `syntax-sweep` + `geo-audit-content` |
| Google 重抓延迟 | 高 | 中 | 提交 re-evaluation 请求加速 |
| 内容质量下降 | 低 | 高 | 每页改造后人工 review |
| 并行写入冲突 | 高 | 高 | 提交前先 fetch + rebase |

---

**文档版本**: v2.0  
**下次更新**: 2026-10-01（Phase 1 完成后）  
**最终验收**: 2026-11-11（全部页面达标）
