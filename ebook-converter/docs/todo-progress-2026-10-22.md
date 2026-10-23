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

## 📋 与板面不同步的独立观察

| 项 | 来源 | 状态 | 建议 |
|---|---|---|---|
| /es 索引页仍 404 | middleware P3-C 设计 | 既有意设计 | 路由开放时 M5-6 注释已标注"即生效"，无需单独任务 |
| /es/blog/{marvel,twilight,lotr} 301→404 链 | B11a 既有决策 | 无内链指向 | 站内零风险，外部链接不影响 |
| ToolPageClient.tsx:366/370/374 三处硬编码英文 | e2e 验证扫描 | 功能层残留 | ✅ 2026-10-23 M5-7 已实做（含 ConvertProgress/BeforeAfter/FileDropZone/FeedbackWidget/file-format-sniffer 一并西语化）；英文零回归 |
| board.test.ts 13F 既有欠债 | M8-11 板面条目 | todo | 需板面专项处理 |

---

## 📅 近期到期任务（按 due 排序）

| 日期 | 任务 | 模块 | 来源 |
|---|---|---|---|
| 2026-10-23 | M4-3 社区分发作信号源 | M4 | board |
| 2026-10-24 | **M5-2 批次4 西语 guide 3 篇** | M5 | 本轮新增 | ✅ 2026-10-23 已执行（提前 1 天） |
| 2026-10-24 | M11-7 复用方法论章节收口 | M11 | board |
| 2026-10-24 | M8-11 修复 board.test.ts 脱节 | M8 | board |
| 2026-10-26 | M2-2 结构同质度达标（batch b4） | M2 | board |
| 2026-10-27 | M2-11 GSC 自动分析改善落地 | M2 | board |
| 2026-10-27 | M2-14 高展示低排名优化 | M2 | board |
| 2026-10-27 | M2-15 其余 4 个高展示低排名强化 | M2 | board |
| 2026-10-28 | M11-5 R_post 跟踪 | M11 | board |
| 2026-10-31 | M2-10 DRM_PROTECTED 错误提示关联 | M2 | board |
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

## 📝 本轮执行摘要（2026-10-23 · M5-7 + M5-2 批次4）

- **M5-7**：convert 交互 UI 西语本地化（7 文件：ui-chrome.ts + ToolPageClient.tsx + ConversionProgress/BeforeAfterComparison/FileDropZone/FeedbackWidget + file-format-sniffer.ts），修 line 138 历史中文 bug
- **M5-2 批次4**：3 篇西语 guide 译文（epub-to-azw3-for-kindle / epub-to-mobi-keep-formatting / azw3-to-mobi-keep-formatting）加完整 `es` 块，累计西语 guide **10/10** 达标
- **门禁**：tsc 0 error / content-integrity 0/0 / find-duplicate-headings 0 / `next build --webpack` exit 0
- **e2e 验证**：3 篇 /es/guide/* 全 HTTP 200 + 西语正文渲染 + 英文零回归（en 页无 es 泄漏）；2 个可达 /es/convert/* 页西语 UI（"convertir" 命中）；非西语 convert slug 正确 404
- **未 push**：commit 待人工复核

---

*最后更新：2026-10-23（M5-7 + M5-2 批次4 执行，未 push）*
