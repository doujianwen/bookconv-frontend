# CP9 周报模板 v1.2（BookConv SEO/GEO）

适用：CP9 §9.2 每周运行｜首次落地：2026-11-03｜**v1.2 修订 2026-11-04**（§3.1 拆三表、撤下"入口环境分层"命名；§3.2 撤下不可执行的 UTM 建议；禁用清单 15 → 18 条）｜下次触发：2026-11-09（联合周评审②）
本地权威口径来源：`docs/project-governance/BookConv-SEO-GEO首次执行报告-CP0-CP11-2026-11-02.md` §CP3/§CP9；
本次修订依据：`红队审计_GA4来源细化结论_2026-11-04.md`（第 1–3 轮；A4/A7/A9/B5/B6/B8/B10 命中）；
本模板只补「第 7 步 来源结构」与「禁用写法清单」，不重写 CP9 的 10 步流程。

---

## 0. 复制即用：周报头（必填）

```
周报｜<YYYY-MM-DD 周一>
数据截止：GSC <YYYY-MM-DD>（2 天延迟）｜GA4 <YYYY-MM-DD>（属性本地日）｜Bing Web <至>｜Bing AI <至>
窗口：本周 7d <起>~<止>｜可比前窗 7d <起>~<止>｜28d <起>~<止>｜prior28d <起>~<止>
时区：GA4=属性时区（非 UTC，实测≈UTC+2；精确标识 UNKNOWN）｜GSC=太平洋时间
采集命令：<逐条列出实际跑过的命令>
```

---

## 1. 一页结论（先写裁定，再写依据）

| 线 | 本周裁定 | 对象 | 依据（1 句 + 数字） |
|---|---|---|---|
| Google 自然搜索 | CONTINUE / REVISE / OBSERVE / PAUSE / STOP / SCALE | 具体页面或关键词 | |
| Bing 经典搜索 | 同上 | | |
| Bing AI 引用（可见度） | 同上 | | |
| AI 引荐（会话） | 同上 | | |
| 其他引荐 / 社交 | 同上 | | |
| 直接访问 | 同上 | | |

> 每行**必须**给一个裁定和**一个对象**。「整体继续」不算裁定。

---

## 2. 全站规模（用户与会话分开写，绝不混用）

| 指标 | 本周 7d | 前窗 7d | 28d | prior28d | 口径 |
|---|---:|---:|---:|---:|---|
| 期间去重活跃用户（activeUsers） | | | | | 整段 dateRange 服务端结果 |
| 日均活跃用户（逐日相加÷日历天） | | | | | 与上一行**不是**同一个数，勿互相替代 |
| 总用户（totalUsers） | | | | | 与 activeUsers 分别列 |
| 会话 | | | | | 会话口径基准 |
| 互动会话（率） | | | | | 定义含关键事件，见 §6 禁用写法 |
| 关键事件 | | | | | **2026-10-12 前恒为 0，跨窗不可比** |

---

## 3. 来源结构表（本模板新增的核心，CP9 第 7 步）

采集：`node scripts/fetch-ga4-acquisition.mjs --start <起> --end <止> --out 数据分析/GA4_acquire_<窗口>.json`
（内置 ①–㉖ 报表；⑱–㉑ 为 page_view 口径，㉒–㉖ 为 session 口径。**两套口径都取，不得只取一套**）

| 来源／媒介 | 会话 | 互动（率） | 关键事件 | 主要落地页 | 国家 | 数据质量 | 证据等级 | 建议动作 |
|---|---:|---:|---:|---|---|---|---|---|
| `(direct)/(none)` | | | | | | 归因未知，不可拆 | FACT（计数）/UNKNOWN（实质） | |
| `doubao.com` / referral | | | | | | 渠道组归 Referral，不认作 AI | | |
| `cn.bing.com` / referral | | | | | | **被渠道组并入 Organic Search** | | |
| `(not set)/(not set)` | | | | | | 0 互动却有事件即为异常 | | |
| `google` / organic | | | | | | GSC 对照另列 | | |
| `…` | | | | | | | | |

**三查（每期必做）**

