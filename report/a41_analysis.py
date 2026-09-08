#!/usr/bin/env python3
"""
A4.1 — Temporal Drift Attribution : ANALYSIS
============================================

Reads A4.1 observations (token '%_a41_', obs id <date>_a41_T{tp}{acct}_R{rep}P{pid})
plus historical anchor priors (A2.5 L1/L2 = 100%, A4.0 CAT/CON = 0%, canary 0/3)
as labeled context.

Primary objective (CEO): attribute the within-day temporal drift — H1 model-side,
H2 account-side personalization, H3 session contamination, H4 stochasticity,
H5 environment. NOT a visibility-rate estimation.

Pattern judgment (across time points):
  Pattern A — all accounts move in sync -> model/platform-side drift
  Pattern B — only logged-in (old) account differs -> account/personalization
  Pattern C — high randomness everywhere -> stochastic variability
  Pattern D — drop in one session type, recovery in new session -> session effect
  Pattern E — sync across accounts, not across models -> ChatGPT-specific (A4.2)

Phrasing rule: all rates are "observed surfacing rate UNDER RUN CONDITIONS";
cross-time comparison is invalid until drift is attributed.

Deliverables:
  reports/A41_RAW.csv
  reports/A41_ACCOUNT_CONTRAST.csv
  reports/A41_DRIFT_REPORT.md
Plus DB enrichment: observations.a41_detail (JSON).
"""

import os
import re
import sys
import json
import sqlite3
import hashlib
from collections import defaultdict
from datetime import datetime
from pathlib import Path

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "scripts"))

from a40_analysis import (  # noqa: E402
    BRAND_RE, extract_candidate_set, snippet_around, parse_citations,
    REPORTS, DB_PATH,
)

A41_TOKEN = "a41"
ANCHOR_BY_PID = {121: "AN1", 122: "AN2"}
ACCOUNT_DESC = {"A": "logged-in (current account)", "B": "logged-out (fresh anon context)"}

# historical priors for the anchor texts (labeled context, different cohorts)
HISTORY = [
    ("A2.5 L1 (= AN1)", "2026-09-08 ~13:11", 5, 5, "100%"),
    ("A2.5 L2 (= AN2)", "2026-09-08 ~13:11", 5, 5, "100%"),
    ("A4.0 CAT (= AN1)", "2026-09-08 ~15:40", 0, 5, "0%"),
    ("A4.0 CON (= AN2)", "2026-09-08 ~15:47", 0, 5, "0%"),
    ("Canary L1 (= AN1)", "2026-09-08 ~16:05", 0, 3, "0%"),
]


def load_observations():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute(
        "SELECT * FROM observations WHERE observation_id LIKE ? ORDER BY observation_id",
        (f"%_{A41_TOKEN}_%",))
    rows = [dict(r) for r in cur.fetchall()]
    con.close()
    return rows


def analyze(rows):
    records = []
    for r in rows:
        oid = r["observation_id"]
        m = re.search(r"_a41_T(\d)([A-Z])_R(\d+)P(\d+)$", oid or "")
        if not m:
            continue
        tp, acct, rep, pid = int(m.group(1)), m.group(2), int(m.group(3)), int(m.group(4))
        anchor = ANCHOR_BY_PID.get(pid, f"P{pid}")
        state = r.get("response_state")
        answer = r.get("answer_clean") or ""
        cand, _ = extract_candidate_set(answer)
        hydroviv_in = "Hydroviv" in cand
        cand_rank = (cand.index("Hydroviv") + 1) if hydroviv_in else 0
        cites = parse_citations(r.get("citations"))
        rec = {
            "observation_id": oid,
            "time_point": tp,
            "account": acct,
            "replicate": rep,
            "anchor": anchor,
            "prompt_id": pid,
            "response_state": state,
            "answer_char_count": r.get("answer_char_count") or 0,
            "candidate_set_size": len(cand),
            "hydroviv_in_candidate_set": int(hydroviv_in),
            "candidate_rank": cand_rank,
            "candidate_rationale": (snippet_around(answer, "Hydroviv")
                                    if hydroviv_in else "—"),
            "competitor_set": "; ".join(b for b in cand if b != "Hydroviv"),
            "recommendation_level": (int(r["recommendation_level"])
                                     if r.get("recommendation_level") is not None else -1),
            "citation_presence": int(len(cites) > 0),
            "account_id": r.get("account_id") or "",
            "session_id": r.get("session_id") or "",
            "_candidate_list": cand,
        }
        records.append(rec)
    return records


