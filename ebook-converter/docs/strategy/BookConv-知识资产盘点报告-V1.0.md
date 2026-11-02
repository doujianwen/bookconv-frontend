# BookConv 现有知识资产盘点报告 V1.0

> **文档版本**：V1.0
> **盘点时间**：2026-11-02（单次快照；文件数随日常开发变化，数字仅代表该时点）
> **状态**：ACTIVE（索引层，不复制内容）
> **盘点原则**：只索引与引用，**不重复复制**历史文件；不移动、不删除任何原始证据
> **配套**：`docs/strategy/BookConv-原始规划与战略演进梳理-V1.0.md`、`docs/learning-materials/BookConv-实战素材库索引-V1.0.md`

---

## 1. 实际检查的目录（可复核）

### 1.1 项目工作目录 `E:\一人公司\电子书格式转换站\ebook-converter\`

| 目录 | 文件数 | 说明 | 检查方式 |
|---|---|---|---|
| `docs/`（含子目录） | **617** | 文档主库，顶层 72 项 | 顶层全列 + `docs/文档索引.md` 全文读 + 子目录树 |
| `数据分析/` | **241**（68 md / 87 csv / 75 json） | GSC/GA4/Bing/竞品流水线产物 | 顶层全列 + 抽样读 |
| `bookconv_data_asset/` | **135** | 证据资产库（raw_inventory 2130 文件级清单） | 结构 + 抽样 |
| `_archived/` | **316** | 归档（含 `_archived/ops-history/ops-execution/`、`_archived/docs-cleanup-2026-10-26/`） | 目录树 + 抽样 |
| `src/` | 334 | 应用源码 | 结构 |
| `scripts/` | 96 | 数据/门禁/审计脚本 | 全列 |
| `tests/` | 54（35 个 `*.test.ts(x)`） | Jest 测试套件（记忆基线：45 套件 / 479 项） | 全列 |
| `conversion-backend/` | 39 | 自建 Calibre 后端 | 结构 |
| `geo/` | 66 | GEO 系统相关 | 结构 |
| `data/` | 40 | 站内数据源（`data/seo-geo-board.json` 等） | 结构 |
| `hermes-context/` | 33 | 执行规划只读镜像 | 结构 |
| `教学演示/` | **6** | 教学演示包 | **全读 README** |
| `docs/training-materials/` | 8 + `_archived/` 3 | 训练材料 | **全读 README** |
| `海外接单/` | **9** | 对外弹药库 | 全列 |
| `社媒/` | **18** | Reddit/X 文案与自检 | 全列 |
| `文章_我用AI开发网站GEO实验室/` | **4**（219+227+186+90 行） | 对外长文与案例页 | 目录 + 关键句检索 |

### 1.2 项目根 `E:\一人公司\电子书格式转换站\`

| 项 | 说明 |
|---|---|
| `电子书转换工具站 — 从零到一完整规划.md`（873 行） | **原始规划主文档**（已读结构与关键段） |
| `电子书转换工具站 — 落地成本分析.md`（173 行） | 成本模型 |
| `运营推广计划.md`（149 行） | 推广计划 |
| `电子书转换工具站 — Ahrefs关键词数据最终完整报告.md`（另有同名 PDF） | 选品输入数据 |
| `GROWTH_EVIDENCE_MINING.md`（78 行）+ `TOP_10_PROOF_POINTS.md`（216 行，另有同名 CSV） | 证据挖掘与对外证据包（**已读**） |
| `ai-automation-plan-v2.1.md` | AI 自动化运营方案（已读头部，含对 v2 的自我批判） |
| `report/PROJECT_POSITIONING.md` | ⚠️ **实为 Hydroviv GEO 诊断系统定位，与 BookConv 无关** |
| `_archived/培训课程素材/`（5 篇） | **07-26～08-14 课程素材整理（职能三最早证据）** |
| `_archived/ai-indie-course-course-docs/` | 课程设计文档（PRD/architecture/design） |
| `self-evolve/`、`docs/`（父目录版本，含外链图标资产） | 自动化与素材资产 |

### 1.3 项目根以外（`E:\一人公司\`）

