import { classifyGAError, resolveGAErrorCode } from "./ga-error-classification";
describe("GA4 failure attribution fallback", () => {
  it("preserves known codes", () => expect(classifyGAError({cause:{code:"FILE_TOO_LARGE"}})).toBe("FILE_TOO_LARGE"));
  it("classifies fetch network failure", () => expect(classifyGAError(new TypeError("Failed to fetch"))).toBe("CONVERSION_UNAVAILABLE"));
  // Safari/WebKit 网络失败文案（Chrome 用 "Failed to fetch"），此前未覆盖 → UNKNOWN。
  it("classifies Safari 'Load failed' network error", () => expect(classifyGAError(new TypeError("Load failed"))).toBe("CONVERSION_UNAVAILABLE"));
  // 边界：\\b 锚定后不得误吃无关的 "download failed"（否则会把非网络失败误判成服务不可用）。
  it("does not misclassify unrelated 'download failed' text", () => expect(classifyGAError(new Error("download failed"))).toBe("UNKNOWN"));
  it("classifies HTTP403 without assuming server root cause", () => expect(classifyGAError({message:"Request failed (HTTP 403). Please try again.",cause:{status:403}})).toBe("PERMISSION_DENIED"));
  it("classifies service unavailable", () => expect(classifyGAError({message:"The conversion service returned an error. Please try again or use a different file."})).toBe("CONVERSION_UNAVAILABLE"));
  it("replaces generic INTERNAL_ERROR with observed network attribution", () => expect(resolveGAErrorCode("INTERNAL_ERROR", new Error("Failed to fetch"))).toBe("CONVERSION_UNAVAILABLE"));
  it("preserves specific mapped codes", () => expect(resolveGAErrorCode("CORRUPT_INPUT", new Error("Failed to fetch"))).toBe("CORRUPT_INPUT"));
  it("preserves unknown", () => expect(classifyGAError(new Error("unclassified"))).toBe("UNKNOWN"));
});
