# HERMES-OPERATIONS-MANUAL.md

> 本项目（bookconv.com）经验萃取手册 · 2026-10-19 初版
> 目标：让 Hermes 能独立诊断故障、执行巡检、处理数据，但**不直接改代码**
> 对应权限边界：见 `MEMORY.md` §2026-10-19 Hermes 交接原则

---

## 1. 项目架构速览

### 1.1 关键路径

| 用途 | 路径 |
|---|---|
| 项目根 | `E:/一人公司/电子书格式转换站/ebook-converter/` |
| 源码 | `src/lib/`、`src/app/`、`src/components/` |
| 测试 | `tests/reverse-verify-*.test.ts`、`tests/unit/` |
| 脚本 | `scripts/*.mjs`（SEO/GEO/审计/周报） |
| 数据（入库） | `data/keyword-series.json`、`data/competitor-series.json`、`data/page-series.json`、`data/seo-geo-board.json` |
| 数据（gitignored） | `数据分析/*.md`、`_wb_tmp/` |
| 文档 | `docs/`、`.workbuddy/memory/` |
| 事故报告 | `docs/incident-*.md` |

### 1.2 技术栈

- Next.js App Router + TypeScript + Tailwind
- 转换后端：CloudConvert v2（Calibre 引擎 + 自动降级）
- 监控：GA4（tabbit Playwright 路径）+ GSC API + Bing Webmaster
- 告警：飞书 Webhook（`FEISHU_WEBHOOK_URL` 环境变量）
- 部署：Vercel（push ≠ deployed，冷启 60-90s）

### 1.3 GitHub 账号

- **唯一账号** `doujianwen`（7701484@qq.com）
- **SSH 别名** `github-old` → `~/.ssh/id_ed25519`（直连 SSH，禁走 HTTPS 会 502）
- **仓库**：`github-old:doujianwen/bookconv-frontend`
- **Git 仓库根目录**：`E:/一人公司/电子书格式转换站/`（不是 `ebook-converter/` 子目录）

---

## 2. 故障诊断流程

### 2.1 转换失败事故（告警 → 诊断 → 报告）

**触发信号**：飞书 `[bookconv] Conversion Failed` 告警

**诊断步骤**：

1. **查 Job ID**：告警消息含 `job=<id>`，例 `c3beac1b-...`
2. **取完整日志**：
   ```bash
   # Vercel 函数日志（需用户手动从 dashboard 导出，或查 cron 输出文件）
   # 关键字段：detail / failedTask / allTasks
   grep "CloudConvert job failed" 日志路径
   ```
3. **受控复现**（排除系统性故障）：
   ```bash
   # 最小合法 EPUB → epub→pdf
   curl -X POST "https://www.bookconv.com/api/convert" \
     -F "file=@tests/fixtures/mini-epub.zip" \
     -F "source=epub" -F "target=pdf"
   # 期望：HTTP 200 / 产出有效 PDF
   ```
4. **事故注入**（验证拦截机制）：
   - 构造「结构完好但成员数据损坏」的 EPUB → 期望 `500 + code=CORRUPT_INPUT`
   - 若仍走 CloudConvert 失败 → 深度校验未生效（回滚？）
5. **写事故报告**：`docs/incident-YYYY-MM-DD-<短描述>.md`
   - §0 结论先行
   - §1 证据链（受控复现实验表）
   - §2 根因判定（概率分级：高/中/低）
   - §3 代码缺陷（如有，附修复 diff）
   - §6 follow-up
   - §7 拍板与落地

**常见事故类型**：

| 错误特征 | 根因 | 处理 |
|---|---|---|
| `after 1 attempt(s)` + `Input task has failed` | import 侧文件损坏或瞬态抖动 | 检查是否 402；若 import 任务 error → 可能文件损坏 |
| `CloudConvert client error 402` | 额度耗尽 | 用户充值后 5 分钟内自愈；本进程缓存 TTL 5min |
| `timeout` / `did not finish in time` | Vercel 60s 硬上限或 CC 轮询超时 | 大文件（>2MB）epub→mobi 可能超时；纯 JS 路径（txt/zip/rtf/fb2/docx）无此风险 |
| `CLOUD_CONVERT_ERROR` | CloudConvert 服务异常 | 走降级引擎重试（convert→auto） |

### 2.2 GA4 数据异常

**触发信号**：日报 0 数据 / 连续两天无转化

**诊断路径**：

