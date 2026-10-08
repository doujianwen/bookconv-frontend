# Index Coverage 数据缺口（INDEX_COVERAGE_GAP）

> 阶段：**DESIGN ONLY** · 不修改任何页面
> 目的：定义「U1 未知项」需要从 Google Search Console 取哪些数据，以及在取到之前**哪些判断不能做**。

## 一、当前状态：U1 仍是 UNKNOWN

| 项 | 值 |
|---|---|
| Convert 页总数 | 31 |
| Convert 零曝光页 | 18 |
| 这些页**是否被收录** | **UNKNOWN** |
| 原因 | GSC Search Analytics 只记录「被展示过」，不记录「被收录」 |

🔴 **不得做的推断**：「零曝光」≠「未收录」。至少三种成因在现有数据中表现完全相同：

| # | 成因 | 如何区分 |
|---|---|---|
| 1 | 未收录 / 已收录未展示 | 只有 Index Coverage 能区分 |
| 2 | 已收录但 Google 判定不值得展示 | 同上 |
| 3 | 已收录且展示，但该格式组合零搜索需求 | 需搜索量数据（U3）|

## 二、需要从 GSC 取得的 8 类状态

| # | 状态 | 含义 | 对本项目的意义 |
|---|---|---|
| Indexed | 已收录且可被检索 | 正常状态，无需动作 |
| Crawled - currently not indexed | 已抓取但未收录 | 🔴 内容被判不值得收录 → 需改内容而非等 |
| Discovered - currently not indexed | 已发现未抓取 | 🟡 内链/权重不足 → 需提权重或加内链 |
| Excluded by noindex tag | 被 noindex 排除 | 本项目未设 noindex（除 1 篇 dev 帖），若出现即为意外 |
| Duplicate without user-selected canonical | 被判重复 | 🔴 会命中 INTENT_PARTITION 的重叠簇 |
| Alternate page with proper canonical | 识别为规范页 | ✅ 正常，说明 canonical 生效 |
| Soft 404 | 软 404 | 🔴 本项目已用 dynamicParams=false 转真 404，此项应恒为 0 |
| Other error | 其他错误 | 需逐条看详情 |

### 采集方式（供实施阶段执行）

| 途径 | 说明 |
|---|---|
| GSC 网页索引报告（Indexing → Pages）| 按状态列出全部 URL 计数，最快 |
| GSC URL 检查（单条 URL Inspection）| 可查具体页状态的**原因文本**，需逐条提交 |
| Search Console API `indexing/inspection` | 批量，需 OAuth 凭据 |

⚠️ **注意**：URL Inspection API 有配额（单站点每日有限），18 个 URL 需分批。

### U1 / U2 的确切定义（不得互相替换）

| # | 编号 | 未知项 | 为什么不可判定 | 解除条件 |
|---|---|---|---|
| 1 | **U1** | 18 个零曝光 Convert 页**是否已被 Google 收录** | GSC 曝光只记录被展示过，未收录与收录但不值展示都表现为零记录 | Index Coverage 报告 |
| 2 | **U2** | 零曝光的**真因**是「未收录」/「已收录但不值得展示」/「无搜索需求」中的哪一个 | 三种成因在 Search Analytics 数据中表现完全相同 | 需 U1 + U3（搜索量）**同时**解除 |

🔴 **U1 与 U2 不可互相替代**：知道「是否收录」（U1）不能推出「为何不展示」（U2）；反之亦然。两者都必须单列。

## 三、第一批验证对象：18 个零曝光 Convert URL

| # | URL | 声明字数 | 实测 desc 长度 | Title 字数 | 优先理由 |
|---|---|---|---|---|---|
| 1 | `/convert/azw-to-mobi` | undefined | 126 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 2 | `/convert/azw3-to-pdf` | undefined | 151 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 3 | `/convert/cbr-to-pdf` | undefined | 139 | 38 | 零曝光，需确认收录状态；title 偏短（38） |
| 4 | `/convert/chm-to-mobi` | undefined | 126 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 5 | `/convert/djvu-to-pdf` | undefined | 151 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 6 | `/convert/doc-to-epub` | undefined | 150 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 7 | `/convert/epub-to-html` | undefined | 140 | 40 | 零曝光，需确认收录状态；title 偏短（40） |
| 8 | `/convert/epub-to-jpg` | undefined | 145 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 9 | `/convert/epub-to-pdf` | undefined | 149 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 10 | `/convert/epub-to-png` | undefined | 148 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 11 | `/convert/epub-to-word` | undefined | 144 | 40 | 零曝光，需确认收录状态；title 偏短（40） |
| 12 | `/convert/fb2-to-epub` | undefined | 143 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 13 | `/convert/html-to-epub` | undefined | 140 | 40 | 零曝光，需确认收录状态；title 偏短（40） |
| 14 | `/convert/lit-to-mobi` | undefined | 150 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 15 | `/convert/mobi-to-azw3` | undefined | 144 | 45 | 零曝光，需确认收录状态；title 偏短（45） |
| 16 | `/convert/mobi-to-pdf` | undefined | 148 | 39 | 零曝光，需确认收录状态；title 偏短（39） |
| 17 | `/convert/mobi-to-txt` | undefined | 155 | 21 | 零曝光，需确认收录状态；title 偏短（21） |
| 18 | `/convert/txt-to-epub` | undefined | 149 | 39 | 零曝光，需确认收录状态；title 偏短（39） |

## 四、拿到数据后的决策树

```
Crawled - currently not indexed > 0
  → 内容质量被判低 → 查 DESCRIPTION_REWRITE + 结构差异化，而非继续等

Discovered - currently not indexed > 0
  → 抓取或权重不足 → 查 sitemap 提交状态 + 内链

Duplicate without user-selected canonical > 0
  → 意图分工失败 → 回到 INTENT_PARTITION 加 canonical 区分

Indexed ≈ 全部零曝光页
  → 收录不是问题 → 根因是「Google 不愿展示」或「无搜索需求」
  → 此时 U3（搜索量）成为下一个必须解锁的 UNKNOWN
```

## 五、本阶段的限制

| 限制 | 说明 |
|---|---|
| 无法自行采集 | 需要 GSC 后台权限，本项目内无该凭据 |
| 配额限制 | URL Inspection API 需分批 |
| 不可推断 | 在拿到数据前，任何「已收录」/「未收录」的表述都是猜测 |
