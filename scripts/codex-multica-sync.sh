#!/usr/bin/env bash
# codex-multica-sync.sh — Codex 完成工作后自动同步到 Multica
#
# 用法:
#   ./scripts/codex-multica-sync.sh update-status <issue-id-or-key> <status>
#   ./scripts/codex-multica-sync.sh add-comment <issue-id-or-key> <message-file>
#   ./scripts/codex-multica-sync.sh complete <issue-id-or-key> [summary-file]
#   ./scripts/codex-multica-sync.sh create-from-template <template-name> [assignee] [priority]
#   ./scripts/codex-multica-sync.sh list-pending [--project <project-id>]
#
# 状态: backlog, todo, in_progress, in_review, done, blocked, cancelled
# 优先级: none, low, medium, high, urgent

set -euo pipefail

WORKSPACE_DIR="$(cd "$(dirname "$0")/../" && pwd)"
TEMPLATE_DIR="$WORKSPACE_DIR/.multica-templates/issues"
MULTICA_BIN="$(command -v multica || echo '')"

# ── 工具函数 ──────────────────────────────────────────────

log() { echo "🔗 [codex-multica] $*"; }
error() { echo "❌ [codex-multica] $*" >&2; exit 1; }

ensure_multica() {
    if [[ -z "$MULTICA_BIN" ]]; then
        error "multica CLI not found in PATH. Install or add to PATH."
    fi
}

resolve_issue_key() {
    local key="$1"
    # 支持 EBO-11 格式 → 自动解析为 issue ID
    if [[ "$key" =~ ^EBO-([0-9]+)$ ]]; then
        local num="${BASH_REMATCH[1]}"
        local result
        result=$(multica issue list --output json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for iss in data.get('issues', []):
    if iss.get('number') == $num:
        print(iss['id'])
        sys.exit(0)
sys.exit(1)
" 2>/dev/null) || true
        if [[ -n "$result" ]]; then
            echo "$result"
            return
        fi
        error "Issue EBO-$num not found in workspace"
    fi
    echo "$key"
}

# ── 子命令 ────────────────────────────────────────────────

cmd_update_status() {
    ensure_multica
    local key="${1:?Usage: update-status <issue-key> <status>}"
    local status="${2:?Usage: update-status <issue-key> <status>}"

    local issue_id
    issue_id=$(resolve_issue_key "$key")

    log "Updating issue $key → status=$status"
    multica issue status "$issue_id" "$status" --output json 2>&1 | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Updated: {data.get(\"title\", \"\")} [{data.get(\"number\", \"\")}] → {data.get(\"status\", \"\")}')
" 2>/dev/null || multica issue status "$issue_id" "$status"
}

cmd_add_comment() {
    ensure_multica
    local key="${1:?Usage: add-comment <issue-key> <message-file>}"
    local msg_file="${2:?Usage: add-comment <issue-key> <message-file>}"

    if [[ ! -f "$msg_file" ]]; then
        error "Message file not found: $msg_file"
    fi

    local issue_id
    issue_id=$(resolve_issue_key "$key")

    log "Adding comment to issue $key"
    multica issue comment add "$issue_id" --description-file "$msg_file" 2>/dev/null || \
        multica issue comment add "$issue_id" --description "$(cat "$msg_file")"
}

cmd_complete() {
    ensure_multica
    local key="${1:?Usage: complete <issue-key> [summary-file]}"
    local summary_file="${2:-}"

    local issue_id
    issue_id=$(resolve_issue_key "$key")

    log "Completing issue $key"

    # 1. 更新状态为 done
    multica issue status "$issue_id" "done" >/dev/null 2>&1

    # 2. 如果有总结，添加评论
    if [[ -n "$summary_file" && -f "$summary_file" ]]; then
        local summary
        summary=$(cat "$summary_file")
        multica issue comment add "$issue_id" --description "## ✅ Codex 完成总结

$summary

---
*Auto-synced from Codex at $(date -u '+%Y-%m-%d %H:%M UTC')*" 2>/dev/null || true
    fi

    log "Issue $key marked as done ✓"
}

cmd_create_from_template() {
    ensure_multica
    local template="${1:?Usage: create-from-template <template-name> [assignee] [priority]}"
    local assignee="${2:-电子书格式转换}"
    local priority="${3:-high}"

    local template_file="$TEMPLATE_DIR/${template}.md"
    if [[ ! -f "$template_file" ]]; then
        error "Template not found: $template_file"
    fi

    log "Creating issue from template: $template"

    # 提取标题
    local title
    title=$(head -1 "$template_file" | sed 's/^#+ *//')

    # 创建临时描述文件
    local tmp_desc="$WORKSPACE_DIR/_temp_issue_${template}.txt"
    cp "$template_file" "$tmp_desc"

    # 调用 multica issue create
    multica issue create \
        --title "[$title]" \
        --description-file "$tmp_desc" \
        --assignee "$assignee" \
        --priority "$priority" \
        --output json 2>&1 | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Created: {data.get(\"title\", \"\")} [{data.get(\"identifier\", \"\")}]')
" 2>/dev/null || multica issue create \
        --title "[$title]" \
        --description-file "$tmp_desc" \
        --assignee "$assignee" \
        --priority "$priority"

    rm -f "$tmp_desc"
}

cmd_list_pending() {
    ensure_multica
    local project_filter="${1:-}"

    log "Listing pending issues..."
    multica issue list --output json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
statuses = {'todo', 'in_progress', 'in_review'}
for iss in data.get('issues', []):
    if iss.get('status') in statuses:
        proj = iss.get('project_id', '')
        if '$project_filter' and proj != '$project_filter':
            continue
        print(f\"  [{iss.get('identifier', '')}] {iss.get('title', '')} — {iss.get('status')}\")
" 2>/dev/null || multica issue list
}

# ── 主入口 ────────────────────────────────────────────────

case "${1:-help}" in
    update-status) shift; cmd_update_status "$@" ;;
    add-comment)   shift; cmd_add_comment "$@" ;;
    complete)      shift; cmd_complete "$@" ;;
    create)        shift; cmd_create_from_template "$@" ;;
    list-pending)  shift; cmd_list_pending "$@" ;;
    help|--help|-h)
        echo "Usage: codex-multica-sync.sh <command> [args...]"
        echo ""
        echo "Commands:"
        echo "  update-status <key> <status>   Update issue status"
        echo "  add-comment <key> <file>       Add comment to issue"
        echo "  complete <key> [summary-file]  Mark done + optional summary"
        echo "  create <template> [agent] [pri] Create from template"
        echo "  list-pending [--project <id>]   List in-progress issues"
        ;;
    *)
        error "Unknown command: $1"
        ;;
esac
