"use client"

import { Loader2, CheckCircle2, AlertTriangle, FileX } from "lucide-react"
import type { ErrorCode } from "@/lib/error-handler"
import { getFriendlyMessage, isRetryable } from "@/lib/error-handler"

export type ConversionStatus = "idle" | "uploading" | "converting" | "done" | "error"

interface ConversionProgressProps {
  status: ConversionStatus
  progress?: number
  errorMessage?: string
  errorCode?: ErrorCode
}

/** Map of error codes to icon + hint shown below the main message */
const ERROR_HINTS: Record<string, { icon: React.ReactNode; hint: string }> = {
  CORRUPT_INPUT: { icon: <FileX className="h-4 w-4 text-red-500" />, hint: "This file appears damaged. Re-download and try again." },
  DRM_PROTECTED: { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, hint: "DRM-protected file — remove DRM before converting." },
  MEMORY_LIMIT: { icon: <FileX className="h-4 w-4 text-orange-500" />, hint: "File too large or complex for conversion." },
  CONVERSION_FAILED: { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, hint: isRetryable("CONVERSION_FAILED") ? "Click retry or try a different file." : "" },
}

export function ConversionProgress({ status, progress = 0, errorMessage, errorCode }: ConversionProgressProps) {
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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <FileX className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600">
              {errorMessage || getFriendlyMessage(errorCode ?? "CONVERSION_FAILED")}
            </span>
          </div>
          {/* Extra hint for known error types */}
          {errorCode && ERROR_HINTS[errorCode]?.hint && (
            <div className="flex items-start gap-2 pl-8">
              {ERROR_HINTS[errorCode].icon}
              <span className="text-xs text-gray-500">{ERROR_HINTS[errorCode].hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
