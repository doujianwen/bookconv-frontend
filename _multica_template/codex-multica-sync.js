#!/usr/bin/env node
// codex-multica-sync.js — Codex 完成工作后自动同步到 Multica
//
// 用法:
//   node scripts/codex-multica-sync.js update-status <issue-key> <status>
//   node scripts/codex-multica-sync.js add-comment <issue-key> <message-file>
//   node scripts/codex-multica-sync.js complete <issue-key> [summary-file]
//   node scripts/codex-multica-sync.js create <template> [assignee] [priority]
//   node scripts/codex-multica-sync.js list-pending [--project <project-id>]
//
// 状态: backlog, todo, in_progress, in_review, done, blocked, cancelled
// 优先级: none, low, medium, high, urgent
//
// 零外部依赖：只需要 Node.js（系统自带），不依赖 bash/python/git-bash

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── 常量 ──────────────────────────────────────────────────

const VALID_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled'];
const VALID_PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'];

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATE_DIR = path.join(ROOT_DIR, '.multica-templates', 'issues');

// 检测 multica CLI 是否可用
function findMulticaBin() {
    const candidates = [
        'multica',
        'multica.exe',
        'C:\\Program Files\\Multica\\multica.exe',
        `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Programs\\@multicadesktop\\resources\\app.asar.unpacked\\resources\\bin\\multica.exe`,
        '/usr/local/bin/multica',
    ];

    for (const candidate of candidates) {
        try {
            execFileSync(candidate, ['version'], {
                stdio: ['ignore', 'ignore', 'ignore'],
                windowsHide: true,
            });
            return candidate;
        } catch {
            // not found or not executable, try next
        }
    }
    return null;
}

// ── 工具函数 ──────────────────────────────────────────────

function log(...args) {
    console.log('\x1b[36m🔗 [codex-multica]\x1b[0m', ...args);
}

function error(msg) {
    console.error('\x1b[31m❌ [codex-multica]\x1b[0m', msg);
    process.exit(1);
}

function warn(msg) {
    console.warn('\x1b[33m⚠️  [codex-multica]\x1b[0m', msg);
}

function runMultica(args, opts = {}) {
    const bin = findMulticaBin();
    if (!bin) {
        error('multica CLI not found. Install Multica Desktop App or add to PATH.');
    }

    const allArgs = [...args];
    if (!allArgs.includes('--output')) {
        allArgs.push('--output', 'json');
    }

    try {
        const result = execFileSync(bin, allArgs, {
            encoding: 'utf8',
            cwd: ROOT_DIR,
            timeout: 30000,
            windowsHide: true,
        });
        return result.trim();
    } catch (err) {
        if (opts.silent) return null;
        if (err.stdout) return err.stdout.trim();
        throw err;
    }
}

function parseJsonOutput(raw) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// ── Issue Key 解析 ────────────────────────────────────────

let _issueCache = null;

function getIssueCache() {
    if (_issueCache === null) {
        const raw = runMultica(['issue', 'list']);
        const data = parseJsonOutput(raw);
        _issueCache = (data && Array.isArray(data.issues)) ? data.issues : [];
    }
    return _issueCache;
}

function resolveIssueKey(key) {
    // 支持 EBO-11 格式 → 自动解析为 issue ID
    const match = key.match(/^EBO-(\d+)$/);
    if (match) {
        const num = parseInt(match[1], 10);
        const issues = getIssueCache();
        const found = issues.find(i => i.number === num);
        if (found) return found.id;
        error(`Issue EBO-${num} not found in workspace`);
    }
    return key;
}

// ── 子命令 ────────────────────────────────────────────────

function cmdUpdateStatus(args) {
    if (args.length < 2) {
        error('Usage: update-status <issue-key> <status>');
    }

    const key = args[0];
    const status = args[1];

    if (!VALID_STATUSES.includes(status)) {
        error(`Invalid status "${status}". Valid: ${VALID_STATUSES.join(', ')}`);
    }

    const issueId = resolveIssueKey(key);
    log(`Updating issue ${key} → status=${status}`);

    const raw = runMultica(['issue', 'status', issueId, status]);
    const data = parseJsonOutput(raw);

    if (data) {
        console.log(
            `\x1b[32m✅ Updated\x1b[0m: ${data.title || ''} [${data.number || ''}] → ${data.status || status}`
        );
    } else {
        console.log(`\x1b[32m✅ Updated\x1b[0m: ${key} → ${status}`);
    }
}

function cmdAddComment(args) {
    if (args.length < 2) {
        error('Usage: add-comment <issue-key> <message-file>');
    }

    const key = args[0];
    const msgFile = args[1];

    if (!fs.existsSync(msgFile)) {
        error(`Message file not found: ${msgFile}`);
    }

    const issueId = resolveIssueKey(key);
    const msg = fs.readFileSync(msgFile, 'utf8');

    log(`Adding comment to issue ${key}`);

    // 尝试用 --description-file（需要临时文件在当前目录）
    const tmpFile = path.join(ROOT_DIR, '_temp_comment.txt');
    fs.writeFileSync(tmpFile, msg, 'utf8');

    try {
        runMultica(['issue', 'comment', 'add', issueId, '--description-file', '_temp_comment.txt'], { silent: true });
    } catch {
        // fallback: 用 --description 参数
        runMultica(['issue', 'comment', 'add', issueId, '--description', msg]);
    } finally {
        fs.unlinkSync(tmpFile);
    }

    console.log(`\x1b[32m✅ Comment added\x1b[0m to ${key}`);
}

