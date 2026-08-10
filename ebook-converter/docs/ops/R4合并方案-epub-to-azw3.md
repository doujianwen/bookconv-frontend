# R4 合并方案：Kindle 子簇 EPUB→AZW3 内耗治理

> 状态：✅ 已执行（2026-08-11）
> 关联：`docs/ops/mobi-epub整簇意图分布总览.md` §R4（Kindle 子簇 6 页过饱和）

---

## 1. 问题确认（R4 内耗）

Kindle 子簇 6 页，其中两页抢同一意图：

| 页面 | 类型 | 意图 |
|---|---|---|
| `/blog/epub-to-azw3` | 博客 | EPUB→AZW3 工具/步骤 |
| `/guide/epub-to-azw3-for-kindle` | 指南 | EPUB→AZW3 保全排版 + Calibre 工作流 |

**内耗证据**：
- 两页均含"Convert with BookConv"段（3 步速转）→ 意图高度重叠
- `guide/epub-to-azw3-for-kindle` 自身互链败者（`[/blog/epub-to-azw3](/blog/epub-to-azw3)`）→ 循环链 + 权重分散
- 胜者（guide）已含 Calibre 桌面工作流独有资产，败者（blog）无

---

## 2. 胜者判定 = `/guide/epub-to-azw3-for-kindle`

数据支撑：
1. **内容更完整**：5 段 + 6 FAQ，含 Calibre 桌面工作流独有段
2. **已互链败者**（de-facto hub 信号）
3. **注册最早**（2026-08-02）

---

## 3. 败者命运

| 败者 | 301 目标 | 备注 |
|---|---|---|
| `/blog/epub-to-azw3` | `/guide/epub-to-azw3-for-kindle` | 无 ES；归档到 `_archived/` |

---

## 4. 独有资产合并（只并败者独有、胜者缺的内容）

败者独有 3 段 + 7 FAQ：

### A. "What Is AZW3?" 段
定义段，说明 AZW3/KF8 是 Amazon 2011 年的格式，支持 CSS3、字体嵌入、复杂布局。

### B. "Will My Formatting Survive?" 段
排版保全说明：字体、间距、图片、布局均保留；复杂布局需微调。

### C. "When to Use AZW3 (and When Not To)" 段
适用场景：Kindle 用户、关注排版、不愿上传 Amazon；不适用：Kobo/Apple Books 用户（保持 EPUB）。

### D. "Key Takeaways" 段
6 条要点总结。

### E. FAQ 补充
败者有 7 FAQ（胜者 6 FAQ），其中 "Do I need AZW3, or can I just use Send to Kindle?" 有独立价值（胜者 FAQ 已覆盖此意图，不重复并入）。

**最终决策**：并入 A/B/C/D 四段（EN），FAQ 不重复并入（胜者已覆盖）。

---

## 5. 注册 / llms / middleware / 内链 改动清单

### 5.1 内链修复
- `src/data/guides/epub-to-azw3-for-kindle.ts` line 35：
  `[our EPUB to AZW3 blog post](/blog/epub-to-azw3)` → 纯文本（去链，避免循环）

### 5.2 移除败者注册
- `src/data/blog/index.ts`：删 `import * as post17 from "./epub-to-azw3"` + 从 `posts` 数组移除 `post17`；更新注释。

### 5.3 `public/llms.txt`
- 删 line 56：`[EPUB to AZW3: Get Your Ebooks Onto Kindle Natively](…/blog/epub-to-azw3)`
- 保留 line 84（胜者 guide）

### 5.4 `src/middleware.ts`
- `BLOG_REDIRECTS` 加一行：
  ```ts
  '/blog/epub-to-azw3': '/guide/epub-to-azw3-for-kindle',
  ```

### 5.5 归档（非删除）
```bash
cd E:/一人公司/电子书格式转换站
git mv ebook-converter/src/data/blog/epub-to-azw3.ts ebook-converter/src/data/_archived/epub-to-azw3.ts
```

---

## 6. 内容合并字段级（胜者 `epub-to-azw3-for-kindle.ts`）

### 6A — 插入败者独有段（EN）
在胜者 sections 末尾追加：

```ts
{
  heading: 'What Is AZW3?',
  body: `AZW3 — also called Kindle Format 8 or KF8 — is Amazon's premium ebook format, released in 2011 as the successor to MOBI. It supports CSS3, font embedding, and complex layouts, and it's the default format on Paperwhite, Oasis, and Voyage devices. If you want an ebook that feels native on a Kindle rather than translated in the cloud, AZW3 is the target. For a deeper comparison with MOBI (and why KFX belongs to the Store), see [AZW3 vs MOBI](/blog/azw3-vs-mobi).`,
},
{
  heading: 'Will My Formatting Survive?',
  body: `Almost all of it. Fonts, spacing, images, and layout carry over because AZW3 speaks the same modern CSS the EPUB used. Complex or unusual layouts may need minor tweaks, but a standard novel converts cleanly. The full format picture is in [our ebook formats guide](/blog/ebook-formats-explained), and the Kindle-specific trade-offs are in [our AZW3 vs MOBI comparison](/blog/azw3-vs-mobi).`,
},
{
  heading: 'When to Use AZW3 (and When Not To)',
  body: `Reach for AZW3 when you're a Kindle owner who wants a native file, cares about typography, or prefers not to upload to Amazon. Skip it when you read on non-Kindle devices — Kobo, Apple Books, and most apps don't read AZW3, and for those you should keep the EPUB. AZW3 is an Amazon format; EPUB is the everywhere format. For the raw XHTML, CSS, and images behind any EPUB, [convert EPUB to ZIP](/convert/epub-to-zip) lets you inspect or rebuild them directly.`,
},
{
  heading: 'Key Takeaways',
  body: `- **AZW3 is Amazon's KF8** — 2011 successor to MOBI, CSS3 + font embedding.
- **Native on Kindle** — Paperwhite, Oasis, Voyage.
- **Beats Send to Kindle** on privacy, speed, typography control.
- **Formatting survives** — fonts, images, layout carry over.
- **DRM-free output** — you own the file.
- **Not for non-Kindle** — keep EPUB for Kobo and Apple Books.`,
},
```

---

## 7. 验收标准

- 败者 `/blog/epub-to-azw3` 在 GSC 显示 301
- 胜者 `epub-to-azw3-for-kindle` 内容更丰富（5段→9段），权重集中
- seo-critic 0/0

---

## 8. 执行记录

- **执行日期**：2026-08-11
- **Commit**：`[待填入]`
- **门禁**：seo-critic 0/0（博文 32 篇、转换 30 条）；`next build --webpack` 通过
- **归档**：`_archived/epub-to-azw3.ts`
- **301 目标**：`/guide/epub-to-azw3-for-kindle`
