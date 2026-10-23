# BookConv 工作区全面盘点报告 v2（红队审计修订版）

> **版本**：v2 · 2026-10-24
> **修订说明**：v1 报告（2026-10-24 当日）经四层苏格拉底审计（socratic-audit，方法见 `~/.workbuddy/skills/socratic-audit`）逐条开盒复核，裁决修正 R1–R8 已并入本版。与 v1 的主要差异：**高风险项全部降级、1 项证伪、2 项加强**。
> **红队审计过程文档**：未单独落盘（过程在会话内执行，修正结果直接并入本版）。审计核心判据：每条断言均用磁盘文件 / grep / git 实测复核，区分【已核验 / 可答 / 待实测 / 不可答】。

---

## 一、项目性质

Next.js 16.2 + React 19 + Calibre 的在线电子书格式转换站（bookconv.com / Vercel），**60 个转换对**（18 种格式标识），请求内同步转换架构（无队列），纯 JS 文本兜底 + CloudConvert 双层降级。

## 二、文件构成

约 530 个真实文件（node_modules 除外）：

| 区域 | 数量 | 内容 |
|---|---|---|
| `src/app` | ~60 | App Router 页面（[locale] 多语言）+ 16 个 API 路由 |
| `src/lib` | ~45 | 转换引擎、认证、限流、告警、存储、支付、工作台 |
| `src/components` | ~40 | 转换工具 UI、workbench、board、SEO 组件 |
| `src/data` | ~130 | 博客 68 篇、内容页 28、指南 26、格式/兼容数据 |
| `scripts` | 50+ | 门禁审计（publish-gate/seo-critic 等）+ GA4/GSC/Bing 抓取 |
| `tests` | 19 文件 | 单元/边界/性能/反向验证/Playwright E2E |
| `docs` | 60+ | 运营总纲、事故报告、SEO/GEO 规范、执行计划 |
| `worker` | 4 | ⚠️ 已废弃死代码（BullMQ 独立 worker，DEPRECATED.md 声明） |
| `public/messages` | 25+ | 静态资产、CSV 数据集、en/es 双语字典 |

## 三、核心业务逻辑

1. **转换执行链**：`/api/convert`（限流 20/分/IP）→ 有 `CONVERSION_BACKEND_URL` 则转发 VPS；否则本地 `convert-handler.ts` → `conversion.ts`。本地优先纯 JS（40 对文本派生，免疫 CloudConvert 402）→ Calibre → CloudConvert 兜底，全程 `conversion-verifier.ts` 魔数 + 文本损失一票否决校验。
2. **认证**：手写 HS256 JWT + scrypt 哈希，Postgres 或内存 Map。
3. **支付**：Lemon Squeezy webhook（HMAC 签名校验），Pro/API 两档，订阅存 Redis（30d TTL）。
4. **告警**：飞书卡片实时告警（转换失败/后端不可达/用户反馈），含节流、关键词/签名兼容、红灰分级。
5. **限流**：Redis 滑动窗口（Lua 脚本原子计数），Redis 不可用降级内存；IP 解析支持 Cloudflare CIDR。
6. **SEO 体系**：动态 sitemap（~150 URL）、hreflang、JSON-LD Schema、ES 白名单路由（P3-C 反伪西语规则）、多层门禁脚本。

## 四、发现的问题（红队修正后，按真实风险排序）

### 🟠 运营级 · 真实存在

**1. CloudConvert 402 每日复发（P0 运营风险，非代码缺陷）**

免费档 10/天 < 日用量，mobi/azw3/pdf 等 **18 对**每天午后失败（已复发 3 次，`docs/incident-2026-10-22-cloudconvert-402-recurrence.md` 实证；`conversion-map.ts` tool 分组复核一致）。纯 JS 已免疫 **42/60 对**。用户已拍板"不升级 CC 付费档、convert 词永久关闭"（git `70335a9`）——属商业决策，代码审计不可裁决；残留影响是运营每天仍收告警。

**配套真实代码缺陷**：serverless 下 10 分钟告警节流实际失效（`src/lib/alerts.ts` 实例级 Map，冷启动清零，事故报告 §4 已实测 27s 双发）——**可修**：外置 Redis/KV TTL。

### 🟡 低风险 · 潜在（v1 高风险已降级）

**2. auth.ts 与 session.ts 双身份源并存（原 R1，修正）**

