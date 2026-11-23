# P0 设计定稿：转换链路关联、幂等与超时（R2）

设计时间：2026-11-21 11:26 CST。状态：DESIGN_FROZEN（实施前）。

## 0. 范围判定（先判断哪些不能改）
11-19 生产验收（commit 56add99）已证明**成功路径** request_id↔job_id 关联成立，当前 HEAD 已包含。**禁止重写成功路径**（红队 N2 断言：重写已验证的成功路径 = 无谓回归风险）。本次只修复三处真实缺口：

| 缺口 | 证据 | 最小修复 |
|---|---|---|
| G-A 失败路径无关联 | mock 基线：422/400/413 响应无 request/job 头；后端日志仅成功路径有 CORRELATION_OK | 所有通过 secret 的响应统一带关联头；所有终态输出 CORRELATION_OK/FAIL |
| G-B 无幂等保护 | `index.js:206` 每次 `jobId=randomUUID()` 无条件新建 | in-flight 去重（同 requestId 并发请求共享同一 jobId 与结果） |
| G-C 超时语义不统一 | 前端 fetch 无 AbortController；client 90s / Calibre 120s / edge 300s | 统一常量 + 前端 AbortController（保守 300s，不改变正常行为） |

## 1. 幂等设计（R3 六要素，逐项可验证）
1. **幂等键生成**：优先 `x-request-id`（经 `safeCorrelationId` 校验，8–80 字符 `[A-Za-z0-9-]`）；缺失时后端 `randomUUID()`（此情形不参与去重，仅作关联）。
2. **作用域**：单个后端 Node 进程内存 `Map<requestId, {jobId, promise}>`；与现有 `busy` 并发锁同域。分布式多实例不去重（当前架构 concurrency=1 单实例，如实声明边界）。
3. **生命周期**：仅 in-flight 窗口（请求处理期间）；转换终态（成功/失败）在 `finally` 中移除。**不缓存输出字节**——理由：后端 memory.peak 474MB vs systemd 1.2G，缓存 50MB×N 有 OOM 风险（这是实测约束，非臆测）。权衡：串行重复请求（首个已完成）不命中去重、会新建 job；主要风险"并发重放"被覆盖，文档登记为残余。
4. **并发竞争处理**：Node 单线程，`if (!map.has(id)) map.set(id, entry)` 之间无 `await`，原子（与 `acquireConvertLock` 同一竞态论证）。并发重复请求 `await` 同一 promise，写回相同 jobId 与相同字节。
5. **重复请求返回语义**：相同 status、相同 body 字节、相同 jobId；额外响应头 `X-Conversion-Idempotent-Hit: true` 供审计；日志 `IDEMPOTENT_HIT request=... job=...`。不改变首次请求的任何行为。
6. **并发测试**：mock 后端同时发 N 个相同 requestId 请求，断言：仅 1 条 `START` 日志、仅 1 个 jobId、所有响应字节一致、N-1 个带 `X-Conversion-Idempotent-Hit`。

## 2. 失败路径关联（G-A）
- 把 `requestId`/`jobId` 生成点从 `index.js:205-206`（multipart 解析后）**提前到 secret 校验后、multipart 解析前**，使 400/413 也携带关联 ID。403（secret 失败）不关联（安全：避免向未授权方泄露内部 ID）。
- 响应头：`json()` 增补可选 `correlation` 参数；成功/失败响应均输出 `X-Conversion-Request-Id`、`X-Conversion-Job-Id`。
- 日志：400/413/422/500/503 输出 `CORRELATION_FAIL request=... job=... code=...`；200 保持 `CORRELATION_OK`（格式不变，既有分析脚本兼容）。

## 3. 超时统一（G-C，保守改动）
- 新增 `src/lib/conversion-timeouts.ts`：单一事实源，导出 `CONVERSION_EDGE_MAX_MS=300000`、`CONVERSION_BACKEND_DELEGATE_MS=90000`、`CALIBRE_TIMEOUT_MS=120000`（与现有值一致，仅收敛为常量，不改数值）。
- 前端 `ToolPageClient.tsx` 的 `/api/convert` fetch 增加 `AbortController` + 300s 超时；超时抛出 `CONVERSION_TIMEOUT`（复用现有 isErrorCode 白名单，无需新增错误码），GA4 `conversion_failed` 正常记录。
- 不改变 90s 委托超时与 120s Calibre 超时的数值（避免改变降级行为）；仅统一常量与前端取消语义。

## 4. 影响面
- 后端：`conversion-backend/app/index.js`（新增幂等模块 + 关联头/日志）。新增 `conversion-backend/app/idempotency.js`。
- 前端：新增 `src/lib/conversion-timeouts.ts`；`ToolPageClient.tsx` 单点 fetch 改动。
- 测试：`conversion-backend/test/mock-run.js` 扩展；新增 `tests/unit/conversion-timeouts.test.ts`。
- 不改：GA4 事件 schema、成功响应字节、SEO 内容、`llms.txt`、任何生产配置/凭证/部署。

## 5. 回滚办法
- 每文件改动前记录 SHA256（见 `baseline/01_key-files-sha256.txt`）。
- 回滚：新增文件直接删除；修改文件用 `git checkout -- <file>`（工作树原为 clean，无未提交改动会被覆盖；`bookconv-correlation-release/` 为未跟踪目录，不在回滚范围，绝不触碰）。
- 后端 mock 测试全在临时目录（os.tmpdir），不写 `/opt`、不连生产后端、不读生产凭证。

## 6. 失败条件（触发立即停止，R8）
- mock 测试出现任何 FAIL；npm test 有失败套件；`tsc --noEmit` 报错。
- 改动导致成功路径字节/响应头/GA4 事件变化（对照 11-19 样本）。
- 触及生产后端 `43.129.176.38`、生产凭证、真实用户请求、部署边界 → 立即停止。
- 工作区出现预期外变化（除本设计第 4 节列出的文件）→ 保留现场并报告。

## 7. 验收映射
- 正常转换 → mock-run 成功路径断言；后端不可用/超时/进程终止/无效 EPUB → mock 扩展用例（fake calibre 退出码/缺失/超时）；重复请求 → 并发幂等用例。
- 逐请求审计样本 → mock 输出 `audit-samples.jsonl`（每条 request_id/job_id/status/bytes/idempotent_hit）。
- 独立验收 → 由独立检查步骤（不同脚本/只读复核）验证，执行者自测报告不作唯一依据（R7）。
