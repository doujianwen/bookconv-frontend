# C3 · 外链真实提交与核验 ＋ C4 · GEO 采样包

- run_id：`BC-GROWTH-20261117`｜时点 2026-11-17 07:35–08:25
- 本轮结果：**1 条真实提交成功（The Tool Directory，SUBMITTED 待审核）＋ 1 条既有 Live 核验（awz.cc）＋ 1 条未证实（tftd）＋ 1 条 BLOCKED（sousuotu）**

## 一、C3-1 本轮真实提交：The Tool Directory ✅

**目标确认**：`https://thetooldirectory.com/submit-a-tool/`（来自 Notion 90 天计划 B4 段与 11-16 执行记录，2026-11-16 状态为 `DRAFTED / BLOCKED_NETWORK`）。
**注意**：此前我曾把 `thefreetoolsdirectory.com` 误当成 "The Tool Directory"，两者是**不同站点**；本轮已纠正（见 `10_红队与独立验收.md` 红队 C1）。

### 逐项前置检查（任务 C3 要求依次检查）

| 检查项 | 实测 | 结论 |
|---|---|---|
| 网络通道 | `GET /submit-a-tool/` → **HTTP 200，34,123 字节**（11-16 的 ECONNRESET / SSL exit 35 已消失） | ✅ 通道正常 |
| 提交页面 | `<title>Submit a Tool - The Tool Directory</title>`，单表单 `method="post"` | ✅ 存在 |
| nonce / 会话 | 隐藏字段 `ttd_submit_nonce=c176d47a32` + `ttd_submit_tool=1` + `_wp_http_referer=/submit-a-tool/`；先 GET 取 cookie 再 POST | ✅ 取得 |
| 表单字段 | required：`tool_name` / `tool_url` / `tool_tagline` / `submitter_email` / `tool_description`；另有 platforms/audiences/use_cases/alternatives/logo/screenshots/pricing/category | ✅ 全部按真实信息填写 |
| 官方邮箱 | 站内首页命中 `hello@bookconv.com`（`_wb_tmp/bcgrowth/link/home.html`） | ✅ 与站内一致 |
| 产品描述 | 只写可核验事实（免费、无需注册、无水印、英/西双语、批量页、仅 DRM-free）；**未写**未经核验的「1 小时删除」「28+ 格式」等宣传语 | ✅ 无夸大 |
| 免费资格 | 选择 `tool_pricing=Free`；页面明示 "Free standard listing"；**未勾选** `feature_interest`（付费 featured placement） | ✅ 免费合规 |
| 分类 | `tool_category=33` = Utilities | ✅ |

### 提交与回执（真实 HTTP）

```
POST https://thetooldirectory.com/submit-a-tool/
HTTP/1.1 302 Found
location: https://thetooldirectory.com/submit-a-tool/?submitted=1
x-redirect-by: WordPress
```
回执页（携带同一 cookie 再取）：`HTTP 200`，正文含
> **"Thanks — your listing was submitted for review. Every submission is checked before it appears in the directory."**

证据文件：
- `evidence/C3-tftd-real-post-headers.txt`（原始响应头）
- `evidence/C3-tftd-confirm-page.html`（回执页 32,754 字节）

**状态判定：`SUBMITTED`（待人工审核），不是 `LIVE`。**
按 90 天计划的生命周期定义：`SUBMITTED → LIVE_VERIFIED → INDEXED → REFERRAL`。本轮只到第一层。

## 二、C3-2 既有外链与其余通道核验

| 目标 | 历史动作 | 本轮实测 | 判定 |
|---|---|---|---|
| `awz.cc` | 2026-11-06 提交（台账 #1） | `https://awz.cc/sites/bookconv` 301 → `http://www.awz.cc/sites/bookconv` **200**，正文命中 `BookConv` | **LIVE（1 条）** |
| `thefreetoolsdirectory.com` | 2026-11-06 API 返回 `{"success":true}` | 分类页 198,711 字节 **0 处 bookconv**；`/search?q=bookconv` → 404；`/sitemap.xml`、`/sites` TLS 连续 2 次失败后停止 | **UNKNOWN**（提交被接收 ≠ 已上线） |
| `sousuotu.com` | 需人工填腾讯问卷（纯 JS） | `/sst-2-1.htm` 200，**0 处 bookconv** | **BLOCKED（需人工）** |

**未做重复提交**：`thefreetoolsdirectory.com`（已提交过一次，结果未知前不再提交）、`thetooldirectory.com`（本轮已提交一次，只提交一次）。

## 三、C4 GEO 采样包（可复跑，本轮采样 0 条）

### 3.1 为什么先做包
三平台（ChatGPT / Gemini / 豆包）均需登录态；无登录态凭印象写答案即伪造。本轮有**行为证据**（GA4 `doubao.com` 引荐 49 会话/28 天、上传率 88%）但行为证据不能回答「哪条答案提到了我们」。

### 3.2 固定条件
| 项 | 取值 |
|---|---|
| 平台 | ChatGPT 网页版 / Gemini 网页版 / 豆包网页版 |
| 会话 | 每次新开对话；关闭记忆与个性化（若支持）；记录登录态是否新账号 |
| 语言 | 英文 3 条 + 中文 3 条，分平台记录、不合并算总分 |
| 时点 | 每周一 10:00（Asia/Shanghai），记录到分钟 |
| 字段 | 平台 / 时间 / prompt 原文 / 是否提及 BookConv / 提及位置 / 引用 URL 列表 / 同场竞品 / 截图名 |
| 禁止 | 改写 prompt 后对比；把「提到一次」当「稳定推荐」；跨平台合成总分 |

### 3.3 六条固定 Prompt
1. `best free online ebook converter no signup 2026`
2. `how to convert epub to azw3 for kindle without installing software`
3. `is there a free tool to convert lit files to epub online`
4. `免费的电子书格式转换工具推荐，不用注册`
5. `epub 怎么转 azw3 给 kindle 用，有在线工具吗`
6. `西语电子书 epub 转 mobi 在线免费工具`

### 3.4 状态
采样条数 **0**（BLOCKED：无登录态）。解阻：人工登录后按 §3.2 执行 6×3=18 条基线。

## 四、验收

| 项 | 方式 | 结果 |
|---|---|---|
| The Tool Directory 提交 | 真实 POST + 302 + 回执页正文 | **PASS（SUBMITTED）** |
| awz.cc | URL 200 + 正文命中 | PASS（LIVE，1 条） |
| thefreetoolsdirectory | 命中数 + 端点探测 | UNKNOWN |
| sousuotu | 页面命中数 | BLOCKED |
| GEO 采样包 | 字段齐全可复跑 | PASS（包） |
| GEO 采样执行 | 18 条基线 | BLOCKED |

> 纪律新增（本轮沉淀）：**平台 API 返回 `success` 只能记 `SUBMITTED`，不得记 `LIVE`；只有公开页面命中才算 `LIVE_VERIFIED`。**

红队：L2 · 裁定 修正 2 条（目标站点认错；把 API success 当上线）· 回执见 `10_红队与独立验收.md`
