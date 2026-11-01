# M8-10 §3.5 盲区诊断 · 正式结案（2026-11-01）

> 结案性质：**ACCEPTED KNOWN LONG-TAIL（已知长尾，正式结案）**，非「无限期重开监控」。
> 依据：`seo-geo-board.json` M8-10 `accept` 条款——「复发 ≥2 且均为深度校验放行后 ⇒ 重开诊断」。
> 实际触发：10-26 Job `9dba318b`（epub→mobi）+ 10-31 Job `8de95590`（epub→azw3），**两次均 POST-§3.5 复发**，阈值已满足。

## 1. 根因（Fact，非 Inference）

一类 EPUB 文件**能通过本地 §3.5（jszip 成员解压校验）**，却在 **CloudConvert import 阶段被拒收**，报 `Input task has failed`（calibre + auto 双子引擎同 hash 同消息失败，2 attempts）。

- 这是 **输入级损坏 / CC import 解析严格度差异**，**不是系统宕机、不是后端故障**。
- 证据链：10-26 Job `9dba318b`、10-31 Job `8de95590`；`cloudconvert.ts:402` 证实 `engine=calibre/auto` 是 CC 自身子引擎选择，非自建 VPS Calibre 后端 → 100% CC 失败。
- 本项目 `node_modules/jszip@3.10.1` 实测：**无 `verify` 选项、ZipObject 不暴露 `crc32`** → 无法在 §3.5 本地可靠拦截 CRC/语义级损坏。尝试 M8-12（`{verify:true}`）经 tsc + node_modules 查证后已**回退**（运行时空转 + 编译错误，属假修复，见下）。

## 2. 处置决策：接受为已知长尾，三层兜住

不强行在本地补 CRC 级校验（成本高、jszip 不支持、收益低），改为**让 CC import 在边缘拒收 + 下游正确分类/短路**：

| 层 | 改动 | 作用 |
|----|------|------|
| M8-13 | `error-handler.ts` 把 `input task has failed → CORRUPT_INPUT`；`alerts.ts` `USER_SIDE_PATTERNS` + `USER_SIDE_ERROR_CODES` 双层 | 该签名由 🚨 系统红卡 **降级为灰卡（用户侧）**，不再稀释系统告警通道 |
| M8-14 | `cloudconvert.ts` 永久损坏短路（`/input task has failed/i` 与 DRM 同级） | 字节不变的重试必失败 → **禁止第 2 次无效重试**，不再白烧 CC job + 270s 轮询 |
| D2 门禁 | `ga-inspection.mjs` Part A 引擎结论须由深度分析 D2 背书（`!d2 \|\| verdict!==PASS` → 不可验证，禁写「正常」） | 失败分流数据缺失/矛盾时不伪报健康 |

## 3. 为何结案而非重开无限监控

- close-gate 原条件「连续 7 天 0 复发」此前 FAILED（10-26 复发），需重开诊断——但**诊断目的已达成**：根因明确、remediation 已落地并反向验证通过（M8-13/M8-14 单测 8/8+5/5）。
- 复发本身已是**低影响事件**：灰卡（非红卡）+ 零无效重试 + 不伪报健康。继续无限监控的边际价值趋近于零，违背「零成本优先 / 流量优先」硬约束。
- 因此裁定：**接受为已知长尾，M8-10 结案**；能力边界写入本文档 §4，供后续排障直接引用。

## 4. 能力边界（写入长期记忆要点）

- **§3.5 必要但不充分**：拦截「成员 deflate 解压失败」类损坏；**不能**拦截「能解压但存储 CRC/语义损坏、CC import 仍拒收」类（jszip 限制）。
- 该长尾由 **CC import 在边缘拒收 + 下游灰卡/短路** 闭环，**用户侧输入问题**，非 SLA 违约。
- 真正需告警的系统故障判据不变：CC 402 配额、CC 超时/5xx、自建 VPS Calibre 后端不可用、直传链路故障（DIRECT_UPLOAD_FAILED）。

## 5. 残余与监控退出条件

- 退出无限监控；若**未来出现新的、非 `input task has failed` 签名**的系统侧失败 spike，按 F5 盲区告警 + 既有 red-team 门禁重新立项，不依赖本任务。
- 误报复盘：10-31 原始告警 2 曾被误判为 🚨 System-side（红队审计 F6/F7 已修正）；后续同类签名只走灰卡。
