# 02 · 16次Push与Deployment对应矩阵（实为 10 push / 16 commits / 10 deployments）

- run_id：BC-OPS-D1-20261119｜构建时点：2026-11-17
- 数据源：Actions runs 时间戳分组（rt01-gha-runs-raw.json）+ git log 区间（rt01-push-groups.json）+ Deployments API + statuses API
- **Push Event 与 Commit 数量区分**：16 是 commit 总数；push 事件=10 次。11-15T05:08 一次 push 含 7 commits（cd0a9eb,904b9d1,5590add,494a38f,c5a301f,4aa66ba,bca80d9），Vercel 仅按头 SHA cd0a9eb 部署——非头 commit 无部署为预期行为，不是漏部署。
- Events feed 缺失 7 条近端 push 事件（UNKNOWN 原因），矩阵改由 runs 分组重建，与 Deployments 时间戳双源交叉验证。

| # | push 时间(UTC) | push 事件来源 | before | after | commits(数) | Deployment ID | 部署SHA | environment | creator | created_at | 终态 | superseded? | 说明 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-11-10T12:02:32Z | runs分组+Deployments(Events feed亦有) | 2a4c26ff | 28a25a7b | 1 (28a25a7) | 7681547086 | 28a25a7b | Production | vercel[bot] | 2026-11-10T12:04:08Z | UNKNOWN(空statuses) | 否 | push后≤2min部署,延迟正常 |
| 2 | 2026-11-13T01:28:21Z | runs分组+Deployments(Events feed亦有) | 28a25a7b | 28f341d0 | 1 (28f341d) | 7754535862 | 28f341d0 | Production | vercel[bot] | 2026-11-13T01:29:53Z | success | 否 | push后≤2min部署,延迟正常 |
| 3 | 2026-11-14T00:23:29Z | runs分组+Deployments(Events feed亦有) | 28f341d0 | 6e516054 | 1 (6e51605) | 7779748876 | 6e516054 | Production | vercel[bot] | 2026-11-14T00:24:35Z | success | 否 | push后≤2min部署,延迟正常 |
| 4 | 2026-11-14T09:34:05Z | runs分组+Deployments(Events feed亦有) | 6e516054 | 8990285b | 1 (8990285) | 7785697299 | 8990285b | Production | vercel[bot] | 2026-11-14T09:35:45Z | success | 否 | push后≤2min部署,延迟正常 |
| 5 | 2026-11-14T15:20:05Z | runs分组+Deployments(Events feed亦有) | 8990285b | db266a06 | 1 (db266a0) | 7789531798 | db266a06 | Production | vercel[bot] | 2026-11-14T15:21:17Z | success | 否 | push后≤2min部署,延迟正常 |
| 6 | 2026-11-15T01:04:15Z | runs分组+Deployments(Events feed亦有) | db266a06 | b0427cb0 | 1 (b0427cb) | 7796502278 | b0427cb0 | Production | vercel[bot] | 2026-11-15T01:05:22Z | success | 否 | push后≤2min部署,延迟正常 |
| 7 | 2026-11-15T01:10:45Z | runs分组+Deployments(Events feed亦有) | b0427cb0 | 06a50178 | 1 (06a5017) | 7796574450 | 06a50178 | Production | vercel[bot] | 2026-11-15T01:12:15Z | success | 否 | push后≤2min部署,延迟正常 |
| 8 | 2026-11-15T01:35:18Z | runs分组+Deployments(Events feed亦有) | 06a50178 | 70c82662 | 1 (70c8266) | 7796816247 | 70c82662 | Production | vercel[bot] | 2026-11-15T01:36:23Z | success | 否 | push后≤2min部署,延迟正常 |
| 9 | 2026-11-15T05:08:05Z | runs分组(Events feed缺)+Deployments | 70c82662 | cd0a9eb1 | 7 (cd0a9eb,904b9d1,5590add,494a38f,c5a301f,4aa66ba,bca80d9) | 7798884416 | cd0a9eb1 | Production | vercel[bot] | 2026-11-15T05:09:16Z | success | 非头commit被隐式替代(预期) | push后≤2min部署,延迟正常 |
| 10 | 2026-11-17T00:05:18Z | runs分组+Deployments(Events feed亦有) | cd0a9eb1 | 0e8f3c1a | 1 (0e8f3c1) | 7839990987 | 0e8f3c1a | Production | vercel[bot] | 2026-11-17T00:06:14Z | success | 否 | push后≤2min部署,延迟正常 |

## 汇总
- 10 push ↔ 10 deployment：**1:0 缺失，0 重复**；部署延迟全部 ≤2 分钟。
- 全部 creator=vercel[bot]、environment=Production。
- 终态：success×9 + UNKNOWN×1（7681547086 statuses 为空）。
- 无 inactive/superseded 记录。
