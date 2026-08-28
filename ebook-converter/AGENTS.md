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
