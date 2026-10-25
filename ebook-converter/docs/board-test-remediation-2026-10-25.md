# board.test.ts 脱节修复 · 逐断言取证对照表

- **日期**：2026-10-25
- **脚本**：`tests/unit/board.test.ts`
- **结果**：`npx jest tests/unit/board.test.ts` → **56 passed / 56 total**（exit 0）
- **结论**：`src/lib/board/derive.ts` 逻辑**未改动、无 bug**；13 处失败全部是测试快照过时（board 从 66 任务/11 模块膨胀到 101 任务/12 模块，且部分任务 recurrence/状态已演进）。所有新值均由与 derive 同源的纯函数测量脚本（`_wb_tmp/measure-board.mjs`）从 `data/seo-geo-board.json` 实测得出，非猜测。

| # | 测试（断言意图） | 旧写死值 | 实测新值（2026-10-25） | 变更根因 |
|---|---|---|---|---|
| 1 | covers all modules | 11 模块 `[M0..M10]` | 12 模块 `[M0..M11]` | M11（Bing Topic Portfolio）于 2026-10 加入 |
| 2 | has N tasks | 66 | 101 | board 增长（M11 + 多 supplement 任务） |
| 3 | open decision 引用 | 每条 `blocks` 必匹配 `^M\d+-\d+$` | 容错 `blocks`(任务id) **或** `anchor`(锚点id 如 A3) | D2 改用 `anchor:"A3"`，不再有 `blocks` 字段 |
| 4 | fires daily every day | 依赖 `M9-2` 为 daily | 改为直接钉 `firesOn` 的 `daily` 分支（合成任务） | M9-2 已变 `weekly`+`done`，全 board 无 open daily 任务 |
| 5 | every-2-days 奇偶锚定 D0 | 依赖 `M7-3` 为 every-2-days | 改为直接钉 parity 逻辑（合成任务） | M7-3 已变 `weekly`，无 open every-2-days 任务 |
| 6 | totals 汇总 | tasks66 / done30 / open36 | tasks101 / done59 / open42（coreOpen+suppOpen=42 不变） | board 状态演化（大量任务 closed done） |
| 7 | lists recurring on D0 | 09-27 含 M9-2/M1-5（daily） | 改测 Monday 09-28 实测 firing：`M1-5`/`M7-4`/`M9-6` | 09-27 为周日且无 open daily 任务 → dueToday 空 |
| 8 | D0 actionable（排除 standing） | dueToday.length=5 | 09-28 实测=6；standing=8、continuous=6 不变 | 同 #7，改用 firing 日实测 |
| 9 | M10.nextDue | `'2026-10-15'`（M10-2） | `null` | M10-2 已 `done`，M10 无 open dated 任务 |
| 10 | due item 状态/标签 | M1-5 cadenceLabel `'每日'` | 09-28 上 M1-5 cadenceLabel `'每周'` | M1-5 实为 `weekly` |
| 11 | dropped 不计入 open | open `36-1` | open `42-1`（当前 open=42） | open 基数变化 |
| 12 | blocked 单列 | 恒 `blocked===1`（假设初始 0） | 自适应 `before+1`（board 已有 1 个 blocked 任务） | board 当前已有 1 个 blocked 任务 |
| 13 | convenience loader tasks | 66 | 101 | 同 #2 |

## 纪律校验
- ✅ 未改动 `data/seo-geo-board.json` 的**任务数据本身**（仅 M8-11 自身状态/statusNote 随本任务收口更新，属任务关闭动作）。
- ✅ 未改动 `src/lib/board/derive.ts`（逻辑经复查完好；失败 100% 来自测试快照）。
- ✅ 13 处断言逐条有实测依据，对照表见上。
- ⚠️ 残留：测试由红转绿后，门禁恢复可信基线；建议本任务合并进入主分支时一并 `git add tests/unit/board.test.ts docs/board-test-remediation-2026-10-25.md`（不 `git add -A`，不 push，待人工复核）。
