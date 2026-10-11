# BookConv 双层 Critic 审计体系设计说明 V1

> **版本** v1.0 | 2026-10-10 | workflow 缺口 6.1 落地产物
> 🔴 **代码为唯一真相**：本文档由四个脚本反推成文（各规则注行号）；改代码必同步改本文档。设计理念此前无成文记录，本版按「实测产物 > 文档描述」纪律从代码提取。

---

## 一、三层架构

```
┌────────────────────────────────────────────────────────────┐
│  Gate A（前置门禁，pre-commit/pre-push 钩子内）              │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│ ① 结构层 seo-critic.mjs（339 行）                           │
│    6 个 check，管「文件注册/链接/同步」等结构完整性           │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│ ② 内容层 critic-layer.blog.mjs（255 行，框架）               │
│    + correction-guards.blog.mjs（136 行，9 函数 14 规则）     │
│    阈值外置 correction.config.blog.json                      │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│ ③ 总闸 publish-gate.mjs（146 行）= Gate B                    │
│    串联两层 + 变更范围控制（GATE_SLUGS）+ UNKNOWN fail-closed │
└────────────────────────────────────────────────────────────┘
```

## 二、结构层：seo-critic.mjs 六个 check

| Check | 行号 | 判定要点 | 级别 |
|---|---|---|---|
| checkBlogRegistration | L59 | blog 文件未注册 index.ts / 孤儿 import / 导入未入 posts / slug 重复（4 个 critical：L86/92/98/104） | 🔴 BLOCK |
| checkGuideRegistration | L110 | guide 缺 slug / 未注册 / 导入未入 all（L131/135/137） | 🔴 BLOCK |
| checkLlmsTxt | L145 | llms.txt 缺失 warn；blog/guide 链接不同步 critical（L161/179）；convert 链接不同步 warn（L169） | 混合 |
| checkInternalLinks | L188 | 死内链 critical（L230）；指向 301 源 slug 的内链 warn 豁免（L311） | 混合 |
| checkI18nParity | L239 | en/es 缺失或 JSON 解析失败 warn；es 缺译/多键 warn（L242-250） | ⚠️ WARN |
| checkEnRedirects | L254 | hreflang/canonical 出现字面量 `/en` → critical（L264，源自历史 301 事故） | 🔴 BLOCK |

## 三、内容层：9 函数 14 规则（2 BLOCK + 12 WARN）

阈值配置 `scripts/correction.config.blog.json`：`blogDir: src/data/blog`、`skipFiles: [index, types, rss]`、`requiredFields: [slug, title, content]`、`wordCount: {thinWarn:800, minPer1000Internal:2, minExternal:1}`、`title: {maxLen:60, minLen:20}`、`faq: {minCount:5, blockIfZero:true}`、`deAiWords`（20 个英文套话词）。

| 函数（行号） | 规则 | 级别 |
|---|---|---|
| checkFaq（L33） | FAQ=0 → BLOCK『内容质量/GEO缺失』（L36）；FAQ<5 → WARN（L42） | 🔴/⚠️ |
| checkKeyTakeaways（L48） | 缺失 → BLOCK『内容质量/GEO缺失』（L50） | 🔴 |
| checkTitle（L56） | 长度越界（L61/L65）；无关键词（L70） | ⚠️ |
| checkIntroTopic（L76） | 首段缺主题词（L78） | ⚠️ |
| checkLinks（L84） | 内链不足（L89/L93）；外链不足（L98『E-E-A-T』） | ⚠️ |
| checkDeAi（L104） | 命中 AI 套话（L107『去AI/机械感』） | ⚠️ |
| checkThin（L113） | 薄内容（L116） | ⚠️ |
| checkAuthor（L122） | 缺作者（L124『E-E-A-T』） | ⚠️ |
| checkKeywordStuffing（L130） | 关键词堆砌（L132） | ⚠️ |

**分层理由（反推）**：结构层管「会导致页面不可达/互相矛盾」的硬伤（注册缺失=页面成孤儿、llms.txt 不同步=GEO 提交口径漂移），一律 BLOCK；内容层管「质量分」——BLOCK 仅留 GEO 结构缺失两项（AI 引用抓取的直接入口），其余 WARN 避免存量 64 篇的软问题误拦发布。

## 四、总闸：publish-gate.mjs 与 GATE_SLUGS 语义

- **GATE_SLUGS 解析（L36-45 `slugsFromEnv`）**：env 中**存在** `GATE_SLUGS`（含空串）就直接采信——空串 = pre-push 钩子用 sh-git 权威判定「本次无博文变更」；**不存在**才回退本地 `spawnSync git`
- **回退防御（L47-79）**：`status === null`（Windows Node fork git 恒 EBUSY 崩溃）→ 打印错误并 **exit(2) 不可判定**，绝不静默当成「无变更」——否则 critic 层退化为审计全量 64 篇、存量 WARN/BLOCK 误拦 push（2026-10-04 EBUSY 事故的修复，见 L36-45 注释）
- **UNKNOWN fail-closed（L112-129）**：判据无法执行 = 不可判定，exit(2) 阻断而非放行；符合项目三态纪律（0=实测为真 / 1=FAIL / 2=不可判定，见 `docs/discipline-portability-2026-10-05.md:142`）
- **范围限定**：GATE_SLUGS 仅约束新发布文章；存量文章的软问题保持 WARN，防止「门禁变噪声 → 被忽略」

## 五、与发布流程的接线

写稿 → `seo-critic.mjs`（结构）→ `critic-layer.blog.mjs`（内容）→ `publish-gate.mjs` 串联两层出结论 → 人工审稿红线（workflow §3.4）→ pre-commit/pre-push 钩子再次强制执行（钩子不入库，换机器须手动重装——MEMORY 0-A #8）。

## 六、变更记录

| 日期 | 变更 |
|---|---|
| 2026-08 前后 | 三 agent 体系建立（seo-critic / code-critic / 转换输出验证闸门），见 MEMORY「纠错智能体体系（已部署）」 |
| 2026-10-04 | publish-gate EBUSY 修复：git 调用失败改 exit(2)，不再静默当「无变更」 |
| 2026-10-05 | 方向感知修复（daily_vi.classify，属数据门禁非本体系，同期参考） |
| 2026-10-10 | 本设计说明由代码反推成文（缺口 6.1），未改任何脚本与阈值 |
