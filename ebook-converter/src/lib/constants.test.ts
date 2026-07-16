import { KEYWORDS, getKeywordsByPhase, getP0Keywords, PHASES } from "./constants";

describe("KEYWORDS data", () => {
  it("has keywords defined", () => {
    expect(KEYWORDS.length).toBeGreaterThan(0);
  });

  it("all keywords have required fields", () => {
    KEYWORDS.forEach((kw) => {
      expect(kw.source).toBeDefined();
      expect(kw.target).toBeDefined();
      expect(kw.kd).toBeDefined();
      expect(kw.phase).toBeDefined();
      expect(kw.status).toBeDefined();
    });
  });

  it("phases are valid", () => {
    KEYWORDS.forEach((kw) => {
      expect(PHASES).toContain(kw.phase);
    });
  });
});

describe("getKeywordsByPhase", () => {
  it("filters keywords by phase", () => {
    const p0 = getKeywordsByPhase("P0");
    expect(p0.length).toBeGreaterThan(0);
    p0.forEach((kw) => expect(kw.phase).toBe("P0"));
  });

  it("returns empty array for non-existent phase", () => {
    const result = getKeywordsByPhase("P99");
    expect(result).toEqual([]);
  });
});

describe("getP0Keywords", () => {
  it("returns only P0 keywords", () => {
    const p0 = getP0Keywords();
    expect(p0.length).toBeGreaterThan(0);
    p0.forEach((kw) => expect(kw.phase).toBe("P0"));
  });
});
