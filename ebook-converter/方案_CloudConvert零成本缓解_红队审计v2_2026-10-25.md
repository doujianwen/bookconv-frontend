# 路线 A 红队审计与修订 v2（CloudConvert 零成本缓解）

> 依据：`E:/一人公司/FDE/项目治理机制_V1.0/通用任务治理协议_V1.0.md` §2（PLAN 阶段一次范围红队）、§3（P0/P1/P2）、§5（Fact / Assumption / Unknown）。
> 审计对象：`方案_CloudConvert零成本缓解_2026-10-25.md` 中的**路线 A**（A1 缓存 / A2 额度预算 / A3 降级 / A4 扩本地格式）。
> 阶段定位：本协议 §2 的 **VERIFY / RED-TEAM** 环节，未进入 EXECUTE（代码改动仍待用户确认后由本人实施 + 用户审核）。

---

## 0. 终点定义（红队范围）
- **目标**：在不增加任何成本的前提下，降低 CloudConvert 402 的**发生频率与严重程度**，使免费档在当下低流量下"够用"，并保留可观测性。
- **非目标（明确划出）**：路线 A **不承诺消除** 402 复发；结构性消除只有两条路（B 自托管 Calibre / 付费），均按用户决策延后到 monetization 后。
- **本红队只判定"计划是否周全、可否进入实施"，不判定"是否已修好"**。

---

## 1. Fact / Assumption / Unknown（已核验 vs 待核验）

| 项 | 类别 | 内容 | 证据 |
|---|---|---|---|
| CloudConvert 免费档 = 10 credits/天、每日重置 | **Fact** | 官方 pricing 页明确 | `cloudconvert.com/pricing`（2026-10-25 WebSearch） |
| **credits ≠ 转换次数**；每种类型有基础 credit 成本（General 1 / Office→PDF 2 / PDF→Office 4…），超 1 分钟按分钟追加；仅成功计费 | **Fact** | 官方 "What are conversion credits?" | 同上 |
| R2 代码存在但**主链路未接线**，仅 `api/download` 直连；`isR2Configured()` 依赖 3 个 env | **Fact** | README / PROJECT_README / `provider-repo.ts:420` / `src/lib/storage/r2.ts` | 代码与文档一致 |
| Vercel 本地 FS 临时、不跨请求持久 | **Fact** | Serverless 特性 + README | 项目常识 |
| Upstash Redis 已集成（`src/lib/redis.ts`、`subscription.ts` 使用） | **Fact** | 代码存在且被订阅链路使用 | `src/lib/redis.ts` |
| `rate-limit.ts` 存在且含 Cloudflare CIDR 解析 | **Fact** | 代码存在 | `src/lib/rate-limit.ts` |
| "站点 24h 用量已达 10 credits" | **Assumption → 待核验** | 来自历史会话 MEMORY，非 CC Dashboard 实测 | 计划 §2 / MEMORY；**实施前须回读 CC 用量** |
| R2 生产环境变量已配置（使 `isR2Configured()` 为真） | **Unknown** | 未实测生产 env | 须 `vercel env` 或 Dashboard 确认 |
| 当前 10 credits 是否被**单一重度用户/滥用**耗尽（共享全局池） | **Unknown** | 无逐用户归因 | 须 CC 日志或 RateLimit 数据 |
| 缓存对"每个用户私有文件"的命中率 | **Assumption** | 计划 §7 已自陈"命中率有限"，属预期 | 低流量下主要靠重试去重 |

---

## 2. 红队发现表（独立视角，按 P0/P1/P2 分级）

