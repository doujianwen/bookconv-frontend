# 10 · 残余风险及CEO决策

- run_id：BC-OPS-D1-20261119｜关闭时点：2026-11-17 09:55 (+08:00)

## 1. 残余风险

| 等级 | 项 | 处置建议 |
|---|---|---|
| P2 | VERCEL_DEPLOY_TOKEN 仍存于 GitHub Settings（已 0 引用、已失效） | Owner 择时手动删除（D3 本轮禁删）；不删也无风险 |
| P2 | INDEXNOW_KEY 死配置：indexnow-ping.yml 位于 `ebook-converter/.github/workflows/`（GitHub 不读取），从未生效 | 待 Owner 决策：上移到仓库根启用，或删除文件 |
| P2 | Vercel 构建偶发 >10min → 验证 job exit 3 假红 | 失败方向安全；可调 VPD_DEADLINE_MS |
| P2 | HTTP 回读无 cache-buster（旧缓存可能回 200） | 前置已要求 deployment success，风险极低 |
| P2 | GitHub Events feed 缺 7 条近期 push 事件（原因不可判定）；7681547086 部署终态 statuses 为空 | 均不影响验证机制正确性（runs+deployments 双源已闭合） |
| P2 | 非阻断加固项（复审建议）：REPO 改用 GITHUB_REPOSITORY 优先；429/5xx 重试加次数上限 | 下次触碰该文件时顺手做 |
| P2 | closure-gates 既有 UNKNOWN F15/F26 | 项目既有事项，待人工核验 |

## 2. 过程瑕疵（如实披露）

1. **Gate 11 执行瑕疵**：push 前未显式回读首轮代码审查回执。补救=对已推送版本重新完整复审（PUSHED_VERSION_SAFE，R1–R8 全 PASS）。已登记流程改进：**审查回执未回读前不得 push**。
2. T7 首轮失败（clamp 边界导致走了超时分支而非连续错误分支）——属测试预期与实现不符，非生产缺陷；已修复并回归。

## 3. 红队回执（V2 · N2 方案定稿 + N3 push 前 + N4 关闭）

**断言**：①假绿已消除且不可回潮；②10 push=10 deployments 无漏无重；③验证 job 无假绿路径；④限流/权限 403 正确区分；⑤生产部署 7841469158 真实成功；⑥M14-2 未被波及；⑦Secret 零变更。

**攻击（逐条）**：
- ① 反例设计：验证 job 是否存在「失败显示成功」路径 → T2–T11 九种失败注入全部非零退出（12/12）；代码审查 R2 确认唯一 exit 0 路径=五判据全过。通过。
- ② Push Event≠Commit 数量陷阱 → runs 时间戳分组重建（feed 缺事件反例已用双源交叉闭合），矩阵逐行时间戳对齐 ≤2min。通过。
- ③ 启动竞态误报 → 空结果「只等不判负」+ 时间线嵌套自洽（2min/10min/15min）复审确认。通过。
- ④ 本机真实限流 403 实测第一版误判 → 已修复（classify 按响应体 message），回归通过。通过（推翻第一版后修正）。
- ⑤ deployment ID/creator/SHA/状态/HTTP 五元组独立 API 实测 + 验证 job 真 run success。通过。
- ⑥ 三文件 SHA256 与快照逐字节一致 + 三面线上负对照。通过。
- ⑦ 改造后 workflow 0 secrets 引用 grep 全仓库核验。通过。

**裁定**：通过（①④两项经历推翻-修正循环后通过）。

**证据**：rt07-dep-new.json / rt07-dep-status.json / rt07-runs-new.json / rt-t1-t11-results.txt / rt01-push-groups.json / 复审报告 R1–R8 / pre-commit 5 套门禁输出 / pre-push 放行输出。

## 4. CEO 待决策项

| # | 决策 | 建议 |
|---|---|---|
| N1 | 删除孤儿 secret VERCEL_DEPLOY_TOKEN（D3 遗留） | 择时删除，$0 风险 |
| N2 | INDEXNOW 死配置修复或删除 | 建议：上移 workflow 到仓库根以启用 IndexNow（若仍需 ping 能力），否则删除 |
| N3 | M14-2 发布授权（D2 暂缓中） | 待经营节奏决定，发布走既有验收链 |

## 5. 红队声明行

红队：L3 · 裁定 通过（①④推翻-修正后通过）· 回执 本文件 §3 + 01_红队审计报告.md §红队回执（L3 独立通道=独立复审 Agent PUSHED_VERSION_SAFE + 独立验收 Agent G01–G10）
