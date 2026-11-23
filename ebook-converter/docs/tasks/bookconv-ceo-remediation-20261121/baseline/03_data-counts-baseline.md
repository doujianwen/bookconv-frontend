# R4 数据完整性基线（修改前）

采集时间：2026-11-21 11:24 CST
采集命令：`node conversion-backend/test/mock-run.js`（隔离 mock，fake ebook-convert copy-only，无真实 Calibre）；`npm test -- --runInBand`
原始输出：`02_npm-test-baseline.log`；mock 输出见本文件末附录。

## 口径定义（先定口径再计数，禁混算）
- **转换请求数**：到达 `POST /api/convert-internal` 的请求数（含非法 secret）。
- **后台任务数（job）**：后端执行到 `jobId=randomUUID()` 的请求数（即通过 secret + multipart 解析）。
- **成功数**：后端日志 `CORRELATION_OK` 行数。
- **失败数**：非 200 响应数（403/400/413/422/500/503）。
- **未关联数**：**成功响应**中 request_id 与 job_id 任一缺失的请求数（R4 关注"失败请求是否也能被追踪"，故口径扩展为：所有通过 secret 的响应中，缺少 `x-conversion-request-id` 或 `x-conversion-job-id` 头的数量）。

## mock-run.js 基线计数（修改前）
| 指标 | 计数 | 说明 |
|---|---|---|
| 转换请求数 | 5 | health 不计；POST 5 次：wrong-secret / correct / unsupported-422 / malformed-400 / oversize-413 |
| 后台任务数（job） | 2 | correct(200) 与 unsupported(422) 生成了 job；403/400/413 在 jobId 生成前返回，无 job |
| 成功数（CORRELATION_OK） | 1 | 仅 correct 请求 |
| 失败数 | 4 | 403、422、400、413 |
| 未关联数（通过 secret 的响应缺关联头） | 3 | 422、400、413 三个失败响应均不带 request/job 头；403 未通过 secret，不计入关联口径 |
| 测试断言 | 17 passed / 0 failed | mock 后端契约全通过，EXIT=0 |

## npm test 基线（修改前）
- 54 suites / 607 tests 全通过，EXIT=0（详见 `02_npm-test-baseline.log`）。
- 注：项目记忆中的"50 suites/584 tests"已过时；当前实测为 54/607，以本次实测为准。

## 生产验收样本（11-19，非本次改动产生，仅作关联口径参照）
- request `ecf3dd70-f886-4800-a092-8028451b92c7` ↔ job `97485ad7-eeb3-4fc9-b2db-9e3f566eac8d`，bytes=157413，`CORRELATION_OK` 一致，GA4 采集 204。
- 该样本证明**成功路径关联已成立**；本次 P0 不重写成功路径，只补齐失败路径关联与幂等/超时缺口。

## R4 不变量（修改后必须满足）
1. 请求数、job 数、成功数、失败数在修改前后**保持一致**（幂等测试中的"重复请求"单独计列，不并入常规计数）。
2. 未关联数必须从 3 降至 0（所有通过 secret 的响应均带 request/job 头）。
3. 幂等命中不得丢弃异常记录：被去重的重复请求必须输出 `IDEMPOTENT_HIT` 日志并携带与首次相同的 job_id，不得静默吞掉。
4. 禁止为提高关联率而把失败请求标记为成功或丢弃失败记录。

## 附录：mock 后端基线原始输出（摘录）
```
PASS GET /health = 200
PASS wrong secret -> 403
START job=78527190-... request=request-test-12345678 epub -> mobi
OK epub -> mobi 18B 67ms
CORRELATION_OK job=78527190-... request=request-test-12345678 bytes=18 duration=71ms
PASS correct secret -> 200 / returns file bytes / response returns the original request ID /
     response returns an opaque job ID / backend log correlates request ID ...
START job=b71ee67e-... request=77a0d43d-... epub -> xyz
PASS unsupported target -> 422
PASS malformed multipart -> 400
PASS oversize upload -> 413
PASS temp files cleaned up
RESULT: 17 passed, 0 failed  EXIT=0
```
