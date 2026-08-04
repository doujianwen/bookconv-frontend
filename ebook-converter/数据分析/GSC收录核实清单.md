# GSC 收录核实清单（可直接粘贴进 URL Inspection）

> 生成日期：2026-08-03
> 用途：逐一确认每个转换页是否已被 Google 收录。本清单配合 `scripts/check-indexing.mjs`（自动化版）使用；手动版直接把「待核实 URL」粘进 GSC → URL 检查 → 看「Google 是否已编入索引」。
> 优化节奏（用户定调）：**新站先优化小词、小词有排名后逐步攻大词**。因此「收录核实」对全员生效（不收录就没排名），但「内容深度优化」优先级按小词先行。

规范域名：`www.bookconv.com`（非 www 会 301 跳转到 www，所以 inspect URL 必须用 `https://www.bookconv.com/convert/...`；GSC 属性建议用网域属性 `sc-domain:bookconv.com`，可同时覆盖 www/非www 两变体）

---

## 使用方法（二选一）

**A. 手动（5 分钟）**：打开 GSC → 「网址检查」→ 粘贴下面任一行 URL → 看结果 → 在「收录状态」列打勾：
- ✅ 已收录 → 无需操作
- ⚠️ 已收录但被标记问题（如被 noindex / 规范 URL 不同）→ 记录问题
- ❌ 未收录 → 点「请求编入索引」；若按钮灰掉，检查 sitemap 是否覆盖、robots 是否放行

**B. 自动（脚本）**：见 `scripts/check-indexing.mjs`，配置好服务账号凭据后一键输出 CSV。

---

## 一、内容优化 P1 早赢组（已有曝光 → 先打内容深度 + CTR，抢排名）

这组已在 GSC 有零星曝光，说明 Google 已索引且开始尝试展示。**按小词先行原则，优先把它们的内容做厚、title/meta 改差异化，争取冲进前 20 拿到首波点击。**

| # | 待核实 URL | 头部词 | 月搜索量 | GSC 现状 | 收录状态(待填) | 内容优化优先级 |
|---|---|---|---|---|---|---|
| 1 | https://www.bookconv.com/convert/mobi-to-epub | mobi to epub converter | 9,900 | 🟠 19 页曝光 / 排名~69 | ☐ 已收录 ☐ 未收录 | **P1 早赢** |
| 2 | https://www.bookconv.com/convert/epub-to-txt | epub to text converter | 3,600 | 🟠 10 页曝光 / 排名~72 | ☐ 已收录 ☐ 未收录 | **P1 早赢** |
| 3 | https://www.bookconv.com/convert/azw3-to-mobi | azw3 to mobi converter | 2,400 | 🟠 6 页曝光 / 排名~45 | ☐ 已收录 ☐ 未收录 | **P1 早赢** |

---

## 二、沉默头部大词（先核实收录，内容优化 P2 后置）

这组**零曝光**，是最大流量漏勺（合计约 8.2 万/月量级）。**全员先确认收录**——没收录就「请求索引」；已收录但沉底的，内容深度优化放到 P1 早赢组起量、站点积累一点权威后再集中推（小词先行）。下表按搜索量降序排列，方便先核实最大的 prize。

