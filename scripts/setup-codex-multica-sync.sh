#!/usr/bin/env bash
# setup-codex-multica-sync.sh — 在新电脑上一次性配置 Codex ↔ Multica 同步
#
# 用法:
#   bash scripts/setup-codex-multica-sync.sh
#
# 它会：
#   1. 检查 multica CLI 是否已安装
#   2. 检查是否已登录 (auth)
#   3. 确认 workspace 和 project 可达
#   4. 验证项目根目录下的脚本/模板存在
#   5. 打印后续使用说明

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()    { echo -e "${GREEN}✅ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $*${NC}"; }
fail()  { echo -e "${RED}❌ $*${NC}" >&2; exit 1; }
info()  { echo -e "${CYAN}ℹ️  $*${NC}"; }

# ── 1. 检查 multica CLI ──────────────────────────────────

info "Step 1/4: Checking multica CLI..."

MULTICA_BIN="$(command -v multica 2>/dev/null || echo '')"
if [[ -z "$MULTICA_BIN" ]]; then
    fail "multica CLI not found in PATH.

Please install Multica Desktop App first, then add its bin to PATH:
  C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\@multicadesktop\\resources\\app.asar.unpacked\\resources\\bin\\

Or run the Multica Desktop App first — it registers multica in the user profile."
fi
ok "multica CLI found at: $MULTICA_BIN"

MULTICA_VERSION=$("$MULTICA_BIN" version 2>/dev/null | head -1 || echo "unknown")
info "Version: $MULTICA_VERSION"

# ── 2. 检查登录状态 ──────────────────────────────────────

info "Step 2/4: Checking authentication..."

AUTH_STATUS=$("$MULTICA_BIN" auth status 2>/dev/null || echo "not_logged_in")
if [[ "$AUTH_STATUS" == *"not logged in"* || "$AUTH_STATUS" == *"authentication"* ]]; then
    warn "You are not logged in to Multica."
    echo ""
    echo "Run: multica login"
    echo "Then come back and run this script again."
    exit 1
fi
ok "Authenticated ✓"

# ── 3. 检查 workspace/project 连通性 ─────────────────────

info "Step 3/4: Checking workspace connectivity..."

WORKSPACE_LIST=$("$MULTICA_BIN" workspace list --output json 2>/dev/null)
if [[ -z "$WORKSPACE_LIST" || "$WORKSPACE_LIST" == "[]" ]]; then
    warn "No workspace found. You may need to run: multica login"
else
    ok "Workspace accessible ✓"
    WORKSPACE_COUNT=$(echo "$WORKSPACE_LIST" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('workspaces',[])))" 2>/dev/null || echo "?")
    info "Found $WORKSPACE_COUNT workspace(s)"
fi

# ── 4. 检查项目文件 ──────────────────────────────────────

info "Step 4/4: Checking project files..."

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)/.."
SYNC_SCRIPT="$SCRIPTS_DIR/scripts/codex-multica-sync.sh"
TEMPLATE_DIR="$SCRIPTS_DIR/.multica-templates/issues"
CLAUDE_SETTINGS="$SCRIPTS_DIR/.claude/settings.json"

# 同步脚本
if [[ -f "$SYNC_SCRIPT" ]]; then
    ok "Sync script exists: scripts/codex-multica-sync.sh"
else
    fail "Missing: scripts/codex-multica-sync.sh"
fi

# 模板目录
if [[ -d "$TEMPLATE_DIR" ]]; then
    TEMPLATE_COUNT=$(ls "$TEMPLATE_DIR"/phase*.md 2>/dev/null | wc -l)
    ok "Templates directory exists with $TEMPLATE_COUNT phase templates"
else
    warn "Template directory not found: $TEMPLATE_DIR"
fi

# Claude 配置
if [[ -f "$CLAUDE_SETTINGS" ]]; then
    ok "Claude settings exist: .claude/settings.json"
else
    warn "Claude settings not found. Create it manually with permissions for multica CLI."
fi

# ── 完成 ──────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ok "Setup complete! Here's how to use it:"
echo ""
echo "  In Codex (Claude Code), just say:"
echo "    \"完成 EBO-24 了，更新状态\""
echo ""
echo "  Or run directly:"
echo "    bash scripts/codex-multica-sync.sh complete EBO-24"
echo "    bash scripts/codex-multica-sync.sh update-status EBO-24 in_progress"
echo "    bash scripts/codex-multica-sync.sh list-pending"
echo ""
echo "  View docs:"
echo "    cat docs/codex-multica-sync.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
