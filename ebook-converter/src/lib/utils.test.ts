import { formatBytes, getSlug, getDisplayName, cn } from "./utils";

describe("formatBytes", () => {
  it("returns 0 B for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1_048_576)).toBe("1 MB");
    expect(formatBytes(1_610_612_736)).toBe("1.5 GB");
  });

  it("handles large numbers", () => {
    expect(formatBytes(10_737_418_240)).toBe("10 GB");
  });
});

describe("getSlug", () => {
  it("creates a slug from source and target formats", () => {
    expect(getSlug("EPUB", "PDF")).toBe("epub-to-pdf");
    expect(getSlug("azw3", "mobi")).toBe("azw3-to-mobi");
  });

  it("handles mixed case input", () => {
    expect(getSlug("Pdf", "ePUB")).toBe("pdf-to-epub");
  });
});

describe("getDisplayName", () => {
  it("converts slug to display name", () => {
    expect(getDisplayName("epub-to-pdf")).toBe("EPUB to PDF");
    expect(getDisplayName("azw3-to-mobi")).toBe("AZW3 to MOBI");
  });

  it("handles single-word slugs", () => {
    expect(getDisplayName("epub")).toBe("EPUB");
  });
});

describe("cn", () => {
  it("merges class names with clsx and twMerge", () => {
    const result = cn("px-4", "py-2", "text-red-500");
    expect(typeof result).toBe("string");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
  });

  it("handles conditional classes", () => {
    const active = true;
    const result = cn("base-class", active && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("omits falsy values", () => {
    const inactive = false;
    const result = cn("base-class", inactive && "should-not-appear");
    expect(result).not.toContain("should-not-appear");
  });
});
