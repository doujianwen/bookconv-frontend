# 诊断_epub→azw3 "Invalid zip file" 告警_2026-11-03

> 触发：飞书告警 Job `f547b469-5ab2-48ba-9950-57fd2d7cc595`，2026-11-03T14:48:45.212Z，`/api/convert` 同步路径，epub→azw3，输入 91,395 B，`Invalid zip file`，卡片标注 `Backend delegation: fell back — backend HTTP 500`。
> 结论先行：**这一次确实是用户文件损坏（ZIP 结构不完整），分级正确、不需值班**。但取证过程中实测推翻了本项目一条既有假设，并暴露 3 个真实缺陷——其中一个是「本地校验比引擎严格，会误杀引擎能转的文件」。

---

## 0. TL;DR

| 问题 | 答案 |
|---|---|
| 谁在转？ | 同一客户端 `117.188.84.89` 在 22:42–22:52 连续做 epub→azw3 批量转换，4 成功 1 失败 |
| 后端为什么 500？ | Calibre 对该文件转换失败（3.693 s，非超时、非宕机、非 429） |
| 前端为什么报 Invalid zip file？ | 回退后本地校验扫不到 ZIP 中央目录结束标记（EOCD `PK\x05\x06`） |
| 是系统故障吗？ | **否**。两条路径（Calibre / 本地 EOCD 扫描）都判该文件不可用 |
| 需要行动吗？ | 本次告警不需要。**但需要修 3 个缺陷**（见 §3），否则下一同类事件仍无法归因 |

---

## 1. 实测证据（后端 HK `43.129.176.38`，直连，非推断）

### 1.1 后端转换日志（`/opt/bookconv-conversion/logs/conversion.log`）

```
[2026-11-03T14:42:07.394Z] OK epub -> azw3 2398499B 9113ms
[2026-11-03T14:46:11.139Z] BUSY_WAITED 1ms
[2026-11-03T14:46:21.171Z] OK epub -> azw3 1772039B 10028ms
[2026-11-03T14:48:45.096Z] FAIL epub -> azw3 Conversion failed: dpkg: warning: failed to open
  configuration file '/home/bookconv-backend/.dpkg.cfg' for reading: Permission denied
Traceback (most recent call last):
  File "/usr/lib/calibre/calibre/ebooks/conversion
[2026-11-03T14:49:21.558Z] OK epub -> azw3 622586B 3953ms
```

时间 14:48:45.096Z 与告警 14:48:45.212Z 相差 **116 ms**，确认为同一请求。

### 1.2 nginx 访问日志（`/var/log/nginx/bookconv-access.log`，+0800）

| 本地时间 | 状态 | 响应字节 | client（真实客户端，经 x-client-ip 透传） | rt / urt |
|---|---|---|---|---|
| 22:42:08 | 200 | 2,398,499 | 117.188.84.89 | 11.494 / 9.125 |
| 22:46:22 | 200 | 1,772,039 | 117.188.84.89 | 12.380 / 10.037 |
| **22:48:45** | **500** | **261** | **117.188.84.89** | **4.325 / 3.693** |
| 22:49:52 | 200 | 622,586 | 117.188.84.89 | 35.821 / 3.958 |

- 261 B = `{"error":"Conversion failed: <stderr 前 200 字符>","code":"CONVERSION_FAILED"}`（`conversion-backend/app/index.js:233` + `app/calibre.js:55`）。
- 3.693 s 属「Calibre 启动 + 尝试 + 报错」量级，**排除**超时（120 s）、并发 429、后端宕机。
- 同一客户端 5 次请求 4 次成功 ⇒ 不是全局故障；EPUB 输入本身在其它文件上是好的。

### 1.3 后端对输入的处置

`app/index.js:225-228` 在 `finally` 里无条件 unlink 输入临时文件 ⇒ **原文件已不可取**，本次 Calibre 的原始 stderr 已永久丢失（只剩 §1.1 那 200 字符）。

---

## 2. 归因链

```
用户上传 91,395 B 的 .epub（同一人批量转 azw3 的第 3 个）
  └─ route.ts 委托自建后端 → Calibre 3.693s 失败 → 500 CONVERSION_FAILED
      └─ delegateToBackend 记录 "backend HTTP 500"（只记 status，丢弃 261B 响应体）
          └─ 回退 convertAndStream → runConversion → validateInputFile(sourceFormat=epub)
              └─ 魔数 PK\x03\x04 通过 → 但全文找不到 EOCD → 抛 "Invalid zip file"
                  └─ mapErrorCode → CORRUPT_INPUT → 告警卡 severity=user（灰卡）
```

