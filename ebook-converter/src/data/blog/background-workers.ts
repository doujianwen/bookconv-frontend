export const slug = `background-workers`;
export const title = `Why Ebook Conversions Run in the Background (And Why That's Good News)`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = [`architecture`, `worker`, `queue`, `technical`];

export const content = {
  intro: `When you upload a file to BookConv, the response comes back almost instantly — but your book isn't converted yet. Here's what actually happens behind that progress bar, and why a job queue is the reason big conversions don't take the whole site down with them.`,
  sections: [
    {
      heading: `Why One HTTP Request Can't Do the Whole Job`,
      body: `Converting an ebook isn't a database lookup. Under the hood, BookConv hands your file to Calibre's ebook-convert binary, which unpacks the container, rewrites the markup, re-encodes images, and builds a brand new file from scratch. A small EPUB might finish in a second. A 10 MB PDF stuffed with scanned pages can chew through a minute or more.

Now picture doing that work inside the same HTTP request that uploaded the file. Your browser would sit on an open connection, spinning. Proxies and load balancers would start dropping the request as a timeout. And if fifty people uploaded at the same moment, fifty Calibre processes would fight over the same CPU cores until everything crawled.

So BookConv doesn't do that. The upload endpoint validates your file, drops a job onto a queue, and answers immediately with **HTTP 202 Accepted** plus a job ID. Your upload finishes in the time it takes to move the bytes. The slow part happens somewhere else, on its own schedule.

### The handoff in one line

Upload, validate, enqueue, respond with a job ID. Everything expensive happens *after* the response has already gone out.`
    },
    {
      heading: `Inside the Queue: Redis, BullMQ, and a Job ID`,
      body: `The queue is [BullMQ](https://docs.bullmq.io/), a job queue library that stores its state in [Redis](https://redis.io/docs/latest/). BookConv runs a single queue called **ebook-conversions**. Every submitted conversion becomes one job on that queue.

A job carries just enough to do the work: the file contents, the source format, the target format, and a freshly generated UUID that becomes your job ID. That UUID is the only thing the browser needs to keep. It's how you ask about progress later, and it's how you fetch the finished file.

Redis pulls double duty here. Besides holding the queue, it backs the rate limiter — the conversion endpoint allows a limited number of requests per IP inside a rolling 60-second window, which stops a single script from flooding the queue with thousands of jobs.

There's a deliberate bit of defensive behavior worth knowing about. If Redis is briefly unreachable when you submit, the API still returns a job ID instead of blowing up with a 500. You get a normal-looking response and a status you can poll, rather than a dead end. Both of those knobs — the Redis connection string and the rate limit thresholds — are configured through environment variables, which we cover in the [environment variables setup guide](/blog/env-variables-setup).`
    },
    {
      heading: `The Worker: Where Calibre Actually Runs`,
      body: `A queue without a consumer is just a list. The consumer is the **worker** — a loop that pulls jobs off the queue and runs the conversion.

BookConv's worker lives inside the application process rather than in a separate service. There used to be a standalone worker in its own container, but it was retired: two workers subscribed to the same queue meant duplicate consumption in multi-instance deployments, and it added a moving part for no real benefit. One embedded worker, one source of truth.

The worker is deliberately throttled. It runs a handful of jobs concurrently, with a rate limiter capping how many conversions start per minute. That sounds conservative, and it is on purpose: [ebook-convert](https://manual.calibre-ebook.com/generated/en/ebook-convert.html) is CPU-hungry, and five conversions running well beats twenty running badly.

Each job gets its own scratch directory under the configured upload path. The worker writes the input file there, converts into the same directory, then deletes the whole thing whether the job succeeded or failed. On startup it also sweeps for orphaned directories older than a day, so a crash mid-conversion doesn't slowly fill the disk.

### Failing fast on broken files

Before Calibre is invoked at all, the worker checks the file's magic bytes. An EPUB has to look like a real ZIP archive and contain a container or OPF entry. MOBI and AZW3 headers must start with the expected signature. A PDF has to begin with the PDF marker. If a file fails those checks, the job errors out in milliseconds instead of burning two minutes inside Calibre before failing anyway.

Calibre itself also runs under a hard timeout of two minutes. A pathological file can't hold a worker slot hostage forever.`
    },
    {
      heading: `Polling: How the Progress Bar Knows Anything`,
      body: `Since the conversion happens after your request finished, the browser needs a way to check in. That's the status endpoint: a GET against /api/convert/{jobId}/status.

The response is more useful than a simple "done yet?" flag. It includes:

- **status** — queued, active, completed, or failed
- **progress** — a percentage the worker updates as it moves through the job
- **attempt** and **maxRetries** — which try you're on
- **eta** — a rough estimate in seconds, calculated from elapsed time against current progress
- **errorCode**, **friendlyMessage**, and **retryable** — populated only when something went wrong

When the status reads completed, the finished file is pulled from the result endpoint. Behind that, storage is layered: results go to object storage when it's configured, and fall back to local disk when it isn't, so a self-hosted instance works out of the box with no cloud account.

A word on polling manners. Once or twice a second is plenty. Polling every 50 milliseconds doesn't make Calibre faster — it just adds Redis lookups to a machine that's already busy converting your book. If a download stalls or a link expires before you grab it, the [download troubleshooting guide](/blog/download-troubleshooting) walks through the usual causes.`
    },
    {
      heading: `Retries, Timeouts, and What Failure Looks Like`,
      body: `Some failures are bad luck rather than bad input. A transient disk hiccup, a temporary spike in load, a process killed at the wrong moment. Retrying those is cheap and usually works.

BookConv retries a failed job up to three times by default, using exponential backoff. The gap roughly doubles each round — a few seconds, then several, then a bit more — which gives whatever went wrong a chance to clear instead of hammering a struggling system.

Crucially, the worker throws the error and lets the queue handle the retry. It doesn't run its own retry loop. That keeps the attempt counter honest, so the number you see in the status response is the real one.

Not every error deserves a retry, though. A corrupted EPUB will be just as corrupted on the third attempt. Raw errors are mapped to a stable error code and a plain-English message, and the status response marks whether the failure is actually worth retrying. You get "this file appears to be damaged" instead of a stack trace.

When a job exhausts its retries, it's marked permanently failed with the reason attached, and an alert can be pushed to a configured webhook so someone actually notices. Completed and failed jobs stick around in Redis for a while rather than vanishing instantly, which means you can still query a job's outcome shortly after it finished — handy for debugging and for slow clients.

The worker also shuts down politely. On SIGTERM or SIGINT it closes cleanly, so a deploy doesn't sever jobs mid-flight.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Asynchronous by design.** Uploads return a job ID and a 202 right away; conversion happens afterward on a worker, so slow files never block the request.
- **Redis and BullMQ do the coordination.** One queue named ebook-conversions holds every job, and the same Redis instance backs the rate limiter.
- **Throttling is intentional.** Limited concurrency keeps Calibre conversions fast and predictable instead of letting them starve each other.
- **Validate early, fail cheap.** Magic-byte checks reject broken files in milliseconds rather than after a two-minute Calibre run.
- **Retries belong to the queue.** Three attempts with exponential backoff, stable error codes, and readable messages when something is genuinely unrecoverable.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Why does my conversion sit at "queued" for a while?
A: Your job is waiting for a free worker slot. Concurrency is capped on purpose, so during a busy stretch jobs line up. The wait is usually short, and the status endpoint reports the moment your job moves to active.

Q: Can I make a conversion finish faster?
A: Mostly by simplifying the input. Large embedded images, scanned-page PDFs, and heavy custom CSS all add real work. A text-heavy EPUB converts far quicker than an image-heavy one. The format pair matters too — [EPUB to MOBI](/convert/epub-to-mobi) is a lighter transformation than [PDF to EPUB](/convert/pdf-to-epub), which has to reconstruct structure that PDFs never really stored.

Q: What happens if I close the tab mid-conversion?
A: The job keeps running — it lives in Redis, not in your browser. But the job ID lives in the page, so if you lose the tab you lose the handle to the result. Keep it open until the download starts.

Q: Is there a hard limit on conversion time?
A: Yes. Calibre runs under a two-minute timeout per attempt. If a file is complex enough to exceed that, it's reported as a timeout rather than hanging indefinitely.

Q: Do failed jobs retry forever?
A: No. Three attempts by default, with the delay increasing each time. After that the job is marked failed with an error code and a readable message, and the attempt count stays visible in the status response.

Q: Why not just run more workers?
A: Every extra worker competes for the same CPU, memory, and disk bandwidth. Past a certain point, adding workers makes every conversion slower and none of them finish sooner. The concurrency limit reflects what the hardware can actually sustain, and it's adjustable when you self-host.

Q: Can I run the worker separately from the web app?
A: The current design runs the worker embedded in the app process, and the old standalone worker was deprecated to avoid two consumers pulling from one queue. If you self-host and want a split deployment, make sure only one process ever starts the worker.`
    }
  ]
};
