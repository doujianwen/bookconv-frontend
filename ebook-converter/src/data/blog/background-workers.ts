export const slug = `background-workers`;
export const title = `How BookConv Runs Your Conversions in the Background`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = [`architecture`, `worker`, `queue`, `technical`];

export const content = {
  intro: `When you convert a file on BookConv, the upload finishes in a second or two — long before your book is actually ready. Here's what happens behind that live progress bar, and why a background worker is the reason big conversions never hold up your browser.`,
  sections: [
    {
      heading: `Why BookConv doesn't convert inside your upload`,
      body: `When you convert a file on BookConv, the bytes you send are validated and handed off almost immediately. The noticeable wait isn't in the upload — it's in the conversion, and BookConv deliberately runs that part somewhere else.

A small EPUB might finish in a blink, but a 10 MB scanned PDF can take a minute or more. Trying to do that inside the same request that uploaded the file would leave your tab spinning on an open connection, and it would let fifty simultaneous uploads fight over the same CPU until everything crawled.

So BookConv checks your upload, blocks DRM-protected files on the spot, and drops the real work onto a background queue. You get a job ID right away, and the heavy lifting happens off to the side, on its own schedule.

### The handoff in one line

Upload, validate, enqueue, respond with a job ID. Everything expensive happens *after* the response has already gone out.`
    },
    {
      heading: `Inside the BookConv queue: Redis and BullMQ`,
      body: `The queue is [BullMQ](https://docs.bullmq.io/), a job queue that keeps its state in [Redis](https://redis.io/docs/latest/). BookConv runs a single queue for every conversion. When you submit a file, one job is created carrying the source format, the target format, and a job ID you'll use to check progress.

Redis does double duty. Besides holding the queue, it backs BookConv's rate limiter. On the hosted service the free tier allows 10 MB per file and 5 conversions per hour, which stops one script from flooding the system with jobs. If Redis is briefly unreachable at submit time, the API still returns a job ID instead of failing — so you always get something you can poll. Both the Redis connection and the rate limits are set through environment variables, covered in the [environment variables setup guide](/blog/env-variables-setup).`
    },
    {
      heading: `The worker: where Calibre actually runs`,
      body: `A queue with no consumer is just a list. BookConv's **worker** is the consumer — a loop that pulls jobs and runs the conversion with the server-side Calibre engine.

The worker is throttled on purpose. It runs only a handful of jobs at once, because Calibre is CPU-hungry and a few conversions done well beat twenty done badly. Each job gets its own scratch folder, which the worker deletes whether the job succeeded or failed, so a crash mid-conversion doesn't slowly fill the disk.

### Rejecting bad files early

Before Calibre starts, the worker checks the file's magic bytes. An EPUB has to look like a real ZIP; a PDF must start with the PDF marker. Files that fail are rejected in milliseconds instead of wasting two minutes inside Calibre. DRMed uploads never even reach the worker — BookConv refuses them at upload time.`
    },
    {
      heading: `Watching progress on BookConv's live bar`,
      body: `Because the conversion finishes after your request returns, the browser needs a way to check in. That's the live progress bar you see on BookConv: it polls a status endpoint for your job and shows where things stand.

The status tells BookConv — and you — what it needs to know:

- **status** — queued, active, or completed
- **progress** — a percentage the worker updates as it works
- **attempt** — which retry you're on, if any
- **eta** — a rough estimate of seconds left

When the bar fills, your download link appears. Those links are **temporary** — BookConv deletes the file after a set period, so grab it as soon as it's ready. If a link expires before you do, the [download troubleshooting guide](/blog/download-troubleshooting) walks through the usual causes. Lighter pairs like [EPUB to MOBI](/convert/epub-to-mobi) finish fast; heavier ones like [PDF to EPUB](/convert/pdf-to-epub) take longer because they have to rebuild structure the source never stored.`
    },
    {
      heading: `Retries, timeouts, and failure on BookConv`,
      body: `Some failures are just bad luck — a disk hiccup, a brief load spike. BookConv retries a failed job up to three times with exponential backoff, so the gap grows each round and gives a struggling system room to recover. The retry counter lives in the queue, so the number you see in the status is the real one.

Not every error deserves a retry. A corrupted file will be just as broken on attempt three, so BookConv maps those to a clear message — you get "this file appears to be damaged" instead of a stack trace. A hard two-minute timeout also caps each attempt, so a pathological file can't hold a worker slot hostage forever.

When a job is truly stuck, BookConv can fire an [HMAC-signed webhook](/blog/webhook-integration) so your own system learns the result the moment a conversion finishes or fails.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Asynchronous by design.** Uploads return a job ID right away; conversion runs on a worker, so slow files never block your request.
- **Redis and BullMQ coordinate it.** One queue holds every job, and the same Redis backs the rate limiter that enforces BookConv's free-tier limits.
- **Throttling keeps things fast.** Limited concurrency means Calibre conversions stay predictable instead of starving each other.
- **Links are temporary.** BookConv deletes finished files after a period, so download as soon as the bar completes.
- **Retries belong to the queue.** Three attempts with backoff and clear error messages when a file is genuinely unrecoverable.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Why does my BookConv conversion sit at "queued" for a while?
A: Your job is waiting for a free worker slot. Concurrency is capped on purpose, so during a busy stretch jobs line up. The wait is usually short, and the status endpoint reports the moment your job moves to active.

Q: Can I make a conversion finish faster?
A: Mostly by simplifying the input. Large embedded images, scanned-page PDFs, and heavy custom CSS all add real work. A text-heavy EPUB converts far quicker than an image-heavy one. The format pair matters too — EPUB to MOBI is a lighter transformation than PDF to EPUB.

Q: What happens if I close the tab mid-conversion?
A: The job keeps running — it lives in Redis, not in your browser. But the job ID lives in the page, so if you lose the tab you lose the handle to the result. Keep it open until the download starts.

Q: Is there a hard limit on conversion time?
A: Yes. Calibre runs under a two-minute timeout per attempt. If a file is complex enough to exceed that, BookConv reports it as a timeout rather than hanging indefinitely.

Q: Do failed jobs retry forever?
A: No. Three attempts by default, with the delay increasing each time. After that the job is marked failed with an error code and a readable message, and the attempt count stays visible in the status response.

Q: What are the BookConv free-tier limits?
A: Free accounts get 10 MB per file and 5 conversions per hour. Pro raises the file cap to 50 MB, and the API tier allows files up to 100 MB. When you self-host, those ceilings come from your own environment variables.

Q: Are my converted files kept forever?
A: No. Download links are temporary and BookConv deletes files after a set period, so save your result as soon as it's ready. If a link expires, re-run the conversion to get a fresh one.`
    }
  ]
};