**关键点**：本地校验发生在**所有引擎之前**（`conversion.ts:1276`），但它是在**后端失败之后**才跑到；所以卡片上「Local validation: failed」并非首因，首因是后端 Calibre 失败。

### 2.1 Calibre 失败形态的实测吻合（这是本轮最硬的间接证据）

在后端用 `bookconv-backend` 用户直接跑 `ebook-convert`（绕过服务，不占 busy 锁），对同一个 Calibre 生成的 EPUB 做递增截断：

| 截断量 | 输入大小 | Calibre 结果 | 耗时 | 我们的 EOCD 判据 |
|---|---|---|---|---|
| 0（完整） | 7,483 B | ✅ 成功 63,875 B | 575 ms | 通过 |
| 50 B | 7,433 B | ✅ **成功** 63,875 B | 575 ms | **判死** |
| 200 B | 7,283 B | ✅ **成功** 63,875 B | 551 ms | **判死** |
| 1,000 B | 6,483 B | ❌ `calibre.utils.zipfile.BadZipfile: File is not a zip file` | 2,757 ms | 判死 |
| 3,000 B | 4,483 B | ❌ 同上 | 2,628 ms | 判死 |
| 5,000 B | 2,483 B | ❌ 同上 | 2,495 ms | 判死 |

生产那次：**3.693 s / BadZipfile 类失败**——与「截断 ≥1,000 B」的失败形态（2.5–2.7 s，比成功慢 5 倍）吻合。差值约 1 s 可归因于 urt 额外包含 multer 接收 91 KB + nginx→node 传输 + Calibre 进程冷启。

### 2.2 补充实测（红队复审后追加）：流式 ZIP 也被误杀

上一版 §3 P2-C 只说「尾部截断 50–200 B 会被误杀」，把成因限定得太窄。补测真实世界更常见的一类——**流式 ZIP（只写 local file headers，从不写中央目录，因此也没有 EOCD）**，用 python 手工构造一个含 mimetype / container.xml / OPF / chapter 的最小 EPUB：

| 样本 | EOCD | Calibre 结果 | 耗时 |
|---|---|---|---|
| 流式 ZIP（742 B，无中央目录） | ❌ 不存在 | ✅ **成功**，输出 12,640 B | 516 ms |

即 **Calibre 的 zipfile 有"扫描 local headers 重建中央目录"的修复能力，只要顺序数据完整就能转**。我们的 `cdOffset === -1 → Invalid zip file` 判据会把整个成因类别判死，而不是个别边界情况。

---

## 3. 暴露的 3 个缺陷（均未改动，待批）

### P1-A｜后端错误被 200 字符截断，根因永远不可见

`conversion-backend/app/calibre.js:45-55`：

```js
const message = (err && (err.stderr || err.message)) || "Unknown conversion error";
return { success: false, error: `Conversion failed: ${String(message).slice(0, 200)}` };
```

Calibre 的 stderr **第一行恒为 dpkg 噪声**（`dpkg: warning: failed to open configuration file '/home/bookconv-backend/.dpkg.cfg'`），200 字符预算被它吃掉一半，真正有价值的 `BadZipfile` / `Traceback` 全部被砍。后果：日志、500 响应体、告警卡三处都看不到失败类型，本次只能靠"耗时形态"反推。

修法（低风险）：取 stderr 的**最后一个非空行**或匹配已知异常签名的行（`BadZipfile|DRM|ValueError|...`），并把剔除 dpkg 噪声后的前 200 字符保留；同时把完整 stderr 的前 2 KB 写入 conversion.log 单独一行。

### P1-B｜delegation 只透传 status，不透传后端错误体（11-02 修过的同类问题残留）

`src/lib/conversion-backend-client.ts:174`：`opts.onFallback(`backend HTTP ${res.status}`)`——429 分支读了 body `code`（:159-171），5xx 分支没读。于是告警卡只有 `backend HTTP 500`，而 261 B 响应体里本来就有 `Conversion failed: ...`。

