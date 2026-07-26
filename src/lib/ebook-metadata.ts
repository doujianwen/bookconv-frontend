"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface EbookMetadata {
  title?: string
  author?: string
  publisher?: string
  language?: string
  isbn?: string
  description?: string
  publishedDate?: string
  subject?: string
}

export function extractEbookMetadata(file: File): Promise<EbookMetadata> {
  return new Promise((resolve) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    
    // EPUB: zip-based, read META-INF/container.xml + OPF file
    if (ext === "epub") {
      readEpubMetadata(file).then(resolve).catch(() => resolve({}))
      return
    }
    
    // PDF: try to parse basic metadata
    if (ext === "pdf") {
      readPdfMetadata(file).then(resolve).catch(() => resolve({}))
      return
    }
    
    // MOBI/AZW3: basic header parsing
    if (["mobi", "azw3", "azw"].includes(ext)) {
      readMobiMetadata(file).then(resolve).catch(() => resolve({}))
      return
    }
    
    // FB2: XML-based
    if (ext === "fb2") {
      readFb2Metadata(file).then(resolve).catch(() => resolve({}))
      return
    }
    
    // DOCX: zip-based, read docProps/app.xml and docProps/core.xml
    if (ext === "docx") {
      readDocxMetadata(file).then(resolve).catch(() => resolve({}))
      return
    }
    
    // TXT: try to read first few lines for metadata hints
    if (ext === "txt") {
      readTxtMetadata(file).then(resolve).catch(() => resolve({}))
      return
    }
    
    resolve({})
  })
}

async function readEpubMetadata(file: File): Promise<EbookMetadata> {
  // Use JSZip-like approach: epub is a ZIP
  const buffer = await file.arrayBuffer()
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  
  // Check ZIP signature
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
    throw new Error("Not a valid EPUB")
  }
  
  // Find central directory
  let cdOffset = -1
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      cdOffset = i + 16
      break
    }
  }
  
  if (cdOffset < 0) throw new Error("No central directory found")
  
  const cdEntries = view.getUint32(cdOffset, true)
  const cdStart = view.getUint32(cdOffset + 4, true)
  
  let metaPath = ""
  let opfPath = ""
  
  // Find container.xml first
  for (let e = 0; e < cdEntries; e++) {
    const entryOffset = cdStart + e * 46
    const nameLen = view.getUint16(entryOffset + 28, true)
    const fileName = new TextDecoder().decode(bytes.slice(entryOffset + 46, entryOffset + 46 + nameLen))
    
    if (fileName === "META-INF/container.xml") {
      const cNameLen = view.getUint16(entryOffset + 24, true)
      const cOffset = view.getUint32(entryOffset + 20, true)
      metaPath = new TextDecoder().decode(bytes.slice(cOffset, cOffset + cNameLen))
      break
    }
  }
  
  if (!metaPath) throw new Error("container.xml not found")
  
  // Parse container.xml to find OPF path
  const metaEntryOffset = cdStart
  for (let e = 0; e < cdEntries; e++) {
    const entryOffset = cdStart + e * 46
    const nameLen = view.getUint16(entryOffset + 28, true)
    const fileName = new TextDecoder().decode(bytes.slice(entryOffset + 46, entryOffset + 46 + nameLen))
    
    if (fileName === metaPath) {
      const cNameLen = view.getUint16(entryOffset + 24, true)
      const cOffset = view.getUint32(entryOffset + 20, true)
      const content = new TextDecoder().decode(bytes.slice(cOffset, cOffset + cNameLen))
      
      const match = content.match(/full-path="([^"]+)"/)
      if (match) opfPath = match[1]
      break
    }
  }
  
  if (!opfPath) throw new Error("OPF path not found")
  
  // Read OPF file
  let opfContent = ""
  for (let e = 0; e < cdEntries; e++) {
    const entryOffset = cdStart + e * 46
    const nameLen = view.getUint16(entryOffset + 28, true)
    const fileName = new TextDecoder().decode(bytes.slice(entryOffset + 46, entryOffset + 46 + nameLen))
    
    if (fileName === opfPath) {
      const cNameLen = view.getUint16(entryOffset + 24, true)
      const cOffset = view.getUint32(entryOffset + 20, true)
      opfContent = new TextDecoder().decode(bytes.slice(cOffset, cOffset + cNameLen))
      break
    }
  }
  
  if (!opfContent) throw new Error("OPF content not found")
  
  const meta: EbookMetadata = {}
  
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i)
  if (titleMatch) meta.title = titleMatch[1].trim()
  
  const authorMatches = opfContent.matchAll(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/gi)
  for (const m of authorMatches) {
    if (!meta.author) meta.author = m[1].trim()
    else meta.author += ", " + m[1].trim()
  }
  
  const publisherMatch = opfContent.match(/<dc:publisher[^>]*>([^<]+)<\/dc:publisher>/i)
  if (publisherMatch) meta.publisher = publisherMatch[1].trim()
  
  const langMatch = opfContent.match(/<dc:language[^>]*>([^<]+)<\/dc:language>/i)
  if (langMatch) meta.language = langMatch[1].trim()
  
  const isbnMatch = opfContent.match(/<meta[^>]*name=["']identifier["'][^>]*content=["']([^']+)["']/i)
  if (isbnMatch) meta.isbn = isbnMatch[1]
  else {
    const idMatch = opfContent.match(/<dc:identifier[^>]*>([^<]+)<\/dc:identifier>/i)
    if (idMatch) meta.isbn = idMatch[1].trim()
  }
  
  const descMatch = opfContent.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i)
  if (descMatch) meta.description = descMatch[1].trim()
  
  const pubDateMatch = opfContent.match(/<dc:date[^>]*>([^<]+)<\/dc:date>/i)
  if (pubDateMatch) meta.publishedDate = pubDateMatch[1].trim()
  
  const subjectMatches = opfContent.matchAll(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/gi)
  for (const m of subjectMatches) {
    if (!meta.subject) meta.subject = m[1].trim()
    else meta.subject += "; " + m[1].trim()
  }
  
  return meta
}

