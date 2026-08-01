export const slug = `azw3-vs-mobi`;
export const title = `AZW3 vs MOBI: Which Format Should You Use for Kindle?`;
export const date = `2026-08-01`;
export const author = "BookConv Team";
export const tags = ["AZW3", "MOBI", "Kindle", "Ebook Formats", "BookConv", "Calibre"];

export const content = {
  intro: `Choosing between AZW3 and MOBI only matters if a Kindle is involved — or you're trying to get a book onto one. Both are Amazon's own formats, but they're a generation apart. This guide settles it: when AZW3 wins, when MOBI is the only option left, and how to convert either way without losing your formatting.`,
  sections: [
    {
      heading: `The Short Version`,
      body: `Use **AZW3** for any Kindle made in the last ten years. It renders modern CSS, keeps your embedded fonts, and handles tables and complex layouts. Reach for **MOBI** only when you're feeding a Kindle old enough to predate decent styling, or when you're stuck with software that never learned anything newer.

If you're not sure which device you own, AZW3 is the safe default. It's the format Amazon's own publishing pipeline produces, and it's what Send to Kindle builds behind the scenes.`
    },
    {
      heading: `What AZW3 Actually Is`,
      body: `AZW3 is Amazon's consumer name for **KF8 (Kindle Format 8)**, the format that replaced plain MOBI around 2011. Under the hood it's an EPUB-like package with Amazon's extensions bolted on.

What that buys you:
- **Real CSS support** — margins, padding, floats, and media queries that actually work
- **Embedded fonts** — the book looks identical on every device, not just the system default
- **Enhanced typesetting** — hyphenation, kerning, and word spacing that newer Kindles apply automatically
- **Fixed layout** — picture books and comics render as the designer intended

In short, AZW3 is what a modern ebook is supposed to be on Amazon's hardware.`
    },
    {
      heading: `What MOBI Actually Is`,
      body: `MOBI comes from Mobipocket, a French company Amazon bought in 2007 and quietly retired. The format dates to an era when e-readers had monochrome screens and almost no styling horsepower.

It carries a small slice of CSS and drops most of it. No embedded fonts. No real tables. No fancy layouts. A MOBI file is closer to a plain text document with light formatting than to a designed book.

Amazon stopped accepting MOBI through **Send to Kindle in August 2022**, which tells you everything about where the format sits today.`
    },
    {
      heading: `AZW3 vs MOBI, Feature by Feature`,
      body: `Here's the honest comparison, not the marketing version.

**Styling** — AZW3 supports modern CSS; MOBI supports a bare minimum.
**Fonts** — AZW3 embeds them; MOBI uses whatever the device ships with.
**Tables and images** — AZW3 handles both well; MOBI chokes on complex ones.
**File size** — AZW3 runs a little larger because it carries more; MOBI is leaner but thinner.
**Device support** — every Kindle reads both, but only modern models show AZW3's advantages.
**Future-proofing** — AZW3 is still Amazon's active format; MOBI is frozen in the past.

There's no category where MOBI beats AZW3 on quality. The only places MOBI still wins are compatibility with ancient hardware and a few stubborn legacy tools.`
    },
    {
      heading: `When AZW3 Is the Right Call`,
      body: `Pick AZW3 whenever any of these are true:
- Your Kindle is from 2015 or later (Paperwhite 3, Oasis, any current model)
- The book has illustrations, tables, or custom typography you care about
- You want it to look the same across every device
- You're building a library you expect to keep for years

AZW3 is also the format to aim for if you ever use Send to Kindle, because that service converts your upload into KF8 on Amazon's side anyway. If your reading happens off Kindle, [convert EPUB to AZW3](/convert/epub-to-azw3) is the bridge from the open standard most books start as.`
    },
    {
      heading: `When MOBI Still Makes Sense`,
      body: `MOBI isn't completely dead. A few situations still call for it:
- **Old hardware** — Kindle Keyboard, Kindle 4, Kindle Touch, and first-gen Paperwhites often only sideload MOBI cleanly over USB
- **No account, no Wi-Fi** — if you're handing someone a file on a stick with no Amazon login, MOBI is the lowest-common-denominator target
- **Legacy libraries** — if your existing collection is all MOBI and you don't want to re-process it

If none of those describe you, MOBI is just a worse AZW3.`
    },
    {
      heading: `Converting Between the Two`,
      body: `Moving from one to the other is straightforward because both run through Calibre's engine.

- **AZW3 to MOBI** — [convert on BookConv](/convert/azw3-to-mobi) for a single file, no install required. Expect MOBI to drop the fancy styling AZW3 carried.
- **MOBI to EPUB** — [use the BookConv converter](/convert/mobi-to-epub) if your reading has moved off Kindle entirely.
- **EPUB to AZW3** — the best target for a modern Kindle; [BookConv handles it](/convert/epub-to-azw3) in the browser.

Desktop Calibre is worth installing only if you're batch-converting a whole shelf at once. For one or two books, the web converter is faster. For the bigger picture across formats, our [ebook formats comparison](/blog/ebook-formats-explained) lays it out side by side.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **AZW3 is the modern format** — KF8 with real CSS, embedded fonts, and tables; the right target for any Kindle from the last decade.
- **MOBI is legacy** — limited styling, no embedded fonts, and dropped from Send to Kindle in August 2022.
- **MOBI only wins on old hardware** — pre-2015 Kindles and a few legacy tools are the sole holdouts.
- **Converting drops quality one way** — AZW3 to MOBI loses styling, not text; it can't be recovered going back.
- **One engine does it all** — Calibre powers both BookConv and the desktop app, so the output is the same either way.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Is AZW3 better than MOBI?
A: Yes, for any modern Kindle. AZW3 (KF8) supports modern CSS, embedded fonts, and tables; MOBI supports almost none of that. MOBI only wins on compatibility with pre-2015 hardware.

Q: Can my Kindle read both AZW3 and MOBI?
A: Every Kindle ever made reads MOBI, and every model from the last decade reads AZW3. The difference is that older devices can't display AZW3's extra styling, so it falls back to a plainer look.

Q: Which should I send to my Kindle?
A: Send AZW3, or send EPUB through Send to Kindle (which becomes KF8 on Amazon's side). Use MOBI only for very old devices that don't handle AZW3 well over USB.

Q: Does converting AZW3 to MOBI lose quality?
A: It loses styling, not text. Embedded fonts, complex tables, and advanced CSS are dropped because MOBI can't represent them. The words and chapter structure survive.

Q: What's the difference between AZW3 and KFX?
A: KFX is Amazon's even newer format with enhanced typesetting and compliance features, used for Store purchases. AZW3/KF8 is the open-to-converters format you'll actually produce yourself.

Q: Can I convert MOBI back to AZW3?
A: You can, but you won't recover what MOBI threw away. Converting MOBI to AZW3 gives you the container; the lost fonts and layout don't come back. Start from the original EPUB if you still have it.

Q: Is AZW3 the same as KF8?
A: Yes. AZW3 is Amazon's consumer-facing name; KF8 (Kindle Format 8) is the technical specification. They refer to the same format.`
    }
  ]
};
