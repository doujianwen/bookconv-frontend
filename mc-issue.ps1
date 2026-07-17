# mc-issue.ps1 - 从模板快速创建 Multica Issue
# 用法: .\mc-issue.ps1 <phase-number> [--assignee "Agent名"] [--priority high|medium]

param(
    [Parameter(Position=0, Mandatory=$true)]
    [int]$Phase,
    
    [string]$Assignee = "电子书格式转换",
    [string]$Priority = "high",
    [string]$ProjectId = "3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0"
)

$ErrorActionPreference = "Stop"

# 配置
$MulticaExe = "C:\Users\29537\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe"
$TemplateDir = "E:\一人公司\电子书格式转换站\.multica-templates\issues"
$WorkspaceDir = "E:\一人公司\电子书格式转换站"

# 验证 Phase 范围
if ($Phase -lt 1 -or $Phase -gt 12) {
    Write-Host "错误: Phase 必须在 1-12 之间" -ForegroundColor Red
    exit 1
}

# 构建模板文件名
$templateFile = Join-Path $TemplateDir "phase${Phase}.md"

if (-not (Test-Path $templateFile)) {
    Write-Host "错误: 找不到 Phase $Phase 的模板文件: $templateFile" -ForegroundColor Red
    Write-Host "可用模板:" -ForegroundColor Yellow
    Get-ChildItem $TemplateDir -Filter "*.md" | ForEach-Object {
        Write-Host "  $($_.BaseName)" -ForegroundColor DarkGray
    }
    exit 1
}

Write-Host "`n📋 正在从模板创建 Issue..." -ForegroundColor Cyan
Write-Host "   Phase: $Phase" -ForegroundColor Gray
Write-Host "   模板: $templateFile" -ForegroundColor Gray
Write-Host "   分配给: $Assignee" -ForegroundColor Gray
Write-Host "   优先级: $Priority" -ForegroundColor Gray

# 读取模板内容
$content = Get-Content $templateFile -Raw -Encoding utf8

# 提取标题（第一行 ## 后面的内容）
$titleLine = ($content -split "`n")[0].TrimStart('#')
$title = $titleLine.Trim()

Write-Host "`n📝 Issue 标题: $title" -ForegroundColor Green

# 创建临时描述文件
$tempDesc = Join-Path $WorkspaceDir "_temp_issue_desc.txt"
$content | Out-File -Encoding utf8 -NoNewline $tempDesc

# 调用 multica issue create
Write-Host "`n⏳ 正在提交到 Multica..." -ForegroundColor Cyan
$result = & $MulticaExe issue create `
    --title "[$title]" `
    --description-file $tempDesc `
    --assignee $Assignee `
    --priority $Priority `
    --project $ProjectId `
    --output json 2>&1

# 清理临时文件
Remove-Item $tempDesc -Force -ErrorAction SilentlyContinue

if ($result) {
    Write-Host "`n✅ Issue 创建成功!" -ForegroundColor Green
    Write-Host $result -ForegroundColor White
} else {
    Write-Host "`n⚠️ 命令执行完成但无输出" -ForegroundColor Yellow
    Write-Host "请检查 Multica 桌面应用是否正常运行" -ForegroundColor Gray
}