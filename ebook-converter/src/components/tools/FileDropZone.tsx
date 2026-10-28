"use client"

import React from "react"
import { useCallback, useState, useRef } from "react"
import { useLocale } from "next-intl"
import {
  Upload,
  File as FileIcon,
  FileType,
  CheckCircle2,
  XCircle,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  BookMarked,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"
import { chrome } from "@/lib/ui-chrome"
import { SUPPORTED_FORMATS, FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { extractEbookMetadata, estimatePageCount, type EbookMetadata } from "@/lib/ebook-metadata"
import { MAX_UPLOAD_FILE_SIZE_MB, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/file-size-limit"

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
  showMetadata?: boolean
  /**
   * Largest file this deployment can actually accept, and the matching MB value
   * for display. Supplied by the caller from useUploadCapability() so the drop
   * zone never advertises a ceiling the deployment cannot honour.
   * Defaults to the direct-upload constants for callers that have not migrated.
   */
  maxFileSizeBytes?: number
  maxFileSizeMB?: number
}

interface FileInfo {
  name: string
  size: number
  format: string
  displayName: string
  pageCount?: number
  isValidFormat: boolean
  isTooLarge: boolean
  error?: string
  warning?: string
}

function getFormatIcon(format: string) {
  const lower = format.toLowerCase()
  switch (lower) {
    case "epub": return BookMarked
    case "pdf": return FileType
    case "mobi": case "azw3": case "azw": return BookOpen
    case "txt": case "html": case "htmlz": return FileText
    case "doc": case "docx": return FileSpreadsheet
    case "rtf": return FileText
    case "fb2": return BookOpen
    case "djvu": return FileType
    case "cbr": case "cbz": return ImageIcon
    case "jpg": case "jpeg": case "png": return ImageIcon
    default: return FileIcon
  }
}

// Soft warning when a valid file is close to the hard cap. Files near the cap
// (or with heavy images / complex layout) can still blow the 60s serverless
// function timeout even though they pass the size check — surface it before the
// user waits 50s for a 500.
//
// The warn threshold is derived from the cap actually in force, so it moves with
// the deployment's real capability instead of assuming the 100MB direct-upload
// ceiling is available. See useUploadCapability() for why that cannot be assumed.
const LARGE_FILE_WARN_RATIO = 0.75

// The component is otherwise English-hardcoded; we localize just these two
// user-facing strings so the free-plan timeout heads-up also shows on the
// Spanish (/es/) pages. Keep en as the safe fallback for any unknown locale.
type UiLocale = "en" | "es"

const UPLOAD_HINTS: Record<UiLocale, string> = {
  en: "Files near the limit or with many images may convert slowly or exceed the free plan's processing time.",
  es: "Los archivos cerca del límite o con muchas imágenes pueden convertirse lentamente o superar el tiempo de procesamiento del plan gratuito.",
}

const LARGE_FILE_WARNINGS: Record<UiLocale, string> = {
  en: "This file is close to the {mb}MB limit. Large or image-heavy files may convert slowly or exceed the free plan's processing time.",
  es: "Este archivo está cerca del límite de {mb} MB. Los archivos grandes o con muchas imágenes pueden convertirse lentamente o superar el tiempo de procesamiento del plan gratuito.",
}

function hintFor(locale: string): string {
  return UPLOAD_HINTS[locale as UiLocale] ?? UPLOAD_HINTS.en
}

function warningFor(locale: string, mb: number): string {
  const template = LARGE_FILE_WARNINGS[locale as UiLocale] ?? LARGE_FILE_WARNINGS.en
  return template.replace("{mb}", String(mb))
}

function parseFileInfo(
  file: File,
  warningMsg: string,
  isEs: boolean,
  maxBytes: number,
  maxMB: number,
): FileInfo {
  const name = file.name
  const ext = name.split(".").pop()?.toLowerCase() || ""
  const displayName = FORMAT_DISPLAY_NAMES[ext] || ext.toUpperCase()
  const isValidFormat = SUPPORTED_FORMATS.includes(ext)
  const isTooLarge = file.size > maxBytes

  let error: string | undefined
  if (!isValidFormat && ext !== "") {
    error = chrome('fdzUnsupported', isEs) + ": ." + ext
  } else if (isTooLarge) {
    error = chrome('fdzFileTooLarge', isEs).replace("{mb}", String(maxMB))
  }

  // Non-blocking heads-up for valid-but-heavy files. The copy is passed in
  // pre-localized (en/es) so the same warning shows on /es/ pages.
  let warning: string | undefined
  if (!error && file.size > maxBytes * LARGE_FILE_WARN_RATIO) {
    warning = warningMsg
  }

  return {
    name,
    size: file.size,
    format: ext,
    displayName,
    pageCount: estimatePageCount(file, ext),
    isValidFormat,
    isTooLarge,
    error,
    warning,
  }
}

export function FileDropZone({
  onFileSelect,
  disabled,
  accept,
  showMetadata = true,
  maxFileSizeBytes = MAX_UPLOAD_FILE_SIZE_BYTES,
  maxFileSizeMB = MAX_UPLOAD_FILE_SIZE_MB,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [metadata, setMetadata] = useState<EbookMetadata>({})
  const [metaLoading, setMetaLoading] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const locale = useLocale()
  // M5-7：next-intl locale → isEs 开关，复用 chrome() 字典（与 ToolPageClient 同机制）
  const isEs = locale === "es"

  const extractMetadata = useCallback(async (file: File) => {
    if (!showMetadata) return
    setMetaLoading(true)
    setMetaError(null)
    try {
      const meta = await extractEbookMetadata(file)
      setMetadata(meta)
    } catch (err) {
      setMetaError(err instanceof Error ? err.message : "Failed to extract metadata")
    } finally {
      setMetaLoading(false)
    }
  }, [showMetadata])

  const handleFile = useCallback((file: File) => {
    const info = parseFileInfo(
      file,
      warningFor(locale, maxFileSizeMB),
      isEs,
      maxFileSizeBytes,
      maxFileSizeMB,
    )
    setFileInfo(info)
    extractMetadata(file)
    onFileSelect(file)
  }, [extractMetadata, onFileSelect, locale, isEs, maxFileSizeBytes, maxFileSizeMB])

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled) return
      if (!e.dataTransfer) return
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [disabled, handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [handleFile]
  )

  const FormatIcon = fileInfo ? getFormatIcon(fileInfo.format) : null

  // Metadata fields to display
  const metaFields = Object.entries(metadata).filter(([, v]) => v != null && v !== "") as [keyof EbookMetadata, string][]

  return (
    <div className="space-y-4">
      {/* Drop zone / selected file area */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-colors",
          fileInfo?.error
            ? "border-red-300 bg-red-50"
            : isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {fileInfo ? (
          <div className="flex w-full flex-col items-center gap-3">
            {fileInfo.error ? (
              <>
                <XCircle className="h-10 w-10 text-red-500" />
                <p className="text-sm font-medium text-red-700">{fileInfo.error}</p>
                <p className="text-xs text-gray-500">{fileInfo.name}</p>
              </>
            ) : (
              <>
                {FormatIcon && React.createElement(FormatIcon, {
                  className: "h-10 w-10 text-blue-500",
                })}
                <p className="max-w-full truncate font-medium text-gray-900">{fileInfo.name}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                    {fileInfo.displayName}
                  </span>
                  <span>{formatBytes(fileInfo.size)}</span>
                  {fileInfo.pageCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      ~{fileInfo.pageCount} {chrome('fdzPages', isEs)}
                    </span>
                  )}
                </div>
                {metaLoading ? (
                  <div className="flex items-center gap-1.5 text-xs text-blue-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {chrome('fdzReading', isEs)}
                  </div>
                ) : metaError ? (
                  <p className="text-xs text-gray-400">{chrome('fdzMetadataUnavailable', isEs)}</p>
                ) : metaFields.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    {metadata.title && (
                      <span className="flex items-center gap-1">
                        <BookMarked className="h-3 w-3 text-gray-400" />
                        {metadata.title}
                      </span>
                    )}
                    {metadata.author && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-gray-400" />
                        {metadata.author}
                      </span>
                    )}
                    {metadata.publisher && (
                      <span className="flex items-center gap-1">
                        <FileSpreadsheet className="h-3 w-3 text-gray-400" />
                        {metadata.publisher}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">{chrome('fdzNoMetadata', isEs)}</p>
                )}
                {fileInfo.warning && (
                  <div className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs leading-snug text-amber-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{fileInfo.warning}</span>
                  </div>
                )}
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </>
            )}
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-700">
              {chrome('fdzDropPrompt', isEs)}
            </p>
            <p className="mb-2 text-xs text-gray-500">{chrome('fdzOrBrowse', isEs)}</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <span className="rounded bg-gray-100 px-1.5 py-0.5">EPUB</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">PDF</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">MOBI</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">AZW3</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">TXT</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">DOCX</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">RTF</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">FB2</span>
              <span className="text-xs">• Max {maxFileSizeMB}MB per file</span>
            </div>
            <p className="mt-1 max-w-sm text-center text-[11px] leading-relaxed text-amber-600">
              {hintFor(locale)}
            </p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={handleChange}
          disabled={disabled}
          accept={accept}
        />
      </div>

      {/* Expanded metadata panel */}
      {!metaLoading && !fileInfo?.error && metaFields.length > 0 && (
        <details className="rounded-xl border border-gray-200 bg-white">
          <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {chrome('fdzDetailed', isEs)}
          </summary>
          <div className="border-t border-gray-100 px-4 pb-3 pt-2">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {metadata.title && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzTitle', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.title}</dd>
                </>
              )}
              {metadata.author && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzAuthor', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.author}</dd>
                </>
              )}
              {metadata.publisher && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzPublisher', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.publisher}</dd>
                </>
              )}
              {metadata.language && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzLanguage', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.language}</dd>
                </>
              )}
              {metadata.isbn && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzIsbn', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.isbn}</dd>
                </>
              )}
              {metadata.publishedDate && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzPublished', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.publishedDate}</dd>
                </>
              )}
              {metadata.subject && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzSubject', isEs)}</dt>
                  <dd className="text-sm text-gray-900">{metadata.subject}</dd>
                </>
              )}
              {metadata.description && (
                <>
                  <dt className="text-xs font-medium text-gray-500">{chrome('fdzDescription', isEs)}</dt>
                  <dd className="text-sm text-gray-700">{metadata.description}</dd>
                </>
              )}
            </dl>
          </div>
        </details>
      )}
    </div>
  )
}

export { SUPPORTED_FORMATS }
export type { FileInfo }