| # | 红队关注 | 检查结论 | 等级 | 证据 |
|---|---|---|---|---|
| R1 | **计划是否把"缓解"误称"解决"** | **关键结论被证据否定**：A1 缓存只命中"同一文件+同一格式"的重复；若 10 个**不同**用户各转一本不同书，缓存命中=0，402 仍必发。计划"把免费档用到极致"暗示可解决，实为**降低频率/严重度，非消除**。须把措辞/预期改为"缓解"。 | **P0**（claim 错误，若按"fix"交付会设虚假预期） | 计费模型 + 配额为全局共享池 |
| R2 | 新缓存/预算层是否会** fail-closed 把全站转换搞挂** | 计划未明确"fail-open"铁律。若 R2/Redis 异常时新层抛错阻断请求，会把仅有的 2 个本地格式（epub→txt/zip）也连带搞挂。须强制：缓存/计数/存储任何异常 → **降级为"今天的行为"（直接调 CC）**，绝不阻断。 | **P0**（核心功能失败风险） | 设计缺口 |
| R3 | 预算记账是否按**真实 credit 消耗** | 计划 A2 隐含"+1/次"，但 Fact 显示 credits≠次数（重型格式/超时 >1 credit）。若按 +1 记账，实际会在"看似还有额度"时已超支。须用 **CloudConvert 任务返回的 actual credit cost** 做 `INCRBY`。 | **P1** | 官方计费模型 |
| R4 | R2 "增量 $0" 是否成立 | **已确认解决**（10-25 tabbit 读 Vercel 生产 env，带正/负对照）：R2 四个 key（`R2_ENDPOINT`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET_NAME`）**均已配置**，作用域 Production and Preview（Jul 25 添加）⇒ `isR2Configured()` 生产为真，**A1 可直接用 R2、无需一次性建桶+env（仍 $0）**。注意 R2 主链路原本未接（仅 api/download 直连），A1 缓存将是 R2 的第一个真实消费方。 | **P1（已关闭）** | Vercel 生产 env 实测（tabbit） |
| R5 | 缓存落点能否持久 | Vercel 本地 FS 临时，**不能**作缓存后端；缓存必须走 R2（或 Redis 存 blob 不经济）。计划未排除本地 FS 误用。 | **P1** | Serverless 特性 |
| R6 | 计数器**并发竞态** | 非原子 `read-then-incr` 在并发下会超支。须用 Redis `INCRBY`（已集成）原子自增，或 Lua 脚本严格原子。 | **P1** | Redis 能力 |
| R7 | **缓存有效性 / 陈旧输出** | 缓存键只含 input+格式，不含转换引擎版本。CloudConvert 侧 Calibre 升级 / 管线变更后，旧缓存会**永久**返回陈旧结果（静默错误输出）。须加 `CACHE_SCHEMA_VERSION` + TTL（如 30 天），引擎变更即 bump 失效。 | **P1** | 设计缺口 |
| R8 | 缓存前**输出校验** | 项目已知 Calibre 缺输出验证（MEMORY）。若首次转换成功但输出损坏，坏结果会被永久缓存复用。须先对输出做类型/大小 sanity 校验再入缓存。 | **P1** | MEMORY §输出验证缺口 |
| R9 | **共享全局配额被滥用耗尽** | 10 credits/天是**全站共享池**（非每用户）。单一重度用户或脚本可在数秒内耗尽，使全天真实用户全部降级。计划未考虑滥用面。**已代码确认**门禁（`route.ts:31`→`rate-limit.ts:49`=**20 req/IP/60s**），`/api/convert` 已接线，无需补。仍建议按需收紧每 IP 限额 + 以"优雅降级"作为兜底安全网（非预防）。 | **P1（已关闭）** | 配额全局共享 + `rate-limit.ts:49` 已确认接线 |
| R10 | "每日用量已达 10" 是否有实测支撑 | **已实测解决**（10-25 CC 控制台 `settings/billing/plan`，账号 douhongjian@gmail.com）：近 6 天中 5 天触顶——Oct 19/21/23/24 `Daily free 10` 后 Credits Remaining=**0**（全额耗尽），Oct 20=9（当日仅用 1），今日 10-25 仪表盘 **0 remaining、约 2h 后重置**。⇒ **日均基本打满 10/天上限，复发是结构性的**。预算阈值按上限 10 + 安全余量设计。 | **P1（已关闭）** | CC 控制台实测（billing/plan credit 明细） |
| R11 | **缓存用户文件的法律/隐私** | 存用户上传的（可能受版权保护的）电子书到 R2，涉 ToS / DMCA 风险；且存储无上限会成本爬升。须用 **TTL（如 30 天）+ 自动过期** 同时解决"存储增长"与"版权内容留存"两面，并在隐私声明中说明"文件自动过期"。 | **P1**（无留存策略则逼近 P0） | 设计缺口 |
| R12 | A4 "扩本地格式"是否值得做 | azw3/mobi 本地化不可能；epub→pdf 纯 JS 不可靠。该条只"腾额度"，边际收益低，且与核心缓解无关。 | **P2** | 计划 §0 硬约束 |
| R13 | 小监控是否必要 | 现有飞书 402 告警已覆盖"出事"信号；新增"命中率/消耗"日志有价值但**不必新建告警**，避免告警疲劳。 | **P2** | 已有告警体系 |

---

## 3. 关闭裁定（按协议 §4）
- **结论：PASS WITH RESIDUALS（方向成立，实施前须先关闭 P0 + 关键 P1）**。
- P0（R1 措辞纠正、R2 fail-open 铁律）为**实施前置条件**，不关闭不得进入 EXECUTE。
- P1（R3/R4/R5/R6/R7/R8/R9/R10/R11）在 v2 设计中已给出具体关闭方案（见 §4），实施时落地。
- P2（R12/R13）不阻断关闭。

---

## 4. 修订版路线 A v2（待用户确认的实施草案）

### 4.0 总原则（先写死，再谈细节）
- **定位 = 缓解，不是修复**。预期：多数低流量日免费档够用；高"不同文件需求"日或滥用日，部分用户走优雅降级——这是零成本方案的**已接受权衡**。
- **Fail-open 铁律**：缓存 / Redis / R2 任意异常 → 降级为"今天的直接调 CC"行为，绝不阻断请求（含 2 个本地格式）。

### 4.1 A1 缓存（修订）
- 缓存键：`sha256(input bytes) + source + target + CACHE_SCHEMA_VERSION`。
- 入缓存前：对输出做**类型/大小 sanity 校验**（关闭 R8）；校验失败不入缓存、照常返回。
- 存储：`CACHE_SCHEMA_VERSION` 随引擎/管线变更 bump；blob 存 **R2**（**先 `vercel env` 确认 R2 已配，未配则记为一一次性建桶+env 任务，仍 $0**）；**禁止用 Vercel 本地 FS**（R5）。
- 留存/法律：`TTL=30 天` 自动过期，同时在隐私声明加"上传文件自动过期"一句（R11）。
- 收益口径（诚实）：主要吃"用户重试 + 同一样本/热门书复转"，对完全不同私有文件命中率低——净收益为正但**非放大数倍**，按 Assumption 标清。

### 4.2 A2 每日额度预算（修订）
- 后端：**Upstash Redis**（已集成，优于 R2 作计数器）。
- 记账：`cc:credits:{UTC日期}` 键，`INCRBY` **任务返回的 actual credit cost**（非 +1，R3）；仅成功计费（402 不增）。
- 门禁：调用前 `remaining = 10 - used`；若 `remaining < 本次预估成本`（或 < 安全余量）→ 直接返回优雅降级，**不发 CC 请求**。
- 并发：依赖 `INCRBY` 原子性（R6）；极端严谨可上 Lua，当前体量非必须。
- 实施前：先**回读 CC Dashboard 真实日用量**定阈值（R10）。

### 4.3 A3 优雅降级 UX
- 402 / 额度耗尽 → 友好文案 + 推荐仍可用的本地格式（epub→txt / epub→zip）；确保 `route.ts` 把系统告警与**用户可见文案**分离（现有告警保留给飞书）。

### 4.4 A4（降级为 P2，可不做）
- 仅当明确有"腾额度"收益才做；azw3/mobi 本地化不可能，不投入。

### 4.5 跨切面（必做）
- **滥用/共享池（R9）**：确认 `rate-limit.ts` 已门禁 `/api/convert`；未门禁则接入；按需收紧每 IP 限额。明确"优雅降级"是全局池被耗尽时的唯一安全网。
- **监控（R13）**：复用飞书 402 告警；新增一行"每日 credits 消耗 / 缓存命中率"日志，不新建告警。

---

## 5. 实施前置清单（进入 EXECUTE 前须用户拍板 + 我执行）
1. ✅ **已完成（10-25 tabbit 确认）** Vercel 生产已配 R2——4 个 key（`R2_ENDPOINT`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET_NAME`）均存在，作用域 Production and Preview（Jul 25 添加）⇒ A1 可直接用 R2，无需一次性建桶+env（仍 $0）。
2. ✅ **已完成** 回读 CC Dashboard 真实日用量（见 R10：近 6 天 5 次触顶 10/天，日均打满上限）——阈值按上限 10 + 安全余量设计。
3. ✅ **已完成** 确认 `rate-limit.ts` 门禁 `/api/convert`（见 R9：20 req/IP/60s，已接线，无需补）。
4. ⏳ **待用户** 接受"缓解非修复"的权衡表述（R1）。

---

## 6. 残余风险（诚实披露）
- 即便 v2 全落地，402 **仍会在"不同文件需求 > 当日剩余 credits"或滥用日复发**——这是零成本方案的物理边界，只有 B（自托管 Calibre）或付费能消除。
- R2 生产配置若为 Unknown 且实际未配，A1 落地会多一步配置（仍 $0）。
- 缓存命中率无实测，收益按 Assumption 表述，不夸大。

---

*本文件为红队审计 + 修订草案，不含任何代码改动。代码实施须经用户确认 v2 后，由本人执行 + 用户审核，遵守 `.workbuddy/TASK-GOVERNANCE.md` 门禁与提交纪律。*
