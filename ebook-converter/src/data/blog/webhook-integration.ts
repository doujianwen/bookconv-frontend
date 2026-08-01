export const slug = `webhook-integration`;
export const title = `Webhooks Explained: Get Notified the Moment a Conversion Finishes`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["webhook", "automation", "integration", "technical"];

export const content = {
  intro: `Asking a server "is it done yet?" every three seconds is a waste of everyone's bandwidth. This guide explains what webhooks are, what a conversion event payload looks like, how to verify one is genuine, and which workflows are worth wiring up.`,
  sections: [
    {
      heading: `What a Webhook Is, and Why Polling Wastes Your Time`,
      body: `A webhook is an API call in reverse. Normally your code asks our server for information. With a webhook, you hand us a URL you control, and our server sends an HTTP POST to that URL the moment something happens.

The alternative is polling: a loop that checks a status endpoint until the answer changes. Poll too often and you burn requests on answers you already have. Poll too slowly and your automation sits idle long after the file was ready.

Webhooks flip the cost. Nothing happens until there's actual news, and when there is, you hear about it in roughly one HTTP request's worth of time.

This matters most for ebook conversion because conversions aren't instant. Files go into a queue and get picked up by background workers, so the gap between "submitted" and "finished" varies with file size and how busy the system is. We wrote about that pipeline in detail in [how background workers handle conversion jobs](/blog/background-workers).

Think of it as leaving your phone number instead of standing at the counter. You place the order, walk away, and get a text when it's ready.`
    },
    {
      heading: `What a Conversion Event Payload Looks Like`,
      body: `Webhook payloads are usually a small JSON object sent as the request body, with a header or a field naming the event type. Field names vary between services, so treat the shape below as the general pattern rather than a fixed contract.

A conversion-finished event typically carries:

- **Event name** such as conversion.completed or conversion.failed, so one endpoint can handle several event types
- **Job identifier** — the same ID you got back when you submitted the file, which is how you match the event to the work you started
- **Timestamp** of when the event was generated, useful for ordering and for rejecting stale deliveries
- **Format details** like the source and target formats, for example EPUB in and MOBI out
- **Result information** — a download reference for successful jobs, or an error code and message for failed ones

Two habits will save you pain later. First, read defensively: check that a field exists before using it, and ignore fields you don't recognise instead of erroring on them. Providers add fields over time, and a parser that rejects unknown keys breaks on a Tuesday for no visible reason.

Second, don't assume a download reference lives forever. Converted files are temporary by design, so fetch the result soon after the event arrives. If a download does fail on you, [our download troubleshooting notes](/blog/download-troubleshooting) cover the usual causes.

And remember a webhook body is a *notification*, not a source of truth. If the payload disagrees with your records, trust a fresh status check over a message that arrived out of order.`
    },
    {
      heading: `How BookConv Uses Webhooks Behind the Scenes`,
      body: `We're not just describing this in the abstract. Webhooks are already load-bearing inside BookConv, and the way we use them is a decent template for how you might use them.

### Job events from the queue

Every conversion runs as a job on a background queue. Workers emit events when a job completes or fails, each tagged with its job ID. That stream is what any outward notification would be built on — the same signal, delivered externally.

### Failure alerts to a team channel

When a job fails, the worker builds a short alert containing the job ID, the source and target formats, and a readable error message, then posts it to a team chat webhook URL. That URL isn't hardcoded; it comes from an environment variable, so the alert channel is a deployment setting rather than a code change. Our [environment variables setup guide](/blog/env-variables-setup) explains how that configuration layer is organised.

The design detail worth copying: the alert call is fire-and-forget. If the chat service is down, the notification silently gives up instead of taking the pipeline with it. Notifications should never break the thing they're notifying about.

### Payment events from our billing provider

On the receiving side, our billing runs through Lemon Squeezy, which POSTs subscription and order events to an endpoint on our side. That handler reads a signature header, verifies it before parsing anything, and answers with 401 if the signature doesn't match. Only after that check does it act on the event. Their [webhook documentation](https://docs.lemonsqueezy.com/help/webhooks) is a good example of how a provider should document event types.`
    },
    {
      heading: `Verifying Signatures So Nobody Can Fake an Event`,
      body: `Your webhook endpoint is a public URL, and anyone who guesses it can POST whatever they like. Without verification, a stranger can tell your system a payment succeeded or a job finished, and your system will believe them.

The standard fix is a shared signing secret. The sender computes an HMAC — usually HMAC SHA-256 — over the raw request body using that secret and puts the result in a header. You compute the same HMAC and compare. A match means the body wasn't altered and the sender knows the secret.

Four rules make the difference between real verification and security theatre:

1. **Hash the raw body**, not a re-serialised object. Parsing JSON and stringifying it again can reorder keys or change spacing, and the signature won't match.
2. **Use a constant-time comparison.** A plain equality check on strings can leak information through how long it takes to fail.
3. **Reject, don't log-and-continue.** Return 401 and stop. A handler that warns about a bad signature and processes the event anyway offers no protection at all.
4. **Check the timestamp.** If the payload or headers include one, reject anything older than a few minutes so an attacker can't replay a captured request.

Keep the secret in an environment variable, use a different one per environment, and serve the endpoint over HTTPS only.

For the underlying specs, [RFC 2104](https://datatracker.ietf.org/doc/html/rfc2104) defines HMAC, and the [Standard Webhooks specification](https://www.standardwebhooks.com/) collects the header, signing, and versioning conventions most providers converge on.`
    },
    {
      heading: `Retries, Idempotency, and Workflows Worth Automating`,
      body: `Delivery isn't guaranteed on the first try. Your server might be redeploying, the network might hiccup, your handler might time out. Well-behaved senders retry with a growing delay, which means your endpoint will sometimes see the same event twice.

Two practices handle that cleanly. Make your handler **idempotent** — key your processing on the job or event ID, and if you've already handled that ID, return success and do nothing. And **respond fast**: acknowledge with a 2xx immediately, then do the real work on your own queue. A handler that spends thirty seconds downloading and reprocessing a file will get retried while it's still running, and now you have two of them.

### Things people actually build with this

- **Build pipelines** — a docs repo commits Markdown, CI produces an EPUB, a conversion turns it into the formats you ship, and the webhook triggers the release step. See [our EPUB to MOBI converter](/convert/epub-to-mobi) for a typical pair in that chain.
- **Library ingestion** — a personal or team library that files finished conversions into the right folder, tags them, and updates a catalogue entry
- **Reader notifications** — an email or push message when a long conversion is ready, so nobody sits watching a progress bar
- **Chat alerts** — failures posted to the channel where someone can act on them, exactly like the internal alerts described above
- **Usage analytics** — recording conversion counts and durations per format to see which pairs actually get used

Start with one event and one consumer. These systems get complicated fast if you fan out to five destinations before confirming the first one works.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Webhooks replace polling.** You publish a URL, the sender POSTs to it when something happens, and nobody burns requests on unchanged status.
- **Payload shapes vary**, so parse defensively — expect an event name, a job ID, a timestamp, and either a result reference or an error.
- **Verify every request** with an HMAC over the raw body, a constant-time comparison, and a hard 401 on mismatch. Unverified endpoints are open doors.
- **Assume duplicates.** Idempotent handlers keyed on the event or job ID turn retries from a bug source into a non-event.
- **Acknowledge first, work later.** Return 2xx quickly and push heavy processing onto your own queue so the sender doesn't retry mid-job.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: What's the difference between a webhook and an API call?
A: Direction. With an API call your code initiates the request. With a webhook the other service initiates it against a URL you own. Same HTTP machinery, pointed the opposite way.

Q: Can I use webhooks if my app runs on my laptop?
A: Not directly, since the sender needs a publicly reachable URL. During development most people use a tunnelling tool that forwards a temporary public address to localhost, then switch to the real domain before going live.

Q: What should my endpoint return?
A: Any 2xx status, as fast as you can manage. Return 401 for a failed signature check, and a 5xx only when you genuinely want the sender to retry.

Q: What happens if my server is down when an event fires?
A: Most senders retry on a growing schedule, then give up. That's why webhooks shouldn't be your only source of truth — keep a way to query current status and reconcile anything you missed.

Q: How do I test a webhook handler without triggering real events?
A: Craft a sample payload, sign it with your test secret the way the sender would, and POST it to your endpoint. Then deliberately break the signature and confirm you get a 401. If the tampered request still gets processed, your verification isn't wired up correctly.

Q: Do I need webhooks just to convert a few files?
A: No. For one-off conversions the normal upload-and-download flow is simpler. Webhooks earn their keep when conversions are part of a repeating automated process where a human isn't watching.

Q: Is one endpoint enough for multiple event types?
A: Usually yes, and it's easier to secure. Read the event name from the payload and branch from there, logging unknown names rather than treating them as errors.`
    }
  ]
};