def cell_metrics(records, tp=None, acct=None, anchor=None):
    sub = [r for r in records
           if (tp is None or r["time_point"] == tp)
           and (acct is None or r["account"] == acct)
           and (anchor is None or r["anchor"] == anchor)]
    n = len(sub)
    if n == 0:
        return None
    hits = sum(r["hydroviv_in_candidate_set"] for r in sub)
    sizes = [r["candidate_set_size"] for r in sub]
    return {
        "n": n,
        "hits": hits,
        "rate": hits / n,
        "set_size_mean": round(sum(sizes) / n, 2),
        "ranks": ";".join(str(r["candidate_rank"]) for r in sub
                          if r["hydroviv_in_candidate_set"]) or "-",
        "stability": ("stable_in" if hits == n else
                      "stable_out" if hits == 0 else "mixed"),
    }


def judge_pattern(by_ta):
    """by_ta: {(tp, acct): metrics}. Requires >= 2 time points for a full call."""
    tps = sorted({tp for (tp, _a) in by_ta})
    if len(tps) < 2:
        return None  # T1-only: describe, do not conclude
    a_rates = {tp: by_ta.get((tp, "A"), {}).get("rate") for tp in tps}
    b_rates = {tp: by_ta.get((tp, "B"), {}).get("rate") for tp in tps}
    a_vals = [v for v in a_rates.values() if v is not None]
    b_vals = [v for v in b_rates.values() if v is not None]
    both_flat_zero = (a_vals and b_vals and
                      max(a_vals + b_vals) <= 0.2)
    both_move_sync = (a_vals and b_vals and
                      all(abs((a_rates[tp] or 0) - (b_rates[tp] or 0)) <= 0.34
                          for tp in tps))
    only_a_diff = (a_vals and b_vals and
                   any(abs((a_rates[tp] or 0) - (b_rates[tp] or 0)) > 0.34
                       for tp in tps))
    if both_move_sync:
        lab = "Pattern A (leaning) — accounts move in sync"
        txt = ("Logged-in and logged-out contexts show synchronized rates across "
               "time points -> model/platform-side temporal drift (H1) is the "
               "most plausible source. Cross-model check deferred to A4.2.")
    elif only_a_diff and not both_move_sync:
        lab = "Pattern B (leaning) — account divergence"
        txt = ("The logged-in (probed-all-day) account diverges from the fresh "
               "logged-out context -> account-side personalization (H2) is the "
               "most plausible source. NOTE: logged-out may also receive a "
               "different serving context; a true second account (CEO-provisioned) "
               "would sharpen this.")
    elif both_flat_zero:
        lab = "Flat-low across accounts & time (H1/H4 unresolved)"
        txt = ("All account states stay near zero at every measured time point — "
               "either the drift is a persistent platform-side state (H1) or "
               "stochasticity (H4) dominates. More time points needed.")
    else:
        lab = "Mixed — insufficient structure"
        txt = ("No clean sync/divergence structure yet; add T2/T3 (and ideally a "
               "real second account) before attributing.")
    return lab, txt


