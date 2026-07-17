## Phase 11: 性能优化

### 任务概述
优化 Core Web Vitals，提升页面加载速度和用户体验。

### 具体要求
#### 1. Core Web Vitals
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

#### 2. 图片优化
- WebP/AVIF 格式
- 响应式图片（srcset）
- 懒加载

#### 3. 代码优化
- Tree shaking 未使用组件
- 路由级代码分割
- Redis 缓存 API 响应

### 参考文件
- next.config.js
- ebook-converter/src/app/layout.tsx

### 优先级
P0 — 最高优先级
---