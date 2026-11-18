# RT05 · Secret 依赖审计（BC-OPS-D1-20261119 · 只审计，零变更）

- 时点：2026-11-17 09:25 (+08:00)
- 最终状态：**AUDIT_COMPLETE / NO_SECRET_MUTATION**（未删除/修改/轮换/转移任何 Secret）
- 方法局限：GitHub 侧实际存储的 secret 全集需 admin 权限或 gh CLI（本机不可用）⇒ 本审计基于①全仓库 workflow 代码引用扫描 ②Actions 运行证据 ③本地文件扫描。**未引用但实际存在的孤儿 secret 无法枚举 → UNKNOWN（标 P2，解阻=Owner 在 Settings > Secrets 页人工核对）。**全程未输出任何 Secret 值。

## 审计明细

| Secret | 引用位置（改后） | 最后使用证据 | 当前用途 | 是否已失效 | 其他依赖 | 建议 |
|---|---|---|---|---|---|---|
| VERCEL_DEPLOY_TOKEN | **0 处**（workflow 改造后无任何引用；仅 docs/memory 历史记载） | run 43984732712 @ 2026-11-17T00:05:23Z → Vercel 403 invalidToken（此前恒 403 假绿） | 无（原部署通道已下线） | **是**（invalidToken） | 仓库内无其他依赖 | 已无消费者，可安全删除；按 D3 本轮不删，留待 Owner 手动处理 |
| CODECOV_TOKEN | `.github/workflows/ci.yml:167` | CI 近 100 runs 中 34 次运行（是否实际上传 codecov 未逐次核验） | coverage 上报 | 未知（超范围） | 无 | 不动；后续可审计 CI 日志确认上传是否成功 |
| FEISHU_WEBHOOK_URL | `.github/workflows/weekly-audit.yml:96` | weekly-audit 最近运行 43752391734 @ 11-15（conclusion=failure） | 周审计通知推送 | 未失效（运行中） | 无 | 不动 |
| INDEXNOW_KEY | `ebook-converter/.github/workflows/indexnow-ping.yml:33` | **近 100 runs 中 0 次 IndexNow 运行** | （无实际消费者） | **workflow 未生效**：GitHub 只读取仓库根 `.github/workflows/`，该文件位于 `ebook-converter/.github/workflows/` 子目录，从未被调度 | 无 | 发现：该 workflow+secret 组合为死配置；修复（上移到根）或删除均超本轮授权 → 登记 P2 待 Owner 决策 |

## GITHUB_TOKEN（内置，非 Secret 面板项）

- 新验证 job 使用 `${{ github.token }}`，`permissions: contents:read + deployments:read` —— 最小只读，作用域限本仓库单次运行，自动过期。无 PAT 引入。

## 边界确认

- 未读取、未输出、未变更任何 Secret 实际值。
- 审计证据：`rt01-gha-runs-raw.json`（workflow 分布+IndexNow 0 运行）、workflow 全文 grep 存档（本轮对话记录+01 报告引用）。
