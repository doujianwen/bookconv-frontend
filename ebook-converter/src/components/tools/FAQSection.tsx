interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  sourceFormat: string
  targetFormat: string
}

export function FAQSection({ faqs, sourceFormat, targetFormat }: FAQSectionProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
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
      answer: `Yes! Our ${source.toUpperCase()} to ${target.toUpperCase()} converter is completely free to use. No registration required, no watermarks, no hidden fees. Convert up to 5 files per hour for free.`,
    },
    {
      question: `Will I lose formatting when converting from ${source.toUpperCase()} to ${target.toUpperCase()}?`,
      answer: `Our converter uses the Calibre engine, which preserves most formatting including fonts, images, tables, and layout. However, some complex formatting may change slightly due to differences between ${source.toUpperCase()} and ${target.toUpperCase()} format capabilities. The result is optimized for readability on your target device.`,
    },
    {
      question: "Is my file secure?",
      answer: "Absolutely. All files are transferred over encrypted HTTPS connections. Your original file and converted file are automatically deleted from our servers within 1 hour. We do not read, store, or share your content.",
    },
    {
      question: "What is the file size limit?",
      answer: "Free users can convert files up to 10 MB. Pro users enjoy up to 50 MB per file and unlimited conversions.",
    },
    {
      question: "Can I batch convert multiple files?",
      answer: "Batch conversion is available with our Pro plan ($5/month). You can upload multiple files at once and convert them all in a single session, saving you time.",
    },
  ]
}
