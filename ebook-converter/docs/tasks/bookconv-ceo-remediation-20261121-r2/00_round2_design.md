# CEO 红队复核二次整改 · R2 最小变更设计（实施前冻结）

时点：2026-11-21 11:55 GMT+8 · 账户 Gate v1.3 PASS（admin/Session 1）
基线：HEAD 73c06a8d32230937248c876f903e9df62e5fac3d，首轮改动全部保留，受保护目录 1799 文件未动。
治理：只处理 P0-A / P0-B / P2-A / P1-A，不重做已通过工作，不重写已验证成功路径。

---

## P0-A 真正的幂等性

### 事实（实测，非推理）
- `idempotency.js:48-57 finish()` 执行 `inflight.delete(requestId)`；L16-18 注释明确 "Serial replays after completion create a new job (documented residual)"。
- 无内容指纹：`start(requestId)` 只按 ID，同 ID 任意内容都会命中回放或新建。
- 成功响应体不缓存（474MB peak vs 1.2G systemd，缓存字节有 OOM 风险）——此约束保留。

### 最小变更（4 个文件）
1. `conversion-backend/app/idempotency.js`：
   - 新增 `createCompletedLedger({path, ttlMs, maxEntries})`：`record/check/load/size`，磁盘 JSONL append-only，启动时加载，TTL 24h + 容量上限 1000。
   - 指纹 `sha256(fileSha256 + source + target + quality)`，file 字节 sha256 在 `parseMultipart` 流式计算（不额外读盘）。
   - 终态小 JSON body（<8KB）缓存并回放；成功的大文件体不缓存 → 重放返回 `409 IDEMPOTENT_ALREADY_COMPLETED` + jobId（明确语义，绝不返回损坏的文件字节）。
   - 同 ID 指纹不同 → `409 IDEMPOTENCY_CONFLICT`，不建 job。
2. `conversion-backend/app/index.js`：
   - `parseMultipart` 内对 file stream 做 sha256，返回 `fileSha256`。
   - `doConvert` 在 parse 后、生成 jobId 前查 completed ledger（命中按指纹分流）；把 fingerprint 挂到 `req.__fingerprint` 供 handler finally 记录终态。
   - server handler finally：`ledger.record(...)` 用 `captureResult` 已捕获的 status/headers/body。
   - in-flight 拦截逻辑**保持不动**（已验证）。
3. `conversion-backend/test/correlation-idempotency.test.mjs`：扩 4 场景（完成后重放、内容冲突、超时后重放、进程重启双 spawn）。
4. 新 `conversion-backend/test/ledger-persistence.test.mjs`：纯模块级 save/load + TTL + 冲突判据。

### 影响面
- 仅新增 completed 层，in-flight 与成功路径响应字节不变（回归断言）。
- 磁盘 ledger 默认落在 `CONVERSION_LOG_DIR/idempotency-ledger.jsonl`（本地测试落临时目录，不触生产）。
- 幂等键作用域：单后端进程 + 磁盘持久化（跨重启），TTL 24h。

### 回滚
- 删除 `createCompletedLedger` 调用 + index.js 两处插入点，恢复首轮状态（首轮哈希已存档）。生产未部署，无线上回滚。

### 失败条件
- 任一场景出现第二个 `START` 日志 / 不同 jobId / 内容冲突仍建 job / 重启后建新 job → 立即停止，保留证据。

---

## P0-B 四层超时核实与修复

### 事实（实测）
| 层 | 现值 | 常量接线 | 来源 |
|---|---|---|---|
| Client (browser) | 300s | ✅ 用 `CONVERSION_CLIENT_TIMEOUT_MS` | `fetchWithTimeout` |
| Edge maxDuration | 300s | ❌ 硬编码字面量 | `convert/route.ts:33` |
| API→backend delegate | 90s | ❌ 硬编码 `DEFAULT_BACKEND_TIMEOUT_MS` | `conversion-backend-client.ts:53` |
| Backend→Calibre | 120s | ❌ 硬编码 `CALIBRE_TIMEOUT` | `index.js:42` / `calibre.js:71` |

