# mc-sync.ps1 - Multica Issues 与本地模板自动同步
# 用法: .\mc-sync.ps1 [--dry-run] [--force-update]

param(
    [switch]$DryRun,
    [switch]$ForceUpdate
)

$ErrorActionPreference = "Stop"

# ==================== 配置 ====================
$MulticaExe = "C:\Users\29537\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe"
$TemplateDir = "E:\一人公司\电子书格式转换站\.multica-templates\issues"
$ProjectId = "3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0"
$AssigneeName = "电子书格式转换"

# 状态颜色
$Colors = @{
    created   = "Green"
    updated   = "Yellow"
    unchanged = "DarkGray"
    error     = "Red"
    info      = "Cyan"
    heading   = "Magenta"
}

function Write-MCInfo   { param($msg) Write-Host "[INFO] $msg" -ForegroundColor $Colors.info }
function Write-MCSuccess { param($msg) Write-Host "[OK]   $msg" -ForegroundColor $Colors.created }
function Write-MCUpdate  { param($msg) Write-Host "[UPD]  $msg" -ForegroundColor $Colors.updated }
function Write-MCSkip    { param($msg) Write-Host "[SKIP] $msg" -ForegroundColor $Colors.unchanged }
function Write-MCError   { param($msg) Write-Host "[ERR]  $msg" -ForegroundColor $Colors.error }
function Write-MCHdr     { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor $Colors.heading }

# ==================== 步骤 1: 获取云端 Issues ====================
Write-MCHdr "Step 1: 获取云端 Issues"
try {
    $rawIssues = & $MulticaExe issue list --output json 2>&1
    $cloudIssues = $rawIssues | ConvertFrom-Json
    Write-MCInfo ("云端共 {0} 个 Issues" -f $cloudIssues.issues.Count)
} catch {
    Write-MCError "无法获取云端 Issues: $_"; exit 1
}

# ==================== 步骤 2: 解析本地模板 ====================
Write-MCHdr "Step 2: 解析本地模板"
$templateMap = @{}

$templates = Get-ChildItem $TemplateDir -Filter "phase*.md"
foreach ($t in $templates) {
    $content = Get-Content $t.FullName -Raw
    
    # 提取 Phase 号
    $phaseNum = 0
    if ($content -match "## Phase (\d+): (.+)") {
        $phaseNum = [int]$Matches[1]
        $title = $Matches[2].Trim()
    } else {
        Write-MCError "无法从 $($t.Name) 提取 Phase 号"; continue
    }
    
    # 提取优先级
    $priorityKey = "high"
    $priorityLabel = "高优先级"
    if ($content -match "优先级\s*(P\d)\s*—\s*(.+)") {
        $pLevel = $Matches[1]; $priorityLabel = $Matches[2].Trim()
        if ($pLevel -eq "0") { $priorityKey = "high" }
        elseif ($pLevel -eq "1") { $priorityKey = "medium" }
    }
    
    # 构建描述（去掉第一行标题）
    $lines = $content -split "`n"
    $descLines = $lines | Select-Object -Skip 1
    $description = $descLines -join "`n"
    
    $templateMap[$phaseNum] = @{
        File=$t.Name; Phase=$phaseNum; Title=$title; Description=$description
        Priority=$priorityKey; PriorityLabel=$priorityLabel
    }
    Write-MCInfo ("模板 #{0}: {1} [{2}]" -f $phaseNum, $title, $priorityLabel)
}
Write-MCInfo ("共解析 {0} 个模板" -f $templateMap.Count)

# ==================== 步骤 3: 建立 Phase -> Issue 映射 ====================
Write-MCHdr "Step 3: 建立映射关系"
$phaseToIssue = @{}
foreach ($issue in $cloudIssues.issues) {
    if ($issue.title -match "\[Phase (\d+)\]") {
        $phaseNum = [int]$Matches[1]
        $phaseToIssue[$phaseNum] = $issue
    }
}

# ==================== 步骤 4: 对比并执行 ====================
Write-MCHdr "Step 4: 对比与同步"

if ($DryRun) { Write-MCInfo "=== DRY RUN 模式（不会实际修改）===" }

$newCount = 0; $updateCount = 0; $sameCount = 0
$report = @()

