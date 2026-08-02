export const slug = `webhook-integration`;
export const title = `BookConv Webhooks: Get a Signed Notification the Second Your Conversion Finishes`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["webhook", "automation", "integration", "bookconv", "technical"];

export const content = {
  intro: `BookConv can POST a signed notification to a URL you control the moment a conversion finishes, so your pipeline stops asking and starts listening. This guide covers where that event fits in our queue, how to verify the HMAC signature, and which automations are actually worth wiring up.`,
  sections: [
    {
      heading: `Why BookConv Notifies You Instead of Making You Poll`,
      body: `BookConv doesn't convert your file inside the upload request. The file lands, gets checked, and joins a background queue where a worker picks it up and runs it through our server-side Calibre engine. That's why the page shows a live progress bar instead of freezing until a download appears.

For a person watching the page, that bar is enough. For a script, it isn't. Something has to answer "is it done yet?" — and if that something is a polling loop, you're spending requests to be told nothing changed.

A webhook flips the direction. You hand us a URL you own, and we POST to it when the job ends. No loop, no guessed interval, no idle gap between the file being ready and your automation noticing.

A 400 KB EPUB and a 40 MB PDF don't finish in the same time, and neither does a quiet queue and a busy one. We covered that scheduling in [how background workers handle conversion jobs](/blog/background-workers).

It's the difference between standing at the counter and leaving your phone number.`
    },
    {
      heading: `Where the Event Fires in BookConv's Pipeline`,
      body: `Knowing what happens before the notification tells you what it can mean.

1. **Upload and checks.** The file has to fit your plan's size limit — 10 MB on the free tier, 50 MB on Pro, 100 MB through the API. DRM-protected files are rejected right here, at upload.
2. **Queued.** The job joins the background queue with an identifier, and progress starts reporting.
3. **Converted.** A worker runs the file through Calibre on our servers and writes out the target format.
4. **Finished.** The job settles into one of two states: success with a download available, or failure with a reason.
5. **Notified.** That final state is what lands on your endpoint.

Two product behaviours shape the handler you write.

Free accounts get 5 conversions per hour. If your automation submits in bursts, expect to hit that ceiling and back off rather than retrying in a tight loop.

Download links are also temporary — converted files are deleted after a period, which is good for privacy and bad for a script that saves the URL for tomorrow. Treat the webhook as a starting gun and fetch promptly. If a download fails, [our download troubleshooting notes](/blog/download-troubleshooting) cover the usual causes.

### What the notification carries

Payloads are small JSON objects sent as the request body, with the event type named in the body or a header. Field names differ between services, so treat this as the shape of the idea rather than a contract to code against blindly. A finished-conversion event generally tells you:

- **Which event happened** — completed or failed — so one endpoint can handle both
- **Which job** it refers to, using the identifier you got when you submitted the file
- **When** it was generated, which lets you order events and drop stale ones
- **What was converted**, source and target format, EPUB in and MOBI out for example
- **The result** — a download reference on success, an error code and message on failure

Parse defensively: check a field exists before reading it, and ignore keys you don't recognise. Treat the body as a notification rather than the truth — if it disagrees with your records, trust a fresh status check over a message that may have arrived out of order.`
    },
    {
      heading: `Verifying the Signature So Nobody Can Fake a BookConv Event`,
      body: `Your endpoint is a public URL. Anyone who guesses it can POST whatever they like, and without verification your system will believe a stranger who claims a job finished.

That's why BookConv signs its notifications. You hold a signing secret, we compute an HMAC over the exact request body with it, and the result travels in a header. You compute the same hash and compare. A match proves two things at once: the body wasn't altered, and the sender knows the secret.

Four details separate real verification from security theatre.

1. **Hash the raw body**, not a parsed-and-re-serialised object. Re-encoding JSON can reorder keys or change whitespace, and then nothing matches.
2. **Compare in constant time.** A plain string equality check can leak information through how fast it fails.
3. **Reject outright.** Return 401 and stop. A handler that logs a bad signature and processes the event anyway protects nothing.
4. **Check the timestamp.** Refuse anything older than a few minutes so a captured request can't be replayed later.

Keep the secret in an environment variable, use a different value per environment, and only accept the callback over HTTPS. Our [environment variables setup guide](/blog/env-variables-setup) covers how we organise that layer.

For the underlying standards, [RFC 2104](https://datatracker.ietf.org/doc/html/rfc2104) defines HMAC, and the [Standard Webhooks specification](https://www.standardwebhooks.com/) collects the header, signing, and versioning conventions most providers have converged on.`
    },
    {
      heading: `How We Use Webhooks Inside BookConv`,
      body: `We're not describing this from the outside. Webhooks already carry weight inside BookConv, and how we use them is a fair template.

### Job events off the queue

Every conversion is a job, and workers emit an event when one completes or fails, tagged with its ID. An outward notification is built from that same stream.

### Failure alerts into a team channel

When a job fails, the worker builds a short alert with the job ID, the two formats, and a readable error, then posts it to a team chat webhook URL. That URL comes from an environment variable, so moving the alert channel is a deployment setting rather than a code change.

The detail worth copying: the call is fire-and-forget. If the chat service is down, the alert gives up quietly instead of taking the pipeline with it. A notification shouldn't break the thing it's notifying about.

### Billing events coming the other way

Our billing runs through Lemon Squeezy, which POSTs subscription and order events to an endpoint on our side. That handler reads the signature header, verifies it before parsing anything, and answers 401 on a mismatch. Their [webhook documentation](https://docs.lemonsqueezy.com/help/webhooks) is a good model for documenting event types.`
    },
    {
      heading: `Retries, Duplicates, and Automations Worth Building`,
      body: `Delivery isn't guaranteed first time. Your server might be mid-deploy, the network might hiccup, your handler might time out. Retries go out on a growing delay, so your endpoint will eventually see the same event twice.

Two habits handle that. Make the handler **idempotent** — key your processing on the job or event ID, and if you've already handled it, return success and do nothing. And **answer fast** — send a 2xx straight away, then do the real work on your own queue. A handler that spends thirty seconds downloading and reprocessing a file gets retried while it's still running, and now you have two.

### What people actually build on this

- **Publishing pipelines** — a docs repo commits Markdown, CI builds an EPUB, BookConv produces the formats you ship, and the webhook fires the release step. [Our EPUB to MOBI converter](/convert/epub-to-mobi) is a common link in that chain.
- **Library ingestion** — finished files sorted into the right folder, tagged, and written into a catalogue
- **Reader notifications** — a message when a long conversion is ready, so nobody watches a progress bar
- **Chat alerts** — failures posted where someone can act on them
- **Usage analytics** — counts and durations per format pair, so you see which conversions get used

Start with one event and one consumer. Confirm it works end to end before fanning out.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **BookConv converts on a queue**, so finish times vary with file size and load. A webhook names the exact moment instead of making you guess an interval.
- **Verify every request** with an HMAC over the raw body, a constant-time comparison, and a hard 401 on mismatch. An unverified endpoint is an open door.
- **Assume duplicates.** Idempotent handlers keyed on the job or event ID turn retries into a non-event.
- **Acknowledge first, work later.** Return 2xx quickly and push heavy processing onto your own queue.
- **Fetch results promptly**, because download links are temporary and converted files get deleted after a period.`
    }
  ]
};