修法：非 200 分支也 `await res.clone().json()`，把 `code` + `error` 摘要拼进 fallback reason（截断 120 字符）。

### P2-C｜本地 EOCD 判据：**红队裁定「否决原方案」**（2026-11-03 23:40 复核，见 §3.1）

**原方案（EOCD 缺失 → 放行给引擎）已作废**，不是优先级问题，是方案不成立。

`src/lib/conversion.ts:253-264` 要求全文存在 `PK\x05\x06`，否则 `Invalid zip file`。Calibre 确实能转这类文件（§2.1/§2.2 实测），但**删掉这道判据并不能放行**——因为它后面还有一道 JSZip 深校验（同文件 `:309`），而 JSZip 与 Calibre 不同，必须依赖中央目录。

#### 3.1 红队回执（P2-C 方案审查 · L2 + 双实现独立复核）

**断言与裁定**

| # | 断言（原方案赖以成立的前提） | 攻击方式 | 裁定 |
|---|---|---|---|
| A1 | 删掉 EOCD 判据即可让 Calibre 可修复文件通过 | jest 探针（`validateInputFile` + `JSZip.loadAsync` 同批 5 个用例）+ Python `zipfile` 独立复核 | **推翻** |
| A2 | 误杀发生在用户正常转换时 | 读 `route.ts:69-123` 调用顺序 | **推翻** |
| A3 | 异步队列路径也会误杀（`queue.ts:320` 先校验后调 Calibre） | 查引用：全仓无 `.add()` 调用、无模块 import 其成员 | **推翻（死代码，不构成现网风险）** |
| A4 | 放行后失败仍会是灰卡（用户输入类） | `error-handler.ts:52-73` + `alerts.ts:262-276` 映射；CC 各错误串分流 | **未确证（UNKNOWN）** |
| A5 | 该改动有真实收益 | 收益需「后端不可用 × 文件可修 × CC 也能修」三重交集 | **推翻** |
| A6 | 现文案给了「错误的可操作建议」 | 现 message = "it may be corrupted… Try re-downloading" | **部分推翻（我此前夸大）** |

**实测证据（A1，决定性）**

| 用例 | `validateInputFile` | `JSZip.loadAsync` | Python `zipfile` |
|---|---|---|---|
| A 完整 EPUB（对照，71,866 B） | PASS | loaded OK | OK, 4 members |
| B 尾截 50 B | `Invalid zip file` | **throw** `can't find end of central directory` | **BadZipFile** |
| C 尾截 200 B | `Invalid zip file` | **throw** 同上 | **BadZipFile** |
| D 尾截 3000 B | `Invalid zip file` | **throw** 同上 | **BadZipFile** |
| E 流式 ZIP（从无中央目录） | `Invalid zip file` | **throw** 同上 | **BadZipFile** |

⇒ 删掉第 2 道判据后，第 3 道（local header 扫 container/opf，这些文件通常能过）之后仍会撞上第 4 道 JSZip 深校验，错误串从 `Invalid zip file` 变成 `corrupt epub: (zip load failed: Corrupted zip: can't find end of central directory)`。**两者同映射 `CORRUPT_INPUT`、同一句用户文案、同样 `retryable:false`（`error-handler.ts:55/57 → 116`）**——用户可见结果完全相同，改动是纯 no-op。

**A2 证据（真正的误杀窗口有多窄）**：`route.ts:100-123` 先 `delegateToBackend`，本地 `convertAndStream`（内含 `validateInputFile`）只在委托失败后执行。后端正常时，可修复文件直接由 Calibre 成功返回，本地校验根本不跑。窗口仅剩「后端瞬时失败/熔断/未配置」。

**结构性矛盾（这是否决的核心理由）**：豁免只在「后端不可用或该次失败」时有意义，但豁免的价值又依赖「后端能修这个文件」。后端失败若源于文件本身（如本次 Job f547b469），再给它一次机会没有意义；若源于瞬时故障，被放行的文件会落到 CloudConvert——**这正是 §3.5 深校验在 10-19 事故后要堵的「白烧一个 CC job + 270s 轮询」**。收益与既有设计目标直接冲突。

