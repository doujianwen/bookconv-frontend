export const slug = `env-variables-setup`;
export const title = `Configuring BookConv: A Practical Guide to Environment Variables`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = [`environment`, `configuration`, `self-hosting`, `technical`];

export const content = {
  intro: `Self-hosting BookConv or wiring it into your own stack? Every meaningful setting — Redis, storage, secrets, rate limits — comes from environment variables. Here's what each one does and which ones you actually need on day one.`,
  sections: [
    {
      heading: `Configuration Belongs in the Environment, Not the Code`,
      body: `The idea comes straight from the [twelve-factor app](https://12factor.net/config) methodology: anything that varies between deployments should live outside your codebase. Your laptop, a staging box, and production all run the exact same build — they just get handed different values.

That matters for a converter like BookConv. Locally you probably point Redis at localhost and write temp files to a folder on disk. In production you point at a managed Redis instance and push results to object storage. Same code, different environment.

There's a security angle too. Secrets in source control are secrets forever, sitting in every clone and every old commit. Keeping them in the environment means rotating a key is a config change, not a code change.

BookConv ships a **.env.example** file that documents every supported variable with sane defaults and inline comments. Copy it to **.env.local**, fill in what you need, and go. The example file belongs in git; the file with real values does not.

### The short version for a first run

Only one variable is genuinely load-bearing: **REDIS_URL**. Storage, auth, payments, and analytics all degrade gracefully when unset. Set Redis, install Calibre, and you have a working converter.`
    },
    {
      heading: `The Core Four: Redis, Uploads, Size Limits, and Calibre`,
      body: `These are the variables that decide whether conversions run at all.

**REDIS_URL** is the connection string for [Redis](https://redis.io/docs/latest/), which backs both the BullMQ job queue and the rate limiter. It defaults to redis://localhost:6379, which is fine for development and wrong for production. If you want to understand what the queue is actually doing with it, the [background workers explainer](/blog/background-workers) walks through the job lifecycle.

**UPLOAD_DIR** is the local directory where each conversion gets a scratch folder. It defaults to /tmp/ebook-uploads. Two things to watch: the process needs write access, and on ephemeral filesystems /tmp may be wiped between deploys. That's fine for in-flight jobs but not for anything you expect to persist.

**MAX_FILE_SIZE_MB** caps upload size, defaulting to 10. Raise it and you also raise memory pressure and conversion time, since bigger books mean longer Calibre runs. Raise it deliberately, not by reflex.

**CALIBRE_PATH** points at the ebook-convert binary. The default is just ebook-convert, which works when Calibre is on the system PATH. The Docker image installs Calibre, so you rarely need to change this — but on a bare-metal host with a non-standard install location, set the absolute path here.

Two more worth knowing: **MAX_CONVERSION_RETRIES** controls how many times a failed job is retried (default 3), and **CONVERSION_TIMEOUT_SEC** governs how long a single conversion may run before it's killed.`
    },
    {
      heading: `Storage: Cloudflare R2 With a Local Fallback`,
      body: `Converted files have to go somewhere before you download them. BookConv supports [Cloudflare R2](https://developers.cloudflare.com/r2/api/s3/api/), which speaks the S3 API, and falls back to local disk when R2 isn't configured.

Four variables enable it:

- **R2_ENDPOINT** — your account's S3-compatible endpoint URL
- **R2_ACCESS_KEY_ID** — the access key from your R2 API token
- **R2_SECRET_ACCESS_KEY** — the matching secret
- **R2_BUCKET_NAME** — defaults to ebook-temp

Leave them blank and everything still works; results are written under your upload directory instead. That's the right choice for local development and small single-server deployments.

The fallback is smarter than a simple on/off switch. Before using R2, the storage layer runs a health check. If R2 is configured but unreachable, the upload falls back to local disk rather than failing the job outright. A cloud outage degrades quality of service instead of breaking conversions.

Stored files carry a TTL, and a cleanup routine sweeps expired objects from R2 and stale files from local disk. This is a converter, not a library — files are meant to be temporary.`
    },
    {
      heading: `Secrets, Sessions, and the NEXT_PUBLIC Trap`,
      body: `This is the section to read twice.

Any variable whose name starts with **NEXT_PUBLIC_** is inlined into the JavaScript bundle sent to every visitor's browser. It is not a secret. It never will be. Never put a private key behind that prefix, no matter how convenient it looks.

With that in mind, here's the split.

#### Safe to expose

**NEXT_PUBLIC_APP_URL** is the canonical base URL of your deployment. It's used to build sitemap entries and auth redirect targets, and it defaults to the production domain. Set it correctly or your generated links point somewhere wrong. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY** are designed for browser use — the anon key is constrained by row-level security on the database side.

#### Keep these server-side

**SUPABASE_SERVICE_ROLE_KEY** bypasses row-level security entirely. Treat it like a database root password.

**AUTH_SECRET** signs session tokens. It has a placeholder default so development doesn't break, and that default is worthless in production — anyone who reads the source can forge a session. Generate a long random string and set it before you expose the app to the internet.

**LEMON_SQUEEZY_WEBHOOK_SECRET** verifies that incoming payment webhooks genuinely came from Lemon Squeezy. Without it, signature verification is skipped and anyone who finds the endpoint can post fake events at it. The related **LEMON_SQUEEZY_API_KEY**, **LEMON_SQUEEZY_STORE_ID**, and the plan variant IDs only matter if you're running subscriptions. If you're building against the API, the [webhook integration guide](/blog/webhook-integration) covers the receiving side.

**VERIFICATION_API_KEY** gates the detailed portion of the health endpoint, so internal diagnostics aren't public.`
    },
    {
      heading: `Rate Limits, CORS, and Keeping an Eye on Things`,
      body: `Once the basics run, these decide how the service behaves under load and how much you can see when it misbehaves.

Rate limiting is per-IP and Redis-backed. **CONVERT_RATE_LIMIT_MAX** caps conversion requests per IP per window (default 20), **ANONYMOUS_RATE_LIMIT_MAX** covers general anonymous traffic (default 60), and **RATE_LIMIT_WINDOW_MS** sets the window length (default 60000, or one minute).

**RATE_LIMIT_SKIP_ON_REDIS_DOWN** is the interesting one. Set to true, requests are allowed through when Redis is unavailable — availability over enforcement. Set to false, they're rejected — enforcement over availability. Neither answer is universally right; pick based on whether you'd rather be briefly abusable or briefly offline.

If you run behind a proxy or CDN, **TRUST_PROXY** and **TRUSTED_PROXIES** control whether forwarded headers are believed when resolving the client IP. Get this wrong in the trusting direction and anyone can spoof their way around your rate limits. Get it wrong in the other direction and every request looks like it came from your load balancer, so one visitor's traffic throttles everyone.

**CORS_ORIGINS** is a comma-separated allowlist of origins permitted to call the API cross-origin. Keep it tight.

For observability, **LOG_LEVEL** accepts debug, info, warn, or error (default info). **NEXT_PUBLIC_SENTRY_DSN** enables error tracking, **NEXT_PUBLIC_PLAUSIBLE_DOMAIN** enables privacy-friendly analytics, and **FEISHU_WEBHOOK_URL** receives an alert when a conversion job fails permanently. All optional — unset simply means that feature stays off.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Start with Redis.** REDIS_URL plus a working Calibre install is the minimum viable configuration; almost everything else has a usable default or degrades gracefully.
- **NEXT_PUBLIC_ means public.** Those values ship inside the browser bundle. Service role keys, auth secrets, and webhook secrets must never carry that prefix.
- **Storage is optional, not required.** R2 credentials unlock object storage with a health check; leave them empty and results land on local disk.
- **Change the defaults that are placeholders.** AUTH_SECRET ships with a known development value, and the webhook signing secret is empty. Both are real risks in production.
- **Commit the example, never the real file.** Keep .env.example in git as living documentation and keep .env.local out of it.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: What's the smallest set of variables I need to run BookConv locally?
A: REDIS_URL pointing at a running Redis, and Calibre installed so ebook-convert resolves on your PATH. UPLOAD_DIR, MAX_FILE_SIZE_MB, and CALIBRE_PATH all have workable defaults. Everything else — R2, Supabase, payments, analytics — is optional.

Q: Should I commit .env.example to version control?
A: Yes. It contains no real secrets, only placeholders and comments explaining each variable. It's how a new contributor discovers what the app needs. The file with actual values stays in .gitignore.

Q: What happens if I don't configure R2?
A: Conversions work normally and results are written to local disk under your upload directory. That's fine for a single server. If you run multiple instances behind a load balancer, configure R2 — otherwise a result written on one instance won't be found by another.

Q: Is it safe to leave AUTH_SECRET at its default?
A: Only on your own machine. The default is a hardcoded placeholder visible to anyone reading the source, so an attacker could forge session tokens. Generate a long random value for any deployment reachable from the internet.

Q: How do I manage different values for development, staging, and production?
A: Keep local overrides in .env.local, and inject production values through your host's secret manager or deployment config rather than a file on disk. Managed platforms and container orchestrators both support this natively, and it keeps production credentials off developer laptops entirely.

Q: My rate limits stopped working after I moved behind a CDN. Why?
A: Every request now arrives with your CDN's IP address, so the limiter sees one client instead of many. Enable TRUST_PROXY and list your CDN's addresses in TRUSTED_PROXIES so the real client IP is read from forwarded headers.

Q: Do I have to restart the app after changing a variable?
A: Yes. Values are read at process startup, so a change only takes effect on the next boot. That's expected twelve-factor behavior, and it's why config changes should go through your normal deploy process.`
    }
  ]
};
