// src/lib/storage/local.ts
// Local file storage helpers for ebook conversion results.
// Used as fallback when Cloudflare R2 is not configured.

import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const MAX_LOCAL_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for local storage

/**
 * Save a converted file to local storage.
 * Returns the relative path (key) for later retrieval.
 */
export function saveToLocal(key: string, buffer: Buffer): string {
  const dir = path.join(UPLOAD_DIR, 'local-results');
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, key);
  writeFileSync(filePath, buffer);
  return key;
}

/**
 * Read a file from local storage.
 * Returns null if file doesn't exist or exceeds size limit.
 */
export function readFromLocal(key: string): Buffer | null {
  const filePath = path.join(UPLOAD_DIR, 'local-results', key);
  if (!existsSync(filePath)) return null;

  const stats = require('node:fs').statSync(filePath);
  if (stats.size > MAX_LOCAL_FILE_SIZE) {
    console.warn(`Local file ${key} exceeds max size (${stats.size} bytes)`);
    return null;
  }

  return readFileSync(filePath);
}

/**
 * Delete a file from local storage.
 */
export function deleteLocal(key: string): void {
  const filePath = path.join(UPLOAD_DIR, 'local-results', key);
  try {
    rmSync(filePath, { force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Check if a file exists in local storage.
 */
export function existsLocal(key: string): boolean {
  const filePath = path.join(UPLOAD_DIR, 'local-results', key);
  return existsSync(filePath);
}

/**
 * Get file info from local storage.
 */
export function getLocalFileInfo(key: string): { size: number; path: string } | null {
  const filePath = path.join(UPLOAD_DIR, 'local-results', key);
  if (!existsSync(filePath)) return null;
  const stats = require('node:fs').statSync(filePath);
  return { size: stats.size, path: filePath };
}