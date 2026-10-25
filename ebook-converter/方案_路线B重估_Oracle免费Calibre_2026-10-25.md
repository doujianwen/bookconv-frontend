# 路线 B 重估：Oracle Cloud Always-Free 跑 Calibre（2026-10-25）

> 触发：R10 实测证实免费档**日均打满 10 credits/天上限（近 6 天 5 次触顶）**，402 复发是结构性的。用户接受"缓解非修复"表述，并要求重估路线 B（自托管 Calibre，$0）。
> 依据：`通用任务治理协议_V1.0.md` §2/§3/§5；已核验事实见 §1。本文件为重估草案，**不含代码改动**；实施待用户确认后由本人执行 + 用户审核。

---

## 0. 一句话结论

**路线 B 是唯一"$0 且能真正移除 10/天硬顶"的方向**（盒子无每日转换限额），集成代码路径已就绪；**但它不是干净的全胜**——Oracle 2026 已把免费 ARM 腰斩成 2 OCPU/12GB，且**低流量转换盒有被"闲置回收"的真实风险**。正确做法：B 与 A 并行，但 B 必须配 **failover（后端不可用 → 回退现有本地/CloudConvert 路径）**，把回收风险的"用户影响"降为零，使之成为纯增益。

---

## 1. Fact / Assumption / Unknown（已核验）

| 项 | 类别 | 内容 | 证据 |
|---|---|---|---|
| Oracle Always-Free ARM 2026 已腰斩：4 OCPU/24GB → **2 OCPU/12GB**（1,500 OCPU-hrs + 9,000 GB-hrs/月），2026-08-18 起强制 | **Fact** | 官方文档 + 多家 2026-09/10 实测 | WebSearch（2026-10-25） |
| 仍含 200GB 块存储、10TB/月出站、永久免费、需绑卡（仅身份验证）、允许商用 | **Fact** | 同上 | 同上 |
| **闲置回收规则**：7 天窗口内 CPU 95 分位<20% 且网络<20% 且内存<20%（A1）⇒ Oracle 可回收实例 | **Fact** | Oracle 官方 "Reclamation of Idle Compute Instances" | 同上 |
| A1 在热门区域常 "out of host capacity"；home region 选定后永久不可改 | **Fact** | 同上 | 同上 |
| 集成代码路径**已就绪**：设 `CONVERSION_BACKEND_URL` 后 `/api/convert` 转发到后端 `/api/convert-internal` 并流式回吐；后端 = docker-compose（node:20-alpine + calibre + imagemagick + ghostscript + poppler + redis）；共享密钥 `CONVERSION_INTERNAL_SECRET` | **Fact** | `route.ts:45-47`、`docker-compose.yml`、`Dockerfile`、`convert-internal/route.ts`、DEPLOYMENT.md §E1 | 代码已读 |
| `CONVERSION_BACKEND_URL` **当前未配置**（现无有效值） | **Fact** | 搜索生产 env 未命中 + 多份 incident 文档一致 | tabbit 搜索 + `docs/incident-*` |
| R2 生产已配置（4 key，Production+Preview）——与本任务无关，但确认缓存方案(A1)零障碍 | **Fact** | tabbit 负对照实测 | 见红队 v2 R4 |
| Calibre/imagemagick/ghostscript/poppler 在 Alpine **arm64(aarch64)** 有可用包 | **Assumption（高置信，待首建验证）** | Alpine community repo 提供 aarch64 构建 | 未实测 ARM 构建 |
| 站点日活 ≈ 日均 ≤10 次转换（多为不同文件） | **Assumption** | R10 + GA4 近期上传量 | CC 明细 + GA4 |

---

## 2. 必须纠正的过期数据

`方案_CloudConvert零成本缓解_2026-10-25.md` 路线 B 写"ARM VM（4 OCPU / 24GB）永久 $0"——**该规格 2026-06-15 起已不存在**，现行免费档为 **2 OCPU / 12GB**。对 Calibre 转换后端而言 2/12 仍绰绰有余（转换是突发 CPU 型，非持续高负载），但文档口径须更正，避免按 4/24 规划。

---

## 3. 集成就绪度（好消息）

- **转发逻辑零改动**：`route.ts` 已实现"有 `CONVERSION_BACKEND_URL` 且 `CONVERSION_INTERNAL_SECRET` → 转发；否则本地 convert-handler → conversion.ts（本地纯 JS → Calibre → CloudConvert 兜底）"。设两个 env 即接线。
- **后端镜像就绪**：`Dockerfile`（node:20-alpine + Calibre 全家桶）+ `docker-compose.yml`（app + redis + 健康检查 + 卷）已备，`docker-compose up` 即起。
- **纯透传格式不受影响**：epub→txt / epub→zip 仍在 Vercel 本地完成，不经过后端。

⇒ 路线 B 的"代码工作量"主要是**部署 + 2 个 env + failover 改造**，不是从零造轮子。

---

