// G1 provisional mapping code-evidence test (2026-11-21).
// Locks the deterministic code-side basis for the three PROVISIONAL mappings in
// _wb_tmp/ga4-g1-error-adoption-2026-11-13.json. This is CODE evidence only —
// it does NOT claim production adoption (GA4 rows on 11-13 were still UNKNOWN).
import { classifyGAError } from "@/lib/ga-error-classification";

describe("G1 provisional mapping — code-side basis", () => {
  it("'Failed to fetch' -> CONVERSION_UNAVAILABLE", () => {
    expect(classifyGAError(new Error("Failed to fetch"))).toBe("CONVERSION_UNAVAILABLE");
  });

  it("'Request failed (HTTP 403). Please try again.' -> PERMISSION_DENIED", () => {
    expect(classifyGAError(new Error("Request failed (HTTP 403). Please try again."))).toBe("PERMISSION_DENIED");
  });

  it("'The conversion service returned an error...' -> CONVERSION_UNAVAILABLE", () => {
    expect(classifyGAError(new Error("The conversion service returned an error. Please try again or use a different file."))).toBe("CONVERSION_UNAVAILABLE");
  });

  it("negative control: unrelated text stays UNKNOWN (mapping is not catch-all)", () => {
    expect(classifyGAError(new Error("totally different message"))).toBe("UNKNOWN");
  });
});
