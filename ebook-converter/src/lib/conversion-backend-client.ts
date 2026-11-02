// Client side of the self-hosted Calibre backend delegation (WP4 failover).
//
// Contract with the backend (conversion-backend/app/index.js):
//   POST /api/convert-internal  (header x-internal-convert:<secret>,
//                                multipart file + source_format + target_format)
//   200 + file bytes  -> success, stream back to client
//   anything else     -> "backend couldn't serve this"; fall back to CloudConvert
//
// Routing rules enforced here:
//   - Only delegate target formats the backend can emit (CALIBRE_TARGETS), so we
//     never forward an unsupported format and get a confusing 422 instead of a CC
//     fallback. The backend whitelist is the single source of truth for "what
//     Calibre can produce on this box".
//   - The upload_key (R2 direct-upload) path can't be forwarded (backend needs raw
//     bytes), so it always falls through to convertAndStream (which downloads from R2).
//   - On any backend non-200 / network error / timeout -> return null so the caller
//     routes to CloudConvert. The circuit breaker (conversion-circuit-breaker.ts)
//     keeps repeated failures from adding 30-90s latency on every request while the
//     backend is down.
//
// Env is read at call time (not module load) so the breaker + delegation react to
// runtime env without a rebuild, and so this module is unit-testable.

import { NextResponse } from "next/server";
import { notifyConversionFailure } from "@/lib/alerts";
import {
  recordBackendBusy,
  recordBackendFailure,
  recordBackendSuccess,
  shouldUseBackend,
} from "@/lib/conversion-circuit-breaker";

// Re-exported so the convert route can gate delegation on one facade module.
export { shouldUseBackend } from "@/lib/conversion-circuit-breaker";

// Mirror of conversion-backend/app/index.js BACKEND_TARGETS (MIME keys). Keep in sync.
export const CALIBRE_TARGETS = new Set<string>([
  "epub", "mobi", "azw", "azw3", "pdf", "txt", "txtz", "docx", "html",
  "htmlz", "rtf", "lit", "fb2", "lrf", "pdb", "rb", "snb", "tcr", "oeb", "zip",
]);

export function isCalibreTarget(format: string | null | undefined): boolean {
  return format != null && CALIBRE_TARGETS.has(format.toLowerCase().replace(/^\./, ""));
}

export function backendConfigured(): boolean {
  const url = process.env.CONVERSION_BACKEND_URL?.replace(/\/+$/, "");
  const secret = process.env.CONVERSION_INTERNAL_SECRET;
  return Boolean(url && secret);
}

const DEFAULT_BACKEND_TIMEOUT_MS = 90_000;

export interface DelegateOptions {
  /**
   * Pre-fetched file for the R2 upload_key path: route.ts downloads the object
   * once and hands it over as a real File, so large files (which never fit the
   * 4.5MB inbound edge limit) can still reach the backend. The backend enforces
   * its own size cap; a non-200 there falls back to CloudConvert as usual.
   */
  prebuiltFile?: File;
  /**
   * 真实客户端 IP，由 route.ts 从入站请求头解析后传入（2026-11-02）。
   *
   * 为什么必须显式传：**Vercel 出站 fetch 不会转发客户端 IP**。实测（HK 后端
   * tcpdump 抓 nginx→node）显示，从 www.bookconv.com 发起、真实客户端为
   * 43.129.176.38 的请求，到达后端时 `X-Forwarded-For: 3.90.42.96`（Vercel
   * egress），`X-Real-IP` 同值，UA 被改写成 `node`。即客户端 IP 在 Vercel
   * 出站时就已丢失。仅在后端 nginx 侧记录 $http_x_forwarded_for 是无效的
   * （只能记到 Vercel 自己的 IP），必须在出站请求里显式携带。
   */
  clientIp?: string;
  /**
   * 诊断回调：delegation 未能返回成功响应时，把**原因**回传给调用方
   * （2026-11-02）。此前本函数只返回 null，原因被丢弃到一行 console.warn——
   * 而 Vercel Hobby 日志仅留 1h，事后无法归因。后果实证：Job 729f7eae 的告警卡
   * 只显示最终错误 `too small`，把值班人引向「用户传错文件」，真实原因是
   * 后端 busy 429 → 回退 CloudConvert → CC 体积守卫拒绝。
   *
   * 之所以用回调而不是模块级变量：Serverless 同实例并发请求会互相污染
   * （请求作用域的闭包变量才不会串）。也不会改变本函数的返回契约。
   */
  onFallback?: (reason: string) => void;
}

/**
 * Try to convert via the self-hosted backend.
 * @returns a NextResponse to return to the client, or null to signal
 *          "fall back to CloudConvert".
 */
