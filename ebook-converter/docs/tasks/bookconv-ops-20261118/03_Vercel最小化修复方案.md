# 03 · Vercel 最小化修复方案（A/B 对比 + CEO 推荐）

- run_id：BC-OPS-20261118｜方案定稿：2026-11-17
- ⚠️ 本轮只出方案与 diff 草稿，**不修改任何 workflow、不 commit、不部署**（任务铁律）。

## 方案 A：修复 GHA 部署通道（修 token + 校验 + 去假绿）

要点：换新有效 token、删 `continue-on-error`、curl 加 `--fail-with-body` + HTTP 状态断言、轮询部署终态。

**diff 草稿**（`.github/workflows/vercel-deploy.yml`）：

```yaml
name: Vercel Deploy (push to main)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel production deployment from bookconv-frontend
        # 修复点1：删除 continue-on-error: true
        env:
          TOKEN: ${{ secrets.VERCEL_DEPLOY_TOKEN }}   # 修复点2：Settings 中换成新有效 token
        run: |
          set -euo pipefail
          if [ -z "$TOKEN" ]; then
            echo "::warning::VERCEL_DEPLOY_TOKEN not set; skipping auto-deploy."
            exit 0
          fi
          # 修复点3：捕获 HTTP 状态码，非 200 即失败
          HTTP=$(curl -sS -o resp.json -w "%{http_code}" -X POST \
            "https://api.vercel.com/v13/deployments?teamId=team_a0qDGfHPDekyykDsQVRS5x15" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"ebook-converter-ymfg\",\"target\":\"production\",\"gitSource\":{\"type\":\"github\",\"repoId\":1312872088,\"sha\":\"${{ github.sha }}\",\"ref\":\"main\"}}")
          echo "Vercel API HTTP $HTTP"
          cat resp.json
          if [ "$HTTP" != "200" ]; then
            echo "::error::Vercel API rejected deployment (HTTP $HTTP)"
            exit 1
          fi
          # 修复点4：轮询部署终态（最多 15 分钟）
          DEPLOY_URL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('resp.json')).url||'')")
          for i in $(seq 1 30); do
            sleep 30
            ST=$(curl -sS -o st.json -w "%{http_code}" "https://api.vercel.com/v13/deployments/$(node -e "console.log(JSON.parse(require('fs').readFileSync('resp.json')).id||'')")?teamId=team_a0qDGfHPDekyykDsQVRS5x15" -H "Authorization: Bearer $TOKEN")
            R=$(node -e "const j=JSON.parse(require('fs').readFileSync('st.json'));console.log(j.readyState||'')")
            echo "poll#$i readyState=$R (HTTP $ST)"
            [ "$R" = "READY" ] && { echo "Deployment READY: $DEPLOY_URL"; exit 0; }
            [ "$R" = "ERROR" ] || [ "$R" = "CANCELED" ] && { echo "::error::Deployment $R"; exit 1; }
            [ "$ST" != "200" ] && { echo "::error::Status poll HTTP $ST"; exit 1; }
          done
          echo "::error::Deployment not READY within 15 minutes"
          exit 1
```

| 维度 | 评估 |
|---|---|
| 可靠性 | ✅ 修复后假绿消失，失败可见 |
| **重复部署风险** | ❌ **新增**：同一 push 会产生「REST 直建 + 集成自动建」两个 Production 部署（双倍构建、竞态、`latest` 指向歧义）；Vercel 对同 SHA 双部署不去重 |
| 维护成本 | ❌ 需管理新 token 的生成/轮换/过期（本次事故即过期所致，会复发） |
| 权限要求 | 需 Vercel 账号操作权限创建新 token（Owner 手工） |
| 故障恢复 | ✅ 失败会红，可重跑 |
| 对现有生产流程影响 | ⚠️ 双部署竞态是结构性新风险 |

## 方案 B（CEO 推荐）：集成通道为唯一生产部署，GHA 改为部署验证任务

要点：删除 REST 直调部署 step；workflow 改为「断言本 SHA 存在成功的 Production GitHub Deployment」（独立可证伪，匿名 API 即可验）。

**diff 草稿**（`.github/workflows/vercel-deploy.yml` 改名 `verify-production-deploy.yml`）：

```yaml
name: Verify Production Deployment (push to main)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Assert successful Production deployment exists for this SHA
        env:
          GH_TOKEN: ${{ github.token }}
          REPO: ${{ github.repository }}
          SHA: ${{ github.sha }}
        run: |
          set -euo pipefail
          for i in $(seq 1 30); do
            sleep 20
            LIST=$(curl -sS -H "Authorization: Bearer $GH_TOKEN" \
              "https://api.github.com/repos/$REPO/deployments?sha=$SHA&environment=production&per_page=1")
            ID=$(printf '%s' "$LIST" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(Array.isArray(j)&&j[0]?j[0].id:'')})")
            if [ -n "$ID" ]; then
              STATE=$(curl -sS -H "Authorization: Bearer $GH_TOKEN" "https://api.github.com/repos/$REPO/deployments/$ID/statuses" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(Array.isArray(j)&&j[0]?j[0].state:'NONE')})")
              echo "poll#$i deployment=$ID state=$STATE"
              [ "$STATE" = "success" ] && { echo "Production deployment verified for $SHA"; exit 0; }
              [ "$STATE" = "failure" ] && { echo "::error::Production deployment failed"; exit 1; }
            else
              echo "poll#$i no deployment yet"
            fi
          done
          echo "::error::No successful Production deployment for $SHA within 10 minutes"
          exit 1
```

| 维度 | 评估 |
|---|---|
| 可靠性 | ✅ 集成通道已被 40/40 部署记录实证；验证 job 在部署缺失/失败时**变红**（真信号） |
| 重复部署风险 | ✅ 归零（删除直建；GHA 只读） |
| 维护成本 | ✅ 最低：零 token 管理（用 `github.token`），无 Vercel 侧操作 |
| 权限要求 | 仅 Actions 默认权限 |
| 故障恢复 | ✅ 验证失败=可见红；重跑 workflow_dispatch 即可 |
| 对现有生产流程影响 | ✅ 零影响（删除的通道从未生效过；QA/CI 无依赖） |

残余限制：方案 B 不验证 Vercel 内部构建细节（dpl 级），只断言「GitHub 层部署成功」；内容级校验仍由既有 RT 流程覆盖。

## CEO 推荐：**方案 B**

理由（按权重）：
1. **零重复部署**（方案 A 的结构性缺陷无法绕过——除非同时下线集成，反而推高成本）。
2. **零 token 维护**——本次事故根因就是 token 生命周期管理失败，方案 A 会复发。
3. 最小化：只动一个文件，其他 workflow 零改动；生产链路不变。
4. 与最高目标一致：让部署状态**可信**（红/绿都真实），而不是多一条可部署通道。
5. $0 成本（TASK-GOVERNANCE §5 零成本优先）。

回滚：单 commit revert（workflow 文件单文件变更，回滚=恢复原 vercel-deploy.yml）。
