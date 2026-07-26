"use client";

import { useCallback, useState, useRef } from "react";
import {
  Upload,
  File as FileIcon,
  FileType,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Trash2,
  AlertTriangle,
  FileDown,
  BookOpen,
  BookMarked,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { SUPPORTED_FORMATS, FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map";
import { Button } from "@/components/ui/button";

// ── Pro limits ────────────────────────────────────────────────
const BATCH_MAX_FILES = parseInt(process.env.NEXT_PUBLIC_BATCH_MAX_FILES || "50", 10);
const MAX_FILE_SIZE_MB = parseInt(process.env.NEXT_PUBLIC_BATCH_MAX_FILE_SIZE_MB || "50", 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── Types ─────────────────────────────────────────────────────
interface BatchFileItem {
  index: number;
  file: File;
  name: string;
  size: number;
  sourceFormat: string;
  targetFormat: string;
  status: "queued" | "processing" | "completed" | "failed";
  error?: string;
  progress: number;
}

interface BatchResult {
  batchId: string;
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  files: Array<{
    index: number;
    name: string;
    size: number;
    sourceFormat: string;
    status: string;
    error?: string;
    result?: { extension: string; mimeType: string; fileSize?: number };
  }>;
  zipUrl?: string;
  message: string;
}

// ── Format icon helper ────────────────────────────────────────
function getFormatIcon(format: string) {
  const lower = format.toLowerCase();
  switch (lower) {
    case "epub": return BookMarked;
    case "pdf": return FileType;
    case "mobi": case "azw3": case "azw": return BookOpen;
    case "txt": case "html": case "htmlz": case "rtf": return FileText;
    case "doc": case "docx": return FileSpreadsheet;
    case "fb2": return BookOpen;
    case "djvu": return FileType;
    case "cbr": case "cbz": return ImageIcon;
    case "jpg": case "jpeg": case "png": return ImageIcon;
    default: return FileIcon;
  }
}

// ── Status badge colors ───────────────────────────────────────
function statusConfig(status: string) {
  switch (status) {
    case "completed": return { color: "text-green-600", bg: "bg-green-50", label: "Done" };
    case "processing": return { color: "text-blue-600", bg: "bg-blue-50", label: "Converting" };
    case "failed": return { color: "text-red-600", bg: "bg-red-50", label: "Failed" };
    default: return { color: "text-gray-500", bg: "bg-gray-50", label: "Queued" };
  }
}

// ── Main Component ────────────────────────────────────────────
export function BatchUpload({ onConversionComplete }: { onConversionComplete?: (result: BatchResult) => void }) {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState("epub");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File management ───────────────────────────────────────
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const existingNames = new Set(files.map((f) => f.name));
    const added: BatchFileItem[] = [];

    for (const file of newFiles) {
      if (existingNames.has(file.name)) continue;

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let error: string | undefined;

      if (!SUPPORTED_FORMATS.includes(ext)) {
        error = `Unsupported format: .${ext}`;
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        error = `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > ${MAX_FILE_SIZE_MB}MB)`;
      }

      added.push({
        index: files.length + added.length,
        file,
        name: file.name,
        size: file.size,
        sourceFormat: ext,
        targetFormat,
        status: error ? "failed" : "queued",
        error,
        progress: error ? 0 : 0,
      });
    }

    setFiles((prev) => [...prev, ...added]);
  }, [files, targetFormat]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [addFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, index: i })));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setBatchResult(null);
    setError(null);
  }, []);

  // ── Submit batch ──────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length === 0) {
      setError("No valid files to convert.");
      return;
    }
    if (validFiles.length > BATCH_MAX_FILES) {
      setError(`Maximum ${BATCH_MAX_FILES} files per batch.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setBatchResult(null);

    try {
      const formData = new FormData();
      for (const item of validFiles) {
        formData.append("files", item.file);
      }
      formData.append("target_format", targetFormat);

      const res = await fetch("/api/convert/batch", {
        method: "POST",
        body: formData,
      });

      const data: BatchResult = await res.json();
      setBatchResult(data);

      // Update local file statuses
      setFiles((prev) =>
        prev.map((f) => {
          const serverFile = data.files.find((sf) => sf.index === f.index);
          if (serverFile) {
            return { ...f, status: serverFile.status as BatchFileItem["status"], error: serverFile.error, progress: serverFile.status === "completed" ? 100 : 0 };
          }
          return f;
        })
      );

      onConversionComplete?.(data);
    } catch (err: any) {
      setError(err.message || "Batch conversion failed.");
    } finally {
      setIsSubmitting(false);
    }
  }, [files, targetFormat, onConversionComplete]);

  // ── Download ZIP ──────────────────────────────────────────
  const handleDownloadZip = useCallback(async () => {
    if (!batchResult?.zipUrl) return;
    const res = await fetch(batchResult.zipUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-batch-${batchResult.batchId.slice(0, 8)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [batchResult]);

  // ── Render ────────────────────────────────────────────────
  const validCount = files.filter((f) => !f.error).length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const failedCount = files.filter((f) => f.status === "failed").length;
  const overallProgress = files.length > 0 ? Math.round(((completedCount + failedCount) / files.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileDown className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Batch Conversion</h2>
          <p className="text-sm text-gray-500">Convert up to {BATCH_MAX_FILES} files at once — Pro feature</p>
        </div>
      </div>

      {/* Drop zone */}
      {!batchResult && (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={files.length >= BATCH_MAX_FILES}
            accept={SUPPORTED_FORMATS.map((f) => "." + f).join(",")}
          />
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-base font-medium text-gray-700">
            Drag &amp; drop files here or click to browse
          </p>
          <p className="mb-4 text-sm text-gray-500">
            {files.length}/{BATCH_MAX_FILES} files selected — Max {MAX_FILE_SIZE_MB}MB each
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-gray-400">
            {["EPUB", "PDF", "MOBI", "AZW3", "TXT", "DOCX", "RTF", "FB2", "DJVU"].map((fmt) => (
              <span key={fmt} className="rounded bg-gray-100 px-2 py-0.5">{fmt}</span>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= BATCH_MAX_FILES}
          >
            Select Files
          </Button>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {/* File count bar */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              {files.length} file{files.length !== 1 ? "s" : ""}
              {validCount > 0 && (
                <span className="ml-2 text-green-600">({validCount} valid)</span>
              )}
            </span>
            <div className="flex gap-2">
              {batchResult && (
                <Button variant="ghost" size="sm" onClick={clearAll}>Clear All</Button>
              )}
            </div>
          </div>

          {/* Overall progress */}
          {batchResult && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>Overall Progress</span>
                <span>{overallProgress}% — {completedCount} done, {failedCount} failed</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    failedCount > 0 && completedCount > 0
                      ? "bg-gradient-to-r from-green-500 to-red-500"
                      : "bg-blue-600"
                  )}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Individual file rows */}
          <div className="space-y-2">
            {files.map((item) => {
              const Icon = getFormatIcon(item.sourceFormat);
              const sc = statusConfig(item.status);
              const displayName = FORMAT_DISPLAY_NAMES[item.sourceFormat] || item.sourceFormat.toUpperCase();

              return (
                <div
                  key={item.index}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    sc.bg
                  )}
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5">{displayName}</span>
                      <span>{formatBytes(item.size)}</span>
                      <span>→ {FORMAT_DISPLAY_NAMES[targetFormat] || targetFormat.toUpperCase()}</span>
                    </div>
                    {item.error && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {item.error}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  <span className={cn("shrink-0 text-xs font-medium", sc.color)}>
                    {sc.label}
                  </span>

                  {/* Spinner / check / x */}
                  {item.status === "processing" && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {item.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {item.status === "failed" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}

                  {/* Remove button */}
                  {!batchResult && (
                    <button
                      onClick={() => removeFile(item.index)}
                      className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Target format selector */}
      {!batchResult && validCount > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <label htmlFor="target-format" className="text-sm font-medium text-gray-700">
            Convert to:
          </label>
          <select
            id="target-format"
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {SUPPORTED_FORMATS.filter((f) => f !== targetFormat).map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_DISPLAY_NAMES[fmt] || fmt.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action buttons */}
      {!batchResult && validCount > 0 && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || validCount === 0}
            className="min-w-[200px]"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Convert {validCount} File{validCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>

          {files.some((f) => f.error) && (
            <span className="text-xs text-orange-600">
              {files.filter((f) => f.error).length} file(s) skipped
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success / ZIP download */}
      {batchResult && batchResult.completed > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{batchResult.message}</p>
              <p className="text-xs text-green-600">Batch ID: {batchResult.batchId.slice(0, 12)}...</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleDownloadZip}>
              <Download className="mr-2 h-4 w-4" />
              Download ZIP
            </Button>
          </div>
        </div>
      )}

      {/* All failed */}
      {batchResult && batchResult.completed === 0 && batchResult.failed > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">{batchResult.message}</p>
              <p className="text-xs text-red-600">No files were converted successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