**A4 为什么是 UNKNOWN**：放行后由 CC 报错。`'input task has failed'` 映射 `CORRUPT_INPUT`（灰卡），但 `'Error converting book'` 映射 `CONVERSION_FAILED`（🔴 红卡 + "investigate now"）。究竟命中哪条取决于 CC 返回串，而 CC 凭据已耗尽（402）无法实测 ⇒ 存在「用户输入问题被升级成系统故障告警」的可能，未确证。

#### 3.2 建议（替代方案）

- **不实施原方案**。它改不动任何用户可见结果，却要动一条被 10-19 事故验证过的防线。
- **日志细化已实施（2026-11-04）**：`conversion.ts:262` 改为
  `Invalid zip file (no central directory; N bytes)`。
  ⚠️ 措辞修正：早先称「零控制流变更」不准确——`'Invalid zip file'` 实际被三处依赖
  （`error-handler.ts:57` 映射键、`conversion.ts:426` 与 `queue.ts:263` 的 `includes` 守卫）。
  实测确认**子串匹配**特性：只要新串**以 `Invalid zip file` 开头当前缀**，三者全部继续命中，
  分级（CORRUPT_INPUT 灰卡）与放行判定不变。故这是「前缀保留的子串安全变更」，非纯日志。
  死代码 `queue.ts:202` 未动（改动即无效 churn）。
- **契约锁**：`tests/reverse-verify-alerts-redteam.test.ts` 新增用例，断言新串仍灰卡 user，
  防未来有人删前缀导致静默错分为系统故障。
- 真正的改进方向不在判据，而在**减少「后端瞬时失败」这个窗口本身**（熔断恢复、重试），
  那才是唯一能让这类文件多一次机会的地方。该任务风险更大、需单独设计与红队，**不捆绑在
  本次告警清理内**。

---

## 4. 红队回执（L2，实施前）

| # | 断言 | 攻击（反例） | 裁定 |
|---|---|---|---|
| A1 | 本次是用户文件 ZIP 结构不完整，非系统故障 | 本地 EOCD 扫描是**独立于 Calibre** 的字节级判据，它说文件里没有 EOCD；Calibre 同时失败；同客户端其它 4 个文件成功 | **通过**（表述降级为「文件不可用」） |
| A2 | Calibre 因 `BadZipfile` 失败 | 真实 stderr 被截断，可能是图片/字体解码失败、内存等其它原因；只能用耗时形态（2.5–2.7 s 实测 vs 3.693 s 生产）做类比 | **未确证**（高概率，标 UNKNOWN） |
| A3 | 91,395 B 是用户原始文件大小，非传输截断 | 复审补证：`ToolPageClient.tsx:228` 只在 `file.size > MAX_FILE_SIZE_BYTES`（4 MB）时才走 R2 直传 ⇒ 89 KB 必走 multipart，与 R2 对象截断无关；multipart 解析对不完整请求体 fail-fast（不会静默产出短 File） | **通过**（代码可证；仍未做"故意发不完整 body"的注入实测） |
| A4 | 告警分级 user（灰卡）正确 | CORRUPT_INPUT 在 `USER_SIDE_ERROR_CODES`，告警卡实测显示「User input error (expected)」 | **通过** |
| A5 | 本地 EOCD 判据会误杀 Calibre 可转的文件 | 本地探针：完整 epub 通过 / 截 50 B 报 `Invalid zip file`；后端实测同文件截 50 B **Calibre 成功**；**复审补测**：流式 ZIP（无中央目录）Calibre 亦成功 516 ms | **通过**（成因类别级，非边界个例） |
| A6 | 后端 200 字符截断使根因不可见 | 代码逐行可证；日志实际输出只剩 dpkg warning + `Traceback (most recent call last):` 半行 | **通过** |

**残余**：
- 该文件的 Calibre 原始异常永久不可考（后端已删输入，Vercel Hobby 日志 1 h 窗口亦过期）。
- 无法判定本次走 multipart 还是 R2 直传路径（nginx 未记 request_length）。
- A5 的误杀窗口已从「尾部截断」扩到「流式 ZIP 无中央目录」（§2.2 实测），但**未穷举**：EPUB 加密容器、ZIP64、data-descriptor 变体均未测，窗口上界仍属 UNKNOWN。

### 4.1 本次红队的性质（不得含糊）

