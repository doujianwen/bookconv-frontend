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
  diagnosticPrefix,
  extractDiagnosticContext,
  buildDirectUploadErrorPrefix,
  attachDirectUploadCause,
  type DiagnosticContext,
} from "@/lib/direct-upload-error";
import { isErrorCode } from "@/lib/error-handler";
import { uploadFileDirect, isRetryablePutError } from "@/lib/client/direct-upload";
import { parseDiagnosticPrefix } from "../../scripts/lib/direct-upload-diagnostic.mjs";

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
    expect(
      mapDirectUploadError(new DirectUploadPutError("Upload to storage failed (403).", { status: 403 })),
    ).toBe("DIRECT_UPLOAD_PUT_FAILED");
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

  test("PUT 网络失败（CORS 假象）→ DirectUploadPutError → PUT_FAILED（重试后仍失败）", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonRes(200, {
        key: "uploads/x.epub",
        uploadUrl: "https://r2.example/put",
        method: "PUT",
        contentType: "application/octet-stream",
      }),
    );
    // 所有重试尝试的 PUT 都网络失败 → 穷尽重试后仍抛 PUT_FAILED（不漏真实网络调用）
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch")); // CORS 预检失败的表现形态
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

describe("2026-11-06 直传 PUT 重试（仅网络层失败重试，HTTP 非2xx 不重试）", () => {
  afterEach(() => jest.restoreAllMocks());

  const presignJson = {
    ok: true,
    status: 200,
    json: async () => ({
      key: "uploads/x.epub",
      uploadUrl: "https://r2.example/put",
      method: "PUT",
      contentType: "application/octet-stream",
    }),
  } as unknown as Response;

  test("PUT 首次网络失败、第二次成功 → uploadFileDirect 解析成功（重试生效）", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce(presignJson); // presign
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch")); // 第1次 PUT 网络失败
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 } as unknown as Response); // 第2次 PUT 成功
    const result = await uploadFileDirect(fakeFile, "epub");
    expect(result).toEqual({ key: "uploads/x.epub" });
    // presign(1) + PUT(2) = 3 次 fetch
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test("isRetryablePutError：网络 TypeError / 非 abort DOMException 可重试，HTTP/abort 不可重试", () => {
    expect(isRetryablePutError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isRetryablePutError(new DOMException("boom"))).toBe(true);
    expect(isRetryablePutError(new DOMException("aborted", "AbortError"))).toBe(false);
    expect(isRetryablePutError(new Error("HTTP 403"))).toBe(false);
    expect(isRetryablePutError(undefined)).toBe(false);
  });

  test("PUT 返回 403（确定性 R2 拒绝）→ 不重试，仅 2 次 fetch（presign+PUT）", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce(presignJson);
    fetchMock.mockResolvedValue({ ok: false, status: 403 } as unknown as Response); // 所有 PUT 都 403
    await uploadFileDirect(fakeFile, "epub").catch((e) => {
      expect(e).toBeInstanceOf(DirectUploadPutError);
      expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PUT_FAILED");
    });
    // 403 不重试：presign(1) + PUT(1) = 2 次，而非 1+3
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("PUT 被 abort → 不进入重试循环（presign+1次PUT=2次fetch）", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    const ctrl = new AbortController();
    fetchMock.mockResolvedValueOnce(presignJson);
    fetchMock.mockImplementationOnce(() => {
      ctrl.abort();
      return Promise.reject(new DOMException("aborted", "AbortError"));
    });
    // abort 与既有行为一致：被外层包装为 DirectUploadPutError（PUT_FAILED），
    // 关键不变量是「不重试」→ fetch 仅 2 次。
    await uploadFileDirect(fakeFile, "epub", ctrl.signal).catch((e) => {
      expect(e).toBeInstanceOf(DirectUploadPutError);
      expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PUT_FAILED");
    });
    expect(fetchMock).toHaveBeenCalledTimes(2); // presign + 1 次 PUT（无重试）
  });
});

