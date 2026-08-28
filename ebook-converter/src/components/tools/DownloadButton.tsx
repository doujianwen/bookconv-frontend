"use client"

import { Download } from "lucide-react"

interface DownloadButtonProps {
  downloadUrl: string
  fileName: string
}

export function DownloadButton({ downloadUrl, fileName }: DownloadButtonProps) {
  return (
    <div className="rounded-xl border bg-green-50 p-6 text-center">
      <p className="mb-3 text-sm font-medium text-green-800">Your file is ready!</p>
      <a
        href={downloadUrl}
        download={fileName}
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-base font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Download className="h-5 w-5" />
        Download {fileName}
      </a>
      <p className="mt-2 text-xs text-gray-500">
        Link expires in 1 hour. Files are automatically deleted after download.
      </p>
    </div>
  )
}