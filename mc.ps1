# mc.ps1 - Multica CLI 快捷封装脚本
# 用法: mc <command> [args...]
# 示例: mc agent list --output json
#       mc daemon status
#       mc issue list --project <id>

param(
    [Parameter(Position=0, Mandatory=$false)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$ErrorActionPreference = "Stop"

# 自动检测 multica.exe 路径
$MulticaPaths = @(
    # Electron 打包路径
    "$env:LOCALAPPDATA\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe",
    # 备选：直接安装路径
    "$env:LOCALAPPDATA\Programs\Multica\resources\app.asar.unpacked\resources\bin\multica.exe",
    # 开发模式路径
    "${env:HOME}\.multica\bin\multica.exe"
)

$MulticaExe = $null
foreach ($p in $MulticaPaths) {
    if (Test-Path $p -PathType Leaf) {
        $MulticaExe = $p
        break
    }
}

if (-not $MulticaExe) {
    Write-Host "错误: 找不到 multica.exe，请确认已安装 Multica Desktop" -ForegroundColor Red
    Write-Host "尝试的路径:" -ForegroundColor Yellow
    foreach ($p in $MulticaPaths) { Write-Host "  $p" -ForegroundColor DarkGray }
    exit 1
}

# 颜色输出帮助
$Colors = @{
    info    = "Cyan"
    success = "Green"
    error   = "Red"
    warn    = "Yellow"
    heading = "Magenta"
}

function Write-MCInfo  { param($msg) Write-Host "[MC] $msg" -ForegroundColor $Colors.info }
function Write-MCSuccess { param($msg) Write-Host "[OK] $msg" -ForegroundColor $Colors.success }
function Write-MCError   { param($msg) Write-Host "[ERR] $msg" -ForegroundColor $Colors.error }
function Write-MCWarn    { param($msg) Write-Host "[WARN] $msg" -ForegroundColor $Colors.warn }
function Write-MCHeading { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor $Colors.heading }

# 内置快捷命令
switch ($Command.ToLower()) {
    "status" {
        Write-MCHeading "Daemon & Agent 状态"
        & $MulticaExe daemon status 2>&1
        Write-Host ""
        & $MulticaExe agent list --output json 2>&1 | ConvertFrom-Json | ForEach-Object {
            $name = $_.name; $status = $_.status
            $color = if ($status -eq "idle") { $Colors.info } else { $Colors.success }
            Write-Host "  Agent: $name → $status" -ForegroundColor $color
        }
    }
    "agents" {
        Write-MCHeading "Agent 列表"
        & $MulticaExe agent list --output json 2>&1 | ConvertFrom-Json | Format-Table -AutoSize
    }
    "issues" {
        param([string]$ProjectId)
        Write-MCHeading "Issue 列表"
        if ($ProjectId) {
            & $MulticaExe issue list --project $ProjectId --output json 2>&1
        } else {
            & $MulticaExe issue list --output json 2>&1
        }
    }
    "projects" {
        Write-MCHeading "Project 列表"
        & $MulticaExe project list --output json 2>&1
    }
    "skills" {
        Write-MCHeading "Skill 列表"
        & $MulticaExe skill list --output json 2>&1
    }
    "squads" {
        Write-MCHeading "Squad 列表"
        & $MulticaExe squad list --output json 2>&1
    }
    "autopilot" {
        Write-MCHeading "Autopilot 列表"
        & $MulticaExe autopilot list --output json 2>&1
    }
    "logs" {
        param([int]$Lines = 50)
        $logFile = "$env:USERPROFILE\.multica\profiles\desktop-api.multica.ai\daemon.log"
        if (Test-Path $logFile) {
            Get-Content $logFile -Tail $Lines
        } else {
            Write-MCError "日志文件不存在: $logFile"
        }
    }
    "health" {
        Write-MCHeading "Daemon Health Check"
        try {
            $resp = Invoke-RestMethod -Uri "http://127.0.0.1:19514/health" -TimeoutSec 3
            $resp | ConvertTo-Json -Depth 5
        } catch {
            Write-MCError "Daemon 未响应: $_"
        }
    }
    "help" {
        Write-MCHeading "MC 快捷命令参考"
        @"
用法: mc <命令> [参数]

内置快捷命令:
  mc status          - 查看 Daemon + Agent 状态
  mc agents          - 列出所有 Agent
  mc issues [项目ID] - 列出 Issues（可选按项目过滤）
  mc projects        - 列出 Projects
  mc skills          - 列出 Skills
  mc squads          - 列出 Squads
  mc autopilot       - 列出 Autopilots
  mc logs [-n 行数]  - 查看 Daemon 日志
  mc health          - HTTP health check
  mc help            - 显示此帮助

原始命令透传:
  mc agent create ...      - 透传给 multica.exe
  mc issue create ...      - 透传给 multica.exe
  mc skill create ...      - 透传给 multica.exe
  mc workspace list        - 透传给 multica.exe
  mc login                 - 透传给 multica.exe

示例:
  mc status
  mc issues 3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0
  mc logs -Lines 100
  mc agent list --output json
"@
    }
    default {
        # 透传到 multica.exe
        & $MulticaExe @Args
    }
}