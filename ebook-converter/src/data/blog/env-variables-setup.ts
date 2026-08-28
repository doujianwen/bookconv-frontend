export const slug = `env-variables-setup`;
export const title = `Configuring BookConv: Environment Variables for Self-Hosting`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = [`environment`, `configuration`, `self-hosting`, `technical`];
// Dev/deployment reference doc — keep reachable for self-hosters but keep it
// out of Google's index so it doesn't burn crawl budget meant for money pages.
export const noindex = true;

export const content = {
  intro: `Self-hosting BookConv or wiring it into your own stack? Every meaningful setting — Redis, storage, secrets, rate limits — comes from an environment variable. Here's what each one does and which you actually need on day one.`,
  sections: [
    {
      heading: `Configuration lives in the environment, not the code`,
      body: `BookConv follows the [twelve-factor app](https://12factor.net/config) rule: anything that varies between deployments belongs outside your codebase. Your laptop, a staging box, and production all run the exact same build — they just get handed different values.

That matters for a converter. Locally you point Redis at localhost and write temp files to a folder on disk. In production you point at a managed Redis instance and push results to object storage. Same code, different environment.

There's a security angle too. Secrets in source control are secrets forever, sitting in every clone and old commit. Keeping them in the environment means rotating a key is a config change, not a code change.

BookConv ships a **.env.example** file that documents every supported variable with sane defaults and inline comments. Copy it to **.env.local**, fill in what you need, and go. The example file belongs in git; the file with real values does not.

### The short version for a first run

Only one variable is genuinely load-bearing: **REDIS_URL**. Storage, auth, payments, and analytics all degrade gracefully when unset. Set Redis, install Calibre, and you have a working BookConv.`
    },
    {
      heading: `The core variables BookConv needs to run`,
      body: `These decide whether conversions run at all.

**REDIS_URL** is the connection string for [Redis](https://redis.io/docs/latest/), which backs both the BullMQ job queue and the rate limiter. It defaults to redis://localhost:6379, which is fine for development and wrong for production. If you want to understand what the queue does with it, the [background workers explainer](/blog/background-workers) walks through the job lifecycle.

**UPLOAD_DIR** is the local directory where each conversion gets a scratch folder. It defaults to /tmp/ebook-uploads. The process needs write access, and on ephemeral filesystems /tmp may be wiped between deploys — fine for in-flight jobs, not for anything you expect to persist.

**MAX_FILE_SIZE_MB** caps upload size, defaulting to 10. Raise it and you also raise memory pressure and conversion time. On the hosted BookConv the free tier allows 10 MB, Pro allows 50 MB, and the API tier allows 100 MB; self-hosting, those ceilings come from this variable and your rate-limit settings.

**CALIBRE_PATH** points at the ebook-convert binary. The Docker image installs Calibre, so you rarely need to change this — but on a bare-metal host with a non-standard install, set the absolute path here.

Two more worth knowing: **MAX_CONVERSION_RETRIES** controls how many times a failed job is retried (default 3), and **CONVERSION_TIMEOUT_SEC** governs how long a single conversion may run before it's killed.`
    },
    {
      heading: `Storage: S3-compatible object storage with a local fallback`,
      body: `Converted files have to go somewhere before you download them. BookConv supports [S3-compatible storage](https://aws.amazon.com/s3/) such as Cloudflare R2, and falls back to local disk when it isn't configured.

Four variables enable it:

- **R2_ENDPOINT** — your account's S3-compatible endpoint URL
- **R2_ACCESS_KEY_ID** — the access key from your storage token
- **R2_SECRET_ACCESS_KEY** — the matching secret
- **R2_BUCKET_NAME** — defaults to ebook-temp

Leave them blank and everything still works; results are written under your upload directory instead. That's the right choice for local development and small single-server deployments.

The fallback is smarter than a simple switch. Before using remote storage, the layer runs a health check. If storage is configured but unreachable, the upload falls back to local disk rather than failing the job outright. A cloud outage degrades quality of service instead of breaking conversions. Stored files carry a TTL and a cleanup routine sweeps expired objects, because BookConv is a converter, not a library — files are meant to be temporary.`
    },
    {
      heading: `Secrets, sessions, and the NEXT_PUBLIC rule`,
      body: `This is the section to read twice.

Any variable whose name starts with **NEXT_PUBLIC_** is inlined into the JavaScript bundle sent to every visitor's browser. It is not a secret and never will be. Never put a private key behind that prefix.

#### Safe to expose

**NEXT_PUBLIC_APP_URL** is the canonical base URL of your deployment, used to build sitemap entries and auth redirects. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY** are designed for browser use — the anon key is constrained by row-level security on the database side.

#### Keep these server-side

**SUPABASE_SERVICE_ROLE_KEY** bypasses row-level security entirely. Treat it like a database root password.

**AUTH_SECRET** signs session tokens. It ships with a placeholder default so development doesn't break, and that default is worthless in production — anyone who reads the source can forge a session. Generate a long random string before exposing BookConv to the internet.

**LEMON_SQUEEZY_WEBHOOK_SECRET** verifies that incoming payment webhooks genuinely came from your provider. Without it, signature checks are skipped. If you build against the BookConv API, the [webhook integration guide](/blog/webhook-integration) covers the receiving side, including the HMAC signing used when a conversion finishes.

**VERIFICATION_API_KEY** gates the detailed portion of the health endpoint, so internal diagnostics aren't public.`
    },
    {
      heading: `Rate limits, CORS, and keeping an eye on things`,
      body: `Once the basics run, these decide how BookConv behaves under load and how much you can see when it misbehaves.

Rate limiting is per-IP and Redis-backed. **CONVERT_RATE_LIMIT_MAX** caps conversion requests per IP per window, **ANONYMOUS_RATE_LIMIT_MAX** covers general anonymous traffic, and **RATE_LIMIT_WINDOW_MS** sets the window length. On the hosted service these enforce the free tier's 5 conversions per hour; self-hosting, they're yours to tune.

**RATE_LIMIT_SKIP_ON_REDIS_DOWN** is the interesting one. Set to true, requests are allowed through when Redis is unavailable — availability over enforcement. Set to false, they're rejected — enforcement over availability. Pick based on whether you'd rather be briefly abusable or briefly offline.

If you run behind a proxy or CDN, **TRUST_PROXY** and **TRUSTED_PROXIES** control whether forwarded headers are believed when resolving the client IP. Get this wrong and rate limits either become useless or throttle everyone at once.

**CORS_ORIGINS** is a comma-separated allowlist of origins permitted to call the API cross-origin. Keep it tight.

For observability, **LOG_LEVEL** accepts debug, info, warn, or error. **NEXT_PUBLIC_SENTRY_DSN** enables error tracking, **NEXT_PUBLIC_PLAUSIBLE_DOMAIN** enables privacy-friendly analytics, and **FEISHU_WEBHOOK_URL** receives an alert when a conversion job fails permanently. All optional.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Start with Redis.** REDIS_URL plus a working Calibre install is the minimum viable configuration; almost everything else has a usable default or degrades gracefully.
- **NEXT_PUBLIC_ means public.** Those values ship inside the browser bundle. Service role keys, auth secrets, and webhook secrets must never carry that prefix.
- **Storage is optional, not required.** S3-compatible credentials unlock object storage with a health check; leave them empty and results land on local disk.
- **Rotate the placeholders.** AUTH_SECRET ships as a known default and the webhook signing secret starts empty; both are real risks in production.
- **Commit the example, never the real file.** Keep .env.example in git as living documentation and keep .env.local out of it.`
    }
  ]
};

