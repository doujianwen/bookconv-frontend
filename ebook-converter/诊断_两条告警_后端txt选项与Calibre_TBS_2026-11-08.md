# 诊断_两条告警_后端txt选项与Calibre_TBS_2026-11-08

> 触发：飞书两条告警。① `🚨 Conversion Backend Unavailable`（2026-11-08T02:23:22.476Z，
> `backend returned HTTP 500`）；② `ℹ️ Conversion Failed (User Input)`（2026-11-07T05:23:48.316Z，
> Job 38ac1f26，epub→azw3，hash `3495cf289fd8`，543899 B）。
> 结论先行：**两条是两个独立根因，且都已被服务器实测坐实**。①是本仓库后端代码 bug
>（传了 Calibre 7.6.0 不存在的 CLI 选项）→ 熔断误报；②是 Calibre 上游未修复的
> TBS 编码限制（本仓库无解，靠分级与提示兜底）。

---

## 0. TL;DR

| 告警 | 直接原因 | 深层根因 | 定级 | 处置 |
|---|---|---|---|---|
| ① Backend Unavailable | 后端对每次 X→txt 都返回 500 | `calibre.js:81` 传 `--dont-add-chapters-to-toc`，Calibre 7.6.0 无此选项 | **系统侧（真实 bug）** | ✅ 已修复并部署 |
| ② Conversion Failed (User Input) | 自建 Calibre 转换阶段抛 `ValueError: byte must be in range(0, 256)`；CC import 侧另拒 | Calibre KF8 `encode_tbs` 把 strand 内条目数压进单字节，≥256 即炸（上游 master 仍未修） | 用户侧（灰卡正确） | 无代码解；仅修配套诊断字段 |

---

## 1. 告警 ①：`--dont-add-chapters-to-toc` 不存在 → 3 连败熔断误报

### 1.1 后端日志序列（与告警时间 112 ms 对齐）

```
02:06:57  OK   mobi -> epub            ← 成功 → failures 归零
02:18:37  FAIL epub -> txt
02:21:58  FAIL epub -> txt
02:23:22.364Z FAIL epub -> txt        ← 第 3 次连续失败 → 熔断开闸
02:23:22.476Z 🚨 告警送达
```

`STDERR` 行给出唯一原因：`ebook-convert: error: no such option: --dont-add-chapters-to-toc`。

### 1.2 根因与实测

- `conversion-backend/app/calibre.js:81` 对 `targetFormat === 'txt' | 'text'` 无条件追加该选项。
- 服务器（HK `43.129.176.38`）实测：`ebook-convert --version` = **calibre 7.6.0**；
  `--help` 全文无该选项；`grep -rn -- '--dont-add-chapters-to-toc' /usr/lib/calibre/calibre/ebooks/conversion/` 无匹配。
- 后果：**所有 X→txt 后端转换 100% 返回 500 CONVERSION_FAILED**。日志可见 11-07T18:09、
  11-08T00:59 / 01:00 / 02:18 / 02:21 / 02:23 / 05:31 共 7 次同签名失败。
- 用户侧其实未坏：前端回退后 epub→txt 走纯 JS `epubToTxt` 仍成功——代价是每次白打
  一次后端 + 计 1 次熔断失败，3 连败即熔断 60s 全站绕过后端（烧 CC 额度 + 10-30s 延迟）。

### 1.3 告警卡自身的两个缺陷（本次一并修）

| 缺陷 | 现象 | 修复 |
|---|---|---|
| 路径标签硬编码 | 卡片写 `/api/convert → backend forward (503)`，实际是 500 | 未改（历史格式，值班人已习惯；错误串本身已带真实 status） |
| 熔断告警不带后端 detail | 卡片只写 `backend returned HTTP 500`，无法区分「确定性转换失败」与「真基础设施故障」 | `failWith` 现把后端响应体 `code+error` 一并传入 `notifyBackendDown` |

---