1. 会话逐行相加是否等于 `periodTotals.sessions`？（不等要写差多少、为什么）
2. 渠道组与来源表**各自**闭合，交叉相加是否翻倍？（`Organic Search` 是否含 cn.bing/so.com）
3. `(not set)` 会话数、`app.seobotai.com` 等已知机器源、Direct 占比是否异常波动？

---

## 3.1 两套分层：page_view 上游 ≠ 会话入口（**必须分开写**）

> 2026-11-04 新增，**同日被红队推翻并重写**。原版把 page_view 级（`pageReferrer`）的分层表命名为「入口环境分层」，这是错的：`pageReferrer` 是**每个 page_view 的上游页**，会话内跳转会大量污染它，不能回答"从哪来"。
>
> 实测差多少：同一批数据，page_view 级 container 42（4.8%）、none 420（47.6%）；会话级（`session_start`）container **0**、none **348（81.7%）**。**同一套标签在两个层级含义相反**，故模块强制声明 `level`，不声明直接抛错。

采集：同一条命令已内置（⑱–㉖）。规则单一事实源：`scripts/lib/referrer-tiers.mjs`。
自检（每次改口径前必跑）：`node -e "import('./scripts/lib/referrer-tiers.mjs').then(m=>m.selfTest())"` → 应报 `passed: 15`

### 表 3.1-A：page_view 上游分层（`pageReferrer` × page_view 事件）

**只能用来回答"页面之间的流转"，不能用来回答"用户从哪来"。**

| 层 | 判据 | page_view | 占比 |
|---|---|---:|---:|
| A 上游页带容器参数 | 前一页 URL 命中 `use_xbridge3` / `webview_progress_bar` / `push_animated` / `sec_link_scene` / `loader_name` / `f_link_type` / `hybrid_event_param` | 42 | 4.8% |
| B 上游页为站内 | 前一页为本站域名、无容器参数 | 343 | 38.9% |
| C 上游页为外部域 | host 明细见下行 | 77 | 8.7% |
| D 上游页为空 | 前一页为空 | 420 | 47.6% |
| **合计** | 必须 = `screenPageViews` | **882** | 100% |

**外部域名明细**：`cn.bing.com 33｜www.doubao.com 32｜www.baidu.com 4｜www.bing.com 2｜www.so.com 2｜chatgpt.com 1｜search.yahoo.com 1｜www.google.com.hk 1｜www.google.com 1`

### 表 3.1-B：会话入口分层（`session_start` × `pageReferrer`）—— 回答"从哪来"用这张

| 层 | 判据 | 会话 | 占比 |
|---|---|---:|---:|
| A 入口上游页带容器参数 | —— | **0** | 0% |
| B 入口上游页为站内 | 跨标签页 / 会话续期 | 19 | 4.5% |
| C 入口来自外部域 | 明细见下行 | 59 | 13.8% |
| D 入口无 referrer | 直接访问 / App 内打开 | **348** | **81.7%** |
| **合计** | = `session_start` 事件数 | **426** | 100% |

**入口外部域名**：`www.doubao.com 26｜cn.bing.com 25｜www.bing.com 2｜chatgpt.com 1｜search.yahoo.com 1｜www.baidu.com 1｜www.google.com.hk 1｜www.google.com 1｜www.so.com 1`

**A 层恒为 0 不是缺陷**：容器参数出现在**落地页自身的 URL** 上，不在"上一页"。所以"从 IM 容器打开"要用 `pageLocation` 测（见表 3.1-C），用 `pageReferrer` 测永远得 0。

### 表 3.1-C：从容器打开的会话（`session_start` × `pageLocation`）

本期 **51 会话 / 426 = 12.0%**（按 `sessions` 449 算则为 11.4%，写作时必须说明分母）。
**归因结果：51 个全部是 `(direct)/(none)`** ⇒ 这部分是 Direct 336 中**可解释的 15.2%**，其余仍为黑箱。

**分层三查**

1. 表 A 四层相加 = `periodTotals.screenPageViews`？表 B 相加 = `session_start` 事件数？**任一不等即停**，不得写百分比。
2. 分母写清了吗？表 A 是 page_view、表 B 是 session_start 事件（**不是** `sessions` 449）、表 C 必须注明用哪个分母。
3. 外部域名 host 是否出现新面孔？新 host = 新渠道，须单列并判证据等级。

