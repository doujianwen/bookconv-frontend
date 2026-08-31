# Codex–Multica Sync

## Overview

When Codex (Claude Code) works on Multica Issues, it auto-syncs status via `scripts/codex-multica-sync.js`.

**Zero external dependencies**: only Node.js (preinstalled on the system) is needed — no bash/python/git-bash/Multica CLI PATH dependency.

## Quick Start

### Auto-sync after finishing an Issue in Codex

After finishing work, tell Codex:

```
Finished EBO-23, update its status to done
```

Codex will automatically:
1. Call the script to update the Issue status
2. Add a completion summary comment

### CLI usage

```bash
# Update an Issue status
node scripts/codex-multica-sync.js update-status EBO-23 in_progress

# Mark complete
node scripts/codex-multica-sync.js complete EBO-23

# Add a comment
echo "Finished Phase 8 en translation" > /tmp/msg.txt
node scripts/codex-multica-sync.js add-comment EBO-23 /tmp/msg.txt

# List pending
node scripts/codex-multica-sync.js list-pending

# Create an Issue from a template
node scripts/codex-multica-sync.js create phase1-upload "Ebook format conversion" high
```

## Command Reference

| Command | Usage | Description |
|---------|-------|-------------|
| `update-status` | `<key> <status>` | Update an Issue's status |
| `add-comment` | `<key> <file>` | Add a comment to an Issue |
| `complete` | `<key> [summary-file]` | Mark done + optional summary comment |
| `create` | `<template> [agent] [priority]` | Create an Issue from a template |
| `list-pending` | `[--project <id>]` | List in-progress Issues |

**Issue Key format**: supports `EBO-23` or a full UUID, auto-resolved.

**Valid statuses**: `backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`

**Valid priorities**: `none`, `low`, `medium`, `high`, `urgent`

## Permission Configuration

Make sure `.claude/settings.json` includes:

```json
{
  "permissions": {
    "allow": [
      "Bash(node scripts/codex-multica-sync.js *)"
    ]
  }
}
```

## Migrating to Another Machine

Just two steps:

1. **Clone the project** — all dependencies live in the repo
2. **Ensure Node.js is available** — Windows 11 ships it; Mac/Linux usually have it

No need to install the Multica CLI, Python, Git Bash, or other extra tooling. The script auto-detects the multica executable.