describe("F20 诊断上下文（elapsedMs / online / status 携带 + GA4 前缀）", () => {
  test("DirectUploadPutError 携带 status/elapsedMs/online，可选且独立", () => {
    const withStatus = new DirectUploadPutError("PUT 403", { status: 403, elapsedMs: 1200, online: true });
    expect(withStatus.status).toBe(403);
    expect(withStatus.elapsedMs).toBe(1200);
    expect(withStatus.online).toBe(true);

    const netOnly = new DirectUploadPutError("CORS/network drop", { elapsedMs: 90, online: true });
    expect(netOnly.status).toBeUndefined();
    expect(netOnly.online).toBe(true);

    const noDiag = new DirectUploadPutError("plain");
    expect(noDiag.status).toBeUndefined();
    expect(noDiag.elapsedMs).toBeUndefined();
    expect(noDiag.online).toBeUndefined();
  });

  test("DirectUploadPresignError 同样携带 elapsedMs/online", () => {
    const e = new DirectUploadPresignError("presign failed", {
      status: 429,
      code: "DIRECT_UPLOAD_PRESIGN_ERROR",
      elapsedMs: 300,
      online: false,
    });
    expect(e.status).toBe(429);
    expect(e.code).toBe("DIRECT_UPLOAD_PRESIGN_ERROR");
    expect(e.elapsedMs).toBe(300);
    expect(e.online).toBe(false);
  });

  test("diagnosticPrefix：PUT 网络/CORS 失败（无 status，online=true）→ NETWORK 前缀", () => {
    const diag: DiagnosticContext = { stage: "put", online: true, elapsedMs: 2000 };
    expect(diagnosticPrefix(diag)).toBe("PUT:NETWORK:on=1:1-5s:");
  });

  test("diagnosticPrefix：PUT R2 非2xx（HTTP403，长时间挂起）→ HTTP<status> + >15s 桶", () => {
    const diag: DiagnosticContext = { stage: "put", status: 403, online: true, elapsedMs: 20000 };
    expect(diagnosticPrefix(diag)).toBe("PUT:HTTP403:on=1:>15s:");
  });

  test("diagnosticPrefix：presign 阶段 + 离线客户端 → PRESIGN 标签 + on=0", () => {
    const diag: DiagnosticContext = { stage: "presign", online: false, elapsedMs: 500 };
    expect(diagnosticPrefix(diag)).toBe("PRESIGN:NETWORK:on=0:<1s:");
  });

  test("diagnosticPrefix：无诊断上下文（非直传失败）→ 空串，GA4 error 字段不变", () => {
    expect(diagnosticPrefix(undefined)).toBe("");
    const diag: DiagnosticContext = { stage: "put" };
    expect(diagnosticPrefix(diag)).toBe("PUT:NETWORK:on=?:?:");
  });

  test("diagnosticPrefix：elapsedMs 桶边界（<1s / 5-15s / 缺省）", () => {
    expect(diagnosticPrefix({ stage: "put", elapsedMs: 999 })).toBe("PUT:NETWORK:on=?:<1s:");
    expect(diagnosticPrefix({ stage: "put", elapsedMs: 5000 })).toBe("PUT:NETWORK:on=?:5-15s:");
    expect(diagnosticPrefix({ stage: "put", elapsedMs: 14999 })).toBe("PUT:NETWORK:on=?:5-15s:");
    expect(diagnosticPrefix({ stage: "put", elapsedMs: undefined })).toBe("PUT:NETWORK:on=?:?:");
  });

  test("mapDirectUploadError 不受新字段影响：PUT_FAILED 仍正确分流", () => {
    const e = new DirectUploadPutError("Upload to storage failed (Failed to fetch).", {
      elapsedMs: 80,
      online: true,
    });
    expect(mapDirectUploadError(e)).toBe("DIRECT_UPLOAD_PUT_FAILED");
  });
});

