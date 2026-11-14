import { classifyGAError, resolveGAErrorCode } from "./ga-error-classification";
describe("GA4 failure attribution fallback", () => {
  it("preserves known codes", () => expect(classifyGAError({cause:{code:"FILE_TOO_LARGE"}})).toBe("FILE_TOO_LARGE"));
  it("classifies fetch network failure", () => expect(classifyGAError(new TypeError("Failed to fetch"))).toBe("CONVERSION_UNAVAILABLE"));
  it("classifies HTTP403 without assuming server root cause", () => expect(classifyGAError({message:"Request failed (HTTP 403). Please try again.",cause:{status:403}})).toBe("PERMISSION_DENIED"));
  it("classifies service unavailable", () => expect(classifyGAError({message:"The conversion service returned an error. Please try again or use a different file."})).toBe("CONVERSION_UNAVAILABLE"));
  it("replaces generic INTERNAL_ERROR with observed network attribution", () => expect(resolveGAErrorCode("INTERNAL_ERROR", new Error("Failed to fetch"))).toBe("CONVERSION_UNAVAILABLE"));
  it("preserves specific mapped codes", () => expect(resolveGAErrorCode("CORRUPT_INPUT", new Error("Failed to fetch"))).toBe("CORRUPT_INPUT"));
  it("preserves unknown", () => expect(classifyGAError(new Error("unclassified"))).toBe("UNKNOWN"));
});
