# Backlink Tooling Index

> Generated: 2026-08-09 (updated 2026-08-10: `ebook-converter/docs/` merged into root `docs/`)
> Purpose: Connect the scattered backlink tools / docs / records across three layers into one actionable map, eliminating duplication, dead code, and broken references.
> Companion docs (5 main backlink docs, all in `docs/ops/`): `外链推广完整方案_20260804.md` (master plan, most complete), `外链资源完整清单.md` (real submission log + P0–P3 tiers), `外链提交报告_20260809.md` (strategy & this week's execution plan), `submit_copies.md` (full submission-copy library), and this index (tool/doc map). Iteration drafts/fragments archived to `_archived_backlink/`.

---

## 0. Real Distribution of Backlink Tooling (before consolidation)

| Location | Content | Status |
|----------|---------|--------|
| `docs/ops/` | Backlink war room: resource list, promotion plan ×2, competitor analysis, 32KB submission-copy template, email template, weekly checklist, phased plan, scheduling notes | Mostly **untracked** (only some committed); the true source of backlink knowledge |
| `scripts/` (repo root) | 92 scripts: recon / submission / search / asset generation / project management | 75 tracked; **all submission-type scripts use placeholder config** |
| `ebook-converter/` root | (pre-merge) 2 orphan scripts `submit_directories.js` + `check_sites.js` | **Moved away** (see §4) |
| `ebook-converter/docs/外链提交报告_20260809.md` | Strategy doc; §5 tracking table was empty, wrong reference path | ✅ Merged into `docs/ops/` (2026-08-10) |

**Core problems**
1. Scattered across three layers, no single entry point.
2. The 2 scripts in `ebook-converter/` root are **duplicate copies** of the parent `scripts/` suite, using placeholder domains.
3. The strategy doc referenced `docs/ops/外链资源完整清单.md` with a relative path that didn't resolve from `ebook-converter/docs/` (should be `../../docs/ops/...`) — **resolved by the 2026-08-10 directory merge** (docs moved to the same level as `docs/ops/`).
4. **Config gap (partially fixed)**: all original "real submission" scripts hardcoded `DOMAIN='https://yourdomain.com'`, **none pointed at `bookconv.com`**. After consolidation, 6 genuinely-submitting scripts now read `process.env.BOOKCONV_DOMAIN` (placeholder fallback); remaining config/check-type scripts (betalist/beta_content/prepare_betalist/quick_check) and archived orphans still use placeholders, but they are not on the direct submission path.

---

## 1. `scripts/` Script Classification (92, by purpose)

### A. Backlink submission (Playwright / direct HTTP) — ⚠️ all placeholder domains, must reconfigure before running
`auto_submit_techasoft.js`, `betalist.js`, `betalist_submit.js`, `prlog_submit.js`, `prlog_pw.js`, `prlog_api2.js`, `prlog_links.js`, `pw_*` (`pw_real_submit` / `pw_startupstash`(+2) / `pw_submitsaas` / `pw_betalist` / `pw_prlog` / `pw_future*` / `pw_effortless` / `pw_external_dirs` / `pw_goodai` / `pw_high_value` / `pw_more_dirs` / `pw_active_search` / `pw_batch`(+check) / `pw_check` / `pw_dir_check`), `submit_ft.js`, `submit_ft_fast.js`, `submit_futuretools.js`, `update_submissions.js`

### B. Recon / site check (find submission forms, detect Cloudflare)
`check_*` (`check_dirs` / `check_more_dirs` / `check_more_sites` / `check_forms`(+2) / `check_form_detail` / `check_accessible`(+dirs) / `check_ai_*` / `check_aitools` / `check_free_dirs` / `check_prlog_betalist` / `check_startups` / `check_submit`(+links/urls) / `check_techasoft` / `check_theresanai` / `check_toolify_future`), `cf_*` (`cf_bypass_v2`/`v3`/`cf_firefox`/`cf_http_check`), `find_*` (`find_forms`/`find_submit_pages`), `quick_check` / `quick_dir_check` / `deep_check` / `cache_check` / `search_dirs.js`

### C. Search (SerpAPI / Brave, env-ified, safe)
`brave_search.js` / `brave_search2.js` / `brave_v2.js` (read `process.env.BRAVE_API_KEY`)

### D. Reporting / analysis
`final_analysis.js`, `read_report.js`, `write_report.js` / `write_report2.js`, `write_final.js`, `write_final_report.js`

### E. Asset / Logo / OG-image generation (**not backlink tools**)
`beta_content.js` / `beta_logo.js` / `convert_beta.js` / `convert_png.js` / `convert_to_png.js` / `copy_logo.js` / `create_logos.js` / `create_og.js`(+2/+3) / `check_svg.js` / `list_svgs.js` / `install_sharp.js` / `prepare_betalist.js` / `resize_logo.js`(+2/+3) / `check_magick.js` / `techasoft_detail.js`

### F. Project management / audit / testing (**not backlink tools**)
`codex-multica-sync.js` (Multica task sync), `ai-audit.js` / `audit.sh`, `test_cf_bypass.js` / `test_prlog_api.js` / `test_svg.js`

> Note: A/B/C/D are backlink tools (~65); E/F are asset-generation and general scripts (~27), mixed into the same `scripts/` dir — recommend splitting into `scripts/backlink/` and `scripts/assets/` later.

---

## 2. Config Status Audit

| Metric | Count | Note |
|--------|-------|------|
| Hardcoded secrets (sk-/Bearer/api_key) | **0** | ✅ Safe, env-ified |
| Uses `process.env` (search/audit types) | 7 | ✅ brave_search×3, check_more_dirs, search_dirs, ai-audit, codex-sync |
| Still uses placeholder `yourdomain.com` | 6 | ⚠️ 4 config/check-type (betalist/beta_content/prepare_betalist/quick_check) + 2 archived orphans; real submission scripts are env-ified (see §4.4) |
| References real `bookconv` | 3 | ⚠️ Only `betalist.js`/`beta_content.js`/`prepare_betalist.js`, but all three **still contain the placeholder domain too** — i.e. not truly wired up |

**Conclusion**: search/recon scripts can run safely; the 6 submission scripts are env-ified — **set `BOOKCONV_DOMAIN`/`BOOKCONV_EMAIL` before running to target the real domain**; without env they fall back to placeholder without crashing.

---

## 3. Real Submission Log (summary; full version in `外链资源完整清单.md`)

Succeeded (5): BetaList, StartupProject, ActiveSearch, FutureTools, StartupStash
Manual pending (4): ListingBott (Cloudflare), BacklinkCRM (newsletter only), GrowPad (cookie form), SerpMaestro (no form)
Failed (1): ADirectory (timeout / blocked)

> Current cadence follows memory 6.1's "homepage-first" rule: backlink landing URLs should uniformly point to `https://www.bookconv.com/`, no internal-page pushes for now.

---

## 4. Consolidation Actions Already Taken (2026-08-09)

1. **Moved 2 orphan scripts**: `ebook-converter/submit_directories.js`, `ebook-converter/check_sites.js` → `scripts/_legacy_orphan_backlink/` (kept for rollback, clears root dead code; both were duplicate copies of the parent `scripts/` suite with placeholder config).
2. **Fixed strategy-doc reference**: `ebook-converter/docs/外链提交报告_20260809.md`'s reference to `docs/ops/外链资源完整清单.md` changed to the correct `../../docs/ops/外链资源完整清单.md`. **2026-08-10: that doc was fully merged into `docs/ops/`, reference changed to same-level `./`.**
3. **Filled strategy-doc §5 tracking table**: the previously empty table now carries the real records from §3 above (landing page = homepage, anchor text = BookConv).
4. **Env-ified real submission scripts (focused)**: 6 genuinely-submitting scripts now read `process.env.BOOKCONV_DOMAIN` / `BOOKCONV_EMAIL`, keeping placeholder fallback (`auto_submit_techasoft`/`betalist_submit`/`pw_real_submit`/`pw_submit_activesearch`/`submit_ft`/`submit_futuretools`); `node --check` syntax validation all passed. Config/check-type scripts (betalist/beta_content/prepare_betalist/quick_check) and archived orphans not yet changed.
5. **Backlink-doc consolidation (2026-08-12)**: `docs/ops/` backlink docs de-duplicated from 9 to **5 main + 4 archived**. Archived (`_archived_backlink/`, renamed not deleted, rollback-safe): `外链推广整合方案_20260804.md` (early master-plan iteration), `竞品外链分析与推广计划.md`+`_part1.md` (upstream material/fragments absorbed by master plan), `提交文案.md` (subset of submit_copies). Verified the master plan already contains an ROI section and self-describes as "consolidated from 17 docs" — zero information loss in archiving.

---

## 5. Suggested Further Consolidation (optional, do after confirmation)

- [x] Change "real submission" scripts' `DOMAIN`/`CONTACT_EMAIL` to read `process.env.BOOKCONV_DOMAIN` / `BOOKCONV_EMAIL` with placeholder fallback (6 done: auto_submit_techasoft/betalist_submit/pw_real_submit/pw_submit_activesearch/submit_ft/submit_futuretools). Config/check-type not changed — still confirm domain manually before running.
- [ ] Split `scripts/`: `backlink/` (A–D), `assets/` (E), `ops/` (F), each with a README.
- [ ] `git add` untracked `docs/ops/` docs as needed (resource list, promotion plan, copy template are the true backlink source — recommend version control).
- [ ] Push the 4 "manual pending" items in the resource list to completion and write back to the tracking table.
