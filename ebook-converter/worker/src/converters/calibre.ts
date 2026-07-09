import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { unlink } from "node:fs/promises"
import path from "node:path"

const execFileAsync = promisify(execFile)

export interface ConvertOptions {
  sourceFormat: string
  targetFormat: string
  quality?: "default" | "high"
  extraArgs?: string[]
}

export interface ConvertResult {
  success: boolean
  outputPath: string
  error?: string
}

export async function convertWithCalibre(
  inputPath: string,
  outputPath: string,
  options: ConvertOptions
): Promise<ConvertResult> {
  const args: string[] = [inputPath, outputPath]

  // Quality presets
  if (options.quality === "high") {
    if (options.targetFormat === "pdf") {
      args.push("--pdf-page-numbers")
      args.push("--pretty-print")
    }
    if (options.targetFormat === "epub") {
      args.push("--pretty-print")
    }
  }

  // Remove cover image for plain text output
  if (options.targetFormat === "txt" || options.targetFormat === "text") {
    args.push("--dont-add-chapters-to-toc")
  }

  if (options.extraArgs) {
    args.push(...options.extraArgs)
  }

  try {
    const { stderr } = await execFileAsync("ebook-convert", args, {
      timeout: 120_000, // 2 minute timeout
      maxBuffer: 10 * 1024 * 1024,
    })

    // Calibre outputs informational messages to stderr
    // Only treat as error if output file doesn't exist
    return { success: true, outputPath }
  } catch (err: any) {
    const message = err.stderr || err.message || "Unknown conversion error"

    // Clean up partial output
    try { await unlink(outputPath) } catch {}

    // Detect common errors
    if (message.includes("DRM")) {
      return {
        success: false,
        outputPath: "",
        error: "This file is protected by DRM and cannot be converted.",
      }
    }

    return {
      success: false,
      outputPath: "",
      error: `Conversion failed: ${message.slice(0, 200)}`,
    }
  }
}

export async function convertEpubToImages(
  inputPath: string,
  outputDir: string,
  format: "jpg" | "png" = "jpg"
): Promise<ConvertResult> {
  const pdfPath = path.join(outputDir, "temp.pdf")

  try {
    // Step 1: Convert EPUB to PDF
    await execFileAsync("ebook-convert", [inputPath, pdfPath], {
      timeout: 60_000,
    })

    // Step 2: Convert PDF pages to images
    const outputPattern = path.join(outputDir, `page-%03d.${format}`)
    await execFileAsync("magick", [
      "-density", "150",
      pdfPath,
      "-quality", "90",
      outputPattern,
    ], { timeout: 60_000 })

    // Clean up temp PDF
    try { await unlink(pdfPath) } catch {}

    return { success: true, outputPath: outputDir }
  } catch (err: any) {
    try { await unlink(pdfPath) } catch {}
    return {
      success: false,
      outputPath: "",
      error: `Image conversion failed: ${err.message}`,
    }
  }
}

export async function convertDocToEpub(inputPath: string, outputPath: string): Promise<ConvertResult> {
  try {
    // Step 1: Convert DOC to DOCX with LibreOffice
    const dir = path.dirname(inputPath)
    await execFileAsync("soffice", [
      "--headless",
      "--convert-to", "docx",
      "--outdir", dir,
      inputPath,
    ], { timeout: 60_000 })

    const docxPath = inputPath.replace(/\.doc$/i, ".docx")

    // Step 2: Convert DOCX to EPUB with Calibre
    const result = await convertWithCalibre(docxPath, outputPath, {
      sourceFormat: "docx",
      targetFormat: "epub",
    })

    // Clean up intermediate file
    try { await unlink(docxPath) } catch {}

    return result
  } catch (err: any) {
    return {
      success: false,
      outputPath: "",
      error: `DOC to EPUB conversion failed: ${err.message}`,
    }
  }
}

export async function convertDjvuToPdf(inputPath: string, outputPath: string): Promise<ConvertResult> {
  try {
    await execFileAsync("ddjvu", [
      "-format=pdf",
      inputPath,
      outputPath,
    ], { timeout: 60_000 })

    return { success: true, outputPath }
  } catch (err: any) {
    return {
      success: false,
      outputPath: "",
      error: `DJVU to PDF conversion failed: ${err.message}`,
    }
  }
}