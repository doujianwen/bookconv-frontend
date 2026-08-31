> ⚠️ **RECONSTRUCTED FROM A CORRUPTED SOURCE** — The original `docs/zh/ops/ops-scheduling.md` was corrupted in the repository (its body was double-encoded and only partially recoverable). This English version is rebuilt from the recovered Chinese text plus project context. **Please verify against the original Chinese in `docs/zh/ops/ops-scheduling.md` before relying on it.** The clean blockquote at the top is intact.

> **Production server note (updated 2026-08-05):** The current production environment is deployed on Vercel (no long-running process); the Yingyun VPS (149.104.69.126) has no application deployed yet. The crontab plan below should be enabled after the VPS is deployed.
>
> VPS status:
> - IP: 149.104.69.126 | Instance ID: ecs-di00005bwn85
> - SSH port 22 is open, but the key is not injected yet — inject the public key in the Yingyun console first
> - Port 80 runs another website; port 3000 is not listening

# Operations Audit Scheduling Plan

> 2026-07-30 · Resolve the issue that `ai-audit.js` has no scheduled execution

## 1. Current-State Diagnosis

| Component | Scheduled? | Note |
|---|---|---|
| `ai-audit.js` (ops audit: blog queue / success count / Feishu push) | ❌ Not scheduled | Logs run manually; no local cron/schtasks |
| `weekly-audit.yml` | ✅ Weekly, 21:30 | But it runs **code-quality review** (tsc/eslint), not the ops audit; its webhook is also different (`422e94ef`) |
| `audit.yml` | On PR | CI gate, not scheduled |

**Conclusion:** The ops-audit script has **no scheduled execution at all**. This is a pending item for the v2.1 phase.

## 2. Why Run on the Production Server (not GitHub Actions)

`ai-audit.js` must reach real data, which requires connectivity to:
- Production Redis (`llen conversion:queue`) — the GitHub Actions runner **cannot reach** production Redis
- Production app logs (conversion-success-rate stats) — the runner **cannot read** them

So running it on the GitHub Actions runner would yield `Queue size: unknown` and `Success rate: assumed` — back to "missing data". **It must run on the production server.**

## 3. Recommended Plan: Production-Server crontab

### Step 1: Configure the webhook

Add one line to the production server's `ebook-converter/.env`:
```
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/a7a8f44f-5a4b-4cd3-a8c9-2f9260512493
```
(docker-compose.yml already reserves `${FEISHU_WEBHOOK:-}`, read from .env)

Restart the app to apply the env var:
```bash
cd <deploy-dir>/ebook-converter
docker compose up -d app
```

### Step 2: Configure crontab

On the production server run `crontab -e` and add:
```cron
# Run the ops audit daily at 08:00 (Beijing time), redirect output to host log
0 0 * * * cd <deploy-dir>/ebook-converter && docker compose exec -T app node /app/scripts/ai-audit.js >> /var/log/ops-audit.log 2>&1
```
> - Replace `<deploy-dir>` with the actual production path
> - cron uses UTC; Beijing 08:00 = UTC 00:00
> - The script is baked into the image via Dockerfile `COPY . .` at `/app/scripts/ai-audit.js`
> - `REDIS_URL=redis://redis:6379` is configured by docker-compose and reachable inside the container

### Step 3: Verify

Run it once manually to confirm the full chain:
```bash
cd <deploy-dir>/ebook-converter
docker compose exec -T app node /app/scripts/ai-audit.js
```
Expected output:
- `Blog posts: 7` (real)
- `Queue size: <real number>` (Redis reachable, no longer `unknown`)
- `Success rate: 95% (placeholder, no logs yet)` — becomes a real stat after the structured-logging task is done; the Feishu group receives the audit message

## 4. Alternative Plan: GitHub Actions Scheduled SSH

If you'd rather not touch the production crontab, run it via a scheduled-workflow SSH into production:
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # daily UTC 00:00
jobs:
  ops-audit:
    runs-on: ubuntu-latest
    steps:
      - name: SSH run ops audit
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: cd <deploy-dir>/ebook-converter && docker compose exec -T app node /app/scripts/ai-audit.js
```
Requires `PROD_HOST`/`PROD_USER`/`PROD_SSH_KEY` in GitHub Secrets. Heavier than crontab, **not recommended** unless SSH infrastructure already exists.

## 5. Notes

1. **Log persistence:** `ai-audit.js` writes logs inside the container at `/logs/ai-operation.txt`; container restart loses them (Feishu push already happened, so no loss). To persist history, mount a `logs` volume in docker-compose.
2. **Exit code:** The current `warning`-state exit-code semantics are pending clarification (see v2.1 plan §9). If cron depends on the exit code for failure alerts, set `warning=0`, `critical=1`.
3. **Structured-log dependency:** The success rate is currently `assumed`; it becomes real only after task 8 (queue.ts writing structured conversion logs) is completed.

## Execution Checklist

- [ ] Production server `.env` gets `FEISHU_WEBHOOK`, then `docker compose up -d app`
- [ ] Production server `crontab -e` adds the daily audit job
- [ ] Run once manually to verify (Blog=7, Queue=real, Feishu receives)
- [ ] (After task done) verify Success rate becomes a real stat