## 2. 告警 ②：Calibre KF8 TBS 编码的单字节上限

### 2.1 完整 traceback（后端 `STDERR` 行，05:23:41.263Z，与告警差 7 s = 同一请求）

```
File ".../conversion/plugins/mobi_output.py", line 328, in convert
    kf8 = create_kf8_book(...)
File ".../mobi/writer8/main.py", line 499, in create_kf8_book
    writer = KF8Writer(oeb, opts, resources)
File ".../mobi/writer8/main.py", line 73, in __init__
    self.create_indices()
File ".../mobi/writer8/main.py", line 470, in create_indices
    self.has_tbs = apply_trailing_byte_sequences(entries, self.records, ...)
File ".../mobi/writer8/tbs.py", line 205, in apply_trailing_byte_sequences
    rmap = calculate_all_tbs(indexing_data)
File ".../mobi/writer8/tbs.py", line 193, in calculate_all_tbs
    tbs_bytes = sequences_to_bytes(sequences)
ValueError: byte must be in range(0, 256)
```

### 2.2 机制（已逐行核对服务器实际安装的 7.6.0 源码）

- `writer8/tbs.py:149`：`extra[0b100] = len(entries)` —— 一个 strand =
  同一 text record 内、同一深度、**连续兄弟**索引条目的数量。
- `utils.py:323` `encode_tbs`：`if 0b0100 in extra: ans += bytes(bytearray([extra[0b0100]]))`
  —— 把该数量压进**单个字节**。

**函数级对照实测**（服务器 7.6.0，`encode_tbs(1, {0b100: n}, 3)` 边界扫描）：

| n | 结果 |
|---|---|
| 1 / 100 / 254 / 255 | OK |
| **256 / 257** | **`ValueError: byte must be in range(0, 256)`**（与生产错误串逐字一致） |

该代码在 Calibre master 仍是 `bytes(bytearray([extra[0b0100]]))` —— **上游未修复，升级 Calibre 无用**。

### 2.3 为什么 CC 侧也失败、但两者不是同一失败点

- 自建 Calibre：**import 成功**（traceback 在转换阶段），转换时炸。
- CloudConvert：`Input task has failed` —— **import 阶段**就拒。
- 两者独立；且 M8-14 短路规则使 CC 只跑 1 次（`attempt=1` 符合预期，不白烧额度）。

### 2.4 卡片字段错误：`Local validation (inferred): failed` 是误标

- 错误串含 `input task has failed` → `mapErrorCode` → `CORRUPT_INPUT` → 旧反推逻辑标 `failed`。
- 但 §3.5 **实际通过**：若 `validateInputFile` 拦下，错误串会是 `corrupt epub: …` /
  `Invalid zip file …`，根本到不了 CC。
- `alerts.ts:68-70` 旧注释「反推为 passed」与现状不符（stale），一并修正。

---

## 3. 已实施的修复（2026-11-08）

| # | 文件 | 改动 | 验证 |
|---|---|---|---|
| P0 | `conversion-backend/app/calibre.js` | 删除 `--dont-add-chapters-to-toc`（附根因注释） | 新增 `test/calibre-txt-args.test.mjs` 8/8（argv 实测 + 源码契约锁）；服务器实测 epub→txt **200** |
| P1 | `src/app/api/convert/route.ts` | `canDelegate` 排除 `epub→txt`（照 `epub→html` 既有写法） | 全量 Jest 无回归；纯 JS 路径输出更干净 |
| P1 | `src/lib/conversion-backend-client.ts` | `failWith` 的 `notifyBackendDown` 带上后端 `code+error` | 新增用例：熔断告警卡含 `OUTPUT_ERROR` |
| P2 | `src/lib/conversion-backend-client.ts` | 确定性 `CONVERSION_FAILED` 不计入熔断健康失败（`countFailure=false`） | 新增 2 用例：单次不计 / 3 连败不开闸；既有 70 用例全过 |
| P2 | `src/lib/alerts.ts` + `src/lib/convert-handler.ts` | 新增 `inferLocalValidation()`：按 §3.5 真实错误签名判定，取代 `errorCode===CORRUPT_INPUT` 反推 | 新增 10 断言（含告警 2 真实串 ⇒ `passed`） |

