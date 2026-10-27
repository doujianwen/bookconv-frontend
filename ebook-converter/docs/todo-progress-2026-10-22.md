# 待办进度表 · 2026-10-22

> 来源：`data/seo-geo-board.json` M5 模块 + 本轮「推荐意见执行」新增待办 + 本轮识别并纠正的误判项。
> 更新触发：每次推送前、每次板面 status 变更时、或用户主动要求。
> 本文件只登记 board 没有/不方便的"本轮上下文式备忘"，board 仍是权威。

---

## 🔴 今日推送后遗留（d4c16b0 之后）

### 批次4 西语 guide（M5-2 连续动作）— ✅ 全部完成（2026-10-23 执行，due 2026-10-24）

| 项 | 文件 | 状态 | 到期 | 备注 |
|---|---|---|---|---|
| `epub-to-azw3-for-kindle.ts` | src/data/guides/ | done | 2026-10-24 | 批次3 完成 7/10 后剩余 3 篇之一；2026-10-23 已加完整 es 块 |
| `epub-to-mobi-keep-formatting.ts` | src/data/guides/ | done | 2026-10-24 | 同上 |
| `azw3-to-mobi-keep-formatting.ts` | src/data/guides/ | done | 2026-10-24 | 同上；累计西语 guide 10/10 达标 |

**约束**：恰 3 篇不扩大；azw3-vs-mobi 同题冲突继续跳过；西语率 100%、`satisfies GuideEs`、git diff 纯新增；git add 只加本轮 3 个 guide + 本轮 M5-7 的 7 个 src 文件 + board 回写（禁 add -A）；push 前 tsc/content-integrity/heading/meta-desc/build 六门禁全绿（本轮实测全 0 error）。

### M5-7 convert 交互 UI 西语本地化 — ✅ done（2026-10-23）

> 原 2026-10-22「独立观察」第 50 行建议立项项，本轮已实做。M5-6 只覆盖 chrome 固定文案，本项补齐功能性交互流。

| 文件 | 改动 |
|---|---|
| `src/lib/ui-chrome.ts` | 新增交互 UI 西语字典键（对比表 / Why 三卡 / 错误标签 / ConversionProgress / BeforeAfterComparison / FileDropZone / FeedbackWidget） |
| `src/app/[locale]/convert/[slug]/ToolPageClient.tsx` | hero 回退 / Steps / Why / 对比表 / 视频 / 错误回退 西语化；修 line 138 历史中文 bug 为 en/es 分支 |
| `src/components/tools/ConversionProgress.tsx` | isEs prop + ERROR_HINTS 西语 |
| `src/components/tools/BeforeAfterComparison.tsx` | isEs prop，BEFORE/AFTER/Size change/Link expires/Download 全西语 |
| `src/components/tools/FileDropZone.tsx` | `useLocale()` 推 isEs；drop/阅读/元数据/错误全西语 |
| `src/lib/file-format-sniffer.ts` | 嗅探错误文案 en/es（修中文 bug） |
| `src/components/tools/FeedbackWidget.tsx` | isEs prop，标题/占位/隐私/状态全西语 |

