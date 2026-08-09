# bookconv.com 内容生成规范与标准

> 汇总自实战与既有文档，作为内容生产（博客 / 指南 / 转换页）的统一规范与新人上手依据。
> 最后更新：2026-08-09 | 维护：与 `英文博客写作指南.md`、`内部链接审计报告-2026-08-08.md`、`scripts/seo-critic.mjs` 同步。

## 权威来源

| 主题 | 来源 |
|---|---|
| 写作 / SEO / GEO / De-AI | `英文博客写作指南.md`（v1.0） |
| 内链规则 v1（16 条） | `内部链接审计报告-2026-08-08.md` + `src/lib/internal-links.ts` |
| 提交门禁 | `scripts/seo-critic.mjs` + `scripts/code-critic.mjs` |
| 渲染能力 | `src/data/blog/types.ts`（博客）/ `src/app/[locale]/convert/[slug]/ToolPageClient.tsx`（转换页） |

---

## 一、内容体系架构（单一数据源）

三套同构子系统，列表 / sitemap / RSS 全部自动派生，**新增内容只在一处登记**：

| 子系统 | 数据目录 | 注册入口 | 详情页 | 现状规模 |
|---|---|---|---|---|
| 博客 Blog | `src/data/blog/*.ts` | `posts[]` | `[locale]/blog/[slug]` | 36 |
| 指南 Guide | `src/data/guides/*.ts` | `all[]` | `[locale]/guide/[slug]` | 21 |
| 转换页 Convert | `src/data/content/*.ts` | `CONVERSION_MAP` | `[locale]/convert/[slug]` | 30 |

- 全局导航在根 `src/app/layout.tsx`（Home / Pricing / **Convert** / **Guide** / Blog + LocaleSwitcher / LoginButton）；首页也须有 `/blog`、`/guide` 入口。
- 规模快照（2026-08-09）：36 博客 + 21 指南 + 30 转换 = 87 内容页。

## 二、内容策略基线

- **一页一词长尾，小词先行**；建新页前**先验后端真能转**（防软 404 幽灵页）。
- 缺口词合计展示很小时**不铺新页**，优先深化已收录页 + 外链（位置 60–80 是域名权威问题，页面优化天花板约 30–40，上首页靠外链）。

## 三、写作规范（正文）

- **全英文**（硬约束）；正文约定**不使用反引号**（保持纯散文，强调用 `**加粗**`）。
- **内链用真实 slug**，绝不手写死链。
- 每篇**唯一 H1**，H1→H2→H3 不跳级。
- **Key Takeaways** 必备（3–6 条可抽取要点，GEO 友好）。
- **FAQ 用结构化 `faqs` 字段**（`BlogFaq` 类型）→ 自动发射 `FAQPage` JSON-LD；**正文 `sections` 勿放散文 FAQ 段**。
- **渲染器能力**（已核验）：博客与转换页**均支持** 加粗 / 斜体 / 内联代码 / 链接 / H2–H3 / 列表 / **表格**；**均不支持围栏代码块**。
- **可引用性（GEO）**：具体数字 + 命名来源（研究 / 组织 / 专家）+ 日期；实体要具名（如 "ISBN""FDA""Calibre"）。
- **De-AI 化**（发布前必过）：删 `leverage / utilize / delve / landscape / realm / facilitate / robust / comprehensive / cutting-edge / game-changer / navigate` 及 "in today's world""it is important to note" 等套话；句式 / 段落长短交错；加缩略、破折号、反问；读出来像人话。

## 四、内链规范（必须走 helper，禁止手写 URL）

全部内链经 `src/lib/internal-links.ts` 的 helper，保证 slug 真实、相关性打分、防稀释：

| 场景 | 调用 |
|---|---|
| 博客互链 | `getRelatedPosts(slug, 3)` |
| 转换页 → 博客 | `getRelatedBlogPostsForConversion(src, tgt, 3)` |
| 转换页 → 指南 | `getRelatedGuidesForConversion(src, tgt, 3)` |
| 博客 → 指南 | `getRelatedGuidesForBlogPost(slug, 3)` |
| 指南 → 博客 | `getRelatedBlogPostsForGuide(formats, tags, 3)` |
| 指南互链 | `getRelatedGuides(slug, 5)`（限 Top5，防 R15 稀释） |

- **三角闭环**：博客 ↔ 指南 ↔ 转换 互链；dev / infra 帖（`sitemap-seo-guide` 等）不进"相关指南"。
- 锚文本 0 条通用词（R6 达标）。

## 五、SEO / 技术规范

