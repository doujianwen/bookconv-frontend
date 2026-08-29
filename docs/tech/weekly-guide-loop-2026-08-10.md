# Weekly Guide Loop — 下一周执行 SOP（2026-08-10 起）

> 适用：bookconv.com 的常态增长运营（找词 → 建页 → 验证 + 外链）
> 编制：2026-08-09 基于 `今日复盘-2026-08-09.md` + `geo/长尾内容生产规划-2026-08-09.md` + 记忆 6.1 外链约定
> 上一版：`docs/weekly-guide-loop.md`（2026-08-02，绿field 模式），本版据本周复盘**升级为双轨 + 外链优先**

---

## 0. 本周复盘关键结论（驱动本 SOP）

1. **规模已不是瓶颈**：87 页（36 博客 + 21 指南 + 30 转换）已就位。
2. **0 点击根因 = 域名权威**：GSC 90 天 66 词 / 148 展示 / 0 点击 / 位置 ~60。`geo/长尾内容生产规划` §1：位置 60-80 靠**外链**而非页面。→ **本周杠杆：外链 > 新页面**。
3. **最大单页杠杆**：`/convert/mobi-to-epub` 单簇 61 展示（位置 ~69），深化它 ROI 最高。
4. **外链铁律（记忆 6.1）**：首页优先；首页外链未收尾前，内页外链暂不内推。
5. **GSC 复测纪律**：accrual ≥10 展示后再判趋势，勿对 1-2 次展示妄下结论。
6. **下一步重点**（今日复盘 §五）：① 首页外链 ② 国际多语言矩阵（西语优先）③ GSC 复测 ④ Upstash/Pro E2E。

---

## 1. 四步闭环总览（本周节奏）

```
[Step 1 找词] → [Step 2 建页] → [Step 3 门禁] → [Step 4 验证]
  周一           周二~周四        提交前          推送后 ~90s + 2~4 周 GSC
  外链并行：首页优先，持续进行（见 §5 / docs/外链提交报告_20260809.md）
```

> ⚠️ 与 08-02 版差异：本版**默认双轨**（A 深化老页 / B 建验证过缺口页），且**外链作为独立一等公民**纳入每周节奏。

---

## 2. Step 1 — 找词（周一，~30min）

### 种子源（按优先级）
1. `geo/关键词URL排名追踪表-2026-08-09.md`（真实展示/位置，定 A 轨目标）
2. `geo/GSC长尾词全景-2026-08-08.md` + `geo/用户意图作战映射表.md`（GSC 验证过的真实缺口 → B 轨）
3. `src/lib/conversion-map.ts`（确保新 `/convert/*` 有真实后端能力，防软 404）
4. `竞品外链分析与推广计划.md` §2.1 高机会词（KD=0 蓝海，仅作补充）

### 双轨判定（不再盲目铺新页）
- **A 轨（默认优先）**：吃已有展示的页面做深化（不新建）。`geo/长尾内容生产规划` §2 已排好 A0–A4。
- **B 轨（仅 GSC 验证过的缺口）**：建前**必须先验后端真能转**（本项目已吃过硬 404 亏）。见 §3 批次。

### 筛选评分（沿用）
| 维度 | 权重 | 标准 |
|------|------|------|
| 展示量/位置 | 3 | GSC 实测展示越高越优先（A 轨）；B 轨看缺口确定性 |
| 后端可行性 | 3 | CONVERSION_MAP 有对应能力（否则 0 分，禁建） |
| 内链生态 | 2 | 已有相关博客/指南可互链 |
| 意图纯度 | 2 | 单一明确意图 |

---

## 3. Step 2 — 建页（周二~周四）

### 单一数据源（不变）
新建 `src/data/guides/{slug}.ts` 或博客 `src/data/blog/{slug}.ts`，必含字段（指南见 `src/data/guides/mobi-to-epub-keep-formatting.ts` 模式）：
```ts
export const slug = '{slug}'
export const title = '...'
export const problem = '...'        // 首屏痛点 hook
export const date = 'YYYY-MM-DD'
export const tags = [...]
export const formats = { source: 'x', target: 'y' }  // 有则 CTA /convert/x-to-y
export const keyTakeaways = [4 条]
export const content = { intro: '...', sections: [ 5 个 { heading, body } ] }
export const faqs: BlogFaq[] = [ 6 个 { question, answer } ]
```

### 硬规则（用户 + 已验证坑）
- ✅ **正文全部英文**（用户硬约束，博客与指南同）
- ❌ **禁用反引号**（renderMarkdownToHtml 不支持 inline code）
- CTA：有 `formats` → `/convert/{source}-to-{target}`；无 → `/convert`
- ⚠️ **CTA 必须带 `to`**（`lit-to-epub` 非 `lit-epub`，漏 to → `target=undefined` → 500）
- 内链走 `src/lib/internal-links.ts` helper，不手写 URL
- B 轨新 `/convert/*` 页：**建前先用 `conversion-verifier`/实测确认能转**，再建（防软 404）

### 注册 + 同步（缺一不可，否则 seo-critic CRITICAL）
1. `src/data/guides/index.ts` 或 `src/data/blog/index.ts`：import + 入 `all`/`posts`
2. `public/llms.txt`：
   - 指南 → `## Troubleshooting Guides` 段条数 **= `getAllGuides().length`**
   - 博客 → 保持与 `getAllPosts()` 一致（seo-critic 校验）
