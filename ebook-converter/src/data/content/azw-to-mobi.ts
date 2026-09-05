export const slug = 'azw-to-mobi';
export const title = 'Free AZW to MOBI Converter — No Sign-up';
export const metaDescription = 'Make old Amazon AZW files readable on any Kindle — free AZW to MOBI converter, no sign-up. Fast, private, DRM-free files only.';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'AZW to MOBI - Repackage Older Amazon Books for Any Kindle',
    subtitle: 'Free AZW to MOBI converter. No sign-up — turn older Amazon AZW files into plain MOBI that opens on every Kindle.'
  },

  sections: [
    {
      heading: 'What is AZW Format?',
      body: `AZW is Amazon's original Kindle format, introduced with the first Kindle in 2007. Under the surface it is a close cousin of MOBI: Amazon licensed the Mobipocket engine and wrapped it with its own DRM layer, producing the .azw files the earliest Kindle Store sold.

A few years later Amazon moved on to AZW3 (Kindle Format 8), a much richer format based on a modern HTML/CSS subset. AZW and AZW3 are not the same thing — AZW is the older, simpler one, closer to plain MOBI.

The practical upshot: if you have an old .azw that is DRM-free, converting it to MOBI is often close to a repackaging exercise, because the two formats share the same underlying structure.`
    },
    {
      heading: 'What is MOBI Format?',
      body: `MOBI is the foundational Kindle format. Every Kindle ever made reads it, from the 2007 original to the latest Paperwhite. It is simple, predictable, and maximally compatible.

That compatibility is exactly why you might want it. If a file needs to open on an unknown or older Kindle, MOBI is the format least likely to fail. The cost is presentation: MOBI drops embedded fonts and most CSS, keeping the text clean and readable rather than styled.`
    },
    {
      heading: 'AZW vs AZW3 - Do Not Confuse Them',
      body: `People often treat "AZW" and "AZW3" as the same label, but they are different enough to matter here.

**AZW** is the 2007-era format, essentially MOBI with Amazon's DRM. Converting DRM-free AZW to MOBI is straightforward.

**AZW3** is the 2011-era format (KF8) with embedded fonts, real CSS, and fixed-layout support. It is a richer file and converts to MOBI by shedding those extras.

If your file is .azw3, use the AZW3 to MOBI converter instead — this page is specifically for the older .azw files. Mixing them up just sends you to the wrong tool.`
    },
    {
      heading: 'How to Convert AZW to MOBI',
      body: `**1. Upload your AZW file.** Drag it in or browse. Free accounts accept files up to 10MB, which covers virtually all AZW books.

**2. Conversion runs.** The AZW container is read, its content is simplified to MOBI-compatible HTML and CSS, and the chapter structure is rebuilt. Most files convert in well under a minute.

**3. Download and sideload.** Connect your Kindle by USB and copy the .mobi into the documents folder. It shows up on the home screen.

**DRM blocks this entirely.** Books downloaded from the Kindle Store carry Amazon's DRM and cannot be read by any converter. This works only on DRM-free AZW files you exported yourself, or titles from DRM-free sources.`
    },
    {
      heading: 'When You Need This',
      body: `**You have an old DRM-free AZW.** Maybe a personal export, a developer sample, or a book from a store that sold DRM-free AZW. Turning it into MOBI makes it open on any Kindle.

**You want maximum compatibility.** MOBI is the one format every Kindle reads. If you are handing a file to an older device or an unknown reader, MOBI removes the guesswork.

**You are consolidating formats.** Keeping one universal format for your personal library is easier to back up than a mix of legacy containers.

If your file came directly from the Kindle Store, it is DRM-protected and will not convert — no tool can decrypt it. In that case the only path is to download it through Amazon's own apps, which deliver a readable copy tied to your account.`
    },
    {
      heading: 'What You Keep and Lose',
      body: `Because AZW and MOBI share roots, the conversion is gentle.

**Preserved:**
- **All the text** — nothing is truncated
- **Chapter breaks** — structure holds
- **Basic emphasis** — bold and italic
- **Metadata** — title and author

**Simplified or dropped:**
- **Embedded fonts** — the device uses its built-in typefaces
- **Advanced CSS** — custom margins and colored text flatten
- **Fixed layouts** — reflow into standard text

For ordinary books the reading experience is unchanged. You trade a little styling for the guarantee that the file opens on any Kindle you own.`
    }
  ],

  faq: [
    { q: 'Is AZW the same as AZW3?', a: 'No. AZW is Amazon’s 2007 format, essentially MOBI with DRM. AZW3 (KF8) is the 2011 format with embedded fonts and modern CSS. This page is for old .azw files; if you have a .azw3, use the AZW3 to MOBI converter instead.' },
    { q: 'Can I convert a Kindle Store AZW?', a: 'No. Kindle Store books carry Amazon DRM and cannot be read by any converter. This works only on DRM-free AZW files such as your own exports or DRM-free purchases.' },
    { q: 'Why bother converting AZW to MOBI?', a: 'MOBI is the one format every Kindle reads, including the oldest models. If you want a file that opens on any Kindle without question, MOBI is the safest target.' },
    { q: 'Will my chapters survive?', a: 'Yes. AZW stores chapters as heading-based structure, and that maps directly to MOBI chapters, so reading order and breaks are preserved.' },
    { q: 'Can I email the MOBI to my Kindle?', a: 'Amazon removed MOBI from Send to Kindle in 2022, so email delivery is rejected. Copy the file into the documents folder over USB instead.' },
    { q: 'How large are AZW files?', a: 'Typical AZW books are 1-5MB, well within the 10MB free-account limit. Only image-heavy books risk hitting the cap.' }
  ]
,

  authorship: {
    author: 'BookConv Team',
    lastVerified: '2026-09-05',
    credentials: 'Based on Calibre engine maintenance and 10,000+ monthly conversions',
    estimatedConversions: '10,000+ monthly'
  }
};
