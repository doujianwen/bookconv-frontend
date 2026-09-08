# Project Positioning — GEO AI Visibility Diagnostic System

**Last updated**: 2026-09-08 (CEO alignment session)
**Status**: Frozen — this positioning governs all future A-phase work

---

## 1. What We Are Building

We are **not** building a GEO optimization service for Hydroviv.

We are building a **GEO AI Visibility Diagnostic System** — a repeatable methodology for measuring and diagnosing brand visibility in AI-generated answers, validated against real client data.

Hydroviv is the **first benchmark case**. It is the test subject on which we validate measurement, diagnosis, and intervention methodology — not the end client we are optimizing.

---

## 2. Why Hydroviv?

Hydroviv was selected as the benchmark because:

1. **Real client context** — Hydroviv is an actual brand the team is advising (杭州歌颂者), providing authentic domain knowledge.
2. **Clean separation** — By treating Hydroviv as an experimental object rather than a live optimization target, we avoid premature action bias and can validate methodology rigorously before applying it to real clients.
3. **Zero-current-presence baseline** — Hydroviv has TRUE_ZERO presence in the A1 Full V2 sample (validated in A2.2.1). This gives us a clean starting point to observe what patterns *are* present among competitors, and then systematically identify where Hydroviv differs.

---

## 3. Architecture (Final)

```
GEO AI Visibility Diagnostic System
         │
         ▼
   Benchmark Case: Hydroviv
         │
    ┌────┴────┐
    ▼         ▼
   A1        A2
 Measurement Diagnosis
    │         │
    ├─ Prompt │─ Competitor Anatomy
    ├─ Fill   │─ Source / Entity Attribution
    └─ Verify │─ Benchmark Gap Analysis
              │
              ▼
           A2 Output: Diagnostic Hypothesis
              │
              ▼
             A3
     Intervention Validation Framework
              │
              ▼
        Remeasurement
              │
              ▼
     Methodology Validation
              │
              ▼
       Repeatable GEO System
              │
              ▼
         Client Delivery
```

---

## 4. What We Study (Hydroviv)

These questions are in scope:

| # | Question |
|---|---|
| 1 | Is Hydroviv mentioned in AI-generated answers? |
| 2 | If mentioned, is it recommended? At what level? |
| 3 | What evidence clusters do competitor brands form? |
| 4 | What source/domain patterns accompany competitor recommendations? |
| 5 | What entity/attribute combinations are associated with L3/L4 recommendations? |
| 6 | What observable gaps exist between Hydroviv's current pattern and competitor patterns? |
| 7 | What hypotheses can be generated from those gaps? |

---

## 5. What We Do NOT Do (Hydroviv)

These are out of scope until A3 (and even then, only as experimental interventions):

| # | Action | Status |
|---|---|---|
| 1 | Modify Hydroviv's website content | ❌ Not until A3 verified |
| 2 | Build backlinks to Hydroviv | ❌ Not until A3 verified |
| 3 | Publish GEO-optimized content for Hydroviv | ❌ Not until A3 verified |
| 4 | Run live SEO campaigns | ❌ Not until A3 verified |
| 5 | Claim "Hydroviv needs X" as a deliverable | ❌ Never — we deliver diagnostic methodology |

---

## 6. What We Deliver (End State)

The final deliverable is not "Hydroviv GEO optimization plan." It is:

> **A validated, evidence-based GEO Diagnosis methodology** that can:
> 1. Measure a brand's AI visibility across a representative query set
> 2. Identify competitor evidence patterns (source/entity/attribute clusters)
> 3. Systematically detect observable gaps between the target brand and those patterns
> 4. Generate structured hypotheses about what interventions to test
> 5. Validate those interventions through controlled remeasurement

When applied to a real client, the output transforms from "observable gap" into "action plan" — but the methodology is the product, not the client-specific findings.

---

## 7. Phase Status

_Last updated: 2026-09-08 (CEO A2.5 PASS / A3.0 PASS-Directional / A3.1 authorization)_