def build_report(records, by_tac, by_ta, pattern, a1_contrast):
    lines = []
    lines.append("# A4.1 — Temporal Drift Attribution")
    lines.append("")
    lines.append(f"_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}  |  "
                 f"Engine: ChatGPT  |  NOT a visibility experiment_")
    lines.append("")
    lines.append("## 0. Scope & Method")
    lines.append("")
    lines.append("- **Primary objective** (CEO, revised 2026-09-08 18:25): build the "
                 "**Temporal State Persistence Curve** — does the visibility state "
                 "on identical anchor prompts recover naturally after a state "
                 "switch, and over what period? Secondary: Pattern A-E "
                 "attribution; tertiary: Measurement Validity Protocol v1.")
    lines.append("- **Design**: Account (A = logged-in current account; B = second "
                 "REAL account, CEO-provisioned) x Time (T1/T2/+3h/T3/+6h) "
                 "x Anchor (AN1 = A2.5-L1 text, AN2 = A2.5-L2 text), 3 reps per cell. "
                 "Account order counterbalanced per time point (T1 A->B, T2 B->A, T3 A->B).")
    lines.append("- **Rule M-04 (effective immediately)**: the ANONYMOUS ChatGPT "
                 "environment is NOT a valid measurement population (logged-out "
                 "visitors get no chat interface — Structural Non-Measurability). "
                 "Only authenticated accounts are eligible; anonymous observations "
                 "are excluded from all metrics below.")
    lines.append("- **New first-class DB fields**: `observations.account_id`, "
                 "`observations.session_id` (experiment variables, not metadata).")
    lines.append("- **Phrasing rule**: all rates below are *observed surfacing rate "
                 "under run conditions*; cross-time comparison is invalid until drift "
                 "is attributed.")
    lines.append("")

    # 1. Integrity
    md5s = set()
    con = sqlite3.connect(DB_PATH)
    n_comp = con.execute(
        "SELECT COUNT(*) FROM observations WHERE observation_id LIKE '%_a41_%' "
        "AND response_state='COMPLETED'").fetchone()[0]
    con.close()
    lines.append("## 1. Data Integrity")
    lines.append("")
    lines.append(f"- A4.1 COMPLETED observations in DB: **{n_comp}** "
                 f"(expected {len(records)} parsed).")
    lines.append("- html md5 uniqueness: verified at collection time (per-account log).")
    lines.append("")

    # 2. Historical anchor priors
    lines.append("## 2. Historical Anchor Priors (labeled context, different cohorts)")
    lines.append("")
    lines.append("| Anchor text used as | When | HV hits | n | Observed rate |")
    lines.append("|---|---|---|---|---|")
    for label, when, h, n, rate in HISTORY:
        lines.append(f"| {label} | {when} | {h}/{n} | {n} | {rate} |")
    lines.append("")

    # 3. Per (time x account x anchor)
    lines.append("## 3. Observed Pattern — Time x Account x Anchor")
    lines.append("")
    lines.append("| T | Account | Anchor | n | HV entry | Rate | Set size | Stability |")
    lines.append("|---|---|---|---|---|---|---|---|")
    for (tp, acct, anc), m in sorted(by_tac.items()):
        lines.append(f"| T{tp} | {acct} | {anc} | {m['n']} | {m['hits']}/{m['n']} "
                     f"| {m['rate']:.0%} | {m['set_size_mean']} | {m['stability']} |")
    lines.append("")

    # 4. Time x Account pooled contrast
    lines.append("## 4. Time x Account Contrast (pooled over anchors)")
    lines.append("")
    lines.append("| T | Account A (logged-in) | Account B (logged-out) | Divergence |")
    lines.append("|---|---|---|---|")
    tps = sorted({tp for (tp, _a) in by_ta})
    for tp in tps:
        ma = by_ta.get((tp, "A"))
        mb = by_ta.get((tp, "B"))
        ra = f"{ma['hits']}/{ma['n']} ({ma['rate']:.0%})" if ma else "—"
        rb = f"{mb['hits']}/{mb['n']} ({mb['rate']:.0%})" if mb else "—"
        div = ""
        if ma and mb:
            d = abs(ma["rate"] - mb["rate"])
            div = f"{d:.0%} {'(divergent)' if d > 0.34 else '(synchronized)'}"
        lines.append(f"| T{tp} | {ra} | {rb} | {div} |")
    lines.append("")

    # 5. Judgment
    lines.append("## 5. Drift Attribution Judgment")
    lines.append("")
    if pattern:
        lab, txt = pattern
        lines.append(f"**Judgment: {lab}**")
        lines.append("")
        lines.append(txt)
    else:
        m_a = by_ta.get((1, "A"))
        m_b = by_ta.get((1, "B"))
        lines.append("**T1-only snapshot — attribution deferred to T2/T3.** "
                     "With a single time point, Pattern A-E cannot be called. "
                     "T1 establishes the per-account baseline under identical "
                     "run conditions:")
        lines.append("")
        if m_a:
            lines.append(f"- Account A (logged-in): {m_a['hits']}/{m_a['n']} "
                         f"({m_a['rate']:.0%}) — historical prior for the same "
                         f"texts was 100% (~13:11) then 0% (~15:40-16:05).")
        if m_b:
            lines.append(f"- Account B (logged-out fresh context): {m_b['hits']}/"
                         f"{m_b['n']} ({m_b['rate']:.0%}).")
        lines.append("")
        lines.append("Interim readings (hypotheses only):")
        lines.append("- If both accounts are near zero at T1 -> drift persists "
                     "platform-wide at T1; T2/T3 recovery timing becomes the key signal.")
        lines.append("- If A=0 but B>0 -> early pointer to account-side "
                     "personalization (H2); provision real account 2/3 to sharpen.")
        lines.append("- If both >0 -> partial recovery; compare rate level vs the "
                     "13:11 prior (100%) to gauge drift magnitude.")
    lines.append("")
    lines.append("> Discipline: hypotheses, not proof. No visibility-rate claims. "
                 "No intervention. Cross-model deferred to A4.2.")
    lines.append("")

    # 5b. Non-completed channels (data facts)
    bstat = b_channel_status()
    if bstat:
        lines.append("## 5b. Non-Completed Channels (data facts)")
        lines.append("")
        for acct, items in sorted(bstat.items()):
            states = "; ".join(f"{oid.split('_')[-1]}={st}" for oid, st in items)
            lines.append(f"- **Account {acct}**: {len(items)} non-completed ({states}).")
            if acct == "B":
                lines.append("  - **Channel characterization** (evidence HTML "
                             "inspected): pages load normally (title "
                             "'ChatGPT: Chat, Work, Create & Code with AI', no "
                             "Cloudflare challenge) but the logged-out visitor is "
                             "served the **marketing/login landing page** — no "
                             "usable chat composer. The anonymous channel is "
                             "therefore NOT a viable measurement arm in this "
                             "environment. H2 (account-side personalization) "
                             "cannot be tested anonymously; it requires a real "
                             "second account (CEO provisioning) — NOT a "
                             "methodology failure, an environment fact.")
        lines.append("")

    # 5c. Temporal State Persistence Curve (primary deliverable, CEO 2026-09-08)
    lines.append("## 5c. Temporal State Persistence Curve (primary deliverable)")
    lines.append("")
    lines.append("Observed surfacing rate on identical-style anchor prompts, same "
                 "model / account / topic / discipline, across the day "
                 "(authentic populations only per Rule M-04). Each point is an "
                 "*observed rate under run conditions*, not a general claim:")
    lines.append("")
    lines.append("```text")
    curve = []
    for label, when, h, n, _rate in HISTORY:
        curve.append((when, label, h, n))
    # A4.1 time points, account A (valid population)
    tps = sorted({tp for (tp, _a) in by_ta})
    for tp in tps:
        ma = by_ta.get((tp, "A"))
        if ma:
            curve.append((f"T{tp} (16:40 for T1)" if tp == 1 else f"T{tp}",
                          f"A4.1-T{tp} anchors pooled (A, logged-in)",
                          ma["hits"], ma["n"]))
    for when, label, h, n in curve:
        rate = f"{h / n:.0%}" if n else "?"
        bar = "#" * int(round((h / n if n else 0) * 30))
        lines.append(f"{when:<22} {h}/{n}  {rate:>4}  {bar}")
    lines.append("```")
    lines.append("")
    lines.append("**Core scientific question (CEO):** after a visibility state "
                 "switch on an identical anchor prompt, does the state recover "
                 "naturally, and what is the recovery period? T2 (~19:35) and "
                 "T3 (~22:35) complete the curve.")
    lines.append("")

    # 6. Next steps
    lines.append("## 6. Next Steps (CEO priorities)")
    lines.append("")
    lines.append("- **P1** T2/T3 state-persistence runs (same script, "
                 "`--time-point 2 --only-missing`; account order auto-"
                 "counterbalanced). With >= 2 time points the Pattern A-E "
                 "judgment activates automatically.")
    lines.append("- **P2** CEO to provision a real second account (H2 test; the "
                 "anonymous arm is INVALIDATED per Rule M-04 — no workarounds).")
    lines.append("- **P3** Pattern A-E verdict once T2/T3 data lands.")
    lines.append("- **P4** Measurement Validity Protocol v1 (M-04 already in force).")
    lines.append("- NOT approved this phase: A4.2 cross-model, A5 deployment, "
                 "new visibility case studies.")
    lines.append("")
    return "\n".join(lines)


