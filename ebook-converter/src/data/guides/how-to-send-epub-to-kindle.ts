import { BlogFaq } from '../blog/types'

export const slug = 'how-to-send-epub-to-kindle'
export const title = 'How to Send an EPUB to Your Kindle: Every Delivery Route Compared'
export const problem = 'You know the Kindle needs a Kindle format — what you actually need now is the delivery step. Here is every route an EPUB can take to reach your Kindle, what each one does to your file behind the scenes, and which failures silently swallow books.'
export const date = '2026-10-13'
export const updatedAt = '2026-10-13'
export const tags = ['epub', 'kindle', 'send to kindle', 'ebook delivery', 'how to']
export const formats = { source: 'epub', target: 'azw3' }
export const keyTakeaways = [
  'An EPUB reaches your Kindle through four routes: the Send to Kindle web uploader, the mobile or desktop app, email to your Kindle address, or a USB copy after you convert it yourself.',
  'Every Amazon-run route converts your EPUB on Amazon servers. A USB copy after converting to AZW3 is the only route where the file arrives exactly as you prepared it.',
  'Email delivery fails silently most often: the sender must be on your Approved Personal Document E-mail List, and the attachment caps are tighter than the app routes.',
  'DRM-protected EPUBs are rejected by every route. Library loans should be delivered through the library app instead.',
]
export const content = {
  intro: `Sending an EPUB to a Kindle sounds like a one-step task until the book never shows up, arrives without its formatting, or bounces out of your outbox with no explanation. The reason is that "send" actually hides four different delivery routes, and each one handles your file differently. This guide covers the mechanics: which route to use for which situation, the settings that must be right before you press send, and the failure modes that make books vanish. If you are still deciding between the reading methods themselves, start with How to Read EPUB on Kindle — this page picks up where that one ends, at the moment of delivery.`,
  sections: [
    {
      heading: 'The four delivery routes at a glance',
      body: `Every route ends with a Kindle-format book on your device, but the intermediate steps differ in who converts the file and what survives the trip:

| Route | Who converts | Formatting control | Best for |
|---|---|---|---|
| Send to Kindle (web upload) | Amazon | Low | Quick one-off novels |
| Send to Kindle (mobile / desktop app) | Amazon | Low | Everyday reading, drag-and-drop |
| Email to your Kindle address | Amazon | Low | Forwarding newsletters and files from anywhere |
| USB copy after converting to AZW3 | You | Full | Styled books, cookbooks, anything with tables or fonts |

The pattern to internalize: three of the four routes hand your EPUB to Amazon's conversion pipeline, and one keeps the conversion on your side. None of the Amazon routes ever place your original EPUB on the device — the EPUB itself is an intermediate, not a destination. What each format actually is, including where AZW3 sits, is covered in [our EPUB format overview](/formats/epub).`,
    },
    {
      heading: 'Route 1 and 2: Send to Kindle via web or app',
      body: `The web uploader and the apps behave the same way: you hand over an EPUB, Amazon converts it server-side, and the finished book appears on every device registered to your account. The app route is the most forgiving — drag the file into the mobile or desktop app, pick the target device, done.

Two details decide whether this route works for you. First, only DRM-free EPUBs are accepted; a library loan will be silently dropped rather than rejected with a helpful message. Second, Amazon's conversion is optimized for straight text. Cookbooks, textbooks, multi-column layouts, custom embedded fonts, and footnote-heavy academic books come out flattened more often than not. If your book fits that description, skip ahead to the USB route.`,
    },
    {
      heading: 'Route 3: Email delivery and the approved-sender trap',
      body: `Every Kindle has its own address (visible in Manage Your Content and Devices under your Amazon account). Emailing a DRM-free EPUB attachment to that address delivers it like the app routes do — with one extra gate that trips up almost everyone at least once.

**The sender address must be on your Approved Personal Document E-mail List.** Amazon does not reply to unapproved senders; the email simply goes nowhere, and you will not receive a bounce. Before your first email delivery, add the address you are sending from in your Amazon device settings.

Email is also the route with the tightest attachment limits, because it passes through a mail gateway rather than a direct upload. Newsletters, short documents, and small novels travel fine; a 40 MB illustrated EPUB is better served by another route. A practical habit: email is for files that originate somewhere other than your current device — everything else moves faster through the app.`,
    },
    {
      heading: 'Route 4: USB copy after converting to AZW3 (full control)',
      body: `This is the only route where nothing happens on Amazon's servers. You convert the EPUB to AZW3 yourself, verify the output, and copy the finished file to the Kindle's documents folder over USB. What you checked is what the device opens.

When this route is worth the extra minute:

- **Styled books.** Embedded fonts, CSS, tables, and multi-level footnotes survive an AZW3 conversion you control; Amazon's pipeline frequently strips them.
- **Oversized files.** EPUBs above the app routes' comfortable size range stop failing once the conversion happens locally — a 10 MB-class EPUB converts cleanly with [BookConv's EPUB to AZW3 tool](/convert/epub-to-azw3) in the browser, no install needed.
- **Verification before delivery.** You can open the AZW3 in a desktop reader, confirm the chapter order and cover, and only then move it to the device.

The same logic applies to very old Kindle hardware (roughly pre-2012) that predates AZW3 — convert to MOBI instead, using the same workflow with the [EPUB to MOBI converter](/convert/epub-to-mobi). What AZW3 preserves and why it is the default sideload target is explained in [our AZW3 format page](/formats/azw3).`,
    },
    {
      heading: 'Pre-flight check: DRM and file size',
      body: `Two file properties decide which routes are even open to you. Run this check before sending anything:

1. **DRM status.** Open the EPUB in any non-Kindle reader. If it opens, it is DRM-free and every route accepts it. If it only opens inside the Kindle app while signed in to Amazon, it is DRM-wrapped: Amazon's routes will drop it, and no converter will process it. Library loans belong to this category — deliver them through the library app's built-in Kindle delivery instead of any manual route. The full decision procedure is in our [DRM-free checklist](/blog/which-kindle-books-can-you-convert-drm-free-checklist).
2. **Size and complexity.** A text-only novel under a few megabytes travels happily through every route. Large or image-heavy EPUBs are where the Amazon routes start failing or flattening — that is the signal to convert first and go by USB.`,
    },
    {
      heading: 'Troubleshooting: the book never arrived',
      body: `Work down this list — it covers the failure modes in the order they actually occur:

- **Sent by email, nothing happened, no bounce.** The sender is not on your Approved Personal Document E-mail List. This is the single most common silent failure. Fix the list, resend.
- **Sent to the wrong address.** Each registered Kindle has its own address; old devices you have replaced keep their addresses in your account. Confirm you are sending to the address of the device you actually read on.
- **Book appears but chapters or fonts are wrong.** Amazon's conversion flattened it. Re-do the conversion yourself with EPUB to AZW3 and transfer by USB.
- **Book appears on one device only.** Delivery targets a single device address. The app and web routes let you pick; a book you want everywhere needs to be sent again per device, or archived to your Amazon library after delivery.
- **DRM rejection with no message.** Protected files are dropped without notification on every Amazon route. Confirm DRM status with the pre-flight check above.

For books that arrive damaged rather than missing, the repair path is always the same: take the conversion back from Amazon's pipeline by converting the original EPUB locally, then redeliver the finished file.`,
    },
    {
      heading: 'Which route for which book',
      body: `| Situation | Route |
|---|---|
| One-off novel, plain text | Send to Kindle app or web |
| File is on another device or arrives by email | Email to Kindle address |
| Cookbook, textbook, styled or oversized EPUB | Convert to AZW3, copy by USB |
| Very old Kindle | Convert to MOBI, copy by USB |
| Library loan | Library app's built-in Kindle delivery |

Once the delivery route is decided, the rest is routine: DRM-free files go straight through, styled files take one conversion step first, and nothing you own needs to stay stuck on the wrong device. If the send succeeded but the reading experience is off, the method-level guide [How to Read EPUB on Kindle](/guide/how-to-read-epub-on-kindle) covers the device side.`,
    },
  ],
}
export const faqs: BlogFaq[] = [
  { question: 'Why did my emailed EPUB never arrive on the Kindle?', answer: 'Almost always because the sending address is not on your Approved Personal Document E-mail List in Amazon settings. Unapproved senders are dropped silently with no bounce message. Add the address, resend, and delivery usually completes within a few minutes.' },
  { question: 'Does Send to Kindle change my EPUB file?', answer: 'Yes. Amazon converts the EPUB to a Kindle format on their servers and delivers that converted copy; your original EPUB never lands on the device. Simple novels survive this fine, but custom fonts, tables, and complex layouts are frequently flattened.' },
  { question: 'Can I avoid Amazon converting my file?', answer: 'Only by converting the EPUB to AZW3 yourself and copying the finished file to the Kindle over USB. That is the one route where the file arrives exactly as you prepared and verified it.' },
  { question: 'What size EPUB can I send to Kindle?', answer: 'The app and web routes comfortably handle standard novels; the email route faces tighter attachment limits because it passes through a mail gateway. Large or image-heavy EPUBs are more reliable after a local EPUB to AZW3 conversion, which also sidesteps any upload cap entirely.' },
  { question: 'Can I send a library EPUB book to my Kindle?', answer: 'Not directly — library loans are DRM-protected and every route rejects them, usually silently. Use the library app (such as Libby) and choose Kindle as the delivery target; Amazon handles the transfer of the protected loan through its own channel.' },
  { question: 'Does converting EPUB to AZW3 before sending cost anything?', answer: 'No. BookConv converts EPUB to AZW3 free in your browser, with no account, no watermark, and files deleted automatically within an hour. Uploads are limited to 10 MB per file.' },
]
// E-E-A-T authorship block
export const authorship = {
  author: 'BookConv Team',
  lastVerified: '2026-10-13',
  credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
  estimatedConversions: '10,000+ monthly',
}
