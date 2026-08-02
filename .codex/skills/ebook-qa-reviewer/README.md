# Ebook QA Reviewer Skill

This is a pure error correction (critic/verifier) agent tailored for the ebook format conversion project. It follows the principles outlined in the 纯纠错智能体.md document, adapted for this specific codebase.

## Usage

### In GitHub Actions
`yaml
- name: Run QA Reviewer Agent
  run: |
    cd ebook-converter
    npm ci
    npx ts-node scripts/qa/run-qa-reviewer.ts --target pr
`

### Checking Results
The script outputs a JSON report at results/qa-report.json with:
- Pass/Warn/Fail status for each check item
- A conclusion (passed/failed) suitable for CI exit codes
- Detailed locations of any violations

## Check Categories
Category | Focus Area | Critical Issues Prevent Merge
A | Tech Stack Compliance | Wrong library usage, framework violations
B | Code Quality | Missing error handling, type safety
C | SEO | Missing structured data, keyword coverage
D | Security | File upload vulnerabilities, XSS
E | Calibre Conversion | Command injection, output validation
F | Deployment | Env vars, health checks, logging

## See Also
- 纯纠错智能体.md - Original source document defining pure critic agents
- 电子书转换工具站 — 从零到一完整规划.md - Project's master planning document
- ebook-converter/DEPLOYMENT.md - Deployment requirements