**口径铁律**
- 表 A 的 42 个事件 **≠ 42 个会话**，**≈ 0 个"从容器打开"的会话**。要回答"多少用户从哪来"只能用表 B / 表 C。
- `session_start` 事件数（426）**≠** `sessions` 指标（449），**也 ≠** 逐日 sessions 相加（450）。三个数都不同，引用时必须写明是哪一个。
- 差额 24 = Unassigned 渠道组的 24 个会话（该渠道组 `session_start` 事件数为 0）。这批数据的性质见 §6 遗留。

---

## 3.2 带容器参数的落地 URL（只证明"容器环境"，不证明"哪个 App"）

数据在 `containerLanding` 报表。本期 **13 行 / 69 个 page_view**，UTM 全为 `none`。最有解释力的一条：

```
?enable_bottom_share_style=1&hybrid_event_param=HybridEventParams(enterMethod=message_markdown_url,...)
```

解码后含 `localPage=chat` / `chatType=default` / `bot_id=...` / `conversation_id=...` / `reply_id=...`，形态指向**聊天窗口内的 markdown 链接**。另有 `f_link_type=f_linkinlinenote` + `sec_link_scene=im` + `loader_name=forest` 同类信号。

> ⚠️ **样本量警告**：这条只出现 **1 个 page_view**（n=1）。可作为"存在这种入口"的直证，**不可外推到全部 51 个容器会话**。

**用途与限制（2026-11-04 红队修正）**：原版写"这些 URL 是最该补 `utm_source` 的地方"——**不可执行**。核查 `src/` 全库无 `navigator.share` / `shareUrl` / `utm_source`，站点**没有分享链接生成能力**；容器参数是 App 附加的，不是我们加的。正确动作是**新增分享按钮/分享链接生成器并预置 UTM**（产品功能，需排期），且只能覆盖"经我们分享出去的链接"，覆盖不了用户手动复制地址栏。
**参数只证明"容器环境"，不证明"哪个 App"**，具体 App 仍为 UNKNOWN，不得在周报里点名。

---

## 4. 落地页与国家

| 落地页组 | 会话 | 互动 | 关键事件 | 互动率 |
|---|---:|---:|---:|---:|
| `/` | | | | |
| `/convert/*` | | | | |
| `/guide/*` | | | | |
| `/blog/*` | | | | |
| `(not set)` + 其他 | | | | |

国家 Top3 + 目标市场占比：<填>。中国占比 >90% 时必须在结论里明写「不是目标海外用户」。

---

## 5. 转化（只报事件，不算成功率）

| 事件 | 次数 | 用户 |
|---|---:|---:|
| `file_upload` | | |
| `conversion_complete` | | |
| `conversion_failed` | | |
| `file_rejected_client` | | |

`error_code` 分布：<填>；合计是否等于 `conversion_failed`：<是/否>。

> `conversion_complete` = 客户端收到 200 + blob（`ToolPageClient.tsx:281`）。**无 job id ⇒ 任务级成功率写 UNKNOWN。**

---

## 6. Google 与 GSC（单列，不并入全站结论）

| 项 | 读数 | 窗口 | 口径 |
|---|---:|---|---|
| GSC 汇总点击/展示 | | | date 维度 = 汇总 |
| GSC 查询样本点击/展示 | | | query 维度 ≠ 汇总，须写覆盖率 |
| 品牌词 | | | `bookconv` 及变体 |
| 非品牌词 | | | 点击/展示/平均位置 |
| GA4 `google/organic` 会话 | | | 会话口径，与 GSC 点击**不要求相等** |

**禁止**用「GSC 点击 − GA4 会话」推算其他渠道。

---

## 7. 禁用写法清单（写周报时逐条自查）

