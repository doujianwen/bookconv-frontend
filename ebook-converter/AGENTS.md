<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in 
ode_modules/next/dist/docs/ before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Multica Agent Integration Rules

## Critical: Close the Loop

When working on any Multica issue (EBO-XXX), you MUST follow this workflow:

### Before Starting
1. Update issue status:
   `ash
   node scripts/codex-multica-sync.js update-status EBO-XXX in_progress
   `
2. Read the issue description to understand requirements

### After Finishing
1. Verify your changes work (TypeScript compiles, tests pass)
2. Mark as done with summary:
   `ash
   node scripts/codex-multica-sync.js complete EBO-XXX
   `
3. Report back to user: "EBO-XXX completed, synced to Multica"

### If Creating New Issues
1. Use templates from .multica-templates/issues/
2. Run:
   `ash
   node scripts/codex-multica-sync.js create phaseX-template "description" priority
   `

## Available Scripts
- 
ode scripts/codex-multica-sync.js update-status <key> <status>
- 
ode scripts/codex-multica-sync.js complete <key> [summary-file]
- 
ode scripts/codex-multica-sync.js add-comment <key> <file>
- 
ode scripts/codex-multica-sync.js list-pending

See ../docs/codex-multica-sync.md for full documentation.

## Closure Gate（关闭门禁 · 硬规则）

任何把待办项标为 `已关闭` / `✅ done`，或在汇报中声称某事项「已关闭 / 已完成」之前，**必须先跑**：

```
node scripts/verify-closure-gates.mjs --no-live
```

- `exit 1`（存在假关闭）→ 禁止关闭，先修 gate 或降级为「待观察」。
- `UNKNOWN` → 必须人工逐条核验并写明证据，不得当作已验证。
- `exit 0 且无 UNKNOWN` → 可直接关闭；`exit 0 但含 UNKNOWN` → 人工核验通过后方可关闭。
- 权威条文见 `.workbuddy/TASK-GOVERNANCE.md` §6（项目专属约束）。

## Gate Mount Check（门禁挂载自检 · 硬规则 · 2026-11-07）

钩子已入库 `ebook-converter/scripts/hooks/`（`pre-commit` + `pre-push`），由 `core.hooksPath` 指向。**该配置是本机 git 配置、不入库**：新克隆/换机器后门禁不会自动生效。实质任务开始前必须跑：

```
node scripts/verify-hook-mount.mjs
```

- `exit 0`（PASS）→ 生效钩子与入库版本一致，可继续。
- `exit 1`（FAIL）→ 按脚本输出的修复命令执行一次：`git config core.hooksPath ebook-converter/scripts/hooks`，再复跑至 PASS。
- `exit 2`（UNKNOWN）→ 必须告警并写明不可判定原因，**不得声称「门禁已生效」**。
- 禁止把 `.git/hooks/` 里的旧副本当作挂载证据（hooksPath 生效时旧副本不执行）。自检脚本自带 `--self-test` 注入/恢复反向验证。
