# CloudConvert 救活生产转换 · SOP（2026-08-15）

> 背景：Vercel 生产环境 `/api/convert` 对非 epub 格式返回 500，根因是 `CONVERSION_BACKEND_URL`/`CONVERSION_INTERNAL_SECRET` 均未配，且 `CLOUD_CONVERT_API_KEY` 也未配 → `conversion.ts` 兜底链 `Calibre 不可用 → CloudConvert 未配置 → throw "Calibre is not available"` → 500（见 `analytics`/Vercel 日志 CSV 实锤）。
>
> 用户选择 **CloudConvert 方案**（免 VPS，最快救活）。本 SOP 为注册 + 取 key + 配置 + 验证闭环。

## 一、为什么是 CloudConvert（决策依据）

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| **CloudConvert key**（已选） | 免 VPS，5 分钟填 key 即活；`cloudconvert.ts` 已就绪 | 免费档限流；内容经第三方 | **当前采用** |
| Calibre VPS | 无限量、自有设施 | 常驻服务器 + 端口/secret 运维 | 量大再考虑 |

代码侧已具备：`src/lib/cloudconvert.ts`（v2 客户端，Bearer token，轮询 25×2s=50s）+ `conversion.ts:355` 兜底调用。**只需填一个 env：`CLOUD_CONVERT_API_KEY`**，不改动任何代码。

## 二、注册 + 取 API Key（用户在 CloudConvert 官网操作）

1. 打开 https://cloudconvert.com/ → 右上角 **Sign Up**（支持 Google / GitHub / 邮箱）
2. **验证邮箱**（务必点验证邮件里的链接，否则 API key 不生效；邮件可能在垃圾箱）
3. 登录后**直接打开** 👉 **https://cloudconvert.com/dashboard/api/v2/keys**（官方文档明确路径，最稳，不受 UI 改版影响）
   - **不要**点顶部 **API** 下拉里的「File Conversion API / Office to PDF API」——那些是**产品/文档入口**，不是 key 管理页（截图见用户反馈 2026-08-15）
   - 备选路径：右上角个人头像 → **Settings** → 左栏 **API** → **API Keys**
4. **Create new API key**
   - Name：填有意义的名，如 `bookconv-production`
   - Scope：勾选 **`tasks.read` + `tasks.write`**（复数 tasks，不是 task！2026-08-18 实锤：单数 `task.read`/`task.write` 现在返回 403 `Invalid scope(s) provided`；CloudConvert 当前校验复数 scopes。代码只需创建 + 轮询 job，这两项足够）
   - Expires：选 `Never`（长期有效）
5. ⚠️ **API key 只显示这一次**，立刻复制保存

## 三、免费额度（纠正 8/15 早期误述）

- 免费档 = **25 conversion minutes / 天**（按转换分钟计费，非"25 次/月"）
- 1 GB 文件上限，1 API call / minute
- 付费档：$9/月 = 500 分钟起
- 对当前≈0 自然流量的 bookconv，小文件（电子书几 MB）足够过渡；量上来再升级
- 覆盖格式：含 mobi / epub / azw3 / pdf / docx 等电子书格式（200+ 格式）

## 四、填 Vercel env（用户在控制台操作，AI 沙箱无 Vercel 凭证）

> ⚠️ 实测：沙箱无 `vercel` CLI、无 `VERCEL_TOKEN`/`VERCEL_DEPLOY_TOKEN`，**无法自动改 Vercel env**。此步须用户在 Vercel 控制台做。

1. Vercel 控制台 → 项目 **`ebook-converter-ymfg`** → **Settings** → **Environment Variables**
2. **Add**：
   - Key：`CLOUD_CONVERT_API_KEY`
   - Value：用户给的 key（JWT 整串）
   - Environment：勾 **Production**（+ Preview 可选）
3. **Save**
4. ⚠️ **必须 Redeploy 让 env 注入生产**：Deployments → 最新生产部署 → ⋯ → **Redeploy**（勾 Use existing Build Cache 即可，关键是重新拉 env）；或推一次 git 触发自动部署
5. 部署完成后告诉 AI → AI 执行验证：
   ```bash
   # 真打一次 mobi→epub，断言不再 500
   curl -s -o /dev/null -w "%{http_code}" -F "file=@small.mobi" \
     -F "source_format=mobi" -F "target_format=epub" \
     https://www.bookconv.com/api/convert
   # 期望 200
   ```
6. 真转换一次 → 去 GA4 **实时（Realtime）** 报告确认
   `file_upload` → `conversion_complete`（或 `conversion_failed`）出现
   ⚠️ 看「实时」而非「近期事件」（后者 24–48h 延迟）

## 五、拿到 GA4 事件后 → 标关键事件

GA4 → 管理 → 事件 → 关键事件 → 把 `file_upload` / `conversion_complete` / `conversion_failed` 标为★关键事件 → 等 ~24h 配置生效 → 走 `geo/GA4重导与事件验证清单` 重导 4 份报表。

## 六、注意事项（诚实账本）

- **隐私**：用户电子书内容会上传到 CloudConvert 第三方服务器（GDPR 合规，但属第三方）。大文件/敏感内容需告知用户。
- **限流**：免费档 1 call/min，并发转换会 429；真有量需升付费或切 VPS。
- **key 不进 git**：只存 Vercel env，`.env.example` 已列占位，实际值不入库。
- **非根治**：本方案是"救活"而非"根治"。根治 = 部署自有 Calibre VPS（`docker-compose.yml` 已就位）+ `CONVERSION_BACKEND_URL`。

## 七、验证脚本（AI 用，node）

见 `C:/Users/29537/_diag_health.js` 同款探测 + 上方 curl。部署后若仍 500，回 Vercel Logs 看 `CloudConvert API key is not configured` 或 4xx（key 无效）。

## 八、验证记录（2026-08-15 18:46）
- 用户 key 已用 `C:/Users/29537/_cc_verify.js` 端到端验证 CloudConvert v2：
  create job 201 + upload 201 + poll finished(约 2s) + 拿到 export url → **key 有效、流程与 `cloudconvert.ts` 兼容**。
- 沙箱无 Vercel 凭证 → env 须用户按「四」在控制台填 + Redeploy，AI 再 curl 验 /api/convert 与 GA4 实时事件。

## 九、生产验证成功（2026-08-15 18:5x）
- 用户在 Vercel 控制台填 `CLOUD_CONVERT_API_KEY`(Production) + Redeploy 完成。
- 真打 `https://www.bookconv.com/api/convert`（epub→pdf，标准库生成规范 epub）：
  - 首次手造 zip epub → 500 `CORRUPT_INPUT`（**证明 key 已生效、CloudConvert 真收到文件**，仅测试文件不规范）
  - 改用 Python `zipfile` 规范 epub 重测 → **HTTP 200 + `%PDF-1.4` 14.7KB 合法 PDF**
- 结论：`CLOUD_CONVERT_API_KEY` 注入成功、`conversion.ts` CloudConvert 兜底激活、全站非 epub 格式（25/27）转换恢复，生产 500 事故解除。
- 剩余 GA4 事件验证：事件发射是浏览器前端行为（`trackGAEvent` 在选文件/转换成功时触发，生产 chunk 已证存在）；需用户在浏览器真实跑一次转换，再去 GA4 **实时**报告看 `file_upload`→`conversion_complete`（30s 内出现），等 24h 后标 3 事件为关键事件。
