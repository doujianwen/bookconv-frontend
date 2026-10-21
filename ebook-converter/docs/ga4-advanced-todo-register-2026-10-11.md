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

---

## 状态更新（2026-10-21 · GA4 进阶分析）

> 数据源：GA4 Data API 实时拉取，窗口 2026-09-20~10-20（`scripts/ga4-advanced-analysis.mjs` → `数据分析/GA4进阶分析-2026-10-21.md`）。

- **P0-3**：✅ 可执行。`error` 自定义维度已注册可用（commit 89f901e 后 + GA4 Admin 注册）。有文本样本中 **402 容量占 12/16=75%**，印证「结构性容量不足 → 升级付费档」。⚠️ 但 84 次失败中 68 次 `error=(not set)`（81% 盲区，因 10-11 才上线 error 参数），根因分流仅覆盖 10-11 后事件。
- **P1-6**：🔄 修订。`iOS 文件选择器坏掉`假设**不成立**（iOS 上传 25 / 完成 11，可用）；真瓶颈在 **mobile 上传率 27% vs desktop 80%**（Android 仅 15%）—— up-funnel 首屏 CTA 问题。验收指标改为「mobile 上传率 27% → ≥50%」。
- **P2-8**：⏳ 维持观察。当前 Android 参与度 35.3%、67 用户，**未见 5% 参与度的 Webview 簇**；GA4 OS 维度无法区分 Webview/原生 → 工具限制下不可判定。
- 新增发现：doubao.com/referral 已成第二大源（24 用户 / 35 上传 / 21 失败，参与度 77.4%），建议单独归因 + 外发 GEO 链接统一 UTM。
