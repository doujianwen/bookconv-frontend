# 事故分析：CloudConvert 402 积分耗尽（2026-10-20 上午）

> 元信息
> - 告警 1：Job `1601068e-2e98-4a25-8f49-81293f27ce11`，`epub→azw3`，engine=calibre
> - 告警 2：Job `0afc2153-cabc-4cbe-bf4e-737f5f24c292`，`pdf→epub`，engine=auto
> - 时间：2026-10-20 03:04:20Z / 03:33:00Z（UTC），即北京时间 11:04 / 11:33（上午）
> - 错误：`CloudConvert client error 402: Your account has run out of conversion credits`
> - 分析日期：2026-10-20

---

## 0. 结论先行（TL;DR）

1. **根因：CloudConvert API 账户转换积分（conversion credits）耗尽。** 两条告警均返回 HTTP 402 + 原始错误文案，与代码 `cloudconvert.ts:106` 的 402 短路分支完全吻合。
2. **非偶发、非后端崩溃。** 时间间隔 29 分钟 > TTL 5 分钟、引擎不同（calibre/auto）→ 两次独立 cold start，各自直连 CloudConvert API 获 402，证明是账户侧真实限额耗尽，不是瞬时抖动。
3. **当前系统行为符合设计。** 短路缓存（quotaExhaustedUntil）在单实例内生效（减少轮询浪费），告警通道（alerts.ts）正确发送并送达飞书，节流签名因引擎标签不同而各发一次。
4. **修复优先级：充值 > 扩展纯 JS 路径 > 监控加强。** 充值是最短路径；纯 JS 路径已覆盖部分格式（见 §4），但 azw3/pdf 类格式无替代方案。

---

## 1. 根因判定

### 1.1 证据链

| 证据 | 来源 | 解读 |
|---|---|---|
| 错误文案逐字匹配 | 告警原文 `CloudConvert client error 402: Your account has run out of conversion credits` | `cloudconvert.ts:109` 的 402 分支原样上抛，无歧义 |
| `after 1 attempt(s)` | 告警原文 | 402 在 `ccRequest` 第一拍即抛出（L106-109），不进入重试循环（L83-136），trail.length=1 符合设计 |
| 两告警引擎不同 | `engine=calibre` vs `engine=auto` | pdf 不在 `CALIBRE_INPUT_FORMATS` 白名单（L44-64），自动选 auto；epub 在白名单，选 calibre。两次请求走不同代码路径，均命中 402 |
| 时间间隔 29 分钟 > TTL 5 分钟 | 北京时间 11:04 vs 11:33 | 若为同一实例缓存失效误判，间隔应 <5min；29min 间隔 + 引擎差异 → 两次独立 cold start，各自直连 API 均获 402 |
| `quotaExhaustedUntil` 进程级语义 | `cloudconvert.ts:26` `let quotaExhaustedUntil = 0;` | Serverless cold start 重置，新实例 quotaExhaustedUntil=0，不命中短路，直接发 API 请求 |

### 1.2 排除其他假设

| 候选假设 | 排除理由 |
|---|---|
| 偶发 402（网络抖动/限流） | 29 分钟内两次独立实例均命中 402，概率极低；偶发应为瞬态，不会持续 |
| 后端崩溃（Serverless 实例异常） | 告警送达飞书 = 代码路径正常执行到 notifyConversionFailure；崩溃场景应无告警或告警内容不同（backend-unavailable） |
| 短路缓存误触发 | 缓存 TTL=5min，29min 间隔已过期；且两次为不同实例，缓存不共享 |
| 与 10-01 事故同类 | 10-01 事故为「中文文件名→Header 编码崩溃→全站 500」，与本次 402 成因无关 |

### 1.3 判定

**置信度：高。根因 = CloudConvert 账户 conversion credits 耗尽。**

---

## 2. 影响面

### 2.1 受影响转换对

基于 `isCalibreInput()` 白名单（L44-64）与当前纯 JS 路径覆盖范围：

