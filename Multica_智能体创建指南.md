# Multica 智能体创建完整指南 - BookConv 电子书转换站案例

**版本**: v1.0 | **日期**: 2026-07-14
**项目**: BookConv - 电子书格式转换站
**工作区 ID**: 41116b8e-603f-4135-b392-33357b558e65

---

## 目录

1. 概述
2. 环境准备
3. CLI 配置
4. 创建智能体
5. 智能体配置
6. 创建自定义 Skills
7. 分配 Skills 给智能体
8. 创建 Issues（按开发阶段）
9. 创建 Squad（团队）
10. 创建 Autopilot（自动化）
11. 启动智能体执行任务
12. 完整命令速查表
13. 常见问题

---

## 1. 概述

本指南记录如何从零开始为 BookConv 电子书格式转换站项目创建和配置一个完整的 AI 智能体工作流。

### 核心概念

概念 | 说明
------ | ------
Workspace（工作区） | 所有资源的容器，包含 Issues、Agents、Projects 等
Agent（智能体） | AI 助手，可被分配到 Issue 并执行任务
Runtime（运行时） | Agent 运行的模型环境（Codex、Claude、OpenAI 等）
Skill（技能） | Agent 的自定义知识包，定义专业领域的指导信息
Issue（问题/任务） | 可分配给 Agent 或成员的具体工作任务
Squad（小队） | 由多个 Agent 组成的协作团队
Autopilot（自动驾驶） | 定时或触发式自动执行任务的自动化流程

### 技术栈

- 框架: Next.js 16.2.10 (App Router)
- 语言: TypeScript 5.x
- 样式: Tailwind CSS 4.x
- 数据库: Supabase (PostgreSQL)
- 缓存/队列: Redis + BullMQ
- 部署: Docker + Alpine Linux
- Node: v20 LTS
---

## 4. 创建智能体

### 4.1 查看可用 Runtime

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" runtime list
```

**可用 Runtime:**

ID | 名称 | 模式 | 提供商 | 状态
---- | ------ | ------ | -------- | ------
da8d806e-ca47-485e-8b42-41cd1d1f6af7 | Codex | local | codex | online
85f418d8-589c-4924-b88b-5fc091883ba2 | Claude | local | claude | online
98350da3-0787-4aa2-a918-3d2d83c61e6a | Opencode | local | opencode | online
634d7299-5c73-452e-8366-d45b34c147da | Hermes | local | hermes | online

### 4.2 创建智能体

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" agent create \
  --name "电子书格式转换" \
  --description "电子书格式转换站项目的开发与任务管理智能体" \
  --runtime-id "da8d806e-ca47-485e-8b42-41cd1d1f6af7" \
  --max-concurrent-tasks 6 \
  --instructions "你是 BookConv（电子书格式转换站）项目的 AI 开发助手。..."
```

**参数说明:**

参数 | 值 | 说明
------ | ----- | ------
--name | 电子书格式转换 | 智能体名称
--description | ... | 简短描述
--runtime-id | da8d806e... | 使用的模型运行时
--max-concurrent-tasks | 6 | 最大并发任务数
--instructions | ... | 智能体指令
--visibility | private | 可见性

### 4.3 创建结果

```json
{
  "id": "5600cd9e-87ec-43fc-a444-f7ce8f77d794",
  "name": "电子书格式转换",
  "status": "idle",
  "visibility": "private"
}
```
---

## 7. 分配 Skills 给智能体

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" agent skills set \
  5600cd9e-87ec-43fc-a444-f7ce8f77d794 \
  --skill-ids "7a9d25f6-444c-4fce-9f79-898bbcfae797,0f56c251-487e-457d-8800-e9000c789aec,9aabceec-0035-4483-bcc7-0b15ef67504e" \
  --output json
```

> **注意**: `--skill-ids` 使用逗号分隔的 UUID 列表。

---

## 8. 创建 Issues（按开发阶段）

### 8.1 使用文件方式创建（推荐 Windows）

PowerShell 命令行对长文本和多行内容支持不好，推荐使用文件方式：

```powershell
# 1. 先创建描述文件
$desc = @"
## Phase 2: 异步转换队列：并发处理与进度追踪

### 任务概述
实现异步转换队列系统，支持并发处理和进度追踪。

