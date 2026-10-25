#!/usr/bin/env node
/**
 * 纪律存活探针（Discipline Liveness Probe）
 *
 * 来源：docs/SEO-GEO方法论复盘与迭代-V3.0-2026-10-25.md §4.5
 * 教训：self-audit-before-output 在 E:\WorkBuddyData\skills 躺了 16 天零加载，
 *       SKILL.md 一直"存在"，任何人 ls 都能看到 —— 存在 ≠ 生效。
 *       所以本探针拒绝用"文件存在"证明部署，必须拿到"上次实际触发时间"。
 *
 * 三态退出码（对齐项目 discipline-portability-2026-10-05.md:142）：
 *   0 = 全部实测为真
 *   1 = 实测为假（FAIL）
 *   2 = 不可判定（无法检查，绝不静默当通过）
 *
 * 用法：
 *   node scripts/liveness-probe.mjs
 *   node scripts/liveness-probe.mjs --json
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = os.homedir();
const SKILLS_DIR = path.join(HOME, ".workbuddy-ai", "skills");
const USAGE_LOG = path.join(HOME, ".workbuddy-ai", "skill-usage.log");

/** 判断类纪律 skill 必须全部在位。少一个 = 判断纪律失效。
 *
 * cadence 分两档，避免"按需 skill 用 7 天窗口卡"产生假 FAIL
 * （假 FAIL 会让探针变噪声 → 被忽略，即 critic-design-v1.md:66 记录的事故）：
 *   always    = 每次结论前都该跑，超过 7 天未触发 = 真的失效
 *   on-demand = 高 stakes 才跑，90 天内未触发 = 仍在部署验证期内
 */
const REQUIRED_SKILLS = [
  { name: "self-audit-before-output", cadence: "always" }, // 输出前强制关卡（核心）
  { name: "socratic-audit", cadence: "on-demand" }, // 高 stakes 深度二次红队
  { name: "gate-discipline-audit", cadence: "on-demand" }, // 写门禁的纪律
  { name: "data-provenance-audit", cadence: "on-demand" }, // 数据来源裁决
];

const MAX_AGE_DAYS = { always: 7, "on-demand": 90 };

const results = [];
function record(id, name, state, detail) {
  results.push({ id, name, state, detail });
}

