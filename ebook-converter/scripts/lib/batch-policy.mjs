// Current owner-approved policy: free public beta, Pro planned after beta.
// This is a targeted regression guard, not a general natural-language fact checker.
export function batchPolicyViolations(line) {
  const rules = [
    /(?:batch conversion|batch mode|batch) is (?:a )?Pro feature/gi,
    /batch conversion is (?:included|available) (?:with|on) (?:our |the )?Pro plan/gi,
    /Pro accounts? (?:add|handle) batch(?:es| conversion| queueing)/gi,
    /Pro adds batch (?:conversion|upload)/gi,
    /(?:conversión por lotes|lotes) (?:es|son) una función (?:de )?Pro/gi,
    /(?:conversión por lotes|lotes) est[áa]n? incluid[ao]s? en el plan Pro/gi,
  ];
  const hits = [];
  for (const sentence of line.split(/(?<=[.!?])\s+|\\n/)) {
    // Explicit competitor ownership is outside this BookConv policy.
    if (/^\s*(?:CloudConvert|Convertio|Zamzar)\b/i.test(sentence)) continue;
    if (/\b(?:not|never|no longer)\s+(?:a\s+)?Pro feature/i.test(sentence)) continue;
    for (const rule of rules) {
      rule.lastIndex = 0;
      if (rule.test(sentence)) hits.push(sentence.trim());
    }
  }
  return [...new Set(hits)];
}
