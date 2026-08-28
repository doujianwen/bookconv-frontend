export const slug = 'azw3-to-mobi';
export const title = 'AZW3 to MOBI: Free Downgrade for Old Kindles (pre-2015)';
export const metaDescription = 'Need AZW3 on a 2007–2014 Kindle? Convert AZW3 to MOBI free, no sign-up — keeps your text intact, runs in seconds. For legacy Kindle hardware only.';
export const level = 'B' as const;
export const wordCount = 2400;

export const content = {
  hero: {
    title: 'AZW3 to MOBI - Downgrade to Legacy Kindle Format',
    subtitle: 'Free AZW3 to MOBI converter. No sign-up — make DRM-free AZW3 files readable on older Kindle devices (pre-2011) in seconds.'
  },

  sections: [
    {
      heading: 'What is AZW3 Format?',
      body: `AZW3 — Amazon calls it Kindle Format 8, or KF8 — launched in 2011 alongside the Kindle Fire. It was Amazon's answer to a real problem: the old MOBI format was built on 1990s technology and couldn't handle modern book design.

Under the hood, AZW3 supports a meaningful subset of HTML5 and CSS3. That's what makes it capable of things MOBI simply can't do:

- **Embedded fonts** — a publisher's chosen typeface travels with the book
- **Real CSS styling** — drop caps, custom margins, styled blockquotes, colored text
- **Fixed-layout support** — needed for cookbooks, children's books, and comics
- **Better tables** — actual borders and cell styling instead of a rough approximation
- **Improved typography** — hyphenation, kerning, ligature control
- **Tighter compression** — files run roughly 20-40% smaller than the MOBI equivalent

Every Kindle sold since roughly late 2011 reads AZW3 natively, and it's what Amazon's own store delivers to modern devices. If you have a choice, AZW3 is the better format — no real argument there.

The one thing it can't do is run on hardware that predates it.`
    },
    {
      heading: 'What is MOBI Format?',
      body: `MOBI started life as the Mobipocket format in the early 2000s, built on an even older standard called PalmDOC. Amazon acquired Mobipocket in 2005 and made MOBI the foundation of the original Kindle.

It's a simple format, and that simplicity is both its weakness and its entire remaining value:

- **Basic HTML only** — a small subset, roughly what browsers supported in 1999
- **No embedded fonts** — you get whatever typefaces the device has
- **Minimal CSS** — most styling is ignored outright
- **No fixed layout** — everything reflows, always
- **Larger files** — the older compression is less efficient
- **Runs on literally every Kindle ever made** — including the 2007 original

Amazon officially stopped accepting MOBI uploads to Kindle Direct Publishing in 2021 and dropped MOBI from Send to Kindle in 2022. As a distribution format, it's finished.

But hardware outlives file formats. There are still working Kindle Keyboards, Kindle DXs, and Kindle 2s in daily use — devices that have never received a firmware update capable of reading AZW3. For those, MOBI isn't legacy. It's the only option.`
    },
    {
      heading: 'How to Convert AZW3 to MOBI',
      body: `**1. Upload your AZW3.** Drag the file in or browse for it. Free accounts handle files up to 10MB — most Kindle books are 1-5MB, so you'd need something unusually image-heavy to hit that.

**2. Conversion runs.** The AZW3 structure is parsed, HTML and CSS are simplified down to what MOBI's renderer understands, images are re-packaged, and navigation gets rebuilt. Usually done in under 30 seconds.

**3. Download and sideload.** Connect your old Kindle by USB, drop the .mobi into the \`documents\` folder, and eject safely. It'll show up on the home screen.

**Important: DRM will stop this cold.** Books purchased from the Kindle Store carry Amazon's DRM, and encrypted files can't be read by any converter — you'll get an error. This works on DRM-free AZW3 files: books you made yourself in Calibre or Kindle Create, titles from DRM-free publishers like Tor or Baen, Project Gutenberg downloads, and StoryBundle or Humble Bundle purchases.

Also note that USB sideloading is the only reliable delivery path here. Amazon's Send to Kindle no longer accepts MOBI, so emailing it won't work.`
    },
    {
      heading: 'When Do You Actually Need This?',
      body: `Honestly? Less often than you'd think. Check whether you really need it before converting.

**Your Kindle predates late 2011.** Kindle 1, Kindle 2, Kindle DX, Kindle DXG, and Kindle Keyboard (3rd gen) can't read AZW3. If you're holding one of these, MOBI is your format. Everything from the Kindle Touch and Paperwhite onward reads AZW3 fine.

**You're using an old third-party reader.** Some ancient e-ink devices and abandoned reading apps implemented MOBI support and never added KF8. Same situation.

**You're feeding software that only speaks MOBI.** A handful of old library management tools, text-analysis scripts, and conversion pipelines were written against MOBI and never updated.

**Someone specifically asked for MOBI.** A beta reader, a reviewer with an old device, a workflow requirement.

**You want maximum-compatibility archival copies.** If you're preserving a collection and can't predict what will read it in twenty years, MOBI's dead-simple structure is arguably more likely to remain parseable.

**If none of these apply, stay on AZW3.** It looks better, it's smaller, and every current Kindle handles it. Converting down means giving up quality for compatibility you don't need. If you're choosing between the two Kindle formats, our [AZW3 vs MOBI comparison](/blog/azw3-vs-mobi) breaks it down by device.`
    },
    {
      heading: 'Migrating a Whole Library to a Legacy Kindle',
      body: `Need to move an entire collection — not just one book — onto a pre-2011 Kindle? The per-file steps above still apply, but at library scale a few extra habits save you grief.

**1. Audit what you actually own.** Separate your DRM-free AZW3 files from anything bought on the Kindle Store. Only the DRM-free ones will convert; the rest stay locked no matter what tool you use. Calibre's library view makes this easy — sort by format and flag the encrypted ones.

**2. Convert in small batches.** Even with a Pro batch plan, keep runs to a dozen files or so. If one source file is corrupt, a small batch is far easier to re-run than a hundred-file job that failed halfway.

**3. Preserve your originals.** Keep the AZW3 files exactly as they are. MOBI is a one-way downgrade — once fonts and layout are stripped, you cannot get them back. The AZW3 stays as your master copy; the MOBI is just the legacy-readable copy.

**4. Name files for the device, not the author.** Old Kindles sort by filename and choke on long titles and special characters. A simple "Author - Title.mobi" pattern saves you from a home screen full of truncated, unreadable entries.

**5. Sideload once, verify, repeat.** Copy a batch to the documents folder, eject, and spot-check three or four books open correctly before trusting the rest. It takes two minutes and catches a bad export before you have committed to fifty.

The goal is not to make MOBI look good — it is to make a 2009 Kindle useful again without losing your modern master files in the process.`
    },

    {
      heading: 'What You Lose in the Downgrade',
      body: `Be clear-eyed about this. Going AZW3 → MOBI is a downgrade, and some things won't survive.

**Gone entirely:**

- **Embedded fonts** — the device substitutes its built-in typefaces
- **Fixed layouts** — cookbooks, children's books, and comics reflow into a mess
- **Most CSS styling** — drop caps, colored text, custom margins, styled boxes all flatten
- **Advanced tables** — complex tables degrade badly, sometimes into unreadable text runs

**Degraded but present:**

- **Table of contents** — becomes basic; nested chapter levels may collapse to one level
- **Images** — often downsampled to keep file size reasonable on old hardware
- **Footnotes** — pop-up notes on modern Kindles become plain inline links
- **Typography** — hyphenation and kerning refinements are dropped

**Unchanged:**

- **The actual text** — every word survives, nothing gets truncated
- **Chapter breaks** — structure holds even if the TOC styling simplifies
- **Basic emphasis** — bold and italic work fine
- **Metadata** — title and author carry over

And expect the file to get **bigger**, not smaller. MOBI's older compression is less efficient, so the same book typically gains 20-40% in size. Counterintuitive for a "downgrade," but that's what happens when you swap a modern container for a twenty-year-old one.

Going the other direction — freeing an old MOBI from Amazon's ecosystem so it reads on every device? [Convert MOBI to EPUB](/convert/mobi-to-epub) instead.`
    }
  ],

  faq: [
    { q: 'Should I use MOBI or AZW3?', a: 'Use AZW3 unless your Kindle was made before late 2011 — it gives you better typography, embedded fonts, and smaller files on every modern device. MOBI is only worth it for the Kindle 1, 2, DX, DXG, or Kindle Keyboard, which cannot read AZW3 at all.' },
    { q: 'Why is my MOBI file larger than the AZW3?', a: 'MOBI uses older, less efficient compression, so the same book typically grows 20-40% during conversion. It feels backwards for a downgrade, but you are moving content from a modern container into a twenty-year-old one.' },
    { q: 'My Kindle Store book will not convert — why?', a: 'Books bought from the Kindle Store carry Amazon DRM, and encrypted files cannot be read by any converter. The conversion works on DRM-free AZW3 files such as your own Calibre exports, Project Gutenberg titles, or purchases from DRM-free publishers.' },
    { q: 'Can I email the MOBI to my Kindle?', a: 'No — Amazon removed MOBI support from Send to Kindle in 2022, so email delivery will be rejected. Sideload it over USB by copying the file into the documents folder on your Kindle instead.' },
    { q: 'How many files can I convert at once?', a: 'Free accounts process one file at a time up to 10MB, which is well beyond what a typical Kindle book needs. Pro accounts add batch conversion, which is the practical choice if you are migrating a whole library to an older device.' },
    { q: 'How do I migrate my whole library to an old Kindle?', a: 'Convert your DRM-free AZW3 files in small batches of around a dozen, keep the original AZW3 as your master copy, name each .mobi as "Author - Title" so old devices sort it cleanly, and sideload over USB to the documents folder. Books from the Kindle Store will not convert because of DRM, so separate those out first.' }
  ]
};
