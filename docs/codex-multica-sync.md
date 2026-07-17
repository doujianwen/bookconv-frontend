# Codex-Multica 双向同步

## 概述

Codex（Claude Code）在执行 Multica Issue 相关工作时，通过以下机制自动同步状态：

1. **会话开始** — 自动列出所有 pending 的 Issue，让 Codex 知道当前要做什么
2. **会话中** — 每个文件改动自动关联到 Issue（通过 commit message 或注释）
3. **会话结束** — 自动更新 Issue 状态为 done，并添加完成总结评论

## 快速开始

### 在 Codex 中完成 Issue 后自动同步

当你完成一个 Issue 的工作后，直接告诉 Codex：

```
完成 EBO-23 了，把状态更新为 done
```

Codex 会自动：
1. 调用 `multica issue status` 更新状态
2. 生成完成总结
3. 通过 `multica issue comment add` 添加到 Issue

### 手动触发同步

```bash
# 更新 Issue 状态
bash scripts/codex-multica-sync.sh update-status EBO-23 in_progress

# 标记完成
bash scripts/codex-multica-sync.sh complete EBO-23

# 添加评论
echo "已完成 Phase 8 的 en 翻译" > /tmp/msg.txt
bash scripts/codex-multica-sync.sh add-comment EBO-23 /tmp/msg.txt

# 列出待办
bash scripts/codex-multica-sync.sh list-pending
```

## 双向同步原理

### Codex → Multica（主动同步）

```
Codex 完成工作
    ↓
自动更新 Issue status (done/in_progress/todo)
    ↓
添加完成评论（总结做了什么）
    ↓
更新 metadata（记录完成时间、消耗的 token 等）
```

### Multica → Codex（被动触发）

通过 Multica Autopilot 或 Squad 机制：
- 用户在 Multica 创建/更新 Issue
- Agent 收到通知（通过 chat 或 webhook）
- Codex 自动开始工作

## 权限配置

确保 `.claude/settings.json` 中有以下权限：

```json
{
  "permissions": {
    "allow": [
      "Bash(bash scripts/codex-multica-sync.sh *)"
    ]
  }
}
```

## 模板系统

已有的 Phase 模板位于 `.multica-templates/issues/`，可以直接用：

```bash
bash scripts/codex-multica-sync.sh create phase8 电子书格式转换 high
```

这会从 `phase8.md` 模板创建一个新的 Issue。
