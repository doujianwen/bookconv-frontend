export const slug = `batch-converter`;
export const title = `Batch Ebook Converter: How to Convert Many Files at Once (and When to Use Calibre)`;
export const date = `2026-08-09`;
export const author = "BookConv Team";
export const tags = ["Batch Conversion", "Calibre", "Ebook Formats", "BookConv", "Workflow"];

export const content = {
  intro: `One book is a one-click job. Twenty books is a workflow. When you need to move a whole shelf from one format to another — a Calibre library export, a box of old PDFs, a stack of MOBI files from a retired Kindle — you want batch conversion, not twenty round trips through a single-file form. This guide covers how batch ebook conversion works, where the limits are, and when desktop Calibre still earns its keep.`,
  sections: [
    {
      heading: `What Counts as Batch Conversion?`,
      body: `Batch conversion means feeding the converter many files in one pass and getting many outputs back, ideally as a single download. The point is to remove the repetitive click-per-file overhead. Typical triggers:

- Migrating a Calibre library from MOBI to EPUB so it reads on a Kobo
- Turning a folder of scanned PDFs into reflowable EPUB for a phone
- Converting a shelf of EPUB to AZW3 before a move to a modern Kindle
- Freeing a retired Kindle's MOBI books so they open anywhere

Any job with more than a handful of files is a batch job in spirit, even if the tool processes them sequentially behind the scenes.`
    },
    {
      heading: `How Browser Batch Conversion Works`,
      body: `A browser-based batch converter takes your files, processes them (usually two at a time to stay responsive), and packages the results into one ZIP you download at the end. You do not install anything and you do not babysit each file.

On BookConv, the [batch converter guide](/guide/batch-converter) walks through the exact UI: drag in up to 20 files, pick one output format for all of them, and grab a single ZIP when it finishes. That ceiling exists for a reason — see the limits section below.`
    },
    {
      heading: `Practical Limits You Should Know`,
      body: `Batch is convenient, but it is not unlimited:

- **File count** — keep a batch to a sane size (BookConv caps it at 20 files per run). Beyond that, split into multiple batches.
- **Per-file size** — very large books (hundreds of images, embedded fonts) take longer and can hit size ceilings; a single heavy PDF can slow the whole batch.
- **One format per batch** — you pick the target format once for all files. If you need EPUB for some and AZW3 for others, run two batches.
- **Same-direction jobs only** — a batch converts many files from format A to format B. Mixed source formats are fine; mixed targets are not.

These limits are about keeping the queue fast and the download manageable, not about restricting what you can do.`
    },
    {
      heading: `When Desktop Calibre Is Still the Better Tool`,
      body: `Browser batch conversion wins for occasional, moderate jobs. Desktop Calibre still wins when:

- You convert **hundreds of files** on a schedule and want a saved library and presets
- You need **per-book tweaks** — different metadata, cover rules, or output profiles per title
- You are **offline** and the files never leave your machine
- You want **plugin pipelines** (DeDRM aside, the legal ones) that a web tool does not run

The honest call: for up to a few dozen books, the browser is faster to start and needs no setup. For a permanent, automated library workflow, Calibre on desktop is the long-term home. Both use the same Calibre engine under the hood, so output quality is consistent.`
    },
    {
      heading: `A Simple Batch Workflow`,
      body: `A reliable pattern for a shelf migration:

1. **Gather the source files** in one folder and confirm they are DRM-free (converters reject DRM files on upload).
2. **Pick the target format** by destination device — EPUB for Kobo/Apple Books, AZW3 for modern Kindles, PDF only when you need a fixed layout.
3. **Run the batch** in the browser converter, or in Calibre if the count is large.
4. **Spot-check three outputs** — open one on the target device before trusting the whole batch.
5. **Keep the originals** until you have confirmed the converted files read correctly.

For the destination-specific format choice, [Ebook Formats Explained](/blog/ebook-formats-explained) maps each format to the readers that want it.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Batch conversion removes click-per-file overhead** — feed many files, get one ZIP.
- **Browser batch wins for occasional jobs** up to ~20 files; no install, no setup.
- **Desktop Calibre wins for hundreds of files**, saved presets, offline work, and plugin pipelines.
- **One target format per batch** — split mixed destinations into separate runs.
- **Always spot-check before trusting the batch**, and keep originals until outputs are confirmed.`
    }
  ]
};

export const faqs = [
  {
    question: `How do I convert multiple ebooks at once?`,
    answer: `Use a batch converter: upload all the files in one pass, pick a single output format, and download the results as one ZIP. BookConv's [batch converter guide](/guide/batch-converter) shows the exact steps for up to 20 files per run. For hundreds of files, desktop Calibre with saved presets is the better long-term tool.`,
  },
  {
    question: `What is the file limit for batch conversion?`,
    answer: `A practical batch stays at a sane size — BookConv caps each run at 20 files so the queue stays fast and the download stays manageable. If you have more, split them into multiple batches. Very large individual books can also slow a batch, so keep files reasonable.`,
  },
  {
    question: `Should I use a browser batch converter or desktop Calibre?`,
    answer: `For occasional jobs of a few dozen files, the browser converter is faster to start and needs no install. For a permanent library workflow with hundreds of files, saved metadata rules, and offline processing, desktop Calibre is the better home. Both use the same Calibre engine, so output quality matches.`,
  },
  {
    question: `Can a batch mix source formats?`,
    answer: `Yes. A batch can take mixed inputs — say PDFs and EPUBs together — and convert them all to one target format. What you cannot mix is the target: you pick a single output format for the whole batch, so split different destinations into separate runs.`,
  },
  {
    question: `Do batch converters handle DRM-protected files?`,
    answer: `No. Converters reject DRM-protected files on upload, including books from retailer libraries that carry usage restrictions. Batch conversion only works on DRM-free files you own. Confirm your source files are DRM-free before starting a batch.`,
  }
];
