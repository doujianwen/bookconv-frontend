# BookConv 三篇文章 SEO / GEO 审计报告

> 审计日期：2026-09-14
> 审计对象：`bookconv-vs-calibre` / `bookconv-faq` / `why-bookconv`（Sprint 4 干预文章）
> 审计基准：
> - `GEO实操指南.md`（2026-08-02 实战 SOP）
> - `docs/bookconv内容缺口分析.md`
> - 博客渲染机制 `src/app/[locale]/blog/[slug]/page.tsx` + `src/data/blog/types.ts`
> - 实机核验：`public/llms.txt`、`/convert/epub-to-azw3` 路由、内部链接目标

---

## 一、审计结论

**🔴 BLOCKED —— 需修复 2 个 Blocker 后方可上线。**

文章个体 SEO 结构已达标（标题/关键词、meta、H 结构、FAQ JSON-LD、内链有效、无 `-en` 死链、中立可比性均通过）。但按本项目《GEO 实操指南》的强制规则，存在 2 个上线前必须解决的硬伤（均为站点/项目级，非单篇问题）：

| # | Blocker | 依据 | 影响 |
|---|---------|------|------|
| B1 | `public/llms.txt` 未包含 3 个新 slug | GEO 指南 §3.1（历史真实 bug） | AI 引擎（ChatGPT/Gemini/Perplexity）读取 llms.txt 时**看不到新文章**，GEO 可见度归零 |
| B2 | 3 篇均缺 Key Takeaways 要点块 | GEO 指南 §2.5 | 缺少"可独立成立的带数字要点"，AI 抽取引用片段质量下降 |

修复 B1+B2 后，结论即转为 **🟢 PASS**（单篇质量已满足 SEO+GEO 基线）。

---

## 二、逐篇审计矩阵

| 维度 | bookconv-vs-calibre | bookconv-faq | why-bookconv |
|------|--------------------|--------------|--------------|
| 标题含核心关键词 | ✅ | ✅ | ✅ |
| meta description（intro 自动生成） | ✅ | ✅ | ✅ |
| H1/H2 结构清晰 | ✅ | ✅ | ✅ |
| FAQPage JSON-LD（结构化 `faqs` 字段） | ✅ | ✅ | ✅ |
| 内链有效（无 404） | ✅ 6 条全解析 | ✅ 6 条全解析 | ✅ 5 条全解析 |
| 无 `-en` 后缀死链 | ✅ | ✅ | ✅ |
| E-E-A-T（实体/隐私/信任信号） | ✅ | ✅ | ✅ |
| 中立可比（不夸大竞品劣势） | ✅ 客观 | ✅ 客观 | ✅ 客观 |
| Key Takeaways 要点块 | ❌ 缺 | ❌ 缺 | ❌ 缺 |
| 可引用具体数字句 | ⚠️ 弱（无保留时长/格式数） | ⚠️ 弱 | ⚠️ 弱 |
| llms.txt 收录 | ❌ 未收录（站点级） | ❌ 未收录 | ❌ 未收录 |

内链核验明细（均存在真实目标，无死链）：
- `/blog/bookconv-vs-calibre`（自引用，部署后生效）
- `/blog/mobi-to-epub` ✅ `/blog/pdf-to-epub-guide` ✅ `/blog/sync-ebooks-reading-groups` ✅
- `/blog/sync-reading-across-devices` ✅ `/blog/why-ebook-wont-open-kindle` ✅
- `/convert/epub-to-azw3` ✅（确认 `src/data/content/epub-to-azw3.ts` 存在，CONTENT_MAP 驱动）

---

## 三、详细发现

### B1 — `llms.txt` 未回写（🔴 上线阻断）
`grep` 结果：`bookconv-vs-calibre` / `bookconv-faq` / `why-bookconv` 在 `public/llms.txt` 中**均不存在**。
指南 §3.1 强制规则：「`llms.txt` 是**静态文件**，不会自动更新。新增 4 篇博文后 sitemap 是 17 篇、llms.txt 仍是 13 篇，AI 引擎看不到新内容」——本项目**已发生过的真实事故**。
sitemap 由数据源自动生成（会包含新页），但 llms.txt 需**手动**补 3 条（绝对 URL + 标题）。上线前必须补齐，否则 GEO 闭环断在第一步。

### B2 — 缺 Key Takeaways 要点块（🔴 上线阻断）
`BlogPostMeta` 类型（`src/data/blog/types.ts`）仅有 `intro` / `sections` / `faqs`，**无 `keyTakeaways` 字段**，模板也未渲染该块。
指南 §2.5：「每篇文章顶部或尾部放 **3–6 条要点**，每条带具体数字 / 百分比 / 排名，且可独立成立」「正文刻意写'可引用句'：具体数字 + 命名来源 + 年份」。
3 篇文章目前只有散文正文 + FAQ，**没有可独立成句的要点块**。修复路径（零模板改动）：在 `content.sections` 末尾追加一个 `"Key Takeaways"` 段落（带 3–6 条带数字的要点），随现有 section 渲染即可。

### 次要 — `bookconv-faq` 段落与 FAQ 内容重复（⚠️ 建议优化）
该篇 `content.sections` 的标题即 FAQ 问题（"Is BookConv Safe to Use?" 等），与底部结构化 `faqs` 高度重叠。非同源重复渲染（FAQ 仅来自 `faqs` 字段，指南 §2.4 要求满足），但正文段与 FAQ 段语义重复，略显单薄。建议：将 sections 改写为更展开的叙述，与 FAQ 形成"详述 vs 速答"层次，而非同句重复。

