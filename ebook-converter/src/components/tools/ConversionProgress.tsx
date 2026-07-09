"use client"

import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export type ConversionStatus = "idle" | "uploading" | "converting" | "done" | "error"

interface ConversionProgressProps {
  status: ConversionStatus
  progress?: number
  errorMessage?: string
}

export function ConversionProgress({ status, progress = 0, errorMessage }: ConversionProgressProps) {
  if (status === "idle") return null

  return (
    <div className="rounded-xl border bg-white p-6">
      {status === "uploading" && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Uploading file...</span>
        </div>
      )}

      {status === "converting" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Converting... {progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-green-700">Conversion complete!</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-600">
            {errorMessage || "Conversion failed. Please try again."}
          </span>
        </div>
      )}
    </div>
  )
}