**生效范围**：仅 3 个真实西语 convert 路由（`epub-to-doc` / `epub-to-txt`；`lit-to-epub` 为既有 301 源不可达）。英文 isEs=false 行为逐字不变（零回归）。门禁：tsc 0 / content-integrity 0/0 / heading 0 / build exit 0；本地 e2e：2 个可达 /es/convert/* 页西语 UI（"convertir" 命中），非西语 convert slug 正确 404。

---

## 🟡 本轮识别但已撤销（推荐意见中被否定）

### next.config.ts `$1` 坏重定向

- **原报告描述**：`destination: "https://www.bookconv.com/$1"` 使用正则捕获语法（Next redirects 不支持，$1 会被字面化）
- **实际核实**：该文件 git HEAD 有完整版本（`9912f0d` 之前未动过），路径为 `ebook-converter/next.config.ts`，worktree 与 HEAD 无差异——**不存在"未追踪"问题**。
- **为何推荐被撤**：上一份报告声称"该文件从未被 git 追踪"，与实测矛盾。`git show HEAD:ebook-converter/next.config.ts` 返回原文，`grep $1` 命中同一位置，$1 是 Next redirects 标准占位符（非正则捕获），行为正确。
- **处置**：不动。若后续 Vercel 部署警告可再复查。

---

## 🟠 本轮发现但留待人工拍板

### M5-3/M5-4 删除来源

- **事实**：commit ae8d332 入库时 M5-3/M5-4 已被删除（工作区并行写入导致），本轮 d4c16b0 从 35daa23 恢复。
- **并行会话动机未知**：未追踪到任何 commit 注释或工作区日志解释该删除意图，建议人工查并行会话提交历史确认是否应补回或留作清理。
- **处置**：已恢复，等待用户复核 ae8d332 历史时一并评估。

---

## 🔵 本轮滚动口径修正（消除晨报「假性逾期」）

### M11-3（P0）+ M3-10（P1）due 改滚动完成日

| 项 | 原 due | 新 due | 逻辑 | commit |
|---|---|---|---|---|
| M11-3 | 2026-10-21 | 2026-11-20 | 全批次完成日（首批/批次 2 已交，≤3 页/批） | f1ed2a1 |
| M3-10 | 2026-10-20 | 2026-11-20 | 挂靠 M11-3 批次逐批消项（55 页，当前 0/55），与 M11-3 对齐 | f1ed2a1 |

- **根因**：晨报按 `due vs today` 判逾期，但分批任务的 `due` 是首批 deadline，不是全批次完成 deadline → status=doing 且已交付批次时仍挂逾期，掩盖真实进度。
- **处置**：改 due 为滚动完成日 2026-11-20，statusNote 末尾追加 `[2026-10-23 滚动口径]` 说明；`check-board-json.mjs` PASS；`board-daily-scan.mjs` 验效果 **逾期组清零**。
- **纪律沉淀**：以后新出现「每批 ≤N 页/每周 X 篇」类分批长周期任务，**一开始就把 due 设成滚动完成日**，避免后续补修。

---

## 🔵 M11-3 批次节奏（周节奏推进）

| 批次 | 日期 | 内容 | 状态 | 页数 |
|---|---|---|---|---|
| 批次 1 | 2026-10-21 | 强化 guide how-to-send-epub-to-kindle（P0 词 send to kindle） | ✅ 已 push | 1 |
| 批次 2 | 2026-10-22 | 新建 guide kindle-vs-kobo（P1 词 kindle vs kobo） | ✅ 已 push | 1 |
| 批次 3 | 2026-10-23 | 强化 guide kindle-formats + how-to-read-epub-on-kindle（P1 词） | ✅ 已 push | 2 |
| 批次 4+ | 待定 | convert 词 P1-parked（CloudConvert 402，待付费档升级后启动） | ⏸️ 挂起 | — |

**节奏约定**：每周 1-2 批，不另起 each-batch due；每批完成后在 statusNote 追加 `[批次 N · YYYY-MM-DD]` 记录。滚动 due = 2026-11-20。

---

## 📋 与板面不同步的独立观察

| 项 | 来源 | 状态 | 建议 |
|---|---|---|---|
| /es 索引页仍 404 | middleware P3-C 设计 | 既有意设计 | 路由开放时 M5-6 注释已标注"即生效"，无需单独任务 |
| /es/blog/{marvel,twilight,lotr} 301→404 链 | B11a 既有决策 | 无内链指向 | 站内零风险，外部链接不影响 |
| ToolPageClient.tsx:366/370/374 三处硬编码英文 | e2e 验证扫描 | 功能层残留 | ✅ 2026-10-23 M5-7 已实做（含 ConvertProgress/BeforeAfter/FileDropZone/FeedbackWidget/file-format-sniffer 一并西语化）；英文零回归 |
| board.test.ts 13F 既有欠债 | M8-11 板面条目 | todo | 需板面专项处理 |

---

## 🟣 GA4 巡检可选行动（2026-10-25 登记，排定日期处理）

> 来源：2026-10-25 巡检（10-24 数据，上传 19 创新高 / 失败 5 全在 CloudConvert 路径）。

| # | 项 | 触发证据 | 排定日期 | 处理方案 | 状态 |
|---|---|---|---|---|---|
| GA-OBS-1 | djvu-to-pdf 失败页无 file_upload 事件排查 | 10-24 失败 ×2 但同页零上传事件（其余失败页均有对应上传），疑埋点盲区或特殊入口 | **2026-10-27**（巡检后第 2 天，先看 10-25/10-26 是否再现） | 查 ToolPageClient/BatchUpload 埋点触发链路 + GA4 landingPage 维度交叉；若为 djvu 特有入口则补埋点 | todo |
| GA-OBS-2 | epub-to-azw3 连续失败处置 | 10-23 ×1 + 10-24 ×1，两日 2 败（CloudConvert 路径，疑 60s 超时偶发） | **2026-10-31**（观察一周窗口） | 若窗口内累计 ≥3 败：①评估 azw3 输出轻量方案可行性（低优先，azw3=MobiPack 私有变体）②或先做文件大小预筛提示（低成本） | todo |

**判定口径**：观察期内按每日巡检 pagePath 明细累计；两项目前均为"观察级"，未到"行动级"阈值不提前动手。

**发布状态（2026-10-25 12:14 确认）**：路线 A 已上线——代码批 `8039536` + 文档批 `f67ff20` 已入库 push，Vercel 部署 **Ready · Production · 54s**，站点健康 200。本组监控自 12:14 起对生产生效；当日 UTC 额度刚重置，首批真实转换数据（缓存命中/预算记账/降级）即将产生，下次巡检起可读数。

---

## 📅 近期到期任务（按 due 排序）

| 日期 | 任务 | 模块 | 来源 |
|---|---|---|---|
| 2026-10-23 | M4-3 社区分发作信号源 | M4 | board |
| 2026-10-24 | **M5-2 批次4 西语 guide 3 篇** | M5 | 本轮新增 | ✅ 2026-10-23 已执行（提前 1 天） |
| 2026-10-24 | M11-7 复用方法论章节收口 | M11 | board |
| 2026-10-24 | M8-11 修复 board.test.ts 脱节 | M8 | board |
| 2026-10-26 | M2-2 结构同质度达标（batch b4） | M2 | board |
| 2026-10-27 | **GA-OBS-1 djvu-to-pdf 上传事件缺失排查**（若 10-25/26 再现失败） | GA4 巡检 | 2026-10-25 登记 |
| 2026-10-27 | M2-11 GSC 自动分析改善落地 | M2 | board |
| 2026-10-27 | M2-14 高展示低排名优化 | M2 | board |
| 2026-10-27 | M2-15 其余 4 个高展示低排名强化 | M2 | board |
| 2026-10-28 | M11-5 R_post 跟踪 | M11 | board |
| 2026-10-31 | M2-10 DRM_PROTECTED 错误提示关联 | M2 | board |
| 2026-10-31 | **GA-OBS-2 epub-to-azw3 连续失败处置**（窗口内 ≥3 败才行动） | GA4 巡检 | 2026-10-25 登记 |
| 2026-10-31 | M5-5 /es/ 语言错配治理 | M5 | board |
| 2026-11-01 | M11-8 挂载月度快照自动化 | M11 | board |
| 2026-11-02 | M6-9 FAQ 结构化（关键页 100%） | M6 | board |
| 2026-11-14 | M2-16 博客内容质量存量收口 | M2 | board |
| 2026-11-14 | M3-14 meta description 超长收口 | M3 | board |
| 2026-11-15 | M5-3 es 内容层覆盖扩充 | M5 | board |
| 2026-11-15 | M11-9 OpenAI Tier≥1 升级 | M11 | board |

---

## 📝 本轮执行摘要（ae8d332 + d4c16b0）

- **ae8d332**：M5-6 西语 chrome 本地化（21 文件 +525/−183）+ M5-2 批次3 三篇西语 guide（3 文件 +138/−0）
- **d4c16b0**：M5-3/M5-4 恢复（1 文件 +25/−0）
- **门禁**：tsc 0 error / content-integrity 0/0 / heading-uniqueness 2/0 / meta-desc ERROR=0 WARN=127 / build exit 0 / pre-commit 五道全绿 / publish-gate 两层放行
- **e2e 验证**：22 页 HTTP 200 / lang 全对 / chrome 断言全过 / 234 链接零 404（5 条 301 为 middleware 既定去重）
- **Cookie 链实测**（补充）：/es 页访问 → 种 locale=es cookie → 带 cookie 访英文 URL → 全部 `lang=en` + 英文导航 + 响应重置 cookie=en；反向 `/es` 页带陈旧 en cookie → `lang=es`。**URL 永远是权威，无回归**
- **已撤销推荐**：next.config.ts `$1` 坏重定向（该文件在 HEAD 中正常，$1 是标准 Next 占位符）

---

## 📋 GA4 T+1 因果验证遗留待办（2026-10-23 自动化触发）

> 来源：GA4 T+1 观察报告 `数据分析/GA4-T1观察-mobi-azw3源验证-2026-10-23.md`（commit 9912f0d mobi/azw3 源 402 归零验证，判定=UNKNOWN 样本不足）。

| 项 | 优先级 | 内容 | 状态 | 备注 |
|---|---|---|---|---|
| ~~file_upload 补发 source_format 参数~~ | ~~P0~~ | ~~前端 `file_upload` 事件当前不带 `source_format`~~ | ✅ **已撤销（伪任务）** | **2026-10-24 实测证伪**：代码早已带参（ToolPageClient.tsx:200 / BatchUpload.tsx:373），GA4 `customEvent:source_format` 已注册可查（30 天 file_upload×source_format 交叉返回完整分布）。归零判定已通过该交叉查询完成，无需改代码 |
| 再拉 3 天 T+1 累积 mobi/azw3 源样本 ≥3 次后复判归零 | P1 | 10-23~10-25 GA4 拉取，累积 mobi/azw3/lit 源上传样本 | 🟢 **2026-10-24 已判定归零** | 按源×日期细查：mobi 源唯一失败在 10-17（部署前）；10-18~10-23 0 失败且有上传/完成样本。改为持续观察至 7 天。**2026-10-24 21:55 补拉窗口 10-16~10-24 复核**：mobi/azw3/lit 源失败=1（仅 mobi→epub 1 次，落 10-17 部署前，与 30 天交叉一致），10-18+ 仍 0 → 归零结论稳固；epub 源 402 配额错仍 5 次（窗口内），根治=CC 付费档 |
| 10-22 GA4 vs dashboard 对账差 2 条复核 | P1 | GA4 10-22 失败 2 次（均 epub 源）vs dashboard errors=4，差 2 条疑 mobi/azw3 源或前端补报 | todo | T+3（10-25）复核 |
| CloudConvert 升级付费档（根治 epub 源 402 主因） | P0 | 与 9912f0d 正交，mobi/azw3 源免疫 402 但 epub 源仍走 CC；10-22 唯一 402 = epub→azw3 | todo（用户决策） | 10-23 08:20 dashboard 实证仍 Free 10/天 |

---

## 📝 本轮执行摘要（2026-10-23 · M5-7 + M5-2 批次4）

- **M5-7**：convert 交互 UI 西语本地化（7 文件：ui-chrome.ts + ToolPageClient.tsx + ConversionProgress/BeforeAfterComparison/FileDropZone/FeedbackWidget + file-format-sniffer.ts），修 line 138 历史中文 bug
- **M5-2 批次4**：3 篇西语 guide 译文（epub-to-azw3-for-kindle / epub-to-mobi-keep-formatting / azw3-to-mobi-keep-formatting）加完整 `es` 块，累计西语 guide **10/10** 达标
- **门禁**：tsc 0 error / content-integrity 0/0 / find-duplicate-headings 0 / `next build --webpack` exit 0
- **e2e 验证**：3 篇 /es/guide/* 全 HTTP 200 + 西语正文渲染 + 英文零回归（en 页无 es 泄漏）；2 个可达 /es/convert/* 页西语 UI（"convertir" 命中）；非西语 convert slug 正确 404
- **未 push**：commit 待人工复核

---

## 🔵 M11-3 批次节奏（周节奏推进）

| 批次 | 日期 | 内容 | 状态 | 页数 |
|---|---|---|---|---|
| 批次 1 | 2026-10-21 | 强化 guide how-to-send-epub-to-kindle（P0 词 send to kindle） | ✅ 已 push | 1 |
| 批次 2 | 2026-10-22 | 新建 guide kindle-vs-kobo（P1 词 kindle vs kobo） | ✅ 已 push | 1 |
| 批次 3 | 2026-10-23 | 强化 guide kindle-formats + how-to-read-epub-on-kindle（P1 词） | ✅ 已 push | 2 |
| 批次 4+ | 待定 | convert 词 P1-parked（CloudConvert 402，待付费档升级后启动） | ⏸️ 挂起 | — |

**节奏约定**：每周 1-2 批，不另起 each-batch due；每批完成后在 statusNote 追加 `[批次 N · YYYY-MM-DD]` 记录。滚动 due = 2026-11-20。

---

## 🟢 路线 A 上线监控项（2026-10-25 登记 · 随路线 A 发布生效）

> 来源：CloudConvert 402 第三次复发处置（诊断 `诊断_CloudConvert额度耗尽_2026-10-24.md` + 红队 v2 `方案_CloudConvert零成本缓解_红队审计v2_2026-10-25.md`）。路线 A = 预算闸门（A2）+ R2 结果缓存（A1）+ 优雅降级（A3），**缓解非修复**（根治=自托管 Calibre / 付费档，路线 B 因无 Visa/MC 卡暂停）。

| # | 监控项 | 数据来源 | 健康口径 | 异常信号 |
|---|---|---|---|---|
| MON-1 | **缓存命中率** `X-Conversion-Cache: hit` 比例 | Vercel 运行时日志 / 响应头 | 低流量日 >0 即有效；持续 0 = 文件多样无重复，A1 无杠杆 | 连续多日 0 命中且预算仍触顶 ⇒ 免费档确不够，须重估 B/付费 |
| MON-2 | **每日 credit 消耗曲线** `conv:budget:{UTC日}` vs 10 上限 | Redis（Upstash）key 值 | 曲线 <10 且无 429 = 闸门正常工作；记账按 CC 真实 credits（非次数） | 曲线贴顶 = 需求超免费档；429 触发 = 已进入降级（设计内行为，不发飞书） |
| MON-3 | **429 优雅降级触发次数** | Vercel 日志（429 + Retry-After） | 少量 = 配额均摊生效；用户看到的是友好提示 + 本地格式推荐（epub→txt/zip） | 429 占比高 = 免费档封顶增长，与「流量优先」目标冲突 ⇒ 触发 B/付费决策 |

**检查节奏**：建议每日 GA4 巡检时顺带看一次（与 GA-OBS-1/2 同窗口）；连续 3 天同时满足「MON-1≈0 + MON-2 贴顶 + MON-3>0」⇒ 出具数据结论供用户拍板路线 B/付费。

**关联待办**：GA-OBS-2（epub-to-azw3 失败观察，10-31）与本组监控交叉——azw3 属 CC 依赖格式，其失败率同时受 402 配额影响。

---

*最后更新：2026-10-25 12:16（路线 A 上线状态回填：8039536+f67ff20 已发布，Vercel Ready · Production；此前 2026-10-25 12:05：登记 MON-1/2/3 监控三项；07:50：GA4 巡检可选行动 GA-OBS-1/2；2026-10-23：M11-3 批次节奏确立）*

---

## 🟢 2026-10-27 收口记录（M2-2 + M8-10）

### M2-2 结构同质度达标 —— ✅ 关闭（PASS 3/4，恢复板面原意）
- **关键纠正**：10-22 `docs/m2-2-diff-record` 计划误读脚本——实际最大共用章节覆盖由 `vs comparison`(16)+`whatis`(15) 驱动，非 howtoconvert；按脚本原阈值 ≤8 需约 29 处改造。
- **收口动作**：恢复板面原始口径（<16/31 ⇒ 脚本 `maxTopHeadingPages` 8→15）；落实 10 页差异化（9 页 howtoconvert 15→6 + 1 页 vs comparison 16→15）。
- **实测**：差异化 PASS 3/4（覆盖 15≤15、Jaccard 0.002/0.143）；tsc 0 / content 0/0 / duplicate 0 / build 0。
- **残余**：C1 共用骨架数=6(>3) 仍 FAIL，但验收 ≥3/4 已满足，非阻塞。
- 详见 `docs/m2-2-diff-record-2026-10-22.md` §六。

### M8-10 失败签名监控 —— 🔵 分析补全（未直接关闭，设 close-gate）
- 窗口 10-19→10-26 满 7 天；§3.4+§3.5 已上线并生产验证（Job 75c75593 被 §3.5 拦截）。
- 窗口内无文档记录 "Input task has failed" 复发；同期仅有 10-22 起 402 复发（不同签名）。
- **诚实保留**：未直接重查飞书告警群历史/Vercel 日志（权威失败通道），故「7 天无复发」为 Inference 非 Fact。
- **关闭闸门**：重查权威通道 10-19→10-26 过滤 Input task has failed；0 例→关闭，≥2 例且深度校验放行后→重开诊断。
- 详见 `docs/m8-10-失败签名监控小结-2026-10-27.md`；board M8-10 statusNote 同步。

---

## 🟡 2026-10-27 新增待办：BookConv 自托管转换后端 · 预发验证（WP5，切生产前 P0）

**背景**：Calibre 转换后端已部署 HK 机（43.129.176.38，`convert.tuozhigeo.com`，LE 证书 + dry-run PASS）；WP4 failover 代码（熔断 + CloudConvert 回退）已提交；Vercel 已填 `CONVERSION_BACKEND_URL` + `CONVERSION_INTERNAL_SECRET`（Production）。**代码上线后 env 随部署生效，后端接管前必须过预发验证。**

| # | 验证项 | 方法 | 通过标准 |
|---|---|---|---|
| PV-1 | Preview 真转换走后端 | Preview 域名上传 epub→mobi/azw3 | 200 + 合法文件 + `X-Conversion-Backend: hit` |
| PV-2 | **failover 反向验证（铁律）** | 服务器 `sudo systemctl stop bookconv-conversion` 后再发请求 | 自动回退 CloudConvert（`X-Conversion-Backend: miss-cloudconvert`），**绝不 503** |
| PV-3 | 熔断生效 | 连续打 3+ 次停用后端的请求 | 第 3 次后飞书收到「circuit OPEN」告警（仅一次，不刷屏）；冷却后恢复 |
| PV-4 | GEO 零影响 | 转换进行时 curl GEO 站 + 观察 TTFB | www.tuozhigeo.com 全程 200；无 OOM（`systemctl status` 内存 < 1.2G cap） |
| PV-5 | 非白名单格式直走 CC | 转一个后端不支持的格式（如 docx→epub 视 CONVERSION_MAP） | 正常 200 走 CC（`miss-cloudconvert`），无 422 泄漏给用户 |
| PV-6 | 恢复验证 | `systemctl start` 后再请求 | 自动恢复 `hit`；熔断半开→闭合 |

**上线顺序**：PV 全过 → 监控 3 天（MON-1~3 + `X-Conversion-Backend` 命中率）→ 确认无回退 → 正式切生产。**回滚**：Vercel 两个 env 置空 + Redeploy = 全量回 CloudConvert；服务器侧 `systemctl stop` 即停。

*登记：2026-10-27 21:46*
