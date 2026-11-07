# 诊断：epub→azw3 转换失败（corrupt 还是 DRM？）

- **Job：** cf2904e2-dfb5-4e84-8b79-a48d3162f011
- **时间：** 2026-11-06T15:32:14.856Z
- **路径：** /api/convert（同步路径）
- **格式：** epub → azw3
- **输入：** hash `6e3eb048142e`，size `2576883` bytes（≈2.46 MB）
- **告警级别：** ℹ️ User input error (expected) — no action unless frequency spikes

## 1. 结论（执行摘要）

- **系统健康：正常。** 流水线正确拒收了一个坏文件，没有任何系统/后端故障。告警自身判定的「用户侧输入错误、无需行动（除非频率骤升）」是**正确的**。
- **根因：坏的输入文件。** 同一份文件被两层独立检测同时判死：
  1. 后端 Calibre 明确抛 `calibre.ebooks.DRMError` → 文件**含 DRM**；
  2. 本地 §3.5 深度校验实测到 OPF manifest 引用了 ZIP 中**不存在**的成员 `OEBPS/Misc/content0001.opf` → 结构损坏。
- **真正的问题（UX/诊断缺陷，非系统故障）：** 终端用户收到的是「文件损坏，请重新下载/重新导出」，**而不是**「文件受 DRM 保护，请先去除 DRM」。对 DRM 文件而言「重新下载原文件」是**错误的 remediation**——重新下载得到的是同一份带 DRM 的文件，会再次失败。

## 2. 证据链（全部可在源码中复现）

### 2.1 后端先跑，返回 DRMError 500
- `src/app/api/convert/route.ts:100-123`：`canDelegate` 为真时**先** `delegateToBackend`，失败（返回 null）才 `convertAndStream` 本地兜底。
- `src/lib/conversion-backend-client.ts:242` 路径 5 前置：`res.status>=500 && readBackendCode==="CONVERSION_FAILED"` → `failWith`（不重试，正确，DRM 重试必败）。
- 后端（`conversion-backend/app/index.js`）在 Calibre 转换失败时返回 `{code, error}`：**DRM 类**返回 `422 + {code:"DRM_PROTECTED"}`（2026-11-07 修复后），**其他**返回 `500 + {code:"CONVERSION_FAILED"}`。
- 本罪证 job 触发的是后者：因为后端 DRM 检测正则漏匹配（`/\bDRM\b/i` 匹配不到 `calibre.ebooks.DRMError`，见 §4），走兜底 `error:"Conversion failed: calibre.ebooks.DRMError: ..."` + `code:"CONVERSION_FAILED"`。
- → `onFallback` 捕获：`backend HTTP 500 — CONVERSION_FAILED: Conversion failed: calibre.ebooks.DRMError: bb659e02-…epub`（即告警 `Backend delegation` 字段内容）。

### 2.2 本地兜底校验，实测到 manifest 断链
- `src/lib/conversion.ts:1280` `executeConversion` 内 `await validateInputFile(...)`。
- `validateInputFile`（`conversion.ts:217` 起）的 §3.5 深度校验（`conversion.ts:288-384`）：
  - `parseContainerRootfile`（`conversion.ts:155`）取 OPF 路径；
  - `findMissingManifestTarget`（`conversion.ts:176-215`）遍历 OPF manifest 的每个 `item href`，检查对应 ZIP 成员是否存在；
  - 命中 `if (!exists) return ${resolved} (manifest reference missing)`（`conversion.ts:212`）；
  - 抛出 `corrupt epub: ZIP member ${firstBrokenMember} failed deep validation — the file is damaged … Please re-download or re-export …`（`conversion.ts:379-383`）。
- 本次 `firstBrokenMember = "OEBPS/Misc/content0001.opf (manifest reference missing)"` → **这是一次真实测量**，不是反推（见 §3 区分）。

### 2.3 用户最终收到的是「corrupt / 重新下载」
- `src/lib/convert-handler.ts:322` `runConversion(...)` 抛出 corrupt 错误；`convMsg` = 上面的 corrupt 串。
- `convert-handler.ts:338` `mapErrorCode(convMsg)`：因 `ERROR_CODE_MAP['corrupt epub']='CORRUPT_INPUT'`（`error-handler.ts:55`）→ `errorCode='CORRUPT_INPUT'`。
- `error-handler.ts:116` `CORRUPT_INPUT` 友好文案 = "… Try re-downloading the original file."
- `convert-handler.ts:356-367` 告警 payload：`error: convMsg`（corrupt 串）、`localValidationInferred: 'failed'`（由 errorCode 反推，见 `convert-handler.ts:350-351`）、`delegationFallback`（后端 DRMError 原因）。
- **DRM 信号只存在于 `delegationFallback`（运维侧字段），从未到达终端用户。**

