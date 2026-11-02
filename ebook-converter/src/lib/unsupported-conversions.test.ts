import {
  UNSUPPORTED_CONVERSIONS,
  unsupportedConversionInfo,
} from "./unsupported-conversions";
import { normalizeFormat, CONVERSION_MAP } from "./conversion-map";

/**
 * 防回归测试（2026-11-01，doc-epub 两头堵第三例）：
 *
 * 「两头堵」= 自建 Calibre 后端白名单外 + CloudConvert 无此转换路径（官网
 * 转换页 404 实证）⇒ 100% 必败组合。生产实证 Job 1f80d108（doc→epub，CC 两次
 * "This conversion type is not supported"，2026-11-01T14:03:36Z）。
 *
 * 2026-10-28 方案 A 只登记了 epub→{doc,jpg,png} 三个"epub 出发"方向，漏了
 * 反方向 doc→epub——教训：两头堵审计必须双向枚举。本测试锁定：
 *   1. doc-epub 条目必须存在（条目一旦被"好心清理"丢失，拦截即刻失效，
 *      生产回到 500+红卡告警，本测试同刻变红）；
 *   2. 每个登记条目的 alternativeHref 必须指向 CONVERSION_MAP 里真实存在、
 *      且自身未被登记为不可行的转换（替代路径绝不能是死链或另一个死组合
 *      ——否则拦截只是把一次必败换成另一次必败）；
 *   3. doc-epub 的替代路径额外锁定纯 JS 实现（tool=js，免疫 CC 402 配额墙）；
 *   4. 未登记的常见组合必须保持放行（防止注册表误伤正常转换）。
 *
 * 注意 slug→map key 换算：URL slug 是 "epub-to-docx" 式，CONVERSION_MAP 键是
 * "epub-docx" 式（source-target），不可直接索引（首版判据在此翻车）。
 */

/** /convert/epub-to-docx → CONVERSION_MAP 键 epub-docx */
function slugToMapKey(href: string): string {
  return href.replace(/^\/convert\//, "").split("-to-").map(normalizeFormat).join("-");
}

describe("UNSUPPORTED_CONVERSIONS registry", () => {
  it("doc-epub（两头堵第三例，2026-11-01）已登记且指向纯 JS 替代路径", () => {
    const info = unsupportedConversionInfo("doc", "epub");
    expect(info).toBeDefined();
    expect(info!.alternativeHref).toBe("/convert/docx-to-epub");
    expect(CONVERSION_MAP["docx-epub"].tool).toBe("js");
    expect(info!.noticeEn).toMatch(/DOCX/i);
    expect(info!.noticeEs.length).toBeGreaterThan(20);
  });

  it("已登记的三个 epub 出发方向（2026-10-28 方案 A）保持登记", () => {
    expect(unsupportedConversionInfo("epub", "doc")).toBeDefined();
    expect(unsupportedConversionInfo("epub", "jpg")).toBeDefined();
    expect(unsupportedConversionInfo("epub", "png")).toBeDefined();
  });

  it("每个登记条目的替代路径真实存在且自身不是死组合", () => {
    for (const [key, info] of Object.entries(UNSUPPORTED_CONVERSIONS)) {
      const mapKey = slugToMapKey(info.alternativeHref);
      const conv = CONVERSION_MAP[mapKey as keyof typeof CONVERSION_MAP];
      // 替代转换必须存在于 CONVERSION_MAP（否则是死链）
      expect({ key, mapKey, found: Boolean(conv) }).toEqual({
        key,
        mapKey,
        found: true,
      });
      // 替代转换自身绝不能也在拦截注册表里（否则必败换必败）
      const alt = mapKey.split("-");
      expect({ key, altUnsupported: unsupportedConversionInfo(alt[0], alt[1]) }).toEqual({
        key,
        altUnsupported: undefined,
      });
    }
  });

  it("未登记的正常组合保持放行（注册表不得误伤）", () => {
    expect(unsupportedConversionInfo("epub", "mobi")).toBeUndefined();
    expect(unsupportedConversionInfo("docx", "epub")).toBeUndefined();
    expect(unsupportedConversionInfo("pdf", "epub")).toBeUndefined();
  });
});
