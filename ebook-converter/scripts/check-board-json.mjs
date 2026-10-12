// scripts/check-board-json.mjs
// 作战板 JSON 门禁：nightly-sync 等自动流程写 data/seo-geo-board.json 后，
// 必须跑本门禁再 commit。判据直接 import 真源码 src/lib/board/loader.ts 的
// validateBoardData（node --experimental-strip-types 加载 TS，不抄实现），
// 防再次出现 2026-10-11 tier SUPPORT 事故（线上 500）。
//
// 退出码：0=合法 | 1=数据非法 | 2=判据无法执行（校验器加载失败，禁静默当通过）
// 用法：node --experimental-strip-types scripts/check-board-json.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data', 'seo-geo-board.json');

// ① 判据有效性自检：先验证校验器能加载且对「合法/非法」样本给出正确结论，
//    否则 exit 2（不可判定 ≠ PASS）。
let validateBoardData;
// loader.ts 是无扩展名 TS import（tsc 惯例），strip-types ESM 需显式 .ts。
// 机械改写相对导入（只补扩展名，不动逻辑）到临时副本再 import：
// 执行的始终是 src 源码里的校验器，不做逻辑复制。
import { tmpdir } from 'node:os';
import { mkdtempSync, writeFileSync as wSync, rmSync } from 'node:fs';
try {
  const src = readFileSync(join(ROOT, 'src/lib/board/loader.ts'), 'utf8');
  const patched = src
    .replace(/(from\s+'\.\/[a-z-]+)'/g, "$1.ts'")
    // JSON 相对导入在临时目录会解析错位 → 指回真实板子文件
    .replace(/'(?:\.\.\/)+data\/seo-geo-board\.json'/, JSON.stringify(pathToFileURL(DATA).href));
  const dir = mkdtempSync(join(tmpdir(), 'board-gate-'));
  const patch = (s) => s.replace(/(from\s+'\.\/[a-z-]+)'/g, "$1.ts'");
  // loader 的相对依赖（derive/types）也要落到同一临时目录
  for (const f of ['derive.ts', 'types.ts']) {
    try { wSync(join(dir, f), patch(readFileSync(join(ROOT, 'src/lib/board', f), 'utf8'))); } catch {}
  }
  const tmpLoader = join(dir, 'gate-loader.ts');
  wSync(tmpLoader, patched);
  try {
    ({ validateBoardData } = await import(pathToFileURL(tmpLoader).href));
  } finally { rmSync(dir, { recursive: true, force: true }); }
} catch (e) {
  console.error('UNKNOWN: 校验器加载失败 →', String(e?.message || e).slice(0, 200));
  process.exit(2);
}
const judge = (raw) => {
  try { validateBoardData(JSON.parse(raw)); return true; }
  catch { return false; }
};
// 自检只用于证伪判据本身：全部用独立构造的样本，绝不依赖被测数据当前状态
// （否则数据坏时自检先挂，真 FAIL 被吞成 UNKNOWN）。
const minValid = { modules: [{ id: 'MX', name: 'x', tier: 'CORE', tasks: [
  { id: 'MX-1', status: 'todo', priority: 'P0', tier: 'CORE',
    action: 'a', detail: 'd', accept: 'acc', owner: 'O', due: '2026-01-01' }]}] };
const clone = (o) => JSON.parse(JSON.stringify(o));
const selftestOk =
  judge(JSON.stringify(minValid)) === true &&                       // 合法样本 → true
  (() => { const b = clone(minValid); b.modules[0].tasks[0].status = 'archived';
           return judge(JSON.stringify(b)) === false; })() &&       // 坏 status → false
  judge(JSON.stringify({ modules: [{ id: 'MX', name: 'x', tier: 'SUPPORT', tasks: [] }] })) === false && // 事故 tier → false
  (() => { const b = clone(minValid); delete b.modules[0].tasks[0].owner;
           return judge(JSON.stringify(b)) === false; })();         // 缺 owner → false
if (!selftestOk) {
  console.error('UNKNOWN: 判据自检失败（校验器对已知样本结论错误）——门禁不可信');
  process.exit(2);
}

// ② 正式判定
let valid, err = '';
try {
  validateBoardData(JSON.parse(readFileSync(DATA, 'utf8')));
  valid = true;
} catch (e) { valid = false; err = String(e?.message || e); }

if (!valid) {
  console.error('FAIL: seo-geo-board.json 未通过校验，禁止 commit：\n' + err);
  process.exit(1);
}
console.log('PASS: seo-geo-board.json 校验通过');
process.exit(0);
