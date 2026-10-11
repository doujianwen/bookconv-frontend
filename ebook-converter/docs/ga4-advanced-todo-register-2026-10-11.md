# GA4 进阶分析待办登记（2026-10-11）

> 来源：`数据分析/GA4进阶分析-v2手册执行版-2026-10-11.md` 优先级清单中无法当日闭环的三项，登记观察/等待条件与到期检查方式。

## P0-3 error_code 失败根因分流 —— ⏳ 等待数据

- **前置**：commit 89f901e（conversion_failed 补 error_code 参数）已上线（2026-10-11 探针验证 page chunk 命中）。
- **等待条件**：线上积累 ≥48h 且出现 ≥1 个带 error_code 的 conversion_failed 事件（预计 2026-10-13）。
- **到期检查方式**：GA4 后台 Events → conversion_failed → 参数列表出现 error_code；或 Data API 查 dimension error_code（需先在 GA4 Admin → 自定义定义注册 error_code 维度——**首 个事件被观测前无法注册，这是 GA4 限制**）。
- **然后做什么**：按 error_code × pagePath 分流失败（402 额度类 / 超时类 / 格式类），对应接 CloudConvert 充值 / MAX_FILE_SIZE 10→2 止损（待办④）/ 格式不支持提示。
- **背景数字**：28 天失败率 66%（109 上传 / 72 失败）；10-05、10-07 修复后单日失败率仍 73.7%、76.5%。

## P1-6 mobile/iOS 上传交互排查 —— 📋 排查清单

实测依据：mobile 参与度 23% vs desktop 41%；iOS engagement 21% vs Windows 45%（28 天，n 足够方向可信）。

排查清单（按 ROI 排序）：
1. iOS Safari 文件选择器：ToolPageClient.tsx 的 `<input type="file">` 是否设了 `accept`（限制过窄在 iOS 会禁用"文件"入口，只给相册）。
2. 移动端上传按钮/表单是否在首屏折叠线下（m4 数据：首页参与度 0.43 低于所有 convert 页）。
3. GA4 DebugView 用真机 iOS Safari 走一遍 file_upload 全流程。
4. 修复后验收：iOS engagement 从 21% 回到 ≥30%。

## P2-8 Android Webview 纳入观察名单 —— 📋 待 GA4 配置

实测依据：Android Webview 20 用户 / engagement 仅 5%（近乎全非参与，疑似 App 内嵌 WebView 或 bot）。

- 手段：GA4 Admin → 数据过滤器（Traffic from specific sources）或受众定义排除；**不建议直接删除**，先观察 2 周确认无真实用户。
- 挂在 P0-2 的数据过滤器配置完成后一起做（同一 UI 区域）。

---
*状态机遵循项目作战台约定：todo/doing/done/blocked/dropped。*
