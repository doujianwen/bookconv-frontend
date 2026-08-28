export const slug = `epub-to-pdf-linux`;
export const title = `How to Convert EPUB to PDF on Linux (3 Methods)`;
export const date = `2026-08-01`;
export const author = "BookConv Team";
export const tags = ["EPUB", "PDF", "Linux", "Calibre", "CLI", "BookConv"];

export const content = {
  intro: `Converting an EPUB to PDF on Linux is a five-minute job once you know the three routes: Calibre's command line, Calibre's GUI, or a browser tab. This guide covers all three, plus the permission and font errors that trip up most Linux users and how to fix them.`,
  sections: [
    {
      heading: `Why Bother Converting on Linux`,
      body: `EPUB is great for reading and terrible for printing or sharing with someone who doesn't care about reflow. PDF gives you a fixed page — fonts, layout, and page numbers locked in place. That's what you want for a manuscript submission, a printout, a legal document, or anything heading to a printer.

Linux doesn't ship a native EPUB-to-PDF button, but the tooling is free and mature. Pick the method that matches how many files you have.`
    },
    {
      heading: `Method 1: Calibre on the Command Line`,
      body: `If Calibre is installed, the conversion is a single command:

\`ebook-convert book.epub book.pdf\`

That handles a standard novel with no fuss. For more control, the flags matter:
- \`--font-size 12\` — bump the base size if the output reads small
- \`--paper-size a4\` or \`letter\` — match your region
- \`--margin-top 36 --margin-bottom 36\` — measured in points, gives breathing room
- \`--pdf-page-numbers\` — print page numbers in the footer

Batch a folder with a one-liner loop:

\`for f in *.epub; do ebook-convert "$f" "\${f%.epub}.pdf"; done\`

The CLI is the fastest path when you're already in a terminal and have dozens of files.`
    },
    {
      heading: `Method 2: Calibre's GUI`,
      body: `Not everyone lives in the shell. Open Calibre, then:
1. Click **Add books** and pick your EPUB.
2. Select the title, then **Convert books**.
3. Set the output format dropdown (top-right) to **PDF**.
4. Open the **Page Setup** and **PDF Output** panels to set paper size and margins.
5. Click **OK** and wait for the job to finish, then **Save to disk** to pull the PDF out.

The GUI exposes the same options as the CLI, just with checkboxes instead of flags. Use it when you're converting one or two books and want to eyeball the settings.`
    },
    {
      heading: `Method 3: Convert in the Browser (No Install)`,
      body: `If you'd rather not install anything, [BookConv's EPUB to PDF converter](/convert/epub-to-pdf) runs the same Calibre engine server-side. Drag the file up, hit convert, download the PDF.

Reach for this when the Linux machine is a locked-down work laptop, a borrowed box, or a server you don't administer. It's also the easy answer on a Raspberry Pi or a Chromebook where Calibre isn't worth installing. The trade-off is a file-size limit and a temporary download link, so grab the PDF as soon as it's ready.`
    },
    {
      heading: `Fixing the Errors Linux Actually Throws`,
      body: `Three problems account for almost every failed Linux conversion.

**Permission denied** — Calibre installed via snap or flatpak sometimes can't read files outside its sandbox. Run from a directory you own, or grant the flatpak access with \`flatpak override --user com.calibre_ebook.calibre --filesystem=home\`. A plain binary install avoids the sandbox entirely.

**Missing fonts** — if the PDF shows boxes or a default serif where your EPUB had something custom, the font isn't on the system. Install it (\`sudo apt install fonts-dejavu\` for a safe default set, or drop the .ttf into \`~/.fonts\` and run \`fc-cache -f\`). Calibre only embeds fonts it can find.

**Wrong output size** — a PDF that comes out tiny or enormous is almost always a paper-size mismatch. Set \`--paper-size\` explicitly instead of trusting the default.`
    },
    {
      heading: `Which Method Should You Use`,
      body: `One file on a normal machine — the GUI. A folder of files or a script — the CLI. No install permission or a throwaway box — the browser converter. All three produce the same Calibre-based PDF, so the choice is purely about convenience.

Going the other way? [PDF to EPUB](/convert/pdf-to-epub) is the move when you need editable, reflowable text instead of a fixed page. And if your EPUB started life as a Word document, [EPUB to DOC](/convert/epub-to-doc) gets it back into an editor.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Three routes, one engine** — the Calibre CLI, the Calibre GUI, and BookConv's browser converter all produce the same PDF.
- **CLI for batches** — \`ebook-convert book.epub book.pdf\` plus a shell loop handles a whole folder.
- **Permission errors are a sandbox issue** — snap/flatpak Calibre can't see your files until you grant filesystem access.
- **Missing fonts mean missing glyphs** — install the font or add it to \`~/.fonts\` and run \`fc-cache -f\` before reconverting.
- **Set paper size explicitly** — a wrong-sized PDF is almost always a default mismatch, fixed with \`--paper-size\`.`
    }
  ]
};

export const faqs = [
  {
    question: `What's the command to convert EPUB to PDF on Linux?`,
    answer: `With Calibre installed, run \\\`ebook-convert book.epub book.pdf\\\` in a terminal. Add flags like \\\`--paper-size a4\\\` or \\\`--pdf-page-numbers\\\` for control over the output.`,
  },
  {
    question: `Why does my PDF have missing or wrong fonts on Linux?`,
    answer: `Calibre embeds only fonts present on the system. Install the missing font (or add it to \\\`~/.fonts\\\` and run \\\`fc-cache -f\\\`) and reconvert. Boxes or a fallback serif mean the glyph wasn't available.`,
  },
  {
    question: `Can I batch convert multiple EPUBs to PDF at once?`,
    answer: `Yes. Loop over the folder: \\\`for f in *.epub; do ebook-convert "$f" "\\\${f%.epub}.pdf"; done\\\`. Desktop Calibre's bulk conversion also handles large batches in a single job.`,
  },
  {
    question: `Do I need to install anything, or can I do it online?`,
    answer: `You don't need to install anything. BookConv's [EPUB to PDF converter](/convert/epub-to-pdf) runs in the browser and uses the same Calibre engine, which is handy on locked-down or borrowed machines.`,
  },
  {
    question: `Why is my output PDF the wrong page size?`,
    answer: `The default paper size didn't match your expectation. Pass \\\`--paper-size letter\\\` or \\\`--paper-size a4\\\` explicitly, or set it in Calibre's Page Setup panel, then reconvert.`,
  },
  {
    question: `Will converting EPUB to PDF keep my images and formatting?`,
    answer: `Images and basic layout carry over. But PDF is fixed-layout, so the text won't reflow or resize the way it does in an EPUB reader — that's the trade you're making for a printable page.`,
  }
];