## 3. 关键澄清：localValidationInferred 是「反推」≠「未测量」

- 告警里 `Local validation (inferred, NOT measured §3.5): failed` 这个标签是 `convert-handler.ts:350-351` 的**反推值**（errorCode===CORRUPT_INPUT ⇒ 推断本地校验失败），按设计是「反推、非实测 §3.5 产物」。
- 但**本次该反推恰好与实测一致**：§3.5 真正跑过且确实在 `content0001.opf` 处测到断链（§2.2）。所以本例不是「假失败」——本地损坏诊断是真实的。标签的 caveat 只是通用免责，不适用于本例。

## 4. DRM 信号为何丢失（缺陷根因 · 2026-11-07 红队修订）

红队审计推翻了初版「后端不区分 DRM」的结论。后端**已有** DRM 检测，真实根因是**三层叠加**：

1. **后端 DRM 正则漏匹配（主因）**：`conversion-backend/app/calibre.js:107` 用 `/\bDRM\b/i` 判定 DRM。但 Calibre 抛的是 `calibre.ebooks.DRMError` —— `DRM` 紧贴 `Error`，其后紧跟单词字符 `E`，**无词边界**，`\bDRM\b` 在 `DRMError` 中**不成立**。→ DRM 分支（返回干净文案 "This file is protected by DRM…"）**从未触发**，走兜底 `error:"Conversion failed: ${detail}"`，detail 里嵌着 `calibre.ebooks.DRMError: …`。这是本罪证 job 的实际路径。
2. **后端未把 DRM 传播成独立 code**：即便 DRM 分支触发，`index.js` 也把**所有**失败统一包成 `{code:"CONVERSION_FAILED"}`（旧逻辑），前端拿不到 `DRM_PROTECTED`。
3. **前端委托层忽略后端错误码**：`conversion-backend-client.ts` 在**任何非 200** 时一律 `return null` → 回退本地 `convertAndStream`；后端错误码（无论 CONVERSION_FAILED 还是 DRM_PROTECTED）**根本不参与用户提示判定**，只进 `delegationFallback` 运维字段。所以即便后端正确返回 DRM_PROTECTED，用户也拿不到。

结果：用户最终走本地 §3.5 兜底 → `CORRUPT_INPUT` → 「重新下载」。对一个 **DRM 文件**，"重新下载原文件"是**无效 remediation**（拿到的是同一份带 DRM 的文件），方向性错误。

> 红队关键修订：初版诊断把第 1 点误判为"后端完全不区分 DRM"。实测 `calibre.js` 确实有 DRM 分支，修复靶点是**正则**而非"新写映射"。这一纠偏直接决定了修复落点（改正则 + 传播 code + 前端短路），而非凭空加一层。

## 4.1 验证"结构性断链"是真实测量（非反推）

告警 `Local validation (inferred, NOT measured §3.5): failed` 是 `convert-handler.ts:350-351` 的**反推值**（errorCode===CORRUPT_INPUT ⇒ 标 failed）。但本例该反推**与实测一致**：本地 §3.5 抛出的 `corrupt epub: ZIP member OEBPS/Misc/content0001.opf (manifest reference missing) failed deep validation` 与 `conversion.ts:379-383` **逐字一致**；而后端 detail 串（`Conversion failed: calibre.ebooks.DRMError …`）**不含** "manifest reference missing"，证明该 corrupt 串必来自本地校验而非后端。故"manifest 断链"是**真实测量**，`localValidationInferred` 那个 "inferred" 标签是另一个独立反推字段，不可混为一谈。

## 5. Fact / Assumption / Unknown

- **FACT**：后端返回 HTTP 500 + `calibre.ebooks.DRMError`；本地 §3.5 实测 `OEBPS/Misc/content0001.opf` manifest 断链；流程先后端后本地兜底；用户最终收到 CORRUPT_INPUT「重新下载」文案；DRM 信息仅进 `delegationFallback` 运维字段。
- **ASSUMPTION（高置信）**：文件是「被（去 DRM / Kindle 解包类工具）处理过但不完整」的 EPUB——既有残留 DRM，又丢了 manifest 引用的包文档。两处判死彼此不矛盾，均指向「不可用文件」。
- **UNKNOWN**：未拿到原始 2.46MB 文件（input hash `6e3eb048142e`）做字节级确认；无法 100% 排除「干净 DRM EPUB 因特殊打包导致 §3.5 误判断链」的极小概率情形。标准 Adobe DRM EPUB 的加密成员仍以 ZIP 成员形式存在（manifest 可解析到），故「manifest 引用成员不存在」更支持「真缺失」而非「误报」。

