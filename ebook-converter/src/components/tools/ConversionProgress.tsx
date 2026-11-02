"use client"

import { Loader2, CheckCircle2, AlertTriangle, FileX } from "lucide-react"
import Link from "next/link"
import type { ErrorCode } from "@/lib/error-handler"
import { getFriendlyMessage, isRetryable } from "@/lib/error-handler"
import { chrome } from "@/lib/ui-chrome"

export type ConversionStatus = "idle" | "uploading" | "converting" | "done" | "error"

interface ConversionProgressProps {
  status: ConversionStatus
  progress?: number
  errorMessage?: string
  errorCode?: ErrorCode
  /** M5-7：西语页 chrome 本地化开关 */
  isEs?: boolean
}

/** Map of error codes to icon + hint shown below the main message */
const ERROR_HINTS: Record<string, { icon: React.ReactNode; hint: string; hintEs?: string }> = {
  CORRUPT_INPUT: { icon: <FileX className="h-4 w-4 text-red-500" />, hint: "This file appears damaged. Re-download and try again.", hintEs: "Este archivo parece dañado. Vuelve a descargarlo e inténtalo de nuevo." },
  DRM_PROTECTED: { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, hint: "DRM-protected file — remove DRM before converting.", hintEs: "Archivo con DRM: quita el DRM antes de convertir." },
  MEMORY_LIMIT: { icon: <FileX className="h-4 w-4 text-orange-500" />, hint: "File too large or complex for conversion.", hintEs: "Archivo demasiado grande o complejo para convertir." },
  CONVERSION_FAILED: { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, hint: isRetryable("CONVERSION_FAILED") ? "Click retry or try a different file." : "", hintEs: isRetryable("CONVERSION_FAILED") ? "Haz clic para reintentar o prueba con otro archivo." : "" },
  UNSUPPORTED_CONVERSION: { icon: <FileX className="h-4 w-4 text-amber-500" />, hint: "Try the suggested alternative format instead.", hintEs: "Prueba con el formato alternativo sugerido." },
}

export function ConversionProgress({ status, progress = 0, errorMessage, errorCode, isEs = false }: ConversionProgressProps) {
  if (status === "idle") return null

  return (
    <div className="rounded-xl border bg-white p-6">
      {status === "uploading" && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">{chrome('cpUploading', isEs)}</span>
        </div>
      )}

      {status === "converting" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">{chrome('cpConverting', isEs)}... {progress}%</span>
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
          <span className="text-sm font-medium text-green-700">{chrome('bacDoneShort', isEs)}</span>
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
              <span className="text-xs text-gray-500">{isEs ? (ERROR_HINTS[errorCode].hintEs ?? ERROR_HINTS[errorCode].hint) : ERROR_HINTS[errorCode].hint}</span>
            </div>
          )}
          {/* M2-10: DRM error becomes an internal-link surface — point users
              at the on-site DRM guide instead of a dead end. Display layer
              only; the API error message contract is untouched. */}
          {errorCode === "DRM_PROTECTED" && (
            <div className="pl-8 text-xs text-gray-500">
              {isEs ? (
                <>
                  ¿No sabes si tu archivo tiene DRM? Consulta la{" "}
                  <Link href="/blog/which-kindle-books-can-you-convert-drm-free-checklist" className="font-semibold text-blue-600 underline hover:text-blue-700">
                    guía de archivos Kindle sin DRM
                  </Link>
                  .
                </>
              ) : (
                <>
                  Not sure if your file is DRM-free? Check the{" "}
                  <Link href="/blog/which-kindle-books-can-you-convert-drm-free-checklist" className="font-semibold text-blue-600 underline hover:text-blue-700">
                    DRM-free Kindle conversion checklist
                  </Link>
                  .
                </>
              )}
            </div>
          )}
          {/* Machine-readable code — surfaces the real cause (e.g. a non-JSON
              upstream error) instead of a generic "Server error". */}
          {errorCode && (
            <div className="pl-8">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-500">
                code: {errorCode}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
