# 事故报告：CloudConvert 402 晚间复发 + 已确认自愈（2026-10-20）

> **性质**：与上午同一根因的**复发**，非新故障。本报告为**权威版**，整合 Hermes 独立诊断（`hermes-context/incident-2026-10-20-cloudconvert-402-recurrence-evening.md`）+ 主会话独立复核更正 + 两项决定性实测证据。
> **状态**：✅ 服务已于 23:12（北京）实测恢复；⚠️ 结构性风险未解，预计次日复发。

## 元信息

| 条目 | 详情 |
|---|---|
| 告警 1 | Job `8d5a8e79-7b50-444b-8148-c1cd2ab25f9d`，`epub→azw3`，engine=calibre，`2026-10-20T14:24:27Z`（北京 22:24） |
| 告警 2 | Job `fde9e5d7-8e73-4577-b76b-d08368323d1b`，`epub→pdf`，engine=calibre，`2026-10-20T14:43:34Z`（北京 22:43） |
| 路径 | sync `/api/convert`（`src/lib/alerts.ts`） |
| 错误 | `CloudConvert job failed after 1 attempt(s) \| engine=calibre: CloudConvert client error 402: Your account has run out of conversion credits` |
| 上午同类 | `1601068e…`（epub→azw3/calibre，03:04Z）、`0afc2153…`（pdf→epub/auto，03:33Z） |
| 报告时间 | 2026-10-20 23:20（北京） |

---

## 0. 结论先行（TL;DR）

1. **根因不变：CloudConvert 账户 credits 耗尽。** 与上午同源，不是新 bug、不是后端崩溃、不是网络抖动。
2. **但真正的定性是「结构性容量不足」，而非「偶发额度用光」。** Dashboard 实测 24h 内 `Credits consumed = 10`，**恰好等于免费档每日上限 10** —— 站点日用量已顶满免费额度，因此**每天必然在当天某个时点耗尽，之后全天 402**。这完美解释「上午 11:04 已耗尽 → 晚间 22:24 仍耗尽」：不是跨日未重置，而是**同一 UTC 自然日内额度早被用完**。
3. **服务已自愈（实测确认）**：23:02 余额回到 10 → 23:12 线上实发 `epub→azw3` 返回 **HTTP 200 / 10,653 bytes / 6.0s**，输出文件 offset 60 = `BOOKMOBI`（真 AZW3 容器，非 HTML 兜底）。**充值不是本次恢复的必要条件。**
4. **P1 纯 JS 兜底（commit `590c704`）未覆盖本案两对，属设计边界而非缺陷**：`epub→azw3` / `epub→pdf` 目标是专有二进制输出，纯 JS 无法产出可用文件，已明确排除。
5. **唯一真解是升级 CC 付费档（消除每日上限）**。等日重置只能恢复、不能防止次日再挂；扩展纯 JS 对这两对已判死。

---

## 1. 两项决定性实测证据（本报告新增）

### 1.1 Dashboard 实测（用户提供截图，2026-10-20 23:02 北京）

| 读数 | 值 | 含义 |
|---|---|---|
| Conversion credits remaining | **10**（进度条满格） | 当前额度已回满 → 套餐 = **Free 档 10/天** |
| 统计窗口 | Last 24h | — |
| Successful conversions | 8 | — |
| Failed conversions | 4 | 对应 4 条 402 告警（上午 2 + 晚间 2） |
| **Credits consumed** | **10** | **恰好等于免费档日上限** → 日用量顶满 |
| File size converted | 10 MB | 流量极小，非大文件拖累 |

> **关键推论**：`consumed=10` 与 `remaining=10` 并存，说明**重置已发生**。但重置的确切时刻 **Unknown**（见 §6），不影响「日用量=日上限」这一结构性结论。

### 1.2 线上反向验证（主会话实测）

```
POST https://www.bookconv.com/api/convert
  file=probe.epub (1,327B 最小合法 EPUB)  source_format=epub  target_format=azw3
→ HTTP=200  SIZE=10653  TIME=6.01s
→ offset 60 = "BOOKMOBI"（PalmDB type/creator）
→ dbname = "Probe_402_Recovery_Test"
```

**判定：转换为真实成功，输出为可用的 AZW3 容器**（PalmDB 前 32 字节为书名，故首字节不是 `BOOK`，需查 offset 60 —— 这也是「只看魔数会误判」的又一例）。

---

## 2. 对前序报告的两处更正

### 2.1 上午报告（`docs/incident-2026-10-20-cloudconvert-402-credits.md`）