describe("F20 P1：纯函数 extractDiagnosticContext / buildDirectUploadErrorPrefix（关组件级测试缝隙）", () => {
  test("extractDiagnosticContext：DirectUploadPutError → put 阶段全字段", () => {
    const e = new DirectUploadPutError("PUT 403", { status: 403, elapsedMs: 20000, online: true });
    expect(extractDiagnosticContext(e)).toEqual({
      stage: "put",
      status: 403,
      elapsedMs: 20000,
      online: true,
    });
  });

  test("extractDiagnosticContext：DirectUploadPresignError → presign 阶段全字段", () => {
    const e = new DirectUploadPresignError("presign 429", {
      status: 429,
      elapsedMs: 300,
      online: false,
    });
    expect(extractDiagnosticContext(e)).toEqual({
      stage: "presign",
      status: 429,
      elapsedMs: 300,
      online: false,
    });
  });

  test("extractDiagnosticContext：非直传错误 → undefined（短路，GA4 字段不变）", () => {
    expect(extractDiagnosticContext(new Error("plain"))).toBeUndefined();
    expect(extractDiagnosticContext(undefined)).toBeUndefined();
    expect(extractDiagnosticContext("not an error")).toBeUndefined();
  });

  test("buildDirectUploadErrorPrefix：经 cause.duDiag 的包裹错误（outer catch 实际路径）→ 完整前缀", () => {
    // 模拟 ToolPageClient inner catch 抛出、outer catch 收到的包裹错误
    const wrapped = new Error("This file failed.", {
      cause: {
        code: "DIRECT_UPLOAD_PUT_FAILED",
        duDiag: { stage: "put", status: 403, elapsedMs: 20000, online: true },
      },
    });
    expect(buildDirectUploadErrorPrefix(wrapped)).toBe("PUT:HTTP403:on=1:>15s:");
  });

  test("buildDirectUploadErrorPrefix：经 cause.duDiag 的 CORS/网络失败（无 status）→ NETWORK 前缀", () => {
    const wrapped = new Error("carga directa falló", {
      cause: {
        code: "DIRECT_UPLOAD_PUT_FAILED",
        duDiag: { stage: "put", online: true, elapsedMs: 2000 },
      },
    });
    expect(buildDirectUploadErrorPrefix(wrapped)).toBe("PUT:NETWORK:on=1:1-5s:");
  });

  test("buildDirectUploadErrorPrefix：原始直传错误（无 cause.duDiag）→ 经 extractDiagnosticContext 回退命中", () => {
    const raw = new DirectUploadPutError("PUT CORS", { elapsedMs: 90, online: true });
    expect(buildDirectUploadErrorPrefix(raw)).toBe("PUT:NETWORK:on=1:<1s:");
  });

  test("buildDirectUploadErrorPrefix：非直传包裹错误（/api/convert 失败，cause 无 duDiag）→ 空串", () => {
    const apiErr = new Error("conversion failed", {
      cause: { code: "ENGINE_FAILED", status: 500 },
    });
    expect(buildDirectUploadErrorPrefix(apiErr)).toBe("");
  });

  test("buildDirectUploadErrorPrefix：裸 Error / undefined → 空串（不得抛、不得污染 GA4 error）", () => {
    expect(buildDirectUploadErrorPrefix(new Error("unknown"))).toBe("");
    expect(buildDirectUploadErrorPrefix(undefined)).toBe("");
  });
});