1. **查 proxy/VPN 状态**：本机在中国大陆，`analytics.google.com` 被 GFW 拦截
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://analytics.google.com
   # http=000 = 代理未开；http=200 = 网络正常
   ```
2. **查 cookie 是否过期**：tabbit 浏览器打开 GA tab → 若出现登录墙 → 用户重登
3. **查 gateway 是否在跑**：
   ```bash
   hermes cron status
   # ✓ Gateway is running — cron jobs will fire automatically
   # 否则报 "No gateway is running"
   ```
4. **查 tabbit 浏览器会话**：
   - GA 日期切换必须用「日历格子点选」法（URL hash/reload 均被覆盖）
   - 唯一可靠写法：`button[aria-label="2026年10月3日"]` 点选

### 2.3 关键词周报异常

**触发信号**：`npm run audit:workbench` 失败 / 周报数据跳跃

**诊断路径**：

1. **检查 SerpApi 观测深度**：
   ```bash
   # 实测 SerpApi 只返回 ~8-10 条 organic_results，非请求的 100 条
   # rank=0 = "未进入观测窗口" ≠ "未进 Top-100"
   ```
2. **按 prevDate 分组**：任何「上期浅 + 本期深」组合会被判成 `new`（新进）
   - 10-19 实测 30 个「新进」**全部** prevDate=2026-10-12（退化快照）
   - 读 new/gone 前必须先按 prevDate 分组看分布
3. **检查质量门禁**：`fetch-competitor-serp.mjs` 写盘前会检查命中数 < 历史中位数 40% → 拒写并 exit 1

---

## 3. 代码纪律与门禁规则

### 3.1 门禁系统

本项目有多层门禁（pre-commit hooks + npm scripts），**门禁挂点本身也会是假门禁**：

| 门禁 | 命令 | 作用 |
|---|---|---|
| syntax-sweep | `npm run syntax-sweep` | 扫描 src/ 语法错误 |
| content-integrity | `npm run audit:content-integrity` | 扫 blog/guide/content 数据一致性 |
| find-duplicate-headings | `npm run find-duplicate-headings` | 标题唯一性 |
| meta-desc | `npm run audit:meta-desc` | meta description 长度 + markdown 残留 |
| tsc | `tsc --noEmit` | TypeScript 类型检查 |
| next build | `npm run build` | Next.js 构建（需 `--webpack` + 无沙箱） |
| workflow-integrity | `npm run audit:workflow-integrity` | 工作流完整性 |
| agent-discipline | `npm run audit:agent-discipline` | AI 纪律检查 |

**基线**：`47 passed / 0 failed`（2026-10-19 实测确认）

### 3.2 Git 纪律

- **禁 `git add -A`**：只 stage 本轮变更文件
- **仓库根**：`E:\一人公司\电子书格式转换站\`（不是 `ebook-converter/`）
- **Push 前**：`unset HTTP_PROXY HTTPS_PROXY`（Windows schannel 走 HTTPS 会 502）
- **Push 后验证**：等 ~90s 冷启 → `curl -I https://www.bookconv.com` + 断言关键内容
- **Push**：
  ```bash
  unset HTTP_PROXY HTTPS_PROXY
  git push github-old main
  # 验证：git rev-list --left-right --count origin/main...main → 0	0
  ```

### 3.3 代码修改权限边界

| 操作 | Hermes 权限 |
|---|---|
| 故障诊断、事故报告 | ✅ 自主执行 |
| 数据脚本、cron 任务 | ✅ 自主执行 |
| 修改 `src/lib/` 生产代码 | ❌ 必须由人工执行 |
| commit / push | ❌ 必须由人工执行 |
| 反例证伪门禁判据 | ❌ 必须由人工执行 |

**根因**：「静默假成功」是本项目头号敌人——Edit 报 success 没改/门禁扫 0 文件/断言方向反。Hermes 当前无 pre-commit hook 执行上下文，无法验证修改真实生效。

---

## 4. SEO/GEO 方法论

### 4.1 内容结构

| 类型 | 数量 | 路径 |
|---|---|---|
| Blog | 68 | `src/data/blog/*.ts` |
| Guide | 23 | `src/data/guides/*.ts` |
| Convert 页 | 30 | `src/data/contents/*.ts` |
| CONVERSION_MAP | 31 | `src/lib/conversion-map.ts` |

**CI 必检**：`llms.txt`（Guides==博文数、Conversions==31）

### 4.2 Meta Title 标准

- **长度**：≤55 字符（SERP 截断线）
- **数据来源**：`metaTitle ?? title`（blog `page.tsx:60/80`、guide `:52`）
- **西语同样有兜底**：`es.metaTitle ?? es.title`
- **改标题长度只改 metaTitle，不伤可见内容**

### 4.3 Meta Description 标准

