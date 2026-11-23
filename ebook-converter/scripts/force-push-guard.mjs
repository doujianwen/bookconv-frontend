#!/usr/bin/env node
// scripts/force-push-guard.mjs
// P2 (2026-11-21): parameter-level guard against destructive force pushes.
//
// WHY: git hooks (pre-push) only receive ref updates on stdin — they cannot see
// the push command-line flags. So "detect --force/-f and equivalents" must be
// done at the caller (the push entry point). The nightly-sync automation only
// has a TEXTUAL "禁止 --force" rule; this script turns that into code.
//
// SAFETY: `--check-only` NEVER executes git push. The live mode is provided for
// future wiring but is NOT invoked by this task (no production push allowed).
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/**
 * Classify git-push arguments for destructive force updates. Pure function.
 * @param {string[]} args arguments that would follow `git push`
 * @returns {{allowed:boolean, reason:string, matched?:string}}
 */
export function classifyPushArgs(args = []) {
  const forceLong = ["--force", "--force-with-lease", "--force-if-includes"];
  for (const a of args) {
    if (typeof a !== "string") continue;
    // exact force flags
    if (forceLong.includes(a)) {
      return { allowed: false, reason: "FORCE_FLAG", matched: a };
    }
    // Round2 P2-A: --force=<x> / --force-with-lease=<x> / --force-if-includes=<x>
    // (git accepts '=' forms; round1 only matched the bare flag → bypass).
    if (/^--force(?:-with-lease|-if-includes)?=/.test(a)) {
      return { allowed: false, reason: "FORCE_FLAG_VALUE", matched: a };
    }
    // -f, -f<combined short flags like -fu>, but NOT "--foo"
    if (/^-f$/.test(a) || /^-[^-]*f/.test(a)) {
      return { allowed: false, reason: "FORCE_SHORT", matched: a };
    }
    // Round2 P2-A: refspec with leading '+' is a forced update. Round1 required
    // a ':' (e.g. +main:main); bare '+main' / '+HEAD' also forces and must be caught.
    if (a.startsWith("+") && a.length > 1) {
      return { allowed: false, reason: "FORCE_REFSPEC", matched: a };
    }
    // Round2 P2-A: --mirror pushes (and force-updates) ALL refs.
    if (a === "--mirror") {
      return { allowed: false, reason: "MIRROR_PUSH", matched: a };
    }
    // delete a remote ref is also destructive
    if (a === "--delete" || /^:refs\//.test(a) || /^:$/.test(a)) {
      return { allowed: false, reason: "DELETE_REF", matched: a };
    }
    // custom receive-pack could bypass server-side protections
    if (a.startsWith("--receive-pack=")) {
      return { allowed: false, reason: "CUSTOM_RECEIVE_PACK", matched: a };
    }
  }
  return { allowed: true, reason: "OK" };
}

/**
 * Check whether remote `branch` is an ancestor of local HEAD (fast-forward safe).
 * Round2 P2-A: remote/branch are derived from the ACTUAL push args, not hardcoded
 * to origin/main (a guard that checks the wrong ref is a false gate).
 */
export function isFastForward(remoteRef = "origin/main", localRef = "HEAD", remoteName = "origin") {
  try {
    execFileSync("git", ["fetch", "--quiet", remoteName], { stdio: "ignore" });
    execFileSync("git", ["merge-base", "--is-ancestor", remoteRef, localRef], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Derive {remoteName, remoteRef, localRef} from push args for the FF check.
 * Handles: `origin main`, `origin main:main`, `origin HEAD:refs/heads/main`,
 * and a bare URL as remote. Returns null if args are too ambiguous (caller then
 * fails closed rather than pushing unverified).
 */
export function resolvePushTarget(args = []) {
  const positional = args.filter((a) => !a.startsWith("-"));
  if (positional.length < 2) return null;
  const remoteName = positional[0];
  const spec = positional[1];
  const [local, remote] = spec.includes(":") ? spec.split(":", 2) : [spec, spec];
  const remoteRef = `${remoteName}/${remote.startsWith("refs/") ? remote.replace(/^refs\/heads\//, "") : remote}`;
  const localRef = local === "HEAD" ? "HEAD" : local;
  return { remoteName, remoteRef, localRef };
}

export function main() {
  const argv = process.argv.slice(2);
  const checkOnly = argv.includes("--check-only");
  const args = argv.filter((a) => a !== "--check-only");
  const verdict = classifyPushArgs(args);
  console.log(JSON.stringify({ ...verdict, args, checkOnly }, null, 2));
  if (!verdict.allowed) {
    console.error(`⛔ 强制推送被拦截：${verdict.reason}（命中 ${verdict.matched}）。工作区未被改动。`);
    process.exit(1);
  }
  if (checkOnly) {
    console.log("✅ CHECK_ONLY：参数安全（非强制），未执行任何 git push。");
    process.exit(0);
  }
  // Live mode: guard fast-forward, then run the (unchanged) push args.
  // Round2: derive the target from actual args; fail closed if unresolvable.
  const target = resolvePushTarget(args);
  const ff = target
    ? isFastForward(target.remoteRef, target.localRef, target.remoteName)
    : false;
  if (!ff) {
    console.error("⛔ 非快进冲突或目标无法判定：安全退出；工作区保留，未 rebase/reset。");
    process.exit(1);
  }
  try {
    const out = execFileSync("git", ["push", ...args], { encoding: "utf8", stdio: "inherit" });
    process.exit(out ? 0 : 0);
  } catch (e) {
    console.error("push 失败：", e.status ?? String(e));
    process.exit(1);
  }
}

if (typeof process !== "undefined" && process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
