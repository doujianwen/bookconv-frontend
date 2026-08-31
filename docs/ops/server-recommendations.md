> ⚠️ **RECONSTRUCTED FROM A CORRUPTED SOURCE** — The original `docs/zh/ops/server-recommendations.md` was corrupted in the repository (its body was double-encoded and only partially recoverable). This English version is rebuilt from the recovered Chinese text plus project context. **Please verify against the original Chinese in `docs/zh/ops/server-recommendations.md` before relying on it.** The clean blockquote at the top is intact.

> **Actual deployment status (updated 2026-08-05):** The current production environment is deployed on **Vercel** (free plan); the site https://bookconv.com runs normally. The Yingyun VPS (149.104.69.126) was purchased but not yet deployed — it is reserved for the later Calibre backend conversion.
>
> The comparison table below is kept for reference; **the actually chosen plan is A (Vercel).**

---

# BookConv Deployment Server Selection Guide

## Runtime Environment Requirements

| Dependency | Minimum | Note |
|---|---|---|
| CPU | 1 Core | Node.js single process |
| Memory | 512MB+ | Includes Redis + Node process |
| Disk | 5GB+ | System + Node modules + temp files |
| OS | Ubuntu 22.04 LTS | Recommended |

**Core requirement: Redis + Calibre.** As long as those two are installed, the app can run.

---

## Plan Comparison

### Plan A: Vercel (strongly recommended)

- **URL**: vercel.com
- **Price**: Free (Hobby tier)
- **Type**: Serverless platform

**Pros:** Zero ops, global CDN, fast access from China, automatic HTTPS, native Next.js support.
**Cons:** No long-running background Worker; function cold start 2–3s.
**Fits:** Early stage, personal projects.

### Plan B: Hetzner Cloud

- **Plan**: CX22 = €3.51/month
- **Config**: 2 vCPU / 2GB RAM / 20GB SSD
- **Datacenter**: Germany

**Pros:** Best price/performance.
**Cons:** Datacenter in Europe, slow access from China, needs CDN.

### Plan C: Aliyun ECS

- **Plan**: Entry 2C2G ~¥30-50/month
- **Data center**: Hong Kong / Singapore (no ICP filing needed)

**Pros:** Fast access from China, new-user discounts.
**Cons:** Mainland-China nodes require ICP filing.

### Plan D: DigitalOcean

- **Plan**: Droplet 2GB = $12/month
- **Data center**: Has Taiwan node

**Pros:** Beginner-friendly, excellent docs, has Taiwan node.
**Cons:** More expensive than Hetzner.

### Plan E: Railway

- **Price**: from $5/month
- **Type**: PaaS (includes Redis)

**Pros:** One-click Redis, built-in CI/CD.
**Cons:** Paid by usage after free trial.

---

## Recommendation

🏆 **Vercel** — fastest to launch, free tier sufficient for early use.
🥈 **Hetzner** — best choice when full functionality (background Worker) is needed.
