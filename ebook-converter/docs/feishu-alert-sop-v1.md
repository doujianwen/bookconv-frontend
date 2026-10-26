# 飞书告警 SOP（bookconv GA4 每日巡检）V1

> **版本** v1.0 | 2026-10-10 | workflow 缺口 6.3 落地产物
> **代码为唯一真相**：本文档描述 `scripts/ga-inspection.mjs`（261 行）当前行为；改脚本必同步改本文档。

---

## 一、告警链路（四步流水线）

| 步骤 | 脚本 | 产物 | 说明 |
|---|---|---|---|
| 1 | `scripts/fetch-ga4-daily.mjs --write` | `_wb_tmp/ga4-live.json` | GA4 Data API 实时数据；403 时自动回退最新 `数据分析/GA4日报-*.md` |
| 2 | `scripts/syntax-sweep.mjs` | `_wb_tmp/ga-syntax.json` | 全量语法扫描（316 文件基线） |
| 3 | `scripts/geo-audit-guide.mjs --no-online` | `_wb_tmp/ga-geo.json` | guide 页 ≥400 词审计（基线 9，24/24 PASS） |
| 4 | `scripts/ga-inspection.mjs` | stdout 简报 + 飞书消息 | 合并前三步结果组装发送；无内置飞书通知的步骤由自动化 prompt 处理 |

**调用方**：WorkBuddy 自动化（GA4 每日巡检，自动化 id `5fc7733d-8446-45e6-935d-ce11804eb34d`；prompt 存于用户级配置，不在项目内）。执行历史见 `.workbuddy/memory/automations/`。

## 二、告警阈值（ga-inspection.mjs L102-120）

```
异常 abnormal = 失败数 > 完成数  或  成功率(完成/上传) < 50%
不可判定 = 无上传数据 / 数值缺失（降级 UNKNOWN，不报 FAIL —— 门禁纪律）
```

- 异常时消息带 ⚠️ 与原因（含「疑似 CloudConvert 免费额度耗尽」提示行）
- 进阶卫生三项各自独立：✅ / ❌ / ⚠️ 未运行（`ok === null`）

## 三、消息硬约束

- 🔴 **消息必须含 `[bookconv]` 关键词**，否则被飞书机器人拦截（`code 19024`）。修改 `buildReport()` 时不得动 L176 的 `📊 [bookconv]` 前缀。
- 消息类型 `text`（`msg_type: 'text'`）。

## 四、发送行为（2026-10-10 retry 版，L214 起）

### 4.1 凭据读取顺序（getWebhook）
1. env `FEISHU_WEBHOOK_URL`
2. env `FEISHU_WEBHOOK`（ai-audit.js 惯例，兼容不重构）
3. 项目根 `.feishu-webhook` 文件（**已在 `.gitignore:140`，禁止入库**）
均未配置 → 打印跳过，不报错。

### 4.2 成功判据（结构化）
HTTP 响应 JSON 解析 `code` 字段：`code === 0` = 成功；`code !== 0` = 确定性失败（**不重试**，如 19024 关键词拦截、19001 token 无效）。
> 旧版用 `includes('"code":0')` 字符串匹配，已废弃（脆弱：错误体可能同时含子串）。

### 4.3 重试策略（3 次退避 2s/4s/8s）
仅对**可重试类**错误：网络错误 / 超时（单次 5s）/ HTTP 5xx / 200 但响应体非 JSON。
最终失败打印权威结论行：`❌ 最终结论：飞书通知未送达…请勿误判为发送成功`。

### 4.4 退出码约定
**恒 exit 0，结论以 stdout 为准**。取舍：调用方（WorkBuddy 自动化）靠 stdout 判断成败、不依赖退出码；引入非零退出码有自动化 prompt 语义风险（prompt 在用户级配置，无法静态核验）。自动化消费时认这三行之一：`✅ 飞书通知已送达` / `⚠️ …跳过发送` / `❌ 最终结论…未送达`。

## 五、凭据恢复步骤（2026-10-10 已恢复）

**当前凭据**：`.feishu-webhook` 已写回（来源：自动化记忆 `automations/5fc7733d-…/memory.md`），2026-10-10 实测活性通过（真实巡检送达，code=0）。

**若失效，按此恢复**：
1. 飞书群 → 群设置 → 群机器人 → 查看 bookconv 机器人的 Webhook 地址（或新建）
2. 写入项目根 `.feishu-webhook`（纯文本一行），**勿入库**
3. 验证：`FEISHU_WEBHOOK_URL=<url> node scripts/ga-inspection.mjs` 看 `✅ 飞书通知已送达`
4. 反向验证（改代码后必做）：换无效 token 应第 1 次即停（确定性）；换无效域名应重试 3 次

**🔴 泄露史与待办**：
- 旧 token `422e94ef…` / `a7a8f44f…` 曾随 `docs/retro-2026-10-04.html` 推送泄露（该文件已于 2026-10-26 清理时 `git rm` 移出工作区，但 **git 历史仍保留**，彻底清除需改写历史），须在飞书后台重置；现用 `09ba32e1…` token 亦曾在自动化 memory 中明文记录——若确认曾被公开暴露，一并重置
- 待办：评估 retro html 脱敏或移出仓库（append-only 修复须走 changelog，用户决策）

## 六、变更记录

| 日期 | 变更 |
|---|---|
| 2026-10-10 | retry 版上线：结构化 code 判定（替代字符串 includes）、3 次退避重试（仅可重试类错误）、5s 超时、FEISHU_WEBHOOK 兼容、`.feishu-webhook` 恢复；三路径实测（真实送达 / 19001 确定性 / 坏域名 3 次重试）全过 |