- **长度**：25-158 字符（Bing 硬限 160）
- **禁 markdown 残留**：`**`/反引号/[文本](链接)
- **双层防护**：
  1. 渲染层：`clampMetaDescription()` 句末截断+strip
  2. 数据层：`audit:meta-desc` ERROR/WARN 分级
- **blog/guide 无独立 description 字段**：meta description = intro 首段
  ⇒ 写内容时 intro 首句必须自包含成 ≤155 字符可独立摘要

### 4.4 GEO 四项攻坚

| 项 | 优先级 | 状态 |
|---|---|---|
| 实体一致性 | P1 | 已完成 1.3 收口 |
| FAQ 结构化 | P1 | M6-9 due 11-02 |
| AI 可引用金句 | P2 | M6-10 due 11-26 |
| 跨平台信源分发 | P2 | M4-6 due 11-15 |

---

## 5. 自动化清单

### 5.1 Hermes Cron Jobs

| Job ID | 排期 | 功能 | 脚本位置 |
|---|---|---|---|
| `6c073b9d16fe` | `30 21 * * *` | 每日清理垃圾 | `%LOCALAPPDATA%\hermes\scripts\cleanup-daily-junk.py` |
| `33d3b61a59e9` | `0 8 * * 1` | 周一晨间雷达 | `%LOCALAPPDATA%\hermes\scripts\scan-morning-radar.py` |
| `5deefeb00084` | `30 7 * * *` | GA4 每日巡检 | `%LOCALAPPDATA%\hermes\scripts\run-ga-daily.py` |
| `f88c301a` | 每周一 09:00 | 关键词+竞品 SERP | WorkBuddy 自动化 |

**⚠️ Windows 自启机制**：
- VBS 在 `Startup` 文件夹：`C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\Hermes_Gateway.vbs`
- 仅登录事件触发；已登录会话需手动 `hermes --profile default gateway run`
- 检查 gateway：`hermes cron status`

### 5.2 桌面版 Herme 故障排查

| 症状 | 排查点 |
|---|---|
| `exit 1` 启动失败 | 检查 `activity.json` 是否为合法 JSON（`{"entries": []}`） |
| 路径 | `E:\Program Files\Hermes Agent CN Desktop\data\update-activity\activity.json` |
| 自愈守卫 | 登录自启脚本：`guard-hermes-desktop-activity.ps1` |

### 5.3 关键脚本入口

```bash
# 周一周报（关键词+竞品+候选原因+简报）
node scripts/run-weekly-seo.mjs

# GA4 日报
node scripts/fetch-ga4-daily.mjs --write

# 门禁全跑
npm run audit:all

# 作战板状态
npm run check-board-json
```

---

## 6. 已知陷阱与反模式

### 6.1 Windows/Node 特有坑

| 坑 | 现象 | 解法 |
|---|---|---|
| 模板字符串 `${}` | Node 报 `Expression expected` | shell 内转义为 `\${...}` |
| Windows fork 二进制 EBUSY | 门禁 git 调用失败 | 改纯 fs 读取、git 清单走 stdin |
| Python `open()` EOL | `\r\n`→`\n` 静默转换 | 查 EOL 必须 `newline=''` |
| curl `-F` 路径 | Git Bash 下 `@/tmp/...` 解析失败 | 用绝对路径或 Windows 风格路径 |
| Tabtab nodejs 顶层 await | 24ms 返回 null，代码不执行 | 用 `return (async()=>{...})()` 包 IIFE |

### 6.2 Vercel 特有坑

| 坑 | 现象 | 解法 |
|---|---|---|
| push ≠ deployed | 刚 push 查线上 404 | 等 60-90s 冷启后再验证 |
| maxDuration=300 被忽略 | Hobby 计划 60s 硬上限 | 大文件走纯 JS 路径（txt/zip/rtf/fb2/docx） |
| cookie 非 REST token | `Downloads/cookies.txt` 调 `/v6/deployments` 报 403 | 用专用 API token |
| 不存在路径返 200 | 死链判据只看状态码会误判 | 查 `X-Matched-Path` + 内容比对 |

### 6.3 CloudConvert 特有坑

| 坑 | 现象 | 解法 |
|---|---|---|
| 402 缓存 | 充值后仍失败 ~5 分钟 | 本进程缓存 TTL 5min，到期自动恢复 |
| import 失败级联 | `Input task has failed` 挂在 export 任务上 | 分类器已修复：消息签名 + 任意 import error 均认定 |
| HTTP header Latin1 | 中文文件名 TypeError | RFC5987 `filename*=UTF-8''`+ASCII legacy 兜底 |
| 输出引擎限制 | calibre 引擎不可出 docx/html | 失败自动降级 engine:auto 重试一次 |

