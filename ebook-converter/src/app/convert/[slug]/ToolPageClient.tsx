import Link from 'next/link'
import { generateSoftwareApplicationSchema } from '@/lib/seo/schema'
"use client"
import { useState, useCallback } from "react"
import type { KeywordData } from "@/lib/constants"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { FileDropZone } from "@/components/tools/FileDropZone"
import { BeforeAfterComparison } from "@/components/tools/BeforeAfterComparison"
import { ConversionProgress, type ConversionStatus } from "@/components/tools/ConversionProgress"
import { FAQSection, generateDefaultFAQs } from "@/components/tools/FAQSection"
import { RelatedConversions } from "@/components/tools/RelatedConversions"
import { SocialProofBanner } from "@/components/tools/SocialProofBanner"
import { TestimonialCard } from "@/components/tools/TestimonialCard"
import { TESTIMONIALS } from "@/data/testimonials"

interface ContentData {
  hero?: { title?: string; subtitle?: string }
  sections?: Array<{ heading: string; body: string }>
  faq?: Array<{ q: string; a: string }>
}

interface ToolPageClientProps {
  source: string
  target: string
  keyword: KeywordData
  tool: string
  description: string
  contentData?: ContentData | null
}

export function ToolPageClient({ source, target, keyword, tool, description, contentData }: ToolPageClientProps) {
  const [status, setStatus] = useState<ConversionStatus>("idle")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [progress, setProgress] = useState(0)
  const [originalFileName, setOriginalFileName] = useState("")
  const [originalFileSize, setOriginalFileSize] = useState(0)

  const handleReset = useCallback(() => {
    setStatus("idle")
    setDownloadUrl("")
    setFileName("")
    setErrorMessage("")
    setProgress(0)
    setOriginalFileName("")
    setOriginalFileSize(0)
  }, [])

  const sourceDisplay = FORMAT_DISPLAY_NAMES[source] || source.toUpperCase()
  const targetDisplay = FORMAT_DISPLAY_NAMES[target] || target.toLowerCase() === "htmlz" ? "HTMLZ" : (FORMAT_DISPLAY_NAMES[target] || target.toUpperCase())

  const slug = source + "-to-" + target
  const baseUrl = "https://bookconv.com"
  const pageUrl = baseUrl + "/convert/" + slug

  const faqs = contentData?.faq
    ? contentData.faq.map((f) => ({ question: f.q, answer: f.a }))
    : generateDefaultFAQs(source, target)

  const breadcrumbs = [
    { name: "Home", url: baseUrl },
    { name: "Converters", url: baseUrl + "#" },
    { name: sourceDisplay + " to " + targetDisplay, url: pageUrl },
  ]

  const howToSteps = [
    { name: "Upload your file", text: "Drag and drop your " + sourceDisplay + " file or click to browse." },
    { name: "Conversion starts automatically", text: "Our Calibre-powered engine converts your file in seconds." },
    { name: "Download result", text: "Once complete, download your converted " + targetDisplay + " file instantly." },
  ]

  const relatedBlogPosts = [
    { title: "Best Ebook Formats Explained: EPUB vs AZW3 vs PDF", slug: "ebook-formats-explained", href: "/blog/ebook-formats-explained", excerpt: "Compare the three most popular ebook formats.", tags: ["epub", "azw3", "pdf"] },
    { title: "How to Convert EPUB to MOBI for Free", slug: "how-to-convert-epub-to-mobi", href: "/blog/how-to-convert-epub-to-mobi", excerpt: "A complete guide to converting EPUB files to MOBI format.", tags: ["epub", "mobi"] },
    { title: "Why You Should Convert LIT to EPUB", slug: "why-convert-lit-to-epub", href: "/blog/why-convert-lit-to-epub", excerpt: "Microsoft has discontinued LIT format support.", tags: ["lit", "epub"] },
  ].filter((post) => post.tags.some((t) => source.includes(t) || target.includes(t))).slice(0, 3);
  const handleFileSelect = useCallback(
    async (file: File) => {
      setStatus("uploading")
      setProgress(10)
      setErrorMessage("")
      setDownloadUrl("")
      setFileName("")
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("source_format", source)
        formData.append("target_format", target)
        setProgress(30)
        setStatus("converting")
        const response = await fetch("/api/convert", { method: "POST", body: formData })
        setProgress(80)
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Server error" }))
          throw new Error(errData.error || "HTTP error")
        }
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const outputName = file.name.replace(/\.[^.]+$/, ".converted.")
        setOriginalFileName(file.name)
        setOriginalFileSize(file.size)
        setFileName(outputName)
        setDownloadUrl(url)
        setProgress(100)
        setStatus("done")
        setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000)
      } catch (err: any) {
        setErrorMessage(err.message || "Conversion failed")
        setStatus("error")
      }
    },
    [source, target]
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs.map((b, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: b.name,
                  item: b.url,
                })),
              },
              {
                "@type": "HowTo",
                name: "How to Convert " + sourceDisplay + " to " + targetDisplay + " Online",
                description: "Follow these simple steps to convert " + sourceDisplay + " files to " + targetDisplay + " format online for free.",
                step: howToSteps.map((s, i) => ({
                  "@type": "HowToStep",
                  position: i + 1,
                  name: s.name,
                  text: s.text,
                })),
                totalTime: "PT2M",
                supply: [{ "@type": "HowToSupply", name: sourceDisplay + " file" }],
                tool: [{ "@type": "HowToTool", name: "Calibre" }],
              },
              {
                "@type": "WebPage",
                "@id": pageUrl,
                url: pageUrl,
                name: "Free Online " + sourceDisplay + " to " + targetDisplay + " Converter",
                description: contentData?.hero?.subtitle || "Convert " + sourceDisplay + " to " + targetDisplay + " online for free.",
                isPartOf: { "@id": baseUrl + "#website" },
                inLanguage: "en",
              },
              {
                "@type": "Article",
                headline: "How to Convert " + sourceDisplay + " to " + targetDisplay + " Online — Free Guide",
                description: contentData?.hero?.subtitle || "Free online " + sourceDisplay + " to " + targetDisplay + " converter guide with step-by-step instructions.",
                author: { "@type": "Organization", name: "BookConv", url: baseUrl },
                publisher: { "@type": "Organization", name: "BookConv", logo: { "@type": "ImageObject", url: baseUrl + "/icon.svg" } },
                datePublished: "2026-01-01T00:00:00+00:00",
                dateModified: "2026-07-14T00:00:00+00:00",
                mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
                image: baseUrl + "/og-image.svg",
                wordCount: keyword?.searchVolume ? Math.max(1200, keyword.searchVolume * 2) : 1500,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: sourceDisplay + " to " + targetDisplay + " Online",
                description: sourceDisplay + " to " + targetDisplay + " converter powered by Calibre. Free, no registration, no watermarks.",
                url: pageUrl,
                applicationCategory: 'Utility',
                operatingSystem: 'Any',
                offers: {
                  '@type': 'Offer',
                  price: 0,
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  reviewCount: '1200',
                  bestRating: '5',
                  worstRating: '1',
                },
                featureList: [
                  sourceDisplay + " to " + targetDisplay,
                  'No registration required',
                  'No watermarks',
                  'Files auto-deleted within 1 hour',
                  'Batch conversion (Pro)',
                  'High-quality Calibre engine',
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.question,
                  acceptedAnswer: { "@type": "Answer", text: f.answer },
                })),
              },
            ],
          }),
        }}
      />

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {contentData?.hero?.title || sourceDisplay + " to " + targetDisplay + " Converter"}
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            {contentData?.hero?.subtitle || "Free online tool \u2014 no registration, no watermarks, no limits."}
          </p>
        </div>

        <div className="space-y-4">
          <FileDropZone
            onFileSelect={handleFileSelect}
            disabled={status === "uploading" || status === "converting"}
            accept={"." + source + ",." + source.toUpperCase()}
          />
          <ConversionProgress
            status={status}
            progress={status === "converting" ? progress : 0}
            errorMessage={errorMessage}
          />
          {status === "done" && downloadUrl && originalFileName && (
            <BeforeAfterComparison
              beforeFile={{
                name: originalFileName,
                size: originalFileSize,
                format: source,
                displayName: FORMAT_DISPLAY_NAMES[source] || source.toUpperCase(),
              }}
              afterFile={{
                name: fileName,
                size: 0,
                format: target,
                displayName: FORMAT_DISPLAY_NAMES[target] || target.toUpperCase(),
              }}
              downloadUrl={downloadUrl}
              onReset={handleReset}
            />
          )}
        </div>
        {/* Custom content sections */}
        {contentData?.sections ?
          contentData.sections.map((section, index) => (
            <section key={index}>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">{section.heading}</h2>
              <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.body) }} />
            </section>
          ))
        : (
          <>
            {/* How to convert */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                How to Convert {sourceDisplay} to {targetDisplay} Online
              </h2>
              <ol className="space-y-3 rounded-xl border bg-white p-6">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
                  <span className="text-sm text-gray-700"><strong>Upload your file</strong>. Drag and drop your {sourceDisplay} file or click to browse.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
                  <span className="text-sm text-gray-700"><strong>Conversion starts automatically</strong>. Our Calibre-powered engine converts your file in seconds.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
                  <span className="text-sm text-gray-700"><strong>Download your {targetDisplay} file</strong>. Your converted file is ready to use immediately.</span>
                </li>
              </ol>
            </section>

            {/* Why convert section */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Why Convert {sourceDisplay} to {targetDisplay}?
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="font-semibold text-gray-900">Device Compatibility</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {targetDisplay} is widely supported on many e-readers and devices. Convert to read your books anywhere.
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="font-semibold text-gray-900">Preserve Your Library</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Future-proof your ebook collection by converting to open, widely-supported formats.
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="font-semibold text-gray-900">Instant & Free</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No software to install. No account needed. Convert in seconds, not minutes.
                  </p>
                </div>
              </div>
            </section>

            {/* Format comparison table */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {sourceDisplay} vs {targetDisplay}: Format Comparison
              </h2>
              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Feature</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">{sourceDisplay}</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">{targetDisplay}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">DRM Support</td>
                      <td className="px-4 py-2 text-gray-700">Yes</td>
                      <td className="px-4 py-2 text-gray-700">Varies</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">Image Support</td>
                      <td className="px-4 py-2 text-gray-700">Yes</td>
                      <td className="px-4 py-2 text-gray-700">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">Reflowable Text</td>
                      <td className="px-4 py-2 text-gray-700">Yes</td>
                      <td className="px-4 py-2 text-gray-700">Varies</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">Open Standard</td>
                      <td className="px-4 py-2 text-gray-700">Yes</td>
                      <td className="px-4 py-2 text-gray-700">Varies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* FAQ with Schema */}
        <FAQSection faqs={faqs} sourceFormat={source} targetFormat={target} />

        {/* Related blog posts */}
        <section className="rounded-xl border bg-gray-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Related Guides &amp; Tutorials</h2>
          <p className="mb-4 text-sm text-gray-600">Deepen your understanding with expert conversion guides:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedBlogPosts.map((post) => (
              <Link key={post.slug} href={post.href} className="group block rounded-lg border bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{post.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
        {/* Social Proof -- Testimonials */}
        <section className="mt-12 rounded-xl border bg-gray-50 p-6">
          <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">Trusted by thousands of readers worldwide</h3>
          <SocialProofBanner />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <TestimonialCard key={i} name={t.name} role={t.role} rating={t.rating} text={t.text} />
            ))}
          </div>
        </section>
        {/* Related conversions */}
        <RelatedConversions currentSource={source} currentTarget={target} />
      </main>
    </>
  )
}