| Phase | Status | Gate / Note |
|---|---|---|
| A1 — Measurement Validation | ✅ Closed | Clean data pipeline |
| A2.1 — Competitor Anatomy | ✅ Closed | 100% gold-standard validation |
| A2.1.1–A2.1.3 | ✅ Closed | Exact 87%→FAIL; FINAL 100%→PASS |
| A2.2 — Source/Entity Attribution | ✅ Closed | 5,807 attribution pairs; E5 clusters mapped |
| A2.2.1 — Hydroviv Recall Validation | ✅ Closed | TRUE_ZERO confirmed |
| A2.3 — Benchmark Gap Analysis | ✅ Closed | 260-row gap inventory; 5 hypotheses |
| A2.4 — Hypothesis Discrimination | ✅ Closed | READY_FOR_A3 = 0/5 → A3 LOCKED (then) |
| CT-1 — Entity Accessibility (named) | ✅ PASS | Case A; 9/9 identified, 0 refused |
| CT-1 — Cross-model | ✅ PASS | ChatGPT + Perplexity agreement |
| **A2.5 — Candidate Generation (un-named)** | ✅ PASS / **Case C** | 15/15 spontaneous entry; query-family effect (§10) |
| **A3.0 — Decision-Stage Transition** | ✅ **PASS / Directional** | S1 100% → S2 100% → S3 60% (A3.1: ~10%, NOT reproduced) — see §11/§12 |
| **A3.1 — Decision-Stage Framing Validation** | ✅ **PASS / Hypothesis Refinement** | D1–D4 all low (0–20%, pooled 10%); A3.0 S3 60% not reproduced → priming+variance dominate — see §12 |
| A3.2 — Candidate-vs-Rank Discrimination | 🔒 **CANCEL / DEFER** (CEO, 2026-09-08) | premise (stable S3 survival) not supported; do not descend the funnel further |
| A3 — Intervention Validation | 🔒 Locked | requires mechanism narrowing beyond priming/variance |
| **A4.0 — Query-Regime Sensitivity Mapping** | ✅ **PASS / Drift Discovery** | 4 regimes all 0/5 + canary 0/3 → within-day temporal drift dominates; regime gradient **⚠️ NOT INTERPRETABLE** — see §15 |
| **A4.1 — Temporal Drift Attribution** | 🔵 **NOW** | Account × Time × Anchor, interleaved canaries — see §16. NO new visibility conclusions; NO cross-model yet |
| A4.2 — Cross-Model (deferred) | 🔒 Locked | only after drift attribution (CEO) |
| A5 — Client Deployment (formerly A4) | ⏸️ **Paused** (CEO) | Requires A3 validation |

> **A2 phase verdict (CEO, 2026-09-08):** A2 has completed its core mandate —
> *find the problem + narrow the mechanism range*. A2.5 excluded the
> "model cannot find Hydroviv" alternative (entity is accessible; Hydroviv
> enters the candidate set 15/15 under brand-enumeration framing). The
> remaining question is decision-stage: *what conditions move a candidate
> brand from the candidate set into the final consumer-decision answer?*
> This is why A3.0 (not A2.6/7, not cross-model expansion, not website
> changes) is the next step.

> **A3.0 verdict (CEO, 2026-09-08):** PASS / *Directional Localization*. The
> S2→S3 break is localized to the decision-stage ranking/selection layer, but the
> dropout is probabilistic (3/5), so "Ranking Effect proven" is NOT written into
> methodology. A3.1 (wording-robustness) is the approved next step; A3
> (intervention) remains LOCKED.
>
> **A3.1 refinement (2026-09-08):** A3.1 re-ran D1 (the prompt IDENTICAL to A3.0 S3)
> and got 20%, not 60% (pooled 10% across D1–D4). The 60% was a small-sample /
> run-variance over-estimate. The dominant effect is now attributed to
> **prompt-family / priming** (brand-enumeration inflates entry to 100%; natural
> need/decision queries show low/zero entry), NOT a confirmed decision-stage
> ranking drop. "Ranking Effect" remains unproven.
>
> **A3.1 terminal verdict (CEO, 2026-09-08): PASS / Hypothesis Refinement.**
> The A3.0 "stable S2→S3 ranking drop" hypothesis is significantly weakened:
> both positive hits clustered in one replicate, and the identical-prompt gap
> (60% → 20%) shows the "ranking effect" explanation is weak. The robust
> conclusion is **query-family / prompt-regime sensitivity**, not a stable
> decision-stage ranking effect. This is a successful *hypothesis elimination*.
> **Decision: do NOT proceed to A3.2, do NOT intervene. Stop descending the
> Candidate→Evaluation→Ranking→Recommendation ladder. The research question is
> reframed as: *what Prompt Regime makes the same AI model actively include a
> brand in its candidate set?* → next phase A4 (Query-Regime Sensitivity
> Mapping). "Spontaneous Surfacing" is retired as a term (§10); the product
> concept is **AI Recommendation Funnel by Query Regime** — stage-specific
> metrics per regime, never a funnel total score.

