#!/usr/bin/env bash
# Phase 1.2 Gate — G11 Reverse-Injection Verification
#
# Purpose: prove that the G1-G9 assertions in SEO_RECOVERY_PHASE1_2_GATE.md
# are NOT vacuous. We inject a violation of two representative assertions
# (G7.1 src/ unmodified; G5 no UNKNOWN-as-0 claims) and confirm the gate's
# detection logic fires, then confirm the real repo state passes.
#
# Usage: bash scripts/phase1_2_reverse_injection.sh
set -u

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT/ebook-converter" || { echo "cannot cd to ebook-converter"; exit 1; }

PROBE="src/__G11_PROBE__.ts"
trap 'rm -f "$PROBE" 2>/dev/null' EXIT

count_nonempty() { grep -c . ; }

echo "=== G11 Reverse-Injection Evidence (Phase 1.2 Gate) ==="
echo "repo root: $REPO_ROOT"
echo

# ---------------------------------------------------------------
# G7.1 — src/ must be unmodified (git status --porcelain src/ == empty)
# ---------------------------------------------------------------
echo "## G7.1 — src/ unmodified"
BASE_LINES=$(git status --porcelain src/)
BASE_N=$(printf '%s\n' "$BASE_LINES" | count_nonempty)
printf '// G11 probe - removed by trap\n' > "$PROBE"
INJ_LINES=$(git status --porcelain src/)
INJ_N=$(printf '%s\n' "$INJ_LINES" | count_nonempty)
PROBE_PRESENT=$(printf '%s\n' "$INJ_LINES" | grep -c "__G11_PROBE__")
rm -f "$PROBE"
REST_LINES=$(git status --porcelain src/)
REST_N=$(printf '%s\n' "$REST_LINES" | count_nonempty)
PROBE_GONE=$(printf '%s\n' "$REST_LINES" | grep -c "__G11_PROBE__")
echo "  baseline src/ dirty entries : $BASE_N"
echo "  injected probe present?     : $PROBE_PRESENT (expect 1)"
echo "  after-rm probe present?     : $PROBE_GONE (expect 0)"
echo "  count baseline -> injected  : $BASE_N -> $INJ_N (expect +1)"
if [ "$PROBE_PRESENT" = "1" ] && [ "$PROBE_GONE" = "0" ] && [ "$INJ_N" = "$((BASE_N + 1))" ]; then
  echo "  [PASS] G7.1 detector sensitive & reversible"
  G7=PASS
else
  echo "  [FAIL] G7.1 detector issue"
  G7=FAIL
fi
echo "  note: baseline $BASE_N dirty entries are parallel-writer modules"
echo "        (competitors/keywords/*, blog/index.ts, content/mobi-to-txt.ts) —"
echo "        out of G11 scope; not modified by this verification."
echo

# ---------------------------------------------------------------
# G5 — no UNKNOWN substituted as 0 (no "Backlinks = 0" / "Search Volume = 0"
#      / "No manual action" claims in docs)
# ---------------------------------------------------------------
echo "## G5 — no UNKNOWN-as-0 claims in tracked *.md"
PATTERN='Backlinks?[[:space:]]*=[[:space:]]*0|Search[[:space:]]Volume[[:space:]]*=[[:space:]]*0|No[[:space:]][Mm]anual[[:space:]][Aa]ction'
RAW=$(git grep -I -n -E "$PATTERN" -- '*.md' 2>/dev/null)
RAW_N=$(printf '%s\n' "$RAW" | count_nonempty)
SELFREF=$(printf '%s\n' "$RAW" | grep -cE "GATE\.md|REDTEAM")
EFFECTIVE=$((RAW_N - SELFREF))
echo "  raw grep hits across *.md   : $RAW_N"
echo "  of which self-referential   : $SELFREF (gate/redteam definitional text)"
echo "  effective content violations: $EFFECTIVE (expect 0)"

# reverse injection: a doc containing the forbidden pattern MUST be caught
TMP="/tmp/g11_g5_probe_$$.md"
printf 'Our Backlinks = 0 and No manual action was found by Google.\n' > "$TMP"
INJ2=$(grep -E "$PATTERN" "$TMP" | count_nonempty)
rm -f "$TMP"
echo "  injected probe doc matched  : $INJ2 (expect >0 -> detector fires)"
if [ "$EFFECTIVE" = "0" ] && [ "$INJ2" != "0" ]; then
  echo "  [PASS] G5 detector sensitive; no real content violations"
  G5=PASS
else
  echo "  [FAIL] G5 detector issue"
  G5=FAIL
fi
echo

# ---------------------------------------------------------------
# Summary
# ---------------------------------------------------------------
echo "=== G11 verdict ==="
echo "G7.1 reverse injection : $G7"
echo "G5   reverse injection : $G5"
if [ "$G7" = "PASS" ] && [ "$G5" = "PASS" ]; then
  echo "G11.2 (assertion effectiveness) : PASS"
  echo "G11.3 (>=1 reverse injection)   : PASS"
  echo "OVERALL : PASS"
  exit 0
else
  echo "OVERALL : FAIL"
  exit 1
fi