### 3.1 部署与端到端实测（HK 后端，2026-11-08 05:48 UTC 重启）

| 用例 | 修复前 | 修复后 |
|---|---|---|
| `epub→txt`（后端直连） | 100% 500 `no such option` | **200**，78 B txt（日志 `OK epub -> txt 78B 676ms`） |
| `epub→azw3` 对照 | 200 | 200（12326 B） |
| `epub→pdf quality=high` 对照 | 200 | 200（29171 B，quality 分支未回归） |
| 合成 DRM 样本 `epub→azw3` | 422 | **422 `DRM_PROTECTED`**（11-07 修复未被本次破坏） |
| 部署源码 `args.push("--dont-add-chapters-to-toc")` | 1 处 | **0 处** |
| 服务 / 健康 | — | `active`；本地 `/health` ok；公网 `/health` 200 |

备份：`/opt/bookconv-conversion/app/calibre.js.bak-20261108-134607`（回滚 =
`sudo cp` 该文件回去 + `systemctl restart bookconv-conversion`）。

---

## 4. 置信度分档

| 结论 | 级别 |
|---|---|
| 告警① 直接原因 = 选项不存在；3 连败熔断开闸与告警时间 112ms 对齐 | **已实测验证** |
| 告警② 抛出函数链 + 255/256 边界 | **已实测验证**（traceback + 函数级边界扫描） |
| 告警② 输入含 ≥256 条同级索引 strand | **高概率推断**（机制已锁死；原文件已被后端 `finally` unlink，hash 未留存，R2 `uploads/` 1 天生命周期已过期） |
| CC import 拒收的具体原因 | **未证实**（CC 侧不可见） |

**无法证伪项**：若能取回 `3495cf289fd8` 原文件，`unzip -l` + 复算 NCX 同级连续条目数即可
坐实/推翻 §2.2 的触发条件。复现配方：单个 4096 B text record 内 ≥256 个连续同级索引条目。

---

## 5. 残余风险 / 待观察（2026-11-08 红队审计后修订）

1. **熔断语义（红队审计 #3 修正后闭环）**：`CONVERSION_FAILED` 不计熔断的前提
   「该码 ⇒ 确定性输入问题」曾被 `index.js:241` 的兜底码证伪——spawn ENOENT /
   120s 超时 / SIGKILL 都会兜底成 CONVERSION_FAILED，导致后端真死时熔断永不开启。
   **已修**：后端新增 `BACKEND_UNAVAILABLE` 码（`calibre.js` 判 killed / signal /
   字符串 err.code）并映射 HTTP 503；前端 path 5 对 503 正常计数+重试 ⇒ 熔断对
   真故障恢复防护。同时 4xx（413 可达：R2 直传 100MB vs 后端 50MB）也改为不计。
2. **熔断新语义的一致性边界**：现在只有「超时 / 网络错误 / 非
   CONVERSION_FAILED、非 BACKEND_UNAVAILABLE 的 5xx」计数。若后端出现新的
   兜底码形态，需同步审计（`calibre-infra-unavailable.test.mjs` 锁定 spawn/超时
   两类；新增失败形态须补用例）。
3. **`worker/src/converters/calibre.ts:41` 同样含该坏选项**：已确认为死代码（全仓无
   import），按 2026-11-03 红队「死代码改动即无效 churn」的裁定**未改动**，仅记录。
4. **告警卡 503 标签硬编码**未改（历史格式）；错误串已带真实 status 与后端
   code+error，信息不丢。
5. **历史可比性**：`localValidationInferred` 语义在 2026-11-08 前后不同
   （旧 = errorCode 是否 CORRUPT_INPUT；新 = cloudconvert 优先 + §3.5 签名命中），
   跨日期统计不可直接混用。