---

## 8. A2.3 Entry Criteria

A2.3 begins when:
- [ ] Table-aware normalization integrated into production pipeline (production task, not research)
- [ ] This positioning document is reviewed and accepted by the project lead
- [ ] A2.3 scope is formally authorized

A2.3 research questions (per CEO alignment):
1. **Entity Gap**: What topics/attributes/scenarios is Hydroviv absent from?
2. **Evidence Gap**: Are competitor evidence clusters reproducible? Do they hold under different measurement conditions?
3. **Source Gap**: What citation domains accompany competitor recommendations? Does Hydroviv appear in any of them?
4. **Intent Gap**: Is Hydroviv's absence concentrated in specific intent families?
5. **Commercial Gap**: What commercial signals (price, installation, specs) accompany competitor recommendations?

A2.3 output format (per §九 of A2.2 authorization):
- Fact
- Observed Pattern
- Evidence Count
- Hypothesis
- Alternative Explanations
- Confidence
- Unknown

---

## 9. Governance Principles

These principles govern all future work:

1. **No action without diagnosis** — We do not recommend changes to Hydroviv's site until A2.3 produces a structured hypothesis with alternative explanations.
2. **Evidence over intuition** — Every claim must be backed by co-occurrence data, evidence clusters, or repeated patterns. Anecdotal observations are labeled as such.
3. **No causal claims without experiment** — Correlation ≠ causation. Citation presence does not prove recommendation causation. This is enforced by the §十 ban in A2.2.
4. **Versioned artifacts** — All measurement outputs are versioned (v1/v2/v3). Historical layers are preserved.
5. **Hydroviv is a test subject** — Findings about Hydroviv serve methodology validation. They do not automatically translate to client deliverables.

---

## 10. Query-Conditioned AI Visibility (formerly "Spontaneous Surfacing")

**Terminology ruling (CEO, 2026-09-08):** the term **"Spontaneous Surfacing" is
retired**. A2.5 + A3.0/A3.1 proved that "does the AI spontaneously surface a
brand" is not a binary property of the brand at all — it is strongly
**conditioned by the Query Regime** (brand-enumeration 15/15 vs natural-need
0–20%). The correct construct is **Query-Conditioned AI Visibility**, decomposed
into five observable layers, each measured independently:

| Layer | Question | Measured by |
|---|---|---|
| **Entity Accessibility** | Is the brand reachable/identifiable when named? | CT-1 (named) → 9/9 |
| **Candidate Entry** | Does it enter the candidate set *at all* (un-named)? | A2.5 L1–L3 → **15/15**; A4 CAT/CON |
| **Consideration** | Does it survive into the *evaluation* stage? | A3.0 S2 → 5/5 |
| **Comparison** | Does it survive *comparative* framings? | A4 CMP (new) |
| **Recommendation** | Is it in / chosen for the final decision answer? | A1 → **0/100**; A3.0 S3 / A3.1 D1 / A4 REC |

**Rule (from 2026-09-08):** never collapse these into one "AI visibility score".
A brand can score 100% on Candidate Entry yet 0% on Final Recommendation — that is
exactly Hydroviv's profile, and it is a *stage-localized* phenomenon, not a
"brand is invisible / lacks authority" verdict.

### The AI Recommendation Funnel — now crossed with Query Regime

The funnel remains the core conceptual model, but A3.1 established that every
layer is **regime-dependent**. The product capability is the joint map:

```
                     Regime axis (A4)            Funnel axis
Entity Accessible         ✅ (all regimes, CT-1)
        ↓
Candidate Entry           CAT/ENUM 100%  →  REC 0–20%
        ↓
Consideration             S2 100% (evaluative framing)
        ↓
Comparison                A4 CMP (new measurement)
        ↓
Recommendation            A1 0/100; A3.0 S3 60%*; A3.1 10–20%  (*not reproduced)
        ↓
Citation / Justification
```

Each arrow is a *transition* that can independently fail, and each failure is
*conditioned on the query regime*. A4 maps the regime axis systematically.

### Candidate Survival Rate (CEO-defined, 2026-09-08)

> **Candidate Survival Rate** = brand in candidate/evaluation stage → remains in
> final recommendation stage = (final-decision entry) / (evaluation entry).
> Example from A3.0: S2 = 5/5, S3 = 3/5 → **Candidate Survival = 3/5 = 60%**.

