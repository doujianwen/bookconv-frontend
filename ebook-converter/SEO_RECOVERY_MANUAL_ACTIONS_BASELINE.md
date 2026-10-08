# GSC Manual Actions 基线（SEO_RECOVERY_MANUAL_ACTIONS_BASELINE）

> 阶段：**DATA ACQUISITION** · 只读取，未修改任何生产文件
> 执行时间：2026-10-07 18:12–18:16
> 更新：2026-10-07 人工核验完成

## 一、结果表

| Field | Result | Evidence | Status |
|---|---|---|---|
| Manual Action | **未发现任何人工处置措施** | GSC 后台截图 2026-10-07（「安全性与人工处置措施」→「人工处置措施」标签）| **RESOLVED（无处置）** |
| Security Issue | **未发现安全问题** | GSC 后台截图 2026-10-07（同上页面「安全问题」标签）| **RESOLVED（无问题）** |
| Spam-related action | 未列出 | 同上 | **RESOLVED（无处置）** |

## 二、`U_MANUAL_ACTION` 的确切状态

> ### `U_MANUAL_ACTION = RESOLVED（无处置）`

**已人工核实：GSC 后台显示「未检测到任何问题」。**

### 缺什么数据

| # | 缺失项 | 说明 |
|---|---|
| 1 | Manual Actions 列表 | Google 是否对站点或具体 URL 施加人工处置 |
| 2 | Security Issues 列表 | 是否存在安全问题标记 |
| 3 | 处置对应 URL 与原因文本 | 若有处置，需知道范围 |

### 数据应该从 GSC 哪个位置获取

| # | 位置 | 路径 | 看到什么 |
|---|---|---|
| 1 | Security & Manual Actions | GSC → 左菜单「安全性与人工处置措施」| 若为空则显示「未发现任何人工处置措施」|
| 2 | 同上页的「安全问题」标签 | 同上 | 若为空则显示「未发现安全问题」|
| 3 | 网址检查（单条）| GSC → 网址检查 → 输入 URL | 若该 URL 被处置，此处会显示具体原因 |

⚠️ **这些页面只能登录后台查看，没有对应的公开 API 端点**（本项目已 grep 确认：`scripts/*.mjs` 只调用 `urlInspection/index:inspect`）。自动化不可行，需人工操作。

### 获取后如何判定

| 后台显示 | 判定 | 后续动作 |
|---|---|---|
| 「未发现任何人工处置措施」+「未发现安全问题」| `U_MANUAL_ACTION = RESOLVED（无处置）` ✅ | H5 假设可从「penalty 恢复」改写为「外链建设时机」问题 |
| 列出具体处置（如「垃圾内容」）| `U_MANUAL_ACTION = RESOLVED（存在处置）` | **暂停外链建设**，先处理处置 |
| 列出安全问题 | 同上，且优先修复安全问题 |
| 无法访问后台 | 保持 `UNKNOWN` | 不得推断 |

## 三、🔴 措辞纪律

| ❌ 禁止写 | ✅ 本文件采用 |
|---|---|
| `No official evidence of manual action`（若未实际查看后台）| `U_MANUAL_ACTION = UNKNOWN`（未取得数据）|
| `Google penalized the site` | **禁止**（无官方证据）|
| 「没有 penalty」| 同样禁止——未查 ≠ 没有 |

**✅ 本轮已核实：2026-10-07 人工登录 GSC →「安全性与人工处置措施」→ 截图确认「未检测到任何问题」。U_MANUAL_ACTION 已从 UNKNOWN 降为 RESOLVED（无处置）。**

## 四、可以确定的事实（FACT）

| # | 事实 | 证据 |
|---|---|
| 1 | GSC 公开 API 无 manual actions 端点 | 已 grep `scripts/*.mjs`，仅 1 个端点 |
| 2 | 项目凭据有 webmasters scope 但该 scope 不含 manual actions | `scripts/check-indexing.mjs:29` |
| 3 | 现有 45 个 URL Inspection 结果中**没有任何 manual action 字段** | GSC URL Inspection API v1（`searchconsole.googleapis.com/v1/urlInspection/index:inspect`） 返回字段实测 |
| 4 | **2026-10-07 人工截图确认** | GSC 后台「人工处置措施」+「安全问题」均显示「未检测到任何问题」|

⚠️ **第 3 条不构成「无处置」的证据** —— URL Inspection API 的响应体根本不含此字段，返回空是接口设计如此。

## 五、解除条件

| 步骤 | 动作 | 判定 |
|---|---|---|
| ~~1~~ | ~~人工登录 GSC → 安全性与人工处置措施~~ | ✅ **已完成（2026-10-07）** |
| ~~2~~ | ~~截图或导出该页~~ | ✅ **已截图** |
| ~~3~~ | ~~更新本文件 Result 字段~~ | ✅ **已更新：U_MANUAL_ACTION = RESOLVED（无处置）** |
