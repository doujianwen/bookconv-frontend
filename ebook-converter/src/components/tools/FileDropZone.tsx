"use client"

import React from "react"
import { useCallback, useState, useRef } from "react"
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
} from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"
import { SUPPORTED_FORMATS, FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { extractEbookMetadata, estimatePageCount, type EbookMetadata } from "@/lib/ebook-metadata"

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
  showMetadata?: boolean
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
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

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

function parseFileInfo(file: File): FileInfo {
  const name = file.name
  const ext = name.split(".").pop()?.toLowerCase() || ""
  const displayName = FORMAT_DISPLAY_NAMES[ext] || ext.toUpperCase()
  const isValidFormat = SUPPORTED_FORMATS.includes(ext)
  const isTooLarge = file.size > MAX_FILE_SIZE_BYTES

  let error: string | undefined
  if (!isValidFormat && ext !== "") {
    error = "Unsupported format: ." + ext
  } else if (isTooLarge) {
    error = "File too large. Max " + MAX_FILE_SIZE_MB + "MB allowed."
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
  }
}

export function FileDropZone({ onFileSelect, disabled, accept, showMetadata = true }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [metadata, setMetadata] = useState<EbookMetadata>({})
  const [metaLoading, setMetaLoading] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractMetadata = useCallback(async (file: File) => {
    if (!showMetadata) return
    setMetaLoading(true)
    setMetaError(null)
    try {
      const meta = await extractEbookMetadata(file)
      setMetadata(meta)
    } catch (err: any) {
      setMetaError(err.message || "Failed to extract metadata")
    } finally {
      setMetaLoading(false)
    }
  }, [showMetadata])

  const handleFile = useCallback((file: File) => {
    const info = parseFileInfo(file)
    setFileInfo(info)
    setSelectedFile(file)
    extractMetadata(file)
    onFileSelect(file)
  }, [extractMetadata, onFileSelect])

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

  const handleReset = useCallback(() => {
    setSelectedFile(null)
    setFileInfo(null)
    setMetadata({})
    setMetaError(null)
  }, [])

  const FormatIcon = fileInfo ? getFormatIcon(fileInfo.format) : null

  // Metadata fields to display
  const metaFields = Object.entries(metadata).filter(([_, v]) => v != null && v !== "") as [keyof EbookMetadata, string][]

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
                      ~{fileInfo.pageCount} pages
                    </span>
                  )}
                </div>
                {metaLoading ? (
                  <div className="flex items-center gap-1.5 text-xs text-blue-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Reading file info...
                  </div>
                ) : metaError ? (
                  <p className="text-xs text-gray-400">Metadata unavailable</p>
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
                  <p className="text-xs text-gray-400">No metadata found</p>
                )}
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </>
            )}
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-1 text-sm font-medium text-gray-700">
              Drag &amp; drop your file here
            </p>
            <p className="mb-2 text-xs text-gray-500">or click to browse</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <span className="rounded bg-gray-100 px-1.5 py-0.5">EPUB</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">PDF</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">MOBI</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">AZW3</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">TXT</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">DOCX</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">RTF</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5">FB2</span>
              <span className="text-xs">• Max {MAX_FILE_SIZE_MB}MB</span>
            </div>
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
            Detailed File Information
          </summary>
          <div className="border-t border-gray-100 px-4 pb-3 pt-2">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {metadata.title && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Title</dt>
                  <dd className="text-sm text-gray-900">{metadata.title}</dd>
                </>
              )}
              {metadata.author && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Author</dt>
                  <dd className="text-sm text-gray-900">{metadata.author}</dd>
                </>
              )}
              {metadata.publisher && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Publisher</dt>
                  <dd className="text-sm text-gray-900">{metadata.publisher}</dd>
                </>
              )}
              {metadata.language && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Language</dt>
                  <dd className="text-sm text-gray-900">{metadata.language}</dd>
                </>
              )}
              {metadata.isbn && (
                <>
                  <dt className="text-xs font-medium text-gray-500">ISBN</dt>
                  <dd className="text-sm text-gray-900">{metadata.isbn}</dd>
                </>
              )}
              {metadata.publishedDate && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Published</dt>
                  <dd className="text-sm text-gray-900">{metadata.publishedDate}</dd>
                </>
              )}
              {metadata.subject && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Subject</dt>
                  <dd className="text-sm text-gray-900">{metadata.subject}</dd>
                </>
              )}
              {metadata.description && (
                <>
                  <dt className="text-xs font-medium text-gray-500">Description</dt>
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

export { SUPPORTED_FORMATS, MAX_FILE_SIZE_MB }
export type { FileInfo }
