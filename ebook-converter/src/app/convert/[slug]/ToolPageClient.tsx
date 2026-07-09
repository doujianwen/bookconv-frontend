"use client"

import { useState, useCallback } from "react"
import type { KeywordData } from "@/lib/constants"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { FileDropZone } from "@/components/tools/FileDropZone"
import { ConversionProgress, type ConversionStatus } from "@/components/tools/ConversionProgress"
import { DownloadButton } from "@/components/tools/DownloadButton"
import { FAQSection, generateDefaultFAQs } from "@/components/tools/FAQSection"
import { RelatedConversions } from "@/components/tools/RelatedConversions"

interface ToolPageClientProps {
  source: string
  target: string
  keyword: KeywordData
  tool: string
  description: string
}

export function ToolPageClient({ source, target, keyword, tool, description }: ToolPageClientProps) {
  const [status, setStatus] = useState<ConversionStatus>("idle")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const sourceDisplay = FORMAT_DISPLAY_NAMES[source] || source.toUpperCase()
  const targetDisplay = FORMAT_DISPLAY_NAMES[target] || target.toUpperCase()

  const handleFileSelect = useCallback(
    async (file: File) => {
      setStatus("uploading")

      // TODO: Replace with real API call to POST /api/convert
      // Simulated conversion flow for development
      setTimeout(() => {
        setStatus("converting")
        setTimeout(() => {
          const ext = target.toLowerCase()
          const outputName = file.name.replace(/\.[^.]+$/, `.${ext}`)
          setFileName(outputName)
          setDownloadUrl("#")
          setStatus("done")
        }, 2000)
      }, 500)
    },
    [target]
  )

  const faqs = generateDefaultFAQs(source, target)

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {/* Hero / H1 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {sourceDisplay} to {targetDisplay} Converter
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Free online tool — no registration, no watermarks
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Powered by {tool === "calibre" ? "Calibre" : tool}
        </p>
      </div>

      {/* Tool Area */}
      <div className="space-y-4">
        <FileDropZone
          onFileSelect={handleFileSelect}
          disabled={status === "uploading" || status === "converting"}
        />
        <ConversionProgress
          status={status}
          progress={status === "converting" ? 50 : 0}
          errorMessage={errorMessage}
        />
        {status === "done" && <DownloadButton downloadUrl={downloadUrl} fileName={fileName} />}
      </div>

      {/* How to convert */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          How to Convert {sourceDisplay} to {targetDisplay} Online
        </h2>
        <ol className="space-y-3 rounded-xl border bg-white p-6">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              1
            </span>
            <span className="text-gray-700">
              <strong>Upload</strong> your {sourceDisplay} file — drag and drop or click to browse.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              2
            </span>
            <span className="text-gray-700">
              <strong>Convert</strong> — {description}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              3
            </span>
            <span className="text-gray-700">
              <strong>Download</strong> your {targetDisplay} file — ready to read on your device.
            </span>
          </li>
        </ol>
      </section>

      {/* Why convert */}
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

      {/* FAQ with Schema */}
      <FAQSection faqs={faqs} sourceFormat={source} targetFormat={target} />

      {/* Related conversions */}
      <RelatedConversions currentSource={source} currentTarget={target} />
    </main>
  )
}