# Upstash Redis Integration Checklist

> Purpose: Make the "pay → Pro" flow actually work on Vercel.
> Related commit: `0d15c34` (fixes three Pro-link breakages + the `/batch` gate).
> This is a deployment/ops doc; it does not cover the GEO/SEO seven-stage sampling flow.

---

## 0. Why this checklist exists

After the Pro-link fix, the code has a complete closed loop:

```
UpgradeButton ──email──▶ checkout/route.ts ──custom_data.email──▶ Lemon Squeezy
                                                          │
                                              webhook/route.ts (payment success callback)
                                                          │ resolveUserEmail(custom_data.email)
                                                          ▼
                                          saveSubscription(email) → Redis: sub:{email}
                                                          │
                                            user visits /batch (server component)
                                                          ▼
                                  getSession().email → getPlanByEmail(email) → read Redis: sub:{email}
                                                          │
                                                  Pro → show uploader / else → upgrade prompt
```

**Key prerequisite**: `src/lib/redis.ts` reads the `REDIS_URL` environment variable.

- No `REDIS_URL` → `getRedisClient()` returns `null` → subscriptions can't be written or read.
- The code gracefully degrades on all Redis failures (try/catch + logging), so it **won't crash**, but the result is:
  - Webhook receives payment but can't persist it;
  - The `/batch` gate "closes" for non-Pro users (everyone sees the upgrade prompt, nothing leaks) — this is the **safe default**.
- Set `REDIS_URL` and make it reachable → the closed loop above is actually connected.

