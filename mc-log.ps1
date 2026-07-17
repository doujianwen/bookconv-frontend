# mc-log.ps1 - Multica Daemon 智能日志过滤器
# 用法: .\mc-log.ps1 [-n 行数] [-f 过滤关键词] [-c 清除日志]

param(
    [int]$Lines = 100,
    [string[]]$Filter,
    [switch]$Clear
)

$LogDir = "$env:USERPROFILE\.multica\profiles\desktop-api.multica.ai"
$LogFile = Join-Path $LogDir "daemon.log"

if (-not (Test-Path $LogFile)) {
    Write-Host "错误: 日志文件不存在: $LogFile" -ForegroundColor Red
    exit 1
}

if ($Clear) {
    $BackupFile = Join-Path $LogDir "daemon.$((Get-Date -Format 'yyyy-MM-dd_HHmmss')).log.bak"
    Copy-Item $LogFile $BackupFile -Force
    Set-Content $LogFile ""
    Write-Host "日志已清空，备份到: $BackupFile" -ForegroundColor Green
    exit 0
}

Write-Host "`n=== Multica Daemon 日志 (${Lines} 行) ===" -ForegroundColor Magenta

$NoiseKeywords = @(
    "heartbeat: skipping HTTP tick",
    "codex semantic activity observed",
    "activity=item/reasoning/summaryTextDelta"
)

$noiseCount = 0
$entries = Get-Content $LogFile -Tail $Lines

foreach ($line in $entries) {
    $isNoise = $false
    foreach ($kw in $NoiseKeywords) {
        if ($line -match $kw) {
            $isNoise = $true
            break
        }
    }
    
    if ($isNoise) {
        $noiseCount++
        continue
    }
    
    $timestamp = if ($line -match "^(\d{2}:\d{2}:\d{2}\.\d+)") { $Matches[1] } else { "?" }
    $level = if ($line -match "(DBG|INF|WRN|ERR)") { $Matches[1] } else { "?" }
    
    $color = switch ($level) {
        "ERR" { "Red" }
        "WRN" { "Yellow" }
        "INF" { "Cyan" }
        "DBG" { "DarkGray" }
        default { "White" }
    }
    
    $component = if ($line -match "component=(\S+)") { $Matches[1] } else { "" }
    $task = if ($line -match "task=(\S+)") { $Matches[1] } else { "" }
    
    $outputLine = "[$timestamp] [$level]"
    if ($component) { $outputLine += " $component" }
    if ($task) { $outputLine += " task=$task" }
    
    $msg = $line
    foreach ($kw in @("component=", "task=", "activity=")) {
        $msg = ($msg -replace "$kw\S+\s*", "").Trim()
    }
    $msg = $msg.TrimStart()
    
    if ($msg -and $msg.Length -gt 0) {
        $outputLine += " $msg"
    }
    
    Write-Host $outputLine -ForegroundColor $color
}

if ($noiseCount -gt 0) {
    Write-Host "`n过滤了 $noiseCount 条噪音日志（heartbeat / semantic activity）" -ForegroundColor DarkGray
    Write-Host "使用 mc logs 可查看所有原始日志" -ForegroundColor DarkGray
}

Write-Host "`n=== 日志结束 ===" -ForegroundColor Magenta