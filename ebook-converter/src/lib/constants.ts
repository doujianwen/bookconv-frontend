/**
 * Site-wide constants: keywords, phases, and utility helpers.
 */

export interface KeywordData {
  source: string;
  target: string;
  keyword: string;
  kd: number;        // keyword difficulty (0-100)
  searchVolume: number; // monthly searches (approximate)
  phase: string;
  status: string;
}

export const PHASES = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];

export const KEYWORDS: KeywordData[] = [
  // P0 — Core conversion pages (highest priority)
  // KD calibrated to Ahrefs Free KD Checker (2026-07-09 report) — prior values were inflated 30-70 pts.
  { source: 'epub', target: 'pdf', keyword: 'epub to pdf converter', kd: 38, searchVolume: 18100, phase: 'P0', status: 'live' },
  { source: 'mobi', target: 'epub', keyword: 'mobi to epub converter', kd: 2, searchVolume: 9900, phase: 'P0', status: 'live' },
  { source: 'azw3', target: 'epub', keyword: 'azw3 to epub converter', kd: 0, searchVolume: 5400, phase: 'P0', status: 'live' },
  { source: 'pdf', target: 'epub', keyword: 'pdf to epub converter', kd: 8, searchVolume: 12100, phase: 'P0', status: 'live' },
  { source: 'docx', target: 'epub', keyword: 'docx to epub converter', kd: 1, searchVolume: 3600, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'mobi', keyword: 'epub to mobi converter', kd: 10, searchVolume: 8100, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'azw3', keyword: 'epub to azw3 converter', kd: 0, searchVolume: 4400, phase: 'P0', status: 'live' },
  { source: 'txt', target: 'epub', keyword: 'txt to epub converter', kd: 1, searchVolume: 2900, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'txt', keyword: 'epub to text converter', kd: 2, searchVolume: 3600, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'html', keyword: 'epub to html converter', kd: 0, searchVolume: 2400, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'doc', keyword: 'epub to word converter', kd: 1, searchVolume: 2900, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'word', keyword: 'epub to word', kd: 1, searchVolume: 1000, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'rtf', keyword: 'epub to rtf converter', kd: 0, searchVolume: 1900, phase: 'P0', status: 'live' },
  { source: 'mobi', target: 'txt', keyword: 'mobi to text converter', kd: 0, searchVolume: 1600, phase: 'P0', status: 'live' },
  { source: 'mobi', target: 'pdf', keyword: 'mobi to pdf converter', kd: 5, searchVolume: 3600, phase: 'P0', status: 'live' },
  { source: 'azw3', target: 'pdf', keyword: 'azw3 to pdf converter', kd: 2, searchVolume: 1900, phase: 'P0', status: 'live' },
  { source: 'azw3', target: 'mobi', keyword: 'azw3 to mobi converter', kd: 0, searchVolume: 2400, phase: 'P0', status: 'live' },
  { source: 'fb2', target: 'epub', keyword: 'fb2 to epub converter', kd: 0, searchVolume: 1300, phase: 'P0', status: 'live' },
  { source: 'lit', target: 'epub', keyword: 'lit to epub converter', kd: 0, searchVolume: 1600, phase: 'P0', status: 'live' },
  { source: 'doc', target: 'epub', keyword: 'doc to epub converter', kd: 3, searchVolume: 2400, phase: 'P0', status: 'live' },
  { source: 'cbr', target: 'pdf', keyword: 'cbr to pdf converter', kd: 5, searchVolume: 1300, phase: 'P0', status: 'live' },
  { source: 'djvu', target: 'pdf', keyword: 'djvu to pdf converter', kd: 8, searchVolume: 1000, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'jpg', keyword: 'epub to jpg converter', kd: 0, searchVolume: 1600, phase: 'P0', status: 'live' },
  { source: 'epub', target: 'png', keyword: 'epub to png converter', kd: 0, searchVolume: 1300, phase: 'P0', status: 'live' },
  { source: 'html', target: 'epub', keyword: 'html to epub converter', kd: 1, searchVolume: 1900, phase: 'P0', status: 'live' },

  // P1 — High-value expansions (head terms keep realistic high KD; rtf-to-epub calibrated to Ahrefs)
  { source: 'pdf', target: 'txt', keyword: 'pdf to text extractor', kd: 68, searchVolume: 8100, phase: 'P1', status: 'planned' },
  { source: 'pdf', target: 'docx', keyword: 'pdf to word converter', kd: 85, searchVolume: 22200, phase: 'P1', status: 'planned' },
  { source: 'txt', target: 'pdf', keyword: 'txt to pdf converter', kd: 50, searchVolume: 5400, phase: 'P1', status: 'planned' },
  { source: 'docx', target: 'pdf', keyword: 'word to pdf converter', kd: 90, searchVolume: 33100, phase: 'P1', status: 'planned' },
  { source: 'rtf', target: 'epub', keyword: 'rtf to epub converter', kd: 0, searchVolume: 1000, phase: 'P1', status: 'planned' },
  { source: 'odt', target: 'epub', keyword: 'odt to epub converter', kd: 22, searchVolume: 800, phase: 'P1', status: 'planned' },
  { source: 'epub', target: 'odt', keyword: 'epub to odt converter', kd: 20, searchVolume: 600, phase: 'P1', status: 'planned' },
  { source: 'azw', target: 'epub', keyword: 'azw to epub converter', kd: 28, searchVolume: 1000, phase: 'P1', status: 'planned' },
  { source: 'pdb', target: 'epub', keyword: 'pdb to epub converter', kd: 18, searchVolume: 400, phase: 'P1', status: 'planned' },

  // P2 — Long-tail keywords (no Ahrefs validation; estimates retained)
  { source: 'epub', target: 'lrf', keyword: 'epub to lrf converter', kd: 15, searchVolume: 200, phase: 'P2', status: 'planned' },
  { source: 'prc', target: 'epub', keyword: 'prc to epub converter', kd: 12, searchVolume: 300, phase: 'P2', status: 'planned' },
  { source: 'snb', target: 'epub', keyword: 'snb to epub converter', kd: 10, searchVolume: 200, phase: 'P2', status: 'planned' },
  { source: 'pml', target: 'epub', keyword: 'pml to epub converter', kd: 8, searchVolume: 100, phase: 'P2', status: 'planned' },
  { source: 'cbz', target: 'pdf', keyword: 'cbz to pdf converter', kd: 18, searchVolume: 600, phase: 'P2', status: 'planned' },
  { source: 'pdf', target: 'mobi', keyword: 'pdf to mobi converter', kd: 40, searchVolume: 2900, phase: 'P2', status: 'planned' },
  { source: 'pdf', target: 'azw3', keyword: 'pdf to azw3 converter', kd: 35, searchVolume: 1900, phase: 'P2', status: 'planned' },
  { source: 'txt', target: 'mobi', keyword: 'txt to mobi converter', kd: 25, searchVolume: 1300, phase: 'P2', status: 'planned' },
  { source: 'txt', target: 'azw3', keyword: 'txt to azw3 converter', kd: 22, searchVolume: 1000, phase: 'P2', status: 'planned' },
  { source: 'pdf', target: 'azw', keyword: 'pdf to azw converter', kd: 20, searchVolume: 800, phase: 'P2', status: 'planned' },

  // P3 — Very low search volume
  { source: 'html', target: 'pdf', keyword: 'html to pdf converter', kd: 70, searchVolume: 12100, phase: 'P3', status: 'planned' },
  { source: 'epub', target: 'zip', keyword: 'epub to zip', kd: 15, searchVolume: 400, phase: 'P3', status: 'planned' },
];

/** Filter keywords by phase */
export function getKeywordsByPhase(phase: string): KeywordData[] {
  return KEYWORDS.filter((kw) => kw.phase === phase);
}

/** Return only P0 keywords (core pages) */
export function getP0Keywords(): KeywordData[] {
  return KEYWORDS.filter((kw) => kw.phase === 'P0');
}

/** Get site base URL dynamically */
export function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://www.bookconv.com';
}
