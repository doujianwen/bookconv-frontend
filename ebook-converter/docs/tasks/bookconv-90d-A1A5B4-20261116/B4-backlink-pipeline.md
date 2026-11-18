# B4 外链管道推进报告｜2026-11-16

run: `bookconv-90d-A1A5B4-20261116` ｜ 执行主体：WorkBuddy（admin/Session 1）｜ 时代理出口不稳定

## 1. 授权边界（红队 N3 判定）

- 计划文档 §4 B4：Owner 已授权推进外链发现、监控和**实际提交**，仅限免费/相关/合规/低风险。
- 用户本轮指令：接收并执行 B4；"未经授权不得修改生产或 push"（外链提交非生产代码变更，不冲突）。
- 会话确认（2026-11-16 23:xx）：用户明确"授权真实提交"The Tool Directory 免费 listing。
- 结论：**提交动作已授权**；付费 featured、买链、群发、无关站点均禁止（本次未做任何付费选项）。

## 2. 候选资格审查（真实 HTTP 实测，首次探测 23:09）

| 候选 | 实测 HTTP | 资格判定 | 生命周期状态 |
|---|---|---|---|
| The Tool Directory `/submit-a-tool/` | 200 | QUALIFIED：免登录、免费标准收录、人工审核、接受 online tool/SaaS | DRAFTED → 提交尝试（见 §4） |
| SaaSHub `/services/submit` | 200 | QUALIFIED_PENDING_OWNER_DATA：需人工核对分类/重复条目 | DRAFTED（沿用，本轮未提交） |
| Product Hunt `/products/new` | 403 | 本轮请求被拒；需登录账号，非低风险匿名提交 | DISCOVERED（本轮无动作） |
| AlternativeTo `/tag/ebook-converter/` | 403 | 本轮请求被拒；FAQ 曾 403（见快照 json） | QUALIFIED（历史），本轮无动作 |

原始证据：`evidence/ttd-page-fresh.html`、`evidence/BookConv-link-qualification...` 快照、本轮 HTTP 探测记录（§5）。

## 3. The Tool Directory 表单核验（来自真实页面 HTML）

- 提交端点：`POST https://thetooldirectory.com/submit-a-tool/`（同页提交，`<form method="post">`）。
- 反滥用：`ttd_submit_nonce`（页面动态生成）+ `_wp_http_referer` + `ttd_submit_tool=1`。
- 必填：`tool_name` / `tool_url` / `tool_tagline` / `tool_pricing` / `tool_category` / `submitter_email` / `tool_description`。
- 分类枚举：Utilities(33) 最贴合电子书转换工具；备选 Website & No-Code(31)。
- 定价枚举：Free / Free / paid plans / Paid / Open source / Contact for pricing。
- 付费选项：`feature_interest`（付费 featured placement）——**本次故意不勾选**，保持免费标准收录。
- 官方邮箱：`hello@bookconv.com`（站点 footer/help/founder/隐私页多处公示，真实官方对外邮箱）。
- 审核性质："Free to submit / Reviewed before publishing / Public ratings"——人工审核后才公开。

## 4. 真实提交执行结果（诚实记录）

- 提交脚本：`evidence/submit-ttd.mjs`（同会话 GET 取 nonce+cookie → POST 表单 → 存回执）。
- 提交载荷快照：`evidence/ttd-submit-request.json`（完整字段，可人工复核/重放）。
- 产品描述严格对齐已核验事实：31 转换对/18 格式；单文件直传上限 100MB（仅部分路由）；回退与批量 4MB/文件；免费 beta；部分路由用第三方服务。**未写** 100MB 全格式/无限免费/自动删除/开源等过度承诺。
- **执行结果：FAILED（网络通道，非表单问题）。**
  - Node fetch → thetooldirectory.com：`ECONNRESET`（TLS handshake 未建立），exit 1。
  - curl 同会话 GET：exit 35（schannel TLS 失败）。
  - 稳定性诊断：连续 3 次 HEAD 均 `http=000 / schannel failed to receive handshake`；连 `www.bookconv.com` 对照也 `http=000`。
  - 根因：本机出口代理在 23:09 首探成功后再度整体失效（与 GA4/Bing 通道同机特征）。非代码、非表单、非凭据问题。
  - 依治理纪律"连续两次相同失败停止重试、回到根因"，**未做第 4 次盲提交**。
- 平台提交回执：**无**（未产生服务端成功响应）。
- 生命周期状态：**DRAFTED（资料齐备、待网络稳定重放）**，不晋级 SUBMITTED。
  - DoD 铁律：有平台提交回执才算 SUBMITTED。本次无回执 → 绝不标 SUBMITTED/LIVE。

## 5. 可复用提交资料（人工/脚本可直接重放）

- 重放脚本：`evidence/submit-ttd.mjs`（网络恢复后 `NODE_USE_ENV_PROXY=1 node submit-ttd.mjs`，会自行取新 nonce+cookie）。
- 字段快照：`evidence/ttd-submit-request.json`。
- 站点公示联系邮箱：`hello@bookconv.com`。
- 建议重放检查点：出口代理稳定后（先 `curl -o /dev/null -w "%{http_code}" https://www.bookconv.com/` 得 200 再提交）。

## 6. 生命周期数量（诚实口径）

DISCOVERED 2（Product Hunt / AlternativeTo 本轮被拒）｜QUALIFIED 2（TTD、SaaSHub）｜DRAFTED 1（TTD，资料齐备）｜SUBMITTED 0｜LIVE_VERIFIED 0｜INDEXED 0｜REFERRAL 0。
候选≠提交，提交≠Live，Live≠索引，索引≠引荐流量。

红队：L3 · 裁定 修正（授权真实提交 ≠ 网络可达；首次 HTTP200 ≠ 提交通道稳定；无平台回执不得标 SUBMITTED）· 回执 本文 §4 + `evidence/submit-ttd.stderr.txt`。无独立提交回执通道，标 L3-UNAVAILABLE（提交未完成，无对外副作用发生）。
