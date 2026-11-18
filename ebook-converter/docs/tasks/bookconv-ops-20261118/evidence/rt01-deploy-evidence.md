# RT01 部署证据矩阵（独立复核，run_id=BC-OPS-20261118）

采集时点：2026-11-17 08:50–09:05 (+08:00)。全部为本轮独立取证，未复用上轮结论字段。

## A. GitHub Actions 运行层（独立重取 api.github.com/actions/runs）

| run_id | workflow | event | conclusion | head_sha | created_at |
|---|---|---|---|---|---|
| 43984732712 | Vercel Deploy (push to main) | push | **success（假绿）** | 0e8f3c1a | 2026-11-17T00:05:18Z |
| 43679747205 | 同上 | push | success（假绿） | cd0a9eb1 | 2026-11-15T05:08:05Z |

- total_count=1508；同 push 同时还有 Ebook QA Regression Gate / CI 两条 workflow，均不依赖 vercel-deploy（ci.yml 无 needs 指向它）。
- 上轮日志证据（本轮复核 grep 原文件 rt01-C-gha-deploy-log.txt L47）：
  `2026-11-17T00:05:23.6944688Z {"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}Vercel production deploy triggered for 0e8f3c1a…`
  → 同一行内：Vercel 403 错误 + "triggered" 回显，失败被吞。

## B. Vercel API 行为（对照组实验，未使用任何真实 secret）

假 token `INVALID_TEST_TOKEN_CTRL` 实测：
```
{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}
HTTP=403
```
与 GHA 日志错误逐字节一致 ⇒ secret VERCEL_DEPLOY_TOKEN 为无效/过期 token（Fact）。
UNKNOWN：无法区分「token 已吊销」vs「token 有效但无 team 权限」（invalidToken:true 指向前者；无有效 token 无法进一步区分，不影响结论）。

## C. GitHub Deployments 层（独立重取，per_page=40）

- 40 条全部 `environment=Production`、`creator=vercel[bot]`；最近 10 条：
  7839990987(0e8f3c1a, 11-17T00:06:14Z) / 7798884416(cd0a9eb1, 11-15T05:09:16Z) / 7796816247(70c82662, 11-15T01:36:23Z) / 7796574450(06a50178, 01:12:15Z) / 7796502278(b0427cb0, 01:05:22Z) / 7789531798(db266a06, 11-14T15:21:17Z) / 7785697299(8990285b, 09:35:45Z) / 7779748876(6e516054, 00:24:35Z) / 7754535862(28f341d0, 11-13T01:29:53Z) / 7681547086(28a25a7b, 11-10T12:04:08Z)
- deployment 7839990987 status：`22362995194 success 2026-11-17T00:06:15Z "Deployment has completed"`。
- 精确查询 `?sha=494a38f`：**matches=0**（rt01-dep-494a38f.json 存档）。

## D. push↔deployment 映射（11-10 以来 16 次 push）

每条 deployment 均在对应 head push 后 ~2 分钟出现；批量 push（一次 push 含多 commit）只有头 SHA 产生部署（如 11-15 13:05–13:06 四连 push 仅 cd0a9eb 部署；494a38f 等 5 个非头 SHA 零部署）。
⇒ **push→部署为 1:1（按 push 事件），无重复部署**。GHA 通道 403 从未产生过第二个部署。

## E. repoId 核验

api.github.com/repos/doujianwen/bookconv-frontend → id=1312872088, name=bookconv-frontend, private=false, default_branch=main。与 workflow 内 gitSource.repoId 一致。

## F. 架构还原结论

1. **Production 真实链路**：push main → Vercel GitHub Integration → vercel[bot] 创建 GitHub Deployment → Vercel 构建。唯一 creator（40/40）。
2. **GHA workflow `vercel-deploy.yml`**：触发条件相同（push main），调用 Vercel REST v13/deployments，**每轮 403 被吞、显示 success**。从未成功部署过（0 条部署由它产生）。
3. Preview 链路：GitHub Deployments 记录中无 Preview；workflow 亦只 target production。Preview 是否由 Vercel 集成产生于 Vercel 侧（不落 GitHub Deployments）→ UNKNOWN（需 Vercel 后台登录态）。
4. 重复部署风险：**当前不存在**（GHA 通道全 403）。若修好 token（方案 A），同一 push 将产生两个 Production 部署（REST 直建 + 集成自动建）→ 新增重复部署与竞态风险。
5. Token 泄露风险：token 仅经 secret 注入 env 与 curl -H，未回显日志；但 workflow 无任何输出脱敏异常，泄露面=Actions 日志中的 API 响应（不含 token）。低风险。
