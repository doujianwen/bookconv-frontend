#!/usr/bin/env node
// scripts/verify-hook-mount.mjs
// 门禁挂载自检（工作流迭代 #1，2026-11-07）。
//
// 要解决的不是「有没有门禁」，而是「当前 git 实际执行的是哪一份门禁」。
// 旧状态：.git/hooks/ 不入库，换机器后 pre-commit / pre-push 静默消失，
// 而 audit-agent-discipline 的 I4 只读 .git/hooks/ ⇒ 要么误报无挂载、
// 要么读到一份早已不生效的旧副本（假挂载）。
//
// 判据（只测不变量）：
//   1. .git/config 可读且 [core].hooksPath 指向入库目录；
//   2. 生效目录下 pre-commit 与 pre-push 【都】存在（只搬一个 = 另一个静默失效）；
//   3. 生效文件与入库版本 SHA256 一致（防两份漂移）；
//   4. .git/hooks/ 旧副本存在时明示「不生效」，避免被当成已挂载。
//
// 三态：PASS=0 / FAIL=1 / UNKNOWN=2（配置不可读等不可判定情形）。
// --self-test 做注入/恢复反向验证，不依赖真实仓库状态。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolveHooksDir, readHooksPathFromConfig, TRACKED_HOOKS_REL, FIX_COMMAND, REQUIRED_HOOKS } from './lib/hooks-path.mjs';

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

export function evaluate(repoRoot) {
  const cfg = readHooksPathFromConfig(repoRoot);
  const state = resolveHooksDir(repoRoot, cfg);
  const problems = [];
  const unknowns = [];
  const notes = [];

  if (!state.configReadable) {
    return { verdict: 'UNKNOWN', problems, unknowns: [`读不到 .git/config（${repoRoot}）⇒ 挂载状态不可判定`], notes, state };
  }
  if (!state.configured) {
    problems.push('未设置 core.hooksPath ⇒ git 仍执行不入库的 .git/hooks/，换机器门禁静默消失');
  } else if (state.configured.replace(/\\/g, '/') !== TRACKED_HOOKS_REL) {
    problems.push(`core.hooksPath=${state.configured}，不是入库目录 ${TRACKED_HOOKS_REL}`);
  }

  const hooks = {};
  for (const name of REQUIRED_HOOKS) {
    const active = path.join(state.dir, name);
    const tracked = path.join(state.trackedDir, name);
    const exists = fs.existsSync(active);
    const trackedExists = fs.existsSync(tracked);
    hooks[name] = { active, exists, trackedExists, shaMatch: null };
    if (!exists) {
      problems.push(`生效目录缺 ${name} ⇒ 该钩子不会执行（只搬一个钩子会让另一个静默失效）`);
      continue;
    }
    if (!trackedExists) {
      problems.push(`入库目录缺 ${name} ⇒ 无法比对，门禁不可移植`);
      continue;
    }
    hooks[name].shaMatch = sha(active) === sha(tracked);
    if (!hooks[name].shaMatch) problems.push(`${name}：生效副本与入库版本 SHA 不一致 ⇒ 存在漂移`);
  }

  if (state.configured) {
    const legacy = REQUIRED_HOOKS.filter((n) => fs.existsSync(path.join(state.legacyDir, n)));
    if (legacy.length) notes.push(`.git/hooks/ 旧副本仍存在（${legacy.join(', ')}），hooksPath 生效时【不执行】；勿把它当作已挂载证据`);
  }

  const verdict = problems.length ? 'FAIL' : (unknowns.length ? 'UNKNOWN' : 'PASS');
  return { verdict, problems, unknowns, notes, hooks, state };
}

function render(result) {
  const { verdict, problems, unknowns, notes, state } = result;
  console.log(`=== 门禁挂载自检 ===`);
  console.log(`来源：${state.source}${state.configured ? ` = ${state.configured}` : ''}`);
  console.log(`生效目录：${state.dir}`);
  for (const p of problems) console.log(`⛔  ${p}`);
  for (const u of unknowns) console.log(`⚠️  UNKNOWN  ${u}`);
  for (const n of notes) console.log(`ℹ️  ${n}`);
  if (verdict === 'PASS') {
    console.log(`✅ PASS：pre-commit / pre-push 均从入库目录生效且与仓库版本一致`);
  } else if (verdict === 'FAIL') {
    console.log(`修复（一步）：${FIX_COMMAND}`);
  }
  console.log(`裁定：${verdict}`);
  return verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 2;
}

function selfTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-mount-selftest-'));
  const mk = (rel, content) => {
    const p = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
    return p;
  };
  const tracked = (name, content) => mk(`${TRACKED_HOOKS_REL}/${name}`, content);
  const cfg = (v) => mk('.git/config', v === null ? '[core]\n\trepositoryformatversion = 0\n' : `[core]\n\thooksPath = ${v}\n`);
  const cases = [];
  const run = (label, expected) => {
    const r = evaluate(tmp);
    const ok = r.verdict === expected;
    cases.push({ label, expected, actual: r.verdict, ok });
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: 期望 ${expected} / 实得 ${r.verdict}`);
    return ok;
  };

  console.log('=== selfTest（注入/恢复反向验证）===');
  // 恢复态：完整挂载
  cfg(TRACKED_HOOKS_REL);
  tracked('pre-commit', '#!/bin/sh\nexit 0\n');
  tracked('pre-push', '#!/bin/sh\nexit 0\n');
  let allOk = run('完整挂载（恢复态）', 'PASS');

  // 注入 1：未设置 hooksPath
  cfg(null);
  allOk = run('注入：未设置 hooksPath', 'FAIL') && allOk;
  // 注入 2：只搬一个钩子
  cfg(TRACKED_HOOKS_REL);
  fs.rmSync(path.join(tmp, TRACKED_HOOKS_REL, 'pre-push'));
  allOk = run('注入：缺 pre-push', 'FAIL') && allOk;
  // 注入 3：生效副本漂移（hooksPath 指向另一目录，内含不同内容）
  mk('other-hooks/pre-commit', '#!/bin/sh\nexit 0\n');
  mk('other-hooks/pre-push', '#!/bin/sh\nexit 0\n');
  tracked('pre-push', '#!/bin/sh\nexit 0\n');
  cfg('other-hooks');
  allOk = run('注入：hooksPath 指向非入库目录', 'FAIL') && allOk;
  // 注入 4：配置文件不可读
  fs.rmSync(path.join(tmp, '.git/config'));
  allOk = run('注入：配置不可读', 'UNKNOWN') && allOk;
  // 恢复
  cfg(TRACKED_HOOKS_REL);
  allOk = run('恢复：完整挂载', 'PASS') && allOk;

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`selfTest 汇总：${cases.filter((c) => c.ok).length}/${cases.length} PASS`);
  return allOk ? 0 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  if (process.argv.includes('--self-test')) process.exit(selfTest());
  process.exit(render(evaluate(repoRoot)));
}
