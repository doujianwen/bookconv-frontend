interface FAQ { question: string; answer: string }

export function generateDefaultFAQs(source: string, target: string): FAQ[] {
  return [
    {
      question: `Is ${source.toUpperCase()} to ${target.toUpperCase()} conversion free?`,
      answer: `Yes! Our ${source.toUpperCase()} to ${target.toUpperCase()} converter is completely free to use. No registration required, no watermarks, no hidden fees. Personal conversions are free; the single-file direct uploader supports up to 100 MB when enabled, while batch and fallback uploads are limited to 4 MB per file.`,
    },
    {
      question: `Will I lose formatting when converting from ${source.toUpperCase()} to ${target.toUpperCase()}?`,
      answer: `The conversion path depends on the format pair. Formatting support depends on the output format; plain TXT cannot retain fonts, images or layout. Text-only reconstruction can also lose images, styling and metadata due to differences between ${source.toUpperCase()} and ${target.toUpperCase()} format capabilities. Check the result in your target reader.`,
    },
    {
      question: "What is the file size limit?",
      answer: "Single-file direct uploads support up to 100 MB when enabled. Batch and fallback uploads accept up to 4 MB per file on every plan.",
    },
    {
      question: "Can I batch convert multiple files?",
      answer: "Batch conversion is free during public beta. Pro is listed at $5/month on the pricing page. Each file can be up to 4 MB: up to 20 files for EPUB to ZIP or TXT, and currently up to 3 files for conversions using the third-party service.",
    },
  ]
}
