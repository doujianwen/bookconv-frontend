#!/usr/bin/env node
// Check every versioned JS/TS file; local downloads/builds are not source.
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const data = process.argv.includes('--tracked-from-stdin')
  ? fs.readFileSync(0, 'utf8')
  : execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
const files = data.split('\0').filter(f => /\.(?:[cm]?js|tsx?)$/.test(f) && fs.existsSync(f));
if (!files.length) throw new Error('No tracked source files found; refusing an empty lint pass');
let failed = false;
for (let start = 0; start < files.length; start += 100) {
  const run = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', ...files.slice(start, start + 100), '--max-warnings', '0', '--no-warn-ignored'], { stdio: 'inherit' });
  if (run.error) throw run.error;
  if (run.status !== 0) failed = true;
}
console.log(`Tracked source lint: ${files.length} files, ${failed ? 'FAIL' : 'PASS'}`);
process.exitCode = failed ? 1 : 0;