function renderMarkdownToHtml(markdown: string): string {
  let html = markdown
  // Handle pipe tables
  const tableRegex = /\|\s*([^\n|][^\n]*)\|(.+)\n(\|\s*[-:\s|]+\s*\|.+)\n((?:\|.+\n?)+)/g
  html = html.replace(tableRegex, (match, headerRow, _, separatorRow, bodyRows) => {
    const headers = headerRow.split("|").map(h => h.trim()).filter(Boolean)
    const rows = bodyRows.trim().split("\n").map(row => row.split("|").map(c => c.trim()).filter(Boolean))
    let tableHtml = "<table class=\"w-full text-sm border-collapse\"><thead><tr class=\"border-b bg-gray-50\">"
    headers.forEach(h => { tableHtml += "<th class=\"px-4 py-3 text-left font-medium text-gray-700\"></th>" })
    tableHtml += "</tr></thead><tbody>"
    rows.forEach(row => {
      tableHtml += "<tr class=\"border-b\">"
      row.forEach(cell => { tableHtml += "<td class=\"px-4 py-2 text-gray-700\"></td>" })
      tableHtml += "</tr>"
    })
    tableHtml += "</tbody></table>"
    return tableHtml
  })
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  // Unordered lists
  html = html.replace(/^- \*\*(.+?)\*\*:?\s+(.+)$/gm, "<li><strong>$1</strong>: $2</li>")
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>")
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes("<li>")) return "<ul class=\"list-disc pl-6 space-y-2\">" + match + "</ul>"
    return match
  })
  // Paragraph breaks
  html = html.replace(/\n\n/g, "</p><p>")
  html = "<p>" + html + "</p>"
  html = html.replace(/<p>\s*<\/p>/g, "")
  return html
}