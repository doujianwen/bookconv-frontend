'use client'
import Link from 'next/link'
import { useState, useCallback } from "react"
import type { KeywordData } from "@/lib/constants"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import type { RelatedPostRef } from "@/lib/internal-links"
import { FileDropZone } from "@/components/tools/FileDropZone"
import { BeforeAfterComparison } from "@/components/tools/BeforeAfterComparison"
import { ConversionProgress, type ConversionStatus } from "@/components/tools/ConversionProgress"
import type { ErrorCode } from "@/lib/error-handler"
import { FAQSection, generateDefaultFAQs } from "@/components/tools/FAQSection"
import { RelatedConversions } from "@/components/tools/RelatedConversions"
import { SocialProofBanner } from "@/components/tools/SocialProofBanner"
import { TestimonialCard } from "@/components/tools/TestimonialCard"
import { TESTIMONIALS } from "@/data/testimonials"
import { BatchConversionGuide } from "@/components/tools/BatchConversionGuide"
import { VideoTutorial } from "@/components/tools/VideoTutorial"
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
  relatedBlogPosts?: RelatedPostRef[]
}



const VIDEO_TUTORIALS: Record<string, { videoUrl: string; thumbnailUrl?: string; title: string; description?: string; steps?: Array<{ title: string; description: string }> }> = {
  'lit-to-epub': {
    videoUrl: '/videos/lit-to-epub.mp4',
    title: 'How to Convert LIT to EPUB',
    description: 'Step-by-step guide to converting Microsoft LIT ebooks to universal EPUB format.',
    steps: [
      { title: 'Upload LIT file', description: 'Drag and drop your LIT file or click to browse.' },
      { title: 'Select EPUB output', description: 'Choose EPUB as the target format.' },
      { title: 'Wait for conversion', description: 'Conversion typically takes just a few seconds.' },
      { title: 'Download result', description: 'Click the button to download your converted EPUB file.' },
    ],
  },
  'pdf-to-epub': {
    videoUrl: '/videos/pdf-to-epub.mp4',
    title: 'PDF to EPUB: Preserve Layout & TOC',
    description: 'Learn how to convert PDFs into reflowable EPUB format for the best reading experience.',
    steps: [
      { title: 'Upload PDF', description: 'Supports scanned and text-based PDFs.' },
      { title: 'Select EPUB format', description: 'System auto-optimizes layout.' },
      { title: 'Preview and download', description: 'Download immediately after conversion.' },
    ],
  },
  'epub-to-txt': {
    videoUrl: '/videos/epub-to-txt.mp4',
    title: 'Extract Pure Text from EPUB',
    description: 'Convert EPUB ebooks to clean plain text, removing all formatting.',
    steps: [
      { title: 'Upload EPUB', description: 'Supports any size EPUB file.' },
      { title: 'Select TXT format', description: 'Extract pure text content.' },
      { title: 'Download text file', description: 'Get a clean .txt file.' },
    ],
  },
}