export const faqs = [
  {
    question: `What's the difference between a webhook and an API call?`,
    answer: `Direction. With an API call your code starts the request. With a webhook we start it against a URL you own. Same HTTP machinery, pointed the other way.`,
  },
  {
    question: `Do I need webhooks just to convert a few files?`,
    answer: `No. For one-off jobs the normal upload-and-download flow is simpler and the progress bar tells you everything. Webhooks earn their keep when conversion is a step in a repeating process nobody watches.`,
  },
  {
    question: `Will I get an event for a file BookConv rejects?`,
    answer: `Rejections for DRM protection or an oversized upload happen before a job exists, so that answer comes back in the upload response, not by webhook. The failed event covers problems during conversion.`,
  },
  {
    question: `Can I receive webhooks while developing on my laptop?`,
    answer: `Not directly — we need a publicly reachable URL. Most people use a tunnelling tool that forwards a temporary public address to localhost, then switch to the real domain before launch.`,
  },
  {
    question: `What should my endpoint return?`,
    answer: `Any 2xx, as fast as you can manage. Return 401 when verification fails, and 5xx only if you want a retry.`,
  },
  {
    question: `What if my server is down when the event fires?`,
    answer: `Retries go out on a growing schedule, then stop. So don't make the webhook your only source of truth — keep a way to check status and reconcile what you missed.`,
  },
  {
    question: `How do I test my signature check without a real conversion?`,
    answer: `Sign a sample payload with your test secret the way we would and POST it to your endpoint. Then change one character and confirm you get a 401. If the tampered request still gets processed, verification isn't wired up.`,
  }
];