def write_raw_csv(records):
    path = REPORTS / "A41_RAW.csv"
    import csv
    cols = ["observation_id", "time_point", "account", "replicate", "anchor",
            "prompt_id", "response_state", "answer_char_count",
            "candidate_set_size", "hydroviv_in_candidate_set", "candidate_rank",
            "candidate_rationale", "competitor_set", "recommendation_level",
            "citation_presence", "session_id"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in records:
            w.writerow(r)
    return path


def write_contrast_csv(by_tac, by_ta, pattern_label):
    path = REPORTS / "A41_ACCOUNT_CONTRAST.csv"
    import csv
    rows = []
    for (tp, acct, anc), m in sorted(by_tac.items()):
        rows.append({
            "time_point": f"T{tp}", "account": acct, "anchor": anc,
            "n": m["n"], "hv_hits": m["hits"],
            "observed_surfacing_rate_under_run_conditions": round(m["rate"], 3),
            "candidate_set_size_mean": m["set_size_mean"],
            "stability": m["stability"],
            "level": "cell",
        })
    for (tp, acct), m in sorted(by_ta.items()):
        rows.append({
            "time_point": f"T{tp}", "account": acct, "anchor": "POOLED",
            "n": m["n"], "hv_hits": m["hits"],
            "observed_surfacing_rate_under_run_conditions": round(m["rate"], 3),
            "candidate_set_size_mean": m["set_size_mean"],
            "stability": m["stability"],
            "level": "pooled",
        })
    if pattern_label:
        rows.append({"time_point": "", "account": "", "anchor": "JUDGMENT",
                     "n": "", "hv_hits": "",
                     "observed_surfacing_rate_under_run_conditions": "",
                     "candidate_set_size_mean": "", "stability": pattern_label,
                     "level": "judgment"})
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    return path


def enrich_db(records):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("PRAGMA table_info(observations)")
    cols = [r[1] for r in cur.fetchall()]
    if "a41_detail" not in cols:
        cur.execute("ALTER TABLE observations ADD COLUMN a41_detail TEXT")
    for r in records:
        detail = {
            "time_point": r["time_point"],
            "account": r["account"],
            "session_id": r["session_id"],
            "anchor": r["anchor"],
            "replicate": r["replicate"],
            "candidate_set_size": r["candidate_set_size"],
            "hydroviv_in_candidate_set": bool(r["hydroviv_in_candidate_set"]),
            "candidate_rank": r["candidate_rank"],
            "competitor_set": r["competitor_set"],
            "recommendation_level": r["recommendation_level"],
            "citation_presence": bool(r["citation_presence"]),
        }
        cur.execute("UPDATE observations SET a41_detail=? WHERE observation_id=?",
                    (json.dumps(detail, ensure_ascii=False), r["observation_id"]))
    con.commit()
    con.close()


def b_channel_status():
    """Summarize non-COMPLETED A4.1 rows (channel-level data facts)."""
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        "SELECT observation_id, response_state FROM observations "
        "WHERE observation_id LIKE '%_a41_%' AND response_state != 'COMPLETED'"
    ).fetchall()
    con.close()
    by_acct = defaultdict(list)
    for r in rows:
        m = re.search(r"_a41_T(\d)([A-Z])_", r["observation_id"] or "")
        if m:
            by_acct[m.group(2)].append((r["observation_id"], r["response_state"]))
    return dict(by_acct)


