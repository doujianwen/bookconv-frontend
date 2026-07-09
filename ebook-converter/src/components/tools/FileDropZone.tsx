"use client"

import { useCallback, useState, type DragEvent } from "react"
import { Upload, File } from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
}

export function FileDropZone({ onFileSelect, disabled, accept }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
        setSelectedFile(file)
        onFileSelect(file)
      }
    },
    [disabled, onFileSelect]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <div className="flex flex-col items-center gap-2">
          <File className="h-10 w-10 text-blue-500" />
          <p className="font-medium text-gray-900">{selectedFile.name}</p>
          <p className="text-sm text-gray-500">{formatBytes(selectedFile.size)}</p>
        </div>
      ) : (
        <>
          <Upload className="mb-3 h-10 w-10 text-gray-400" />
          <p className="mb-1 text-sm font-medium text-gray-700">
            Drag & drop your file here
          </p>
          <p className="mb-3 text-xs text-gray-500">or click to browse</p>
        </>
      )}
      <input
        type="file"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={handleChange}
        disabled={disabled}
        accept={accept}
      />
    </div>
  )
}