$templateMap.GetEnumerator() | Sort-Object { [int]$_.Key } | ForEach-Object {
    $phase = $_.Value; $phaseNum = $phase.Phase
    $existing = $phaseToIssue[$phaseNum]
    $entry = @{ Phase=$phaseNum; Action=""; Detail="" }
    
    if (-not $existing) {
        # 情况 A: 模板有，云端无 -> 创建
        $entry.Action = "CREATE"; $entry.Detail = "云端不存在，将创建 Issue"
        
        if ($DryRun) {
            Write-MCSkip ("Phase {0}: 需要创建 - [{1}]" -f $phaseNum, $phase.Title)
        } else {
            try {
                $tempFile = Join-Path $PWD "_sync_desc_${phaseNum}.txt"
                $phase.Description | Out-File -Encoding utf8 -NoNewline $tempFile
                
                $result = & $MulticaExe issue create `
                    --title ("[Phase {0}] {1}" -f $phaseNum, $phase.Title) `
                    --description-file $tempFile `
                    --assignee $AssigneeName `
                    --priority $phase.Priority `
                    --project $ProjectId `
                    --output json 2>&1
                
                Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
                Write-MCSuccess ("Phase {0}: 已创建 - [{1}]" -f $phaseNum, $phase.Title)
                $newCount++
            } catch {
                Write-MCError ("Phase {0}: 创建失败 - {1}" -f $phaseNum, $_)
                $entry.Detail = "ERROR: $_"
            }
        }
    } else {
        # 情况 B: 模板和云端都有 -> 对比内容
        $titleMatch = $existing.title -match "\[Phase \d+\]?\s*(.+)"
        $existingTitle = if ($titleMatch) { $Matches[1].Trim() } else { $existing.title }
        
        $needsUpdate = $false; $updateReasons = @()
        
        # 比较标题
        if ($existingTitle -ne $phase.Title) {
            $needsUpdate = $true
            $updateReasons += ("标题变更: '{0}' -> '{1}'" -f $existingTitle, $phase.Title)
        }
        
        # 比较描述
        $cleanExistingDesc = ($existing.description -replace "`xEF`xBB`BF", "").Trim()
        $cleanTemplateDesc = $phase.Description.Trim()
        if ($cleanExistingDesc -ne $cleanTemplateDesc) {
            $needsUpdate = $true; $updateReasons += "描述变更"
        }
        
        # 比较优先级
        $existingPriority = if ($existing.priority -eq "high") { "high" } elseif ($existing.priority -eq "medium") { "medium" } else { "low" }
        if ($existingPriority -ne $phase.Priority) {
            $needsUpdate = $true
            $updateReasons += ("优先级变更: {0} -> {1}" -f $existing.priority, $phase.Priority)
        }
        
        if ($needsUpdate) {
            $entry.Action = "UPDATE"; $entry.Detail = ($updateReasons -join "; ")
            
            if ($DryRun) {
                Write-MCUpdate ("Phase {0}: 需要更新 - {1}" -f $phaseNum, ($updateReasons -join ', '))
            } else {
                try {
                    $tempFile = Join-Path $PWD "_sync_desc_${phaseNum}.txt"
                    $phase.Description | Out-File -Encoding utf8 -NoNewline $tempFile
                    
                    $updateArgs = @(
                        "issue", "update", $existing.id,
                        "--title", ("[Phase {0}] {1}" -f $phaseNum, $phase.Title),
                        "--description-file", $tempFile,
                        "--priority", $phase.Priority,
                        "--output", "json"
                    )
                    $result = & $MulticaExe $updateArgs 2>&1
                    
                    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
                    Write-MCSuccess ("Phase {0}: 已更新 - {1}" -f $phaseNum, ($updateReasons -join ', '))
                    $updateCount++
                } catch {
                    Write-MCError ("Phase {0}: 更新失败 - {1}" -f $phaseNum, $_)
                    $entry.Detail = "ERROR: $_"
                }
            }
        } else {
            $entry.Action = "UNCHANGED"; $entry.Detail = "与模板一致"
            Write-MCSkip ("Phase {0}: 无需变更" -f $phaseNum)
            $sameCount++
        }
    }
    $report += $entry
}

# ==================== 步骤 5: 生成报告 ====================
Write-MCHdr "同步报告"

$total = $templateMap.Count
Write-Host ("  模板总数: {0}" -f $total) -ForegroundColor White
Write-Host ("  CREATE: {0}" -f $newCount) -ForegroundColor Green
Write-Host ("  UPDATE: {0}" -f $updateCount) -ForegroundColor Yellow
Write-Host ("  UNCHANGED: {0}" -f $sameCount) -ForegroundColor DarkGray

if ($DryRun) {
    Write-Host ""
    Write-Host "这是 Dry Run 模式。添加 --no-dry-run 参数执行实际同步。" -ForegroundColor Cyan
}

Write-Host "`n=== 详细列表 ===" -ForegroundColor Magenta
foreach ($r in $report) {
    $color = switch ($r.Action) {
        "CREATE" { $Colors.created }
        "UPDATE" { $Colors.updated }
        default { $Colors.unchanged }
    }
    Write-Host ("  Phase {0}: {1} - {2}" -f $r.Phase, $r.Action, $r.Detail) -ForegroundColor $color
}

Write-MCHdr "完成"
Write-Host "同步完成。" -ForegroundColor Green
if (-not $DryRun) {
    Write-Host "提示: 运行 '.\mc.ps1 status' 查看最新状态" -ForegroundColor DarkGray
}