import { chrome } from "@/lib/ui-chrome"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  sourceFormat: string
  targetFormat: string
  /** M5-6：西语页 chrome 本地化开关 */
  isEs?: boolean
}

export function FAQSection({ faqs, isEs = false }: FAQSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{chrome('faq', isEs)}</h2>
      <div className="divide-y rounded-xl border bg-white">
        {faqs.map((faq, i) => (
          <details key={i} className="group p-4">
            <summary className="cursor-pointer font-medium text-gray-900 group-open:text-blue-600">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function generateDefaultFAQs(source: string, target: string): FAQ[] {
  return [
    {
      question: `Is ${source.toUpperCase()} to ${target.toUpperCase()} conversion free?`,
      answer: `Yes! Our ${source.toUpperCase()} to ${target.toUpperCase()} converter is completely free to use. No registration required, no watermarks, no hidden fees. Personal conversions are free; the single-file direct uploader supports up to 100 MB when enabled, while batch and fallback uploads are limited to 4 MB per file.`,
    },
    {
      question: `Will I lose formatting when converting from ${source.toUpperCase()} to ${target.toUpperCase()}?`,
      answer: `The conversion path depends on the format pair. Formatting support depends on the output format; plain TXT cannot retain fonts, images or layout. However, some complex formatting may change slightly due to differences between ${source.toUpperCase()} and ${target.toUpperCase()} format capabilities. The result is optimized for readability on your target device.`,
    },
    {
      question: "What is the file size limit?",
      answer: "Single-file direct uploads support up to 100 MB when enabled. Batch and fallback uploads accept up to 4 MB per file on every plan.",
    },
    {
      question: "Can I batch convert multiple files?",
      answer: "Batch conversion is free during public beta, with Pro planned after beta. Each file can be up to 4 MB: up to 20 files for EPUB to ZIP or TXT, and currently up to 3 files for conversions using the third-party service.",
    },
  ]
}
