// End-to-end smoke test for MOBI/AZW3 *source* pure-JS pairs.
//
// Background (audit 2026-10-22): the shared `mobiToTxt` extractor could not parse
// real MOBI/AZW3 files (it only scanned the first 4KB for raw <html>/<body> tags).
// A proper extractor is now implemented in conversion.ts (PalmDB → MOBI header →
// PalmDOC-decompress text records → plain text). These tests verify the 10 pairs
// mobi/azw3 source × {epub,rtf,docx,fb2,txt} produce READABLE output using two
// real fixtures (sample.mobi / sample.azw3).
//
// NOTE: LIT-source pairs are NOT covered here — LIT is a CHM/ITSS container, not
// Mobipocket, and still routes through mobiToTxt which will throw a clear
// "not a Mobipocket file" error. A separate LIT extractor is out of scope.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { executeConversion } from '@/lib/conversion';

const REPO = process.cwd();
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const FIX = {
  mobi: join(REPO, 'tests/fixtures/sample.mobi'),
  azw3: join(REPO, 'tests/fixtures/sample.azw3'),
};

describe('mobi/azw3 fixtures are genuine (real MOBI/AZW3, not the 1KB stub)', () => {
  for (const [name, p] of Object.entries(FIX)) {
    it(`${name} fixture is a real MOBI/AZW3`, () => {
      const b = require('node:fs').readFileSync(p);
      expect(b.length).toBeGreaterThan(2000);
      expect(b.includes(Buffer.from('BOOKMOBI'))).toBe(true);
    });
  }
});

// Active end-to-end verification: the pure-JS mobi/azw3 source path must
// produce READABLE output, not just a non-error. We assert the converted text
// actually contains word-like tokens (proves the MOBI extractor works on real
// files, not just that it didn't throw).
describe('pure-JS MOBI/AZW3 source conversions (real fixtures)', () => {
  const TARGETS = ['epub', 'rtf', 'docx', 'fb2', 'txt'] as const;
  for (const source of ['mobi', 'azw3'] as const) {
    for (const target of TARGETS) {
      it(`${source} -> ${target}`, async () => {
        expect(existsSync(FIX[source])).toBe(true);
        const jobId = `smoke-${source}-${target}`;
        const res = await executeConversion(null, FIX[source], source, target, jobId);
        expect(res).toBeDefined();
        const b64 = (res as any).base64Data as string;
        expect(typeof b64).toBe('string');
        expect(b64.length).toBeGreaterThan(0);
        const buf = Buffer.from(b64, 'base64');
        switch (target) {
          case 'epub':
          case 'docx':
            expect(buf.subarray(0, 2).toString('latin1')).toBe('PK');
            break;
          case 'rtf':
            expect(buf.subarray(0, 5).toString('latin1')).toBe('{\\rtf');
            break;
          case 'fb2':
            expect(buf.subarray(0, 5).toString('latin1')).toBe('<?xml');
            break;
          case 'txt': {
            const txt = buf.toString('utf8');
            // Readable: contains word-like tokens (not the legacy extractor error).
            expect(txt).not.toContain('could not locate text content');
            expect(txt.length).toBeGreaterThan(20);
            expect(/\w{3,}/.test(txt)).toBe(true);
            break;
          }
        }
        const jobDir = join(UPLOAD_DIR, jobId);
        if (existsSync(jobDir)) require('node:fs').rmSync(jobDir, { recursive: true, force: true });
      });
    }
  }
});