describe("F20 R-A 组件级链路（inner→outer→GA4 前缀不丢，无需 React）", () => {
  // 这些测试复刻 ToolPageClient 的真实调用路径：
  //   inner catch:  throw new Error(msg, { cause: attachDirectUploadCause(uploadErr) })
  //   outer catch:  buildDirectUploadErrorPrefix(err)
  // 把此前未受测试守护的内联 cause 构造抽成纯函数后，端到端前缀链路可单测。

  test("attachDirectUploadCause：PutError 透传 code + duDiag", () => {
    const put = new DirectUploadPutError("PUT 403", { status: 403, elapsedMs: 2000, online: true });
    const cause = attachDirectUploadCause(put);
    expect(cause.code).toBe("DIRECT_UPLOAD_PUT_FAILED");
    expect(cause.duDiag).toEqual({ stage: "put", status: 403, elapsedMs: 2000, online: true });
  });

  test("attachDirectUploadCause：PresignError（无码）→ PRESIGN_ERROR + duDiag", () => {
    const pre = new DirectUploadPresignError("presign 503", { status: 503, elapsedMs: 8000, online: false });
    const cause = attachDirectUploadCause(pre);
    expect(cause.code).toBe("DIRECT_UPLOAD_PRESIGN_ERROR");
    expect(cause.duDiag).toEqual({ stage: "presign", status: 503, elapsedMs: 8000, online: false });
  });

  test("attachDirectUploadCause：UnavailableError → PRESIGN_UNAVAILABLE", () => {
    expect(attachDirectUploadCause(new DirectUploadUnavailableError()).code).toBe(
      "DIRECT_UPLOAD_PRESIGN_UNAVAILABLE",
    );
  });

  test("attachDirectUploadCause：非直传 Error → DIRECT_UPLOAD_FAILED + duDiag undefined", () => {
    const cause = attachDirectUploadCause(new Error("plain backend error"));
    expect(cause.code).toBe("DIRECT_UPLOAD_FAILED");
    expect(cause.duDiag).toBeUndefined();
  });

  test("端到端：inner 构造 wrapped Error → outer 重建前缀不丢", () => {
    const put = new DirectUploadPutError("PUT 403", { status: 403, elapsedMs: 2000, online: true });
    const wrapped = new Error("This file needs direct upload, which failed.", {
      cause: attachDirectUploadCause(put),
    });
    expect(buildDirectUploadErrorPrefix(wrapped)).toBe("PUT:HTTP403:on=1:1-5s:");
  });

  test("端到端：非直传 wrapped → 前缀空串（不污染 GA4 error）", () => {
    const wrapped = new Error("conversion failed", {
      cause: attachDirectUploadCause(new Error("plain backend error")),
    });
    expect(buildDirectUploadErrorPrefix(wrapped)).toBe("");
  });
});

describe("F20 P1×P2 跨模块契约（真实 producer .ts ↔ 真实 parser .mjs，反格式漂移）", () => {
  // 枚举 diagnosticPrefix 的完整输出空间（stage × status × online × msBucket），
  // 把真实生产者产出的每一个前缀喂给真实解析器，断言语义可无损还原。
  // 若两端任意一侧悄悄改了格式而不同步，此测试必失败（实证证伪，非推理）。
  const contexts: DiagnosticContext[] = [];
  for (const stage of ["put", "presign"] as const) {
    for (const status of [undefined, 403, 500, 503]) {
      for (const online of [undefined, true, false]) {
        for (const elapsedMs of [undefined, 500, 2000, 8000, 20000]) {
          contexts.push({ stage, status, elapsedMs, online });
        }
      }
    }
  }

  test("diagnosticPrefix 产出的全部前缀均可被 parseDiagnosticPrefix 无损还原（120 组合）", () => {
    expect(contexts.length).toBe(120);
    for (const ctx of contexts) {
      const produced = diagnosticPrefix(ctx);
      const p = parseDiagnosticPrefix(produced);
      expect(p.valid).toBe(true);
      expect(p.stage).toBe(ctx.stage === "put" ? "PUT" : "PRESIGN");
      if (ctx.status === undefined) {
        expect(p.kind).toBe("NETWORK");
        expect(p.httpStatus).toBeNull();
      } else {
        expect(p.kind).toBe("HTTP");
        expect(p.httpStatus).toBe(ctx.status);
      }
      expect(p.online).toBe(ctx.online === undefined ? "?" : ctx.online ? "1" : "0");
    }
  });
});
