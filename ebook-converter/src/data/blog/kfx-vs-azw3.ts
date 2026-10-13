export const slug = `kfx-vs-azw3`;
export const title = `KFX vs AZW3: Which Kindle Format Should You Use?`;
export const date = `2026-10-13`;
export const lastUpdated = `2026-10-13`;
export const author = `BookConv Team`;
export const tags = ["Kindle", "KFX", "AZW3", "MOBI", "EPUB", "Ebook Formats", "BookConv"];

export const content = {
  intro: `KFX and AZW3 are both Amazon Kindle formats, and they are easy to confuse because they look identical from the outside — same store, same devices, same ecosystem. The difference is who controls the file. KFX is Amazon's delivery format: it arrives from the Kindle Store, it is DRM-bound, and it is not something you can produce or convert yourself. AZW3 is Amazon's sideload format: it is what you get when you convert an EPUB or MOBI yourself, and it preserves the formatting you approved. One sentence settles most decisions — **you use AZW3 when you bring your own books, and you only ever receive KFX when Amazon brings one to you.** This guide explains what each format actually is, where you encounter them, and the few situations where the choice is genuinely yours. For the wider family of Kindle formats, the [Kindle formats explained guide](/guide/kindle-formats) covers the full map.`,

  sections: [
    {
      heading: `Key Takeaways`,
      body: `- **KFX 与 AZW3 的分界是"谁控制文件"。** KFX 是 Amazon 商店交付格式，DRM 绑定你的账号；AZW3 是你自行转换、自行拷贝的侧载格式，转换后归你完全控制。
- **KFX 无法被任何工具转换。** DRM 是法律墙而非技术墙，且 Enhanced Typesetting 在服务端渲染，本地文件本身不完整。想要可转换副本，唯一正路是另取开放格式（EPUB 购买版、图书馆借阅、Project Gutenberg）。
- **自带 EPUB 一律转 AZW3。** 2012 年后的 Kindle 都支持，CSS、嵌入字体、表格都能保留；2012 年前的老设备才需要退回 MOBI。
- **验证 DRM 状态只需十秒。** 文件能在 Kindle 之外的阅读器打开 = DRM-free；只会在登录态 Kindle 应用里打开 = DRM 锁定。
- **BookConv 只收 DRM-free 文件。** EPUB、AZW3、MOBI、PDF 之间任意互转免费、无账号、文件 1 小时内删除。`
    },
    {
      heading: `What KFX actually is`,
      body: `KFX is Amazon's most recent proprietary format, designed around Enhanced Typesetting: server-side rendering that adjusts line spacing, justification, and word position per page on the device. When you buy a book from the Kindle Store and open it on a modern Kindle or the Kindle app, what arrives is KFX (or its container variants).

The defining property of KFX is not technical — it is legal. KFX files you receive from Amazon are DRM-wrapped to your account. They open only inside a signed-in Kindle session, they cannot be converted by any legitimate tool, and they are not meant to leave Amazon's pipeline. You will not create a KFX file, and no converter — including BookConv — accepts them. If a file only opens inside the Kindle app while you are signed in, that is the DRM test failing, and the format label is secondary. Amazon documents its device ecosystem, including the formats each generation supports, on the [Amazon Kindle official page](https://www.amazon.com/Amazon-Kindle/dp/B08KTZ8249); the format's open-standard counterpart, EPUB, is specified by the [W3C EPUB 3 specification](https://www.w3.org/TR/epub-33/).`
    },
    {
      heading: `What AZW3 actually is`,
      body: `AZW3 (also called KF8) is Kindle's earlier proprietary container, introduced in 2011, and it remains the standard target for sideloading. Unlike KFX, AZW3 supports real CSS styling, embedded fonts, tables, and structured metadata — close enough to EPUB's capability that a well-made conversion preserves the layout of the original.

The practical difference from KFX is ownership. AZW3 files you create yourself are DRM-free by construction: you converted them from files you already owned, and they open on any Kindle or in any AZW3-capable reader without an account. That is why every "convert EPUB for Kindle" workflow — including [BookConv's EPUB to AZW3 converter](/convert/epub-to-azw3) — outputs AZW3: it is the only Kindle format you can produce, verify, and keep full control over. The format's styling details are documented on [our AZW3 format page](/formats/azw3).`
    },
    {
      heading: `KFX vs AZW3: the comparison table`,
      body: `| Property | KFX | AZW3 |
|---|---|---|
| Who creates it | Amazon (store delivery only) | You (from EPUB/MOBI conversion) |
| DRM | Bound to your Amazon account | DRM-free when you sideload it |
| Styling support | Enhanced Typesetting (server-rendered) | Full CSS, embedded fonts, tables |
| Convertible with BookConv | No — DRM-bound | Yes — and it is a conversion output |
| Opens without Amazon account | No | Yes |
| Where you encounter it | Kindle Store purchases and deliveries | USB sideload, your own library |

The table's most important row is the second one. DRM is the real dividing line between the two formats, not age or capability — everything else follows from it. KFX is a delivery envelope; AZW3 is a working format.`
    },
    {
      heading: `When the choice is actually yours`,
      body: `In most cases you do not choose between KFX and AZW3 — Amazon makes one choice and you make the other. The decision points that genuinely exist:

**Buying from the Kindle Store.** You get KFX because Amazon delivers KFX. There is no setting to change this, and no legitimate way to convert the result. If you want an open-format copy of a book you bought, the honest answer is to buy the EPUB edition from the publisher or another store.

**Bringing your own EPUB or MOBI.** Convert to AZW3. This is the only Kindle format you can produce yourself, and converting keeps formatting control on your side of the pipeline.

**Old hardware.** Kindles from before roughly 2012 predate AZW3; for those, the conversion target is MOBI instead, using the same workflow with the [EPUB to MOBI converter](/convert/epub-to-mobi). Everything newer reads AZW3 fine.

**Reading on non-Kindle devices.** Neither format helps — KFX is account-locked and AZW3 is Kindle-family only. For Kobo, Apple Books, or Android readers, the target is EPUB, and the reverse workflow is [AZW3 to EPUB](/convert/azw3-to-epub).`
    },
    {
      heading: `Can you convert KFX to AZW3 (or anything else)?`,
      body: `No — and this is the question the format names most often provoke. A KFX file from Amazon is DRM-wrapped, which makes conversion illegal regardless of tooling, and technically the enhanced-typesetting rendering happens server-side, so the file you hold is not even a complete book. This is not a BookConv limitation; it is the same wall every converter hits. The legitimate paths are to re-obtain the book in an open format (buy the EPUB edition, use a library loan in the library app, or take the free classics from Project Gutenberg) and convert from there. The full decision procedure for identifying which of your files are convertible is in the [DRM-free checklist](/blog/which-kindle-books-can-you-convert-drm-free-checklist).`
    },
    {
      heading: `Practical recommendations by scenario`,
      body: `| Scenario | What to do |
|---|---|
| Kindle Store purchase | Read as delivered (KFX); no conversion path exists |
| Own EPUB headed for a 2012+ Kindle | Convert to AZW3, copy by USB or send |
| Own EPUB headed for a pre-2012 Kindle | Convert to MOBI instead |
| AZW3 books needed on Kobo / phone | Convert AZW3 to EPUB |
| File that only opens in the Kindle app | It is DRM-wrapped; re-obtain in an open format |

The short version: KFX is Amazon's lane and stays there. Every conversion decision you will actually make involves AZW3, MOBI, and EPUB — and [BookConv's free browser converter](/convert/epub-to-azw3) handles those in any direction without an account, with files deleted within an hour.`
    },
  ],
};

