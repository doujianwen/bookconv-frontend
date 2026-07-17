# mc-setup.ps1 - Multica 一键环境配置脚本
# 用法: 以管理员身份运行此脚本，或在 PowerShell 中执行:
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   .\mc-setup.ps1

param(
    [switch]$Force,
    [switch]$SkipAlias
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "E:\一人公司\电子书格式转换站"

Write-Host "`n🔧 Multica 环境配置向导" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# 1. 检测 multica.exe
$MulticaExe = "C:\Users\29537\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe"
if (Test-Path $MulticaExe) {
    Write-Host "✅ Multica CLI 已找到: $MulticaExe" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到 Multica CLI，请确认已安装" -ForegroundColor Red
    exit 1
}

# 2. 检测 Daemon 状态
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:19514/health" -TimeoutSec 3
    if ($health.status -eq "running") {
        Write-Host "✅ Daemon 运行中 (PID: $($health.pid), Uptime: $($health.uptime))" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Daemon 状态: $($health.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Daemon 未响应，请先启动: mc status" -ForegroundColor Yellow
}

# 3. 检查脚本文件
$Scripts = @("mc.ps1", "mc-issue.ps1", "mc-log.ps1", "mc-autopilot.ps1")
$AllPresent = $true
foreach ($s in $Scripts) {
    $path = Join-Path $ProjectRoot $s
    if (Test-Path $path) {
        Write-Host "✅ $s 存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $s 缺失" -ForegroundColor Red
        $AllPresent = $false
    }
}

if (-not $AllPresent) {
    Write-Host "`n部分脚本缺失，请重新运行本工具或手动下载" -ForegroundColor Red
    exit 1
}

# 4. 检查模板目录
$templateDir = Join-Path $ProjectRoot ".multica-templates"
if (Test-Path $templateDir) {
    $issueTemplates = Get-ChildItem (Join-Path $templateDir "issues") -Filter "*.md"
    Write-Host "✅ Issue 模板库: $($issueTemplates.Count) 个模板" -ForegroundColor Green
} else {
    Write-Host "⚠️ 模板目录不存在" -ForegroundColor Yellow
}

# 5. 检查看板
$dashboard = Join-Path $templateDir "dashboard.html"
if (Test-Path $dashboard) {
    Write-Host "✅ Agent 看板已就绪: $dashboard" -ForegroundColor Green
    Write-Host "   在浏览器打开: file:///$($dashboard.Replace('\', '/'))" -ForegroundColor DarkGray
} else {
    Write-Host "⚠️ 看板文件不存在" -ForegroundColor Yellow
}

# 6. 配置 PowerShell Profile 别名（可选）
if (-not $SkipAlias) {
    $profilePath = $PROFILE.CurrentUserCurrentHost
    $profileDir = Split-Path $profilePath -Parent
    
    if (Test-Path $profilePath) {
        $profileContent = Get-Content $profilePath -Raw -Encoding UTF8
    } else {
        $profileContent = ""
    }
    
    $aliasMarker = "# === Multica Aliases ==="
    $aliasBlock = @"

$aliasMarker
Set-Alias -Name mc -Value "$ProjectRoot\mc.ps1" -Scope Global
Set-Alias -Name mc-issue -Value "$ProjectRoot\mc-issue.ps1" -Scope Global
Set-Alias -Name mc-log -Value "$ProjectRoot\mc-log.ps1" -Scope Global
Set-Alias -Name mc-auto -Value "$ProjectRoot\mc-autopilot.ps1" -Scope Global
# === End Multica Aliases ===
"@
    
    if ($profileContent -match [regex]::Escape($aliasMarker)) {
        Write-Host "✅ 别名已在 PowerShell Profile 中配置" -ForegroundColor Green
    } elseif ($Force) {
        $newProfile = $profileContent + $aliasBlock
        $newProfile | Out-File -Encoding UTF8 $profilePath
        Write-Host "✅ 别名已添加到 PowerShell Profile" -ForegroundColor Green
        Write-Host "   重启 PowerShell 后生效" -ForegroundColor DarkGray
    } else {
        Write-Host "💡 是否将别名添加到 PowerShell Profile？(y/n)" -ForegroundColor Yellow
        $answer = Read-Host
        if ($answer -eq "y") {
            $newProfile = $profileContent + $aliasBlock
            $newProfile | Out-File -Encoding UTF8 $profilePath
            Write-Host "✅ 别名已添加" -ForegroundColor Green
        } else {
            Write-Host "跳过别名配置。可以稍后运行: .\mc-setup.ps1 -Force" -ForegroundColor Gray
        }
    }
}

# 7. 总结
Write-Host @"

╔══════════════════════════════════════════╗
║         Multica 环境配置完成！           ║
╠══════════════════════════════════════════╣
║                                          ║
║  快捷命令:                               ║
║    mc status          - Daemon & Agent   ║
║    mc agents          - Agent 列表       ║
║    mc issues          - Issue 列表       ║
║    mc health          - Health check     ║
║    mc logs            - 智能日志过滤     ║
║    mc autopilot list  - Autopilot 列表   ║
║    mc issue trigger   - 触发 Autopilot   ║
║                                          ║
║  从模板创建 Issue:                       ║
║    .\mc-issue.ps1 <1-12>                 ║
║                                          ║
║  快速参考:                               ║
║    .\mc.ps1 help                         ║
║                                          ║
╚══════════════════════════════════════════╝
"@ -ForegroundColor Magenta