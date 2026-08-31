# Codex-Multica 同步

## 概述

Codex（Claude Code）在执行 Multica Issue 相关工作时，通过 `scripts/codex-multica-sync.js` 自动同步状态。

**零外部依赖**：只需要 Node.js（系统自带），不依赖 bash/python/git-bash/Multica CLI PATH。

## 快速开始

### 在 Codex 中完成 Issue 后自动同步

完成工作后告诉 Codex：

```
完成 EBO-23 了，把状态更新为 done
```

Codex 会自动：
1. 调用脚本更新 Issue 状态
2. 添加完成总结评论

### 命令行用法

```bash
# 更新 Issue 状态
node scripts/codex-multica-sync.js update-status EBO-23 in_progress

# 标记完成
node scripts/codex-multica-sync.js complete EBO-23

# 添加评论
echo "已完成 Phase 8 的 en 翻译" > /tmp/msg.txt
node scripts/codex-multica-sync.js add-comment EBO-23 /tmp/msg.txt

# 列出待办
node scripts/codex-multica-sync.js list-pending

# 从模板创建 Issue
node scripts/codex-multica-sync.js create phase1-upload "电子书格式转换" high
```

## 命令参考

| 命令 | 用法 | 说明 |
|------|------|------|
| `update-status` | `<key> <status>` | 更新 Issue 状态 |
| `add-comment` | `<key> <file>` | 向 Issue 添加评论 |
| `complete` | `<key> [summary-file]` | 标记 done + 可选总结评论 |
| `create` | `<template> [agent] [priority]` | 从模板创建 Issue |
| `list-pending` | `[--project <id>]` | 列出进行中的 Issue |

**Issue Key 格式**：支持 `EBO-23` 或完整 UUID，自动解析。

**有效状态**：`backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`

**有效优先级**：`none`, `low`, `medium`, `high`, `urgent`

## 权限配置

确保 `.claude/settings.json` 中包含：

```json
{
  "permissions": {
    "allow": [
      "Bash(node scripts/codex-multica-sync.js *)"
    ]
  }
}
```

## 迁移到其他电脑

只需两步：

1. **克隆项目** — 所有依赖都在仓库里
2. **确保 Node.js 可用** — Windows 11 自带，Mac/Linux 通常自带

不需要安装 Multica CLI、Python、Git Bash 等额外工具。脚本会自动检测 multica 可执行文件。