### 具体要求
#### 1. 队列管理
- 使用 BullMQ 管理转换任务队列
- 实现任务优先级（Pro 用户优先）
- 添加任务重试机制（最多 3 次）

### 参考文件
- ebook-converter/src/lib/queue.ts

### 优先级
P0 --- 最高优先级
"@

$desc | Out-File -Encoding utf8 "E:/一人公司/电子书格式转换站/issue2.txt" -NoNewline

# 2. 使用 --description-file 创建 Issue
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" issue create \
  --title "[Phase 2] 异步转换队列：并发处理与进度追踪" \
  --description-file "E:/一人公司/电子书格式转换站/issue2.txt" \
  --assignee "电子书格式转换" \
  --priority high \
  --project 3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0 \
  --output json
```

### 8.2 12 个开发阶段完整列表

Phase | Issue 编号 | 标题 | 优先级 | 说明
------- | ------------ | ------ | -------- | ------
1 | EBO-19 | 上传组件升级 | high | 文件预览、元数据展示
2 | EBO-21 | 异步转换队列 | high | BullMQ、进度追踪
3 | EBO-24 | 用户系统与订阅 | high | Supabase Auth、Stripe
4 | EBO-25 | 云存储集成 | high | Cloudflare R2
5 | EBO-26 | 转换引擎测试 | high | 回归、边界、性能测试
6 | EBO-27 | 生产部署 | high | VPS、Nginx、SSL
7 | EBO-28 | SEO Schema 完善 | high | FAQ、Breadcrumb
8 | EBO-23 | 国际化支持 | medium | 西班牙语 + 英语
9 | EBO-29 | CI/CD 流水线 | high | GitHub Actions
10 | EBO-30 | 博客 CMS | medium | Markdown 管理
11 | EBO-22 | 性能优化 | high | Core Web Vitals
12 | EBO-31 | 批量转换 | high | Pro 核心功能

### 8.3 查看 Issues 列表

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" issue list --output json
```
---

## 9. 创建 Squad（团队）

### 9.1 创建开发团队

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" squad create \
  --name "BookConv Dev Team" \
  --leader "电子书格式转换" \
  --description "BookConv 电子书格式转换站核心开发团队" \
  --output json
```

**Squad 结果:**

字段 | 值
------ | -----
ID | aa04b56f-cf07-47b3-bb0c-743c7b1e1b85
名称 | BookConv Dev Team
队长 | 电子书格式转换
成员数 | 1

---

## 10. 创建 Autopilot（自动化）

### 10.1 每日 SEO 检查（create_issue 模式）

自动检查所有转换页面的 SEO 质量，发现问题的自动生成 Issue。

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" autopilot create \
  --title "每日 SEO 检查" \
  --agent "电子书格式转换" \
  --mode create_issue \
  --description "检查所有转换页面的 SEO 质量..." \
  --project 3d2e1bfe-1f2e-4d80-9cc4-eac195463ac0 \
  --priority medium \
  --output json
```

### 10.2 每周 Issue 状态同步（run_only 模式）

定期列出未完成 Issues，统计进度，生成周报摘要。

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" autopilot create \
  --title "每周 Issue 状态同步" \
  --agent "电子书格式转换" \
  --mode run_only \
  --description "列出所有未完成的 Issues，统计各阶段进度..." \
  --output json
```

### 10.3 查看 Autopilots

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" autopilot list --output json
```

### 10.4 手动触发 Autopilot

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" autopilot trigger d735fbe7-ef29-4887-8684-aae0e5ec882f
```
---

## 11. 启动智能体执行任务

### 11.1 将 Issue 分配给智能体

```powershell
# EBO-21 = Phase 2 异步转换队列
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" issue assign 57c30743-be1b-4dde-a866-65eed2034ca6 --to "电子书格式转换"
```

### 11.2 添加评论触发 Agent 任务

```powershell
# 先创建评论文件
$comment = "## 开始执行 Phase 2: 异步转换队列`n`n请按以下步骤执行：`n`nStep 1: 分析现有代码`nStep 2: 设计改进方案`nStep 3: 实施开发`nStep 4: 测试验证`n`n请开始执行，完成后汇报进展。"
$comment | Out-File -Encoding utf8 "E:/一人公司/电子书格式转换站/comment_phase2.txt" -NoNewline

