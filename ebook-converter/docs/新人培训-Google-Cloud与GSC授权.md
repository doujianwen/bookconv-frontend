# Google Cloud 操作新人培训手册（bookconv.com · GSC 数据授权）

> 目的：让新人能独立完成「创建 OAuth 凭据 → 授权 GSC → 产出快赢报告」全流程，不经过试错。
> 适用：seo-ops skill（`~/.workbuddy/skills/seo-ops/`），数据来自 bookconv.com 的 Google Search Console。
> 最后更新：2026-08-08（基于真实踩坑整理）

---

## 0. 总览：授权链路 4 道关卡

| # | 关卡 | 不做的后果 | 在哪操作 |
|---|---|---|---|
| 1 | 创建 OAuth 桌面应用凭据 | 没得登录 | GCP Console → 凭据 |
| 2 | 把登录账号加进「测试用户」 | Google 拒登录（"未完成验证"） | GCP Console → OAuth 同意屏幕 |
| 3 | 启用 Search Console API | API 调用 403 | GCP Console → 库 |
| 4 | GSC 属性用 `siteOwner` 的那个 URL | 403 权限不足 | GSC 后台 + `.env` 配置 |

**核心认知**：OAuth 应用「未验证」时，只允许「测试用户」名单里的账号登录。每次换一组新凭据（新项目），都得在该项目重做第 2、3 步。

---

## 1. 创建 OAuth 桌面应用凭据

1. 打开 <https://console.cloud.google.com/apis/credentials>
2. 顶部确认项目是你**自己的** GCP 项目（推荐只用一个，避免多项目混乱）
3. 「创建凭据 → OAuth 客户端 ID」
4. 应用类型选 **桌面应用**（名称随意，如 `bookconv-seo`，**别叫陌生名**）
5. 创建后拿到：
   - **客户端 ID**（形如 `xxxxx.apps.googleusercontent.com`）
   - **客户端密钥**
6. 把这两个值发给运维/AI 助手，填入 `~/.workbuddy/skills/seo-ops/.env` 的：
   ```
   GOOGLE_CLIENT_ID="你的客户端ID"
   GOOGLE_CLIENT_SECRET="你的客户端密钥"
   ```

⚠️ **坑**：不要用从教程/模板复制来的凭据（如 n8n 的 OAuth 应用）。那不是你的项目，Google 绝不让外部账号授权，会报"n8n 尚未完成验证"。

---

## 2. 添加「测试用户」白名单（最关键的一步）

1. 同一项目 → 左侧 **OAuth 同意屏幕**
2. 看「发布状态」：
   - 若是 **测试** → 必须做下一步
   - 若是 **已发布（生产）** → 可跳过（但首次建议先测试）
3. 「测试用户」→ 添加 → 填入**你要用来登录授权的 Google 账号**（如 `douhongjian@gmail.com`）
4. 保存

⚠️ **坑**：这一步不做，点授权网址会直接弹"应用未完成 Google 验证流程"。即使你自己建的凭据也会失败——因为账号不在白名单。

---

## 3. 启用 Search Console API

1. 打开 <https://console.cloud.google.com/apis/library/searchconsole.googleapis.com>
2. 确认顶部项目是第 1 步那个
3. 点 **启用**（Enable）
4. 等 1~2 分钟让 Google 系统生效

⚠️ **坑**：报错 "Google Search Console API has not been used in project X before or it is disabled" = 没启用。API 必须启用在**创建凭据的那个项目**里。

---

## 4. 确认 GSC 属性 URL 形式（第 4 道关卡）

1. 运行 `bash run-gsc.sh sites` 列出你账号管理的 GSC 属性及权限
2. 找到 bookconv.com 相关的两行（通常都有）：
   ```
   https://www.bookconv.com/        siteOwner            ✅ 用这个
   sc-domain:bookconv.com           siteUnverifiedUser   ❌ 不用这个
   ```
