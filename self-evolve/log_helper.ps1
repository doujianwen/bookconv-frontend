# Usage Log Helper
# Usage: .\log_helper.ps1 --trigger "convert epub" --files "test.epub" --steps "read,parse,convert" --success true --quality 5 --lessons "worked great" --suggestion ""

param(
    [string]$Trigger,
    [string[]]$Files,
    [string[]]$Steps,
    [bool]$Success,
    [int]$Quality = 3,
    [string]$Lessons,
    [string]$Suggestion
)

$LogPath = Join-Path $PSScriptRoot "usage_log.json"
if (-not (Test-Path $LogPath)) { Write-Host "No usage_log.json found" -ForegroundColor Red; exit 1 }

$Data = Get-Content $LogPath -Raw | ConvertFrom-Json

$entry = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    trigger = $Trigger
    workspace_files = @($Files)
    steps_taken = @($Steps)
    success = $Success
    quality_score = $Quality
    lessons = if ($Lessons) { @($Lessons) } else { @() }
    improvement_suggestion = $Suggestion
}

$Data.logs += $entry
$Data.meta.total_uses = $Data.logs.Count

$succCount = ($Data.logs | Where-Object {$_.success}).Count
$Data.meta.success_rate = [math]::Round($succCount / $Data.logs.Count * 100, 1)

$Data | ConvertTo-Json -Depth 10 | Set-Content $LogPath -Encoding UTF8

Write-Host "Logged entry #$($Data.logs.Count): $Trigger (success=$Success, quality=$Quality)" -ForegroundColor Green
Write-Host "Overall success rate: $($Data.meta.success_rate)%"
