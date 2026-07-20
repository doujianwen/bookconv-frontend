# Multica Agent Integration Skill

## Purpose
This skill ensures that every Codex agent session automatically synchronizes its work back to Multica issues. It creates a closed loop between code changes and issue tracking.

## When to Use
- **Always** when working on tasks related to Multica issues (EBO-xxx)
- **Always** when creating new features or fixing bugs tracked as issues
- **Always** at the end of any multi-step task

## Workflow

### Phase 1: Before Starting Work
1. Check if the task references an issue key (e.g., EBO-37)
2. If yes, update status to `in_progress`:
   ```bash
   node scripts/codex-multica-sync.js update-status EBO-37 in_progress
   ```
3. Read the issue description to understand requirements

### Phase 2: During Work
- Work on the code changes as usual
- If you discover sub-tasks, create new issues using templates:
  ```bash
  node scripts/codex-multica-sync.js create phase1-upload "描述" high
  ```

### Phase 3: After Completing Work
1. Verify your changes compile/test correctly
2. Write a brief summary of what was done
3. Mark the issue as done AND add a comment:
   ```bash
   echo "修复了 error-handler.ts，统一了 sanitizeError 和 mapErrorCode 到 5 个 API 路由" > /tmp/sync_summary.txt
   node scripts/codex-multica-sync.js complete EBO-37 /tmp/sync_summary.txt
   ```

## Commands Reference

| Command | Usage | Purpose |
|---------|-------|---------|
| `update-status` | `node scripts/codex-multica-sync.js update-status EBO-XX <status>` | Update issue status |
| `complete` | `node scripts/codex-multica-sync.js complete EBO-XX [summary-file]` | Mark done + add comment |
| `add-comment` | `node scripts/codex-multica-sync.js add-comment EBO-XX <file>` | Add comment without changing status |
| `list-pending` | `node scripts/codex-multica-sync.js list-pending` | Show all in-progress issues |

## Status Values
Valid statuses: `backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`

## Multi-Project Setup

To copy this skill to another project:

1. Copy the entire `multica-agent` directory to the new project's `.codex/skills/`
2. Ensure `scripts/codex-multica-sync.js` exists in the new project
3. Ensure `.multica-templates/issues/` templates exist
4. That's it — the skill will be automatically loaded by Codex

## Example Session

User: "Fix the error handler leakage in EBO-37"

Agent:
1. Reads EBO-37 from Multica
2. Runs: `node scripts/codex-multica-sync.js update-status EBO-37 in_progress`
3. Analyzes code, writes fix
4. Verifies TypeScript compiles
5. Runs: `node scripts/codex-multica-sync.js complete EBO-37`
6. Reports: "EBO-37 已完成，已更新状态并添加评论"

## Troubleshooting

- **"multica CLI not found"**: Make sure Multica Desktop app is running
- **"Permission denied"**: Check that `codex-multica-sync.js` has execute permissions
- **"Sync fails silently"**: Check the console output for error messages

---
*This skill is designed to be copied to any project. Just ensure the sync script and templates exist.*
