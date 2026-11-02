/**
 * 入站客户端 IP 解析（`src/lib/client-ip.ts`）单元测试 —— 2026-11-02
 *
 * 反向约束：这套解析同时决定「取证日志里记谁」和「限流按谁计数」。
 * 一旦退化成常量，限流会变成全站共享桶（实测事故：19→18→17→16 跨客户端递减），
 * 所以这里逐条钉住每一种头来源与降级行为。
 */
import { readClientIp, looksLikeIp } from "@/lib/client-ip";

function headersOf(map: Record<string, string>) {
  return {
    get(name: string): string | null {
      const key = Object.keys(map).find((k) => k.toLowerCase() === name.toLowerCase());
      return key ? map[key] : null;
    },
  };
}

describe("readClientIp", () => {
  it("优先采信 x-vercel-forwarded-for 链首", () => {
    expect(
      readClientIp(
        headersOf({
          "x-vercel-forwarded-for": "203.0.113.7, 10.0.0.1",
          "x-forwarded-for": "198.51.100.9",
        }),
      ),
    ).toBe("203.0.113.7");
  });

  it("XFF 取最后一段（最近一跳代理写入的值），不是可伪造的链首", () => {
    // 客户端自带值在链首；平台追加真实值在链尾
    expect(readClientIp(headersOf({ "x-forwarded-for": "1.2.3.4, 43.129.176.38" }))).toBe(
      "43.129.176.38",
    );
  });

  it("XFF 单段时取该段", () => {
    expect(readClientIp(headersOf({ "x-forwarded-for": "43.129.176.38" }))).toBe("43.129.176.38");
  });

  it("回退到 x-real-ip", () => {
    expect(readClientIp(headersOf({ "x-real-ip": "203.0.113.55" }))).toBe("203.0.113.55");
  });

  it("支持 IPv6", () => {
    expect(readClientIp(headersOf({ "x-forwarded-for": "2401:ce20:7::7" }))).toBe("2401:ce20:7::7");
  });

  it("跳过垃圾值，改用下一个合法来源（不把 unknown 当 IP）", () => {
    expect(
      readClientIp(headersOf({ "x-forwarded-for": "unknown", "x-real-ip": "203.0.113.9" })),
    ).toBe("203.0.113.9");
  });

  it("全部缺失时返回 undefined，不编造值", () => {
    expect(readClientIp(headersOf({}))).toBeUndefined();
    expect(readClientIp(undefined)).toBeUndefined();
    expect(readClientIp(null)).toBeUndefined();
  });

  it("headless 对象（无 get）不抛错", () => {
    expect(readClientIp({} as unknown as { get(): string | null })).toBeUndefined();
  });
});

describe("looksLikeIp", () => {
  it("接受合法 IPv4/IPv6", () => {
    expect(looksLikeIp("1.2.3.4")).toBe(true);
    expect(looksLikeIp("255.255.255.255")).toBe(true);
    expect(looksLikeIp("2401:ce20:7::7")).toBe(true);
    expect(looksLikeIp("::1")).toBe(true);
  });

  it("拒绝越界与垃圾", () => {
    expect(looksLikeIp("999.1.1.1")).toBe(false);
    expect(looksLikeIp("unknown")).toBe(false);
    expect(looksLikeIp("-")).toBe(false);
    expect(looksLikeIp("")).toBe(false);
    expect(looksLikeIp("1.2.3")).toBe(false);
  });
});
