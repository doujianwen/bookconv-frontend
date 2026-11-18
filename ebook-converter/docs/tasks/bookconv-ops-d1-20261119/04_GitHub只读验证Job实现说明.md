# 04 · GitHub 只读验证 Job 实现说明

- 对象：`ebook-converter/scripts/verify-production-deploy.mjs` + `.github/workflows/vercel-deploy.yml`

## 1. 能力对照（任务书阶段 3 A–H）

| 要求 | 实现 |
|---|---|
| A Deployment 查询 | `GET /repos/{repo}/deployments?sha={SHA}&environment=production&per_page=5`，20s 轮询（VPD_POLL_INTERVAL_MS 可调） |
| B 环境识别 | 查询参数过滤 + 防御性二次断言 `(dep.environment).toLowerCase()==='production'`，Preview → exit 1 WRONG_ENV |
| C SHA 核对 | `dep.sha` 与目标 SHA 大小写不敏感精确比对；目标 SHA 非 40 hex → exit 4 |
| D Creator 核对 | `creator.login === 'vercel[bot]'`（可经 VPD_EXPECTED_CREATOR 覆盖），否则 exit 1 |
| E 状态轮询 | queued/pending/in_progress→继续；success→HTTP 回读→PASS；failure/error/canceled→exit 1；inactive/superseded→exit 2（不伪报 PASS） |
| F 超时处理 | deadline 默认 600s（VPD_DEADLINE_MS），到点 exit 3；空结果继续等待，不误判 |
| G API 错误处理 | 403 真权限→exit 1 API_PERMISSION；403+message 含 rate limit→归类限流重试（实测修复项）；404→exit 1；429/5xx→按 deadline 重试；网络异常连续 ≥5 次→exit 1；全程不用 continue-on-error、不依赖进程退出码单判据 |
| H 生产 HTTP 验证 | 终态 success 后 GET `VPD_BASE_URL`（默认 https://www.bookconv.com/），记录 final URL，非 200→exit 1 |
| superseded 旧 SHA | exit 2 SUPERSEDED_NEUTRAL + 日志明示被替代，不伪报 PASS |

## 2. 退出码语义

| 码 | 含义 |
|---|---|
| 0 | PASS：Production 部署（SHA+creator+环境全匹配）success 且生产 HTTP 200 |
| 1 | FAIL：判据任一不满足（含权限/网络连续错误） |
| 2 | SUPERSEDED_NEUTRAL：目标 SHA 部署被后续 SHA 替代 |
| 3 | TIMEOUT：deadline 内未达成 |
| 4 | CONFIG_ERROR：SHA 格式非法 |

## 3. 权限与安全

- `permissions: contents:read + deployments:read`（最小只读）；token=`${{ github.token }}` 自动过期；无 PAT、无外部 Secret。
- token 仅进 Authorization 头，日志/错误消息不回显。
- mock 传输仅 `VPD_MOCK` 显式设置时启用；CI 环境不设置 → 生产路径恒为真实 fetch。

## 4. Actions 集成

- 触发：push main + workflow_dispatch（与原 workflow 一致，无依赖断裂——原文件无任何下游依赖）。
- 步骤：checkout@v4 → `node ebook-converter/scripts/verify-production-deploy.mjs`（ubuntu-latest 自带 Node 20）。
- 时间线自洽：集成部署 ~2min < 脚本 deadline 10min < job timeout 15min。

## 5. 测试与验证证据

- T1–T11 反向注入 12 用例 12/12 PASS（真实退出码，evidence/rt-t1-t11-results.txt）。
- 独立复审 R1–R8 全 PASS（PUSHED_VERSION_SAFE）。
- 实测中发现并修复：GitHub 匿名限流返回 403（非 429）曾被误判为权限错误 → 已按响应体 message 区分，回归通过。
