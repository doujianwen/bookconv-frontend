import { extractApiError } from "./api-error";

/**
 * 防回归测试（2026-11-01）：extractApiError 曾手维护 KNOWN_CODES 白名单，
 * 较 ErrorCode 全集静默漂移——缺 FILE_TOO_LARGE / UNSUPPORTED_CONVERSION
 * （后端 422/413 真实返回的 code），被判 unknown → 前端 conversion_failed
 * 的 error_code 塌缩为 UNKNOWN，GA4 根因分流失真。
 * 现已改用 isErrorCode 单一事实源（error-handler 的 ErrorCode 全集）。
 * 本测试锁定：后端真实返回的 code 必须原样透传；白名单漂移一旦复发即刻红。
 *
 * 注意：DIRECT_UPLOAD_FAILED 是前端自有码（直传失败经 cause.code 直通
 * ToolPageClient 的 isErrorCode，不经 extractApiError），故不在后端透传清单。
 * 2026-11-01 红队审计后，convert-handler 的三个自造码（INVALID_UPLOAD_KEY /
 * UPLOAD_NOT_FOUND / UPLOAD_EMPTY）已纳入 ErrorCode 全集（error-handler），
 * R2 直传取回失败不再塌缩 UNKNOWN，透传用例一并在下方锁定。
 */

type MinimalResponse = {
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
};

function jsonResponse(body: unknown, status: number): Response {
  return {
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function nonJsonResponse(status: number, raw: string): Response {
  return {
    status,
    json: async () => {
      throw new Error("not json");
    },
    text: async () => raw,
  } as unknown as Response;
}

describe("extractApiError：后端真实 error_code 透传（防白名单漂移复发）", () => {
  it.each([
    ["UNSUPPORTED_CONVERSION", 422],
    ["FILE_TOO_LARGE", 413],
  ])("透传 %s（HTTP %i），不再塌缩 UNKNOWN", async (code, status) => {
    const err = await extractApiError(
      jsonResponse({ error: "boom", code }, status),
    );
    expect(err.code).toBe(code);
    expect(err.status).toBe(status);
  });

  it.each([
    ["UPLOAD_NOT_FOUND", 400],
    ["UPLOAD_EMPTY", 400],
    ["INVALID_UPLOAD_KEY", 400],
  ])("透传 R2 取回族码 %s（HTTP %i）", async (code, status) => {
    const err = await extractApiError(
      jsonResponse({ error: "boom", code }, status),
    );
    expect(err.code).toBe(code);
  });

  it("ErrorCode 全集内的既有码仍然透传（无回归）", async () => {
    const err = await extractApiError(
      jsonResponse({ error: "boom", code: "CONVERSION_QUOTA_EXCEEDED" }, 429),
    );
    expect(err.code).toBe("CONVERSION_QUOTA_EXCEEDED");
  });

  it("ErrorCode 全集之外的码仍判 undefined（不做无差别放行）", async () => {
    const err = await extractApiError(
      jsonResponse({ error: "boom", code: "NOT_A_REAL_CODE" }, 500),
    );
    expect(err.code).toBeUndefined();
  });

  it("非 JSON 响应（如 502 HTML）无 code，仅给可读 message", async () => {
    const err = await extractApiError(
      nonJsonResponse(502, "<html>Bad Gateway</html>"),
    );
    expect(err.code).toBeUndefined();
    expect(err.status).toBe(502);
    expect(err.message).toContain("Bad Gateway");
  });
});
