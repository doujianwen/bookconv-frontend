# Multica Agent Integration Template

This directory contains a reusable template for integrating Codex agents with Multica.

## How to Use in a New Project

1. Copy \`codex-multica-sync.js\` to your project's \`scripts/\` directory
2. Copy \`templates/\` to your project's \`.multica-templates/issues/\` directory
3. Copy the \`multica-agent\` skill to your project's \`.codex/skills/\` directory
4. Update the project ID in \`codex-multica-sync.js\` if needed
5. Done! Your Codex agent will now automatically sync to Multica

## Files Included

- \`codex-multica-sync.js\` — The sync script (auto-detects multica.exe path)
- \`templates/\` — Issue templates for different phases
- \`multica-agent-skill/SKILL.md\` — Instructions for Codex agents

## What This Enables

When a Codex agent works on an issue:
1. Automatically updates issue status to "in_progress" before starting
2. Adds detailed completion comments after finishing
3. Creates new issues from templates when discovering sub-tasks
4. Maintains a complete audit trail of who did what and when

This closes the loop between coding work and project management.