**预算倒挂**：Calibre 120s > delegate 90s。后端子进程尚未结束时 API 已 abort→回退 CloudConvert→孤儿 job + 重复计费。这是真实不一致，不是文档问题。

### 最小变更
1. `src/lib/conversion-timeouts.ts`：新增 `CALIBRE_TIMEOUT_MS` 注释说明 + 导出预算关系常量；`CONVERSION_BACKEND_TIMEOUT_MS` 保持 90000（API 行为不变）。
2. `src/lib/conversion-backend-client.ts`：`DEFAULT_BACKEND_TIMEOUT_MS` 改为引用统一常量（消除硬编码漂移，env 覆盖保留）。
3. `conversion-backend/app/index.js`：`CALIBRE_TIMEOUT` 默认 120000→60000（env `CALIBRE_TIMEOUT` 可回滚到 120000），使链单调 `60s < 90s < 300s = 300s`。
4. `tests/unit/conversion-timeouts.test.ts`：新增门禁断言四层预算单调 + 三处源码字面量与常量一致（防漂移）；Edge `maxDuration` 必须保留字面量（Next.js 静态分析约束），由测试守卫。
5. 取消传播关系文档化：client abort 不传播到 serverless 出站 fetch；delegate abort 不杀 Calibre 子进程（残余，标注 UNKNOWN，不在本轮修复范围——需改 calibre.js 信号传播，超出最小变更）。

### 影响面 / 回滚 / 失败条件
- 影响：仅收紧后端 Calibre 兜底上限（实测 0.85–2.57s，60s 仍充裕）；API/Edge/Client 数值不变。
- 回滚：`CALIBRE_TIMEOUT=120000` env 一行恢复；常量接线回滚用首轮哈希。
- 失败条件：预算单调断言失败、任一源码字面量与常量漂移、正常转换回归失败 → 停止。

---

## P2-A 接入强制推送守卫

### 事实
- guard 漏判：`--force-with-lease=xxx`、`--force=xxx`、`+ref`（无冒号）、`--mirror`。
- nightly-sync（2e8c6c27）第 9 步裸 `git push`，"禁 force"仅文字；改 prompt = 改生产调度。

### 最小变更
1. `scripts/force-push-guard.mjs`：补 4 类等价强制参数；保持 `--check-only` 绝不推送。
2. `tests/unit/force-push-guard.test.ts`：补参数覆盖用例（含负对照）。
3. 隔离测试：临时 git 仓库跑 `--check-only`，验证拦截 + 正常放行 + HEAD/工作区无损。
4. **不修改 automation**：给出最小 prompt 变更方案（第 9 步前插一行守卫调用）+ 回滚方案（恢复原 prompt 文本）+ 保留原 rrule 22:00，待授权。

### 影响面 / 回滚 / 失败条件
- 影响：仅 guard 判据更严；不改任何生产调度。
- 回滚：guard 新增判据可单独撤销；prompt 从未改动无需回滚。
- 失败条件：任一强制形式未被拦、正常快进被误拦、触到真实远端 → 停止。

---

## P1-A GA4 自动化接线方案

- 保留已建职责矩阵（04_P1-GA4-entry-matrix.md）。
- 给出 automation 92ac81b1 从 9 步手写内联 → 调用 `run-ga4-daily-integrated.py --date <date>` 的最小变更方案（仅替换执行体，保留 rrule 9:00/cwd/产物路径）。
- 非生产测试方案：dry-run + 已落盘 GA4 数据回放 + closure requery 用凭证可用窗口。
- 回滚方案：保存原 prompt 全文，一行恢复。
- **不执行接线**（改生产调度需授权）。

---

## 共同失败保护
- 任何测试触及生产数据/凭证/真实 push/部署边界 → 立即停止（R8）。
- 每完成一项做反向验证（注入事故→FAIL，恢复→PASS）+ 独立回归通道。
- PARTIAL/BLOCKED 不得标 DONE；未验证字段标 UNKNOWN。
