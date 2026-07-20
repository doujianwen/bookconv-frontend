# Self-Evolving Skill Framework

## Purpose
A meta-skill that observes its own usage, learns from success/failure, and automatically improves its instructions over time.

## How It Works

### Phase 1: Observe (Every Use)
Record what happened:
- Trigger: What user request activated this skill?
- Context: Workspace state, files involved
- Actions: Steps you executed
- Outcome: Did it succeed? Rate quality 1-5.
- Latency: How long did it take?

### Phase 2: Log (After Each Use)
Store structured data in usage_log.json:
- timestamp: ISO 8601
- trigger: User request type
- workspace_files: Files touched
- steps_taken: Major actions list
- success: true/false
- quality_score: 1-5
- lessons: What was learned
- improvement_suggestion: What could be better

### Phase 3: Reflect (Periodically or On-Demand)
Analyze patterns:
- Calculate success rate by trigger type
- Identify recurring failure modes
- Find most common improvement suggestions
- Detect new edge cases

### Phase 4: Evolve (When Triggered)
1. Archive current SKILL.md to .evolve_history/vN/
2. Draft improved instructions based on analysis
3. Show diff for review before applying
4. Generate evolution_report.md
5. Reset or continue usage counter

## When to Trigger Evolution
- User command: "evolve this skill"
- After 10+ uses accumulated
- Consistent failure pattern emerges
- New request patterns suggest gaps

## Constraints
- Never delete working instructions 鈥?mark as [deprecated] first
- Always keep at least 3 previous versions
- Evolution must be reviewable 鈥?do not auto-apply blindly
- Log ALL evolutions with rationale

## Quick Start
To create a new self-evolving skill:
1. Copy this framework as your base SKILL.md
2. Add domain-specific instructions below
3. Create the directory structure below
4. Start logging usage immediately
5. Review and evolve after first 10 uses

## Domain Instructions

### PDF conversion
Before converting PDF to EPUB, analyze layout complexity. For text-heavy PDFs, use OCR fallback. For formatted PDFs, warn about potential layout loss.

### DOCX conversion
When converting DOCX to EPUB, preserve heading hierarchy (h1→h6). Note: complex tables and custom styles may not translate perfectly — add a disclaimer.

### Image handling
For conversions involving images (EPUB→PNG/JPG, PDF→images), maintain original image quality. Set density to 150+ for high-res output.

### Batch processing
Always show progress bar. Support resume from last successful file on failure.