`getCurrentUserId()` 恒 null vs `getSession()` 完整可用。红队复核：`canAccessResult/canAccessBatch` **唯一引用点**是孤儿端点 `/api/convert/[jobId]/result`；该端点永远查不到 job（无队列生产者）→ `resultUserId` 恒 undefined → **恒放行，现行无安全后果**。潜在风险仅在"未来把同步结果接入该端点"时成立（任意持 UUID 者可访问）。建议：统一身份源或随孤儿端点一并废弃。

**3. 孤儿端点比 v1 报告更彻底（原 R6，加强）**

`/api/convert/[jobId]/status|result` 无生产者恒 404（grep `.add(` 全仓零命中）；且 result 大文件分支指向 `/api/download/temp`——**该路由不存在**（glob 仅 `/api/download/route.ts`），即使 job 存在也 404。

> **2026-10-24 处置**：两个孤儿端点已删除（见文末修订日志）。

### 🟢 已证伪 / 已降级（v1 项）

**4. ~~sitemap 漏 `lit-to-epub` 漂移~~ → 非缺陷**

`lit-to-epub` 被 middleware 301 到 `/blog/why-convert-lit-to-epub`（`src/middleware.ts:32`），sitemap 不列它正确；硬编码 2 个与 `es-routes.ts` 3 个的差异**无实际影响**（第 3 个 URL 不可达）。

**5. ~~queue 死代码 / 测试幽灵路径~~ → 部分修正**

queue 无生产者（真），但 `startWorker/processConversion` 函数完整且被孤儿端点引用，非"不存在"；`tests/unit/queue.test.ts` 测的是**未激活路径**。清理建议保留，措辞与优先级下调（登记于执行规划 D5，删除须同步处理测试与 package.json 脚本，否则 `npm test` 失败）。

### 🟡 低风险 · 维持

**6. 根目录积压 40+ 旧 SEO 报告**（SEO_RECOVERY_*/TITLE_*/INTENT_PARTITION 等），docs 索引未覆盖。

**7. git 未提交 5 项（实测）**：`docs/incident-2026-10-22-cloudconvert-402-recurrence.md`、`public/site.png`、`public/bookconv logo.png`、`_wb_tmp/`（正常临时目录）、`docs/ga4-advanced-todo-register-2026-10-11.md`（+31 行未提交）。

**8. 根目录 `nul` 0 字节残留**（Windows 重定向产物）。

## 五、健康信号

| 信号 | 状态 | 依据 |
|---|---|---|
| 60 对 / 42 免疫 / 18 CC 依赖 | ✅ | `conversion-map.ts` + `conversion-map.test.ts` 双源一致（非转述） |
| 门禁体系成熟 | ✅ | publish-gate / seo-critic / repo-hygiene 三独立脚本，非同一逻辑复制 |
| 告警响应体校验（防静默假成功） | ✅ | `src/lib/alerts.ts` postFeishuCard 实测 |
| 深度输入校验（EPUB 魔数+容器+jszip 深解压） | ✅ | `src/lib/conversion.ts` §3.5 实测 |
| 西语化推进（chrome + 交互 UI + guide 10/10） | ✅ | `docs/todo-progress-2026-10-22.md` 实证 |
| 事故文档证据分级（Fact/Inference/Unknown） | ✅ | incident 文档结构 |

## 六、建议下一步

1. **（P1）** 孤儿端点 `status|result` 清理（**2026-10-24 已执行**，删除路由 + openapi + README 引用同步修正）。
2. **（P1）** 告警节流外置（Redis/KV TTL）—— 唯一真实的 serverless 代码缺陷。
3. **（P2）** 清理未提交文件与 `nul` 残留（`_wb_tmp/` 不动）。
4. **（P3）** `queue.test.ts` 与 queue 死代码处理（执行规划 D5 已登记，删除须同步测试与脚本）。
5. **（维持，人工决策）** CC 付费档升级与否 —— 代码侧仅保留告警与监控，不越权建议。

---

## 修订日志

- 2026-10-24：v2 初版建立。红队审计（socratic-audit 四层框架）裁决 R1–R8 并入；v1 高风险全部降级、sitemap 漂移证伪、孤儿端点判定加强。
- 2026-10-24：孤儿端点清理执行（删除 `src/app/api/convert/[jobId]/status|result` 路由 + openapi 两份移除定义 + README/PROJECT_README 措辞更新）。