| # | 禁用写法 | 正确写法 |
|---|---|---|
| 1 | 「全站流量 X」但只引 GSC | Google 结论与全站结论分段写 |
| 2 | 用总用户（totalUsers）替代活跃用户，或反之 | 两个指标都列，标明用哪个 |
| 3 | 逐日用户相加当期间去重用户 | 期间去重走整段查询；逐日相加只写「日均」 |
| 4 | 「AI 引用 33,834」当访问量 | 引用是可见度，访问看 GA4 会话；两者不相加 |
| 5 | 「成功率 72%」由 complete/upload 得出 | 只写事件计数；任务级成功率写 UNKNOWN |
| 6 | 用 32 个会话宣布某渠道是增长引擎 | 写样本量 + OBSERVE，不预设赢家 |
| 7 | Direct 拆出「社交/AI」 | Direct 保持归因未知；要拆先上 UTM |
| 8 | 跨窗口比互动率/关键事件 | 2026-10-12 前关键事件恒 0，注明不可比 |
| 9 | 把 `Organic Search` 渠道组当 Google | 并读来源表：cn.bing/so.com 被并入该组 |
| 10 | 用百分比描述 n<10 的差异 | 只写方向，写样本量 |
| 11 | 用 `pageReferrer` / `pagePath` 配 `sessions` 出占比 | 两者与会话指标**不兼容**（实测膨胀 1.63x / 1.59x）；改配 `eventCount` 且限 `eventName=page_view` |
| 12 | 从 `landingPage` 找 URL 参数（utm、容器参数） | GA4 已剥离 query；只能从 `pageLocation` / `pageReferrer` 取 |
| 13 | 把「A 层 42 个 page_view」写成「42 个会话来自 App」 | 事件口径 ≠ 会话口径，不可换算；容器会话数须用 `session_start` × `pageLocation` 取，实测 **51**（非 42、非 69） |
| 14 | 由容器参数推断具体是哪个 App（飞书/微信/小红书） | 参数只证明「容器环境」，App 归属 **UNKNOWN**，周报里不点名 |
| 15 | 用 `keyEvents ÷ sessions` 算「转化率」 | 分子事件、分母会话，得到的是「每会话事件数」；转化率须分子分母同为人数 |
| 16 | 用 page_view 上游分层表（表 3.1-A）回答「用户从哪来」 | `pageReferrer` 是**每页上游**，不是会话入口。实测同一批数据 container 42 vs **0**、none 420 vs **348**，差一倍以上 |
| 17 | 把 `session_start` 事件数当 `sessions` | 实测 426 vs 449（逐日相加 450）。三个数都不同，引用时必须写明是哪一个 |
| 18 | 把「在这些 URL 上补 utm_source」写成可执行动作 | `src/` 无 `navigator.share` / `shareUrl` / `utm_source`，站点**没有分享链接生成能力**；须先建分享功能，且只覆盖经我们分享的链接 |

---

## 8. 本周遗留与下期触发

| 遗留 | 等级 | 最小解阻 | 谁解阻 |
|---|---|---|---|
| | P0/P1/P2 | | 用户 / 产品线 / 本线 |

下次触发：<YYYY-MM-DD>｜检查点文件：<路径>｜未完成项见任务板 M8-1 / M12-1。

---

## 9. 变更记录

| 版本 | 日期 | 变更 | 依据 |
|---|---|---|---|
| v1 | 2026-11-03 | 首建：来源结构表 + 三查 + 禁用写法 10 条 | GA4 来源结构核验 |
| v1.1 | 2026-11-04 | 新增 §3.1 入口环境分层（事件口径）、§3.2 容器参数 URL；禁用写法 10→15 条（#11–#15）；§3 采集命令内置 ⑱–㉑ 报表 | 红队审计：`pageReferrer×sessions` 不闭合（547 vs 336）、`keyEvents÷sessions` 口径错（4.7x → 1.45x） |
| **v1.2** | **2026-11-04** | **§3.1 拆为三张表**（3.1-A page_view 上游 / 3.1-B 会话入口 / 3.1-C 容器会话），删除"入口环境分层"这一误导命名；§3.2 改为"只证明容器环境、不证明 App"，并撤下"补 utm_source"的不可执行建议；禁用写法 15→18 条（#16–#18）；采集内置 ⑱–㉖ | **红队第 3 轮**：`pageReferrer` 是每页上游≠会话入口（container 42 vs **0**、none 420 vs **348**）；容器会话实测 **51**；`session_start` 426 ≠ `sessions` 449；`src/` 无分享能力 |