**Goal**: Configure a reachable `REDIS_URL` (Upstash's `rediss://` endpoint) in Vercel so paid status persists and the gate opens correctly.

---

## 1. Prerequisites

| Item | Requirement |
|---|---|
| Upstash account | Free tier is enough (has a Redis-protocol quota) |
| Vercel project | `bookconv` deployed, able to access Project Settings → Environment Variables |
| Lemon Squeezy | Already configured (checkout/webhook ready; this checklist does not change the LS side) |
| Local verification | Optional: `export REDIS_URL=...` locally then `node -e` to test connectivity |

---

## 2. Steps

### Step 1 — Register / log in to Upstash
- Open https://upstash.com and sign up with GitHub or email.
- Go to the console **Home → Redis**.

### Step 2 — Create a Redis database
- Click **Create database**.
- Name it (e.g. `bookconv-prod`).
- **Region**: pick one close to your users and matching the Vercel deploy region (recommend `us-east-1` / `aws-us-east-1`, same as Vercel's default for lowest latency).
- **Type**: choose **Regional** (standard, the free-tier default).
- **TLS**: keep enabled (Upstash default). Our code only accepts `rediss://` — **do not choose the plaintext port**.
- Create.

### Step 3 — Copy the `rediss://` endpoint
- On the database detail page, in the **REST API / Redis Connect** area, find the **`redis-cli` / Endpoint** field.
- It looks like: `rediss://default:xxxx@computed-xxxxx.upstash.io:6380`
- Copy the **full string** (including `rediss://`, username, password, host, port).
- ⚠️ This is a password-bearing credential, equivalent to a production secret — do not commit it to the repo or paste it into public channels.

### Step 4 — Configure the environment variable in Vercel
- Vercel console → `bookconv` project → **Settings → Environment Variables**.
- Add new:
  - **Key**: `REDIS_URL` (strict uppercase — the code only reads this name)
  - **Value**: the `rediss://...` string copied in Step 3
  - **Environments**: check **Production** (required); also recommend **Preview** (so preview deploys can be verified); **Development** is optional (local dev runs fine without it via degradation).
- Save.

### Step 5 — Trigger a redeploy
- After changing an environment variable, Vercel does not automatically re-read old instances. **Redeploy**:
  - Go to **Deployments** → most recent Production → **Redeploy**;
  - or push an empty commit: `git commit --allow-empty -m "chore: redeploy for REDIS_URL"` (more reliable — ensures the new build picks up the variable).
- Wait for the build to finish (~1–2 min).

### Step 6 — Verify (see Section 3)

---

## 3. Verification checklist

Verify layer by layer, lowest to highest. Stop at any failed layer — do not skip.

- [ ] **3.1 Variable injected**
  - `REDIS_URL` exists in the Vercel env list and its value starts with `rediss://`.
  - Locally you can `vercel env pull` then `echo $REDIS_URL` to confirm.

- [ ] **3.2 Connectivity**
  - Local: after `export REDIS_URL=...`, run
    ```bash
    node -e "const {getRedisClient}=require('./src/lib/redis.ts'); /* illustrative only, needs a ts runtime */"
    ```
  - Simpler: use the Upstash console **Redis CLI** and directly `PING`; a `PONG` response means it's reachable.
  - After deploy: hit `/api/health` (if `isRedisHealthy` is wired) and watch logs for Redis timeouts.

- [ ] **3.3 Write → read loop (core)**
  - Manually write a test key, confirming the same prefix the code uses:
    ```
    SET sub:test@example.com '{"status":"pro","variantId":"123","endsAt":null}'
    ```
  - `getPlanByEmail('test@example.com')` should resolve to `pro`.
  - After verifying, clean up with `DEL sub:test@example.com`.

- [ ] **3.4 Webhook real flow (E2E)**
  - Trigger `subscription_created` with a real LS test subscription event (Sandbox / Test mode).
  - Check Redis: `GET sub:{lowercased order email}` should exist with `status=pro`.
  - If the webhook log shows `Subscription event has no resolvable email; skipping` → the checkout didn't pass the email (check whether `UpgradeButton` got the session email / the `custom_data` in `checkout/route.ts`).

- [ ] **3.5 Gate opens**
  - Log in with that email (`/api/auth/me` returns email) → visit `/batch`.
  - Expected: see the batch uploader (not the upgrade prompt).
  - Non-Pro / logged-out visit to `/batch` → Expected: see the upgrade card (Lock icon + Upgrade to Pro).

- [ ] **3.6 Post-deploy smoke**
  - `curl -s https://www.bookconv.com/batch | grep -o "Batch conversion is a Pro feature"` should hit (the non-Pro default state).

---

## 4. Security / degradation notes

- **No `REDIS_URL`**: safe default — `/batch` shows the upgrade prompt to everyone, paid features won't leak; the webhook silently skips (logs a warning only).
- **Set but briefly unreachable**: webhook write failure is logged, the user's subscription status may be lost this time, requiring a webhook re-run or manual `SET sub:...` to recover.
- **Secret management**: `REDIS_URL` contains a password — only store it in Vercel env vars, never in git, `llms.txt`, or any public doc.
- **Rotation**: Upstash console can Reset the password; after rotating, sync the updated Vercel `REDIS_URL` and redeploy.

---

## 5. Known pitfalls / notes

1. **Port must be TLS**: the code only adds `tls` config when `redisUrl.startsWith('rediss://')`; giving `redis://` (plaintext) will fail to connect or throw certificate errors. Upstash's default is already `rediss://` — just use it.
2. **Region proximity**: Upstash in a different region than Vercel adds cold-start latency; Upstash free tier is single-region, so pick the same region as Vercel for best results.
3. **Free quota**: Upstash free tier has daily request/storage limits. The Pro flow's read/write volume is very low (only subscription events + each `/batch` visit), so it's usually fine; exceeding it causes throttling, which surfaces as occasional degradation.
4. **In-memory user-table residue risk (out of scope here)**: `src/lib/auth/storage.ts` user table is still an in-memory `Map`, which does not survive across requests on Vercel → login/register may fail on cold instances. JWT sessions themselves survive across requests (only signature is verified, no DB lookup), so "register once → cookie persists" can still drive Pro; but re-login / multi-instance will hit this. A full fix requires switching to Supabase/Postgres, a larger refactor (todo #4).
5. **`/api/health` touches Redis**: the old implementation had Redis timeout alerts — a known issue; after setting up Upstash, that alert should disappear.

---

## 6. Completion criteria

All of the following must be true to consider integration successful:

- [ ] Vercel `REDIS_URL` = `rediss://...` is set and the redeploy took effect
- [ ] After one real (or test-mode) subscription, Redis shows `sub:{email}` with `status=pro`
- [ ] Logging in with that email and visiting `/batch` shows the uploader
- [ ] Non-Pro visits to `/batch` show the upgrade prompt

After completion, add a note to `.workbuddy/memory/2026-08-09.md` and close todo #5.
