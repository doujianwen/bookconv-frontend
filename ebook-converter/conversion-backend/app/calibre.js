// app/calibre.js
// Pure-Node wrapper around the `ebook-convert` (Calibre) CLI.
// Ported from worker/src/converters/calibre.ts — kept dependency-free on purpose
// so the backend runs as a plain Node service with no TS build step.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unlink } from "node:fs/promises";

const execFileAsync = promisify(execFile);

// Calibre binary (override with CALIBRE_BIN if not on PATH, e.g. tests)
const CALIBRE_BIN = process.env.CALIBRE_BIN || "ebook-convert";

/**
 * Run Calibre to convert inputPath -> outputPath.
 * @returns {{success:boolean, outputPath?:string, error?:string}}
 */
export async function convertWithCalibre(inputPath, outputPath, opts = {}) {
  const { targetFormat, quality, extraArgs, timeout = 120_000, maxBuffer = 10 * 1024 * 1024 } = opts;
  const args = [inputPath, outputPath];

  if (quality === "high") {
    if (targetFormat === "pdf") {
      args.push("--pdf-page-numbers", "--pretty-print");
    }
    if (targetFormat === "epub") {
      args.push("--pretty-print");
    }
  }
  // Plain-text output: skip cover image / chapter TOC noise
  if (targetFormat === "txt" || targetFormat === "text") {
    args.push("--dont-add-chapters-to-toc");
  }
  if (extraArgs && Array.isArray(extraArgs)) {
    args.push(...extraArgs);
  }

  try {
    // Windows batch wrappers (.cmd/.bat) need a shell to execute; on Linux the
    // real binary is `ebook-convert` so this branch is a no-op in production.
    const useShell = /\.(cmd|bat)$/i.test(CALIBRE_BIN);
    await execFileAsync(CALIBRE_BIN, args, { timeout, maxBuffer, shell: useShell });
    return { success: true, outputPath };
  } catch (err) {
    const message = (err && (err.stderr || err.message)) || "Unknown conversion error";
    // Clean up a possibly-partial output so we never stream a corrupt file
    try {
      await unlink(outputPath);
    } catch {
      /* ignore */
    }
    if (typeof message === "string" && message.includes("DRM")) {
      return { success: false, error: "This file is protected by DRM and cannot be converted." };
    }
    return { success: false, error: `Conversion failed: ${String(message).slice(0, 200)}` };
  }
}
