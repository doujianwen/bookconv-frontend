# 运营审计调度方案

> 2026-07-30 · 解决 ai-audit.js 无定时调度问题

## 一、现状诊断

| 组件 | 是否定时 | 说明 |
|------|---------|------|
| `ai-audit.js`（运营审计：博客数/队列/成功率/飞书推送） | ❌ 无调度 | 日志靠手动跑，本地无 cron/schtasks |
| `weekly-audit.yml` | ✅ 每周日 21:30 | 但跑的是**代码质量审查**（tsc/eslint），不是运营审计；webhook 也不同（`422e94ef`） |
| `audit.yml` | PR 触发 | CI 门禁，非定时 |

结论：**运营审计脚本没有任何定时调度**。这是 v2.1 阶段一的待修项。

## 二、为什么在生产服务器跑（而非 GitHub Actions）

`ai-audit.js` 要给真实数据，必须连得上：
- 生产 Redis（`llen conversion:queue`）—— GitHub Actions runner 连不上生产 Redis
- 生产 app 日志（统计转换成功率）—— runner 读不到

所以在 GitHub Actions runner 里跑，Queue 会是 `unknown`、Success rate 会是 `assumed`，又回到"缺数据"。**必须在生产服务器跑**。

## 三、推荐方案：生产服务器 crontab

### 步骤 1：配置飞书 webhook

生产服务器 `ebook-converter/.env` 加一行：
```
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/a7a8f44f-5a4b-4cd3-a8c9-2f9260512493
```
（docker-compose.yml 已加占位 `${FEISHU_WEBHOOK:-}`，从 .env 读）

重启 app 使环境变量生效：
```bash
cd <部署目录>/ebook-converter
docker compose up -d app
```

### 步骤 2：配置 crontab

生产服务器执行 `crontab -e`，加：
```cron
# 每天 08:00 跑运营审计（北京时间），输出重定向到宿主机日志
0 0 * * * cd <部署目录>/ebook-converter && docker compose exec -T app node /app/scripts/ai-audit.js >> /var/log/ops-audit.log 2>&1
```
> - `<部署目录>` 按生产实际路径替换
> - cron 用 UTC，北京时间 08:00 = UTC 00:00
> - 脚本经 Dockerfile `COPY . .` 已打进镜像 `/app/scripts/ai-audit.js`
> - `REDIS_URL=redis://redis:6379` 由 docker-compose 配好，容器内可连

### 步骤 3：验证

手动跑一次确认全链路：
```bash
cd <部署目录>/ebook-converter
docker compose exec -T app node /app/scripts/ai-audit.js
```
预期输出：
- `Blog posts: 7`（真实）
- `Queue size: <真实数字>`（连得上 Redis，不再是 unknown）
- `Success rate: 95% (假设值，无日志)` —— 待任务8（结构化日志）完成后变真实统计
- 飞书群收到审计消息

## 四、备选方案：GitHub Actions 定时 SSH

若不想动生产 crontab，可加 workflow 定时 SSH 进生产跑：
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 00:00
jobs:
  ops-audit:
    runs-on: ubuntu-latest
    steps:
      - name: SSH 跑运营审计
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: cd <部署目录>/ebook-converter && docker compose exec -T app node /app/scripts/ai-audit.js
```
需在 GitHub Secrets 配 `PROD_HOST`/`PROD_USER`/`PROD_SSH_KEY`。比 crontab 重，**不推荐**，除非已有 SSH 基建。

## 五、注意事项

1. **日志持久化**：`ai-audit.js` 把日志写在容器内 `/logs/ai-operation.txt`，容器重启会丢。但飞书已推送，无碍。如需持久化历史日志，给 docker-compose 加 `logs` volume 挂载。
2. **退出码**：当前 `warning` 状态退出码语义待明确（见 v2.1 方案第九节）。若 cron 依赖退出码发失败告警，建议 `warning=0`、`critical=1`。
3. **结构化日志依赖**：成功率目前是 `assumed`，需完成任务8（queue.ts 写结构化转换日志）后才变真实。

## 六、执行清单

- [ ] 生产服务器 `.env` 配 `FEISHU_WEBHOOK`，`docker compose up -d app`
- [ ] 生产服务器 `crontab -e` 加每日审计任务
- [ ] 手动跑一次验证（Blog=7、Queue=真实、飞书收到）
- [ ] （任务8完成后）验证 Success rate 变真实统计