## 4. 真实风险（红队视角，按严重度）

| # | 风险 | 影响 | 等级 | 缓解 |
|---|---|---|---|---|
| B-R1 | **闲置回收（主风险）**：低流量转换盒大部分时间 CPU/网络/内存均 <20%，7 天窗口命中即被 Oracle 回收 → `CONVERSION_BACKEND_URL` 指向死盒 | 若不做 failover，转换从"CloudConvert 402"变成"后端连接失败"，**比现状更糟** | **P0** | **failover**：后端不可达/超时/5xx → 自动回退本地/CloudConvert 路径（见 §5）；加健康探测 + 飞书告警；备快速重建 runbook（compose 一条命令重拉） |
| B-R2 | ARM 容量紧张：热门 region "out of host capacity"，可能抢不到 A1 | 部署受阻/延迟 | P1 | 选 home region 时挑 A1 有余量的区；多 AD 重试；或临时用 AMD micro 顶上 |
| B-R3 | home region 永久锁定 | 只能一区到底 | P1 | 注册时选靠近用户/稳定区（如亚太） |
| B-R4 | ARM 构建未实测（Calibre on aarch64） | 首建可能踩包依赖 | P1 | 高置信可建；首建即验证，失败则回退 CloudConvert（failover 兜底） |
| B-R5 | 服务器间 HTTP + 共享密钥明文可嗅探 | 低危（转换端点 + 可轮换密钥） | P2 | 可选 hardening：Cloudflare Tunnel / Oracle 免费 LB + Let's Encrypt 上 TLS |
| B-R6 | 运维负担（与"零/低运维"阶段约束冲突） | 需监控盒存活 | P1 | failover + 告警后，盒挂了也只是"回退现状"，不致命；把运维成本压到"收到告警再重建" |

---

## 5. Failover 设计（让 B 变成纯增益的关键）

现状 `route.ts` 转发后端失败即报错。路线 B 须补一层：

```
有 CONVERSION_BACKEND_URL：
  try 转发后端（带超时，如 30-60s）
   成功 → 流式返回（免费、无每日限额）
   失败/超时/5xx → 记日志 + 【回退】本地 convert-handler（纯JS→CloudConvert）
否则：维持现状
```

- **效果**：盒在 → 转换免费且破 10/天顶；盒被回收/挂了 → 用户体验回落到"今天的 CloudConvert 路径"（有 A2+A3 就是优雅降级）。**B 永远是增益，不再是新的单点故障。**
- 这与路线 A 的 fail-open 铁律同源（新层异常不得比现状更糟），一并实施最顺。

---

## 6. 排序建议（契合"零成本 + 流量优先 + 低运维"）

| 阶段 | 动作 | 成本 | 收益 | 风险 |
|---|---|---|---|---|
| **NOW** | **路线 A**（A2 预算闸 + A3 优雅降级优先；A1 缓存次之，R2 已就绪） | $0 | 把每日 402 从"硬失败"变"可控降级"，配额均摊 | 低（fail-open 已设计） |
| **并行/按需** | **路线 B + failover**（Oracle 2/12 跑 Calibre） | $0 | 盒在即破 10/天顶，唯一零成本根治增长天花板 | 中（闲置回收，但 failover 消用户影响） |
| **monetization 后** | 充值 CloudConvert $17/1000 或付费 VPS | $ | 最简可靠修复 | 低 |

**关键判断**：用户第一目标是"拿更多流量"，而 10/天硬顶会封顶增长。**若预计流量将增长，路线 B 应从"以后再说"提为"与 A 并行推进"**——因为它才是零成本前提下唯一能抬高天花板的动作；A 只是让撞墙更体面。若短期流量仍很小（日均个位数），先做 A 也合理，B 作为增长触发项。

---

## 7. 实施前置（进入 EXECUTE 前须用户拍板）

1. 是否**现在并行做 B**，还是"先 A、增长触发再做 B"？（阶段决策）
2. 若做 B：接受 **failover 改造**（route.ts 加后端失败回退）+ 闲置回收藏痛 + home region 选择。
3. Oracle 账号：是否已有？没有则需注册（绑卡仅身份验证）。
4. ARM/Calibre 首建验证由本人在部署时完成（失败即回退，不阻塞）。

## 8. 残余风险（诚实披露）

- 即便 failover，盒被回收到重建之间有一段窗口走 CloudConvert（可能仍 402 → 优雅降级）；非零但已被 A 兜住。
- Oracle 免费档政策历史上改过（本次已腰斩一次），未来可能再变——不承诺永久。
- 2 OCPU/12GB 对高并发转换会成瓶颈；但当前流量远未到，属可扩展性问题（届时正好是 monetization 信号）。

---

*本文件为路线 B 重估草案，未改任何代码。实施须经用户确认后由本人执行 + 用户审核，遵守 `.workbuddy/TASK-GOVERNANCE.md` 与提交纪律（禁 git add -A、push≠部署）。*