3. 西语：若新增内容要进 `/es`，确认 `messages/es.json` 同步（西语回退英文，无 es 字段不报错）

### 本周推荐执行序（来自长尾内容生产规划 §5）
- **先 A 轨**：A0 `/convert/mobi-to-epub`（61 展示，加对比表/DRM/迁移场景/批量入口/隐私段）→ A1/A2/A3/A4。
- **再 B 批次 1**（纯内容页，最安全）：B1 `/blog/mobi-to-kobo`、B2 `/blog/epub-vs-mobi`、B3 `/blog/batch-converter`。
- **B 批次 2 暂缓**：`zip-to-epub`/`lit-to-mobi`/`azw-to-mobi`/`chm-to-mobi` 须后端验证后再定（azw-to-mobi 展示最高但 AZW 风险最大）。

---

## 4. Step 3 — 门禁（提交前必跑）
```bash
node scripts/seo-critic.mjs     # 须 0 critical / 0 warn
node_modules/.bin/tsc --noEmit  # 须 0 类型错误
```
> ⚠️ 本地 Windows `next build --webpack` 可能环境性崩溃（worker 0xC0000409），与代码无关；Vercel/Linux 为构建真源，以线上 curl 为准。

---

## 5. Step 4 — 验证（push 后 ~90s + GSC 复测）

推送：`git push origin main`（Vercel 自动部署，~40-90s）。

### 5.1 部署即验（curl，剥离 `<script>` 后断言）
| 检查项 | 期望 |
|--------|------|
| 新 `/guide|/blog|/convert/{slug}` 状态码 | 200 |
| canonical 数量 | **1**（只靠 generateMetadata，根 layout 不得手写） |
| 指南 FAQPage JSON-LD | 出现，Question = 6 |
| CTA `/convert/*`（带 to） | 200（无悬空） |
| `sitemap.xml` | 含新 slug（en + es） |
| `llms.txt` | 对应段 +1 |

### 5.2 外链部分（独立节奏，见专文）
- **本周外链只指向首页**，见 `docs/外链提交报告_20260809.md`。
- 记忆 6.1：首页外链收尾前，内页外链暂不内推；A 轨页面内容可深化，但外链动作只服务首页权威。

### 5.3 GSC 复测纪律
- 不凭 1-2 次展示判趋势；**accrual ≥10 展示**后再分析位置变化。
- 外链效果看**域名权威指标**（引荐域名数 / DR）+ 2-4 周后 GSC 位置，非当日点击。

---

## 6. 提交纪律（不变）
- 只 `git add` 相关文件（数据 + index + llms.txt + 可能的 messages/es.json），**严禁 `git add -A`**（仓库根有兄弟垃圾文件 `f2148*.txt`/`sitemap-urls.txt`/`gefei_articles.json` 等，非本项目）。
- 提交信息：`feat(guides|blog): add Px ...` / `fix(convert): ...`
- 推送走 HTTPS + Git Credential Manager（SSH 22 已关）。

---

## 7. 本周候选词池（滚动，已核准）

**A 轨（深化，不新建）** — 来自 `geo/长尾内容生产规划` §2：
| 目标页 | 展示 | 位置 | 动作 |
|--------|-----:|-----:|------|
| /convert/mobi-to-epub | 61 | 68.9 | A0 加对比表/DRM/迁移/批量/隐私 |
| /convert/epub-to-txt | 10 | 72.0 | A1 纯 JS 极速/隐私差异点 |
| /convert/epub-to-mobi | 13 | 70.6 | A2 H1 显式命中 "online" |
| /convert/azw3-to-mobi | 6 | 42.8 | A3 场景 FAQ/Kindle 迁移 |
| /es/convert/mobi-to-epub | 4 | ~66 | A4 西语长尾段 |

**B 轨批次 1（新建，纯内容最安全）**：
`/blog/mobi-to-kobo`、`/blog/epub-vs-mobi`、`/blog/batch-converter`

**B 轨批次 2（建前必验后端）**：
`/convert/lit-to-mobi`(低风)、`/convert/azw-to-mobi`(高展示高风险)、`/convert/chm-to-mobi`(依赖 CloudConvert)、`/convert/zip-to-epub`(需代码路径)

---

## 8. 外链（专文）
- **本周外链策略与执行计划**：`docs/外链提交报告_20260809.md`
- 铁律：首页优先；首页外链未收尾前内页外链暂不内推；外链 = 长期资源，只做真实贡献型露出（reddit/quora/askubuntu/linuxmint 等论坛弱域）。

---

## 9. 待办衔接（来自今日复盘 §四/§五）
| 项 | 状态 | 与 loop 关系 |
|----|------|------------|
| #4 用户存储持久化（storage.ts 内存 Map） | ⏸ 大重构 | 不在 loop，独立排期 |
| #5 Pro 链路 E2E（需设 `REDIS_URL`/Upstash） | ⏸ 待设环境变量 | 不在 loop，但影响付费转化指标 |
| 国际多语言矩阵（西语优先） | 规划中 | 新增内容须同步 `messages/es.json`（§3） |
| GSC 复测 | 本周 | §5.3 纪律 |
