# Multica 工具集 — BookConv 项目

本项目包含一套为 Multica + Codex 协作优化的 PowerShell 工具脚本。

## 快速开始

```powershell
# 1. 运行环境配置（首次）
.\mc-setup.ps1

# 2. 查看 Daemon 状态
.\mc.ps1 status
.\mc.ps1 health

# 3. 从模板创建 Issue
.\mc-issue.ps1 1   # Phase 1: 上传组件升级
.\mc-issue.ps1 5   # Phase 5: 转换引擎测试

# 4. 查看过滤后的日志
.\mc-log.ps1 -Lines 50

# 5. 管理 Autopilot
.\mc-autopilot.ps1 list
.\mc-autopilot.ps1 trigger all
```

## 脚本清单

| 脚本 | 功能 | 示例用法 |
|------|------|----------|
| `mc.ps1` | CLI 快捷封装，替代长路径调用 | `mc status`, `mc agents`, `mc logs` |
| `mc-issue.ps1` | 从 Phase 模板快速创建 Issue | `.\mc-issue.ps1 3` |
| `mc-log.ps1` | 智能过滤 Daemon 日志 | `.\mc-log.ps1 -Lines 100` |
| `mc-autopilot.ps1` | Autopilot 管理和触发 | `mc-auto list`, `mc-auto trigger all` |
| `mc-setup.ps1` | 一键环境配置和检查 | `.\mc-setup.ps1` |

## Issue 模板库

位于 `.multica-templates/issues/` 目录下，共 12 个模板：

| 文件 | Phase | 主题 |
|------|-------|------|
| phase1-upload.md | 1 | 上传组件升级 |
| phase2-queue.md | 2 | 异步转换队列 |
| phase3-auth.md | 3 | 用户系统与订阅 |
| phase4-r2.md | 4 | 云存储集成 |
| phase5-tests.md | 5 | 转换引擎测试 |
| phase6-deploy.md | 6 | 生产部署 |
| phase7-seo.md | 7 | SEO Schema 完善 |
| phase8-i18n.md | 8 | 国际化支持 |
| phase9-cicd.md | 9 | CI/CD 流水线 |
| phase10-blog.md | 10 | 博客 CMS |
| phase11-perf.md | 11 | 性能优化 |
| phase12-batch.md | 12 | 批量转换 |

## Agent 看板

打开 `.multica-templates/dashboard.html` 在浏览器中查看实时看板：
- Agent 状态（空闲/工作中）
- Issues 列表和优先级
- Phase 完成进度条
- Daemon 健康信息

## 别名配置

运行 `mc-setup.ps1` 后可在 PowerShell 中使用简短命令：
```powershell
mc status          # 等同于 mc.ps1 status
mc agents          # 等同于 mc.ps1 agents
mc-auto list       # 等同于 mc-autopilot.ps1 list
```

## 已知问题与 workaround

1. **CLI 路径不稳定** → 使用 mc.ps1 自动检测
2. **PowerShell 中文乱码** → 使用 --description-file 从文件读取
3. **Daemon 日志噪音大** → 使用 mc-log.ps1 过滤
4. **无定时触发** → 使用 Windows 任务计划程序