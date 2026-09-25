# Convert 页面 GEO 标准化改造方案 v2.0

**创建日期**: 2026-09-24  
**背景**: 对抗式审计发现 convert 页面 GEO 合规率仅 22.6%（7/31 PASS，旧 2000 词阈值）；2026-09-25 阈值校准后回升至 **12/31 PASS**，剩余 10 FAIL 为薄模板长尾对（详见 §2.4）  
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

**质量标准**（阈值校准见 §2.4，2026-09-25）:
- 英文正文词数 ≥ 1000（满分）/ ≥ 600（合格底线）；旧「2000 词」阈值实测不可达，已废止
- Headings 数量 ≥ 8 个
- FAQ 数量 ≥ 6 条
- 必备章节：When to Use / How to Convert / Format Comparison / Quality Checklist（缺一则扣分）
- GEO 评分 ≥ 5.0（满分 7）→ PASS；3.0–4.9 → WARN；<3.0 → FAIL

### 2.3 标准模板（Markdown 格式）

```typescript
export const slug = 'epub-to-pdf';
export const title = 'Free EPUB to PDF Converter — No Sign-up';
export const metaDescription = 'Convert EPUB to PDF free — no sign-up...';
export const level = 'A' as const;
export const wordCount = 1000;  // 填写真实英文正文词数（审计口径），不再是旧 2000 阈值

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

## 二之四、阈值校准（2026-09-25，红队审计后修正）

### 2.4.1 校准背景

原标准设定「总字数 ≥ 2000 词」为达标线。但实测 31 个页面**英文正文词数分布**显示：**没有任何页面达到 2000 词，最高仅 1287 词（mobi-to-epub）**。2000 词阈值不可达，导致审计把所有页面误判为 FAIL，完全失去区分度，门禁形同虚设。

### 2.4.2 实测分布（英文正文，EN-only，剥离 es 镜像）

| 分层 | 词数区间 | 代表页面 | 说明 |
|------|---------|---------|------|
| 深内容页（已改造） | 800–1300 | epub-to-mobi, mobi-to-epub, epub-to-pdf | 集中在 epub/pdf/mobi 互转核心对 |
| 中段页（Phase 2 改造后） | 530–820 | azw3-to-pdf, cbr-to-pdf, epub-to-doc, lit-to-epub | 已达 PASS，词数偏下限 |
| 薄模板页（未改造） | < 500 | azw/rtf/doc/chm 等长尾对 | 系统性缺失 4 个必备章节 |

**结论**：以 **1000 词 = 深内容满分线**、**600 词 = 合格底线** 符合真实分布，且能在「达标 / 合格 / 不合格」三档间有效区分。

### 2.4.3 校准后阈值（脚本常量，见 `scripts/geo-audit-content.mjs`）

| 常量 | 值 | 含义 | 触发条件（得分） |
|------|-----|------|----------------|
| `TARGET_WORD_COUNT` | 1000 | 深内容满分线 | ≥1000 → 字数项 **+1** |
| `WARN_WORD_COUNT` | 600 | 合格底线 | 600–999 → 字数项 **+0.5**；<600 → **+0** |
| `MIN_HEADINGS` | 8 | 章节结构完整（仅 EN） | ≥8 → **+1** |
| `MIN_FAQ` | 6 | FAQPage Schema 支撑 | ≥6 → **+1**；3.6–5 → **+0.5** |
| `hasWhen` | — | 含 "When" 章节 | 命中 → **+1** |
| `hasHowTo` | — | 含 "How to / Step by Step" | 命中 → **+1** |
| `hasComparison` | — | 含 "Comparison / vs" | 命中 → **+1** |
| `hasQuality` | — | 含 "Quality / Checklist" | 命中 → **+1** |

### 2.4.4 评分与触发（0–7 分）

```
总分 = 字数(0/0.5/1) + FAQ(0/0.5/1) + When(0/1) + HowTo(0/1) + Comparison(0/1) + Quality(0/1) + Headings(0/1)

PASS（绿，可发布）    : score ≥ 5.0
WARN（黄，阻断部署）  : 3.0 ≤ score < 5.0   → exit code 1
FAIL（红，阻断部署）  : score < 3.0         → exit code 1
```

> 注：WARN/FAIL 均使 `geo-audit-content.mjs` 以 exit 1 退出，作为 CI / 发布门禁。这与博客门禁（`correction-guards.blog.mjs`）策略一致——"狼来了"问题通过**达标率随时间提升**解决，而非放宽阈值。

### 2.4.5 各场景合理数值范围

| 场景 | 推荐词数 | 推荐 Headings | 推荐 FAQ | 说明 |
|------|---------|--------------|---------|------|
| 高 Citation 核心对（epub/pdf/mobi） | 900–1300 | 10–13 | 7–14 | 已达标，维持 |
| Phase 2 改造页（azw3/pdf/doc/lit/zip/html/cbr） | 530–820 | 8 | 6–7 | 已达 PASS；词数偏下限可后续扩充至 800+ |
| 薄模板长尾对（azw/rtf/doc/chm/rtf） | 目标 ≥600 | 目标 ≥8 | 目标 ≥6 | 当前 FAIL，需补齐 When/HowTo/Comparison/Quality 四章 |
| ES 翻译镜像 | 不计入 | 不计入 | 不计入 | 审计仅统计 EN 正文，ES 为翻译镜像，避免双重计数虚高 |

### 2.4.6 关键修正（红队审计发现，必须写进门禁防回归）

1. **ES 双重计数**：旧审计把 `export const es = {...}` 翻译镜像计入英文指标，虚高分数 → 已加 `enOnly()` 在 `indexOf('export const es =')` 处截断。
2. **单引号正文漏计**：旧正则 `/body:\s*\`([^\`]+)\`/g` 仅匹配反引号模板串；5 个文件用单引号 `body:'...'`（azw3-to-epub, epub-to-azw3, epub-to-zip, txt-to-epub, docx-to-epub）被整段漏计（docx-to-epub 显示 0 词）→ 已补单引号正则 `/body:\s*'((?:[^'\\]|\\.)*)'\s*}/g`。
3. **2000 词不可达**：见 §2.4.2 → 已下调至 1000/600（§2.4.3）。
4. **对比表缺表头**：`lit-to-epub`、`azw3-to-pdf` 原对比表首行为 `|---------|------|-----|`（分隔线误作首行），无列名 → 已重写为 `| Feature | X | Y |` 规范表头。

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
