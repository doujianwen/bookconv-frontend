import { NextRequest, NextResponse } from "next/server"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { randomUUID } from "node:crypto"
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { getConversionKey, getConversion, SUPPORTED_FORMATS } from "@/lib/conversion-map"

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/ebook-uploads"
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024

// Calibre path - check common locations on Windows
const CALIBRE_PATH = process.env.CALIBRE_PATH || (
  process.platform === "win32"
    ? ["C:\\Program Files\\Calibre2\\ebook-convert.exe", "E:\\Program Files\\Calibre2\\ebook-convert.exe"].find(p => existsSync(p)) || "ebook-convert"
    : "ebook-convert"
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const sourceFormat = (formData.get("source_format") as string)?.toLowerCase().replace(".", "")
    const targetFormat = (formData.get("target_format") as string)?.toLowerCase().replace(".", "")

    if (!file || !sourceFormat || !targetFormat) {
      return NextResponse.json({ error: "Missing required fields: file, source_format, target_format" }, { status: 400 })
    }

    if (!SUPPORTED_FORMATS.includes(sourceFormat)) {
      return NextResponse.json({ error: `Unsupported source format: ${sourceFormat}` }, { status: 400 })
    }
    if (!SUPPORTED_FORMATS.includes(targetFormat)) {
      return NextResponse.json({ error: `Unsupported target format: ${targetFormat}` }, { status: 400 })
    }

    if (!getConversion(sourceFormat, targetFormat)) {
      return NextResponse.json(
        { error: `Conversion not supported: ${sourceFormat} → ${targetFormat}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || "10"}MB` },
        { status: 413 }
      )
    }

    const jobId = randomUUID()
    const jobDir = path.join(UPLOAD_DIR, jobId)
    mkdirSync(jobDir, { recursive: true })

    const inputPath = path.join(jobDir, `${jobId}.${sourceFormat}`)
    const buffer = Buffer.from(await file.arrayBuffer())
    writeFileSync(inputPath, buffer)

    let ext = targetFormat === "html" ? "htmlz" : targetFormat
    let outputPath = path.join(jobDir, `output.${ext}`)

    // Execute conversion with timeout
    const execFileAsync = promisify(execFile)
    const result = await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], {
      timeout: 120_000,
      maxBuffer: 50 * 1024 * 1024,
    })

    // Check if output exists
    if (!existsSync(outputPath)) {
      cleanupDir(jobDir)
      return NextResponse.json(
        { error: `Conversion failed: output file not generated. Stderr: ${result.stderr?.slice(0, 200)}` },
        { status: 500 }
      )
    }

    // Read and return output
    const outputData = readFileSync(outputPath)
    cleanupDir(jobDir)

    return new NextResponse(new Uint8Array(outputData), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${ext}"`,
        "X-Job-ID": jobId,
      },
    })
  } catch (err: any) {
    console.error("POST /api/convert error:", err.message, err.code)
    if (err.code === "ELIFECYCLE" || err.killed) {
      return NextResponse.json({ error: "Conversion timed out (120s)" }, { status: 504 })
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}

function cleanupDir(dir: string) {
  try { rmSync(dir, { recursive: true, force: true }) } catch {}
}

export const runtime = "nodejs"
export const maxDuration = 120