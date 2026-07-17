# mc-autopilot.ps1 - Multica Autopilot Management Script
# Usage: .\mc-autopilot.ps1 <command> [args]
#
# Environment variables:
#   MULTICA_EXE_PATH  - Override the default multica.exe path
#
# Commands: list, trigger, create, suggest

param(
    [Parameter(Position=0, Mandatory=$true)]
    [string]$Command,

    [string]$Agent = "电子书格式转换",
    [string]$Title,
    [string]$Description,
    [string]$Mode = "create_issue",
    [string]$Priority = "none",
    [string]$ProjectId = "3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0",
    [int]$TriggerHour = 9,
    [int]$TriggerMinute = 0
)

# Resolve multica.exe path: CLI > env var > fallback
if ($env:MULTICA_EXE_PATH) {
    $MulticaExe = $env:MULTICA_EXE_PATH
} else {
    $MulticaExe = "C:\Users\29537\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe"
}

# Validate multica.exe exists
if (-not (Test-Path $MulticaExe)) {
    Write-Host "" -ForegroundColor Red
    Write-Host "ERROR: multica.exe not found at: $MulticaExe" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Set env var:  `$env:MULTICA_EXE_PATH = 'C:\path\to\multica.exe'" -ForegroundColor Yellow
    Write-Host "Or install Multica Desktop" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Red
    exit 1
}

switch ($Command.ToLower()) {
    "list" {
        Write-Host "`n=== Autopilot 列表 ===" -ForegroundColor Magenta
        & $MulticaExe autopilot list --output json 2>&1 | ConvertFrom-Json | ForEach-Object {
            Write-Host "`n  📌 $($_.title)" -ForegroundColor Cyan
            Write-Host "     ID: $($_.id)" -ForegroundColor DarkGray
            Write-Host "     模式: $($_.execution_mode)" -ForegroundColor DarkGray
            Write-Host "     状态: $(if ($_.status -eq 'active') { '✅ 活跃' } else { '⏸️ 暂停' })" -ForegroundColor $(if ($_.status -eq 'active') { 'Green' } else { 'DarkGray' })
            Write-Host "     分配给: $($_.assignee_type) ($($($_.assignee_id).ToString().Substring(0,8))...)" -ForegroundColor DarkGray
            Write-Host "     优先级: $($_.priority)" -ForegroundColor DarkGray
            Write-Host "     上次运行: $($_.last_run_at)" -ForegroundColor DarkGray
            Write-Host "     描述: $($_.description)" -ForegroundColor DarkGray
        }
    }
    "trigger" {
        param([string]$AutopilotId)
        if (-not $AutopilotId) {
            Write-Host "请指定 Autopilot ID，或输入 'all' 触发全部" -ForegroundColor Yellow
            & $MulticaExe autopilot list --output json 2>&1 | ConvertFrom-Json | ForEach-Object {
                Write-Host "  $($_.id) → $($_.title)" -ForegroundColor Gray
            }
            exit 1
        }
        if ($AutopilotId -eq "all") {
            $autopilots = & $MulticaExe autopilot list --output json 2>&1 | ConvertFrom-Json
            foreach ($ap in $autopilots) {
                Write-Host "`n⏳ 触发: $($ap.title)..." -ForegroundColor Cyan
                & $MulticaExe autopilot trigger $ap.id 2>&1
            }
        } else {
            Write-Host "⏳ 触发 Autopilot..." -ForegroundColor Cyan
            & $MulticaExe autopilot trigger $AutopilotId 2>&1
        }
    }
    "create" {
        if (-not $Title -or -not $Description) {
            Write-Host "错误: 创建需要 --title 和 --description" -ForegroundColor Red
            exit 1
        }
        Write-Host "`n📋 创建 Autopilot..." -ForegroundColor Cyan
        Write-Host "   标题: $Title" -ForegroundColor Gray
        Write-Host "   模式: $Mode" -ForegroundColor Gray
        Write-Host "   分配给: $Agent" -ForegroundColor Gray
        & $MulticaExe autopilot create `
            --title $Title `
            --description $Description `
            --agent $Agent `
            --mode $Mode `
            --priority $Priority `
            --project $ProjectId 2>&1
    }
    "suggest" {
        Write-Host @"

=== Autopilot 使用建议 ===

当前支持的两种模式：

1. create_issue（创建 Issue 模式）
   - Agent 执行任务后自动创建新 Issue
   - 适合：定期巡检、质量检查、自动生成任务
   - 示例：每日 SEO 检查、每周代码审查

2. run_only（仅运行模式）
   - Agent 执行任务但不创建 Issue
   - 适合：状态报告、数据汇总、清理任务
   - 示例：每周 Issue 状态同步、磁盘空间检查

触发方式：
   mc autopilot trigger <ID>   # 手动触发单个
   mc autopilot trigger all    # 手动触发全部

注意：
   - Multica v0.4.x 不支持 cron 定时触发
   - 建议使用 Windows 任务计划程序实现定时触发
   - 或在本项目根目录创建 schedule.ps1 脚本

推荐创建的 Autopilots：
   ✅ 每日构建验证 — 运行 npm test + npm run build
   ✅ 每周依赖更新检查 — 检查 package.json 过时的依赖
   ✅ 每月磁盘清理 — 清理 daemon 临时文件
   ✅ PR 评论通知 — 当有外部 PR 时通知团队成员

"@ -ForegroundColor White
    }
    default {
        Write-Host "未知命令: $Command" -ForegroundColor Red
        Write-Host "可用命令: list, trigger, create, suggest" -ForegroundColor Gray
    }
}
