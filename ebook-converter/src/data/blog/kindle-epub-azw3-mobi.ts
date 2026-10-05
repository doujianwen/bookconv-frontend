export const slug = "kindle-epub-azw3-mobi";
export const title = "Convert AZW3, EPUB & MOBI for Your Kindle: Step-by-Step";
export const date = "2026-08-26";
export const author = "BookConv Team";
export const tags = ["KINDLE", "AZW3", "EPUB", "MOBI", "SEND-TO-KINDLE", "EBOOK CONVERSION"];

export const content = {
  intro: `You already own a Kindle and you have a file — an EPUB from the library, a MOBI you downloaded years ago, or an AZW3 someone sent you. The question is not "which format is best in theory" but "what do I actually do to get this on my device and reading-ready?" This guide is the hands-on walkthrough: how Kindle handles each format, the two ways to deliver a file (Send-to-Kindle vs USB), and the free, no-install steps to convert EPUB or MOBI into the AZW3 your Kindle wants. For the broader "which format fits which device ecosystem" comparison, see our [Kindle & Kobo format guide](/blog/azw3-epub-mobi-kindle-compatibility).`,
  sections: [
    {
      heading: "Which Format Does Your Kindle Actually Want?",
      body: `Kindle e-ink readers (Paperwhite, Oasis, Basic, Scribe) speak **AZW3** natively. That is the format Amazon itself uses for Kindle Format 8, and it preserves your typography, fonts, and footnotes better than anything else.

**EPUB** is not read directly by Kindle e-ink devices. You can email it to Send-to-Kindle and Amazon's servers will convert it for you, but that automatic conversion often strips styling, drops images, or mangles tables. Converting to AZW3 yourself first gives you a far cleaner result.

**MOBI** still opens on older Kindles, but Amazon has deprecated it for new uploads. On a modern Kindle it renders with inconsistent spacing and no embedded fonts. Treat MOBI as a legacy input, not a target format.

Bottom line: aim for **AZW3** as the file that lands on your Kindle. EPUB and MOBI are sources you convert from, not formats you sideload as-is.`
    },
    {
      heading: "Send-to-Kindle: Email and the App (EPUB Auto-Converts)",
      body: `The easiest path for most people is Amazon's own delivery service.

**By email:** send the file as an attachment from your approved address to your Send-to-Kindle address (found under Manage Your Content and Devices). EPUB and MOBI attachments are accepted; Amazon converts EPUB to AZW3 on its servers and pushes the book to your library. PDF is accepted too but is not reflowable.

**By app or website:** the Send to Kindle app (desktop and mobile) and the right-click "Send to Kindle" option on Windows and Mac do the same conversion locally and upload directly.

**The catch:** server-side conversion is convenient but lossy. Complex layouts, sidebars, and images inside an EPUB frequently arrive simplified. If the book looks wrong after delivery, convert to AZW3 yourself before sending (next section) for full control.`
    },
    {
      heading: "USB Sideloading AZW3 the Right Way",
      body: `For maximum fidelity, skip the cloud and copy the file yourself.

1. Connect your Kindle to a computer with the USB cable.
2. It mounts as a drive. Open the **documents** folder.
3. Copy your **.azw3** file into documents. (AZW3, not EPUB or MOBI, for best results.)
4. Eject safely and open the book from your library.

USB sideloading bypasses Amazon's converter entirely, so whatever AZW3 you built is exactly what shows up. This is the method to use for books where layout matters — manuals, cookbooks, anything with tables or custom fonts. Note that sideloaded files do not sync progress to the cloud the way purchased books do, so keep that in mind if you read across devices.`
    },
    {
      heading: "Converting EPUB or MOBI to AZW3 for Free",
      body: `Two free routes, no subscription required.

**Online (fastest):** open BookConv, upload your EPUB or MOBI, pick **AZW3** as the output, and download. No install, no account. This is the quickest way to prep a library book or a downloaded file before USB sideloading it.

**Calibre (most control):** the free desktop app handles batch and fine-grained settings.
1. Add your source file (EPUB or MOBI).
2. Click "Convert books" and choose **AZW3** as the output format.
3. Under "Look & Feel" set fonts and margins; under "Structure Detection" confirm chapter breaks.
4. Click OK, then copy the resulting .azw3 to your Kindle via USB.

Either way, converting to AZW3 before it touches your Kindle avoids the stripped-styling problems of Send-to-Kindle's automatic EPUB conversion.`
    },
    {
      heading: "Kindle Model Notes: Paperwhite, Oasis, Basic, Fire",
      body: `All Kindle e-ink models read AZW3 identically well, so the format choice is the same everywhere. The differences are practical, not format-related:

- **Paperwhite / Oasis / Basic / Scribe:** AZW3 is the gold standard. EPUB must be converted first; MOBI opens but looks dated.
- **Kindle Fire (tablet):** runs Android, so it can side-load and read EPUB directly through a reader app. But if you want the book in your Kindle library alongside your other purchases, convert to AZW3 and use Send-to-Kindle like the e-ink models.
- **Older 2010s Kindles:** MOBI is the safest legacy bet there, since very old firmware predates AZW3. For any device from roughly 2017 onward, AZW3 wins.

When in doubt, AZW3 covers every current Kindle.`
    },
    {
      heading: "Troubleshooting: Won't Open, Broken Layout, Missing Fonts",
      body: `**Book won't open after sideloading.** You probably dropped an EPUB or MOBI onto an e-ink Kindle. Convert it to AZW3 and retry over USB.

**Layout looks broken or spacing is wrong.** The source was converted by Send-to-Kindle's server, which simplified it. Re-convert to AZW3 yourself with Calibre or BookConv for control over fonts and margins.

**Fonts missing.** MOBI strips embedded fonts; AZW3 and EPUB keep them. Convert to AZW3 and the typography returns.

**Images or tables vanished.** Often caused by complex EPUB structures the auto-converter flattened. Build the AZW3 locally from a clean source (DOCX or PDF to EPUB to AZW3) so images and tables survive.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **目标格式是 AZW3。** Kindle 电子墨水屏原生读 AZW3；EPUB 需先转，MOBI 是过时输入。
- **Send-to-Kindle 方便但会压缩。** 亚马逊服务器把 EPUB 自动转 AZW3 时常丢样式、图、表格；要求高保真就自己先转。
- **USB 侧载最保真。** 直接把 .azw3 拷进 documents 文件夹，绕过云端转换，排版原样呈现。
- **免费转换两条路。** BookConv 在线（无需安装）或 Calibre 桌面（可控最强），输出都选 AZW3。
- **所有现役 Kindle 都读 AZW3。** Paperwhite / Oasis / Basic / Scribe 一致；Fire 平板能直接读 EPUB，但进 Kindle 书库仍需 AZW3。`
    }
  ]
};