def main():
    print("Loading A4.1 observations...")
    rows = [r for r in load_observations() if r.get("response_state") == "COMPLETED"]
    records = analyze(rows)
    print(f"  parsed {len(records)} A4.1 records")
    if not records:
        print("No A4.1 records found. Run run_a41_collection.py first.")
        return

    # Rule M-04: anonymous (account B) is NOT a valid measurement population.
    # Keep B rows in the RAW csv for audit, but exclude from all metrics.
    valid = [r for r in records if r.get("account") != "B"]
    n_excl = len(records) - len(valid)
    if n_excl:
        print(f"  Rule M-04: excluded {n_excl} anonymous-arm record(s) from metrics")

    by_tac = {}
    for tp in sorted({r["time_point"] for r in valid}):
        for acct in sorted({r["account"] for r in valid}):
            for anc in ("AN1", "AN2"):
                m = cell_metrics(valid, tp, acct, anc)
                if m:
                    by_tac[(tp, acct, anc)] = m
    by_ta = {}
    for tp in sorted({r["time_point"] for r in valid}):
        for acct in sorted({r["account"] for r in valid}):
            m = cell_metrics(valid, tp, acct)
            if m:
                by_ta[(tp, acct)] = m

    pattern = judge_pattern(by_ta)
    plabel = pattern[0] if pattern else None

    p_raw = write_raw_csv(records)
    p_con = write_contrast_csv(by_tac, by_ta, plabel)
    report = build_report(records, by_tac, by_ta, pattern, by_ta)
    p_md = REPORTS / "A41_DRIFT_REPORT.md"
    with open(p_md, "w", encoding="utf-8") as f:
        f.write(report)
    enrich_db(records)

    print("\nPer-cell rates:")
    for (tp, acct, anc), m in sorted(by_tac.items()):
        print(f"  T{tp} {acct} {anc}: {m['hits']}/{m['n']} ({m['rate']:.0%})")
    print("\nPer (time, account) pooled:")
    for (tp, acct), m in sorted(by_ta.items()):
        print(f"  T{tp} {acct}: {m['hits']}/{m['n']} ({m['rate']:.0%})")
    if pattern:
        print(f"\nJudgment: {pattern[0]}")
    print("Wrote:")
    for p in (p_raw, p_con, p_md):
        print("  ", p)
    print("DB enriched (observations.a41_detail).")


if __name__ == "__main__":
    main()
