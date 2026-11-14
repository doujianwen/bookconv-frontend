# BookConv Product Facts v2 · 对外陈述单一事实源

- 建立日期：2026-11-13（Asia/Shanghai）
- 状态：**ACTIVE** —— 取代 `docs/ENTITY.md`（2026-10-19）中关于上传上限、文件删除、转换引擎、Pro 状态的产品能力口径
- 建立依据：`docs/tasks/CEO_四模型交叉审计_终审报告_2026-11-13.md` 的事实裁定矩阵 + 本轮源码/配置实测（见下表「证据」列）
- 适用范围：全站可见正文、EN/ES i18n、FAQ、FAQPage/HowTo JSON-LD、title/meta description、OpenAPI、`public/llms.txt`、错误码提示及一切外部分发文案
- 不覆盖：运行级未决事实（§5）。**未决项不得写成承诺。**

> 判据：产品实际行为与现行有效政策 > 本文件 > 页面文案。本文件本身也会过时，改动产品能力时必须同步回写本文件并跑 `node scripts/audit-product-claims.mjs`。

---

## 1. 事实裁定表

| 事实域 | 当前裁定 | 适用路径 / 计划 / 语言 | 证据（文件:行） | 允许措辞 | 禁用措辞 | 未决状态 |
|---|---|---|---|---|---|---|
| 单文件直传上限 | 直传可用时，单文件**上传**上限 100 MB；这是上传能力，不是转换成功保证 | direct upload enabled；EN+ES | `src/lib/file-size-limit.ts:49`（`NEXT_PUBLIC_MAX_UPLOAD_MB` 默认 100）；`src/app/api/upload/presign/route.ts:57` | `When direct upload is available, you can upload a single file up to 100 MB.` | 无条件的 `100 MB per-file limit` / `capped at 100 MB on every plan` / `100 MB 一定能转换` | 50–100MB 各格式能否完成转换未实测 |
| multipart / fallback 上限 | 4 MB / 文件 | multipart fallback；EN+ES | `src/lib/file-size-limit.ts:23`（`NEXT_PUBLIC_MAX_FILE_SIZE_MB` 默认 4） | `The multipart fallback and batch uploads are limited to 4 MB per file.` | 把 4 MB 写成「全站单文件上限」 | 已闭环 |
| batch | 4 MB / 文件；public beta 期间免费 | batch；EN+ES | `src/app/[locale]/batch/page.tsx`；`src/lib/seo/conversion-faq.ts:19` | `Batch conversion is free during public beta.` | 「批量也支持 100 MB」/「批量永久免费」 | 已闭环 |
| 处理引擎入口 | 自建 Calibre backend 默认入口上限 50 MB；非 200 回退 CloudConvert | 服务端；EN+ES | `conversion-backend/app/index.js:40`；`src/lib/conversion-backend-client.ts:258` | `Conversion availability and processing limits vary by format and route.` | 「上传 100 MB = 所有格式都能转换成功」 | 50–100MB 各格式端到端成功率未实测 |
| 转换引擎归属 | 多条路径：Calibre / 纯 JS 文本提取 / passthrough / 第三方服务；**BookConv 本体非开源**，Calibre 引擎开源 | 全站；EN+ES | `src/lib/conversion-map.ts:55,61`；`src/app/api/convert/route.ts`；`src/data/content/epub-to-mobi.ts:281` | `BookConv uses format-specific processing methods. Depending on the format pair, a conversion may use Calibre, built-in text processing, or a third-party service.` | `Every conversion runs through Calibre` / `Powered by Calibre`（作为全站归属）/ `Open source backend` 指向 BookConv / `Most conversions use Calibre`（无路由比例统计） | 「most」需先完成路由×引擎比例统计 |
| 文件删除 / 保留 | 现行 Privacy Policy **不保证**转换完成或下载链接过期时所有副本即时删除；未发布覆盖所有供应商副本的已验证最长保留期 | 全站；EN+ES | `src/app/[locale]/privacy/page.tsx:24` | `See our privacy policy for file handling and retention details. We do not guarantee immediate deletion of every copy.` | `auto-deleted within 1 hour` / `deleted automatically within 1 hour` / `deleted after the conversion completes` / 任何具体时限 | R2 lifecycle 规则（uploads 1d / cache 30d）、本地 24h、CloudConvert 条款**未经控制台/供应商核验** |
| Pro | Pro 作为方案已在 Pricing 页展示，**标价 $5/month**；checkout variant 配置存在但**未验证真实收款** | pricing；EN+ES | `src/lib/payments/service.ts:35-38`（`priceCents: 500`）；`src/app/[locale]/pricing/page.tsx:90,118` | `Pro is listed at $5/month on the pricing page.` | `Pro planned after beta` / `planned for Pro after beta` / `checkout available` / `purchase now` / 「Pro 提高上传上限」 | 支付沙盒/真实交易与 webhook 未验证 |
| DRM | 后端拒绝 DRM_PROTECTED；BookConv **不移除、不绕过 DRM**，只处理用户有权转换的文件 | 全站；EN+ES | `src/lib/conversion-backend-client.ts:230`；`src/lib/error-handler.ts:110` | `BookConv does not remove DRM. Only convert files you are authorized to process.` | `remove DRM before converting` / `Remove DRM first` / `DRM will be removed` / 推荐 DeDRM 工具 / 「联系客服协助授权」 | 无（能力边界明确） |
| 速率限制 | Convert API 20 次 / IP / 60s；Download API 50 次 / IP / 3600s；Presign 30 / 60s；feedback 5 / 600s | API；EN+ES | `src/lib/rate-limit.ts:46-65` | `20 requests per IP per 60 seconds`（Convert API） | `five conversions per hour` / 把下载 50/hour 误写成转换限流 | 是否存在额外登录/供应商限额未分层核实 |
| LIT | conversion map 存在 `lit-epub`（JS text fallback）与 `lit-mobi`（Calibre）映射；**路由存在 ≠ 所有 LIT 文件都能成功** | /convert/lit-to-epub；EN+ES | `src/lib/conversion-map.ts:55,61` | `LIT conversion routes exist; support depends on the source file.` | `LIT is not available` / `LIT supported`（全面支持承诺） | 真实样本 E2E（损坏/DRM/大小边界/输出质量）未做 |
| 速度 / 保真 | 转换时间受文件大小、格式、服务可用性影响；部分路径只重建文本，可能丢失图片/样式/metadata | 全站；EN+ES | `src/lib/seo/conversion-faq.ts:10-11` | 非量化条件句：`Processing time depends on the file and conversion route.` | `instantly` / `lightning-fast` / `fastest` / `perfect` / `no formatting loss` / `fully preserves` / `lossless` | P50/P90 按格式与大小分层统计未建立 |
| 格式数量 | 28+ formats / 27–31 directed pairs / core formats 是**不同统计对象** | 全站；EN+ES | `src/lib/conversion-map.ts`；`messages/en.json:35,48` | 分开标注统计对象，由权威 conversion map 派生 | 混用 28+/27/31 不说明对象 | 权威计数自动生成未实现 |
| 用户证言 | 引语不得由运营/AI 改写；需核验原始来源与授权 | 全站 | `src/data/testimonials.ts` | 有来源的原文；无来源则改为非引语产品说明 | 伪造/润色引语 | 原始来源与授权未核验 |

