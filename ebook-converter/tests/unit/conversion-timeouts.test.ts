// Unit tests for the centralized conversion timeout budget (P0 G-C; round2 P0-B).
// Round2 added: budget-inversion guard + source-literal drift guard (the 3 files
// that cannot import the TS module are checked by reading their source text).
import fs from "node:fs";
import path from "node:path";
import {
  CONVERSION_EDGE_MAX_SECONDS,
  CONVERSION_CLIENT_TIMEOUT_MS,
  CONVERSION_BACKEND_TIMEOUT_MS,
  CALIBRE_TIMEOUT_MS,
  CONVERSION_TIMEOUT_BUDGET,
  CONVERSION_TIMEOUT_CANCEL_CONTRACT,
} from "@/lib/conversion-timeouts";

const repoRoot = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(repoRoot, rel), "utf8");

describe("conversion timeout budget (single source of truth)", () => {
  it("keeps delegate/edge values unchanged; calibre lowered to break inversion", () => {
    expect(CONVERSION_EDGE_MAX_SECONDS).toBe(300);
    expect(CONVERSION_BACKEND_TIMEOUT_MS).toBe(90_000);
    expect(CALIBRE_TIMEOUT_MS).toBe(60_000); // round2: was 120_000 (inverted)
  });

  it("client abort aligns to edge hard kill (no silent platform-timeout gap)", () => {
    expect(CONVERSION_CLIENT_TIMEOUT_MS).toBe(CONVERSION_EDGE_MAX_SECONDS * 1000);
    expect(CONVERSION_CLIENT_TIMEOUT_MS).toBe(300_000);
  });

  it("budget is strictly monotonic outer→inner (no orphan job)", () => {
    // calibre < delegate < client == edge*1000. Guards against the exact
    // inversion that round1 shipped (calibre 120s > delegate 90s).
    expect(CALIBRE_TIMEOUT_MS).toBeLessThan(CONVERSION_BACKEND_TIMEOUT_MS);
    expect(CONVERSION_BACKEND_TIMEOUT_MS).toBeLessThan(CONVERSION_CLIENT_TIMEOUT_MS);
    expect(CONVERSION_CLIENT_TIMEOUT_MS).toBe(CONVERSION_EDGE_MAX_SECONDS * 1000);
  });

  it("exposes a frozen-shaped audit summary with the new calibre value", () => {
    expect(CONVERSION_TIMEOUT_BUDGET).toEqual({
      edgeMaxSeconds: 300,
      clientTimeoutMs: 300_000,
      backendDelegateMs: 90_000,
      calibreMs: 60_000,
    });
  });

  it("states cancellation propagation honestly (client abort != edge abort)", () => {
    expect(CONVERSION_TIMEOUT_CANCEL_CONTRACT.clientAbortPropagatesToEdge).toBe(false);
    expect(CONVERSION_TIMEOUT_CANCEL_CONTRACT.edgeAbortPropagatesToCalibreChild).toBe(false);
    expect(CONVERSION_TIMEOUT_CANCEL_CONTRACT.orphanPrevention).toBe("calibre_timeout_lt_delegate_budget");
  });

  describe("source-literal drift guards (files that cannot import this module)", () => {
    it("edge route keeps maxDuration = 300 literal", () => {
      const src = read("src/app/api/convert/route.ts");
      expect(src).toMatch(/export const maxDuration = 300;/);
    });

    it("backend delegate default resolves to the shared constant (no local 90_000 literal)", () => {
      const src = read("src/lib/conversion-backend-client.ts");
      expect(src).toMatch(/DEFAULT_BACKEND_TIMEOUT_MS = CONVERSION_BACKEND_TIMEOUT_MS/);
      expect(src).not.toMatch(/const DEFAULT_BACKEND_TIMEOUT_MS = 90_000/);
    });

    it("backend index.js Calibre default is 60000 (no 120000 literal)", () => {
      const src = read("conversion-backend/app/index.js");
      expect(src).toMatch(/process\.env\.CALIBRE_TIMEOUT \|\| "60000"/);
      expect(src).not.toMatch(/process\.env\.CALIBRE_TIMEOUT \|\| "120000"/);
    });

    it("calibre.js defensive default floor is 60_000", () => {
      const src = read("conversion-backend/app/calibre.js");
      expect(src).toMatch(/timeout = 60_000/);
      expect(src).not.toMatch(/timeout = 120_000/);
    });
  });
});
