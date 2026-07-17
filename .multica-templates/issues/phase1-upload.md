## Phase 1: 上传组件升级

### 任务概述
升级文件上传组件，支持文件预览和元数据展示。

### 具体要求
#### 1. 文件预览
- 支持 EPUB/PDF/TXT 文件缩略图预览
- 显示文件类型图标（根据扩展名）
- 文件大小格式化显示（KB/MB/GB）

#### 2. 元数据展示
- 读取文件元数据（标题、作者、页数等）
- 使用 metadata-extractor 或 Calibre CLI
- 在上传后自动填充表单

#### 3. UI 改进
- 拖拽上传区域
- 进度条显示
- 多文件选择支持

### 参考文件
- ebook-converter/src/components/tools/BatchUpload.tsx

### 优先级
P1 — 高优先级
---