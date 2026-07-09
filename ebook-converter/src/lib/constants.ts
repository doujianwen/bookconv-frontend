export interface KeywordData {
  note?: string
  source: string
  target: string
  kd: number
  backlinksNeeded: number
  traffic: number | null // monthly traffic for #1
  hasRedditOrGithub: boolean
  phase: "P0" | "P1" | "P2" | "P3"
  status: "verified" | "new"
}

export const KEYWORDS: KeywordData[] = [
  // ---- P0: KD=0, 13 keywords ----
  { source: "epub", target: "azw3", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: false, phase: "P0", status: "verified" },
  { source: "azw3", target: "epub", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: true, phase: "P0", status: "verified" },
  { source: "epub", target: "rtf", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: false, phase: "P0", status: "verified" },
  { source: "epub", target: "jpg", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: false, phase: "P0", status: "verified" },
  { source: "epub", target: "html", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: true, phase: "P0", status: "verified" },
  { source: "epub", target: "doc", kd: 0, backlinksNeeded: 0, traffic: 388, hasRedditOrGithub: false, phase: "P0", status: "verified" },
  { source: "fb2", target: "epub", kd: 0, backlinksNeeded: 0, traffic: 242, hasRedditOrGithub: false, phase: "P0", status: "verified" },
  { source: "lit", target: "epub", kd: 0, backlinksNeeded: 0, traffic: 10800, hasRedditOrGithub: false, phase: "P0", status: "verified" },
  { source: "epub", target: "pdf", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: true, phase: "P0", status: "verified", note: "linux variant" },
  { source: "rtf", target: "epub", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: true, phase: "P0", status: "new" },
  { source: "epub", target: "png", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: true, phase: "P0", status: "new" },
  { source: "azw3", target: "mobi", kd: 0, backlinksNeeded: 0, traffic: 56, hasRedditOrGithub: true, phase: "P0", status: "new" },
  { source: "mobi", target: "txt", kd: 0, backlinksNeeded: 0, traffic: null, hasRedditOrGithub: false, phase: "P0", status: "new" },
  // ---- P1: KD=1-2, 7 keywords ----
  { source: "epub", target: "word", kd: 1, backlinksNeeded: 2, traffic: null, hasRedditOrGithub: true, phase: "P1", status: "verified" },
  { source: "docx", target: "epub", kd: 1, backlinksNeeded: 2, traffic: null, hasRedditOrGithub: true, phase: "P1", status: "verified" },
  { source: "txt", target: "epub", kd: 1, backlinksNeeded: 2, traffic: 197, hasRedditOrGithub: true, phase: "P1", status: "verified" },
  { source: "html", target: "epub", kd: 1, backlinksNeeded: 2, traffic: null, hasRedditOrGithub: true, phase: "P1", status: "new" },
  { source: "epub", target: "text", kd: 2, backlinksNeeded: 3, traffic: null, hasRedditOrGithub: true, phase: "P1", status: "verified" },
  { source: "azw3", target: "pdf", kd: 2, backlinksNeeded: 3, traffic: 2000, hasRedditOrGithub: false, phase: "P1", status: "verified" },
  { source: "mobi", target: "epub", kd: 2, backlinksNeeded: 3, traffic: 1600, hasRedditOrGithub: false, phase: "P1", status: "verified" },
  { source: "epub", target: "txt", kd: 2, backlinksNeeded: 3, traffic: 6500, hasRedditOrGithub: true, phase: "P1", status: "new" },
  // ---- P2: KD=3-8, 5 keywords ----
  { source: "doc", target: "epub", kd: 3, backlinksNeeded: 4, traffic: null, hasRedditOrGithub: true, phase: "P2", status: "new" },
  { source: "cbr", target: "pdf", kd: 5, backlinksNeeded: 6, traffic: 896, hasRedditOrGithub: true, phase: "P2", status: "verified" },
  { source: "mobi", target: "pdf", kd: 5, backlinksNeeded: 6, traffic: null, hasRedditOrGithub: false, phase: "P2", status: "verified" },
  { source: "pdf", target: "epub", kd: 8, backlinksNeeded: 9, traffic: 6800, hasRedditOrGithub: true, phase: "P2", status: "verified" },
  { source: "djvu", target: "pdf", kd: 8, backlinksNeeded: 9, traffic: 5900, hasRedditOrGithub: false, phase: "P2", status: "new" },
  // ---- P3: KD=10-38, 3 keywords ----
  { source: "epub", target: "mobi", kd: 10, backlinksNeeded: 11, traffic: 1600, hasRedditOrGithub: false, phase: "P3", status: "verified" },
  { source: "epub", target: "pdf", kd: 38, backlinksNeeded: 51, traffic: null, hasRedditOrGithub: false, phase: "P3", status: "verified", note: "hard" },
]

export const PHASES = ["P0", "P1", "P2", "P3"] as const

export function getKeywordsByPhase(phase: string) {
  return KEYWORDS.filter((k) => k.phase === phase)
}

export function getP0Keywords() {
  return getKeywordsByPhase("P0")
}