export async function delegateToBackend(
  formData: FormData,
  rateHeaders: Record<string, string>,
  opts: DelegateOptions = {},
): Promise<NextResponse | null> {
  const BACKEND_URL = process.env.CONVERSION_BACKEND_URL?.replace(/\/+$/, "");
  const INTERNAL_SECRET = process.env.CONVERSION_INTERNAL_SECRET;
  const BACKEND_TIMEOUT_MS = parseInt(
    process.env.CONVERSION_BACKEND_TIMEOUT_MS || String(DEFAULT_BACKEND_TIMEOUT_MS),
    10,
  );
  if (!BACKEND_URL || !INTERNAL_SECRET) {
    opts.onFallback?.("backend not configured");
    return null;
  }
  if (!shouldUseBackend()) {
    // 熔断打开时根本没发请求——告警卡必须能区分「后端忙」和「熔断跳过」，
    // 否则同样会误导（把一个被跳过 60s 的降级当成引擎问题）。
    opts.onFallback?.("circuit open (delegation skipped)");
    return null;
  }

  const file = opts.prebuiltFile ?? formData.get("file");
  if (!(file instanceof File)) {
    opts.onFallback?.("no File in form (upload_key path)");
    return null; // upload_key without a prebuilt File: let convertAndStream handle it
  }

  const backendForm = new FormData();
  backendForm.append("file", file, file.name);
  backendForm.append("source_format", String(formData.get("source_format") ?? ""));
  backendForm.append("target_format", String(formData.get("target_format") ?? ""));
  const quality = formData.get("quality");
  if (typeof quality === "string" && quality) backendForm.append("quality", quality);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { "x-internal-convert": INTERNAL_SECRET };
    // 显式透传客户端 IP（默认的 XFF 在这里已被 Vercel 出站丢弃，见 opts.clientIp）
    if (opts.clientIp) headers["x-client-ip"] = opts.clientIp;
    const res = await fetch(`${BACKEND_URL}/api/convert-internal`, {
      method: "POST",
      headers,
      body: backendForm,
      signal: controller.signal,
    });

    if (res.status === 200) {
      recordBackendSuccess();
      const headers = new Headers();
      res.headers.forEach((v, k) => {
        const lk = k.toLowerCase();
        if (lk === "content-type" || lk === "content-disposition" || lk === "cache-control") {
          headers.set(k, v);
        }
      });
      for (const [k, v] of Object.entries(rateHeaders)) headers.set(k, v);
      headers.set("X-Conversion-Backend", "hit");
      return new NextResponse(res.body, { status: 200, headers });
    }

    // Non-200: backend couldn't serve this request -> fall back to CloudConvert.
    //
    // 429 单独处理（2026-11-02 红队修正）：BACKEND_BUSY / 上游 limit_req 表达的是
    // 「后端活着但排满了」，属**容量**信号而非健康失败。若计入熔断，连续 3 次
    // 并发争用就会打开 60s 冷却，把「有点忙」放大成「整段不可用」——期间所有
    // 请求绕过后端压给 CloudConvert（额度紧张 + 每次多 10–30s）。故只记观测数。
    if (res.status === 429) {
      let reason = "backend busy (429)";
      try {
        const body = (await res.clone().json()) as { code?: string };
        if (body?.code) reason += ` ${body.code}`;
      } catch {
        /* 非 JSON body（如 nginx limit_req 的 HTML 页）——保留朴素原因即可 */
      }
      opts.onFallback?.(reason);
      recordBackendBusy();
      console.warn(`[convert] ${reason}; falling back to CloudConvert`);
      return null;
    }

    const outcome = recordBackendFailure();
    opts.onFallback?.(`backend HTTP ${res.status}`);
    if (outcome.transitionedToOpen) {
      await notifyBackendDown(`backend returned HTTP ${res.status}`);
    } else {
      console.warn(
        `[convert] backend delegation non-200 (${res.status}); falling back to CloudConvert`,
      );
    }
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    opts.onFallback?.(`backend error: ${message}`);
    const outcome = recordBackendFailure();
    if (outcome.transitionedToOpen) {
      await notifyBackendDown(message);
    } else {
      console.warn(
        "[convert] backend delegation failed (falling back to CloudConvert):",
        message,
      );
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function notifyBackendDown(detail: string): Promise<void> {
  console.error("[convert] backend circuit breaker OPEN:", detail);
  try {
    await notifyConversionFailure({ kind: "backend-unavailable", error: detail });
  } catch {
    /* alerting must never break a conversion */
  }
}