- **级别 L2，同源自审**：断言由我提出、攻击由我做，**没有第二模型 / 独立脚本 / `mode=ro` 独立通道复核**。因此它不是 L3，不能当"独立验证"引用。
- **首轮有两处是"讲道理"过关，复审才补测**：
  1. A3（91395 是否为原始大小）——首轮纯推理，复审时用 `ToolPageClient.tsx:228` 的 4 MB 分支把它变成代码可证；
  2. A5 的成因范围——首轮只测尾部截断，就写成「误杀窗口小」；复审补测流式 ZIP 后，结论从"边界个例"升级为"整个成因类别"，**P2-C 的优先级也随之从「暂缓」改为「提前」**。
- **⚠️ 上一条的"提前"于 2026-11-03 23:40 被再次推翻**：第二道判据之后还有 JSZip 深校验，同样拒绝无中央目录文件（§3.1 实测 + Python 独立复核），所以「提前修」这个结论是错的——不是优先级问题，是**原方案不成立**。教训：**改了优先级之前，先确认方案本身可执行**；「引擎能做」不等于「删掉本地判据就能交给引擎」。
- **一次结论扩大化的自我纠正**：首轮把 P2-C 的影响面写成"量小但提示错误"，实际必须按路径区分（后端正常时零影响，回退链才受害，纯 JS 路径判死正确），已在 §3 P2-C 补表。
- **仍为 UNKNOWN 的**：A2（Calibre 的具体异常类型）。原始 stderr 已随后端 `finally` 删除输入而永久丢失，只能靠耗时形态类比，不构成直接观测。

---

## 5. 建议（按性价比排序，均需批准后才动手）

| 优先级 | 动作 | 成本 | 收益 |
|---|---|---|---|
| 1 | P1-A 后端错误提取：剥离 dpkg 噪声 + 保留异常签名行 + 完整 stderr 落日志 | ~15 行 | 从此每次后端失败都能直接看到 `BadZipfile`/`DRM`/具体异常 |
| 2 | P1-B 透传后端错误体到告警卡 | ~10 行 | 告警卡自带真因，不用再 SSH 查日志 |
| 3 | 观察 7 天 `CORRUPT_INPUT` 频次 | 0 | 验证本次是否为孤立事件（原「决定 P2-C 要不要改」的作用已随 P2-C 否决而消失） |
| 4 | ~~P2-C 分层放宽 EOCD 判据~~ | — | **已否决**（§3.1 红队：删判据是 no-op，JSZip 同判；收益与 §3.5 目标冲突） |

**本次告警本身：无需处置。** 用户侧文件不可转换，`CORRUPT_INPUT` 提示「重新下载或重新导出」是对的。

---

## 6. 实施记录（2026-11-03 23:12–23:25，P1-A + P1-B）

### 6.1 改动清单

| # | 文件 | 改动 | 状态 |
|---|---|---|---|
| 1 | `conversion-backend/app/calibre.js` | 新增导出 `pickErrorDetail()`：过滤 dpkg 等噪声前缀 → **优先取最后一条「异常类型: 消息」行** → 否则退化为含签名的最后 3 行 → 200 字符预算。DRM 判定从「前 200 字符」改为扫全文 stderr。新增返回 `rawStderr`（截 6000） | ✅ 已部署 |
| 2 | `conversion-backend/app/index.js` | `FAIL` 后追加 `STDERR` 行：完整 stderr 压平成单行、截 1500 字符 | ✅ 已部署 |
| 3 | `src/lib/conversion-backend-client.ts` | 非 200 分支新增 `readBackendDetail(res)`，把 `code: error` 拼进 fallback reason；解析失败静默退化为纯 status；硬上限 180 字符（`alerts.ts` 不截断） | ✅ 已改，未部署 |
| 4 | `src/lib/conversion-backend-client.test.ts` | 更新 1 条既有断言（`backend HTTP 502` → `backend HTTP 502 — boom`，**预期行为变更**）＋新增 5 条反向约束 | ✅ 29/29 绿 |

### 6.2 后端端到端验证（HK，重启后实测）

构造"完整 epub 截掉 3000 B"作为失败样本，直连 `127.0.0.1:3001` 打 `/api/convert-internal`：