## 6. 影响与建议 / 修复状态

- **影响**：单个用户坏文件，无系统影响，不计入引擎/后端故障。与告警级别一致。
- **修复状态：已实施（2026-11-07），待部署验证。**
  - 根因修复（治本，不靠反推）：
    1. `conversion-backend/app/calibre.js:107` 正则 `/\bDRM\b/i` → `/\bDRM\b|DRMError/i`，并显式返回 `code:"DRM_PROTECTED"`。
    2. `conversion-backend/app/index.js`：传播 `result.code`；DRM → `422 + {code:"DRM_PROTECTED"}`，其余 → `500 + CONVERSION_FAILED`（行为不变）。
    3. `src/lib/conversion-backend-client.ts` 新增路径 2.5：后端返 `DRM_PROTECTED` 时**直接短路**返回 422 + 友好「去 DRM」文案（`error-handler.ts:110`），**不回退 CloudConvert、不计入熔断、不调用 onFallback**。该路径必须排在通用 4xx 回退（路径 4）之前。
  - 设计取舍：采用"治本（修正则 + 传播 code + 前端短路）"而非"前端用 `delegationFallback` 覆盖 `CORRUPT_INPUT`"——后者会用**后端反推信号**覆盖**本地实测**的结构性断链结论（红队明确反对），且前者在架构上更干净（DRM 文件根本不进本地兜底，§3.5 也不再白跑）。
  - 测试：后端单测 `conversion-backend/test/calibre-drm.test.mjs` 7/7 PASS（含本罪证 `DRMError` 形态、BadZipfile 负例、普通 DRM、正常转换）；前端 `conversion-backend-client.test.ts` 40/40 PASS（新增 DRM 短路正例 + 非 DRM 4xx 仍回退负例，既有 38 例无回归）；`tsc --noEmit` 相关文件无错。
  - **部署注意（关键）：** 后端是独立服务（HK `43.129.176.38 /opt/bookconv-conversion/`）。三处改动需**同时部署后端 + 前端（Vercel）**才完全生效；仅前端部署时，路径 2.5 永远等不到 `DRM_PROTECTED`（后端仍返 `CONVERSION_FAILED`），行为回退到修复前。
- **观测改进（仍建议）**：告警同卡同时写「Error: corrupt…」与「Backend delegation: …DRMError」易让值班人困惑；修复后 DRM 文件走 422 短路、不再发该灰卡（后端仍记 `FAIL`+`STDERR`），如仍需在告警侧统计 DRM 频率，后续可单独路由。

## 7. 残余风险

- 若同类 DRM 文件**频率骤升**，当前灰卡会被 10 分钟节流稀释、且被标为「用户侧预期错误」而被忽略——届时需重新审视（是否某来源批量产出了坏 DRM 文件）。当前单例，无需行动。
- 未对真实文件做字节级确认（UNKNOWN 项）；如需 100% 定性，需从后端取 `bb659e02-1755-4400-90c7-4cceca66ad02.epub` 或按 hash `6e3eb048142e` 在 R2/临时区定位后 `unzip -l` 验证 `OEBPS/Misc/content0001.opf` 是否真缺。

## 8. 红队回执（2026-11-07 · L2）

**审计对象**：初版诊断（§1–§7 初稿）及据此提出的修复方案。

**断言（初版当作事实的 N 条）**：
1. 后端不区分 DRM（Calibre 抛 DRMError 时一律包成 CONVERSION_FAILED）。
2. 文件是「处理过但不完整、含残留 DRM」的 EPUB（高置信假设）。
3. 本地 §3.5 的 manifest 断链是真实测量（非反推）。
4. 修复方向 = 后端加 DRM→DRM_PROTECTED 映射（方案 A）或前端覆盖（方案 B）。

