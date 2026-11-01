import { BlogFaq } from '../blog/types'

export const slug = "azw3-vs-mobi"

export const title = "AZW3 vs MOBI: Which Kindle Format Should You Use?"

export const problem = "Choose a Kindle ebook format by delivery route: Send to Kindle, direct USB or KDP publishing. Compare AZW3, MOBI and EPUB without a blanket device-year rule."

export const date = "2026-09-10"

export const updatedAt = "2026-11-01"

export const tags = [
  "azw3",
  "mobi",
  "kindle",
  "ebook format",
  "comparison"
]

export const keyTakeaways = [
  "Choose the transfer route before converting.",
  "Use EPUB for Send to Kindle; check your device documentation for USB.",
  "A MOBI-to-AZW3 conversion cannot restore information absent from the source.",
  "Check the selected uploader and inspect one output before a batch."
]

export const formats = undefined

export const content = {
  "intro": "AZW3 vs MOBI is a practical delivery choice, not just a comparison of file extensions. The first question is whether you are using Send to Kindle, transferring over USB or preparing a manuscript for KDP. These workflows have different requirements.",
  "sections": [
    {
      "heading": "Which format should I use for my Kindle in 2026?",
      "body": "Start with how you will transfer the book, rather than a model-year cutoff. For Send to Kindle, choose EPUB. For a direct USB transfer, check the formats accepted by your exact Kindle model and firmware; AZW3 can be a useful option on compatible devices. Keep MOBI for a confirmed legacy requirement. Publishing a book is a separate workflow from sending a personal document.\n\nAn EPUB that works through Amazon's service does not establish that copying the same EPUB over USB will work. Likewise, a file that opens locally does not establish that Amazon accepts it as an upload. Decide the delivery route before converting."
    },
    {
      "heading": "AZW3 vs MOBI vs EPUB: choose by task",
      "body": "| Your task | Starting choice | Check before proceeding |\n|---|---|---|\n| Send a personal book through Send to Kindle | EPUB | Amazon's current supported upload list |\n| Copy a book directly over USB | A format listed for your device, potentially AZW3 | Exact model, firmware and transfer procedure |\n| Keep an existing MOBI library | Retain an original copy | Whether the receiving reader accepts that file |\n| Publish through KDP | EPUB, DOCX or KPF as appropriate | KDP manuscript specifications and preview |\n\nAZW3 is commonly associated with KF8; MOBI is a legacy file label and can contain different variants. Do not assume that every .mobi has identical formatting capabilities. See [Calibre's format notes](https://manual.calibre-ebook.com/faq.html) for the distinction between MOBI variants."
    },
    {
      "heading": "Does Kindle still support MOBI in 2026?",
      "body": "Support depends on the channel. Amazon's current [Send to Kindle file list](https://digprjsurvey.amazon.co.uk/csad/help/node/G5WYD9SAF7PGXRNA) includes EPUB and does not list MOBI or AZW3. That upload list is separate from the formats an existing device may read locally. Check its manual before replacing a working library.\n\nFor publishing, [KDP's MOBI policy](https://kdp.amazon.com/en_US/help/topic/GULSQMHU5MNH4EZM) says its transition away from MOBI uploads is complete. Use the accepted manuscript formats for a new publication or update. Neither rule means you should delete your existing files or convert an entire library without testing one book first."
    },
    {
      "heading": "Is AZW3 better than MOBI?",
      "body": "For a compatible local reader, AZW3 can preserve styling that an older MOBI variant cannot represent. That does not guarantee a better result for every book: source structure, embedded assets and conversion settings matter.\n\nKeep the best original file. If fonts or layout were already lost, converting the remaining MOBI to AZW3 does not reconstruct those assets. Preview chapter order, navigation, images and a few representative pages before replacing the original. A format comparison should help you complete a reading task, rather than promise identical rendering on every device."
    },
    {
      "heading": "How to convert MOBI to AZW3 or EPUB",
      "body": "For a DRM-free file you are entitled to convert, choose the target that matches your delivery route:\n\n- [MOBI to AZW3](/convert/mobi-to-azw3) for a compatible local reading workflow.\n- [MOBI to EPUB](/convert/mobi-to-epub) when EPUB is required by the next service or reader.\n- [EPUB to AZW3](/convert/epub-to-azw3) for a device-specific local file.\n\nSelect the format pair, check the uploader's displayed limits, upload, convert, download and inspect the output. A format extension alone does not prove that a file is DRM-free or structurally valid. Keep the input until the result has opened successfully. Calibre is an alternative when you need an offline workflow or more conversion controls."
    },
    {
      "heading": "BookConv limits, privacy and output checks",
      "body": "BookConv processes conversions server-side. Transfers use HTTPS; see the [privacy policy](/privacy) for file-handling details. For sensitive manuscripts, prefer an offline workflow.\n\nEnabled single-file direct uploads accept up to 100 MB; batch and fallback routes are limited to 4 MB per file. Batch is free during public beta, with up to 20 EPUB-to-ZIP/TXT files or currently 3 files using the third-party service. Check the selected uploader rather than applying one cap to every route.\n\nTest one file before a larger job. A successful download is only the first check: open it in the intended reader and inspect navigation and formatting. This guide does not promise DRM removal, automatic OCR or identical output across devices."
    }
  ]
}

export const faqs: BlogFaq[] = [
  {
    "question": "Which Kindle format should I use in 2026?",
    "answer": "Choose by delivery route: EPUB for Send to Kindle; a format supported by your exact device for USB. Use the current KDP manuscript requirements for publishing."
  },
  {
    "question": "Can I send AZW3 or MOBI through Send to Kindle?",
    "answer": "They are not listed in Amazon’s current Send to Kindle supported upload formats. Use EPUB for that workflow; local device support is a separate question."
  },
  {
    "question": "Does every Kindle made before 2015 need MOBI?",
    "answer": "No fixed year cutoff is reliable for every model and firmware. Check the device documentation and test one file before converting a whole library."
  },
  {
    "question": "Will converting MOBI to AZW3 restore lost fonts?",
    "answer": "No. Conversion cannot reconstruct fonts, images or layout information that is absent from the source. Start from the best original file available."
  },
  {
    "question": "Can I convert MOBI to EPUB or AZW3 with BookConv?",
    "answer": "BookConv provides both format-pair tools for supported DRM-free inputs. Check the selected uploader’s limits and inspect the downloaded result on your intended reader."
  },
  {
    "question": "What should I upload to KDP?",
    "answer": "KDP recommends accepted manuscript formats such as EPUB, DOCX and KPF depending on the book. Its MOBI upload policy differs from local-device reading support."
  }
]

export const authorship = {
  "author": "BookConv Team",
  "lastVerified": "2026-11-01",
  "credentials": "Official format documentation and current BookConv upload rules reviewed; no independent performance benchmark claimed."
}