# 添加评论
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" issue comment add \
  57c30743-be1b-4dde-a866-65eed2034ca6 \
  --content-file "E:/一人公司/电子书格式转换站/comment_phase2.txt" \
  --allow-external-file
```

### 11.3 查看 Issue 评论

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" issue comment list 57c30743-be1b-4dde-a866-65eed2034ca6 --output json
```
---

## 12. 完整命令速查表

### Agent 命令

操作 | 命令
------ | ------
创建 | multica agent create --name X --runtime-id Y --instructions Z
列表 | multica agent list --output json
详情 | multica agent get <id> --output json
更新 | multica agent update <id> --instructions X
环境变量 | multica agent env set <id> --custom-env-stdin
读环境变量 | multica agent env get <id>
分配 Skills | multica agent skills set <id> --skill-ids "id1,id2"

### Issue 命令

操作 | 命令
------ | ------
创建 | multica issue create --title X --description-file Y --assignee Z --priority high --project P
列表 | multica issue list --output json
分配 | multica issue assign <id> --to "智能体名"
添加评论 | multica issue comment add <id> --content-file X --allow-external-file
评论列表 | multica issue comment list <id> --output json

### Skill 命令

操作 | 命令
------ | ------
创建 | multica skill create --name X --description Y --content Z
列表 | multica skill list --output json

### Squad 命令

操作 | 命令
------ | ------
创建 | multica squad create --name X --leader Y --description Z
列表 | multica squad list --output json

### Autopilot 命令

操作 | 命令
------ | ------
创建(create_issue) | multica autopilot create --title X --agent Y --mode create_issue --description Z
创建(run_only) | multica autopilot create --title X --agent Y --mode run_only --description Z
列表 | multica autopilot list --output json
触发 | multica autopilot trigger <id>
---

## 13. 常见问题

### Q1: multica 命令找不到？

**A**: CLI 不在系统 PATH 中，使用完整路径调用：

```powershell
& "C:/Users/29537/AppData/Local/Programs/@multicadesktop/resources/app.asar.unpacked/resources/bin/multica.exe" <command>
```

### Q2: PowerShell 中中文路径乱码？

**A**: 使用 `--content-file` 或 `--description-file` 从文件读取：

```powershell
$content | Out-File -Encoding utf8 "path/to/file.txt" -NoNewline
multica issue create --description-file "path/to/file.txt" --allow-external-file
```

### Q3: `--body` 参数不存在？

**A**: 评论使用 `--content` 或 `--content-file`，不是 `--body`：

```powershell
# 错误
multica issue comment add <id> --body "内容"

# 正确
multica issue comment add <id> --content-file "file.txt" --allow-external-file
```

### Q4: Skill IDs 如何获取？

**A**: 创建 Skill 后从返回 JSON 中获取 id，或使用 `skill list` 命令：

```powershell
multica skill list --output json
```

---

## 附录：最终配置状态

### 智能体

项目 | 值
------ | -----
名称 | 电子书格式转换
ID | 5600cd9e-87ec-43fc-a444-f7ce8f77d794
Runtime | Codex (local)
并发任务数 | 6
状态 | idle/working
可见性 | private

### Skills（3 个）

ID | 名称 | 描述
---- | ------ | ------
7a9d25f6-444c-4fce-9f79-898bbcfae797 | ebook-formats | 电子书格式转换参考指南
0f56c251-487e-457d-8800-e9000c789aec | project-structure | 项目结构与技术栈
9aabceec-0035-4483-bcc7-0b15ef67504e | seo-playbook | SEO 优化策略

### Squad（1 个）

ID | 名称 | 队长
---- | ------ | ------
aa04b56f-cf07-47b3-bb0c-743c7b1e1b85 | BookConv Dev Team | 电子书格式转换

### Autopilots（2 个）

ID | 标题 | 模式 | 状态
---- | ------ | ------ | ------
d735fbe7-ef29-4887-8684-aae0e5ec882f | 每日 SEO 检查 | create_issue | active
5aa13c4b-2b4b-4e39-a817-139ce7648a9d | 每周 Issue 状态同步 | run_only | active

---

*本文档由 Codex AI 自动生成，记录完整的多步操作过程。*