3. 把 `.env` 的 `GSC_SITE_URL` 设为 **`siteOwner` 那个**：
   ```
   GSC_SITE_URL="https://www.bookconv.com/"
   ```
   （注意：URL 前缀属性要带末尾斜杠 `/`）

⚠️ **坑**：GSC 的「URL 前缀属性」和「网域属性」是**两个独立实体**，权限不互通。你对 `sc-domain:bookconv.com` 可能只是 `siteUnverifiedUser`，对 `https://www.bookconv.com/` 才是 `siteOwner`。用错就 403。

---

## 5. 一键授权 + 跑报告

环境已就绪（venv + 依赖 + 运行器）：
```bash
cd ~/.workbuddy/skills/seo-ops

# 1) 启动授权回调服务（监听 localhost:8765）
bash run-gsc.sh auth
# → 打印授权网址，用「测试用户」账号登录 → 同意 → 显示 "GSC Authorized" 关掉

# 2) 跑报告（90 天窗口才有足够样本，新站 28 天常为空）
bash run-gsc.sh striking 90      # 位置 4-20 快赢词
bash run-gsc.sh queries 50 90     # TOP 50 词
bash run-gsc.sh pages 30 90      # TOP 30 页面
bash run-gsc.sh devices 90       # 设备拆分
bash run-gsc.sh countries 15 90  # TOP 15 国家
bash run-gsc.sh trend 90         # 每日趋势
```

⚠️ **网络坑**：本机若走代理（如 `HTTPS_PROXY=http://127.0.0.1:7897/`），`gsc_client.py` 已内置 urllib3 代理传输层，无需额外配置。若换机器，确认代理变量已设置。

---

## 6. 新人自检清单

- [ ] 凭据是自己 GCP 项目建的（非复制）
- [ ] 登录账号在「测试用户」名单
- [ ] Search Console API 已启用（同项目）
- [ ] `.env` 的 `GSC_SITE_URL` 是 `siteOwner` 属性的 URL（带末尾斜杠）
- [ ] 授权后 `sites` 能看到 `https://www.bookconv.com/  siteOwner`
- [ ] 报告用 **90 天** 窗口（新站 28 天常为空）

---

## 7. 故障速查

| 报错/现象 | 原因 | 解决 |
|---|---|---|
| "n8n 尚未完成 Google 验证流程" | 用了非自有项目的凭据 | 自建 OAuth 桌面应用 |
| "应用未完成验证" | 账号不在测试用户名单 | 第 2 步加测试用户 |
| `ERROR: No auth code received` | 登录被 Google 拦（重定向带 `error=` 而非 `code=`） | 通常是测试用户漏加，回第 2 步 |
| API 403 "has not been used...disabled" | 没启用 Search Console API | 第 3 步启用 |
| 403 "User does not have sufficient permission" | `.env` 的 GSC_SITE_URL 不是 siteOwner 属性 | 第 4 步改对 URL |
| 报告 28 天窗口 "No data returned" | 新站近期展示少 | 改用 90 天 |
| `striking` 命令返回空 | 内置 `min_impressions=50` 阈值过滤掉所有低展示词 | 用 `queries 100 90` + Python 过滤位置 4-20 |

---

## 8. 文件结构（seo-ops skill）

```
~/.workbuddy/skills/seo-ops/
├── .env                  ← 配置（GOOGLE_CLIENT_ID/SECRET、GSC_SITE_URL）
├── gsc_auth.py           ← OAuth 授权（打印网址 + 捕获 localhost:8765 回调）
├── gsc_client.py         ← GSC API 客户端（已修代理传输层）
├── monitor_token.py      ← token 落盘监测（Python time.sleep，绕过 Git Bash 限制）
├── run-gsc.sh            ← 一键运行器（自动 source .env）
└── GSC快赢报告操作说明.md  ← 原操作说明
```

**给新人的话**：本手册覆盖「能跑通」所需的全部 GCP 操作。真正难的不是命令，是第 2/3/4 步的 GCP 配置——它们都不在代码里，而在 Google 后台。按第 0 节的 4 道关卡逐条核对，基本一次就能过。
