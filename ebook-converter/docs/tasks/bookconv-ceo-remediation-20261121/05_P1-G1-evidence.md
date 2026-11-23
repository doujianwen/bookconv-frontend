# P1：G1 三条 provisional mapping 证据补充

完成时间：2026-11-21 11:42 CST。状态：**DONE**（证据补充完成；三条映射状态按授权令继续保留 PROVISIONAL/NOT_PRODUCTION_VERIFIED，未伪造为已验证）。

## 1. 三条映射逐条证据

| # | raw_error | adopted_value | ①生产事件存在性（GA4 Data API 落盘产物） | ②代码层映射依据 | ③生产落地状态 |
|---|---|---|---|---|---|
| 1 | Failed to fetch | CONVERSION_UNAVAILABLE | `ga4-advanced-2026-11-13.json` → modules.failed_by_date_error：13 天共 21 次，20261113 当天 2 次 | `src/lib/ga-error-classification.ts:17` `/failed to fetch|networkerror|.../i → CONVERSION_UNAVAILABLE`；测试 `tests/unit/ga-error-classification-g1.test.ts` PASS | ❌ 未验证：11-13 的 error_code 维度全为 UNKNOWN |
| 2 | Request failed (HTTP 403). Please try again. | PERMISSION_DENIED | 同上模块：仅 20261113，2 次 | `ga-error-classification.ts:18` `/HTTP 403/i → PERMISSION_DENIED`；测试 PASS | ❌ 未验证：同上 |
| 3 | The conversion service returned an error... | CONVERSION_UNAVAILABLE | 同上模块：20261112+20261113 共 3 次（11-13 当天 1 次） | `ga-error-classification.ts:19` `/conversion service returned an error/i → CONVERSION_UNAVAILABLE`；测试 PASS | ❌ 未验证：同上 |

## 2. 决定性生产验证证据（为何保持 PROVISIONAL）
`ga4-advanced-2026-11-13.json` → `modules.failed_by_date_error_code`：
- 20261113：`error_code=UNKNOWN, eventCount=5`；
- 20261112：`error_code=UNKNOWN, eventCount=5`、`CORRUPT_INPUT=1`。

三条映射的 event_count 之和 = 2+2+1 = **5**，与 11-13 当天 `error_code=UNKNOWN` 的 5 次**完全吻合**。这证明：这三条错误在 11-13 的生产 GA4 流水中**当时被归类为 UNKNOWN，映射尚未在生产落地**。因此任何"生产验证通过"的声明都会与生产数据直接矛盾——按授权令"无法验证的继续标记 UNKNOWN/PROVISIONAL，不得伪造"，三条状态保持不变。

## 3. 验证时间、证据路径、可复现命令
- 验证时间：2026-11-21 11:40–11:42 CST。
- 证据路径：
  - 生产事件：`_wb_tmp/ga4-advanced-2026-11-13.json`（GA4 Data API 落盘产物，mtime 2026-11-14）。
  - 逐条采用记录：`_wb_tmp/ga4-g1-error-adoption-2026-11-13.json`（本次未修改，保持原 status）。
  - 代码依据：`src/lib/ga-error-classification.ts:17-19`。
  - 代码依据测试：`tests/unit/ga-error-classification-g1.test.ts`（4/4 PASS）。
- 可复现命令：
  - `python3 -c "import json; d=json.load(open('_wb_tmp/ga4-advanced-2026-11-13.json',encoding='utf-8')); print([r for r in d['modules']['failed_by_date_error'] if r['date']=='20261113'])"`
  - `python3 -c "... modules['failed_by_date_error_code'] ..."`（见 §2 结果）
  - `npx jest --config jest.config.cjs --runInBand tests/unit/ga-error-classification-g1.test.ts`

## 4. 与既有结论的一致性
`docs/governance/GA4-G1逐条归因与一体化验收-2026-11-14.md` 明确："上述为基于错误文本的归类采用值，生产验证未完成"、"B2 按 Owner 裁定为 SKIP，SKIP 不等于 PASS；生产验证仍 PENDING"。本次证据补充与该结论一致，并新增两项硬证据：①11-13 当天 5 次 error_code=UNKNOWN 与三条 event_count 之和闭合；②代码层映射有确定性规则与自动化测试。

## 5. 残余与解阻
- 要把三条映射从 PROVISIONAL 升为生产验证，需要：在 GA4 生产事件流中观察到这些 raw_error 被正确写入 `error_code=adopted_value`（而非 UNKNOWN），且数据窗口在映射部署之后。当前 11-13 数据为部署前，不满足。
- 本次未重新调用 GA4 Data API（需生产凭证，R8 停止）；只用已落盘的生产产物，未触及凭证/生产请求。

## 6. Git 工作区保护 / 意外变化说明
- 本任务修改了：`tests/unit/ga-error-classification-g1.test.ts`（新增，正确路径）。
- 过程中因 bash fallback 路径误判，曾把同名测试写到 `E:/一人公司/ebook-converter/tests/unit/`（工作树外的孤立位置），已确认唯一文件为本轮创建（mtime 11:33）并删除该文件；残留空目录 `E:/一人公司/ebook-converter/` 不含任何文件，未触碰用户成果。此为执行期意外，如实记录，未隐瞒。

红队：L2 · 裁定 通过（维持 PROVISIONAL）· 回执 本文档 §2（用 11-13 error_code=UNKNOWN 反证"生产验证通过"的断言）。
