"use client"

import { Download, FileText, ArrowRight, CheckCircle2 } from "lucide-react"

interface FileMeta {
  name: string
  size: number
  format: string
  displayName: string
}

interface BeforeAfterComparisonProps {
  beforeFile: FileMeta
  afterFile: FileMeta
  downloadUrl: string
  onReset: () => void
}

export function BeforeAfterComparison({ beforeFile, afterFile, downloadUrl, onReset }: BeforeAfterComparisonProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const sizeDiff = afterFile.size - beforeFile.size
  const sizeDiffPercent = beforeFile.size > 0 ? Math.round(((sizeDiff / beforeFile.size) * 100)) : 0
  const sizeDiffLabel = sizeDiff >= 0 ? + : -

  return (
    <div className="space-y-4">
      {/* Comparison cards */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Before card */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">BEFORE</span>
          </div>
          <p className="mb-1 truncate text-sm font-medium text-gray-900">{beforeFile.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">{beforeFile.displayName}</span>
            <span>{formatBytes(beforeFile.size)}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center pt-6">
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
        </div>

        {/* After card */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-green-200 px-2 py-0.5 text-xs font-medium text-green-700">AFTER</span>
          </div>
          <p className="mb-1 truncate text-sm font-medium text-gray-900">{afterFile.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">{afterFile.displayName}</span>
            <span>{formatBytes(afterFile.size)}</span>
          </div>
          {sizeDiff !== 0 && (
            <p className={mt-1 text-xs }>
              Size change: {sizeDiffLabel} ({sizeDiffPercent > 0 ? "+" : ""}{sizeDiffPercent}%)
            </p>
          )}
        </div>
      </div>

      {/* Download button */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="mb-3 text-sm font-medium text-green-800">Conversion complete! Your file is ready.</p>
        <a
          href={downloadUrl}
          download={afterFile.name}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Download {afterFile.displayName}
        </a>
        <p className="mt-2 text-[11px] text-gray-500">
          Link expires in 5 minutes. Files are automatically deleted after download.
        </p>
      </div>

      {/* Reset button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
        >
          Convert another file
        </button>
      </div>
    </div>
  )
}