---

## 2. 允许/禁用措辞速查（供 EN/ES 同步与门禁判据）

- ✅ `When direct upload is available, you can upload a single file up to 100 MB.`
- ✅ `The multipart fallback and batch uploads are limited to 4 MB per file.`
- ✅ `Conversion availability and processing limits vary by format and route.`
- ✅ `BookConv uses format-specific processing methods.`
- ✅ `We do not guarantee immediate deletion of every copy. See our privacy policy.`
- ✅ `Pro is listed at $5/month; batch is currently free during the public beta.`
- ✅ `BookConv does not remove DRM; only convert files you are authorized to process.`
- ❌ `Every conversion runs through Calibre` / `Powered by Calibre`（全站归属）
- ❌ `auto-deleted within 1 hour` / `deleted after the conversion completes`
- ❌ `Pro planned after beta` / `checkout available`
- ❌ `remove DRM before converting` / `DRM will be removed`
- ❌ `LIT is not available` / `Open source backend`（指向 BookConv）
- ❌ 无条件 `instantly` / `perfect` / `no formatting loss`

## 3. 变更绑定规则（回应报告根因 D）

产品能力、删除政策、Pro 状态、转换引擎任一发生变化时，必须在同一批次内同步：本文件 → 页面文案 → EN/ES → FAQ schema → metadata → OpenAPI → `llms.txt` → `scripts/audit-product-claims.mjs` 判据 → 回归测试。缺任一项视为 `NOT_SYNCED`，不得声称完成。

## 4. 本轮修复范围（2026-11-13）

按用户拍板：**核心页面 / 结构化数据 / EN-ES / OpenAPI / llms.txt / 错误提示 / 事实源**，不改博客与指南长尾 SEO 文案。长尾残留由 `scripts/audit-product-claims.mjs` 以 ADVISORY 清单显式列出，不阻断、不假绿，供后续分批治理。

## 5. 运行级未决项（不得冒充已完成）

| 未决项 | 需要什么证据 | 解阻条件 |
|---|---|---|
| Pro 支付闭环 | 沙盒 checkout + webhook 或真实交易事件 | 用户批准支付测试窗口 |
| R2 lifecycle 是否仍生效 | Cloudflare 控制台规则截图 + 作用域核对（upload 临时前缀 vs 全桶） | 登录控制台；启用任何物理删除前必须核对 |
| CloudConvert 副本保留 | 供应商条款/账户设置证据 | 供应商级核验 |
| 50–100 MB 各格式转换成功率 | 真实文件 E2E（含回退路径） | 提供测试样本与时间窗口 |
| LIT E2E | 真实 LIT 样本（正常/损坏/DRM/大小边界）+ 输出质量检查 | 提供样本 |
| 用户证言来源 | 原始出处与授权记录 | 运营提供 |

---

### 修订日志
- 2026-11-13：初版建立。基于 CEO 终审报告事实裁定 + 源码实测复核；同时把 `docs/ENTITY.md` 标记为 SUPERSEDED。
