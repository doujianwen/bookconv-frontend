# HERMES 经验库

## GA4 埋点实跑经验（2026-09-24）

### 问题发现
- MEMORY.md 中记录 #4 GA4 埋点实跑为"待完成"
- 实际代码已在 `src/lib/ga.ts` 和 `ToolPageClient.tsx` 中实现
- 生产环境已部署（commit `0c0a230`，9/19），但 MEMORY.md 未更新

### 根因分析
1. **记忆滞后**：代码实现和部署完成后，MEMORY.md 未及时更新状态
2. **验证盲区**：只检查了源码是否存在，未验证生产环境是否真正部署
3. **日志断档**：9/19 的会话可能被中断，未完成"更新记忆"这一步

### 正确做法（固化）
```bash
# 1. 验证源码存在
grep -r "trackGAEvent\|conversion_complete" src/ --include="*.ts" --include="*.tsx"

# 2. 验证生产部署（剥离 script 后检查）
curl -s "https://www.bookconv.com/_next/static/chunks/app/%5Blocale%5D/convert/%5Bslug%5D/page-*.js" | grep -o "conversion_complete\|file_upload"

# 3. 更新 MEMORY.md
# 标记已完成，注明 commit hash 和验证方式
```

### 关键教训
- **记忆 = 待办清单 + 状态标记**：代码实现 ≠ 任务完成，必须手动更新记忆
- **生产验证优先于源码验证**：源码在本地 ≠ 已部署线上
- **埋点事件命名约定**：
  - `file_upload`：用户上传文件时触发，携带 `{source_format, target_format, file_size}`
  - `conversion_complete`：转换成功时触发，携带 `{source_format, target_format}`
  - `conversion_failed`：转换失败时触发，携带 `{source_format, target_format, error}`

### 后续行动
- 每次完成功能开发后，立即更新 MEMORY.md 状态
- 批量操作后必跑门禁 + 线上断言
- 部署成功后立即验证生产环境，而非仅依赖本地构建通过