| 转换对 | 路径 | 402 影响 |
|---|---|---|
| `epub→azw3`（本案） | CloudConvert + calibre 引擎 | **失败**，无纯 JS 替代 |
| `pdf→epub`（本案） | CloudConvert + auto 引擎 | **失败**，无纯 JS 替代 |
| `epub→pdf/mobi/docx` | CloudConvert（calibre 引擎不支持 docx 输出） | **失败** |
| `mobi/azw3→epub` | 纯 JS 路径（`fc52fd5` 新增） | **免疫 402** |
| `epub→txt/rtf/docx/fb2/zip` | 纯 JS 路径 | **免疫 402** |
| `txt→epub/html→txt/docx→txt` | 纯 JS 路径 | **免疫 402** |

### 2.2 失败比例估算

- 无法估算精确比例（无当日 serverless 日志聚合）
- 已知信号：纯 JS 路径覆盖约 10 个转换对（`conversion.ts:890-959`），其余均走 CloudConvert
- 用户可见影响：走 CloudConvert 的格式对 100% 失败，响应 ~270s 后返回 `CONVERSION_QUOTA_EXCEEDED`

### 2.3 与 10-01 事故对比

| 维度 | 10-01 事故 | 10-20 本次 |
|---|---|---|
| 根因 | 中文文件名→`Content-Disposition` 编码崩溃 | CloudConvert 积分耗尽 |
| 错误码 | `INTERNAL_ERROR`（Header TypeError） | `CONVERSION_QUOTA_EXCEEDED` |
| 影响面 | 全站转换 100% 失败 | CloudConvert 路径 100% 失败，纯 JS 路径正常 |
| 发现方式 | T+1 GA4 日报 | 实时飞书告警 |
| 修复 | 文件名 Latin1 过滤 | 充值 + 扩展纯 JS 路径 |

---

## 3. 当前系统行为正确性评估

### 3.1 短路缓存（quotaExhaustedUntil）✅ 按设计工作

- 单实例内首次 402 → 设置 quotaExhaustedUntil = now + 5min
- 后续同实例请求 → 直接抛 `account out of conversion credits (cached)`，不创建 CC job，省 ~270s 轮询预算
- Cold start → quotaExhaustedUntil 重置为 0，新实例正常发 API
- **本次实测印证**：两次告警间隔 29min > 5min TTL，各自独立实例均直连 API 获 402，符合预期

### 3.2 告警发送 ✅ 按设计工作

- `convert-handler.ts:79` 捕获异常后调用 `notifyConversionFailure`
- `alerts.ts:138` 节流签名 = `kind + ':' + error[:80]`
- 两次告警签名不同（`engine=calibre` vs `engine=auto` 在 error message 前 80 字符内）→ 各发一次，未被节流合并
- 飞书 webhook 实际送达（用户已收到 2 条告警）

### 3.3 静默假成功历史 ✅ 已修复

- 10-02 事故：飞书机器人关键词校验导致 code=19024 拒收，旧实现只发不读响应体
- 当前实现 `alerts.ts:112-119` 已解析飞书响应体，非 0 记 error 并返回 false
- **本次验证**：2 条告警均送达飞书 → postFeishuCard 返回 true，通道健康

### 3.4 错误码映射 ✅ 按设计工作

- `error-handler.ts:52` `'cloudconvert client error 402': 'CONVERSION_QUOTA_EXCEEDED'`
- 用户端收到 `code=CONVERSION_QUOTA_EXCEEDED` + 友好文案（L84）
- 前端 `BatchUpload.tsx:401` 识别 `CONVERSION_QUOTA_EXCEEDED` 后设置 `quotaExhausted=true`，停止后续批量请求

---

## 4. 修复方案选项（按 ROI 排序）

### 选项 A：充值 CloudConvert（推荐，P0）

- **成本**：Package $17/1000 credits（DEPLOYMENT.md:338），不过期
- **收益**：立即恢复所有 CloudConvert 格式对的转换能力
- **风险**：账单周期结束后可能再次耗尽；需监控 usage
- **实施**：登录 CloudConvert dashboard 充值，无需代码改动
- **预计时效**：充值后 5 分钟内自愈（quotaExhaustedUntil TTL 到期）