export function ToolPageClient({ source, target, keyword, tool, description, contentData, relatedBlogPosts }: ToolPageClientProps) {
  const [status, setStatus] = useState<ConversionStatus>("idle")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [errorCode, setErrorCode] = useState<ErrorCode | undefined>()
  const [progress, setProgress] = useState(0)
  const [originalFileName, setOriginalFileName] = useState("")
  const [originalFileSize, setOriginalFileSize] = useState(0)
  const handleReset = useCallback(() => {
    setStatus("idle")
    setDownloadUrl("")
    setFileName("")
    setErrorMessage("")
    setErrorCode(undefined)
    setProgress(0)
    setOriginalFileName("")
    setOriginalFileSize(0)
  }, [])
  const sourceDisplay = FORMAT_DISPLAY_NAMES[source] || source.toUpperCase()
  const targetDisplay = FORMAT_DISPLAY_NAMES[target] || (target.toLowerCase() === "htmlz" ? "HTMLZ" : target.toUpperCase())
  const slug = source + "-to-" + target
  const faqs = contentData?.faq
    ? contentData.faq.map((f) => ({ question: f.q, answer: f.a }))
    : generateDefaultFAQs(source, target)
  // Look up video tutorial for this conversion
  const videoTutorial = VIDEO_TUTORIALS[slug] || null
  const handleFileSelect = useCallback(
    async (file: File) => {
      setStatus("uploading")
      setProgress(10)
      setErrorMessage("")
      setErrorCode(undefined)
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
        setProgress(40)
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Server error", code: "CONVERSION_FAILED" }))
          const errorMsg = typeof errData?.error === 'string' ? errData.error : String(errData?.error || "Server error")
          throw new Error(errorMsg, { cause: errData })
        }
        // Synchronous mode: response is the converted file blob directly
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
        // Extract error code and friendly message from response data if available
        const cause = err.cause as { errorCode?: string; code?: string } | undefined
        const rawCode = cause?.errorCode || cause?.code
        const mappedCode = rawCode && !/^(FILE_NOT_FOUND|PERMISSION_DENIED|CONVERSION_TIMEOUT|TOO_MANY_OPEN_FILES|DRM_PROTECTED|CONVERSION_FAILED|INTERNAL_ERROR|CORRUPT_INPUT|MEMORY_LIMIT)$/.test(rawCode)
          ? undefined
          : (rawCode as ErrorCode | undefined)
        setErrorCode(mappedCode)
        setErrorMessage(err.message || "Conversion failed")
        setStatus("error")
      }
    },
    [source, target]
  )
  return (
    <>
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {contentData?.hero?.title || sourceDisplay + " to " + targetDisplay + " Converter"}
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            {contentData?.hero?.subtitle || "Free online tool \u2014 no registration, no watermarks, no limits."}
          </p>
        </div>
        {/* AI Summary / Quick Answer — GEO optimized */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">
            Quick Answer
          </h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            To convert <strong>{sourceDisplay}</strong> to <strong>{targetDisplay}</strong>:
            upload your file using the form below, select <strong>{targetDisplay}</strong> as the output format, and click Convert.
            Our Calibre-powered engine processes the conversion in seconds with no registration required.
            The converter preserves text content, chapter structure, images, and metadata.
            For batch conversions of up to 50 files, <Link href="/pricing" className="underline hover:text-blue-600">upgrade to Pro</Link>.
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
            errorCode={errorCode}
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
        {/* Batch conversion Pro guide */}
        <BatchConversionGuide sourceFormat={source} targetFormat={target} />
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
        {relatedBlogPosts && relatedBlogPosts.length > 0 && (
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
        )}
        {/* Video Tutorial for S-tier conversions */}
        <section className="mb-12 rounded-xl border bg-gray-50 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Tutorial</h2>
          {videoTutorial && (
            <VideoTutorial
              videoUrl={videoTutorial.videoUrl}
              title={videoTutorial.title}
              description={videoTutorial.description}
              steps={videoTutorial.steps}
            />
          )}
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
    const headers = headerRow.split("|").map((h: string) => h.trim()).filter(Boolean)
    const rows = bodyRows.trim().split("\n").map((row: string) => row.split("|").map((c: string) => c.trim()).filter(Boolean))
    let tableHtml = "<table class=\"w-full text-sm border-collapse\"><thead><tr class=\"border-b bg-gray-50\">"
    headers.forEach((h: string) => { tableHtml += "<th class=\"px-4 py-3 text-left font-medium text-gray-700\"></th>" })
    tableHtml += "</tr></thead><tbody>"
    rows.forEach((row: string[]) => {
      tableHtml += "<tr class=\"border-b\">"
      row.forEach((cell: string) => { tableHtml += "<td class=\"px-4 py-2 text-gray-700\"></td>" })
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