This is a sharper metric than a flat "recommendation rate" because it isolates
the *transition* loss. It must always be reported **per stage**, never summed.

### A3.x naming scheme (CEO, 2026-09-08)

| Phase | Answers | Status |
|---|---|---|
| **A3.0** Decision-Stage Transition | *Where* does candidate survival break? | ✅ PASS / Directional |
| **A3.1** Decision-Stage Framing Validation | Is the break robust to wording? | ✅ PASS / Hypothesis Refinement |
| **A3.2** Candidate-vs-Rank Discrimination | Does the brand *disappear*, or *remain but rank lower*? | 🔒 **CANCEL / DEFER** — premise unsupported |
| **A3 Intervention** | Can a hypothesized factor alter the funnel outcome? | 🔒 Locked |
| **A4** Query-Regime Sensitivity Mapping | *Which query regimes make the brand visible?* | 🔵 NOW (§15) |

> **RULE:** never collapse the funnel into a single "AI Recommendation Funnel
> Score". Output **stage-specific metrics** — the whole value is *where* the
> problem sits, not a total.

---

## 11. A3.0 — Decision-Stage Transition Experiment (pre-registration)

**Status**: 🔵 NOW (authorized 2026-09-08). Not an intervention — no website/content change.

**Core question**: *After Hydroviv has entered the candidate set, what condition
makes it survive the evaluation stage vs disappear at the purchase-decision stage?*

**Design** (ChatGPT-only round 1; do NOT expand to Gemini/Perplexity yet):

| Stage | Probe | Replicates | New? |
|---|---|---|---|
| **S1** Candidate Generation | (reuse A2.5 L1–L3: brand-enumeration) | 5 | no — baseline 15/15 |
| **S2** Candidate Evaluation | "Which residential water filtration brands would be the best fit for someone concerned about PFAS and local water quality, and how would you compare them?" | 5 | **yes** |
| **S3** Purchase Recommendation | "I have PFAS in my water and want to buy a residential water filter. Which one should I choose?" | 5 | **yes** |

Controls (mirror A2.5): independent session per replicate, fresh chat per probe,
randomized order, raw HTML + screenshot archived, mtime guard, html md5 uniqueness.

**Case logic** (per CEO 2026-09-08):

- **Case A** — S1=S2=S3=Hydroviv present → A1's 0/100 likely a prompt-composition /
  competition / specific-intent artifact, NOT a candidate-pipe failure.
- **Case B** — S1=S2=Hydroviv, S3=competitors only → supports a **decision-stage
  ranking / selection effect** (gap localized to Ranking→Recommendation).
- **Case C** — S1=Hydroviv, S2=competitors only → gap is earlier, at the
  **candidate evaluation / ranking transition**.

**Discipline**: A3.0 only localizes *where* the funnel drops; it does **not** prove
retrieval or ranking, and it produces no intervention. The localized stage defines
the target for a *future* A3 intervention (if CEO authorizes).

**Deliverables**: `reports/A3.0_RAW.csv`, `reports/A3.0_STAGE_TRANSITION.csv`,
`reports/A3.0_FUNNEL_REPORT.md`; scripts `scripts/run_a30_collection.py`,
`scripts/a30_analysis.py`; DB `observations.a30_detail`.

---

## 12. A3.1 — Decision-Stage Framing Validation (pre-registration)

**Status**: 🔵 NOW (authorized 2026-09-08, after A3.0 PASS/Directional). Not an intervention.

**Core question**: *Is the A3.0 S2→S3 break robust to final-decision WORDING,
or a wording artifact of one prompt?*

**Design** (ChatGPT-only round 1; do NOT expand to Gemini/Perplexity yet):

| Framing | Prompt (controlled vars fixed: PFAS / residential / purchase-intent / technical-need) | Replicates |
|---|---|---|
| **D1** | "I have PFAS in my water and want to buy a residential water filter. Which one should I choose?" | 5 |
| **D2** | "I have PFAS in my water and want to buy a residential water filter. Which one would you recommend?" | 5 |
| **D3** | "I have PFAS in my water and want to buy a residential water filter. Which option is the best fit for me?" | 5 |
| **D4** | "I need to choose a residential water filter for PFAS concerns. Which of these would you pick?" | 5 |

20 total fresh-chat observations. **No Hydroviv in any prompt. No S1/S2/S3 splicing** —
self-contained single-stage experiment (addresses the A3.0 longitudinal-cohort caveat).

