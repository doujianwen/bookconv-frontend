# Upstash Redis 接入清单

> 用途：让「付费 → Pro」链路在 Vercel 上真正生效。
> 关联提交：`0d15c34`（修复 Pro 三处断裂 + `/batch` 门禁）。
> 本文是部署运维文档，不涉及 GEO/SEO 七段采样流程。

---

## 0. 为什么需要这份清单

Pro 链路修复后，代码已具备完整闭环：

```
UpgradeButton ──email──▶ checkout/route.ts ──custom_data.email──▶ Lemon Squeezy
                                                          │
                                              webhook/route.ts（付款成功回传）
                                                          │ resolveUserEmail(custom_data.email)
                                                          ▼
                                          saveSubscription(email) → Redis: sub:{email}
                                                          │
                                           用户访问 /batch（服务端组件）
                                                          ▼
                                  getSession().email → getPlanByEmail(email) → 读 Redis: sub:{email}
                                                          │
                                                  Pro → 显示上传器 / 否则 → 升级引导
```

**关键前提**：`src/lib/redis.ts` 读取环境变量 `REDIS_URL`。

- 不设 `REDIS_URL` → `getRedisClient()` 返回 `null` → 订阅写不进、读不到。
- 代码对所有 Redis 失败做了优雅降级（try/catch + 日志），**不会崩**，但结果是：
  - webhook 收到付款也存不住；
  - `/batch` 门禁对非 Pro 用户"关闭"（即所有人都走升级引导，不会误放）——这是**安全默认**。
- 设好 `REDIS_URL` 且可达 → 上述闭环才真正打通。

**目标**：在 Vercel 配置一个可达的 `REDIS_URL`（Upstash 的 `rediss://` 地址），让付费状态可持久化、门禁可正确放行。

---

## 1. 前置依赖

| 项 | 要求 |
|---|---|
| Upstash 账号 | 免费层即可（有 Redis 协议额度） |
| Vercel 项目 | `bookconv` 已部署，能访问 Project Settings → Environment Variables |
| Lemon Squeezy | 已配置（checkout/webhook 已就绪，本清单不改 LS 侧） |
| 本地验证 | 可选：本地 `export REDIS_URL=...` 后 `node -e` 测连通 |

---

## 2. 步骤

### 步骤 1 —— 注册 / 登录 Upstash
- 打开 https://upstash.com ，用 GitHub 或邮箱注册。
- 进入控制台 **Home → Redis**。

### 步骤 2 —— 创建 Redis 数据库
- 点 **Create database**。
- 填名（如 `bookconv-prod`）。
- **Region**：选离用户近、且与 Vercel 部署区域一致（建议 `us-east-1` / `aws-us-east-1`，与 Vercel 默认同区，延迟最低）。
- **Type**：选 **Regional**（标准，免费层默认）。
- **TLS**：保持开启（Upstash 默认）。我们代码只认 `rediss://`，**不要选明文端口**。
- 创建。

### 步骤 3 —— 复制 `rediss://` 端点
- 数据库详情页 **REST API / Redis Connect** 区域，找到 **`redis-cli` / Endpoint** 字段。
- 形如：`rediss://default:xxxx@computed-xxxxx.upstash.io:6380`
- 复制**完整字符串**（含 `rediss://`、用户名、密码、主机、端口）。
- ⚠️ 这是带密码的凭据，等同生产密钥——不要提交进仓库、不要贴进公开渠道。

### 步骤 4 —— 在 Vercel 配置环境变量
- Vercel 控制台 → `bookconv` 项目 → **Settings → Environment Variables**。
- 新增：
  - **Key**：`REDIS_URL`（严格大写，代码只读这个名）
  - **Value**：步骤 3 复制的 `rediss://...` 字符串
  - **Environments**：勾选 **Production**（务必）；建议同时勾 **Preview**（预览部署也能验），**Development** 可选（本地 dev 不设也能跑，会走降级）。
- Save。

### 步骤 5 —— 触发重新部署
- 改环境变量后 Vercel 不会自动重读旧实例。**Redeploy**：
  - 进入 **Deployments** → 最近一次 Production → **Redeploy**；
  - 或 `git commit --allow-empty -m "chore: redeploy for REDIS_URL"` 推一次（更稳，确保新构建拿到变量）。
- 等构建完成（约 1–2 分钟）。

### 步骤 6 —— 验证（见第 3 节）

---

## 3. 验证清单

按从低到高逐层验证，任一层失败即停、不要跳过。

