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

/**
 * Try to convert via the self-hosted backend.
 * @returns a NextResponse to return to the client, or null to signal
 *          "fall back to CloudConvert".
 */
export async function delegateToBackend(
  formData: FormData,
  rateHeaders: Record<string, string>,
): Promise<NextResponse | null> {
  const BACKEND_URL = process.env.CONVERSION_BACKEND_URL?.replace(/\/+$/, "");
  const INTERNAL_SECRET = process.env.CONVERSION_INTERNAL_SECRET;
  const BACKEND_TIMEOUT_MS = parseInt(
    process.env.CONVERSION_BACKEND_TIMEOUT_MS || String(DEFAULT_BACKEND_TIMEOUT_MS),
    10,
  );
  if (!BACKEND_URL || !INTERNAL_SECRET || !shouldUseBackend()) return null;

  const file = formData.get("file");
  if (!(file instanceof File)) return null; // upload_key (R2) path: let convertAndStream handle it

  const backendForm = new FormData();
  backendForm.append("file", file, file.name);
  backendForm.append("source_format", String(formData.get("source_format") ?? ""));
  backendForm.append("target_format", String(formData.get("target_format") ?? ""));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
  try {
    const res = await fetch(`${BACKEND_URL}/api/convert-internal`, {
      method: "POST",
      headers: { "x-internal-convert": INTERNAL_SECRET },
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
    const outcome = recordBackendFailure();
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