Primary metrics (stage-specific, NO funnel total score):
- per-framing Hydroviv entry rate / set size / final rank / recommendation level
- **Candidate Survival** = decision-stage entry vs A3.0 S2 (100%) baseline
- competitor displacement (which brands fill the slot when Hydroviv is absent)
- cross-framing robustness: robust → decision-stage selection; wide swing → wording artifact

**Discipline**: A3.1 only tests wording-robustness; it does NOT prove ranking and produces
no intervention. If the break is wording-robust, the next step is **A3.2** (does Hydroviv
disappear or merely rank lower?).

**Deliverables**: `reports/A3.1_RAW.csv`, `reports/A3.1_FRAMING_VALIDATION.csv`,
`reports/A3.1_FRAMING_REPORT.md`; scripts `scripts/run_a31_collection.py`,
`scripts/a31_analysis.py`; DB `observations.a31_detail`.

### A3.1 result (2026-09-08)

- **Findings**: D1 1/5 (20%), D2 1/5 (20%), D3 0/5, D4 0/5 → pooled **10%** (2/20).
  Both Hydroviv hits fell in replicate R1 (stochastic clustering, not stable selection).
  Competitor displacement when Hydroviv absent: **Aquasana** and **iSpring** dominate
  all four framings.
- **Classification**: **A3.0 NOT reproduced — priming + variance dominate.** The A3.0
  S3 (identical prompt to D1) = 60% was a small-sample / run-variance over-estimate.
  The true decision-stage entry in natural-purchase framings is low and variable
  (0–20%), consistent with A1's 0/100. Dominant effect = **prompt-family / priming**,
  not a stable decision-stage selection.
- **Implication**: the A3.0 "S2→S3 directional localization" is downgraded; the A3.2
  premise (stable S3 survival to discriminate disappear-vs-rank-lower) is NOT yet
  supported. Next step is NOT A3.2 as originally scoped — it is a **prompt-family /
  priming control** (see §13) before any rank discrimination or intervention.

---

## 13. Proposed Next Control — Prompt-Family / Priming (pre-proposal)

**Trigger**: A3.1 showed the A3.0 S3=60% was not reproduced (D1=20%, pooled 10%);
the dominant effect is prompt-family / priming, not a stable decision-stage selection.

**Question**: *Is Hydroviv's presence driven by whether the prompt ENUMERATES brands
vs expresses a NATURAL NEED, holding the topic (PFAS + residential) fixed?*

**Design**: two arms, same topic, fixed variables, 5+ reps each:
- **Enumerate arm**: "List N residential water-filter brands relevant to PFAS…" (≈ A2.5)
- **Natural-need arm**: "I have PFAS in my water and want to buy a residential filter…"
  (≈ A1 / A3.0 / A3.1)
Compare Hydroviv entry rate across arms. If enumerate ≫ natural-need, the gap is a
*priming / query-composition* effect, not a ranking deficit. This must be resolved
BEFORE A3.2 (which presupposes a stable S3 survival) or any A3 intervention.

**Status**: 🔒 proposed — requires CEO authorization.

---

## 14. Governance Note — Validity > Reliability (standing rule)

A3.0 (60%) vs A3.1 (10%) on the *same* D1 prompt is a reminder that a result
replicated in one run is still one run. A single run's "direction" (here, Hydroviv
drops at the decision stage) is a **hypothesis**, not a finding, until it reproduces
across (a) more replicates and (b) ideally a second model. The project does NOT
promote any directional result to a "proven" mechanism without cross-replicate and,
where feasible, cross-model confirmation. (See also the §九 E5 validity > reliability
principle from A2.2.)

---

## 15. A4 — Query-Regime Sensitivity Mapping (pre-registration)

**Status**: 🔵 NOW (CEO authorization 2026-09-08, after A3.1 terminal verdict).
**NOT an intervention** — no Hydroviv website/content change, no model expansion.

**Core question**: *Does Hydroviv's un-named visibility change continuously across
Query Regimes — i.e., which regimes make the brand visible, and which make it
disappear?* This reframes the project question from "why doesn't the AI
recommend Hydroviv?" to **"why does AI visibility for the same brand swing so
massively with the Query Regime?"** — and establishes the reusable product
capability: **AI Recommendation Funnel by Query Regime** (stage-specific metrics
per regime; never a funnel total score).

