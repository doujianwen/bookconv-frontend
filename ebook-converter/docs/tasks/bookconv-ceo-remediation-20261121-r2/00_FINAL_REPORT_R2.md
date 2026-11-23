# CEO 红队复核二次整改 · 最终报告（2026-11-21 round2）

生成时点：2026-11-21 12:05 GMT+8 · 执行账户 `DESKTOP-IKRV41G\admin` / Session 1（Gate v1.3 PASS）
基线：HEAD `73c06a8d32230937248c876f903e9df62e5fac3d`，首轮改动全部保留，受保护目录 `bookconv-correlation-release/` 1799 文件未触碰。本轮无 commit / 无 push / 无 deploy。
治理：TASK-GOVERNANCE + 通用协议 V1.0 + R1–R8 全量生效；只处理 P0-A/P0-B/P2-A/P1-A，不重做已通过工作。

## 一、总裁定（状态不美化）

| 项 | 状态 | 核心结论 |
|---|---|---|
| R1 二次基线 | DONE | 全新目录 `bookconv-ceo-remediation-20261121-r2/`，未覆盖首轮基线；HEAD/dirty/哈希落盘 |
| **P0-A 真正幂等** | **DONE** | 完成后重放不建 job（磁盘 ledger + 24h TTL + 内容指纹）；HTTP 集成 23/23 含进程重启；模块 15/15；反向 5/5 |
| **P0-B 四层超时** | **DONE** | 实测四层；calibre 120s→60s 消除真实倒挂；delegate 接统一常量；9/9 门禁含源码防漂移；反向注入验证 |
| **P2-A 强推守卫** | **代码 DONE / 接线 BLOCKED** | 补 4 类绕过 + FF ref 从参数解析；29/29 + 隔离 CLI + 隔离 git 三场景；nightly-sync 接线需授权未执行 |
| **P1-A GA4 接线** | **方案 DONE / 接线 BLOCKED** | 保留职责矩阵；最小变更/非生产测试/回滚方案齐备；七步 dry-run EXIT=0；实际接线需授权未执行 |
| 独立验收 + 红队 | DONE | 58 suites/653 tests；四重独立通道；红队 L2/L3 回执 |

## 二、逐项代码差异与验证证据

### P0-A（`conversion-backend/app/idempotency.js`、`index.js`，新增 2 测试）
- **差异**：`idempotency.js` 新增 `createCompletedLedger`（磁盘 JSONL 持久化、TTL 24h、容量 1000、小 body 缓存）+ `contentFingerprint`/`bufferSha256` + `writeCompletedReplay`/`writeFingerprintConflict`；`index.js` parseMultipart 流式 sha256、doConvert parse 后查 ledger（同内容重放/异内容 409）、handler finally record 终态。in-flight 层（首轮已验证）**完全未动**。
- **测试原始输出**：
  - `node conversion-backend/test/ledger-persistence.test.mjs` → `RESULT: 15 passed, 0 failed`
  - `node conversion-backend/test/p0a-replay.test.mjs` → `RESULT: 23 passed, 0 failed`（含完成后重放、内容冲突、失败终态重放、进程重启双 spawn、重启后新 ID 仍能建 job）
  - 首轮 `correlation-idempotency.test.mjs` 22/22、`mock-run.js` 17/17 回归通过（独立复核通道 RECHECK-*）
- **反向验证**：注入 round-1 故障判据（`decide` 恒 null / 常量指纹），5/5 证明测试能抓到"完成后重放建新 job"与"异内容不冲突"两类事故；临时脚本用后即删。

### P0-B（`conversion-timeouts.ts`、`conversion-backend-client.ts`、`index.js`、`calibre.js`、超时测试）
- **四层实测**：Client 300s（接常量）→ Edge `maxDuration=300` 硬编码字面量 → delegate 90s（本轮改为引用 `CONVERSION_BACKEND_TIMEOUT_MS`）→ Calibre 120s（**真实倒挂**：> delegate 90s，导致 edge abort 后子进程仍跑 = 孤儿 job/重复计费）。
- **差异**：calibre 默认 120s→60s（`index.js:54` env `CALIBRE_TIMEOUT` 可回滚；`calibre.js:71` 防御 floor 同步）；delegate 不再用本地字面量；新增取消传播契约常量（client abort 不传播到 edge、edge abort 不直接杀子进程，靠 calibre<delegate 防孤儿）。
- **测试原始输出**：`tests/unit/conversion-timeouts.test.ts` → `Tests: 9 passed, 9 total`（含预算单调断言 + 3 源码字面量防漂移门禁）。
- **反向验证**：临时把 index.js 的 60000 改回 120000 → 门禁 `1 failed, 8 passed`（精确抓到倒挂回归）；恢复 60000 → 9/9 PASS；备份文件已删，哈希确认恢复。

