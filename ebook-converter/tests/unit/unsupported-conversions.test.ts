/**
 * 「两头堵」组合拦截测试（2026-10-28 方案 A）。
 *
 * 背景：epub→jpg/doc/png 不在自建后端 20 格式白名单，且 CloudConvert 官方
 * 无这三条转换路径（官网转换页 404 实证）⇒ 线上 100% CLOUD_CONVERT_ERROR 500。
 * 修复 = API 层 422 前置拦截 + 替代推荐，避免白烧上传与 CC job。
 */
import { convertAndStream } from "@/lib/convert-handler";
import {
  UNSUPPORTED_CONVERSIONS,
  unsupportedConversionInfo,
} from "@/lib/unsupported-conversions";

function makeForm(source: string, target: string): FormData {
  const form = new FormData();
  form.append("source_format", source);
  form.append("target_format", target);
  return form;
}

describe("unsupported conversion registry", () => {
  it("registers exactly the three known-impossible combos", () => {
    expect(Object.keys(UNSUPPORTED_CONVERSIONS).sort()).toEqual([
      "epub-doc",
      "epub-jpg",
      "epub-png",
    ]);
  });

  it("lookup is case-safe via normalized lowercase keys", () => {
    expect(unsupportedConversionInfo("epub", "doc")).toBeDefined();
    expect(unsupportedConversionInfo("epub", "jpg")).toBeDefined();
    expect(unsupportedConversionInfo("epub", "png")).toBeDefined();
    expect(unsupportedConversionInfo("epub", "mobi")).toBeUndefined();
    expect(unsupportedConversionInfo("doc", "epub")).toBeUndefined();
  });

  it("every entry points at a working alternative format pair", () => {
    for (const info of Object.values(UNSUPPORTED_CONVERSIONS)) {
      expect(info.alternativeHref).toMatch(/^\/convert\/[a-z0-9]+-to-[a-z0-9]+$/);
      expect(info.noticeEn.length).toBeGreaterThan(20);
      expect(info.noticeEs.length).toBeGreaterThan(20);
    }
  });
});

describe("convertAndStream 422 interception", () => {
  it.each([
    ["epub", "doc"],
    ["epub", "jpg"],
    ["epub", "png"],
  ])("blocks %s → %s with 422 + UNSUPPORTED_CONVERSION + alternative", async (source, target) => {
    const res = await convertAndStream(makeForm(source, target));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.code).toBe("UNSUPPORTED_CONVERSION");
    expect(body.error).toBeTruthy();
    expect(body.alternative).toMatch(/^\/convert\//);
  });

  it("does NOT intercept supported combos (they proceed past validation)", async () => {
    // epub→mobi 是白名单内组合：拦截必须放行，让它走到下一层校验。
    // 不传 file ⇒ 命中「Missing required fields: file」400（而非 422），
    // 以此证明放行发生且未误伤。
    const res = await convertAndStream(makeForm("epub", "mobi"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBeUndefined();
    expect(body.error).toMatch(/Missing required fields/);
  });

  it("does NOT intercept the reverse pairs (doc→epub is a js conversion)", async () => {
    const res = await convertAndStream(makeForm("doc", "epub"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Missing required fields/);
  });
});