- [ ] **3.1 变量已注入**
  - Vercel 环境变量列表里 `REDIS_URL` 存在且值以 `rediss://` 开头。
  - 本地可用 `vercel env pull` 拉取后 `echo $REDIS_URL` 核对。

- [ ] **3.2 连通性**
  - 本地：`export REDIS_URL=...` 后跑
    ```bash
    node -e "const {getRedisClient}=require('./src/lib/redis.ts'); /* 仅示意，需用 ts 运行时 */"
    ```
  - 更简单：用 Upstash 控制台 **Redis CLI** 直接 `PING`，返回 `PONG` 即通。
  - 部署后：访问 `/api/health`（若已接 `isRedisHealthy`），观察日志是否还有 Redis 超时。

- [ ] **3.3 写入 → 读取闭环（核心）**
  - 手动写一条测试键，确认和代码同前缀：
    ```
    SET sub:test@example.com '{"status":"pro","variantId":"123","endsAt":null}'
    ```
  - 调用 `getPlanByEmail('test@example.com')` 应能解析出 `pro`。
  - 验证完 `DEL sub:test@example.com` 清理。

- [ ] **3.4 Webhook 真链路（E2E）**
  - 用真实 LS 测试订阅事件（Sandbox / Test mode）触发 `subscription_created`。
  - 查 Redis：`GET sub:{下单邮箱小写}` 应存在且 `status=pro`。
  - 若 webhook 日志出现 `Subscription event has no resolvable email; skipping` → 说明 checkout 没把 email 带过去（回查 `UpgradeButton` 是否拿到会话邮箱 / `checkout/route.ts` 的 `custom_data`）。

- [ ] **3.5 门禁放行**
  - 用该邮箱登录（/api/auth/me 返回 email）→ 访问 `/batch`。
  - 预期：看到批量上传器（非升级引导）。
  - 非 Pro / 未登录访问 `/batch` → 预期：看到升级引导卡（Lock 图标 + Upgrade to Pro）。

- [ ] **3.6 部署后冒烟**
  - `curl -s https://www.bookconv.com/batch | grep -o "Batch conversion is a Pro feature"` 应命中（非 Pro 默认态）。

---

## 4. 安全 / 降级说明

- **不设 `REDIS_URL`**：安全默认——`/batch` 对所有人显示升级引导，不会误放行付费功能；webhook 静默跳过（仅日志 warn）。
- **设了但短时不可达**：webhook 写失败有日志，用户本次订阅状态可能丢失，需重跑 webhook 或手动 `SET sub:...` 补救。
- **密钥管理**：`REDIS_URL` 含密码，只存 Vercel 环境变量，勿进 git、勿进 `llms.txt`、勿进任何公开文档。
- **轮换**：Upstash 控制台可 Reset 密码，换后同步更新 Vercel `REDIS_URL` 并重部署。

---

## 5. 已知坑 / 注意

1. **端口必须 TLS**：代码 `redisUrl.startsWith('rediss://')` 才加 `tls` 配置；若给 `redis://`（明文）会连不上或证书错误。Upstash 默认给的即是 `rediss://`，直接用即可。
2. **区域就近**：Upstash 与 Vercel 不同区会增加冷启动延迟；Upstash 免费层单区域，选与 Vercel 同区最优。
3. **免费额度**：Upstash 免费层有每日请求/存储上限，Pro 链路读写量极低（仅订阅事件 + 每次 `/batch` 访问），通常够用；若超量会限流，表现为偶发降级。
4. **内存用户表残留风险（不在本清单范围）**：`src/lib/auth/storage.ts` 用户表仍是内存 `Map`，Vercel 上不跨请求存活 → 登录/注册在冷实例可能失败。JWT 会话本身跨请求（只验签名不查库），所以"注册一次 → cookie 维持"能跑通 Pro；但重登/多实例会踩。彻底修复需换 Supabase/Postgres，属更大重构（待办 #4）。
5. **`/api/health` 碰 Redis**：旧实现有 Redis 超时告警，属已知；设好 Upstash 后该告警应消失。

---

## 6. 完成判定

以下条件全满足，即视为接入成功：

- [ ] Vercel `REDIS_URL` = `rediss://...` 已设且重部署生效
- [ ] 一次真实（或测试模式）订阅后，Redis 出现 `sub:{email}` 且 `status=pro`
- [ ] 登录该邮箱访问 `/batch` 显示上传器
- [ ] 非 Pro 访问 `/batch` 显示升级引导

完成后建议补一条记录到 `.workbuddy/memory/2026-08-09.md`，并将待办 #5 标记关闭。