export const faqs = [
  {
    question: "Can I put an EPUB directly on a Kindle Paperwhite?",
    answer: "Not directly. Email it via Send-to-Kindle (Amazon converts it for you) or convert it to AZW3 first with a free tool like BookConv or Calibre, then sideload the AZW3 over USB. The e-ink Kindle will not open a raw EPUB file."
  },
  {
    question: "Is MOBI still usable on Kindle in 2026?",
    answer: "MOBI still opens on older Kindles, but Amazon deprecated it for new uploads and it renders with inconsistent spacing and no embedded fonts on modern devices. Convert MOBI to AZW3 for the best result."
  },
  {
    question: "What is the best free way to convert to AZW3?",
    answer: "BookConv converts EPUB or MOBI to AZW3 in the browser with no install or account. For batch jobs and fine control over fonts and margins, Calibre is the free desktop standard."
  },
  {
    question: "Does Send-to-Kindle keep my formatting?",
    answer: "It converts EPUB and MOBI on Amazon's servers, which is convenient but lossy. Complex layouts, images, and tables often arrive simplified. For full fidelity, convert to AZW3 yourself before sending."
  },
  {
    question: "Which Kindle models read AZW3?",
    answer: "All current Kindle e-ink models — Paperwhite, Oasis, Basic, and Scribe — read AZW3 natively and with the best quality. The Fire tablet can also read AZW3, and additionally opens EPUB through a reader app."
  }
];