### P2-A（`scripts/force-push-guard.mjs` + 测试）
- **差异**：新增 `--force=<v>`/`--force-with-lease=<v>`/`--force-if-includes=<v>`（FORCE_FLAG_VALUE）、裸 `+main`/`+HEAD`（FORCE_REFSPEC）、`--mirror`（MIRROR_PUSH）拦截；`isFastForward` 不再硬编码 origin/main，新增 `resolvePushTarget` 从实际参数解析、歧义 fail-closed。
- **测试原始输出**：`tests/unit/force-push-guard.test.ts` → `Tests: 29 passed, 29 total`；隔离 CLI `--check-only` 三强制形式 exit 1、正常 exit 0；隔离临时 git 仓库 live mode：正常快进 exit 0 / `--force` exit 1 远端不变 / 真实非快进分歧 exit 1「安全退出」远端不变、工作区 status=0。全程无真实生产 push。
- **接线**：自动化 `2e8c6c27` 第 9 步仍是裸 `git push`（文字禁 force），**BLOCKED**——改 prompt = 改生产调度，按授权令给出变更+回滚方案（`08_P2A_acceptance.md` §3）未执行。

### P1-A（方案文档，无代码改动）
- 保留 `04_P1-GA4-entry-matrix.md` 职责矩阵（七步数据采集 vs G07 经营门禁，互不调用）；新增 `09_P1A_GA4-wiring-plan.md`：最小变更（prompt 执行体换成标准七步入口 + 运行锁，rrule/cwd/status 不变）、非生产测试（dry-run 已做 EXIT=0 落盘 `evidence/P1A-7step-dryrun.json`；历史日期完整跑；退出码 2/3 不标 PASS；锁验证）、回滚（原 prompt 一行恢复）。实际接线 BLOCKED 需授权。

## 三、Fact / Assumption / Unknown

- **Fact**：所有测试输出均为本轮实测（见 evidence/ 原始日志）；HEAD 73c06a8 未变；受保护目录 1799 文件；无 commit/push/deploy。
- **Assumption**：calibre 60s 对实测单次转换（HK 0.85–2.57s）仍充裕——依据是首轮验收文档记录的实测值，非本轮重新压测；若未来出现合法 >60s 转换需 env 调整（会重新引入倒挂，需同步提高 delegate）。
- **Unknown**：①P0-A 成功的大文件（>8KB）完成后重放返回 409 元数据而非字节——这是内存安全（OOM）权衡，非缺陷，但客户端若期望字节需走重新上传；②取消传播到 Calibre 子进程的主动 kill 未实现（需改 calibre.js 信号链，超出本轮最小变更），靠预算单调防孤儿；③GA4 automation 接线、nightly-sync 接线均 BLOCKED 待授权；④G1 三条 mapping 沿用首轮 PROVISIONAL（本轮未重做）。
- **不用 PARTIAL 冒充 DONE**：P2-A/P1-A 的接线部分明确标 BLOCKED。

## 四、红队与独立验收（R7）

- **L2（结论产出后自审）**：①识破 round1 幂等"in-flight only"自认 residual → 本轮真补 completed 层；②发现 calibre>delegate 倒挂是"假统一"核心 → 实测四层后修；③发现 guard 4 类绕过 + FF ref 硬编码假门禁 → 全补；④区分"方案 DONE"与"接线 DONE"，不混标。
- **L3（独立通道复核）**：(a) Git 只读哈希对比——本轮改动文件清单与设计一致，首轮已验证文件（ToolPageClient/api-error）哈希未变；(b) 独立重跑后端四套测试（RECHECK-*.log）全绿；(c) 程序化计数（58/653、44 条自动化等有原始输出）；(d) 三组注入式反向验证均证明判据有效非自证。
- **收口门禁**：`npm test` 58 suites/653 tests EXIT=0；`tsc --noEmit` EXIT=0；`verify-closure-gates.mjs --no-live` EXIT=0（无假关闭，2 项 UNKNOWN F15/F26 与本任务无关）；`verify-hook-mount.mjs` PASS。

## 五、未解决问题与下一步（需授权）
1. 接线 automation `2e8c6c27` nightly-sync → force-push-guard（方案 `08_P2A_acceptance.md` §3，改后立即 view 回读）。
2. 接线 automation `92ac81b1` → 标准七步入口 + 运行锁（方案 `09_P1A_GA4-wiring-plan.md` §2，GA4 凭证窗口先非生产完整跑）。
3. 可选：Calibre 子进程主动取消传播（改 calibre.js），彻底替代"靠预算单调防孤儿"。
4. 本地 DONE ≠ 生产问题已解决——所有生产部署/调度变更均未执行。

## 六、交付清单
- 本文 + `00_round2_design.md`（实施前冻结）+ `08_P2A_acceptance.md` + `09_P1A_GA4-wiring-plan.md`
- `baseline/`：00  Git 基线 + 01 关键文件哈希（二次整改前）
- `evidence/`：FINAL-npm-test.log + RECHECK-*（4 套）+ P1A-7step-dryrun.json
- 代码：idempotency.js / index.js / calibre.js / conversion-backend-client.ts / conversion-timeouts.ts / force-push-guard.mjs + 4 测试文件
