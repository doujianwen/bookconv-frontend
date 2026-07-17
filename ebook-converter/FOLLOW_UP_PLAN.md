# 后续架构改进计划

## 已完成

### ✅ P1: 死代码清理（已完成）
- 移除 `CONVERSION_MAP` 中的 `command` 字段和 shell 命令生成函数
- 精简 `ConversionCommand` → `ConversionEntry` 接口
- 保留 `tool`/`description` 用于 UI 展示

### ✅ P1: PowerShell 脚本改造（已完成）
- `mc-sync.ps1`: 支持 `--MulticaPath` 参数 + `MULTICA_EXE_PATH` 环境变量 + 路径不存在时清晰报错
- `mc-autopilot.ps1`: 同上
- 两处 `Get-Random()` → `[guid]::NewGuid()` 消除碰撞风险

---

## 问题 1: 服务器less 环境下 in-memory 状态丢失

### 现状
- `batchStore`（Map）— 批量转换状态，部署到 Vercel/Edge 后每次冷启动丢失
- `ipDownloads`（Map）— 下载限流，per-instance 导致实际无限制
- 注释中已写明 "replace with Redis in prod"

### 影响
- 批量转换提交后，如果 Next.js 边缘节点冷启动，状态丢失 → GET 永远 404
- 下载限流在多实例下形同虚设

### 修复方案
**方案 A: 迁移 batchStore 到 Redis（推荐）**
- 复用已有的 Redis 连接（`src/lib/redis.ts`）
- 将 `BatchJobData` 序列化为 JSON 存入 Redis Hash，key 为 `batch:{batchId}`
- 设置 TTL 为 1 小时，自动过期
- GET/POST/下载路由全部通过 Redis 读写
- 文件：新建 `src/lib/batch-store.ts`，改造 `batch/route.ts`、`batch/[batchId]/download/route.ts`

**方案 B: 保持内存 + 改为异步返回**
- 当前已实现异步非阻塞（POST 立即返回 202）
- 但状态仍丢失 → 不实用
- 结论：必须方案 A

### 涉及文件
- `src/lib/batch-store.ts`（新建）
- `src/app/api/convert/batch/route.ts`
- `src/app/api/convert/batch/[batchId]/download/route.ts`
- `src/app/api/convert/batch/store.ts`（废弃或删除）

### 工作量
约 2-3 小时

---

## 问题 2: 结果下载无身份验证

### 现状
- `GET /api/convert/[jobId]/result` 只检查 jobId 存在且已完成
- `userId` 存储在 `ConversionJobData` 中但从未被检查
- 任何人猜到 UUID 就能下载别人的转换结果

### 影响
- 隐私泄露风险：用户上传的私人文档可被任意人下载
- 合规风险：GDPR/个人信息保护法要求保护用户数据

### 修复方案
**第一步: 实现 JWT 认证中间件**
- 新建 `src/lib/auth.ts` — 验证 Supabase/JWT token，提取 userId
- 新建 `src/middleware.ts` — Next.js 中间件保护 `/api/convert/*` 路径
- 转换时存储 userId 到 job data

**第二步: 结果下载路由校验所有权**
- `result/route.ts` 中从 token 提取 userId
- 对比 `job.data.userId === request.userId`
- 不匹配返回 403

**第三步: 批量下载路由同理**
- `batch/[batchId]/download/route.ts` 校验 batch 创建者的 userId

### 涉及文件
- `src/lib/auth.ts`（新建）
- `src/middleware.ts`（新建）
- `src/lib/queue.ts` — 传递 userId 到 job data
- `src/app/api/convert/[jobId]/result/route.ts`
- `src/app/api/convert/batch/[batchId]/download/route.ts`
- `src/app/api/convert/batch/route.ts`

### 工作量
约 4-6 小时

---

## 问题 3: CONVERSION_MAP 中死代码清理

### 现状
- `CONVERSION_MAP` 中的 `command` 字段和 `tool` 字段从未被队列 worker 使用
- `calibreToPdfThenImages`、`libreofficeThenCalibre`、`djvu` 等 shell 命令生成函数是死代码
- `ConversionCommand` 接口的 `tool` 和 `command` 属性误导维护者以为有多工具管道

### 影响
- 误导性元数据：让人以为系统支持 ImageMagick、LibreOffice、djvulibre 多工具管道
- 实际只有 Calibre 的 `ebook-convert` 被调用

### 修复方案
**选择 A: 精简为纯配置表（推荐）**
- 移除 `ConversionCommand` 接口中的 `tool` 和 `command` 字段
- 只保留 `description`（用于前端展示）
- 简化 `CONVERSION_MAP` 值为 `{ description: string }`
- 删除 `calibreToPdfThenImages`、`libreofficeThenCalibre`、`djvu` 函数

**选择 B: 真正接入多工具管道（长期）**
- 为 `jpg`/`png` 输出实现真正的两步转换（Calibre → PDF → ImageMagick）
- 为 `doc` 输入实现真正的 LibreOffice 预处理
- 这需要修改 `queue.ts` 的 `executeConversion` 逻辑
- 工作量较大，建议作为独立 feature 开发

### 涉及文件
- `src/lib/conversion-map.ts`

### 工作量
- 方案 A: 30 分钟
- 方案 B: 2-3 天

---

## 问题 4: PowerShell 脚本硬编码路径

### 现状
- `mc-sync.ps1` 第 10 行: `C:\Users\29537\AppData\Local\Programs\@multicadesktop\...`
- `mc-autopilot.ps1` 第 18 行: 同样的硬编码路径
- 绑定到特定用户的特定机器

### 影响
- 脚本在其他机器上无法运行
- CI/CD 环境中不可用
- 团队协作时需要每个人手动修改

### 修复方案
**第一步: 环境变量化**
- 新增 `MULTICA_EXE_PATH` 环境变量
- 脚本中优先读取环境变量，fallback 到硬编码路径
- 创建 `.env.example` 记录所需环境变量

**第二步: 添加路径检测**
- 脚本启动时检测 `multica.exe` 是否存在
- 不存在则给出清晰的错误提示和安装指引
- 支持 `--multica-path` 命令行参数覆盖

**第三步: 清理 Get-Random 碰撞风险**
- 改用 `[guid]::NewGuid().ToString().Substring(0,8)` 替代 `Get-Random().ToString('X8')`
- GUID 碰撞概率远低于 32 位随机数

### 涉及文件
- `mc-sync.ps1`
- `mc-autopilot.ps1`

### 工作量
约 1 小时

---

## 建议执行顺序

| 阶段 | 任务 | 理由 |
|------|------|------|
| P1 | 问题 3: 死代码清理 | 最简单（30 分钟），零风险，立竿见影 |
| P1 | 问题 4: PowerShell 脚本改造 | 简单（1 小时），不影响线上功能 |
| P2 | 问题 1: batchStore → Redis | 中等（2-3 小时），解决部署可靠性 |
| P3 | 问题 2: 身份验证 | 复杂（4-6 小时），涉及 auth 中间件 |

预计总工作量: 8-11 小时。