| # | 原表述 | 更正 | 依据 |
|---|---|---|---|
| C1 | 「免费档每日 10，已用 15」 | **逻辑矛盾**。若上限为 10，不可能「已用 15」。**本报告实测：24h consumed = 10，remaining = 10，套餐确为 Free/10-per-day**。「15」应为统计口径误读（可能跨窗口或含失败计数）。 | Dashboard 截图 |
| C2 | 「充值是最短路径（P0）」 | **充值不是恢复的必要条件**——本案已在未充值情况下自愈（§1.2）。充值的价值在于**消除每日 10 上限**，而非「救活本次」。 | 线上探针 |
| C3 | 引用 Package 定价 `$17/1000` | 价格存疑：Hermes 采集为 `$18/1000`，`DEPLOYMENT.md` 记 `$17`。**以官网结算页为准，本报告标 Unknown。** | 两源冲突 |
| C4 | §2.1 受影响对清单不全 | 已按 §3 实测重列。 | 精确计数 |

### 2.2 Hermes 报告（`hermes-context/…-recurrence-evening.md`）

Hermes 的 Q1/Q2/Q5/Q6/Q7 结构完整、结论方向正确，但 **Q4 存在硬伤，已由主会话证伪**：

| # | Hermes 表述 | 实测结论 | 证伪命令 |
|---|---|---|---|
| H1 | 「Fact：`grep -c '"tool"' src/lib/conversion-map.ts` = **36**」 | ❌ **该命令实际返回 0**（源码写法是 `tool:`，键不带引号）。此「Fact」不可复现，数字系编造。 | `grep -c '"tool"'` → `0` |
| H2 | 「CONVERSION_MAP = 36 对」 | ❌ 实际 **35 对** | `awk 'NR>=27&&NR<=61' … \| grep -cE '^\s*"[a-z0-9]+-[a-z0-9]+":'` → `35` |
| H3 | 「纯 JS / 本地免疫 = 18 对」 | ❌ 实际 **15 对** `tool:"js"` + **1 对** `passthrough`（epub→zip，同样免疫 402）= 免疫 **16 对** | 按 tool 分组统计 |
| H4 | 把 `epub→rtf`、`epub→fb2` 列为「纯 JS 免疫」 | ❌ `epub-rtf` 实为 `calibre`；**`epub-fb2` 键根本不存在** | `grep -n "epub-fb2"` → NOT_FOUND |
| H5 | 「CloudConvert 路径 = 18 对」 | ❌ 实际 **19 对**（35 − 15 js − 1 passthrough） | 同上 |

> **教训（固化）**：Hermes 会自造「看似可执行的 Fact 命令」并给出不可复现的数字。**凡引用他人结论中的计数/命令，必须自己重跑一遍**；计数值一律用「按字段分组」而非单点 grep。

---

## 3. 影响面（精确实测）

`src/lib/conversion-map.ts` 共 **35 对**，按 `tool` 字段分组：

| tool 声明 | 数量 | 是否受 402 影响 |
|---|---|---|
| `js` | 15 | ❌ 免疫（纯 JS） |
| `passthrough` | 1（`epub→zip`） | ❌ 免疫（本地解包） |
| `calibre` | 16 | ✅ 100% 失败 |
| `calibre+imagemagick` | 2（`epub→jpg`、`epub→png`） | ✅ 100% 失败 |
| `libreoffice+calibre` | 1（`doc→epub`） | ✅ 100% 失败（无对应分支，落 CC） |

**合计：免疫 16 对 / 依赖 CloudConvert 19 对（402 时全失败）。**

本次两条告警的 `epub→azw3`、`epub→pdf` 均在 **CC 依赖区**，且属 P1 明确排除的「专有二进制输出」，故 P1 上线后仍失败是**预期行为**。

---

## 4. 系统行为正确性（均按设计工作）

| 组件 | 实测结论 | 证据 |
|---|---|---|
| 402 短路缓存 | TTL 5min（`cloudconvert.ts:27`）。两告警间隔 19min > TTL，且为不同 cold start → 各自独立命中 402，符合进程级语义 | 告警时间戳 |
| 告警节流 | `ALERT_COOLDOWN_MS = 10min`（`alerts.ts:27`），签名 = `kind + ':' + error[:80]`。两条 error 前 80 字符**相同**（均 `engine=calibre`），但间隔 19min > 10min → 两条均发出。**非 bug** | 复算 slice(0,80) 确认一致 |
| 错误码映射 | `cloudconvert client error 402` → `CONVERSION_QUOTA_EXCEEDED`（`error-handler.ts:52`），用户文案已提示「EPUB to TXT and ZIP 仍可用」 | 代码 |
| 前端短路 | `BatchUpload.tsx` 识别该码后置 `quotaExhausted=true`，跳过本批剩余文件 | 代码 |
| 告警通道 | 4 条告警全部真实送达飞书 → 10-02 静默假成功修复仍有效 | 用户实收 |

**结论：无「静默假成功」。链路诚实。**

---

## 5. 方案（ROI 排序）