**Design** (ChatGPT-only round 1): 4 regimes × 5 independent replicates = **20
fresh-chat observations**. Topic held fixed (PFAS + residential water filter);
no probe names Hydroviv. Only the *regime framing* varies:

| Regime | Probe (prompt_id) | Replicates | Historical baseline |
|---|---|---|---|
| **CAT** — Category ("有哪些品牌？") | "What are the main residential water filtration brands people consider for PFAS removal?" (116) | 5 | = A2.5 L1 (5/5) — doubles as a cross-run stability check |
| **CON** — Consideration ("哪些品牌值得考虑？") | "Which residential water filtration brands are worth considering for PFAS removal, and what distinguishes them?" (117) | 5 | = A2.5 L2 (5/5) — same |
| **CMP** — Comparison ("这些品牌有什么区别？") | "What are the differences between the main residential water filtration brands for PFAS removal?" (118) | 5 | new regime |
| **REC** — Recommendation ("我该买哪一个？") | "I have PFAS in my water and want to buy a residential water filter. Which one should I choose?" (119) | 5 | = A3.0 S3 (3/5) = A3.1 D1 (1/5) — **third independent run** of the identical prompt |

Design intent: CAT/CON reuse the exact A2.5 prompts (temporal-stability check of
the 100% entry result); REC is the *third* run of the same decision prompt,
giving a pooled 15-observation variance estimate for the lowest-visibility
regime; CMP is the only genuinely new regime on the enumeration→decision gradient.

Primary metrics (stage-specific, NO funnel total score):
- per-regime Hydroviv entry rate / candidate set size / rank / recommendation level / citation rate
- **Visibility-by-regime gradient**: CAT → CON → CMP → REC entry-rate curve
  (the empirical "Query Regime → Brand Visibility" map)
- cross-run stability for CAT/CON (vs A2.5) and REC (pooled over 3 runs)
- competitor displacement per regime (who fills the slot when Hydroviv is absent)

**Case logic**:
- **Gradient confirmed** — high CAT/CON, low REC (CMP interpolates or breaks
  between) → the visibility swing is a *regime* phenomenon, not one trigger word;
  supports prompt-regime priming as the dominant factor.
- **Flat high / flat low** — regime does not matter; the A2.5-vs-A1 gap needs
  another explanation (temporal drift, topic change).
- **Mixed / non-monotonic** — regime boundaries are sharper than a gradient;
  probe regime boundaries in a follow-up.

**Discipline**: Observed Pattern / Hypothesis / Alternative Explanations only.
No causal claims. No intervention. No funnel total score. A3 remains LOCKED.

**Deliverables**: `reports/A4_RAW.csv`, `reports/A4_REGIME_MAP.csv`,
`reports/A4_REGIME_REPORT.md`; scripts `scripts/run_a40_collection.py`,
`scripts/a40_analysis.py`; DB `observations.a40_detail`.

### A4.0 result (2026-09-08) — the day's most important finding

- **Regime map**: CAT 0/5, CON 0/5, CMP 0/5, REC 0/5 (pooled 0/20; candidate
  sets healthy — mean size 6.2, Aquasana/AquaTru/iSpring consistently present;
  case-insensitive scan 0/20 vs A2.5 control 15/15, so the zeros are real).
- **Pre-registered canary** (`scripts/run_a40_canary.py`, prompt 120, token
  `a40k_c`): the EXACT A2.5 L1 prompt that measured **5/5 (100%)** at ~13:11
  re-measured **0/3** at ~16:05.
- **Classification**: **Temporal drift dominates — regime map NOT interpretable
  this run.** Same-day time-line of identical-style probes:
  **100% (A2.5, 13:11) -> 60% (A3.0 S3) -> 20% (A3.1 D1) -> 0% (A4.0 + canary,
  15:40-16:05)** on the same model, same topic, same collection discipline.
- **Interpretation discipline**: the regime-gradient hypothesis is neither
  confirmed nor refuted — the measurement instrument itself is unstable within
  a day. Candidate explanations (hypotheses, not proven): model-side
  change/routing; account-level personalization drift under repeated
  same-topic probing on one logged-in profile; other environment shifts.
- **Consequences**: (1) A2.5's 15/15 "Case C" is qualified as a within-day
  favorable run; (2) A3.0/A3.1 per-run rates must never be quoted alone; (3)
  "Query-Conditioned AI Visibility" is now understood to be **Query-Regime x
  Time conditioned**.

