/** GA exports use either YYYYMMDD or ISO dates. Reject malformed calendar dates. */
export function normalizeGaDate(value) {
  if (typeof value !== 'string') return null;
  const iso = value.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null;
}

export function dailyWindow(rows, end) {
  const normalized = rows.map(row => ({ ...row, date: normalizeGaDate(row.date) }));
  if (normalized.some(row => !row.date)) return { ok: false, reason: '包含缺失或无效日期', rows: [] };
  normalized.sort((a, b) => a.date.localeCompare(b.date));
  if (new Set(normalized.map(row => row.date)).size !== normalized.length) return { ok: false, reason: '日序列包含重复日期', rows: normalized };
  for (let i = 1; i < normalized.length; i++) {
    if (Date.parse(normalized[i].date) - Date.parse(normalized[i - 1].date) !== 864e5) return { ok: false, reason: '日序列存在日期缺口', rows: normalized };
  }
  const last = normalized.at(-1)?.date;
  return { ok: last === end, reason: `序列末端日期 ${last ?? '缺失'}，期望T-1 ${end}`, rows: normalized };
}