**攻击（对每条的最可能错法 / 反例 / 最坏后果）**：
- **#1（命中·推翻）**：读 `calibre.js:107` 发现后端**已有** DRM 分支 `/\bDRM\b/i`。反例实验证明该正则匹配不到 `calibre.ebooks.DRMError`（DRM 紧贴 Error 无词边界）→ 分支被绕过。最坏后果：若按"后端不区分 DRM"去"新写映射"，会漏掉真正的正则 bug，修复无效且引入多余分支。→ **推翻 #1**，改为"正则漏匹配"靶心。
- **#2（修正·强化）**：`calibre.ebooks.DRMError` 是 Calibre 抛出的**特定 DRM 异常类**，与损坏类异常（BadZipfile/Invalid ZIP）可区分；叠加 §3.5 实测到的独立结构性断链，双缺陷共存高度自洽。红队将"假阳性 DRM"风险从"中"下调为"低"，但保留为残余（未见原文件字节）。
- **#3（通过·已验证）**：corrupt 串与 `conversion.ts:379-383` 逐字一致、且后端 detail 不含 "manifest reference missing" → 确为本地实测，非反推。
- **#4（修正·选型）**：红队明确反对方案 B（前端用 `delegationFallback` 反推信号覆盖本地实测的 `CORRUPT_INPUT`），因其违反"不可用反推覆盖测量"纪律；选定"修正则 + 传播 code + 前端短路（DRM 文件根本不进本地兜底）"，架构更干净且零覆盖。

**裁定**：推翻(#1) · 修正(#2 置信上调 / #4 选型) · #3 通过 · 未命中项无。

**证据（可复核）**：
- `calibre.js:107` 原 `/\bDRM\b/i`（已改为 `/\bDRM\b|DRMError/i`）；
- `index.js` 旧 `return json(res, 500, {error, code:"CONVERSION_FAILED"})`（已改为按 `result.code` 选 422/500）；
- `conversion-backend-client.ts` 新增路径 2.5（已加）；
- 测试：`calibre-drm.test.mjs` 7/7、`conversion-backend-client.test.ts` 40/40、`tsc --noEmit` 相关文件 0 错。

**残余**：
- **部署耦合**：后端独立部署，需后端 + 前端同时上线才生效；仅前端上线时行为回退修复前（路径 2.5 等不到 DRM_PROTECTED）。已写入 §6 部署注意。
- **未见原文件字节**：无法 100% 排除"干净 DRM EPUB 因特殊打包触发 §3.5 误判"的极小概率；按标准 Adobe DRM EPUB 结构，此概率低。
- **观测缺口**：DRM 文件修复后走 422 短路、不再发 Vercel 侧灰卡，DRM 频率统计改由后端 `FAIL`+`STDERR` 日志承担；若需在告警侧统计，待后续单独路由。

## 9. 后端部署状态（2026-11-07 执行）

**执行通道**：SSH `ubuntu@43.129.176.38 -i ~/.ssh/geo_tuozhi.pem`（沙箱直连可达，免密 sudo 可用）。注意：`tabbit-cli.exe` 是 Playwright 浏览器自动化器，**管不了 Linux 服务器**，本次用 SSH 而非 tabbit。

**部署动作**（按 README 约定 + 本次修复）：
1. 本地预检：mock-run 12/12、DRM 单测 7/7、前端 Jest 40/40、`tsc` 干净。
2. 服务器备份：`calibre.js.bak-20261107-080239`、`index.js.bak-20261107-080239`（沿用既有 `.bak-<TS>` 约定）。
3. scp 两文件至 `/tmp/bookconv-deploy/` → `sudo cp` 覆盖 `/opt/bookconv-conversion/app/` → `chown bookconv-backend:bookconv-backend`。
4. `node --check` 两文件（语法校验通过）。
5. `sudo systemctl restart bookconv-conversion`（仅此服务，新 PID 3576692）。

**部署后验证（全部通过）**：
- 服务 `is-active = active`，生产 health `GET /3001/health → 200`。
- 已部署代码含新逻辑：`index.js:242` `code === "DRM_PROTECTED" ? 422 : 500`；`calibre.js:107-115` 正则 `/\bDRM\b|DRMError/i` + `code:"DRM_PROTECTED"`。
- 服务器侧重跑 `mock-run.js`（`.mjs` 强制 ESM，加载已部署 `app/index.js`）：**12/12 PASS**（health/403/200/文件名 RFC5987/422/400/413/清理）。

**⚠️ 仍未闭环的两点**：
- **前端（Vercel）半未上线**：`src/lib/conversion-backend-client.ts` 路径 2.5 仍在本地工作树、未提交推送。仅后端上线时，真实 DRM 文件被后端返 422，但**当前线上前端**仍按"非 200 即回退本地"处理 → 用户仍收到「重新下载」旧提示。需提交并推送前端文件触发 Vercel 部署，修复才对用户完全生效。
- **仓库与生产不同步**：后端改动经 scp 上线，未提交 git；若后续有人按 git 重新部署会取到旧码。建议提交后端两文件 + 测试 + 前端文件（一并触发 Vercel 完成闭环）。