async function readPdfMetadata(file: File): Promise<EbookMetadata> {
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder().decode(buffer)
  const meta: EbookMetadata = {}
  
  // PDF Info dictionary
  const infoMatch = text.match(/\(\(Title\s*:\s*([^)]+)\)/)
  if (infoMatch) meta.title = infoMatch[1].trim()
  
  const authorMatch = text.match(/\(\(Author\s*:\s*([^)]+)\)/)
  if (authorMatch) meta.author = authorMatch[1].trim()
  
  const subjMatch = text.match(/\(\(Subject\s*:\s*([^)]+)\)/)
  if (subjMatch) meta.subject = subjMatch[1].trim()
  
  const keyMatch = text.match(/\(\(Keywords\s*:\s*([^)]+)\)/)
  if (keyMatch) meta.subject = keyMatch[1].trim()
  
  const dateMatch = text.match(/\(\(CreationDate\s*:\s*([^)]+)\)/)
  if (dateMatch) meta.publishedDate = dateMatch[1].trim()
  
  const creatorMatch = text.match(/\(\(Creator\s*:\s*([^)]+)\)/)
  if (creatorMatch) meta.publisher = creatorMatch[1].trim()
  
  return meta
}

async function readMobiMetadata(file: File): Promise<EbookMetadata> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const decoder = new TextDecoder("latin1")
  const meta: EbookMetadata = {}
  
  // Look for TITLE, AUTHOR, PUBLISHER in EXTH headers
  // Mobi has a simple text search approach for metadata
  const text = decoder.decode(bytes.slice(0, Math.min(1024 * 1024, bytes.length)))
  
  // Search for common metadata markers
  const patterns: Record<string, RegExp> = {
    title: /TITLE\s+(.+?)(?:\n|$)/i,
    author: /AUTHOR\s+(.+?)(?:\n|$)/i,
    publisher: /PUBLISHER\s+(.+?)(?:\n|$)/i,
    isbn: /ISBN\s+(\S+)/i,
    language: /LANGUAGE\s+(\S+)/i,
  }
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      if (key === "title") meta.title = match[1].trim()
      else if (key === "author") meta.author = match[1].trim()
      else if (key === "publisher") meta.publisher = match[1].trim()
      else if (key === "isbn") meta.isbn = match[1].trim()
      else if (key === "language") meta.language = match[1].trim()
    }
  }
  
  return meta
}