// ---------------------------------------------------------------- P1-a 存在性
function checkExistence() {
  const missing = [];
  const broken = [];

  for (const { name: skill } of REQUIRED_SKILLS) {
    const dir = path.join(SKILLS_DIR, skill);
    const file = path.join(dir, "SKILL.md");

    if (!fs.existsSync(dir)) {
      missing.push(skill);
      continue;
    }
    if (!fs.existsSync(file)) {
      broken.push(`${skill}（无 SKILL.md）`);
      continue;
    }

    // frontmatter 校验：name 必须存在且与目录名一致，否则运行时不认
    const raw = fs.readFileSync(file, "utf8");
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) {
      broken.push(`${skill}（无 frontmatter）`);
      continue;
    }
    const nameLine = m[1].match(/^name:\s*(.+)$/m);
    const declared = nameLine ? nameLine[1].trim().replace(/^["']|["']$/g, "") : "";
    if (!declared) {
      broken.push(`${skill}（frontmatter 缺 name）`);
    } else if (declared !== skill) {
      broken.push(`${skill}（name="${declared}" ≠ 目录名）`);
    } else if (!/^description:\s*\S/m.test(m[1])) {
      broken.push(`${skill}（frontmatter 缺 description）`);
    }
  }

  // checked>0 守卫：一个都没查就报 PASS 是假门禁
  const checked = REQUIRED_SKILLS.length;
  if (checked === 0) {
    record("P1", "判断类 skill 在位", "UNDECIDABLE", "checked=0，未检查任何 skill（假门禁）");
    return;
  }

  if (missing.length || broken.length) {
    record(
      "P1",
      "判断类 skill 在位",
      "FAIL",
      `checked=${checked} / 缺失=${missing.length} / 格式错=${broken.length}` +
        (missing.length ? `\n      缺失: ${missing.join(", ")}` : "") +
        (broken.length ? `\n      格式错: ${broken.join(", ")}` : "")
    );
  } else {
    record("P1", "判断类 skill 在位", "PASS", `checked=${checked}，路径 ${SKILLS_DIR}`);
  }
}

// ------------------------------------------------- P1-b 触发心跳（真正的存活判据）
function checkHeartbeat() {
  // 日志缺失/为空不单独判死，统一走下面的 never 分支：
  // always 档会因此 FAIL（真失效），on-demand 档为 PENDING（部署未验证）。
  const lines = fs.existsSync(USAGE_LOG)
    ? fs
        .readFileSync(USAGE_LOG, "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
    : [];

  // 取每个 skill 最近一次触发
  const last = new Map();
  for (const line of lines) {
    const m = line.match(/^(\S+)\s+(\S+)/);
    if (!m) continue;
    const ts = Date.parse(m[1]);
    if (Number.isNaN(ts)) continue;
    const skill = m[2];
    if (!last.has(skill) || last.get(skill) < ts) last.set(skill, ts);
  }

  const now = Date.now();
  const hardFail = []; // 超期（该跑没跑）
  const pending = []; // 已部署、尚未触发过（无法证明生效）
  for (const { name: skill, cadence } of REQUIRED_SKILLS) {
    const maxAge = MAX_AGE_DAYS[cadence];
    if (!last.has(skill)) {
      // always 档从未触发 = 直接失效；on-demand 档从未触发 = 部署未验证
      if (cadence === "always") hardFail.push(`${skill}(从未触发)`);
      else pending.push(`${skill}(从未触发)`);
      continue;
    }
    const ageDays = (now - last.get(skill)) / 864e5;
    if (ageDays > maxAge) {
      hardFail.push(`${skill}(${Math.floor(ageDays)}d>${maxAge}d)`);
    }
  }

  if (hardFail.length) {
    record(
      "P1b",
      "skill 触发心跳",
      "FAIL",
      `超期/失效: ${hardFail.join(", ")}` +
        (pending.length ? `\n      尚未触发（不影响判定）: ${pending.join(", ")}` : "")
    );
  } else if (pending.length) {
    record(
      "P1b",
      "skill 触发心跳",
      "PENDING",
      `always 档正常；按需档尚未触发过，无法证明生效: ${pending.join(", ")}`
    );
  } else {
    record("P1b", "skill 触发心跳", "PASS", `${REQUIRED_SKILLS.length} 个 skill 均在各自节奏窗口内触发过`);
  }
}

// ------------------------------------------------- P2 pre-commit 钩子在位
// 风险来源：MEMORY 0-A #8 —— .git/hooks/ 不入库，换机器必须手动重装。
// 判据：文件存在 + 可执行位。只判存在不判可执行 = 半个假门禁。
function checkGitHooks() {
  // 仓库根在 ebook-converter 的上一级
  const repoRoot = path.resolve(process.cwd(), "..");
  const hooksDir = path.join(repoRoot, ".git", "hooks");
  const required = ["pre-commit", "pre-push"];

  if (!fs.existsSync(hooksDir)) {
    record("P2", "git 钩子在位", "UNDECIDABLE", `找不到钩子目录 ${hooksDir}`);
    return;
  }

  const missing = [];
  const notExec = [];
  for (const h of required) {
    const p = path.join(hooksDir, h);
    if (!fs.existsSync(p)) {
      missing.push(h);
      continue;
    }
    try {
      fs.accessSync(p, fs.constants.X_OK);
    } catch {
      notExec.push(h);
    }
  }

  if (missing.length || notExec.length) {
    record(
      "P2",
      "git 钩子在位",
      "FAIL",
      `checked=${required.length}` +
        (missing.length ? ` 缺失: ${missing.join(", ")}` : "") +
        (notExec.length ? ` 不可执行: ${notExec.join(", ")}` : "")
    );
  } else {
    record("P2", "git 钩子在位", "PASS", `checked=${required.length}，${hooksDir}`);
  }
}

// ------------------------------------------------------- 汇总与退出码
function main() {
  const asJson = process.argv.includes("--json");

  checkExistence();
  checkHeartbeat();
  checkGitHooks();

  const fail = results.filter((r) => r.state === "FAIL");
  const undecidable = results.filter((r) => r.state === "UNDECIDABLE");
  const pending = results.filter((r) => r.state === "PENDING");
  const pass = results.filter((r) => r.state === "PASS");

  // 三态退出码：0=实测为真 / 1=实测为假 / 2=不可判定
  // PENDING（已部署但尚未触发过）归入"不可判定"——不能用"文件存在"冒充"已生效"
  let code = 0;
  if (fail.length) code = 1;
  else if (undecidable.length || pending.length) code = 2;

  if (asJson) {
    console.log(JSON.stringify({ code, results }, null, 2));
    process.exit(code);
  }

  console.log("纪律存活探针 · " + new Date().toISOString().slice(0, 19).replace("T", " "));
  console.log("─".repeat(64));
  for (const r of results) {
    const icon =
      r.state === "PASS" ? "✅" : r.state === "FAIL" ? "❌" : r.state === "PENDING" ? "🟡" : "⚠️ ";
    console.log(`${icon} [${r.id}] ${r.name}: ${r.state}`);
    console.log(`    ${r.detail}`);
  }
  console.log("─".repeat(64));
  console.log(
    `合计 ${results.length} 项：PASS ${pass.length} / FAIL ${fail.length} / PENDING ${pending.length} / UNDECIDABLE ${undecidable.length} → exit ${code}`
  );
  if (code === 1) {
    console.log("\n🔴 纪律层失效。在修复前，任何「结论已过自检」的说法都不可主张。");
  } else if (code === 2) {
    console.log("\n🟡 无法判定。存在「已部署但从未触发」的 skill —— 不等于失效，但也不能宣称生效。");
  }
  process.exit(code);
}

main();
