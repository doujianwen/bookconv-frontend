import { Worker, Queue, type Job } from "bullmq"
import { createWriteStream } from "node:fs"
import { mkdir, unlink, rename } from "node:fs/promises"
import path from "node:path"
import { pipeline } from "node:stream/promises"
import {
  convertWithCalibre,
  convertEpubToImages,
  convertDocToEpub,
  convertDjvuToPdf,
} from "./converters/calibre.js"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
const CONVERSION_DIR = process.env.CONVERSION_DIR || "/tmp/conversions"
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024
const CONVERSION_TIMEOUT = parseInt(process.env.CONVERSION_TIMEOUT_SEC || "120", 10) * 1000

interface ConversionJob {
  jobId: string
  inputPath: string
  sourceFormat: string
  targetFormat: string
  quality?: "default" | "high"
}

const conversionQueue = new Queue("ebook-conversions", {
  connection: { url: REDIS_URL },
})

const worker = new Worker<ConversionJob>(
  "ebook-conversions",
  async (job: Job<ConversionJob>) => {
    const { jobId, inputPath, sourceFormat, targetFormat, quality } = job.data

    const jobDir = path.join(CONVERSION_DIR, jobId)
    await mkdir(jobDir, { recursive: true })

    const ext = targetFormat === "jpg" || targetFormat === "png" ? targetFormat : targetFormat
    const outputPath = path.join(jobDir, `output.${ext}`)

    // Report progress
    await job.updateProgress(10)

    let result

    // Route to correct converter based on format pair
    const key = `${sourceFormat}-${targetFormat}`

    if (targetFormat === "jpg" || targetFormat === "png") {
      result = await convertEpubToImages(inputPath, jobDir, targetFormat)
    } else if (key === "doc-epub") {
      result = await convertDocToEpub(inputPath, outputPath)
    } else if (key === "djvu-pdf") {
      result = await convertDjvuToPdf(inputPath, outputPath)
    } else {
      result = await convertWithCalibre(inputPath, outputPath, {
        sourceFormat,
        targetFormat,
        quality,
      })
    }

    await job.updateProgress(90)

    if (!result.success) {
      throw new Error(result.error || "Conversion failed")
    }

    // For image conversions, the output is a directory with multiple files
    // For single-file conversions, the output is a single file
    const finalPath = result.outputPath

    await job.updateProgress(100)

    return { outputPath: finalPath, format: targetFormat }
  },
  {
    connection: { url: REDIS_URL },
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60_000, // 5 jobs per minute per worker
    },
  }
)

// Health check server
import { createServer } from "node:http"
const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok", worker: worker.id }))
  } else {
    res.writeHead(404)
    res.end()
  }
})
server.listen(3001)

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed: ${job.returnvalue?.outputPath}`)
})

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

console.log(`Worker ${worker.id} started, listening on :3001`)

export { conversionQueue }