async function readFb2Metadata(file: File): Promise<EbookMetadata> {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, "text/xml")
  const meta: EbookMetadata = {}
  
  const title = doc.querySelector("title work-title")
  if (title) meta.title = title.textContent?.trim() || undefined
  
  const author = doc.querySelector("author first-name")
  if (author) {
    const firstName = author.textContent?.trim() || ""
    const lastName = doc.querySelector("author last-name")?.textContent?.trim() || ""
    const middleName = doc.querySelector("author middle-name")?.textContent?.trim() || ""
    meta.author = [firstName, middleName, lastName].filter(Boolean).join(" ")
  }
  
  const genre = doc.querySelector("genre")
  if (genre) meta.subject = genre.textContent?.trim() || undefined
  
  const publisher = doc.querySelector("publisher")
  if (publisher) meta.publisher = publisher.textContent?.trim() || undefined
  
  return meta
}

async function readDocxMetadata(file: File): Promise<EbookMetadata> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const decoder = new TextDecoder("utf-8")
  const meta: EbookMetadata = {}
  
  // DOCX is a ZIP — look for core.xml content
  const view = new DataView(buffer)
  
  // Find core.xml file in the ZIP
  // Search for "docProps/core.xml" in the central directory entries
  const text = decoder.decode(bytes)
  
  // Simple regex-based extraction from core.xml content
  const titleMatch = text.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/)
  if (titleMatch) meta.title = titleMatch[1].trim()
  
  const creatorMatch = text.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/)
  if (creatorMatch) meta.author = creatorMatch[1].trim()
  
  const subjectMatch = text.match(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/)
  if (subjectMatch) meta.subject = subjectMatch[1].trim()
  
  const descMatch = text.match(/<dcterms:created[^>]*>([^<]+)<\/dcterms:created>/)
  if (descMatch) meta.publishedDate = descMatch[1].trim()
  
  return meta
}

async function readTxtMetadata(file: File): Promise<EbookMetadata> {
  const text = await file.text()
  const meta: EbookMetadata = {}
  const lines = text.split("\n").slice(0, 100)
  
  // Look for common metadata patterns
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Title patterns
    if (/^title\s*[:=]\s*/i.test(trimmed) && !meta.title) {
      meta.title = trimmed.replace(/^title\s*[:=]\s*/i, "").trim()
      continue
    }
    
    // Author patterns
    if (/^author\s*[:=]\s*/i.test(trimmed) && !meta.author) {
      meta.author = trimmed.replace(/^author\s*[:=]\s*/i, "").trim()
      continue
    }
    
    // Language patterns
    if (/^(lang|language)\s*[:=]\s*/i.test(trimmed) && !meta.language) {
      meta.language = trimmed.replace(/^(lang|language)\s*[:=]\s*/i, "").trim()
      continue
    }
  }
  
  return meta
}

// Estimate page count based on file type and size
export function estimatePageCount(file: File, format: string): number | undefined {
  const sizeMB = file.size / (1024 * 1024)
  switch (format.toLowerCase()) {
    case "pdf":
      return Math.max(1, Math.round(sizeMB * 5))
    case "djvu":
      return Math.max(1, Math.round(sizeMB * 8))
    case "cbr":
    case "cbz":
      return Math.max(1, Math.round(sizeMB * 10))
    case "epub":
    case "fb2":
      return Math.max(1, Math.round(sizeMB * 30))
    case "mobi":
    case "azw3":
    case "azw":
      return Math.max(1, Math.round(sizeMB * 25))
    case "txt":
    case "docx":
      return Math.max(1, Math.round(sizeMB * 20))
    default:
      return undefined
  }
}
