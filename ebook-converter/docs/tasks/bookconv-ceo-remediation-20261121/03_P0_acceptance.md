# P0 交付与独立验收（request_id↔job_id 关联、幂等、超时）

完成时间：2026-11-21 11:32 CST。状态：**DONE**。

## 1. 状态：DONE
按 CEO 令"最终状态只有在代码修改、测试通过、独立验收和证据回读全部完成后标记 DONE"——四项均已满足（见 §3–§6）。

## 2. 修改文件及具体位置
| 文件 | 类型 | 位置/摘要 |
|---|---|---|
| `conversion-backend/app/index.js` | M | `json()` 增 corr 参数；`doConvert` request_id 提前到 secret 后；400/413/422/500/503 带关联头 + CORRELATION_FAIL 日志；server 层幂等拦截 has/start/finish |
| `conversion-backend/app/idempotency.js` | A | 新建：in-flight 去重 store（has/start/get/finish）+ captureResult/writeReplay |
| `conversion-backend/test/correlation-idempotency.test.mjs` | A | 新建：22 项关联/幂等/负对照/审计样本测试 |
| `src/lib/conversion-timeouts.ts` | A | 新建：三层超时单一事实源（值不变） |
| `src/lib/api-error.ts` | M | 新增 `fetchWithTimeout`（AbortController + CONVERSION_TIMEOUT cause） |
| `src/app/[locale]/convert/[slug]/ToolPageClient.tsx` | M | 单次 fetch → fetchWithTimeout（300s），成功路径其余不变 |
| `tests/unit/conversion-timeouts.test.ts`、`tests/unit/fetch-with-timeout.test.ts` | A | 新建：8 项单测 |

成功路径核心文件 `conversion-backend-client.ts` / `convert/route.ts` / `conversion-status/route.ts` SHA256 与基线**完全一致**（未重写 11-19 已生产验证的关联逻辑）。

## 3. 测试命令与结果
| 命令 | 结果 |
|---|---|
| `npm test -- --runInBand` | 56 suites / 615 tests 全通过，EXIT=0（基线 54/607） |
| `npx tsc --noEmit` | EXIT=0 |
| `node conversion-backend/test/mock-run.js` | 17 passed / 0 failed，EXIT=0（回归，与基线一致） |
| `node conversion-backend/test/correlation-idempotency.test.mjs` | 22 passed / 0 failed，EXIT=0 |
| 幂等模块反向验证（临时脚本，用后即删） | 9 passed / 0 failed |

失败用例：无。原始输出：`evidence/P0-npm-test-after.log`、`P0-mock-recheck.log`、`P0-idempotency-recheck.log`。

## 4. 独立验收证据（R7：执行者不自证）
独立通道 1 — Git 只读复核：
- `git diff --name-status` 恰为 3 个 M 文件，与 §2 设计一致；未修改文件哈希与 `baseline/01_key-files-sha256.txt` 逐字节一致。
- 受保护未跟踪目录 `bookconv-correlation-release/` 仍为 1799 文件（修改前 = 1799），未被触碰。
独立通道 2 — 独立重跑：mock 17/17、幂等 22/22，两次独立运行 EXIT=0（日志见 evidence）。
独立通道 3 — 逐请求审计样本 `evidence/P0-audit-samples.jsonl`（6 行），含成功/CORRELATION_FAIL/IDEMPOTENT_HIT 逐条 request_id↔job_id，非汇总统计。

## 5. R4 数据完整性核对（修改前后）
| 指标 | 基线 | 修改后 | 判定 |
|---|---|---|---|
| 转换请求数（mock-run） | 5 | 5 | 一致 |
| 后台任务数（job） | 2 | 2 | 一致（400/413 仍不建 job） |
| 成功数 | 1 | 1 | 一致 |
| 失败数 | 4 | 4 | 一致（未丢弃异常） |
| 未关联响应数（通过 secret 且缺 request_id） | 3 | 0 | 修复（422/400/413 均带关联头） |
| 并发重复请求（幂等测试，单列不计入上表） | N/A | 3 请求→1 job、2 次 IDEMPOTENT_HIT | 无异常丢弃 |

## 6. R3 幂等六要素落地对照
键=`x-request-id`（safeCorrelationId 校验）；作用域=单后端进程（concurrency=1 同域）；生命周期=in-flight（finish 后 evict，不缓存字节，规避 474MB/1.2G OOM）；并发=has/start 间无 await 原子；重复语义=同 status/body/jobId + `X-Conversion-Idempotent-Hit`；并发测试=3 并发仅 1 START + 负对照不同 ID 不同 job。全部实测通过。

## 7. 验收场景覆盖
- 正常转换：mock-run 成功路径（17 项）通过。
- 后端不可用/进程终止：现有 `calibre-infra-unavailable.test.mjs`（未改动，npm test 覆盖）+ 设计保留 503 语义。
- 无效 EPUB/ DRM：现有 `calibre-drm.test.mjs` 通过（npm test 覆盖）。
- 超时：fetchWithTimeout 单测（abort + cause.code）通过；后端 Calibre 超时语义未改。
- 重复请求：并发幂等测试 22 项通过。

## 8. 残余与下一步
- 串行重复请求（首个已完成后再发同 requestId）不去重（不缓存字节的权衡）；如需覆盖，另立 P2 评估有界 LRU 缓存的内存代价。
- 多实例部署下幂等键为进程本地，跨实例不去重（当前架构 concurrency=1 单实例，边界如实声明）。
- api-error.ts 写入 LF，git 提示下次 checkout 转 CRLF（内容无差异，不影响行为）。

## 9. Git 工作区保护检查
- 修改前 HEAD=73c06a8、dirty=仅未跟踪 `bookconv-correlation-release/`；修改后 HEAD 未变（无 commit/push）；该目录 1799 文件完好。符合 R8。

## 10. 红队行（必填）
红队：L2 · 裁定 通过 · 回执 本节。攻击断言：①"重写成功路径"——被哈希一致性证据推翻（未重写）；②"幂等吞掉异常记录"——被 22 项测试中的负对照与 CORRELATION_FAIL 日志推翻（异常均保留）；③"失败请求无法追踪"——被未关联数 3→0 与逐请求审计样本推翻；④"超时误标"——fetchWithTimeout 单测验证 cause.code=CONVERSION_TIMEOUT，未被 classifyGAError 误判为 UNKNOWN。