function cmdComplete(args) {
    if (args.length < 1) {
        error('Usage: complete <issue-key> [summary-file]');
    }

    const key = args[0];
    const summaryFile = args[1] || null;

    const issueId = resolveIssueKey(key);
    log(`Completing issue ${key}`);

    // 1. 更新状态为 done
    runMultica(['issue', 'status', issueId, 'done'], { silent: true });

    // 2. 如果有总结，添加评论
    if (summaryFile && fs.existsSync(summaryFile)) {
        const summary = fs.readFileSync(summaryFile, 'utf8');
        const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\.\d+Z/, ' UTC');

        const commentBody = `## ✅ Codex 完成总结

${summary}

---
*Auto-synced from Codex at ${timestamp}*`;

        const tmpFile = path.join(ROOT_DIR, '_temp_comment.txt');
        fs.writeFileSync(tmpFile, commentBody, 'utf8');

        try {
            runMultica(['issue', 'comment', 'add', issueId, '--description-file', '_temp_comment.txt'], { silent: true });
        } catch {
            // fallback
            runMultica(['issue', 'comment', 'add', issueId, '--description', commentBody]);
        } finally {
            fs.unlinkSync(tmpFile);
        }
    }

    console.log(`\x1b[32m✅ Issue ${key}\x1b[0m marked as done`);
}

function cmdCreate(args) {
    if (args.length < 1) {
        error('Usage: create <template-name> [assignee] [priority]');
    }

    const templateName = args[0];
    const assignee = args[1] || '电子书格式转换';
    const priority = args[2] || 'high';

    if (!VALID_PRIORITIES.includes(priority)) {
        error(`Invalid priority "${priority}". Valid: ${VALID_PRIORITIES.join(', ')}`);
    }

    const templateFile = path.join(TEMPLATE_DIR, `${templateName}.md`);
    if (!fs.existsSync(templateFile)) {
        error(`Template not found: ${templateFile}\nAvailable templates: ${fs.readdirSync(TEMPLATE_DIR).filter(f => f.endsWith('.md')).join(', ')}`);
    }

    log(`Creating issue from template: ${templateName}`);

    const content = fs.readFileSync(templateFile, 'utf8');
    const titleLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();

    const tmpFile = path.join(ROOT_DIR, '_temp_issue_desc.txt');
    fs.writeFileSync(tmpFile, content, 'utf8');

    try {
        const raw = runMultica([
            'issue', 'create',
            '--title', `[${titleLine}]`,
            '--description-file', '_temp_issue_desc.txt',
            '--assignee', assignee,
            '--priority', priority,
        ]);

        const data = parseJsonOutput(raw);
        if (data) {
            console.log(
                `\x1b[32m✅ Created\x1b[0m: ${data.title || titleLine} [${data.identifier || ''}]`
            );
        } else {
            console.log(`\x1b[32m✅ Created\x1b[0m: [${titleLine}]`);
        }
    } finally {
        fs.unlinkSync(tmpFile);
    }
}

function cmdListPending(args) {
    log('Listing pending issues...');

    const raw = runMultica(['issue', 'list']);
    const data = parseJsonOutput(raw);

    if (!data || !Array.isArray(data.issues)) {
        error('Failed to parse issues list');
    }

    const statuses = ['todo', 'in_progress', 'in_review'];
    const projectFilter = args[0] && args[0].startsWith('--project')
        ? args[1]
        : null;

    const pending = data.issues.filter(i => {
        if (!statuses.includes(i.status)) return false;
        if (projectFilter && i.project_id !== projectFilter) return false;
        return true;
    });

    if (pending.length === 0) {
        console.log('  (no pending issues)');
        return;
    }

    for (const iss of pending) {
        console.log(`  [\x1b[33m${iss.identifier || ''}\x1b[0m] ${iss.title} — ${iss.status}`);
    }

    console.log(`\n  Total: ${pending.length} pending issue(s)`);
}

// ── 主入口 ────────────────────────────────────────────────

const commands = {
    'update-status': cmdUpdateStatus,
    'add-comment': cmdAddComment,
    'complete': cmdComplete,
    'create': cmdCreate,
    'list-pending': cmdListPending,
};

function showHelp() {
    console.log(`Usage: node scripts/codex-multica-sync.js <command> [args...]

Commands:
  update-status <key> <status>       Update issue status (done, in_progress, ...)
  add-comment <key> <file>           Add comment to issue from file
  complete <key> [summary-file]      Mark done + optional summary comment
  create <template> [agent] [pri]    Create issue from template
  list-pending [--project <id>]      List in-progress issues

Issue Key formats: EBO-11 or full UUID
Statuses: ${VALID_STATUSES.join(', ')}
Priorities: ${VALID_PRIORITIES.join(', ')}

Examples:
  node scripts/codex-multica-sync.js complete EBO-24
  node scripts/codex-multica-sync.js update-status EBO-24 in_progress
  node scripts/codex-multica-sync.js create phase1 电子书格式转换 high
  node scripts/codex-multica-sync.js list-pending
`);
}

const cmd = process.argv[2];
if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    showHelp();
    process.exit(0);
}

if (!commands[cmd]) {
    error(`Unknown command: ${cmd}\nRun with "help" for usage.`);
}

commands[cmd](process.argv.slice(3));
