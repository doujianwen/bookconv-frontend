# 01 · Vercel 假绿根因分析

- run_id：BC-OPS-20261118｜分析时点：2026-11-17 08:47–09:30 (+08:00)
- 裁定：**根因已查明（Fact 级，全部独立复证）**

## 1. 一句话根因

`.github/workflows/vercel-deploy.yml` 携带的 secret `VERCEL_DEPLOY_TOKEN` 是**无效/过期 token**，Vercel API 返回 `403 forbidden / invalidToken:true`；但该 step 设置了 `continue-on-error: true` 且 `curl -s` **不校验 HTTP 状态码、不解析响应体**，错误被完全吞掉，GitHub Actions 因此把失败的部署步骤显示为绿色 success。

## 2. 逐条独立复核（前序发现 → 本轮实测）

| 前序发现 | 本轮独立复核 | 结果 |
|---|---|---|
| VERCEL_DEPLOY_TOKEN 无效 | 对照组实验：假 token `INVALID_TEST_TOKEN_CTRL` 直调同一 API 端点，返回 `{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}`，HTTP 403，**与 GHA 运行日志错误逐字节一致** | ✅ 证实 |
| API 返回 invalidToken | 上轮日志原文复核（evidence/rt01-C-gha-deploy-log.txt L47）：错误 JSON 与 "triggered" 回显同行出现 | ✅ 证实 |
| continue-on-error 吞失败 | workflow 第 13 行 `continue-on-error: true`（本轮重读文件确认） | ✅ 证实 |
| curl 未校验 HTTP 状态 | 第 22 行 `curl -s` 无 `-f`/`--fail-with-body`/`-w`，响应体直接落日志后无视 | ✅ 证实 |
| Actions 显示 success | 独立重取 runs API：run 43984732712（0e8f3c1a）conclusion=**success** | ✅ 证实 |
| 生产实际由 Vercel GitHub Integration 完成 | 独立重取 Deployments API 40 条：**creator 全部 = vercel[bot]**，GHA 通道 0 条部署记录 | ✅ 证实 |

## 3. 缺陷链条（为什么绿）

```
push main
 ├─ Vercel GitHub Integration → vercel[bot] → Production 部署（真实生效，~2 分钟）
 └─ vercel-deploy.yml (GHA)
     → curl -s POST /v13/deployments → 403 invalidToken
     → continue-on-error: true        → step 失败被降级
     → curl 不校验状态码              → 脚本继续
     → echo "Vercel production deploy triggered …"（无条件成功话术）
     → job = success ⇒ 假绿
```

## 4. UNKNOWN（如实标注）

1. token 失效原因（已吊销 vs 过期 vs 权限范围变化）：`invalidToken:true` 指向前两者之一，但无有效 token 无法进一步区分。**不影响修复决策**（两条候选方案都不依赖该 token）。
2. Vercel 侧 Preview 部署是否由集成产生：GitHub Deployments 无 Preview 记录，Vercel 后台登录态过期无法核实 → UNKNOWN。
3. 该 GHA 通道**历史上是否曾成功过**：未在 Deployments 中发现任何非 vercel[bot] 记录（40 条抽查），推断「自创建起从未成功」；完整历史未穷尽核验 → 推断级。

## 5. 残余

- 无 P0。根因证据链完整（evidence/rt01-deploy-evidence.md + rt01-C-gha-deploy-log.txt 存档）。
