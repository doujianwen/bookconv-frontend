# GSC 快赢报告 · 操作说明（bookconv.com）

> 工具：seo-ops 技能（用户级，装在 `~/.workbuddy/skills/seo-ops`，**不碰 ebook-converter 代码仓库**）
> 目标：用 Google Search Console 真实数据，产出「快赢」优化清单（位置 4–20 的查询、TOP 页面、衰退预警）。

---

## 0. 已为你准备好的（无需再装）

| 项目 | 状态 | 位置 |
|---|---|---|
| Python 3.13 专用虚拟环境 | ✅ 已装好 | `C:\Users\29537\.workbuddy\binaries\python\envs\seo-ops` |
| GSC 依赖（google-api-python-client / google-auth / requests） | ✅ 已装好 | 同上 venv |
| 配置文件 `.env`（已填 bookconv.com） | ✅ 已生成 | `~/.workbuddy/skills/seo-ops/.env` |
| 一键运行器 `run-gsc.sh` | ✅ 已生成 | `~/.workbuddy/skills/seo-ops/run-gsc.sh` |

**唯一卡点**：GSC OAuth 需要你本人的 Google 账号做一次浏览器登录授权，这一步我无法代劳。下面 Step 1–3 就是你来完成的部分，全部在你本机、几分钟搞定。

---

## 1. 在 Google Cloud 创建 OAuth 桌面端凭据

1. 打开 <https://console.cloud.google.com/apis/credentials>
2. 顶部确认/新建一个 **项目**（任意名字，如 `seo-ops-bookconv`）。
3. 先启用 API：左侧「已启用的 API 和服务」→「+ 启用 API 和服务」→ 搜 **Search Console API** → 启用。
4. 回到「凭据」页 → **创建凭据 → OAuth 客户端 ID**。
   - 如果提示先配置「OAuth 同意屏幕」：用户类型选 **外部（External）**，填个产品名，保存即可（本工具只用只读 scope，无需送审）。
5. 应用类型选 **桌面应用（Desktop app）** → 创建。
6. 创建后你会看到 **客户端 ID** 和 **客户端密钥**。

> ⚠️ 必须是「桌面应用」类型。用「Web 应用」会因为 redirect_uri 不匹配而失败。

---

## 2. 把凭据填进 `.env`

编辑 `C:\Users\29537\.workbuddy\skills\seo-ops\.env`，把这两行换成你的值（**不要加引号**）：

```ini
GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的客户端密钥
```

（`GSC_SITE_URL` 已预填为 `sc-domain:bookconv.com`，`YOUR_DOMAIN` 已预填 `bookconv.com`，一般不用动。）

---

## 3. 运行授权 + 浏览器登录

在 **Git Bash** 里执行（路径已绝对化，直接复制）：

```bash
cd "C:/Users/29537/.workbuddy/skills/seo-ops"
./run-gsc.sh auth
```

会发生什么：
1. 脚本自动打开默认浏览器，跳到 Google 登录页。
2. **用拥有 bookconv.com GSC 权限的那个 Google 账号登录**（就是当初验证 sc-domain:bookconv.com 的账号）。
3. 同意授权后，Google 会重定向到 `http://localhost:8765` —— 这是脚本本地起的回调服务，会自动捕获授权码并交换 token。
4. 看到 `✅ GSC token saved to .../.gsc-token.json` 和 `✅ GSC connected! Verified sites: ['sc-domain:...']` 即成功。
5. 浏览器标签页显示 “GSC Authorized! You can close this tab.” 即可关闭。

> 若浏览器没自动弹出：脚本会打印一个 `accounts.google.com/...` 的授权 URL，手动复制到浏览器打开并完成登录即可。

token 保存在 `~/.workbuddy/skills/seo-ops/.gsc-token.json`（权限 600，含 refresh_token，之后自动续期，不用每次登录）。

---

## 4. 验证连通性（可选但推荐）

```bash
./run-gsc.sh sites
```

应列出 `sc-domain:bookconv.com`（及你名下其他已验证站点）。能列出来就说明授权 OK。

---