export const faqs = [
  {
    question: `Is KFX newer than AZW3, and does that make it better?`,
    answer: `KFX is newer, but "better" does not apply across the two — they serve different roles. KFX is Amazon's delivery format with Enhanced Typesetting rendering, while AZW3 is the sideload format you can create yourself. For books you bring from outside Amazon, AZW3 is the only option, and it preserves more of your own formatting than any Amazon conversion does.`
  },
  {
    question: `Can I convert a KFX file to AZW3 or EPUB?`,
    answer: `No. KFX files delivered by Amazon are DRM-wrapped to your account, and conversion is illegal as well as technically blocked — the enhanced-typesetting rendering happens on Amazon's servers, so the local file is incomplete. To get a convertible copy, obtain the book in an open format (EPUB purchase, library loan, or Project Gutenberg) and convert that.`
  },
  {
    question: `How do I tell whether my file is KFX or AZW3?`,
    answer: `Check where it came from and whether it opens outside the Kindle app. Anything delivered by the Kindle Store or the Kindle app is KFX-family and account-locked. A file you converted yourself and copied by USB is AZW3 and opens without an account. The ten-second test: if it opens in a standard reader on your computer, it is not KFX.`
  },
  {
    question: `Should I convert my EPUB to AZW3 or MOBI for Kindle?`,
    answer: `AZW3 for any Kindle from roughly 2012 onward — it supports CSS, embedded fonts, and tables, so your formatting survives. MOBI only for older hardware that predates AZW3. Both convert cleanly and for free with BookConv's browser-based converter.`
  },
  {
    question: `Do Kindle Store books ever arrive as AZW3?`,
    answer: `Store deliveries use Amazon's current pipeline formats (KFX-family), and the exact container can vary by device and era — but what you receive is always DRM-bound to your account either way. AZW3 files you encounter are ones you or someone else created by converting an open-format book, not store deliveries.`
  },
  {
    question: `Does BookConv accept KFX files for conversion?`,
    answer: `No. BookConv only accepts DRM-free files, and KFX deliveries are DRM-bound by definition. BookConv converts between EPUB, AZW3, MOBI, PDF, and other open formats — it is the tool for the files you own outright, not for Amazon store deliveries.`
  },
];
