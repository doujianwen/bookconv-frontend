# Self-Evolving Skill System

## Overview
A skill that observes its own usage, learns from success/failure, and automatically improves its instructions over time.

## Architecture

    self-evolve/
    ├── SKILL.md                    # Meta-instructions (evolves)
    ├── README.md                   # This file
    ├── usage_log.json              # Structured usage records
    ├── evolution_report.md         # Summary of improvements
    └── .evolve_history/             # Version archive
        ├── v1/                     # Initial version
        └── ...

## How It Works

### Phase 1: Observe
Every time the skill is used, capture:
- What triggered it?
- What steps were taken?
- Did it succeed? Rate quality 1-5.
- What lessons were learned?

### Phase 2: Log
Store structured data in usage_log.json. Each entry includes:
- Timestamp, trigger, files touched
- Steps executed, outcome, quality score
- Lessons learned and improvement suggestions

### Phase 3: Reflect
After enough data accumulates (or on demand):
1. Calculate success rate by pattern
2. Identify failure modes
3. Find recurring improvement suggestions
4. Draft instruction changes

### Phase 4: Evolve
1. Archive current SKILL.md to .evolve_history/vN/
2. Apply tested improvements
3. Generate evolution report
4. Reset usage counter (or keep for continuous learning)

## Triggering Evolution

Manually request: **evolve this skill** or **run evolution cycle**

The system will:
1. Analyze all logs since last evolution
2. Propose specific instruction changes
3. Show you the diff before applying
4. Ask for confirmation

## Example Evolution Cycle

Before evolution:
- Success rate: 60%
- Common failure: Edge case with special characters

After evolution:
- Success rate: 85%
- New handling added for Unicode filenames
- Deprecated: Overly verbose error messages

## This Is a Living System

The skill instructions themselves evolve. The more you use it, the better it gets.

**Key insight**: Self-improvement is not about being perfect initially — it is about having a robust feedback loop that gets sharper over time.
