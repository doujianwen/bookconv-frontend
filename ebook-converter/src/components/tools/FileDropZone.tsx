"use client"

import { useCallback, useState, useRef, type DragEvent, type ChangeEvent } from "react"
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
} from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"
import { SUPPORTED_FORMATS, FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
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
    case "epub":
      return BookMarked
    case "pdf":
      return FileType
    case "mobi":
    case "azw3":
    case "azw":
      return BookOpen
    case "txt":
    case "html":
    case "htmlz":
      return FileText
    case "doc":
    case "docx":
      return FileSpreadsheet
    case "rtf":
      return FileText
    case "fb2":
      return BookOpen
    case "djvu":
      return FileType
    case "cbr":
    case "cbz":
      return ImageIcon
    case "jpg":
    case "jpeg":
    case "png":
      return ImageIcon
    default:
      return FileIcon
  }
}

function estimatePageCount(file: File, format: string): number | undefined {
  if (["pdf", "djvu", "cbr", "cbz"].includes(format.toLowerCase())) {
    const sizeMB = file.size / (1024 * 1024)
    if (format.toLowerCase() === "pdf") {
      return Math.max(1, Math.round(sizeMB * 5))
    }
    return Math.max(1, Math.round(sizeMB * 10))
  }
  return undefined
}

function parseFileInfo(file: File): FileInfo {
  const name = file.name
  const ext = name.split(".").pop()?.toLowerCase() || ""
  const displayName = FORMAT_DISPLAY_NAMES[ext] || ext.toUpperCase()
  const isValidFormat = SUPPORTED_FORMATS.includes(ext)
  const isTooLarge = file.size > MAX_FILE_SIZE_BYTES
  const pageCount = estimatePageCount(file, ext)

  let error: string | undefined
  if (!isValidFormat && ext !== "") {
    error = \Unsupported format: .\\
  } else if (isTooLarge) {
    error = \File too large. Max \MB allowed.\
  }

  return {
    name,
    size: file.size,
    format: ext,
    displayName,
    pageCount,
    isValidFormat,
    isTooLarge,
    error,
  }
}

export function FileDropZone({ onFileSelect, disabled, accept }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      if (file) {
        const info = parseFileInfo(file)
        setFileInfo(info)
        onFileSelect(file)
      }
    },
    [disabled, onFileSelect]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const info = parseFileInfo(file)
        setFileInfo(info)
        onFileSelect(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [onFileSelect]
  )

  return (
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
              {React.createElement(getFormatIcon(fileInfo.format), {
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
  )
}

export { SUPPORTED_FORMATS, MAX_FILE_SIZE_MB }
export type { FileInfo }