# 纠错审查 CI 集成方案 B

## 架构设计：三层防线

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: CI Gate（自动，秒级）                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ tsc --noEmit                                   │  │
│  │ eslint --max-warnings=0                        │  │
│  │ scripts/audit.sh（15 项静态检查）                │  │
│  └───────────────────────────────────────────────┘  │
│  触发：每个 PR / push                                │
│  结果：绿色 ✅ 或 红色 ❌ 阻止合入                      │
├─────────────────────────────────────────────────────┤
│  Layer 2: PR Diff Agent Review（按需，分钟级）         │
│  ┌───────────────────────────────────────────────┐  │
│  │ 开发者在 PR 评论区评论:                          │  │
│  │  "/audit" 或 "/纠错审查"                         │  │
│  │                                                  │  │
│  │ Claude Code 自动:                                │
│  │ 1. 拉取 PR diff                                  │
│  │ 2. 对改动文件做纯纠错审查                          │
│  │ 3. 输出为 PR 评论（带严重级别排序）                 │
│  └───────────────────────────────────────────────┘  │
│  触发：开发者手动触发（/audit 命令）                    │
│  结果：PR 评论，不阻塞合入                              │
├─────────────────────────────────────────────────────┤
│  Layer 3: Weekly Full Audit（定期，周级）              │
│  ┌───────────────────────────────────────────────┐  │
│  │ GitHub Actions cron:                           │
│  │ 每周日凌晨 3:00 触发                            │
│  │                                                  │
│  │ 1. 拉取最新 main 分支                            │
│  │ 2. 对关键模块做全量纠错审查                        │
│  │ 3. 生成报告 → 飞书/Lark 推送                     │
│  └───────────────────────────────────────────────┘  │
│  触发：每周 cron                                     │
│  结果：飞书消息报告                                    │
└─────────────────────────────────────────────────────┘
```

## 为什么这样设计

| 层 | 为什么不能全自动 | 为什么需要 |
|---|---|---|
| Layer 1 | 可以全自动 | 快速反馈编译/ lint/ 已知模式错误 |
| Layer 2 | 不能全自动（需要 LLM） | 发现人眼和 grep 看不到的逻辑/架构问题 |
| Layer 3 | 不能全自动（需要 LLM） | 定期回归检查，防止新 bug 累积 |

## 实现细节

### Layer 1: CI Gate（已实现）

- 文件：`.github/workflows/audit.yml`
- 内容：`tsc` + `eslint` + `audit.sh`
- 状态：✅ 已完成

### Layer 2: PR Diff Agent Review（待实现）

**触发方式：** 开发者在 PR 评论区发送 `/audit` 命令

**实现方案：** 使用 GitHub App + Claude Code 的 webhook 集成

```
PR 评论 (/audit)
  → GitHub Webhook
    → Claude Code (通过 API 或 MCP)
      → 拉取 PR diff (git diff main...pr-branch)
      → 对 diff 中的文件做纠错审查
      → 输出审查报告
      → 发布为 PR 评论
```

**具体步骤：**

1. 创建一个 GitHub App（或直接用 Claude Code 的 PR 评论功能）
2. 当 PR 评论包含 `/audit` 时触发
3. Claude Code 执行：
   ```bash
   # 1. 拉取 PR diff
   git fetch origin main
   git fetch origin pull/<PR_ID>/head:pr-branch
   git checkout pr-branch
   
   # 2. 识别改动文件
   git diff origin/main...pr-branch --name-only
   
   # 3. 对每个改动文件做纠错审查
   #    （使用纯纠错 Agent 模式，只找问题不修）
   
   # 4. 生成 Markdown 报告
   # 5. 发布为 PR 评论
   ```

**替代方案（更轻量）：** 不使用 GitHub App，而是：
- 开发者本地运行 `npx claude code --audit-pr <PR_NUMBER>`
- 或者在 PR 合入 main 前，手动触发 Agent 审查

### Layer 3: Weekly Full Audit（待实现）

**触发方式：** GitHub Actions cron（每周日凌晨 3:00 UTC+8）

```yaml
# .github/workflows/weekly-audit.yml
name: 每周纠错审查

on:
  schedule:
    # 每周日凌晨 3:00 (UTC+8)
    - cron: '0 19 * * 0'  # UTC 19:00 = Beijing 03:00
  workflow_dispatch:  # 也支持手动触发

jobs:
  weekly-audit:
    name: 每周全量纠错审查
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 完整 history
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./ebook-converter
      
      - name: TypeScript 编译检查
        run: npx tsc --noEmit
        working-directory: ./ebook-converter
      
      - name: ESLint 检查
        run: npx eslint --max-warnings=0 src/
        working-directory: ./ebook-converter
      
      - name: 轻量纠错审查
        run: bash ../../scripts/audit.sh
        env:
          CI: true
      
      - name: 生成审查报告
        run: |
          echo "## 📊 每周纠错审查报告" > report.md
          echo "" >> report.md
          echo "**审查日期:** $(date '+%Y-%m-%d %H:%M')" >> report.md
          echo "**分支:** main" >> report.md
          echo "" >> report.md
          echo "### 检查结果" >> report.md
          echo "- ✅ TypeScript 编译: 通过" >> report.md
          echo "- ✅ 静态纠错检查: 通过" >> report.md
          echo "" >> report.md
          echo "### 待 Agent 审查模块" >> report.md
          echo "- [ ] Worker 转换流程逻辑" >> report.md
          echo "- [ ] API 接口安全" >> report.md
          echo "- [ ] 测试覆盖盲区" >> report.md
          echo "" >> report.md
          echo "> 提示: 在本地运行 `/audit` 触发 Agent 级审查" >> report.md
          cat report.md
      
      - name: 推送报告到飞书
        run: |
          # TODO: 集成飞书 webhook
          echo "报告已生成，待飞书集成"
```

## 优先级建议

| 阶段 | 内容 | 工作量 | 价值 |
|------|------|--------|------|
| ✅ 已完成 | Layer 1: CI Gate | 0（已部署） | 高（快速反馈编译/lint） |
| 1 | Layer 2: PR Diff Review（本地触发） | 低 | 高（发现逻辑/架构问题） |
| 2 | Layer 3: Weekly Full Audit（CI + 飞书） | 中 | 中（定期回归） |
| 3 | Layer 2: PR Diff Review（GitHub App 自动） | 高 | 高（零摩擦触发） |

## 推荐执行顺序

1. **立即**：Layer 1 已部署，PR 合入前自动检查
2. **短期**：Layer 3 的 Weekly Audit（cron + 飞书推送），定期发现问题
3. **中期**：Layer 2 本地触发（`/audit` 命令），合入前手动审查
4. **长期**：Layer 2 GitHub App 自动触发，零摩擦
