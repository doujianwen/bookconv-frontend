# Project Documentation Center

This directory is the unified documentation center for the BookConv project, organized by purpose into subdirectories. **As of 2026-08-10, `ebook-converter/docs/` was fully merged into this directory** — this is the only docs root in the project.

> **Language / 语言**: This `README.md` and the docs under `docs/` are the **English-primary** set. The complete **Chinese** archive lives in [`docs/zh/`](./zh/README.md). New docs should default to English; the `/zh/` tree is the preserved full-Chinese history.

## Directory Structure

```
docs/
├── README.md                 # This file: unified English-primary entry & index
├── content-standards.md      # Content production standards (blog / guide / convert)
├── tech/                    # Technical docs & new-contributor onboarding (English)
├── ops/                     # Backlink / SEO operations war room (English)
└── zh/                      # Full Chinese archive (preserved history)
```

> **Note on `content/`:** An earlier index referenced a `docs/content/` folder with `.mdx` content guides (e.g. `background-workers.mdx`, `sitemap-seo-guide.mdx`). **Those files are not present in the repository** — the content-production standards now live in [`content-standards.md`](./content-standards.md). The `content/` directory should be created once those guides are written.

## `content-standards.md` — Content Production Standards

| File | Purpose |
|------|---------|
| [`content-standards.md`](./content-standards.md) | Unified standard for blog / guide / conversion-page production; onboarding reference for new contributors (architecture, writing, internal links, SEO/GEO, i18n, quality gate) |

## `tech/` — Technical Docs & Onboarding (English)

| File | Purpose |
|------|---------|
| [`tech/getting-started.md`](./tech/getting-started.md) | New-contributor onboarding overview |
| [`tech/deploy-github-to-vercel.md`](./tech/deploy-github-to-vercel.md) | GitHub → Vercel deployment flow |
| [`tech/internal-linking-rules.md`](./tech/internal-linking-rules.md) | Internal-linking optimization rules |
| [`tech/weekly-guide-loop.md`](./tech/weekly-guide-loop.md) | Weekly guide-production loop SOP |
| [`tech/weekly-guide-loop-2026-08-10.md`](./tech/weekly-guide-loop-2026-08-10.md) | Weekly guide-production loop SOP (dual-track, merged 2026-08-10) |
| [`tech/upstash-setup-guide.md`](./tech/upstash-setup-guide.md) | Upstash / Redis setup guide |
| [`tech/serp-competitor-analysis.md`](./tech/serp-competitor-analysis.md) | SERP competitor analysis & page-optimization methodology |

## `ops/` — Backlink / SEO Operations (English)

| File | Purpose |
|------|---------|
| [`ops/weekly_checklist.md`](./ops/weekly_checklist.md) | Weekly operations checklist (Mon–Fri + monthly) |
| [`ops/backlink-tools-index.md`](./ops/backlink-tools-index.md) | Backlink tooling index — maps the 92 `scripts/` + backlink docs |
| [`ops/ops-scheduling.md`](./ops/ops-scheduling.md) | Operations-audit scheduling plan (crontab / GitHub Actions SSH) — ⚠️ reconstructed from a corrupted source, verify against `zh/` |
| [`ops/server-recommendations.md`](./ops/server-recommendations.md) | Deployment server selection guide (Vercel / Hetzner / Aliyun / DO / Railway) — ⚠️ reconstructed from a corrupted source, verify against `zh/` |

> The remaining internal ops docs (promotion plans, competitor recon, submission copies, email templates, phased plans, archived backlink drafts) are kept in Chinese only under [`docs/zh/ops/`](./zh/ops/). They are operational records not yet translated.

## `zh/` — Full Chinese Archive

[`docs/zh/README.md`](./zh/README.md) is the complete Chinese documentation center (original README + `content-standards.md` + `tech/` + `ops/`). It is preserved as the authoritative Chinese history and will be kept in sync with structural changes.

## Security Note

`submissions/` (referenced in the original index) holds backlink-submission records (JSON + screenshots) that may contain accounts and submission credentials. **That directory is in `.gitignore` and is not version-controlled** — kept locally for ops reference only. Do not manually `git add` it.