| 路径 | 与本项目关系 |
|---|---|
| `线上课程素材\AI出海实战开发项目\03-BookConv实战复盘\`（15 份） | **BookConv 的课程化复盘成品** |
| `线上课程素材\AI出海实战开发项目\01-课程资产_ai-indie-course\` | 课程资产 |
| `线上课程素材\GEO培训课程\`、`00-三课程生产\` | 平行课程生产（含 QC/红队审计） |
| `nancypet\07-增长研究\AI网站开发实战课程\` | ⚠️ 主体为 NancyPet，非 BookConv |
| `电子书格式转换站专项治理-20261102\` | ⚠️ **本仓库的独立副本**（`.git` 为 regular file，非目录；多个 workflow 与顶层文档不一致）。**不要在副本内作业**，以免产生双份"已完成"状态 |

---

## 2. 资产分类（A–L 十二类）

> 状态口径：**已完整 / 已有部分 / 需补证据 / 需更新 / 历史归档 / 已失效 / 不适合公开**
> "可课程化"= 是否具备教学价值与证据链；"可公开"= 是否需脱敏

### A. 产品规划资料

| 资产 | 路径 | 状态 | 可课程化 | 可公开 |
|---|---|---|---|---|
| 从零到一完整规划（873 行） | 根目录 | 历史归档（有效） | ★★★ 立项方法论典范 | ⚠️ 含成本/ROI，需脱敏 |
| 落地成本分析 | 根目录 | 历史归档（有效） | ★★ | ⚠️ 需脱敏 |
| 运营推广计划 | 根目录 | 历史归档（已被 90 天计划取代） | ★★ | ⚠️ |
| 专家审查 14 问题（规划文档 §十三） | 同上 | 已完整 | ★★★ **AI 生成规划的红队范本** | ✅ |
| Ahrefs 关键词数据报告 | 根目录，`.md` 与 `.pdf` 各一份 | 历史归档 | ★★ 选品方法 | ⚠️ 含第三方数据 |
| `ai-automation-plan-v2.1.md` | 根目录 | 已完整 | ★★★ **"假数据骗自己"的经典反面案例** | ✅ 需脱敏路径 |

### B. 产品设计资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `docs/bookconv用户画像.md` | docs | 已完整 | ★★★ |
| `docs/bookconv用户决策旅程.md` | docs | 已完整 | ★★★ |
| `docs/bookconv内容缺口分析.md` | docs | 已完整 | ★★ |
| `docs/ENTITY.md`（实体陈述 canon） | docs | 已完整 | ★★ |
| `docs/entity-drift-audit-2026-10-19.md` | docs | 已完整 | ★★★ 实体漂移审计方法 |

### C. 技术架构资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `PROJECT_README.md`（20 KB） | 根 | 已完整 | ★★★ |
| `DEPLOYMENT.md`（~14 KB，**2026-11-02 已校正**） | 根 | **已更新**：补自建 Calibre 后端 + 熔断回退；纠正「委派机制已作废」的误判 | ★★★ |
| `docs/DIRECT_UPLOAD.md` | docs | 已完整（R2 直传实施与运维） | ★★★ |
| `conversion-backend/`（39 文件） | 目录 | 已完整 | ★★★ |
| `方案_BookConv转换后端部署_新服务器_2026-10-27.md` + 甲同驻 2 篇 | 根 | 已完整 | ★★★ **架构决策全过程** |
| `方案_路线B重估_Oracle免费Calibre_2026-10-25.md` | 根 | 已完整 | ★★ 方案比较范本 |
| 单源数据架构（data → index.ts → sitemap/rss/llms.txt） | 复盘 §2.3 | 已完整 | ★★★ |

### D. AI Coding 实战资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `BookConv项目复盘V1-中文.md`（22 KB）/ `BookConv项目复盘V1-English.md`（24 KB） | 根 | 已完整 | ★★★ **核心案例**：240 提交/88 页（2026-08-15 快照，当前 360 提交）、四道门禁、三大结论 |
| `文章_我用AI开发网站GEO实验室/`（4 篇） | 目录 | 已完整 | ★★★ 对外叙事成品 |
| `线上课程素材/.../03-BookConv实战复盘/`（15 份） | 项目外 | 已完整 | ★★★ 课程化复盘 |
| `_archived/培训课程素材/主题聚类-做站实战素材.md` | 根/_archived | 历史归档（有效） | ★★★ **按主题组织的课程引用素材** |
| `_archived/ai-indie-course-course-docs/` | 根/_archived | 历史归档 | ★★ |
| `docs/discipline-portability-2026-10-05.md` | docs | 已完整 | ★★★ 经验可移植性评估 |

### E. 测试与 Debug 资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `tests/`（35 个测试文件，含 3 个 `reverse-verify-*`） | 目录 | 已完整 | ★★★ **反向验证门禁**是最高价值教学点 |
| `docs/board-test-remediation-2026-10-25.md` | docs | 已完整 | ★★★ 断言脱节修复 |
| `docs/incident-*.md` ×4（10-19 epub→pdf、10-20 CC402 ×2、10-22 CC402 复发） | docs | 已完整 | ★★★ **失败案例库核心** |
| `诊断_转换失败_空文件与过小输入_2026-11-02.md`（42 KB） | 根 | 已完整 | ★★★ |
| `诊断_转换管线生产故障_2026-08-04.md` | 根 | 历史归档 | ★★ |
| `docs/m8-10-失败签名监控小结-2026-10-27.md` + `M8-10-blindspot-closure-2026-11-01.md` | docs | 已完整 | ★★★ |
| `docs/tasks/bookconv-special-20261102/`（含 es-restoration/REPORT.md、evidence、MANIFEST.sha256.json） | docs | **已完整（最新）** | ★★★ **带哈希清单的可复核交付范本** |

### F. 部署上线资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `DEPLOYMENT.md` | 根 | **已更新（11-02）** | ★★★ |
| `_archived/ops-history/ops-execution/git-deploy-sop.md` | _archived | 历史归档 | ★★★ **"push≠deployed"的原始教材** |
| `docs/DIRECT_UPLOAD.md` | docs | 已完整 | ★★ |
| 红队审计_二次审计修复交付_2026-11-01.md | 根 | 已完整 | ★★★ |

### G. SEO/GEO 资料

| 资产 | 路径 | 状态 | 可课程化 | 可公开 |
|---|---|---|---|---|
| `docs/seo-geo-execution-plan-2026-09-17.md` | docs | 已完整（权威源） | ★★★ | ⚠️ |
| `docs/英文独立站SEO与GEO通用手册-理论框架与SOP-v1`（62 KB） | docs | 已完整 | ★★★ **跨站复用方法论** | ✅ |
| `docs/英文独立站SEO与GEO实施规范手册-v1`（71 KB） | docs | 已完整 | ★★★ | ✅ |
| `docs/SEO-GEO方法论复盘与迭代-V3.0-2026-10-25.md` | docs | 已完整（最新） | ★★★ | ✅ |
| `docs/claim-tier-register.md` | docs | 已完整 | ★★★ 断言分级 | ✅ |
| `docs/golden-sentence-template-2026-10-20.md` | docs | 已完整 | ★★ | ✅ |
| `docs/faq-audit-2026-10-20.md`、`geo-action-plan-2026-10-19.md` | docs | 需更新（部分子步骤状态与作战板不一致） | ★★ | ⚠️ |
| `docs/11月逐日执行计划-红队修订版.md` | docs | **已完整（11 月唯一执行真相）** | ★★ 排程方法 | ⚠️ |
| `docs/Bing与豆包引用放大方案-2026-11-01.md`、`TopicPortfolio*` ×2 | docs | 已完整 | ★★★ | ⚠️ |
| `docs/gsc-index-audit-2026-11-01/`（7 篇 + evidence） | docs | 已完整 | ★★★ **七步闭环范本** | ⚠️ |

### H. 数据分析资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `数据分析/`（241 文件） | 目录 | 混合（含过期快照） | ★★ 需索引化，不能整体课程化 |
| `bookconv_data_asset/`（135 文件，raw_inventory 2,130 行） | 目录 | 已完整 | ★★★ **数据资产化方法论** |
| `教学演示/methodology.md` | 教学演示 | 已完整 | ★★★ **核心可对外** |
| `docs/ga-advanced-analysis-dimensions.md`、`ga4-custom-dimensions.md`、`utm-tracking-spec-v1` | docs | 已完整 | ★★ |
| `docs/教材-BingAI性能分析工作流.md`、`教材-渠道数据分析可信度工作流.md` | docs | 已完整 | ★★★ **已成教材** |

### I. 真实运营资料

| 资产 | 路径 | 状态 | 可课程化 |
|---|---|---|---|
| `docs/BookConv运营全面复盘-2026-11-01.md` | docs | 已完整 | ★★★ **成绩单校正范本** |
| `docs/BookConv_GEO_90天增长工程_WorkBuddy执行指令_V2.0.md` | docs | 已完整（**已入库**，2026-11-02 精确 add） | ★★★ 长任务指令范本 |
| `docs/今日整理与跨文档一致性核验-2026-11-01.md` | docs | 已完整 | ★★ |
| `社媒/`（18 文件，含 `self-check.py`） | 社媒 | 已有部分 | ★★ |
| `待办_2026-10-31_R2直传CORS与GA4行动项.md`（35 KB） | 根 | 已完整 | ★★ |

### J. 课程与教程资料

| 资产 | 路径 | 状态 | 课程化 |
|---|---|---|---|
| `教学演示/`（6 文件） | 目录 | 已完整 | ★★★ **已成包** |
| `docs/training-materials/`（8 + 归档 3） | docs | 已完整，**含勘误表（已证伪结论保留）** | ★★★★ **最有教学价值的设计** |
| `_archived/培训课程素材/`（5 篇，07-26~08-14） | 根/_archived | 历史归档（有效） | ★★★ |
| `海外接单/`（9 文件：提案模板/案例页/作品集/审计模板/苏格拉底审计实例） | 目录 | 已完整 | ★★★ |
| `线上课程素材/AI出海实战开发项目/03-BookConv实战复盘/`（15 份） | 项目外 | 已完整 | ★★★ |
| `文章_我用AI开发网站GEO实验室/`（4 篇） | 目录 | 已完整 | ★★★ 已发布/待发布对外内容 |
| Notion《06｜BookConv 教学、客户案例与对外素材索引 V1.0》 | Notion | 已完整（10-13 最后编辑） | 素材地图 |
| Notion《AI独立开发实战课》系列（总控台 + Round 1~5） | Notion | 已完整 | 课程本体（主体含 NancyPet） |

### K. 方法论与 SOP

| 资产 | 路径 | 状态 | 可移植性 |
|---|---|---|---|
| `docs/new-site-playbook.md` | docs | 已完整 | ✅ 明确跨站复用（新站十步） |
| `docs/英文独立站SEO与GEO通用手册…SOP-v1`（62 KB） | docs | 已完整 | ✅ 通用 |
| `docs/discipline-portability-2026-10-05.md` | docs | 已完整 | ✅ 可移植性评估本身 |
| `docs/critic-design-v1.md`、`feishu-alert-sop-v1.md` | docs | 已完整 | ⚠️ 站点特化 |
| `docs/文档索引.md` | docs | **已完整（10-26/11-02 维护）** | ✅ 索引维护范式 |
| `.workbuddy/TASK-GOVERNANCE.md` + 全局治理协议 | 治理 | 已完整 | ✅ 跨项目已复用 |
| `docs/notion-sync-manifest-2026-11-01.json` | docs | 已完整 | ⚠️ 需核对是否最新 |

### L. 失败案例与经验复盘

| 资产 | 路径 | 状态 | 教学价值 |
|---|---|---|---|
| `docs/training-materials/README.md` **勘误表**（5 条已证伪结论 + 保留理由） | docs | 已完整 | ★★★★ **"把错误结论当教材"的元方法** |
| `诊断_西语本地化扫描与hreflang修复`、`诊断_西语页索引状态核实` | 根 | 历史归档 | ★★★ |
| `诊断_18页Discovered未收录_根因分析` + `审计_Discovered诊断报告_红队复核` | 根 | 已完整 | ★★★ **诊断+红队成对** |
| `红队审计_直传失败三码拆分方案_2026-11-02.md` | 根 | 已完整 | ★★★ |
| `审计_关键词机会方案红队复核`、`审计_转换告警与GA4巡检红队复核`、`审计_Bing_TopicPortfolio快照红队复核` | 根 | 已完整 | ★★★ |
| `方案_CloudConvert零成本缓解_红队审计v2_2026-10-25.md` | 根 | 已完整 | ★★★ |
| `docs/规划红队审计-2026-11-01.md`（17 项 R01–R17） | docs | 已完整 | ★★★★ **规划红队范式** |

---

## 3. 已形成、可直接用于课程的素材（结论）

**可直接用（TEACHING_READY 候选，8 项）**
1. **四道门禁闭环**（seo-critic / code-critic / conversion-verifier / git-sync-check）→ 复盘 §一 三大结论第 1 条
2. **"push≠deployed"部署治理**→ `_archived/ops-history/ops-execution/git-deploy-sop.md` + 复盘 §一 结论 3
3. **AI 自动化假数据事故**（`Math.random()` 冒充队列长度、`Success rate: 95%` 是 fallback）→ `ai-automation-plan-v2.1.md` §一
4. **数据资产化方法论**（杂乱数据 → 可引用证据）→ `教学演示/methodology.md` + `bookconv_data_asset/`
5. **证据分级与 Top10 证据包**（A/B/C 分级 + caveat 同现）→ `TOP_10_PROOF_POINTS.md`
6. **勘误表机制**（保留被证伪结论并标注现行结论）→ `docs/training-materials/README.md`
7. **规划红队 17 项审计**→ `docs/规划红队审计-2026-11-01.md`
8. **反向验证门禁**（注入事故→exit 1，恢复→exit 0）→ `tests/reverse-verify-*.test.ts` + 记忆基线

**需补证据（3 项）**
1. 转换成功率教学案例 —— 缺 job_id 级漏斗，只能用事件计数（**不可**作为"成功率优化"案例）
2. GEO 增长"成功"案例 —— 目前只有 No Change 与引用计数，**不能**做正向增长案例
3. 课程商业验证 —— M-4，无付费数据

**仅内部使用（不可公开）**
- 生产服务器 IP / SSH 细节、`INTERNAL_SECRET`、代理端口
- 客户真实品牌名（Notion 已代号化 Client-A/B/C，本地对照表不入库）
- 未脱敏的 GA4/GSC 原始导出（含 query 全量）
- `retro-2026-10-04.html` 类含 token 的历史文件（已删，git 历史仍在）

---

## 4. 尚未形成系统文档的历史记录（缺口）

| # | 缺口 | 现状 | 建议 |
|---|---|---|---|
| G-1 | 07-26～08-14 的课程素材整理未纳入任何索引 | 仅在 `_archived/培训课程素材/` | 已在本报告 §2 J 登记；新增素材库索引收录 |
| G-2 | 项目根以外 4 处资产从未纳入 BookConv 视野 | 分散在 `线上课程素材/` 等 | 素材库索引建立外部指针 |
| G-3 | 失败案例散落未集中 | 12+ 篇散在 docs/ 与根目录 | 素材库索引第 16 类集中登记 |
| G-4 | 方法论文档未标注证据来源 | 手册类无 back-reference | 沉淀机制 SOP 增加"证据回溯行" |
| G-5 | ~~90 天指令 V2.0 未入库~~ | 原 `git status` 为 `??` | ✅ **已解决（11-02）**：精确 `git add` 单文件入库（禁 `-A`）；**未 push**（避免触发部署） |
| G-6 | Notion 项目总览未链接课程/素材库 | 只见三项阶段目标 | 本次更新补齐 |

---

## 5. Notion 知识资产索引

> 判定口径：**最新** = 内容与 11 月现行口径一致；**重复** = 与其他页内容高度重叠；**需更新** = 内容与当前事实不符

| # | 页面 | 链接 | 主题 | 状态 | 最新 | 重复 | 关系 |
|---|---|---|---|---|---|---|---|
| N-1 | 📈 BookConv GEO｜Google SEO 与生成式 AI 搜索增长项目 | [40cddd…→406ddd…](https://app.notion.com/p/406ddd472a3681be8920c45648289031) | 项目主入口 | ACTIVE | ✅ 11-02 | — | 父：02｜项目；子：11-02 专项治理、ChatGPT 意图归档 |
| N-2 | 2026-11-02｜BookConv 专项治理交付：已发布修复与西语 9 URL 分类治理完成 | [40cddd…8164](https://app.notion.com/p/40cddd472a3681649fa7e4b8b350ec7d) | 治理交付 | ACTIVE | ✅ | — | N-1 子页 |
| N-3 | 2026-11-01｜BookConv 运营复盘、增长规划与一致性核验总包 | [40bddd…81a1](https://app.notion.com/p/40bddd472a3681a1aa5bfc6bb36817a2) | 运营复盘 | ACTIVE | ✅ | — | N-1 子页 |
| N-4 | BookConv运营全面复盘-2026-11-01 | [40bddd…8195](https://app.notion.com/p/40bddd472a3681959938c6f53bfed70e) | 复盘正文 | ACTIVE | ✅ | 与本地 `docs/BookConv运营全面复盘-2026-11-01.md` **双份** | N-3 内页 |
| N-5 | 规划红队审计-2026-11-01 | [40bddd…81b8](https://app.notion.com/p/40bddd472a3681b8975def0a12bcf3bc) | 规划审计 | ACTIVE | ✅ | 与本地 `docs/规划红队审计-2026-11-01.md` 双份 | N-3 内页 |
| N-6 | TopicPortfolio月度复核与增长规划-2026-11-01 | [40bddd…8110](https://app.notion.com/p/40bddd472a368110bf84ebf6fde3afed) | 增长规划 | ACTIVE | ✅ | 双份 | N-3 内页 |
| N-7 | 📦 BookConv 案例库｜总索引 V1.0 | [3ecddd…819a](https://app.notion.com/p/3ecddd472a36819a8e8cf5f62d2b5084) | 案例库索引 | ACTIVE | ⚠️ 10-01 | — | 父：GEO项目｜总览与文档索引 |
| N-8 | 01｜BookConv 项目基础事实 V1.0 | [3ecddd…819c](https://app.notion.com/p/3ecddd472a36819ca5c0fe823d5fe8fa) | 基础事实 | ACTIVE | ⚠️ 10-01（240 commit 等为当时快照） | — | N-7 子页 |
| N-9 | 02｜BookConv 数据资产库结构 V1.0 | [3ecddd…8181](https://app.notion.com/p/3ecddd472a36818191efedede854451f) | 数据资产 | ACTIVE | ⚠️ 10-01 | — | N-7 子页 |
| N-10 | 05｜BookConv 对抗式审计记录 V1.0 | [3ecddd…818a](https://app.notion.com/p/3ecddd472a36818abe5dd31aeeca98d8) | 审计记录 | ACTIVE | ⚠️ | — | N-7 子页 |
| N-11 | **06｜BookConv 教学、客户案例与对外素材索引 V1.0** | [3ecddd…8124](https://app.notion.com/p/3ecddd472a3681248359eca37410c53b) | **教学素材地图** | ACTIVE | ⚠️ 10-13 | 部分与 `海外接单/`、`教学演示/` 重叠（索引性质，可接受） | N-7 子页 |
| N-12 | BookConv｜GEO完整案例素材 V1.0｜Validation / Lab Case | [3ecddd…81c5](https://app.notion.com/p/3ecddd472a3681c595a0e792ffb59bf2) | 案例素材 | ACTIVE | ✅ 11-01 | — | GEO项目｜开发进度与产品闭环 |
| N-13 | BookConv｜Commercial Validation Case #1 V1.0 | [3ecddd…8165](https://app.notion.com/p/3ecddd472a368165ac27e7fdbe4c9e20) | 旧案例定位 | **已被取代** | ❌ | 与 N-12 冲突 | 页内自标 `SUPERSEDED BY` ；**保留不删** |
| N-14 | BookConv｜GEO Growth Loop V1.0 首次真实闭环案例 | [3eaddd…8192](https://app.notion.com/p/3eaddd472a3681928d4ec4b77e293e30) | 首次闭环（No Change） | ACTIVE | ⚠️ 09-30 | — | N-12 前身 |
| N-15 | 🎓 AI独立开发实战课｜课程项目总控台 V1.0 | [3e0ddd…810c](https://app.notion.com/p/3e0ddd472a36810c9f96e715ad84c9b8) | **课程项目** | ACTIVE | ⚠️ 09-19 | — | 父：06｜产品；**未与 N-1 建立链接（本次补齐）** |
| N-16 | AI独立开发实战课｜Round 3C Curriculum Reconstruction Audit V1.0 | [3e0ddd…813d](https://app.notion.com/p/3e0ddd472a36813dad6fde783ccd1ea5) | 课程重构（引用 BookConv 素材） | ACTIVE | ⚠️ 09-19 | — | N-15 子页 |
| N-17 | AI独立开发实战课｜Round 2 课程体系审计 V0.1 | [3e0ddd…81c5](https://app.notion.com/p/3e0ddd472a3681c584e1d791453474b1) | "AI 生成≠生产可用" | ACTIVE | ⚠️ 09-19 | — | N-15 子页 |
| N-18 | AI网站开发实战课程 - 课程总览 | [3e0ddd…81fd](https://app.notion.com/p/3e0ddd472a3681fdbedac8a1c04fad) | 旧版课程（**NancyPet 主体**） | 历史归档 | ❌ | 与 N-15 并存，主体不同 | 已在页首标注身份提示 |
| N-19 | 英文独立站 SEO 与 GEO 实施规范手册 v1.2｜BookConv 个案实施版 | [3e7ddd…811a](https://app.notion.com/p/3e7ddd472a36811a97cad8d2c0e753b8) | 方法手册（个案） | ACTIVE | ✅ 11-01 | 与本地手册双份 | 05｜知识资产 |
| N-20 | 英文独立站 SEO 与 GEO 通用手册…SOP v1.2 | [3e7ddd…81c8](https://app.notion.com/p/3e7ddd472a3681c889dde9fc5d4dd763) | 方法手册（通用） | ACTIVE | ✅ | — | 05｜知识资产 |
| N-21 | GA4 进阶分析维度手册｜BookConv 实战版 V2（原文待整理） | [3d2ddd…803e](https://app.notion.com/p/3d2ddd472a36803e8803e31494c6be22) | GA4 手册 | **REVIEW（正文格式损坏）** | ❌ | — | N-1 已登记为历史提纲 |
| N-22 | BookConv 转换后端同驻香港机 · 隐患论证与收益 | [406ddd…8185](https://app.notion.com/p/406ddd472a3681859be5e3dd4a3c9c31) | 架构决策 | ACTIVE | ⚠️ 10-27 | — | 拓知 GEO 服务器选型记录 |
| N-23 | Notion 全工作区知识资产治理｜统一导航与审计台账 V1.0｜2026-11-01 | [40bddd…816d](https://app.notion.com/p/40bddd472a36816d8a5fe1ef3495dd48) | 工作区治理 | ACTIVE | ✅ 11-02 | — | 全局 |

**Notion 重复与冲突小结**
- **双份正文**：N-4/N-5/N-6 与本地同名文档内容重叠。处置：Notion 为决策索引，本地为证据原文，**不删除任何一份**，在两处标注主从关系。
- **冲突**：N-13 与 N-12 定位冲突（Commercial Validation vs Lab Case）→ 采用 N-12（更新）+ 保留 N-13 并标取代。
- **主体混淆风险**：N-18（NancyPet 主体）易被误读为 BookConv 课程 → 已在 N-15/N-1 侧明确区分。
- **未链接**：N-15（课程总控台）与 N-1（BookConv 项目）之间**无任何链接** → 本次补齐。

---

## 6. 盘点执行说明（防"为盘点而复制"）

1. 本报告**只建立索引与引用关系**，未复制任何原始文件内容。
2. 未移动、未重命名、未删除任何现有文件。
3. 新增文件仅 7 份（本报告 + 战略 2 份 + 素材库 2 份 + 治理 2 份），均为新目录 `docs/strategy/`、`docs/learning-materials/`、`docs/project-governance/`，与既有目录无冲突。
4. 文件计数为 2026-11-02 单时点快照，不作为长期基线。

---

## 7. 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| V1.0 | 2026-11-02 | 首次盘点：15 个本地目录 + 4 处项目外资产 + 23 个 Notion 页面；A–L 12 类；8 项可课程化 + 3 项需补证据 + 3 类不可公开；6 项缺口 |