| # | 待核实 URL | 头部词 | 月搜索量 | GSC 现状 | 收录状态(待填) | 内容优化优先级 |
|---|---|---|---|---|---|---|
| 4 | https://www.bookconv.com/convert/epub-to-pdf | epub to pdf converter | 18,100 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 5 | https://www.bookconv.com/convert/pdf-to-epub | pdf to epub converter | 12,100 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 6 | https://www.bookconv.com/convert/epub-to-mobi | epub to mobi converter | 8,100 | 🟡 仅查询噪声(3) | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 7 | https://www.bookconv.com/convert/azw3-to-epub | azw3 to epub converter | 5,400 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 8 | https://www.bookconv.com/convert/epub-to-azw3 | epub to azw3 converter | 4,400 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 9 | https://www.bookconv.com/convert/docx-to-epub | docx to epub converter | 3,600 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 10 | https://www.bookconv.com/convert/mobi-to-pdf | mobi to pdf converter | 3,600 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 11 | https://www.bookconv.com/convert/txt-to-epub | txt to epub converter | 2,900 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 12 | https://www.bookconv.com/convert/epub-to-doc | epub to word converter | 2,900 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 13 | https://www.bookconv.com/convert/doc-to-epub | doc to epub converter | 2,400 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 14 | https://www.bookconv.com/convert/epub-to-html | epub to html converter | 2,400 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 15 | https://www.bookconv.com/convert/epub-to-rtf | epub to rtf converter | 1,900 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 16 | https://www.bookconv.com/convert/azw3-to-pdf | azw3 to pdf converter | 1,900 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 17 | https://www.bookconv.com/convert/html-to-epub | html to epub converter | 1,900 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 18 | https://www.bookconv.com/convert/lit-to-epub | lit to epub converter | 1,600 | 🟡 仅查询噪声(1) | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 19 | https://www.bookconv.com/convert/mobi-to-txt | mobi to text converter | 1,600 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 20 | https://www.bookconv.com/convert/epub-to-jpg | epub to jpg converter | 1,600 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 21 | https://www.bookconv.com/convert/fb2-to-epub | fb2 to epub converter | 1,300 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 22 | https://www.bookconv.com/convert/cbr-to-pdf | cbr to pdf converter | 1,300 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 23 | https://www.bookconv.com/convert/epub-to-png | epub to png converter | 1,300 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 24 | https://www.bookconv.com/convert/epub-to-docx | epub to word | 1,000 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 25 | https://www.bookconv.com/convert/djvu-to-pdf | djvu to pdf converter | 1,000 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |
| 26 | https://www.bookconv.com/convert/rtf-to-epub | rtf to epub converter | 1,000 | 🔴 沉默 | ☐ 已收录 ☐ 未收录 | P2 后置 |

---

## 三、异常页待处置（不在 CONVERSION_MAP，但已被 GSC 收录曝光）

这两页真实存在且已被收录，但 `zip`/`lrf` 不是 Calibre 真实支持格式（CONVERSION_MAP 无此键），后端无对应转换能力。需决定改造或 noindex，否则空转换页伤质量。

| # | 待核实 URL | 头部词 | 月搜索量(计划) | GSC 现状 | 收录状态 | 处置建议 |
|---|---|---|---|---|---|---|
| 27 | https://www.bookconv.com/convert/epub-to-zip | epub to zip | 400 | 🟠 22 曝光(全站最高) / 0 点击 | ☐ 已收录 | 改造为「解包/提取 epub 内容」指南页，或 noindex |
| 28 | https://www.bookconv.com/convert/epub-to-lrf | epub to lrf converter | 200 | 🟡 1 曝光 | ☐ 已收录 | 确认是否真支持；不支持则 noindex |

> 前一份分析报告把 `epub-to-zip` 吹成「黄金关键词 TOP10」，实质是 22 次曝光 + 计划量级 400 的噪声误导，且非真实转换。

---

## 四、核查前的必要条件（先确认，否则逐个请求索引也白搭）

1. **sitemap 已提交且覆盖全部 `/convert/*`**：GSC → 站点地图，确认 `sitemap.xml` 里有上面 26 个 URL。缺失的先修 `src/app/sitemap.ts` 再提交。
2. **robots.txt 未拦截**：GSC → 设置 → 网址检查时看是否「被 robots.txt 屏蔽」。
3. **canonical 一致**：各转换页 `generateMetadata` 输出的 canonical 应为自身 `https://www.bookconv.com/convert/{slug}`，不能指向首页或带 `/en`。
4. **站点验证所有权**：GSC 属性已添加（建议用网域属性 `sc-domain:bookconv.com`，可同时覆盖 www 与非 www 两变体）并验证。

---

## 五、执行顺序（小词先行）

1. **今天**：跑完上面 28 行的收录状态（手动或脚本）。未收录的 → 请求索引；同时确认必要条件 1~4。
2. **本周**：P1 早赢组（#1~3）做内容深度 + title/meta 差异化（"Free · No sign-up · 保留排版"前置），冲前 20 拿首波点击。
3. **本周**：异常页（#27~28）决定改造或 noindex。
4. **1~4 周**：P1 组起量、站点积累内链权重后，对 P2 沉默头部大词（#4~26）逐步做内容深度 + 内链集权。
5. **持续**：外链建设是头部大词从 #50 爬到前 10 的底层杠杆（执行《竞品外链分析与推广计划》）。
6. **数据**：当前仅 10 天 GSC 数据，统计意义弱；每周导出查询/页面报告，3~6 个月后回看哪些头部词已起量。
