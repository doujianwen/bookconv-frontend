/**
 * 入站客户端 IP 解析 —— 唯一事实源（2026-11-02）
 *
 * 为什么必须收敛到一处：这个判据有两个消费方，历史上是两份实现，结果分叉了——
 *   1. 路由层（`/api/convert`）：把 IP 转发给自建后端，供取证日志记录；
 *   2. 限流层（`rate-limit.ts`）：用它做限流键。
 * 第二份实现退化成常量（见下），导致**全站共用一个限流桶**：
 * 实测两个完全不同的客户端（HK IPv4 / 本机 IPv6）连续递减同一个计数器
 * （remaining 19 → 18 → 17 → 16）。也就是说，任何人发 20 次请求就能让
 * 全站转换接口在窗口剩余时间内全部 429。
 *
 * 为什么信任顺序是「Vercel 专用头 → XFF 末段 → x-real-ip」：
 * - Vercel 会规范化入站转发头。实测（诊断报告 §12）：客户端伪造
 *   `X-Forwarded-For` / `x-real-ip` / `x-vercel-forwarded-for` 三个向量，
 *   最终落盘的都是真实客户端 IP，伪造值全部被覆盖或追加在链首。
 * - 因此 XFF 取**最后一段**（最近一跳代理写入的值），而不是链首：
 *   若平台是追加语义，链首就是客户端自带的可伪造值。
 * - 全都缺失时返回 `undefined`，由调用方决定降级策略——本函数不编造 IP。
 */

/** 只要能按名取头即可，便于 NextRequest / Headers / 测试替身共用。 */
export interface HeaderSource {
  get(name: string): string | null | undefined;
}

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
/** 宽松 IPv6：只要由十六进制与冒号组成且含冒号即可（含 ::1 / 压缩写法）。 */
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

/**
 * 过滤掉明显不是 IP 的值（`unknown`、`-`、空串、任意垃圾）。
 * 不做严格校验：入站头的格式由平台保证，这里只为防止把非 IP 写进限流键。
 */
export function looksLikeIp(value: string): boolean {
  if (IPV4.test(value)) {
    return value.split('.').every((part) => Number(part) <= 255);
  }
  return IPV6.test(value) && value.includes(':');
}

function parseList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && looksLikeIp(s));
}

/**
 * 解析入站请求的真实客户端 IP。
 *
 * @param headers 入站请求头（可空；缺失时返回 undefined，不抛错）
 * @returns 合法客户端 IP，或 undefined（无法判定）
 */
export function readClientIp(headers?: HeaderSource | null): string | undefined {
  if (!headers || typeof headers.get !== "function") return undefined;

  // 1) Vercel 专用头：平台写入，客户端伪造会被覆盖（实测见报告 §12）
  const vercelFwd = parseList(headers.get("x-vercel-forwarded-for"));
  if (vercelFwd.length > 0) return vercelFwd[0];

  // 2) 通用 X-Forwarded-For：取最后一段（最近一跳代理写入的值）
  const xff = parseList(headers.get("x-forwarded-for"));
  if (xff.length > 0) return xff[xff.length - 1];

  // 3) X-Real-IP
  const realIp = (headers.get("x-real-ip") || "").trim();
  if (looksLikeIp(realIp)) return realIp;

  return undefined;
}
