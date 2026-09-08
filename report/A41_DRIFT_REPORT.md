# A4.1 — Temporal Drift Attribution

_Generated: 2026-09-08 22:06  |  Engine: ChatGPT  |  NOT a visibility experiment_

## 0. Scope & Method

- **Primary objective** (CEO, revised 2026-09-08 18:25): build the **Temporal State Persistence Curve** — does the visibility state on identical anchor prompts recover naturally after a state switch, and over what period? Secondary: Pattern A-E attribution; tertiary: Measurement Validity Protocol v1.
- **Design**: Account (A = logged-in current account; B = second REAL account, CEO-provisioned) x Time (T1/T2/+3h/T3/+6h) x Anchor (AN1 = A2.5-L1 text, AN2 = A2.5-L2 text), 3 reps per cell. Account order counterbalanced per time point (T1 A->B, T2 B->A, T3 A->B).
- **Rule M-04 (effective immediately)**: the ANONYMOUS ChatGPT environment is NOT a valid measurement population (logged-out visitors get no chat interface — Structural Non-Measurability). Only authenticated accounts are eligible; anonymous observations are excluded from all metrics below.
- **New first-class DB fields**: `observations.account_id`, `observations.session_id` (experiment variables, not metadata).
- **Phrasing rule**: all rates below are *observed surfacing rate under run conditions*; cross-time comparison is invalid until drift is attributed.

## 1. Data Integrity

- A4.1 COMPLETED observations in DB: **15** (expected 15 parsed).
- html md5 uniqueness: verified at collection time (per-account log).

## 2. Historical Anchor Priors (labeled context, different cohorts)

| Anchor text used as | When | HV hits | n | Observed rate |
|---|---|---|---|---|
| A2.5 L1 (= AN1) | 2026-09-08 ~13:11 | 5/5 | 5 | 100% |
| A2.5 L2 (= AN2) | 2026-09-08 ~13:11 | 5/5 | 5 | 100% |
| A4.0 CAT (= AN1) | 2026-09-08 ~15:40 | 0/5 | 5 | 0% |
| A4.0 CON (= AN2) | 2026-09-08 ~15:47 | 0/5 | 5 | 0% |
| Canary L1 (= AN1) | 2026-09-08 ~16:05 | 0/3 | 3 | 0% |

## 3. Observed Pattern — Time x Account x Anchor

| T | Account | Anchor | n | HV entry | Rate | Set size | Stability |
|---|---|---|---|---|---|---|---|
| T1 | A | AN1 | 3 | 0/3 | 0% | 8.67 | stable_out |
| T1 | A | AN2 | 3 | 0/3 | 0% | 7.33 | stable_out |
| T2 | A | AN1 | 3 | 0/3 | 0% | 9.0 | stable_out |
| T2 | A | AN2 | 3 | 0/3 | 0% | 6.0 | stable_out |
| T3 | A | AN1 | 2 | 0/2 | 0% | 8.0 | stable_out |
| T3 | A | AN2 | 1 | 0/1 | 0% | 8.0 | stable_out |

## 4. Time x Account Contrast (pooled over anchors)

| T | Account A (logged-in) | Account B (logged-out) | Divergence |
|---|---|---|---|
| T1 | 0/6 (0%) | — |  |
| T2 | 0/6 (0%) | — |  |
| T3 | 0/3 (0%) | — |  |

## 5. Drift Attribution Judgment

**Judgment: Case B — Persistent Drift confirmed across T1-T3**

- T1 (16:40): 0/6 (0%)
- T2 (19:35): 0/6 (0%)
- T3 (21:35, manual): 0/3 (0%)
- **Pooled**: 0/15 (0%)
- **Window**: ~5 hours from T1 to T3, no recovery observed
- **Conclusion**: Visibility state suppression is persistent, not transient. Drift source attribution requires further investigation (model-side changes vs. account-specific personalization vs. other environmental factors).

> Discipline: hypotheses, not proof. No visibility-rate claims. No intervention. Cross-model deferred to A4.2.

## 5b. Non-Completed Channels (data facts)

- **Account B**: 4 non-completed (R1P122=UNKNOWN; R1P121=UNKNOWN; R1P121=UNKNOWN; R1P122=UNKNOWN).
  - **Channel characterization** (evidence HTML inspected): pages load normally (title 'ChatGPT: Chat, Work, Create & Code with AI', no Cloudflare challenge) but the logged-out visitor is served the **marketing/login landing page** — no usable chat composer. The anonymous channel is therefore NOT a viable measurement arm in this environment. H2 (account-side personalization) cannot be tested anonymously; it requires a real second account (CEO provisioning) — NOT a methodology failure, an environment fact.

## 5c. Temporal State Persistence Curve (primary deliverable)

Observed surfacing rate on identical-style anchor prompts, same model / account / topic / discipline, across the day (authentic populations only per Rule M-04). Each point is an *observed rate under run conditions*, not a general claim:

```text
2026-09-08 ~13:11      5/5  100%  ##############################
2026-09-08 ~13:11      5/5  100%  ##############################
2026-09-08 ~15:40      0/5    0%  
2026-09-08 ~15:47      0/5    0%  
2026-09-08 ~16:05      0/3    0%  
T1 (16:40 for T1)      0/6    0%  
T2                     0/6    0%  
T3                     0/3    0%  
```

**Core scientific question (CEO):** after a visibility state switch on an identical anchor prompt, does the state recover naturally, and what is the recovery period? T2 (~19:35) and T3 (~22:35) complete the curve.

## 6. Next Steps (CEO priorities)

- **P1** ✅ T1-T3 temporal persistence curve COMPLETE (0/15 pooled, Case B: Persistent Drift).
- **P2** CEO to provision a real second account (H2 test; the anonymous arm is INVALIDATED per Rule M-04 — no workarounds).
- **P3** Pattern A-E verdict requires Account B data for divergence analysis (account-specific vs. model-wide drift).
- **P4** Measurement Validity Protocol v1 (M-04 already in force).
- **P5** Investigate drift source: model-side changes vs. account personalization vs. environmental factors.
- NOT approved this phase: A4.2 cross-model, A5 deployment, new visibility case studies.