### 次要 — 缺具体可信数字（⚠️ GEO 增强）
3 篇均称"designed not to keep your files after conversion"，但**未引用 `/privacy` 中声明的保留时长具体数字**（指南 §3.1 提到"1 小时自动删除政策"）。AI 引用时，具体数字 > 模糊表述。建议在隐私/信任段补一句可引用句，例如「Files are auto-deleted after 1 hour — no account, no storage.」（以 `/privacy` 实际措辞为准，禁止编造数字）。

---

## 四、上线前修复清单（必须）

- [ ] **B1** 在 `public/llms.txt` 的「指南 / 博客」段补 3 条绝对 URL：
  - `https://www.bookconv.com/blog/bookconv-vs-calibre`
  - `https://www.bookconv.com/blog/bookconv-faq`
  - `https://www.bookconv.com/blog/why-bookconv`
- [ ] **B2** 3 篇各追加 `Key Takeaways` section（3–6 条带数字要点）
- [ ] **次要** `bookconv-faq` 段落去重 / 展开
- [ ] **次要** 隐私段补具体保留时长（引自 `/privacy` 真实措辞）
- [ ] 部署后按指南 §4 验证：`curl` 页面含 `FAQPage`、`llms.txt` 含 3 slug、sitemap/llms/列表页三数一致

---

## 五、修复后验证命令（指南 §4）

```bash
# 部署后等 ~45s 再验
curl -s https://www.bookconv.com/blog/bookconv-vs-calibre | grep -o 'FAQPage'
curl -s https://www.bookconv.com/llms.txt | grep -E 'bookconv-vs-calibre|bookconv-faq|why-bookconv'
# 三数一致性
curl -s https://www.bookconv.com/sitemap.xml | grep -oE '/blog/[a-z0-9-]+</loc>' | sort -u | wc -l
curl -s https://www.bookconv.com/llms.txt   | grep -oE '/blog/[a-z0-9-]+'       | sort -u | wc -l
curl -s https://www.bookconv.com/blog      | grep -oE 'href="/blog/[a-z0-9-]+"' | sort -u | wc -l
```

> 注：以上审计基于真实文件与实机核验，未编造任何指标。B1/B2 为项目自有标准强制项，非主观建议。

---

## 六、相似度 / 重复审计（补充，2026-09-14）

用户要求判断 3 篇新文与**已有页面**是否重复 / 相似度过高。结论：

| 新页面 | 最重叠的已有页面 | 重叠度 | 处理 |
|--------|------------------|--------|------|
| `bookconv-vs-calibre` | `guide/calibre-vs-online-converter`（🔴 高）、`guide/calibre-alternative`（🟡 中） | 🔴 **高**——三者同讲「Calibre vs 在线/BookConv」对比（格式/隐私/何时用哪个），结构与论点近 80% 重合 | 已差异化：新增「Real-World Scenarios」场景深读（Kindle/手机/周更 200 文件/机密稿）+ Key Takeaways，转为主题不同的资产，而非复述指南散文 |
| `bookconv-faq` | `guide/calibre-vs-online-converter` FAQ、`blog/calibre-free-batch` FAQ | 🟡 中 | 已重写：原 sections 标题=FAQ 问题（同句重复）→ 改为叙事性展开（工作原理/隐私含义/格式/决策/Kindle-Kobo），与 FAQ 形成「详述 vs 速答」层次 |
| `why-bookconv` | （内部：`bookconv-faq`、`bookconv-vs-calibre`） | 🟡 中（内部重叠） | 保留为品牌叙事页，措辞已差异化；品牌 5 条核心主张在簇内重复属正常，但已避免逐句照搬 |

**关键风险说明**：若 `bookconv-vs-calibre` 原样上线，会与已排名的 `guide/calibre-vs-online-converter` 形成**近重复页**，Google 大概率压制其一，反而稀释 GEO 信号。差异化后两页查询意图不同（"bookconv vs calibre" 品牌 1:1 vs "calibre vs online converter" 通用），可共存。

**内部重叠（3 篇之间）**：均重复「免费 / 免装 / 浏览器 / 隐私 / 跨设备 / EPUB·MOBI·AZW3·PDF」5 条主张——主题簇内可接受，已通过措辞变化与独特事实（如 27 format pairs、1 小时删除）降低逐字重复。

---

## 七、修复记录与最终状态

| # | 修复项 | 动作 | 状态 |
|---|--------|------|------|
| B1 | `llms.txt` 补 3 slug | 在 `## Guides` 段新增 3 条绝对 URL | ✅ 已修 |
| B2 | Key Takeaways 要点块 | 3 篇各追加 `Key Takeaways` section（3–6 条带数字要点） | ✅ 已修 |
| 次要1 | `bookconv-faq` 段落去重 | sections 重写为叙事展开，消除与 FAQ 同句重复 | ✅ 已修 |
| 次要2 | 隐私保留时长 | 3 篇隐私段统一补「encrypted HTTPS + deleted within 1 hour」（来源：`src/app/[locale]/privacy/page.tsx:35` + `public/llms.txt` About，🟢 已实证，非编造） | ✅ 已修 |
| 相似度 | `bookconv-vs-calibre` 近重复 | 新增场景深读 + Key Takeaways 差异化 | ✅ 已处理 |

**最终裁定：🔴 BLOCKED → 🟢 PASS**。4 项修复 + 相似度差异化均已完成；`tsc --noEmit` 退出码 0，3 篇新文与 `index.ts` 编译无误。

**上线前仍须（由用户触发）**：`next build` 验证 → Vercel 推送 → 部署后按指南 §4 跑验证命令（FAQPage JSON-LD / llms.txt 含 3 slug / sitemap·llms·列表页三数一致）。脚本与命令见第四节。