- 规范域名 `www.bookconv.com`；GSC 用网域属性 `sc-domain:bookconv.com`。
- **canonical**：`locale === 'es' ? '/es' : ''`，**禁** `${'/' + locale}`；只由页级 `generateMetadata` 输出，根 layout 不写。
- **标题模板**自动追 `| BookConv`；per-page title **不自带后缀**；改完 `curl` 验 `<title>`。
- **localePrefix as-needed**：英文无前缀，西语 `/es`；中间件把 `/en/*` 301 回无前缀 → **hreflang / canonical / alternates 绝不硬编码 `/en`**（历史事故）。
- 首页 = `[locale]/page.tsx`，**无**根 `src/app/page.tsx`；`src/app/**` 路由目录**禁放 `.mdx`**（500）。
- sitemap 自动派生；`public/llms.txt` 手写 → 每次新增做「sitemap / llms.txt / 列表页」**三数一致**校验。

## 六、GEO 规范

- `public/llms.txt` **全量**：博客数 == 注册博文数；转换数 == `CONVERSION_MAP`；指南数 == `getAllGuides()`。
- `robots.txt` 放行 `GPTBot / ClaudeBot / CCBot` 等 AI 爬虫。
- 博文 `faqs` 发 `FAQPage` JSON-LD；实体结构化数据补 `Organization.areaServed / availableLanguage` 与 `WebSite.inLanguage`。
- Key Takeaways + FAQ 为**必含块**（GEO 抽取核心）。

## 七、注册与同步铁律

- 新增指南三步：写数据 → `index.ts` 注册 → `public/llms.txt` 的 Guides 条数须等于 `getAllGuides()`。
- 新增博客 / 转换同理走 `index.ts`，且 `llms.txt` 同步；`seo-critic.mjs` 会拦"注册未收敛 / llms.txt 失同步"。

## 八、i18n 规范

- 双语走 **next-intl v4**：server 用 `getTranslations`、client 用 `useTranslations`；`messages/en.json` 与 `es.json` **同步加同名键**（缺译 seo-critic 报 warn）。
- 博客西语用 `BlogPostLocalized.es` 字段；UI 文案一律走 messages，不硬编码。

## 九、CTA URL 铁律

- 写 **`/convert/{src}-to-{tgt}`**（带 `to`），**不是** `CONVERSION_MAP` 键 `{src}-{tgt}`；漏 `to` → 500。

## 十、质量门禁（提交前必跑）

- `node scripts/seo-critic.mjs`：**退出码 1 = 门禁失败**。查：博文 / 指南注册收敛、llms.txt 同步、内部死链、ES 键对齐、hreflang 误指 `/en`。
- `node scripts/code-critic.mjs`：dup-block / stray-root / app 目录 `.mdx`(CRITICAL) / 杂散脚本。
- `tsc --noEmit` 0 错 + `next build --webpack`（Windows 必须 `--webpack`；遇 safe-delete shim 拦删用 `NODE_OPTIONS="--use-system-ca" npx next build --webpack`）。
- 部署后 `curl` 验关键页（含 `<title>`、canonical）。

## 十一、已踩坑 / 禁区

- 幽灵页 soft-404（已从 `CONVERSION_MAP` 派生 + `dynamicParams=false` + `notFound()` 修）；`/api/health` 碰 Redis 超时属已知噪声。
- 死配置 `next-sitemap.config.js`（无依赖无 postbuild，sitemap 由 `sitemap.ts` 驱动，可清）。
- 文件大小文案须对齐 **10 / 50 / 100**（free 10 / Pro 50 / API 100），不得与后端实际限额（`MAX_FILE_SIZE=10MB`）矛盾的未证实宣称。
- **Next.js 有 breaking changes**（AGENTS.md）：写码前先读 `node_modules/next/dist/docs/`。

---

## 附：新人自检清单

**写之前**
- [ ] 关键词 / 意图 / 竞品已确认；后端确能转（转换页）
- [ ] 已规划内链（blog ↔ guide ↔ convert 三角）与 `faqs`（FAQPage JSON-LD）
- [ ] 已规划 Key Takeaways 与 5–7 条 FAQ

**写之中**
- [ ] 全英文、无反引号；唯一 H1、不跳级
- [ ] 内链走 `internal-links.ts` helper（不手写 URL）
- [ ] CTA 用 `/convert/{src}-to-{tgt}`
- [ ] De-AI 化：删套话、长短交错、像人话

**发布之前**
- [ ] 数据注册进 `index.ts`；`llms.txt` 三数一致
- [ ] `messages/en.json` 与 `es.json` 同键（如涉 UI 文案）
- [ ] `node scripts/seo-critic.mjs` 退出码 0；`node scripts/code-critic.mjs` 无 CRITICAL
- [ ] `tsc --noEmit` + `next build --webpack` 通过
- [ ] 部署后 `curl` 验 `<title>` / canonical / 关键断言