export const faqs = [
  {
    question: `What's the smallest set of variables I need to run BookConv locally?`,
    answer: `REDIS_URL pointing at a running Redis, and Calibre installed so ebook-convert resolves on your PATH. UPLOAD_DIR, MAX_FILE_SIZE_MB, and CALIBRE_PATH all have workable defaults. Everything else — storage, Supabase, payments, analytics — is optional.`,
  },
  {
    question: `Should I commit .env.example to version control?`,
    answer: `Yes. It contains no real secrets, only placeholders and comments explaining each variable. The file with actual values stays in .gitignore.`,
  },
  {
    question: `What happens if I don't configure S3-compatible storage?`,
    answer: `Conversions work normally and results are written to local disk under your upload directory. That's fine for a single server. If you run multiple instances behind a load balancer, configure shared storage — otherwise a result written on one instance won't be found by another.`,
  },
  {
    question: `Is it safe to leave AUTH_SECRET at its default?`,
    answer: `Only on your own machine. The default is a hardcoded placeholder visible to anyone reading the source, so an attacker could forge session tokens. Generate a long random value for any deployment reachable from the internet.`,
  },
  {
    question: `How do I manage different values for development, staging, and production?`,
    answer: `Keep local overrides in .env.local, and inject production values through your host's secret manager or deployment config rather than a file on disk. Managed platforms and container orchestrators both support this natively, keeping production credentials off developer laptops.`,
  },
  {
    question: `My rate limits stopped working after I moved behind a CDN. Why?`,
    answer: `Every request now arrives with your CDN's IP address, so the limiter sees one client instead of many. Enable TRUST_PROXY and list your CDN's addresses in TRUSTED_PROXIES so the real client IP is read from forwarded headers.`,
  },
  {
    question: `Do I have to restart BookConv after changing a variable?`,
    answer: `Yes. Values are read at process startup, so a change only takes effect on the next boot. That's expected twelve-factor behavior, and it's why config changes should go through your normal deploy process.`,
  }
];
