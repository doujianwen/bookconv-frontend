# Self-Evolving Skill Evolution Engine
# Usage: .\evolve_engine.ps1 [analyze|archive|report|full]

param(
    [string]$Action = "full",
    [string]$SkillDir = $PSScriptRoot,
    [int]$MinUsesForEvolution = 5
)

$LogPath = Join-Path $SkillDir "usage_log.json"
$ReportPath = Join-Path $SkillDir "evolution_report.md"
$HistoryDir = Join-Path $SkillDir ".evolve_history"

function Get-SkillVersion {
    $verFile = Join-Path $HistoryDir "current_version.txt"
    if (Test-Path $verFile) { return [int](Get-Content $verFile -Raw) }
    return 0
}

function Save-Version {
    param([int]$Version)
    if (-not (Test-Path $HistoryDir)) { New-Item -ItemType Directory -Path $HistoryDir -Force | Out-Null }
    $Version | Set-Content (Join-Path $HistoryDir "current_version.txt")
}

function Archive-CurrentVersion {
    param([int]$Version)
    $Dest = Join-Path $HistoryDir "v$Version"
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Get-ChildItem $SkillDir -Include SKILL.md,README.md -File | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $Dest $_.Name) -Force
    }
    Write-Host "Archived to $Dest" -ForegroundColor Cyan
}

function Analyze-Logs {
    if (-not (Test-Path $LogPath)) {
        Write-Host "No usage log found" -ForegroundColor Yellow
        return $null
    }
    $Data = Get-Content $LogPath -Raw | ConvertFrom-Json
    if ($Data.logs.Count -lt $MinUsesForEvolution) {
        Write-Host "Not enough uses (have $($Data.logs.Count), need $MinUsesForEvolution)" -ForegroundColor Yellow
        return $null
    }
    $SuccessCount = ($Data.logs | Where-Object {$_.success}).Count
    $SuccessRate = [math]::Round($SuccessCount / $Data.logs.Count * 100, 1)
    $AllSuggestions = @()
    $FailedPatterns = @()
    foreach ($log in $Data.logs) {
        if ($log.improvement_suggestion) { $AllSuggestions += $log.improvement_suggestion }
        if (-not $log.success) { $FailedPatterns += $log.trigger }
    }
    $TopSuggestions = $AllSuggestions | Group-Object | Sort-Object Count -Descending | Select-Object -First 5
    $FailurePatterns = $FailedPatterns | Group-Object | Sort-Object Count -Descending | Select-Object -First 3
    [PSCustomObject]@{
        TotalUses = $Data.logs.Count
        SuccessRate = $SuccessRate
        TopSuggestions = $TopSuggestions
        FailurePatterns = $FailurePatterns
    }
}

function Generate-Report {
    param([object]$Analysis)
    $lines = @()
    $lines += "# Evolution Report - Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    $lines += ""
    $lines += "## Summary"
    $lines += "- **Total Uses**: $($Analysis.TotalUses)"
    $lines += "- **Success Rate**: $($Analysis.SuccessRate)%"
    $lines += ""
    $lines += "## Key Insights"
    $lines += ""
    $lines += "### Top Suggestions"
    foreach ($s in $Analysis.TopSuggestions) {
        $lines += "- $($s.Name) ($($s.Count)x)"
    }
    $lines += ""
    $lines += "### Failure Patterns"
    if ($Analysis.FailurePatterns.Count -gt 0) {
        foreach ($f in $Analysis.FailurePatterns) {
            $lines += "- $($f.Name) ($($f.Count)x)"
        }
    } else { $lines += "- None significant" }
    $lines += ""
    $lines += "## Next Evolution Focus"
    $lines += "1. Address top suggestion"
    $lines += "2. Improve failure pattern handling"
    $lines += "3. Review quality scores for edge cases"
    $lines += ""
    $lines += "## Action Items"
    $lines += "- [ ] Update SKILL.md with new instructions"
    $lines += "- [ ] Add handling for identified edge cases"
    $lines += "- [ ] Remove or deprecate low-value instructions"
    $content = $lines -join "\n"
    $content | Set-Content $ReportPath -Encoding UTF8
    Write-Host "Report: $ReportPath" -ForegroundColor Green
}

function Run-FullEvolution {
    Write-Host "=== Self-Evolving Skill: Full Evolution ===" -ForegroundColor Cyan
    $Analysis = Analyze-Logs
    if (-not $Analysis) { Write-Host "Not enough data." -ForegroundColor Red; return }
    Write-Host "Found $($Analysis.TotalUses) uses, success: $($Analysis.SuccessRate)%" -ForegroundColor Green
    $CurrentVersion = Get-SkillVersion
    $NextVersion = $CurrentVersion + 1
    Archive-CurrentVersion -Version $NextVersion
    Generate-Report -Analysis $Analysis
    Write-Host "=== Complete ===" -ForegroundColor Cyan
    Write-Host "Edit evolution_report.md, then update SKILL.md based on insights"
}

switch ($Action) {
    "analyze" { Analyze-Logs }
    "archive" { $v = Get-SkillVersion; Archive-CurrentVersion -Version ($v+1) }
    "report" { $a = Analyze-Logs; if ($a) { Generate-Report -Analysis $a } }
    "full" { Run-FullEvolution }
    default { Write-Host "Usage: evolve_engine.ps1 [analyze|archive|report|full]" }
}