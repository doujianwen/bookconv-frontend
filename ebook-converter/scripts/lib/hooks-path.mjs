#!/usr/bin/env node
// scripts/lib/hooks-path.mjs
// 解析当前仓库【实际生效】的 hooks 目录（单一事实源，供门禁与自检脚本共用）。
//
// Git 优先级：core.hooksPath（.git/config 的 [core] 段）> $GIT_DIR/hooks。
// 相对 hooksPath 相对于 hooks 运行目录；非 bare 仓库即工作树根（repoRoot）。
//
// 纯 fs 实现：本机实测 Node 内 fork git 恒 EBUSY(status=null)，
// 见 audit-agent-discipline.mjs 头部纪律与 _wb_tmp/probe-fork.mjs ⇒ 禁止 spawn。
import fs from 'node:fs';
import path from 'node:path';

export const TRACKED_HOOKS_REL = 'ebook-converter/scripts/hooks';
export const FIX_COMMAND = 'git config core.hooksPath ebook-converter/scripts/hooks';
export const REQUIRED_HOOKS = ['pre-commit', 'pre-push'];

/** 只取 [core] 段内的 hooksPath，避免误读其它段或注释行。 */
export function readHooksPathFromConfig(repoRoot) {
  const cfg = path.join(repoRoot, '.git', 'config');
  let text;
  try {
    text = fs.readFileSync(cfg, 'utf8');
  } catch {
    return { readable: false, value: null };
  }
  let inCore = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('[')) {
      inCore = /^\[core\](?:\s|$)/i.test(line);
      continue;
    }
    if (!inCore || !line || line.startsWith('#') || line.startsWith(';')) continue;
    const m = line.match(/^hooksPath\s*=\s*(.+)$/i);
    if (m) return { readable: true, value: m[1].trim().replace(/^"|"$/g, '') };
  }
  return { readable: true, value: null };
}

export function resolveHooksDir(repoRoot, configResult = readHooksPathFromConfig(repoRoot)) {
  const value = configResult.value;
  return {
    configReadable: configResult.readable,
    configured: value,
    source: value ? 'core.hooksPath' : '$GIT_DIR/hooks (default)',
    dir: value
      ? (path.isAbsolute(value) ? value : path.join(repoRoot, value))
      : path.join(repoRoot, '.git', 'hooks'),
    trackedDir: path.join(repoRoot, TRACKED_HOOKS_REL),
    legacyDir: path.join(repoRoot, '.git', 'hooks'),
  };
}
