# SEO Recovery Phase 1.1 Gate（SEO_RECOVERY_PHASE1_1_GATE）

> 阶段: Phase 1.1 · Gates G1-G10

## G1: Live sitemap really fetched

| # | Assertion | Status |
|---|---|---|
| G1.1 | Raw sitemap file exists and is non-empty (size > 1000 bytes) | PASS |
| G1.2 | Sitemap parsed: isIndex flag recorded (boolean) | PASS |
| G1.3 | Unique live paths > 100 (actual: 123) | PASS |
| G1.4 | Doc reports HTTP 200 and content-type application/xml | PASS |
| G1.5 | Doc states whether it is sitemap index | PASS |
| G1.6 | Doc records fetch timestamp (2026-10-07 18:57) | PASS |

**Checked: 6/6**

## G2: Source vs live set comparison completed

| # | Assertion | Status |
|---|---|---|
| G2.1 | Source count reported (31) | PASS |
| G2.2 | Live count reported (123) | PASS |
| G2.3 | BOTH count reported (122) | PASS |
| G2.4 | SOURCE_ONLY count reported (0) | PASS |
| G2.5 | LIVE_ONLY count reported (1) | PASS |
| G2.6 | Sets are disjoint & complete (BOTH + SOURCE_ONLY = source count) | PASS |
| G2.7 | SOURCE_ONLY really absent from live (vacuously true, count=0) | PASS |
| G2.8 | LIVE_ONLY really absent from source (vacuously true, count=0) | PASS |
| G2.9 | Classification is one of allowed four | PASS |
| G2.10 | Classification stated in doc | PASS |

**Checked: 10/10**

## G3: All anomalies auto-verified

| # | Assertion | Status |
|---|---|---|
| G3.1 | Anomaly count >= 7 (actual: 8) | PASS |
| G3.2 | Every anomaly has HTTP status | PASS |
| G3.3 | Every anomaly has canonical checked | PASS |
| G3.4 | Every anomaly has GSC coverage state | PASS |
| G3.5 | Every anomaly has source+live membership | PASS |
| G3.6 | Doc lists every anomaly path | PASS |

**Checked: 6/6**

## G4: Manual Action UNKNOWN not written as NO

| # | Assertion | Status |
|---|---|---|
| G4.1 | Doc states Manual Action = UNKNOWN | PASS |
| G4.2 | Doc says requires manual verification | PASS |
| G4.3 | No declarative "No manual action" claim | PASS |
| G4.4 | No table asserts Manual Action = none | PASS |
| G4.5 | UI phrase only in conditional context | PASS |
| G4.6 | No API endpoint claim (correctly states absence) | PASS |
| G4.7 | Explains why not "no manual action" | PASS |
| G4.8 | Step-by-step manual verification guide present | PASS |
| G4.9 | No false certainty language | PASS |

**Checked: 9/9**

## G5: referringUrls NOT auto-explained as backlinks

| # | Assertion | Status |
|---|---|---|
| G5.1 | U5 doc states U5 = UNKNOWN | PASS |
| G5.2 | Dedicated referringUrls section exists | PASS |
| G5.3 | Falsifying evidence cited (入链 2 条) | PASS |
| G5.4 | "Backlinks = N" forbidden pattern not present | PASS |
| G5.5 | No doc equates referringUrls count with backlinks | PASS |
| G5.6 | Layering explicitly refused | PASS |
| G5.7 | Third-party verdict is YES/NO/DEFER | PASS (DEFER) |
| G5.8 | Semantic distinction from actual backlinks explained | PASS |

**Checked: 8/8**

## G6: U1 causal explanation not written as FACT

| # | Assertion | Status |
|---|---|---|
| G6.1 | Evidence model marks weak-authority cause UNKNOWN | PASS |
| G6.2 | Evidence model marks backlinks-explain-U1 UNKNOWN | PASS |
| G6.3 | Red team H2 = UNPROVEN | PASS |
| G6.4 | Red team H3 = UNPROVEN | PASS |
| G6.5 | Red team H1 = REJECTED | PASS |
| G6.6 | Red team H6 = UNPROVEN | PASS |
| G6.7 | U1-U5 dependency downgraded to UNKNOWN | PASS |
| G6.8 | No doc asserts "backlinks cause 14 uncrawled pages" | PASS |

**Checked: 8/8**

## G7: Zero impressions not explained as not indexed

| # | Assertion | Status |
|---|---|---|
| G7.1 | Evidence model marks it NO (overturned) | PASS |
| G7.2 | Real coverage distribution present | PASS |
| G7.3 | Doc states crawled-not-indexed = 0 | PASS |
| G7.4 | No doc equates zero impressions with not indexed | PASS |
| G7.5 | Submitted and indexed count acknowledged (3) | PASS |

**Checked: 5/5**

## G8: All UNKNOWNs preserved

| # | Assertion | Status |
|---|---|---|
| G8.1 | Evidence model has UNKNOWN section | PASS |
| G8.2 | U_MANUAL_ACTION kept UNKNOWN | PASS |
| G8.3 | U3 search volume kept UNKNOWN | PASS |
| G8.4 | U5 external links kept UNKNOWN | PASS |
| G8.5 | UNKNOWN count stated (7) | PASS |
| G8.6 | No UNKNOWN silently converted to 0 | PASS |
| G8.7 | Sitemap inSitemap cause kept UNKNOWN | PASS |

**Checked: 7/7**

## G9: No gate idle

| # | Assertion | Status |
|---|---|---|
| G9.1 | G1 evaluated at least 1 assertion (6) | PASS |
| G9.2 | G2 evaluated at least 1 assertion (10) | PASS |
| G9.3 | G3 evaluated at least 1 assertion (6) | PASS |
| G9.4 | G4 evaluated at least 1 assertion (9) | PASS |
| G9.5 | G5 evaluated at least 1 assertion (8) | PASS |
| G9.6 | G6 evaluated at least 1 assertion (8) | PASS |
| G9.7 | G7 evaluated at least 1 assertion (5) | PASS |
| G9.8 | G8 evaluated at least 1 assertion (7) | PASS |
| G9.9 | No idle gates detected | PASS |

**Checked: 9/9**

## Summary

| Metric | Value |
|---|---|
| Total assertions | **68** |
| Passed | **68** |
| Failed | **0** |
| Idle gates | **0** |

**Verdict: PASS**
