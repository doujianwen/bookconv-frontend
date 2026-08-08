import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { getLocale } from "@/i18n/utils";
import { BatchUpload } from "@/components/tools/BatchUpload";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const prefix = locale === "es" ? "/es" : "";
  const title = "Batch Ebook Converter — Convert Multiple Files at Once";
  const description =
    "Convert several ebooks to one format in a single batch on BookConv. Free during open beta — upload your files, get a ZIP of converted ebooks, no software install.";
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.bookconv.com${prefix}/batch`,
      languages: { en: "/batch", es: "/es/batch", "x-default": "/batch" },
    },
    openGraph: {
      title: title + " | BookConv",
      description,
      url: `https://www.bookconv.com${prefix}/batch`,
      type: "website",
    },
  };
}

const FAQ = [
  {
    q: "What is batch ebook conversion?",
    a: "Batch conversion lets you convert several ebook files to the same target format in one go. On BookConv you can upload several files per batch and download the results as a single ZIP.",
  },
  {
    q: "Is batch conversion free?",
    a: "Yes — batch conversion is free while BookConv is in open beta. Local formats (EPUB → ZIP, EPUB → TXT) accept up to 20 files per batch; other formats are limited to a few per batch because they rely on a metered conversion service. No paid plan is required to use batch mode.",
  },
  {
    q: "Which formats can I convert in a batch?",
    a: "The same formats as the single-file converter — EPUB, PDF, MOBI, AZW3, TXT, DOCX, RTF, FB2, DJVU and more. Every file in a batch is converted to the target format you pick.",
  },
  {
    q: "How does BookConv batch conversion work?",
    a: "BookConv converts each file through its conversion API and packages the results into a ZIP you download directly in your browser. There is no separate batch queue to wait on.",
  },
  {
    q: "What is the maximum file size per file?",
    a: "Each file in a batch can be up to 10 MB. Larger books are better handled one at a time, or with a desktop tool such as Calibre.",
  },
];

export default async function BatchPage() {
  const locale = await getLocale();
  const prefix = locale === "es" ? "/es" : "";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={prefix || "/"} className="hover:text-blue-600">Home</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">Batch Converter</li>
        </ol>
      </nav>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Batch Ebook Converter</h1>
        <p className="mt-4 text-lg text-gray-600">
          Convert several ebooks to one format and download them as a single ZIP — free while in open beta.
        </p>
      </div>

      {/* Free open beta banner */}
      <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-900">
            Batch conversion is <span className="font-semibold">free while in open beta</span>. Local formats (EPUB → ZIP, EPUB → TXT) accept up to 20 files; other formats use a metered third-party service, so they are limited to a few files per batch for now. Everything runs in your browser and downloads as one ZIP.
          </p>
        </div>
        <Link
          href={prefix + "/pricing"}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          See plan limits
        </Link>
      </div>

      {/* Converter */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <BatchUpload />
      </div>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details key={item.q} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