6. **TBS 上游 bug 无解**：同类文件会继续灰卡失败。若频次升高，可考虑在后端识别该
   签名并返回更明确的用户文案（「目录条目过多」），当前单例不值得做。
7. **`canDelegate` 与 conversion-map 的一致性债务**（红队审计 #2）：mobi/azw3/
   docx/html/rtf/fb2/lit→txt 共 7 个组合在 UI 标注 `tool:'js'`「Pure JS, no
   Calibre」，实际仍先委托后端。统一原则会改变这些组合的输出引擎，需单独评审。

---

## 6. 红队回执（2026-11-08 · L2 独立通道）

审计对象：commit `b0e7c69`（4 条修复 + 测试）。审计方式：独立上下文子代理，
不继承首轮推理，按「断言 → 攻击 → 裁定」执行，并实跑全部测试。

| # | 断言 | 攻击结果 | 裁定 |
|---|---|---|---|
| 1 | 删 `--dont-add-chapters-to-toc` 恢复基线、零新故障面 | 核验 maxBuffer/超时/Content-Type 均不受影响；Calibre TXT 插件源码无 chapters-to-toc 机制 | **成立**；但 route.ts 注释「txt 带 TOC 噪声」与 `inline_toc` 默认 False 不符 → 已改写 |
| 2 | route.ts 排除 epub→txt | isPureJsConversion 语义一致、无测试依赖后端、upload_key 链路正确 | **成立**；登记「2/40+ 特例 vs tool:'js' 标注」一致性债务 |
| 3a | notifyBackendDown 带 code+error | jest 全链穿透 | **成立** |
| 3b | countFailure=false（CONVERSION_FAILED 不计熔断） | **前提被证伪**：index.js:241 兜底码使 spawn ENOENT/超时/SIGKILL 也归入该码 → 后端真死时熔断永不开启；且告警 1 本身即属此类（旧红卡是「有效信号+错误标签」，原修复移除了信号而非修正标签）；half-open 悬挂不存在（攻击失败）；413 可达且计入 → 自相矛盾 | **需修正** → 已实施 BACKEND_UNAVAILABLE + 503 + 4xx 不计 |
| 4 | inferLocalValidation 签名判定 | 'corrupt epub:' 带冒号不漏、后端 stderr 不污染 convMsg（攻击失败）；但 'invalid zip file' 与引擎侧 'Invalid ZIP file, local header is damaged' 字面重叠 → 假阳性，**且被 reverse-verify 测试固化成契约**；'Input validation failed:' 包装串漏收录 → 假阴性 | **需修正** → 已实施 cloudconvert 优先规则 + 收录包装串 + 改写固化测试 |
| 5 | 新增测试有效性 | argv 契约锁真实有效；但假 Calibre 恒成功 ⇒ 新增**另一个**无效 txt 选项测不出 | **需修正** → txt/text argv 改为精确相等锁 |

**审计结论**：无一条修复需要回滚；删 flag + epub→txt 排除必须保留（二者共同保证
告警 1 不可复发）。4 处修正全部已在本次提交实施并实测（后端 3 套单测
9/9 + 9/9 + 7/7、前端 47 套件 / 568 用例、tsc exit 0）。

**审计的证伪条件（保留）**：
- 若能提供 Calibre 7.6.0 上 `--dont-add-chapters-to-toc` 存在的运行时证据（与服务器
  `no such option` 铁证冲突）→ 推翻修复 #1。
- 若 CC import 拒收也会返回详细 zip 错误详情（而非 `Input task has failed`）→
  inferLocalValidation 的 cloudconvert 优先规则可辩论；但「CC 侧拒收 ≠ 本地 §3.5
  拦截」的语义仍成立。
- 若生产 R2 直传上限被压到 ≤50MB → 413 可达性论证失效（改动无害但动机减弱）。