| 排序 | 方案 | 成本 | 收益 | 风险 | 改码 | 判定 |
|---|---|---|---|---|---|---|
| **1** | **升级 CC 付费档**（Package 1000 credits 不过期 / Subscription 1000/月） | 约 $17–18 一次性，或 $10/月起 | **消除每日 10 上限**，19 对 CC 路径全天可用 | 用量超 1000 后再耗尽 | 否 | ✅ **P0 必做** |
| 2 | 预消耗监控（每日查 `/v2/users/me`，<20% 飞书预警） | 低 | 避免「全挂才发现」 | 极低 | 是（cron） | ✅ P1 配套 |
| 3 | 启用 VPS Calibre 后端（`CONVERSION_BACKEND_URL`） | 中（实例已到期需重购） | 彻底解耦 CC | 运维成本 | 是 | ⚠️ 中期评估 |
| 4 | 402 时文案兜底优化 | 低 | 已有基础覆盖 | 无 | 小 | ⚠️ 锦上添花 |
| 5 | 纯 JS 产出 azw3/pdf | 极高 | 理论免疫 | **产出不可用** | 大规模 | ❌ 判死 |
| 6 | 换供应商 | 高 | 不确定 | 迁移风险 | 大 | ❌ 不推荐 |

> **为什么「等日重置」不算方案**：24h consumed = 10 = 日上限，说明**每天都会用满**。重置只能让服务在次日短暂恢复，随后再度耗尽 —— 这是可预测的每日循环故障，不是一次性事故。

---

## 6. 验收判据

**已由本报告完成：**
- [x] 线上 `epub→azw3` 返回 HTTP 200 + 真 AZW3（offset 60 = `BOOKMOBI`）
- [x] Dashboard 余额恢复到 10
- [x] 4 条告警均真实送达飞书

**升级付费档后需补验：**
- [ ] `epub→pdf` 单独实发一次，HTTP 200 + `%PDF` 魔数
- [ ] 连续 7 天 0 条 402 告警
- [ ] GA4 `conversion_failed` 中 `CONVERSION_QUOTA_EXCEEDED` 归零

**仍为 Unknown（需人工登录 dashboard）：**
- [ ] 额度重置的确切时刻与时区（本报告只能确认「已重置」，不能确认「何时重置」）
- [ ] Package 实际单价（$17 vs $18）
- [ ] 「失败转换是否扣 credit」——dashboard 显示 8 成功 / 4 失败 / 10 consumed，若失败不扣费则 8 次成功耗 10 credits（存在 2-credit 转换类型，如 PDF→Office=4）

---

## 7. 残留风险

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| **次日复发性 402**（免费档 10/天 < 日用量） | **高（近必然）** | 19 对转换全失败 | 方案 1（升级付费档） |
| 升级后再次耗尽 | 低–中 | 同上 | 方案 2 预消耗预警 |
| 纯 JS 区（16 对）功能降级（丢图/样式/目录） | 已知 | 输出质量下降 | 已在 product 层接受为降级语义 |
| 人工确认遗漏（reset 时刻未知） | 中 | 无法预判耗尽时点 | 方案 2 直接查余额，绕开 reset 时刻问题 |

**残余等级：P1**（服务已恢复，无 P0；但结构性风险未消，需人工决策付费档）。

---

## 8. 证据等级表

| 结论 | 等级 | 来源 |
|---|---|---|
| 套餐为 Free 10/天 | **Fact** | Dashboard 截图（remaining=10，consumed=10/24h） |
| 24h 用量顶满日上限 | **Fact** | Dashboard `Credits consumed = 10` |
| 线上已恢复 | **Fact** | 探针 HTTP 200 + `BOOKMOBI` |
| 根因 = credits 耗尽 | **Fact** | 402 原文 + dashboard |
| P1 未覆盖两对 | **Fact** | `conversion-map.ts:27,33` 均 calibre |
| 35 对 / 15 js / 19 CC | **Fact** | 按 tool 分组实测 |
| 重置时刻 | **Unknown** | CC 文档未公开；需人工观察 |
| Package 单价 | **Unknown** | $17 与 $18 两源冲突 |
| 失败是否扣 credit | **Assumption** | 官方称仅成功扣费，未独立验证 |

---

## 9. 参考

- `src/lib/conversion-map.ts`：35 对声明（L26–62）
- `src/lib/cloudconvert.ts`：402 短路（L106–109）、`quotaExhaustedUntil` TTL（L26–33）
- `src/lib/alerts.ts`：节流 10min（L27）、签名规则（L146）
- `src/lib/error-handler.ts`：402 → `CONVERSION_QUOTA_EXCEEDED`（L52）
- `hermes-context/incident-2026-10-20-cloudconvert-402-credits.md`：上午报告（含 C1–C4 更正）
- `hermes-context/incident-2026-10-20-cloudconvert-402-recurrence-evening.md`：Hermes 独立诊断（含 H1–H5 更正）
- CloudConvert 官方定价页：Free `10/day, Daily reset`；Package `never expire`；Subscription `1000/month`

---

*本报告为诊断，不含代码改动。P0 决策（是否升级付费档）留待人工拍板。*