> **STANDING RULE (from A4.0):** every future collection run MUST embed canary
> probes (an anchor prompt with a known prior rate) - a run without a canary
> cannot be compared across time. Single-run visibility maps are provisional
> until cross-run + canary-anchored.

---

## 16. A4.1 - Temporal Drift Attribution (pre-registration)

**Status**: NOW (CEO authorization 2026-09-08, after A4.0 drift discovery).
**NOT a visibility experiment.** No cross-model. A5 paused. No Hydroviv changes.

**Primary objective**: identify the dominant source of the within-day temporal
drift discovered in A4.0 (identical prompts: 100% @13:11 -> 60% -> 20% -> 0%
@15:40-16:05), and produce a **Measurement Validity Protocol** that all future
GEO experiments must follow. Success is NOT "proving a visibility rate".

**Competing hypotheses**:
- **H1 Model-side drift** - backend routing / retrieval / system state changed.
- **H2 Account-side personalization** - repeated same-topic probing on one
  logged-in account shifted personalized behavior.
- **H3 Session/conversation contamination** - prior experiments affect current state.
- **H4 Stochastic variability** - high inherent randomness, no systematic state.
- **H5 Other environment factors** - proxy / region / browser state / etc.

**Design** (CEO: 3 x 3 x 2 = 18 core cells, 3 reps each; used for STATE-DRIFT
judgment, not population-rate estimation):

| Factor | Levels (full design) | This round (T1) |
|---|---|---|
| **A. Account** | A = current logged-in account; B = second real account; C = third real account (optional) | **A = logged-in (profile chatgpt)**. **B-anonymous arm INVALIDATED 2026-09-08 (CEO): ChatGPT's logged-out visitors land on a marketing/login page with no chat interface — Structural Non-Measurability, a product-layer rule, NOT a technical failure.** Do NOT attempt workarounds (fresh cookies, incognito, VPN, UA spoofing). H2 requires real accounts 2/3 provisioned by CEO |
| **B. Time** | T1 = now; T2 = +3h; T3 = +6h | T1 executed this round; T2/T3 re-run the SAME script (--time-point) |
| **C. Anchor** | Anchor-1 = A2.5 L1 text (prompt 121); Anchor-2 = A2.5 L2 text (prompt 122) | both, 3 reps each per cell |

New prompt_ids **121/122** carry the IDENTICAL anchor texts (never mutate
historical prompts 107/108). observation_id scheme:
`<date>_a41_T{tp}{acct}_R{rep}P{pid}`; analysis token `%_a41_`.

**Interleaving (critical)**: account execution order is counterbalanced across
time points (T1: A->B; T2: B->A; T3: A->B) so that "ran later" is never
confounded with account identity. Within each (rep, account), anchor order is
randomized (seeded).

**Freshness fields** (new first-class DB columns): `account_id`, `session_id`
(run-level browser-session identifier). These are EXPERIMENT VARIABLES now,
not metadata. Full desired schema per CEO: account_id, session_id,
conversation_id, prompt_id, anchor_id, run_id, timestamp, model,
model_version (if available), proxy, region, browser_profile, temperature
(if controllable), candidate_set, brand_present.

**Pattern judgment** (across time points):
- **Pattern A** - all accounts drop/rise in sync at the same time ->
  model/platform-side temporal drift most plausible.
- **Pattern B** - only the logged-in (old) account drops; fresh/logged-out
  context still surfaces -> account/personalization effect most plausible.
- **Pattern C** - high randomness everywhere -> stochastic variability dominates.
- **Pattern D** - drop in one session type, recovery in a new session ->
  session/conversational contamination.
- **Pattern E** - sync across accounts but not across models -> ChatGPT-specific
  state (cross-model testing is A4.2, deferred).

**Phrasing rule (CEO, effective immediately)**: per-run percentages are RETIRED
as general claims. Say "observed surfacing rate was X% **under the specific run
conditions**; cross-time comparison is currently invalid due to detected
temporal drift" - never "Hydroviv's visibility is X%".

**Deliverables**: `reports/A41_RAW.csv`, `reports/A41_ACCOUNT_CONTRAST.csv`,
`reports/A41_DRIFT_REPORT.md`; scripts `scripts/run_a41_collection.py`,
`scripts/a41_analysis.py`; DB `observations.account_id` / `.session_id` /
`.a41_detail`.

### 16b. A4.1-T1 audit amendments (CEO, 2026-09-08 18:25)

