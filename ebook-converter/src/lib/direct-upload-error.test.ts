// src/lib/direct-upload-error.test.ts
//
// 2026-11-02 红队审计 §5 门槛 1 的反向验证：mapDirectUploadError 必须按「阶段」
// 正确分流，且 R-B（413→FILE_TOO_LARGE 保留）/ R-A（未知字面量不得透传）陷阱有测试钉死。
// 门禁同步不变量：直传族四码必须全部通过 isErrorCode（否则 GA4 塌缩 UNKNOWN）。

import {
  mapDirectUploadError,
  DirectUploadUnavailableError,
  DirectUploadPresignError,
  DirectUploadPutError,
} from "@/lib/direct-upload-error";
import { isErrorCode } from "@/lib/error-handler";
import { uploadFileDirect } from "@/lib/client/direct-upload";

const fakeFile = { size: 5_000_000, name: "probe.epub" } as unknown as File;

describe("mapDirectUploadError（阶段分流）", () => {
  test("presign 503 → DIRECT_UPLOAD_PRESIGN_UNAVAILABLE", () => {
    expect(mapDirectUploadError(new DirectUploadUnavailableError())).toBe(
      "DIRECT_UPLOAD_PRESIGN_UNAVAILABLE",
    );
  });

  test("R-B：presign 413 带 FILE_TOO_LARGE 合同码 → 保留 FILE_TOO_LARGE", () => {
    const err = new DirectUploadPresignError("File too large. Max 100MB per upload.", {
      status: 413,
      code: "FILE_TOO_LARGE",
    });
    expect(mapDirectUploadError(err)).toBe("FILE_TOO_LARGE");
  });

  test("R-A：presign 返回未知字面量（如 DIRECT_UPLOAD_UNAVAILABLE）→ 不透传，归 PRESIGN_ERROR", () => {
    const err = new DirectUploadPresignError("Upload service temporarily unavailable.", {
      status: 503,
      code: "DIRECT_UPLOAD_UNAVAILABLE",
    });
    expect(isErrorCode("DIRECT_UPLOAD_UNAVAILABLE")).toBe(false);
    expect(mapDirectUploadError(err)).toBe("DIRECT_UPLOAD_PRESIGN_ERROR");
  });

  test("presign 400/429/网络（无合同码）→ DIRECT_UPLOAD_PRESIGN_ERROR", () => {
    expect(mapDirectUploadError(new DirectUploadPresignError("Too many upload requests.", { status: 429 }))).toBe(
      "DIRECT_UPLOAD_PRESIGN_ERROR",
    );
    expect(mapDirectUploadError(new DirectUploadPresignError("Could not start upload (Failed to fetch)."))).toBe(
      "DIRECT_UPLOAD_PRESIGN_ERROR",
    );
  });

  test("R2 PUT 失败（CORS/网络/非2xx）→ DIRECT_UPLOAD_PUT_FAILED", () => {
    expect(mapDirectUploadError(new DirectUploadPutError("Upload to storage failed (Failed to fetch)."))).toBe(
      "DIRECT_UPLOAD_PUT_FAILED",
    );
    expect(mapDirectUploadError(new DirectUploadPutError("Upload to storage failed (403).", 403))).toBe(
      "DIRECT_UPLOAD_PUT_FAILED",
    );
  });

  test("未知抛出（阶段不明）→ 兜底 DIRECT_UPLOAD_FAILED（历史/门禁兼容）", () => {
    expect(mapDirectUploadError(new Error("something unexpected"))).toBe("DIRECT_UPLOAD_FAILED");
    expect(mapDirectUploadError(undefined)).toBe("DIRECT_UPLOAD_FAILED");
  });
});

describe("门禁同步不变量（改能力必须同步改门禁基线）", () => {
  test("直传族四码全部通过 isErrorCode（= 已进 ERROR_MESSAGES 单一真相）", () => {
    for (const code of [
      "DIRECT_UPLOAD_FAILED",
      "DIRECT_UPLOAD_PRESIGN_UNAVAILABLE",
      "DIRECT_UPLOAD_PRESIGN_ERROR",
      "DIRECT_UPLOAD_PUT_FAILED",
    ] as const) {
      expect(isErrorCode(code)).toBe(true);
    }
  });
});

describe("uploadFileDirect 抛出点的阶段类型（fetch 桩）", () => {
  afterEach(() => jest.restoreAllMocks());

  const jsonRes = (status: number, body: unknown) =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }) as unknown as Response;

  test("presign 503 → DirectUploadUnavailableError → 映射 PRESIGN_UNAVAILABLE", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(jsonRes(503, {}));
    await expect(uploadFileDirect(fakeFile, "epub")).rejects.toBeInstanceOf(DirectUploadUnavailableError);
    await uploadFileDirect(fakeFile, "epub").catch((e) => {
      expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PRESIGN_UNAVAILABLE");
    });
  });

  test("presign 413 合同码 → 映射 FILE_TOO_LARGE（R-B 端到端）", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValue(jsonRes(413, { error: "File too large.", code: "FILE_TOO_LARGE" }));
    await uploadFileDirect(fakeFile, "epub").catch((e) => {
      expect(e).toBeInstanceOf(DirectUploadPresignError);
      expect(mapDirectUploadError(e)).toBe("FILE_TOO_LARGE");
    });
  });

  test("presign 网络失败 → DirectUploadPresignError → PRESIGN_ERROR", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    await uploadFileDirect(fakeFile, "epub").catch((e) => {
      expect(e).toBeInstanceOf(DirectUploadPresignError);
      expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PRESIGN_ERROR");
    });
  });

  test("PUT 网络失败（CORS 假象）→ DirectUploadPutError → PUT_FAILED", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonRes(200, {
        key: "uploads/x.epub",
        uploadUrl: "https://r2.example/put",
        method: "PUT",
        contentType: "application/octet-stream",
      }),
    );
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch")); // CORS 预检失败的表现形态
    await uploadFileDirect(fakeFile, "epub").catch((e) => {
      expect(e).toBeInstanceOf(DirectUploadPutError);
      expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PUT_FAILED");
    });
  });

  test("PUT 非 2xx → DirectUploadPutError → PUT_FAILED", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonRes(200, { key: "uploads/x.epub", uploadUrl: "https://r2.example/put" }),
    );
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 } as unknown as Response);
    await uploadFileDirect(fakeFile, "epub").catch((e) => {
      expect(e).toBeInstanceOf(DirectUploadPutError);
      expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PUT_FAILED");
    });
  });
});