### 选项 B：扩展纯 JS 路径（中期，P1）

- **现状**：已覆盖 10 个转换对（`conversion.ts:890-959`），主要面向文本派生格式
- **缺口**：azw3/pdf/mobi 等 Calibre 专属格式无替代
- **可行方向**：
  - `epub→azw3`：可尝试纯 JS 合成 AZW3（格式开放，但需实现 Kindle 专属压缩）
  - `pdf→epub`：PDF 解析复杂，建议维持 CC 路径或引导用户用纯 JS 先转 txt
- **成本**：开发工时中等，测试覆盖要求高
- **收益**：长期免疫 402，降低对第三方依赖

### 选项 C：监控加强（辅助，P2）

- **现状**：飞书告警已实时推送，但无预消耗预警
- **可行方向**：
  - CloudConvert API 提供额度查询端点（需查文档确认）
  - 每日巡检脚本增加 `GET /v2/account` 检查剩余 credits
  - 低于阈值时提前告警（如 <10% 发飞书）
- **成本**：低
- **收益**：避免突发性 402，给用户缓冲时间

### 选项 D：切换 CloudConvert 供应商（不推荐）

- **成本**：高（格式支持、SLA、迁移测试）
- **收益**：分散风险
- **当前不值得**：BookConv 流量低，单供应商 402 可用充值解决

---

## 5. 残留风险与验收判据

### 5.1 残留风险

| 风险 | 概率 | 影响 | 缓解措施 |
|---|---|---|---|
| 充值后账单周期末再次耗尽 | 中（取决于用量） | 转换失败 | 选项 C 预消耗预警 |
| 纯 JS 路径覆盖不足 | 已知 | azw3/pdf 类格式仍失败 | 选项 B 中期规划 |
| 短路缓存 TTL 与充值恢复时间不匹配 | 低 | 充值后 5min 内仍失败 | 可接受（5min 窗口短） |
| 飞书告警通道失效 | 低（已修复 10-02 问题） | 延迟发现 | 定期健康检查 |

### 5.2 验收判据

**充值后（即时验收）：**
- [ ] `epub→azw3` 测试请求成功（HTTP 200 + 有效 AZW3 文件）
- [ ] `pdf→epub` 测试请求成功（HTTP 200 + 有效 EPUB 文件）
- [ ] 飞书不再收到 402 告警

**短路缓存验证（代码层）：**
- [ ] 模拟 402 后，同实例后续请求快速失败（<1s），不创建 CC job
- [ ] Cold start 后 quotaExhaustedUntil 重置，新请求正常发 API

**监控验证：**
- [ ] GA4 `conversion_failed` 事件在 402 场景下 error_code=`CONVERSION_QUOTA_EXCEEDED`
- [ ] 飞书告警在 402 场景下送达（手动触发测试）

**长期（选项 B/C 落地后）：**
- [ ] 纯 JS 路径覆盖的转换对不再走 CloudConvert
- [ ] 预消耗预警在 credits <10% 时触发飞书告警

---

## 6. 参考

- `src/lib/cloudconvert.ts`：402 短路分支（L106-109）、quotaExhaustedUntil 缓存（L26-33）、CALIBRE_INPUT_FORMATS 白名单（L44-64）
- `src/lib/alerts.ts`：飞书告警发送 + 节流 + 响应体校验（L91-128）
- `src/lib/error-handler.ts`：错误码映射 `cloudconvert client error 402` → `CONVERSION_QUOTA_EXCEEDED`（L52）
- `src/lib/conversion.ts:890-959`：纯 JS 路径覆盖清单
- `docs/incident-2026-10-19-epub-pdf-input-task-failed.md`：上次 CloudConvert 事故（import 失败分类器盲区，已修复 `d33455a`）
- `DEPLOYMENT.md:338`：CloudConvert 定价与额度说明

---

*报告生成：2026-10-20 诊断会话（只诊断不修复）*
