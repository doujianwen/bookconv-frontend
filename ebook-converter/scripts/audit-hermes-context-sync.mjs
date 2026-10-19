#!/usr/bin/env node
// hermes-context 镜像同步门禁（2026-10-11，智能化批次②）
// 判据：清单内每一对「主文档 ↔ hermes-context 副本」必须逐字节一致。
// 退出码：0=全部一致；1=存在漂移（列出首处差异行号）；2=任一文件缺失（不可判定）。
// 副本定位=只读执行上下文，单向镜像（主 → 副本），禁止在副本侧独立编辑。
// 用法：node scripts/audit-hermes-context-sync.mjs
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
// 新增镜像对时在此登记（主文档路径, 副本路径）
const PAIRS = [
  ['docs/seo-geo-execution-plan-2026-09-17.md', 'hermes-context/seo-geo-execution-plan-2026-09-17.md'],
  // 2026-10-20 GEO 四项攻坚族 + 事故分析（主 docs/ → 只读镜像 hermes-context/）
  ['docs/ENTITY.md', 'hermes-context/ENTITY.md'],
  ['docs/entity-drift-audit-2026-10-19.md', 'hermes-context/entity-drift-audit-2026-10-19.md'],
  ['docs/geo-action-plan-2026-10-19.md', 'hermes-context/geo-action-plan-2026-10-19.md'],
  ['docs/faq-audit-2026-10-20.md', 'hermes-context/faq-audit-2026-10-20.md'],
  ['docs/golden-sentence-template-2026-10-20.md', 'hermes-context/golden-sentence-template-2026-10-20.md'],
  ['docs/incident-2026-10-19-epub-pdf-input-task-failed.md', 'hermes-context/incident-2026-10-19-epub-pdf-input-task-failed.md'],
];

let failed = 0, undecidable = 0;
for (const [main, copy] of PAIRS) {
  const mainAbs = resolve(ROOT, main), copyAbs = resolve(ROOT, copy);
  let a, b;
  try { a = readFileSync(mainAbs); } catch { console.error(`exit 2: 主文档缺失 ${main}`); undecidable++; continue; }
  try { b = readFileSync(copyAbs); } catch { console.error(`exit 2: 副本缺失 ${copy}`); undecidable++; continue; }
  if (a.equals(b)) { console.log(`OK  ${main} == ${copy}`); continue; }
  // 定位首个差异行号，方便修复
  const al = a.toString('utf8').split('\n'), bl = b.toString('utf8').split('\n');
  let line = 0;
  for (let i = 0; i < Math.max(al.length, bl.length); i++) {
    if (al[i] !== bl[i]) { line = i + 1; break; }
  }
  console.error(`FAIL  ${copy} 与主文档漂移（首处差异约 L${line}；主 ${al.length} 行 / 副本 ${bl.length} 行）`);
  console.error(`      修复：cp "${main}" "${copy}"（副本为只读镜像，以主文档为准）`);
  failed++;
}

if (undecidable) process.exit(2);
if (failed) process.exit(1);
console.log(`镜像同步门禁：${PAIRS.length} 对全部一致`);
process.exit(0);
