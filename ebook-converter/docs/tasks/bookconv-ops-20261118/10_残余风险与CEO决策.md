# 10 · 残余风险与 CEO 决策

- run_id：BC-OPS-20261118｜关闭时点：2026-11-17

## 1. 需 CEO 决策的事项（按优先级）

| # | 决策 | 建议 | 影响 |
|---|---|---|---|
| D1 | 批准方案 B 并授权下轮实施（替换 vercel-deploy.yml → verify-production-deploy.yml，diff 草稿已备） | 批准 | 消除假绿，部署状态变可信；$0 |
| D2 | 授权 M14-2 发布（草稿 LOCAL_READY，board accept 链已定义） | 批准（下批内容动作 ≤3 页纪律内单独走） | 承接 Bing 71 展示存量需求 |
| D3 | （可选）删除孤儿 secret VERCEL_DEPLOY_TOKEN | 方案 B 落地后删除 | 减少过期凭据暴露面 |
| D4 | D+7（2026-11-24）M14-1 检查点执行人 | 排入下一轮经营任务 | 数据到齐后首判 |

## 2. Fact / Assumption / Unknown

- **Fact**：假绿机制（403+吞错+绿）；生产链路=集成（40/40）；M14-2 未发布（三面负对照）；GA4 7 天 105/23=82% 终态率；Bing 基线桶 11-13=0 点击/4 展/位 3。
- **Assumption**：GHA 通道「自创建起从未成功部署」（基于 40 条抽查均 vercel[bot] + 通道代码恒 403 结构）。
- **Unknown**：token 失效具体原因（吊销 vs 过期）；Vercel 后台 dpl ID 与 Preview 链路（登录态过期）；今日（11-17）GA4/GSC 数据（未生成）。

## 3. 残余清单

| 等级 | 项 | 处置 |
|---|---|---|
| P1 | 方案 B 尚未实施（本轮禁止改 workflow） | D1 决策后下轮实施，含 T2 注入反向验证 |
| P1 | closure-gates 既有 UNKNOWN F15/F26（非本轮产生） | 待人工逐条核验（项目既有事项） |
| P2 | Vercel dpl ID 不可见（登录态过期） | Owner 重登后台核读，不阻塞 SHA 级结论 |
| P2 | 11-13 `Request failed (HTTP 403)`×2 未深挖 | 低频未复现，登记观察 |
| P2 | board.json M14-2 `status` 仍为 blocked（正确状态，非缺陷） | D2 决策后改 done 需过 closure-gate |

## 4. 停止规则确认

未新增调度器 ✔ / 未动生产 workflow ✔ / 未执行部署 ✔ / 未发布 M14-2 ✔ / 未重复审计 ✔ / 未制造增长任务 ✔ / 无生产安全风险需升级 ✔

## 5. 红队回执（V2 · N2 方案定稿 + N4 关闭，L2）

**断言**：①假绿根因=无效 token+吞错机制；②生产链路=Vercel GitHub Integration 且 1 push=1 部署；③方案 B 零重复部署且不会假绿；④M14-2 三面未发布；⑤82% 终态率口径正确。

**攻击（逐条）**：
- ① 逆命题攻击（"该错误⇒假 token"未证）→ 已用对照组实验正向证明"假 token⇒该错误"，且日志错误含 Vercel 专有字段 `invalidToken:true`；残余归因歧义已标 UNKNOWN，不影响方案（两案均不依赖 token）。通过（带 UNKNOWN 披露）。
- ② 反例设计：查"部署时间戳与 push 不匹配/非头 SHA 部署"→ 实测 16 push/10 部署逐一时间对齐（≤2min），`?sha=494a38f` 负对照 0 匹配，无反例。通过。
- ③ 最坏后果攻击：验证 job 若 API 失败静默绿？→ 草稿用 `set -euo pipefail` + 非 success/failure 状态走完循环后强制 `exit 1`；注入假 SHA 反向验证已写入 04-T2 必跑项。**未实测（本轮禁改 workflow）→ 该子项标注为"实施时必须验证"，不作为已验证结论。**
- ④ 尝试攻击"本地 import 可能间接发布"→ 生产仅从 git 构建且文件不在 origin/main；404/X-Matched-Path/noindex + sitemap/llms.txt 双 0。通过。
- ⑤ 口径攻击（complete/upload 陷阱）→ 已用终态口径 complete/(complete+failed)，且 11-16 终态 23 ≤ attempt 25 满足 B6 容差不变量。通过。

**裁定**：通过（#③ 带实施前强制验证条件，不构成推翻）。
**证据**：对照组 403 实测原文；Deployments API 40 条与负对照 JSON 存档；GHA 日志 L47 原文；git cat-file exit 128；curl 三面负对照计数。
**残余**：见 §2 Unknown 与 §3 P1/P2。
