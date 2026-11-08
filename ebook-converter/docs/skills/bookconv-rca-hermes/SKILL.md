---
name: bookconv-rca-hermes
description: "bookconv 转换失败告警（Feishu 卡片、CloudConvert/Calibre 报错）的根因分析任务：默认委派 Hermes systematic-debugging 做深度 RCA，桥不可用时降级本地 SOP；强制执行六条证据纪律（格式指纹定位、枚举相容解释含兜底码陷阱、对照实测+服务器侧取证、置信度分档、健康信号守恒、锁测试期望值实测）。触发词：转换失败告警、根因分析、RCA、CloudConvert 报错、calibre 失败、bookconv 故障。"
---

# bookconv 告警根因分析 → 委派 Hermes

> **版本控制（双写契约）**：本文件有两份——仓库 `docs/skills/bookconv-rca-hermes/SKILL.md`（版本化源，走 git 历史/评审）与 DSH 生效副本 `C:\Users\29537\.dsh\skills\bookconv-rca-hermes\SKILL.md`（harness 实际加载的这份）。**两处必须保持一致，改任一边都要同步另一边**，否则会出现「skill 说一套、入库版本是另一套」的权威源漂移（本仓库 `audit-agent-discipline` 门禁打击的同款失败模式）。

## 何时使用

收到或处理以下类型任务时加载本 skill：
- bookconv 转换失败告警卡片（Feishu "🚨 Conversion Failed" / "Conversion Backend Unavailable"）
- 用户问「分析这次转换失败的原因 / 根因 / 为什么失败」
- CloudConvert / Calibre / 同步转换路径（`/api/convert`）相关报错定位
- 任何线上告警的事故复盘（六条纪律通用）

## 路由规则（默认动作）

1. **先原样保存告警原文**：Path、Job ID、Format、Error（完整错误串）、Time，并**全读诊断字段**——`Backend delegation`（delegationFallback）、`Input hash/size`、`Local validation (inferred)`、`First engine`。这些字段是专门为 RCA 加的，漏读一个就可能归因反向（2026-11-02 Job 729f7eae：卡片只写 "too small"，真实原因是后端 busy 429 → 回退 CC → CC 体积守卫拒收）。错误串是后续一切推理的指纹，不要先做摘要再分析。
2. **委派 Hermes**（先探测：会话工具列表里没有 `mcp__hermes-skill__*` ⇒ 直接走第 4 步本地 SOP，不要中途试桥）：
   ```
   mcp__hermes-skill__run_hermes_skill(
     skill_name="systematic-debugging",
     query=<见下方模板>,
     max_turns=8
   )
   ```
   - bookconv 站务 / 部署 / 环境类故障可追加 `skill_name="bookconv-ops"`。
   - 官方 Hermes MCP（会话/记忆工具）可用于查历史 RCA 会话，但主分析走 systematic-debugging。