### 6.4 GA4 tabbit 特有坑

| 坑 | 现象 | 解法 |
|---|---|---|
| 日期存内部状态 | URL hash/reload/改 input 均被覆盖 | 先 fresh load 带维度报告 → 点日历格子改日期 |
| actionability 超时 | `getByRole(...).click()` 60s 截止 | 页内 `element.click()` 派发真实点击 |
| 单维度 sessionMedium 不生效 | 来源媒介 0 | eventName+sessionMedium 双维度 + reload |
| `page.goto` 直接带 hash | 落 `about:blank` | 先 `goto(BASE)` 建立 host → 再设 hash |

### 6.5 门禁假成功反模式

| 假成功 | 表现 | 防范 |
|---|---|---|
| Edit 报 success 没改 | 输出 success 但文件未变 | 改后 `git diff` 复核 |
| 门禁扫 0 文件 | 无命中但报 PASS | 断言命中数 > 0 |
| 断言方向反 | PASS 实际是 FAIL | 反向验证：注入事故 → exit 1 |
| 判据无法执行却报 PASS | CI 缺项 → 永久红 | 不可判定项降级为 UNKNOWN |

---

## 7. 工作节奏铁律

### 7.1 频率表

| 工作 | 频率 | 备注 |
|---|---|---|
| Google/Bing 数据分析 | 每周一次 | 看完整周对比，不凭单日涨跌改方向 |
| 关键词排名 | 每周一次 | 固定词表与目标页 |
| GEO 分析 | 每周一次 | 固定问题集/平台/记录方式 |
| 竞品分析 | 每周轻扫 + 每月深看 | 无实质变化写「维持原计划」 |
| 故障/转换失败 | 持续监控 | ❌ 不降频 |
| 内容与代码验收 | 每次改动后 | ❌ 不降频 |

### 7.2 周复盘三问

1. 上周交付了什么（具体页面/修复/外链动作）
2. 有没有足以改变行动的新证据？没有 → 显式写「维持原计划」
3. 本周最重要的三项交付（每项带完成标准）

**禁止**：为让周报显得有价值而制造新问题、追加新任务、重开已闭环议题。

### 7.3 权威源

- **唯一待执行计划**：`docs/seo-geo-execution-plan-2026-09-17.md`（§八 Batch 4 / §九 D 系列 / §十 M 系列）
- **状态回写**：`hermes-context/seo-geo-execution-plan-2026-09-17.md`
- **冲突以 docs/ 源为准**

---

## 8. 经验复利机制

每次事故沉淀四件套：
1. **HERMES.md 经验条目**（本手册）
2. **自动化脚本**（可复用诊断工具）
3. **skill/门禁**（固化到项目纪律）
4. **hermes-context/**（当前会话上下文）

下次同类问题调取已有资产，不再从零诊断。

---

## 附录：快速参考

### A. 常用命令

```bash
# 门禁全跑
cd "E:/一人公司/电子书格式转换站/ebook-converter"
npm run audit:all

# 检查构建
npm run build  # 需 --webpack + 无沙箱

# Git 提交（禁 add -A）
git add src/lib/cloudconvert.ts tests/reverse-verify-conversion-fixes.test.ts
git commit -m "fix: cloudconvert retry classifier blind spot"

# Git push（旧账号）
unset HTTP_PROXY HTTPS_PROXY
git push git@github-old:doujianwen/bookconv-frontend.git main

# 验证部署
curl -s https://www.bookconv.com | head -5
```

### B. 关键文件位置

| 文件 | 用途 |
|---|---|
| `src/lib/cloudconvert.ts` | CloudConvert API 客户端 |
| `src/lib/conversion.ts` | 输入校验（EPUB 深度校验） |
| `src/lib/alerts.ts` | 飞书告警 |
| `scripts/fetch-ga4-daily.mjs` | GA4 日报脚本 |
| `scripts/build-keyword-series.mjs` | 关键词序列构建 |
| `scripts/build-competitor-series.mjs` | 竞品序列构建 |
| `tests/reverse-verify-*.test.ts` | 反向验证测试 |
| `.workbuddy/memory/MEMORY.md` | 长期记忆 |
| `docs/incident-*.md` | 事故报告 |

### C. 沟通纪律

- 结论先行，结构化分段
- 实测数据标注样本量、时间窗、置信度
- 自己的上一轮摘要一律不算证据，必须重拉原始数据
- 「现象真实」≠「某归因框架成立」，先核验机制、找反例
- 输出里把原始证据和推论分开写（实测 → 推断 → 待验证三段式）
