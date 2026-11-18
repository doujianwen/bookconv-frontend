# 03 · Vercel 部署架构整改报告

- run_id：BC-OPS-D1-20261119｜实施 commit：`5e02b30c84e1a46b82630fe515c927e9433a59e0`（2026-11-17 09:32:51 +08:00，已 push）

## 1. 整改前（假绿状态）

```
push main ─┬─ Vercel GitHub Integration → vercel[bot] Production 部署（真实生效）
           └─ vercel-deploy.yml (GHA) → curl Vercel REST API
                 → token 失效 403 invalidToken
                 → continue-on-error: true + curl -s 无状态校验
                 → Actions 显示 success（假绿）
```

## 2. 整改后（单一真实通道 + 只读验证）

```
GitHub push main
       │
       ▼
Vercel GitHub Integration（唯一 Production 部署机制，未改动）
       │
       ▼
Vercel Production Deployment（vercel[bot] 创建 GitHub Deployment）
       │
       ▼
GitHub Actions 验证 Job（vercel-deploy.yml，只读）
       │ 轮询 GitHub Deployments API（github.token，read-only）
       ▼
核对 environment=production + SHA 精确匹配 + creator=vercel[bot]
       │
       ▼
终态 success → 生产 HTTP 回读 200 → PASS(0)
任何异常 → FAIL(1) / SUPERSEDED_NEUTRAL(2) / TIMEOUT(3)
```

## 3. 变更清单（commit 5e02b30，3 文件 +334/−16）

| 文件 | 变更 |
|---|---|
| `.github/workflows/vercel-deploy.yml` | 删除 Vercel REST 部署调用/continue-on-error/secret 依赖；改为只读验证 job；permissions 最小只读；timeout-minutes 15 |
| `ebook-converter/scripts/verify-production-deploy.mjs` | 新增：验证核心（SHA/环境/creator/状态机/限流区分/HTTP 回读，exit 0/1/2/3/4） |
| `ebook-converter/scripts/test-verify-production-deploy.mjs` | 新增：T1–T11 反向注入 harness（mock 隔离） |

## 4. 授权与门禁执行记录

- D1（方案 B 实施+commit+push）：Owner 已批准。
- pre-commit：5 套门禁全绿（syntax-sweep 374 文件 0 fail / content-integrity 0 err / workflow-integrity 5✓（含 I3 脚本入库校验、I4 无硬编码 token）/ agent-discipline 5✓ / heading-uniqueness 2✓ + GA4 selfTest）。
- pre-push：publish-gate 两层纠察放行（0 BLOCK；141 WARN 全部为存量博文质量问题，非本次变更范围，仅报告）。
- 白名单暂存：staged 仅 3 个授权文件；M14-2 三文件混入检查干净。
- 独立代码复审：**PUSHED_VERSION_SAFE**（R1–R8 全 PASS；3 条非阻断加固项见 10 号文件）。

## 5. 过程瑕疵披露（如实记录）

首轮独立代码审查 Agent 的回执在 push 前未被显式回读（Gate 11 执行瑕疵）。补救：push 后对 origin/main 实际内容重新执行了完整独立复审（R1–R8 全 PASS、PUSHED_VERSION_SAFE），并把本轮瑕疵登记为流程改进项（见 11 EXECUTION-LOG 与 10 残余）。

## 6. 回滚

单 commit revert（见 09 文件）：`git revert 5e02b30` + push，恢复原 workflow（原通道恒 403 无害）。