**T1 outcome (16:30-16:50)**: Account A (logged-in) = 6/6 COMPLETED, Hydroviv
**0/6** (AN1 0/3, AN2 0/3) — the drifted state PERSISTED from the 16:05 canary
(0/3). Account B (logged-out fresh context) = **channel unmeasurable**: pages
load normally (no Cloudflare challenge) but anonymous visitors are routed to a
marketing/login landing page with no chat interface; 2 UNKNOWN + 4
circuit-breaker skips.

**CEO rulings (binding):**

1. **Anonymous arm = INVALIDATED.** Not a failure — **Structural
   Non-Measurability**: under ChatGPT's current product shape, anonymous and
   authenticated users are no longer the same measurement population. The two
   cannot be compared. Do NOT spend further effort on workarounds (cookie
   clearing, new profiles, incognito, VPN, UA spoofing) — the block is a
   product-layer rule, not a technical fault.
2. **Account factor redefined**: A = current account; B = second REAL account;
   C = third real account (optional). Without a real account B, H2
   (account-side personalization) is untestable — CEO provisioning required.
3. **T2/T3 proceed regardless** (P1): with the anonymous arm gone, A4.1 now
   measures **State Persistence**, not account difference. If T1=T2=T3=0/6
   against the 13:11 100% anchor, that is a strong "no natural recovery after
   state switch" signal.
4. **H4 (pure stochasticity) is rapidly down-weighted**: 0/3 then 0/6 on
   consecutive runs makes pure-randomity increasingly improbable.

**Revised success criteria for A4.1:**
- **Primary (new)**: build the **Temporal State Persistence Curve** — time vs
  observed visibility on identical anchor prompts: 13:11 100% -> ~15:00 60% ->
  ~15:30 20% -> 16:05 0% -> 16:40 0% -> T2 (~19:35) ? -> T3 (~22:35) ?
- Secondary: Pattern A-E attribution (activates at >= 2 time points).
- Tertiary: Measurement Validity Protocol v1.

**A4.1 core scientific question (CEO)**: *after a visibility state switch on an
identical anchor prompt, does the state recover naturally, and what is the
recovery period?*

**Priorities (CEO)**: P1 observe state recovery (T2/T3) · P2 obtain real
account B · P3 Pattern A-E verdict · P4 MVP v1. NOT approved this phase:
A4.2 cross-model, A5 deployment, new visibility case studies.

> **Rule M-04 (Measurement Validity Protocol, effective immediately):** the
> Anonymous ChatGPT environment is NOT a valid measurement population. Only
> authenticated accounts are eligible for AI Visibility observations. Any
> future client-side replication must use a logged-in session, or results are
> not comparable to project baselines.

### 16c. CEO re-check (2026-09-08 18:35) — T2/T3 discipline lock & Q1 decision gate

**Verdict**: execution PASS; route unchanged. **A4.1 = RUNNING; A4.2 / A5 =
LOCKED; all Visibility conclusions = FROZEN until T3 closes.** The task is
re-typed from *Visibility Measurement* to **Measurement Validity
Investigation**.

**T2/T3 discipline (binding — deviations invalidate the Persistence Curve):**
1. **No new prompts.** AN1 / AN2 = A2.5 L1 / L2 verbatim. No rewording, no
   reordering, no added context, no brand words.
2. **No new reps.** 3 reps per cell. The goal is State Recovery observation,
   not statistical power.
3. **Account factor = FROZEN** until a real second account is provisioned.
   No anonymous substitutes (M-04 stands).

**Post-T3 decision gate — answer exactly one question (Q1): is the state
recovered?**
- **Case A** — T2 > 0 or T3 > 0 -> **Recovery Observed** -> proceed to
  **A4.1b Recovery Characterization** (recovery period / shape).
- **Case B** — T2 = 0 and T3 = 0 -> **Persistent Drift** -> proceed to
  **A4.1c Drift Source Attribution**.

**Standing context**: the number that matters is not 0/6 but the day-line
100% -> 60% -> 20% -> 0% -> 0%. If T2/T3 stay at zero, the project gains its
first testable proposition: *AI Visibility may not be a static property but a
state-switching phenomenon persisting for hours.* Client-facing canned answer
for "why not test anonymously": under the current product shape, anonymous
users are not an observable population, so their results are not comparable to
authenticated-user experiments (M-04).

**Second account priority**: P1 = T2, P2 = T3, P3 = second account. The
Persistence Curve produces valid research results without it; the account only
adds explanatory power.
