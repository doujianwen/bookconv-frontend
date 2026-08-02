import type { Metadata } from "next"
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "BookConv -- Free Online Ebook Format Converter | Convert EPUB, MOBI, AZW3, PDF",
    description: "Free online ebook converter supporting 28+ formats: EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF. No registration, no watermarks, no limits.",
    keywords: [
      "ebook converter", "epub to mobi", "pdf to epub", "azw3 converter",
      "free ebook conversion", "online file converter", "lit to epub",
      "fb2 to epub", "docx to epub", "calibre online", "kindle format converter",
      "ebook format conversion", "epub to pdf", "mobi to epub", "txt to epub"
    ],
    alternates: {
      canonical: "https://www.bookconv.com",
    },
    openGraph: {
      title: "BookConv -- Free Online Ebook Format Converter",
      description: "Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly. No registration required.",
      url: "https://www.bookconv.com",
      type: "website",
      siteName: "BookConv",
      images: [
        {
          url: "https://www.bookconv.com/og-image.svg",
          width: 1200,
          height: 630,
          alt: "BookConv -- Free Online Ebook Format Converter",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "BookConv -- Free Online Ebook Format Converter",
      description: "Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.",
      images: ["https://www.bookconv.com/og-image.svg"],
    },
  }
}