## 5. 出 GSC 快赢报告

最快的三条（纯 GSC，无需 Ahrefs）：

```bash
# ① 快赢核心：位置 4–20 且曝光足够的查询（最该优化的）
./run-gsc.sh striking 28

# ② 按点击排序的 TOP 查询
./run-gsc.sh queries 50

# ③ 按点击排序的 TOP 页面
./run-gsc.sh pages 100
```

每条命令都会打印表格（关键词/页面、点击、曝光、CTR、平均位置）。`striking` 命中即「只差临门一脚」的词 —— 调一下标题/内链/内容就能冲进前 3。

> 想存成 JSON 便于二次处理，加 `--json`：
> `./run-gsc.sh striking 28 --json`（注意：当前 run-gsc.sh 未透传 --json，需要时直接跑
> `"./venv/python" gsc_client.py --striking --days 28 --json`，或告诉我加透传）。

### （可选）完整情报简报 `content_attack_brief.py`
需要 **Ahrefs token** 才有价值（竞品差距、难度 KD、趋势）。若你之后配了 `AHREFS_TOKEN`，运行：
```bash
./run-gsc.sh brief
```
会产出 BOFU 金钱词、趋势词、竞品缺口、衰退页面告警，并保存 JSON 到 `./output/content-attack-brief-latest.json`。

---

## 6. 报告怎么读 + 怎么行动

**`striking`（位置 4–20）是最直接的快赢：**
- 位置 4–10：基本稳进前 3，优先改标题含核心词、首段加关键词、内链从高权重页指向它。
- 位置 11–20：补内容深度、加 FAQ、争取外链/内链，争取进前 10。
- 列里 `Impr` 越大越值得先做（流量基数大）。

**`queries` / `pages`：** 看哪些词/页已经在出量，确认它们和「一页一词长尾」策略是否对齐；曝光高但 0 点击 → 改 SERP 标题/描述（meta）提升 CTR。

**`brief` 的衰退预警：** 28 天点击较 90 天日均跌 >30% 的词，优先复查是否被新页面蚕食（关键词自相残杀）或内容过时。

---

## 7. 排错

| 现象 | 原因 / 解决 |
|---|---|
| `ERROR: Google OAuth credentials required` | `.env` 里 `GOOGLE_CLIENT_ID/SECRET` 还是占位符，回去 Step 2 填真实值。 |
| 浏览器打开后报 `redirect_uri_mismatch` | 凭据类型不是「桌面应用」；或 Google Cloud 里没把 `http://localhost:8765` 当作允许的回调（桌面应用类型默认允许 localhost，无需手动加）。重做 Step 1 选「桌面应用」。 |
| `403 ... Search Console API has not been used` | 没启用 Search Console API，回 Step 1 第 3 步启用。 |
| `403 ... User does not have sufficient permissions` | 登录的 Google 账号不是该 GSC 属性的所有者。换正确账号登录。 |
| `FileNotFoundError: .gsc-token.json` | 还没跑授权，先 `./run-gsc.sh auth`。 |
| 报告空 / `No data returned` | 站点太新、查询期内无足够曝光；把 `--days` 调大到 90 再试。 |

---

## 8. 速查表

| 目的 | 命令 |
|---|---|
| 首次授权 | `./run-gsc.sh auth` |
| 验证站点 | `./run-gsc.sh sites` |
| 快赢关键词（4–20 位） | `./run-gsc.sh striking 28` |
| TOP 查询 | `./run-gsc.sh queries 50` |
| TOP 页面 | `./run-gsc.sh pages 100` |
| 点击趋势 | `./run-gsc.sh trend` |
| 设备分布 | `./run-gsc.sh devices` |
| 完整简报（需 Ahrefs） | `./run-gsc.sh brief` |

---

## 9. 给 AI 助手的话（下次直接复用）

环境已就绪，下次只需：确认 `.env` 里凭据已填 → `./run-gsc.sh auth` 完成浏览器登录 → 跑 `striking/queries/pages` 即可生成真实 GSC 快赢报告。token 长期有效（自动 refresh），除非撤销授权否则不用重复登录。
