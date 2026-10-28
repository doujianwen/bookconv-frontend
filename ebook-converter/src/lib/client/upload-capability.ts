// src/lib/client/upload-capability.ts
//
// Client-side view of "how large a file can this deployment actually accept?"
//
// Why this exists: the direct-upload ceiling (100MB) only applies when R2 is
// configured AND a bucket CORS rule allows PUT. When it is not, the only usable
// path is multipart, bounded by the Vercel edge limit (~4MB). Advertising 100MB
// in that state is a promise the deployment cannot keep, so the drop zone asks
// this hook instead of reading the constant directly.
//
// Failure policy: the SERVER is authoritative. This hook only decides what to
// display and whether to reject early.
//   · while the probe is in flight → optimistic (direct cap), because rejecting
//     a legitimate 50MB file in the first 100ms is worse than letting the
//     server answer. The server rejects anything it cannot take (presign → 503,
//     multipart → 413), and both now produce actionable copy.
//   · probe failed → conservative (multipart cap). A dead probe must not
//     advertise a capability we cannot confirm.

"use client";

import { useEffect, useState } from "react";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
} from "@/lib/file-size-limit";

export interface UploadCapability {
  /** Largest file the deployment can currently accept. */
  maxBytes: number;
  maxMB: number;
  /** True only when the presigned direct-upload path is confirmed usable. */
  directUpload: boolean;
  /** False until the probe resolves. */
  ready: boolean;
}

const PENDING_OPTIMISTIC: UploadCapability = {
  maxBytes: MAX_UPLOAD_FILE_SIZE_BYTES,
  maxMB: MAX_UPLOAD_FILE_SIZE_MB,
  directUpload: false,
  ready: false,
};

const CONSERVATIVE: UploadCapability = {
  maxBytes: MAX_FILE_SIZE_BYTES,
  maxMB: MAX_FILE_SIZE_MB,
  directUpload: false,
  ready: true,
};

export function useUploadCapability(): UploadCapability {
  const [cap, setCap] = useState<UploadCapability>(PENDING_OPTIMISTIC);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/upload/presign", {
          method: "GET",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`probe ${res.status}`);
        const data = (await res.json()) as {
          enabled?: boolean;
          maxBytes?: number;
          maxMB?: number;
        };
        if (cancelled) return;

        const maxBytes =
          typeof data.maxBytes === "number" && data.maxBytes > 0
            ? data.maxBytes
            : MAX_FILE_SIZE_BYTES;
        const maxMB =
          typeof data.maxMB === "number" && data.maxMB > 0
            ? data.maxMB
            : Math.round(maxBytes / 1024 / 1024);

        setCap({ maxBytes, maxMB, directUpload: !!data.enabled, ready: true });
      } catch {
        // Probe failed → fall back to the conservative multipart cap and mark
        // ready so the UI stops waiting. Never block uploads on a probe error.
        if (!cancelled) setCap(CONSERVATIVE);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return cap;
}
