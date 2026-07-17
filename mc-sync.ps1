# mc-sync.ps1 - Automatically sync local Issue templates to Multica Cloud
# Usage: .\mc-sync.ps1 [-DryRun] [-Verbose] [--MulticaPath <path>]
param(
    [switch]$DryRun,
    [switch]$Verbose,
    [string]$MulticaPath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path $MyInvocation.MyCommand.Path -Parent
$TemplateDir = Join-Path $ScriptDir ".multica-templates/issues"
$ProjectId   = "3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0"
$AgentId     = "5600cd9e-87ec-43fc-a444-f7ce8f77d794"

# Resolve multica.exe path: CLI arg > env var > fallback
if ($MulticaPath) {
    $MulticaExe = $MulticaPath
} elseif ($env:MULTICA_EXE_PATH) {
    $MulticaExe = $env:MULTICA_EXE_PATH
} else {
    $MulticaExe = "C:\Users\29537\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe"
}

# Validate multica.exe exists
if (-not (Test-Path $MulticaExe)) {
    Write-Host "" -ForegroundColor Red
    Write-Host "ERROR: multica.exe not found at: $MulticaExe" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Fix options:" -ForegroundColor Yellow
    Write-Host "  1. Set env var:  `$env:MULTICA_EXE_PATH = 'C:\path\to\multica.exe'" -ForegroundColor Yellow
    Write-Host "  2. Pass arg:    .\mc-sync.ps1 --MulticaPath 'C:\path\to\multica.exe'" -ForegroundColor Yellow
    Write-Host "  3. Install Multica Desktop" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Red
    exit 1
}

function Run-Multica {
    param([string[]]$Args)
    $fullArgs = @("issue") + $Args
    # Use GUID-based temp file names to avoid collision (vs Get-Random)
    $suffix = [guid]::NewGuid().ToString().Substring(0, 8)
    $outF = Join-Path $env:TEMP "mc-out-$suffix.txt"
    $errF = Join-Path $env:TEMP "mc-err-$suffix.txt"
    # Use Start-Process with explicit encoding to avoid Chinese CWD issues
    $proc = Start-Process -FilePath $MulticaExe -ArgumentList $fullArgs -RedirectStandardOutput $outF -RedirectStandardError $errF -Wait -NoNewWindow -PassThru
    $exitCode = $proc.ExitCode
    if ($exitCode -ne 0) {
        $stderr = ""
        if (Test-Path $errF) { $stderr = Get-Content $errF -Raw }
        Remove-Item $errF -Force -ErrorAction SilentlyContinue
        throw ("multica failed (exit " + $exitCode + "): " + $stderr)
    }
    $stdout = ""
    if (Test-Path $outF) { $stdout = [System.IO.File]::ReadAllText($outF, [System.Text.Encoding]::UTF8) }
    Remove-Item $outF -Force -ErrorAction SilentlyContinue
    $jsonStart = $stdout.IndexOf("{")
    if ($jsonStart -gt 0) { $stdout = $stdout.Substring($jsonStart) }
    return $stdout.TrimEnd("`r`n")
}

function Extract-PhaseInfo {
    param([string]$FilePath)
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $fileName = Split-Path $FilePath -Leaf
    $phaseMatch = [regex]::Match($fileName, 'phase(\d+)')
    $phaseNum = [int]$phaseMatch.Groups[1].Value
    $titleMatch = [regex]::Match($content, '^## Phase \d+: (.+)$', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { "Phase " + $phaseNum }
    $priorityMatch = [regex]::Match($content, '^### 优先级\s*\r?\n\s*(P\d+)[^\r\n]*', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $priorityRaw = if ($priorityMatch.Success) { $priorityMatch.Groups[1].Value } else { "P1" }
    $priorityMap = @{ "P0" = "high"; "P1" = "medium"; "P2" = "low"; "P3" = "trivial" }
    $priority = if ($priorityMap.ContainsKey($priorityRaw)) { $priorityMap[$priorityRaw] } else { "medium" }
    $lines = $content -split "`r?`n"
    $descStart = 1; $descEnd = $lines.Length
    while ($descEnd -gt $descStart -and $lines[$descEnd - 1].Trim() -eq "---") { $descEnd-- }
    $description = ($lines[$descStart..($descEnd - 1)] -join "`n").Trim()
    return @{ PhaseNum=$phaseNum; Title=$title; Description=$description; Priority=$priority; TemplateFile=$FilePath; RawContent=$content.Trim() }
}

function Find-CloudIssueByPhase {
    param([int]$PhaseNum, [object[]]$Issues)
    foreach ($issue in $Issues) {
        $pat = "\[Phase " + $PhaseNum + "\]"
        if ($issue.title -match $pat -or $issue.title -match "Phase $PhaseNum") {
            return @{ Id=$issue.id; Issue=$issue }
        }
    }
    return $null
}

function Compare-Descriptions {
    param([string]$Local, [string]$Cloud)
    $local = $Local.TrimStart([char]0xFEFF).Trim()
    $cloud = $Cloud.TrimStart([char]0xFEFF).Trim()
    return $local -eq $cloud
}

Write-Host ""
Write-Host "=== Multica Issue Sync ===" -ForegroundColor Cyan
Write-Host "Multica: $MulticaExe" -ForegroundColor Gray
Write-Host "Template: $TemplateDir" -ForegroundColor Gray
Write-Host "Project:  $ProjectId" -ForegroundColor Gray
if ($DryRun) { Write-Host "[DRY RUN] No changes will be made" -ForegroundColor Yellow }

$templateFiles = Get-ChildItem (Join-Path $TemplateDir "phase*.md") | Sort-Object { [int][regex]::Match($_.Name, '\d+').Value }
Write-Host "Found $($templateFiles.Count) template files" -ForegroundColor Green
if ($templateFiles.Count -eq 0) { Write-Host "No templates found" -ForegroundColor Red; exit 1 }

$parsed = @()
foreach ($t in $templateFiles) {
    $info = Extract-PhaseInfo $t.FullName
    $parsed += $info
    if ($Verbose) { Write-Host "  P$('{0:D2}' -f $info.PhaseNum) $($info.Title) -> $($info.Priority)" -ForegroundColor Gray }
}

Write-Host ""
Write-Host "Fetching cloud issues..." -ForegroundColor Gray
$jsonText = Run-Multica "list", "--project", $ProjectId, "--output", "json"
$jsonObj = $jsonText | ConvertFrom-Json
$issues = $jsonObj.issues
Write-Host "Cloud has $($issues.Count) issues" -ForegroundColor Green

$created=0; $updated=0; $skipped=0; $errors=0
foreach ($p in $parsed) {
    $phaseStr = "P$('{0:D2}' -f $p.PhaseNum)"
    $cloud = Find-CloudIssueByPhase $p.PhaseNum $issues
    $matchedTitle = if ($cloud) { $cloud.Issue.title } else { "(none)" }
    if ($null -eq $cloud) {
        Write-Host ""
        Write-Host "[$phaseStr] CREATE: $($p.Title)" -ForegroundColor Yellow
        if ($DryRun) { Write-Host "  [DRY RUN] skip" -ForegroundColor DarkYellow }
        else {
            try {
                $tmpFile = Join-Path $env:TEMP ("mc-desc-$($p.PhaseNum).md")
                [System.IO.File]::WriteAllText($tmpFile, $p.RawContent, [System.Text.UTF8Encoding]::new($false))
                $createArgs = @("create", "--title", "[Phase $($p.PhaseNum)] $($p.Title)", "--description-file", $tmpFile, "--allow-external-file", "--priority", $p.Priority, "--project", $ProjectId, "--assignee-id", $AgentId, "--output", "json")
                $result = Run-Multica @createArgs
                $newIssue = $result | ConvertFrom-Json
                Write-Host "  Created: $($newIssue.id) - $($newIssue.title)" -ForegroundColor Green
                $created++
            } catch { Write-Host "  FAILED: $_" -ForegroundColor Red; $errors++ }
            finally { if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force } }
        }
    } else {
        $isSame = Compare-Descriptions $p.Description $cloud.Issue.description
        if ($isSame) {
            Write-Host ""
            Write-Host "[$phaseStr] SKIP: $($p.Title) (identical)" -ForegroundColor DarkGray
            $skipped++
        } else {
            Write-Host ""
            Write-Host "[$phaseStr] UPDATE: $($p.Title)" -ForegroundColor Magenta
            Write-Host "  Cloud: $matchedTitle" -ForegroundColor Gray
            if ($DryRun) { Write-Host "  [DRY RUN] skip" -ForegroundColor DarkYellow }
            else {
                try {
                    $tmpFile = Join-Path $env:TEMP ("mc-desc-$($p.PhaseNum).md")
                    [System.IO.File]::WriteAllText($tmpFile, $p.RawContent, [System.Text.UTF8Encoding]::new($false))
                    $updateArgs = @("update", $cloud.Id, "--title", "[Phase $($p.PhaseNum)] $($p.Title)", "--description-file", $tmpFile, "--allow-external-file", "--priority", $p.Priority, "--output", "json")
                    $result = Run-Multica @updateArgs
                    $upIssue = $result | ConvertFrom-Json
                    Write-Host "  Updated: $($upIssue.id)" -ForegroundColor Green
                    $updated++
                } catch { Write-Host "  FAILED: $_" -ForegroundColor Red; $errors++ }
                finally { if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force } }
            }
        }
    }
}

Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host "  Created:  $created" -ForegroundColor Green
Write-Host "  Updated:  $updated" -ForegroundColor Magenta
Write-Host "  Skipped:  $skipped" -ForegroundColor DarkGray
if ($errors -gt 0) { Write-Host "  Errors:   $errors" -ForegroundColor Red }
if ($DryRun) { Write-Host "[DRY RUN] No changes made" -ForegroundColor Yellow }
Write-Host ""
Write-Host "Done." -ForegroundColor Green