3. **整理 Hermes 的返回**：把根因 + 证据链改写成用户可读结论，不要直接粘贴它的长输出。
4. **Hermes 失败时的降级**：
   - 主模型 agnes-2.0-flash 撞 429 会自动 fallback 到 agnes-backup（正常现象，输出里会出现 "Model fallback" 行），不因此判定失败；
   - 桥超时/失败/**根本不存在** ⇒ 走「本地分析 SOP」一节——但**仍必须执行六条纪律**，并明确告知用户「本次未经 Hermes 深度分析」；
   - 若本机 pwsh 执行器不可用（0xC0000142 等），实测验证部分直接依赖 Hermes 完成，不要卡在本地。
5. **修复闭环**（用户接着要求修复时）：修复后必须**独立红队审计**——不把 RCA 结论喂给红队（独立上下文，防锚定）；并走仓库门禁（开工先 `node scripts/verify-hook-mount.mjs`，收尾 `node scripts/verify-closure-gates.mjs --no-live`）。2026-11-08 实证：RCA 修复本身曾引入「健康信号静默死亡」风险，被红队抓回（见纪律 5）。

## 委派 query 模板（必须自包含，Hermes 看不到本对话）

> 线上告警根因分析。代码仓库：`E:\一人公司\电子书格式转换站\ebook-converter`。
> 告警原文：`<Path / Job / Format / Error / 诊断字段全文，原样粘贴>`。
> 相关代码入口提示（可选）：`src/app/api/convert/route.ts`、`src/lib/convert-handler.ts`、`src/lib/conversion.ts`、`src/lib/cloudconvert.ts`、`src/lib/alerts.ts`、`src/lib/conversion-backend-client.ts`、`conversion-backend/app/{index,calibre}.js`。
> 要求输出：① 根因 ② 证据链（每条标注「已实测验证 / 高概率推断 / 未证实」）③ 受影响范围（孤立 1 例还是批量）④ 最小修复建议 ⑤ 待确认项（含如何坐实）。
> 纪律：错误串先做格式指纹定位抛出点；逆推前枚举全部相容解释（含兜底码陷阱）；能复现就做服务器侧对照实测；改动健康信号语义先过纪律 5。

## 六条证据纪律（无论谁分析，均为验收标准）

1. **格式指纹先行**。错误串格式往往唯一指向抛出点，零成本。已知 bookconv 指纹：
   - `CloudConvert job failed: <detail>` → `pollUntilDone` 抛出的 `CloudConvertJobFailure`
   - `CloudConvert job failed after N attempt(s) | <trail>` → `convertWithCloudConvert` 最终抛错（trail 含每次尝试的引擎与原因）
   - `CloudConvert client error <status>` / `server error` / `request failed after retries` → `ccRequest`
   - `CloudConvert upload failed <status>` → `uploadToJob`
   - `Conversion output failed verification` → 输出校验门禁（verifyConversion）
   - `backend returned HTTP <status>` → 熔断开闸告警（`conversion-backend-client.ts` 的 `failWith → notifyBackendDown`）
   - `fell back — backend HTTP <status> — <CODE>: …` → `readBackendDetail`（后端 500/422/503 响应体）
   - `Conversion failed: <detail>` → 后端 `calibre.js pickErrorDetail`（Calibre stderr 末行异常）
   - ⚠️ 指纹只定位**抛出点**，不等于**根因类别**——见纪律 2 的兜底码陷阱。
2. **枚举相容解释**。逆推结论前列出全部相容解释并逐个排除。反面教材（2026-10-19 c3beac1b）：由「只跑了 1 次」直接推出「错误不是 CloudConvertJobFailure」，未检查「是 CCJF 但 importTaskFailed/convertTaskFailed 均为 false」这条更简单的解释——而错误串格式已证明后者才是真相。**严禁单链归因（attribution over-reach）**。
   - **兜底码陷阱**：任何 `result.code || "默认码"` 形态的错误契约都**不是可靠指纹**。`CONVERSION_FAILED` 在 2026-11-08 之前把 spawn ENOENT（Calibre 二进制丢失）、120s 超时、SIGKILL/OOM 全折叠进来；现已拆出 `BACKEND_UNAVAILABLE`(503)。再遇到新的 `|| 默认码` 形态，先审计折叠面再下结论。
3. **对照实测**。能线上复现就不停在代码推导。**服务器侧取证/探针优先于纯前端推理**（打法见「服务器侧实测打法」节）：`conversion.log` 的 FAIL+STDERR 行、零侵入第二实例、monkeypatch、合成样本边界扫描（255/256 型一锤定音）。同路径一胜一败才能排除管线/额度/引擎故障。
4. **置信度分档**。每条结论标注「已实测验证 / 高概率推断 / 未证实」，写清「什么证据能证伪我」，无法验证的列入待确认项（如原始文件未留存、GA4 数据延迟）。
5. **健康信号守恒**（2026-11-08 新增）。修改「什么计入熔断/告警/失败计数」时，先回答「**X 真死时，现在还有什么会响**」。移除某信号前必须确认有等价信号补位（如先把基础设施失败拆成独立码/状态），否则等于拆掉唯一的死亡警报。实证：`CONVERSION_FAILED 不计熔断` 曾让「Calibre 二进制损坏」类故障熔断永不开启、红卡永不发——旧红卡是「有效信号 + 错误标签」，要修的是标签，不是拆信号。
6. **锁测试的期望值也要实测**（2026-11-08 新增）。契约锁测试的期望值若抄自实现现状而非实测，会把 bug 固化成契约、挡住未来修复（实证：`'INVALID ZIP FILE' ⇒ failed` 被断言固化成假阳性契约）。写锁测试时自问：「这个期望值是测出来的，还是抄出来的？」

## 服务器侧实测打法（对照实测的首选路径）

后端是独立服务：HK `43.129.176.38`，SSH `ubuntu@43.129.176.38 -i ~/.ssh/geo_tuozhi.pem`，服务名 `bookconv-conversion`，日志 `/opt/bookconv-conversion/logs/conversion.log`，env `/opt/bookconv-conversion/.env`（root-only，取密钥须在 `sudo bash -c` 内 source，**绝不打印**）。

1. **SSH 日志取证（零成本，第一步就做）**：拉 `FAIL` 行 + **紧跟的 `STDERR` 行**——后者是完整 traceback（压平、1500 字符），直接给出 Calibre 侧抛出函数链。2026-11-08 告警 2 靠它一步定位到 `writer8/tbs.py:193`，前端推理最多只能推到「后端 500」。
2. **零侵入探针（不碰生产服务）**：
   - **异常路径验证**：同机另起**第二实例**（`PORT=3999 CALIBRE_BIN=/nonexistent node app/index.js &`）打异常分支，验证完 kill。503/BACKEND_UNAVAILABLE 即此法实测。
   - **monkeypatch**：wrapper 脚本先 `sys.path.insert(0,'/usr/lib/calibre')` 并设 `sys.resources_location/extensions_location`，再 patch 模块级函数（如 `tbs.calculate_all_tbs`），最后 `from calibre.ebooks.conversion.cli import main`。不改生产文件。
   - **合成样本 + 边界扫描**：最小合法样本生成器（EPUB ≈30 行 python）扫 255/256 型边界，把「机制推断」升级为「已实测验证」。
3. **Windows/SSH gotcha（踩过的坑）**：
   - 远程脚本含 `$` ⇒ 整段 base64 后 `echo <b64> | base64 -d > /tmp/x.sh; bash /tmp/x.sh`（PowerShell 双引号会插值 `$var`、`$?`、`$(...)`）。
   - 多文件 base64 内联超 argv 上限（PowerShell 报 `StandardErrorEncoding is only supported…`）⇒ 文件走 `scp`，只有脚本走 base64。
   - `sudo mkdir` 建的目录是 root 属主，ubuntu 写不进 ⇒ 直接写 `/tmp/`。
   - 测 spawn ENOENT 时 shim 路径**不能带 `.cmd/.bat` 后缀**（命中 `useShell` 分支，Windows 报错形态是退出码 1 + "is not recognized"，不是 ENOENT）；生产 Linux 本就无 shell 分支。
   - 重启服务前查 `pgrep -f ebook-convert`（并发=1，重启会打断在跑的转换）。

## Hermes 不可用时的本地分析 SOP（六步）

1. 告警原文 + 诊断字段全读（路由规则 1）。
2. 指纹定位：卡片 title/pathLabel → kind；Error 前缀 → 抛出文件（纪律 1 指纹表）。
3. SSH 拉 `conversion.log` 的 FAIL + STDERR 行（无 SSH 则靠 `delegationFallback` 字段）。
4. 前端链路对照：`route.ts`（canDelegate / 委派顺序）→ `conversion-backend-client.ts`（失败路径 + 熔断语义）→ `convert-handler.ts`（回退 + 告警 payload）→ `conversion.ts`（§3.5 校验 / 纯 JS）或 `cloudconvert.ts`。
5. 能复现则做服务器侧对照实测（上一节）。
6. 分档 + 证伪条件 + 待确认项输出。

## 已知代码盲区（分析时重点怀疑）

**① 兜底码陷阱（2026-11-08 新增，通用性最强）**
`conversion-backend/app/index.js` 的 `result.code || "CONVERSION_FAILED"` 是兜底码。2026-11-08 起 `calibre.js` 区分三类：`DRM_PROTECTED`(422)、`BACKEND_UNAVAILABLE`(503，spawn ENOENT/超时/SIGKILL)、其余无 code（兜底成 `CONVERSION_FAILED`(500)）。
前端配套（`conversion-backend-client.ts`）：`CONVERSION_FAILED` 不重试、**不计熔断**；`BACKEND_UNAVAILABLE`(503) 与其他 5xx 重试一次并计数；4xx 不计（413 可达：R2 直传上限 100MB vs 后端 50MB）。
分析旧版本后端时，`CONVERSION_FAILED` **不能**当「确定性输入问题」读。

**② pollUntilDone 分类（已修复，降级为回归观察项）**
2026-10-19 的「只看首个 error 任务 operation」盲区**已在 `src/lib/cloudconvert.ts` 修复**（`anyImportErrored` 任意 import 任务 error + `inputTaskFailedMsg` 消息签名双判据）。且 M8-14 起 `Input task has failed` 属永久失败、短路不重试。若再见到同签名归因错误，先 diff 该函数是否被回退。

**③ 告警卡字段有版本语义**
- `localValidationInferred`：2026-11-08 起为「cloudconvert 优先 + §3.5 签名命中」（`alerts.ts inferLocalValidation`——错误来自 CC ⇒ 文件必过 §3.5 ⇒ passed，消除与引擎侧 `'Invalid ZIP file, local header is damaged'` 字面重叠的假阳性）；此前是 `errorCode===CORRUPT_INPUT` 反推（会把 CC import 拒收误标 failed）。跨日期统计不可混用。
- `backend-unavailable` 卡的 `(503)` 是硬编码 pathLabel，真实 status 看错误行；2026-11-08 起熔断告警带后端 `code+error`。
- 诊断字段本身也可能说谎（2026-11-07 告警 38ac1f26 的 `Local validation: failed` 实为误标）——与源码逐字核对才算数。

**④ `delegationFallback` 字段必读**
它是区分「后端先败 → 回退 CC → CC 败」与「CC 直接败」的唯一前端侧证据，曾两次纠正归因方向（2026-11-02 Job 729f7eae、2026-11-07 Job 38ac1f26）。

## 教训来源

**2026-10-19 CloudConvert 告警 `c3beac1b-913a-4ffa-b077-a98efdce3caa`（epub→pdf）**：首轮分析误判错误传播路径（归因过度）；Hermes 实测定位为**文件级损坏**（合法 EPUB 成功 vs 损坏 EPUB 同款错误），并挖出 pollUntilDone 分类盲区。纪律 1–4 的固化产物。

**2026-11-08 双告警（🚨 Backend Unavailable + ℹ️ epub→azw3 `ValueError: byte must be in range(0, 256)`）**：
- 告警 1 根因 = 后端给 txt 目标传了 Calibre 7.6.0 不存在的 CLI 选项 `--dont-add-chapters-to-toc` → 所有 X→txt 后端转换 100% 500 → 3 连败熔断开闸误报红卡。教训：**`conversion.log` 的 STDERR 行是一手证据**，前端推理到「后端 500」就到头了。
- 告警 2 根因 = Calibre KF8 TBS 编码单字节上限（`mobi/utils.py encode_tbs` 的 `bytes(bytearray([extra[0b100]]))`，strand 内同级索引条目 ≥256 即炸；上游 master 仍未修，升级无用）。函数级 255/256 边界扫描 + 零侵入探针钉死机制。
- **元教训（最重要）**：RCA 修复本身也要过**独立红队**——首轮 `CONVERSION_FAILED 不计熔断`曾引入「后端真死时全静默」的更重风险，被红队抓回（纪律 5）；`inferLocalValidation` 的假阳性曾被自己的锁测试固化（纪律 6）。红队不得拿 RCA 结论当输入。
- 附带：告警卡的诊断字段可能误标，与源码逐字核对才算数（③）。