| 项 | 旧实现 | 新实现 |
|---|---|---|
| 500 响应体 `error` | `Conversion failed: dpkg: warning: failed to open configuration file '/home/bookconv-backend/.dpkg.cfg' …` （真因零可见） | `Conversion failed: ValueError: Invalid ZIP file, local header is damaged`（**53 字符，直接可操作**） |
| conversion.log | 只有 200 字符摘要 | `FAIL …` + 新增 `STDERR` 行，含完整调用栈（`BadZipfile: File is not a zip file` → `localunzip.extractall` → `ValueError`） |
| 正常路径对照 | — | 完整 epub → **HTTP 200 / 66,179 B**，未误伤 |

**顺带解开 A2 的形态**：真实 stderr 是链式异常——先 `BadZipfile: File is not a zip file`，Calibre 转入 `localunzip.extractall` 修复，local header 也不完整时再抛 `ValueError: Invalid ZIP file, local header is damaged`。这解释了 §2.1 中「截 50–200 B 能成功、截 ≥1000 B 失败」的分界：前者只丢中央目录（可重建），后者 local header 已被砍断（无法修复）。

### 6.3 全量验证

- `npx tsc --noEmit` → **exit 0**
- `npx jest src/lib/conversion-backend-client.test.ts` → **29/29 通过**（原 24 + 新增 5）
- `npm test` → **44 套件通过 / 1 失败**；失败件为 `tests/unit/board.test.ts`（`data/seo-geo-board.json` 的 `M12-1: bad status "in_progress"`），**与本次改动无交集**（该用例不 import 本次任何文件，`git status` 亦显示相关文件未改）——属既有失败，未在本任务范围内修复。

### 6.4 部署与回滚

| 组件 | 状态 | 回滚方式 |
|---|---|---|
| HK 后端 | ✅ 已重启（`index.js` md5 `52aa4647…`、`calibre.js` md5 `da500163…`） | `cp app/calibre.js.bak-20261103-2318 app/calibre.js && cp app/index.js.bak-20261103-2320 app/index.js && systemctl restart bookconv-conversion` |
| Vercel 前端 | ✅ 已 push（`b555a59..b0b5318`）+ 生产实测确认新代码在跑（见 §6.5） | `git revert b0b5318` 后 push，或 Vercel 面板 rollback 到上一部署 |

**残留（必须说清）**：P1-A 只在后端日志与 500 响应体上生效；**告警卡要看到真因，必须等 P1-B 部署**。此句原为「待部署」状态，已于 §6.5 解除。

### 6.5 生产端到端验证（2026-11-03 23:31，部署后真机实测）

**为什么要做**：`vercel-deploy.yml` 是 `continue-on-error` 的 API 触发，CI 绿 ≠ Vercel 构建成功；且本项目没有任何客户端可见探针能判断新部署是否上线（`/admin/board` 不服务端渲染任务 ID，先拿既有 `M12-2` 做对照已证伪该探针）。因此只能靠**生产行为**验证。

**方法**：本地造一个 17,462 B 的 EPUB（`PK` magic 正常、EOCD 缺失 = 尾部截断 3,000 B，属 Calibre 不可修复类别），以 `deploy-verify-20261103.epub` 命名提交 `POST https://www.bookconv.com/api/convert`（`epub → azw3`）。

**结果（前后对照，取自飞书群「窦红建的智能体团队」真实送达消息）**：

| | 22:48 用户原始告警（旧代码） | 23:31 本次合成告警（新代码） |
|---|---|---|
| 后端行 | `fell back — backend HTTP 500` | `fell back — backend HTTP 500 — CONVERSION_FAILED: Conversion failed: ValueError: Invalid ZIP file, local header is damaged` |
| 结论 | 真因零可见 | 真因完整可见 |

- 请求侧：`HTTP=500` `{"code":"CORRUPT_INPUT"}`，耗时 7.6 s（后端失败 + CC 回退失败），`Input size: 17462 bytes` 与上传字节一致。
- **这一张卡片同时证明了三件事**：①P1-A 后端错误提取生效（`ValueError` 而非 `dpkg:` 前缀）；②P1-B 前端透传生效（真因穿到告警卡）；③Vercel 新构建已上线（旧代码不可能产出该字符串）。
- ⚠️ **统计口径污染**：Job `e0804948-7848-42eb-8966-9db5c0016807`（23:31，输入哈希 `b13d9afcc954`）为**合成探针**，不是真实用户事故。做 `conversion_failed` 频次/成功率统计时必须剔除，否则会高估 11-03 失败量 1 次。

