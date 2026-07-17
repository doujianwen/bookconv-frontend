## Phase 9: CI/CD 流水线

### 任务概述
搭建 GitHub Actions 自动化构建和部署流程。

### 具体要求
#### 1. 开发流水线
- PR 触发 TypeScript 编译
- Jest 单元测试
- ESLint + Prettier 检查

#### 2. 生产流水线
- main 分支自动构建
- Docker 镜像推送
- SSH 部署到 VPS

#### 3. 回滚机制
- 版本标签管理
- 一键回滚脚本
- 健康检查验证

### 参考文件
- .github/workflows/

### 优先级
P0 — 最高优先级
---