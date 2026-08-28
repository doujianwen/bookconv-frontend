"use client"

import { useState, useEffect, useCallback } from "react"
import {
  BookMarked, FileType, FileText, FileSpreadsheet, Image as ImageIcon,
  CheckCircle2, XCircle, Loader2, Download, Info, Calendar, User,
  Building, BookOpen, Languages, Tag, File as FileIcon,
} from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { extractEbookMetadata, estimatePageCount, type EbookMetadata } from "@/lib/ebook-metadata"

interface FilePreviewProps {
  file: File
  targetFormat: string
  onMetadataExtracted?: (meta: EbookMetadata) => void
}

export function FilePreview({ file, targetFormat, onMetadataExtracted }: FilePreviewProps) {
  const [metadata, setMetadata] = useState<EbookMetadata>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const ext = file.name.split(".").pop()?.toLowerCase() || ""

  const extract = useCallback(async () => {
    try {
      const meta = await extractEbookMetadata(file)
      setMetadata(meta)
      onMetadataExtracted?.(meta)
    } catch (err: any) {
      setError(err.message || "Failed to extract metadata")
    } finally {
      setLoading(false)
    }
  }, [file, onMetadataExtracted])

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Small delay for visual effect
    const timer = setTimeout(extract, 300)
    return () => clearTimeout(timer)
  }, [extract])

  const pageCount = estimatePageCount(file, ext)
  const displayName = FORMAT_DISPLAY_NAMES[ext] || ext.toUpperCase()
  const targetName = FORMAT_DISPLAY_NAMES[targetFormat] || targetFormat.toUpperCase()

  const getFormatIcon = (format: string) => {
    const lower = format.toLowerCase()
    switch (lower) {
      case "epub": return BookMarked
      case "pdf": return FileType
      case "mobi": case "azw3": case "azw": return BookOpen
      case "txt": case "html": case "rtf": return FileText
      case "doc": case "docx": return FileSpreadsheet
      case "fb2": return BookOpen
      case "djvu": return FileType
      case "jpg": case "jpeg": case "png": return ImageIcon
      default: return FileIcon
    }
  }

  const FormatIcon = getFormatIcon(ext)

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>Unable to read file metadata</span>
        </div>
        <p className="mt-1 text-xs text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* File info card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <FormatIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                {displayName}
              </span>
              <span>{formatBytes(file.size)}</span>
              {pageCount !== undefined && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  ~{pageCount} pages
                </span>
              )}
            </div>
          </div>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          )}
        </div>
      </div>

      {/* Metadata card */}
      {!loading && Object.keys(metadata).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Info className="h-4 w-4" />
            File Information
          </div>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {metadata.title && (
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <BookMarked className="h-3.5 w-3.5" /> Title
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.title}</dd>
              </div>
            )}
            {metadata.author && (
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <User className="h-3.5 w-3.5" /> Author
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.author}</dd>
              </div>
            )}
            {metadata.publisher && (
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Building className="h-3.5 w-3.5" /> Publisher
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.publisher}</dd>
              </div>
            )}
            {metadata.language && (
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Languages className="h-3.5 w-3.5" /> Language
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.language}</dd>
              </div>
            )}
            {metadata.isbn && (
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <FileText className="h-3.5 w-3.5" /> ISBN
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.isbn}</dd>
              </div>
            )}
            {metadata.publishedDate && (
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Calendar className="h-3.5 w-3.5" /> Published
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.publishedDate}</dd>
              </div>
            )}
            {metadata.subject && (
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Tag className="h-3.5 w-3.5" /> Subject
                </dt>
                <dd className="mt-0.5 text-sm text-gray-900">{metadata.subject}</dd>
              </div>
            )}
            {metadata.description && (
              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <FileText className="h-3.5 w-3.5" /> Description
                </dt>
                <dd className="mt-0.5 text-sm text-gray-700 line-clamp-3">{metadata.description}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Conversion info */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
          <Download className="h-4 w-4" />
          Converting {displayName} → {targetName}
        </div>
        <p className="mt-1 text-xs text-blue-600">
          Your file will be converted using Calibre engine. Most files convert in seconds.
        </p>
      </div>
    </div>
  )
}
