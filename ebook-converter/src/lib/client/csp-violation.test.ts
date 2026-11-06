// src/lib/client/csp-violation.test.ts
//
// R-2 (2026-11-06): tests for the CSP-vs-network discriminator.
//
// These tests exist because the 10-day P0 (100% of >4MB uploads failing) was
// reported as `PUT:NETWORK` — a bucket that hid a deterministic CSP defect as
// "flaky client network". Everything here is written so that it FAILS if the
// discriminator degrades to a no-op (which is the realistic failure mode: the
// feature keeps compiling, emits NETWORK forever, and looks green).

import {
  __resetCspViolationForTest,
  consumeViolation,
  detectCspBlock,
  hostOf,
  installCspViolationRecorder,
  isConnectDirective,
  matchViolation,
  pushViolation,
  recordedViolations,
  type CspViolationRecord,
} from "@/lib/client/csp-violation";
import {
  DirectUploadPutError,
  diagnosticPrefix,
  extractDiagnosticContext,
} from "@/lib/direct-upload-error";
import { uploadFileDirect } from "@/lib/client/direct-upload";

/** Build a recorded violation in the same shape the DOM listener produces. */
function viol(over: Partial<CspViolationRecord> = {}): CspViolationRecord {
  return {
    effectiveDirective: "connect-src",
    violatedDirective: "connect-src",
    blockedURI: "https://ebook-temp.abc.r2.cloudflarestorage.com/uploads/x.txt?sig=1",
    disposition: "enforce",
    at: Date.now(),
    ...over,
  };
}

const R2_HOST = "ebook-temp.abc.r2.cloudflarestorage.com";

beforeEach(() => {
  __resetCspViolationForTest();
  jest.restoreAllMocks();
});

describe("isConnectDirective：只有管 fetch 的指令算数", () => {
  test("connect-src / default-src（回退）→ true", () => {
    expect(isConnectDirective("connect-src")).toBe(true);
    expect(isConnectDirective("default-src")).toBe(true);
  });

  test("指令列表形态（空格分隔）取首项判定", () => {
    expect(isConnectDirective("connect-src 'self'")).toBe(true);
  });

  test("其他指令 → false（不能被别人的违规栽赃给 PUT）", () => {
    for (const d of ["img-src", "script-src", "style-src", "frame-ancestors", "", null, undefined]) {
      expect(isConnectDirective(d as string | null | undefined)).toBe(false);
    }
  });
});

describe("hostOf：只从绝对 URL 取 host", () => {
  test("绝对 URL → host；相对/垃圾/空 → null", () => {
    expect(hostOf("https://a.example/x?y=1")).toBe("a.example");
    expect(hostOf("/api/upload/presign")).toBeNull();
    expect(hostOf("not a url")).toBeNull();
    expect(hostOf("")).toBeNull();
    expect(hostOf(null)).toBeNull();
  });
});

describe("matchViolation：归因必须同时满足「时间窗 + connect 指令 + 同一 host」", () => {
  test("正例：同 host、connect-src、发生在 since 之后 → 命中", () => {
    const since = Date.now();
    const v = viol();
    expect(matchViolation([v], { since, expectedHost: R2_HOST })).toBe(v);
  });

  test("反例 1：时间早于 since（上一次尝试的残留）→ 不命中", () => {
    const since = Date.now();
    const v = viol({ at: since - 5_000 });
    expect(matchViolation([v], { since, expectedHost: R2_HOST })).toBeNull();
  });

  test("反例 2：非 connect 指令（img-src）→ 不命中", () => {
    const since = Date.now();
    const v = viol({ effectiveDirective: "img-src" });
    expect(matchViolation([v], { since, expectedHost: R2_HOST })).toBeNull();
  });

  test("反例 3：host 不同（页面上别的请求被拦）→ 不命中", () => {
    const since = Date.now();
    const v = viol({ blockedURI: "https://other.example/a.js" });
    expect(matchViolation([v], { since, expectedHost: R2_HOST })).toBeNull();
  });

  test("反例 4：blockedURI 缺失（引擎未给出）→ 不可归因，保持 NETWORK", () => {
    const since = Date.now();
    const v = viol({ blockedURI: "" });
    expect(matchViolation([v], { since, expectedHost: R2_HOST })).toBeNull();
  });

  test("调用方无 expectedHost 时不做 host 过滤（presign 同源兜底场景）", () => {
    const since = Date.now();
    const v = viol({ blockedURI: "" });
    expect(matchViolation([v], { since })).toBe(v);
  });
});

describe("缓冲上限：病态页面不能撑爆内存", () => {
  test("超过 16 条时淘汰最旧的，队列长度恒 ≤16", () => {
    const base = Date.now();
    for (let i = 0; i < 50; i++) pushViolation(viol({ at: base + i }));
    const all = recordedViolations();
    expect(all.length).toBeLessThanOrEqual(16);
    // 最后一条必须保留（淘汰的是最旧的）
    expect(all[all.length - 1].at).toBe(base + 49);
  });

  test("consumeViolation 只移除指定那条", () => {
    const a = viol();
    const b = viol({ blockedURI: "https://other.example/x" });
    pushViolation(a);
    pushViolation(b);
    consumeViolation(a);
    expect(recordedViolations()).toEqual([b]);
  });
});

describe("detectCspBlock 时序（GATE：必须等一个宏任务）", () => {
  test("反例：没有任何违规记录 → null（即保持 NETWORK，不误报）", async () => {
    await expect(detectCspBlock({ since: Date.now(), expectedHost: R2_HOST })).resolves.toBeNull();
  });

  test("正例：命中后记录被消费，第二次调用为 null（不重复归因到下一次尝试）", async () => {
    const since = Date.now();
    const v = viol({ at: since + 1 });
    pushViolation(v);
    await expect(detectCspBlock({ since, expectedHost: R2_HOST })).resolves.toBe(v);
    await expect(detectCspBlock({ since, expectedHost: R2_HOST })).resolves.toBeNull();
  });

  test("🔴 时序门禁：事件在 reject 之后才被派发，仍必须被捕获（同步实现会漏）", async () => {
    // 真实浏览器实测：CSP 违规事件比 fetch reject 晚约 1.7ms 到达。
    // 这里在调用 detectCspBlock 之后（同一 tick 内）才 push，模拟该延迟：
    // 若 detectCspBlock 退化为同步读取，本断言必然为 null → 测试失败。
    const since = Date.now();
    const pending = detectCspBlock({ since, expectedHost: R2_HOST });
    pushViolation(viol({ at: Date.now() }));
    await expect(pending).resolves.not.toBeNull();
  });
});

describe("DOM 接线 → uploadFileDirect 端到端：CSP 必须产出 PUT:CSP 而非 PUT:NETWORK", () => {
  const fakeFile = { size: 5_000_000, name: "probe.epub" } as unknown as File;

  /** Minimal document stub: the real listener registers on `document`. */
  function installFakeDocument() {
    const handlers: Array<(e: unknown) => void> = [];
    (globalThis as unknown as { document: unknown }).document = {
      addEventListener: (type: string, fn: (e: unknown) => void) => {
        if (type === "securitypolicyviolation") handlers.push(fn);
      },
    };
    return {
      dispatch(over: Partial<CspViolationRecord> = {}) {
        const e = {
          effectiveDirective: "connect-src",
          violatedDirective: "connect-src",
          blockedURI: "https://r2.example/put",
          disposition: "enforce",
          ...over,
        };
        for (const h of handlers) h(e);
      },
      teardown() {
        delete (globalThis as unknown as { document?: unknown }).document;
      },
    };
  }

  afterEach(() => {
    delete (globalThis as unknown as { document?: unknown }).document;
  });

  test("🔴 真实路径：CSP 拦截 → DirectUploadPutError.cspBlocked=true → 前缀 PUT:CSP:<1s", async () => {
    __resetCspViolationForTest();
    const doc = installFakeDocument();
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ key: "uploads/x.epub", uploadUrl: "https://r2.example/put" }),
    } as unknown as Response);
    // 模拟浏览器行为：fetch 以 TypeError 拒绝，CSP 事件紧随其后（下一个宏任务）派发。
    fetchMock.mockImplementation(() => {
      setTimeout(() => doc.dispatch(), 0);
      return Promise.reject(new TypeError("Failed to fetch"));
    });

    const err = await uploadFileDirect(fakeFile, "epub").then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(DirectUploadPutError);
    const putErr = err as DirectUploadPutError;
    expect(putErr.cspBlocked).toBe(true);
    // 端到端前缀：这就是 GA4 `error` 字段的内容
    expect(diagnosticPrefix(extractDiagnosticContext(putErr))).toBe("PUT:CSP:on=?:<1s:");
    // CSP 是确定性的 → 不得重试：presign(1) + PUT(1) = 2 次 fetch
    expect(fetchMock).toHaveBeenCalledTimes(2);
    doc.teardown();
  });

  test("🔴 反向验证：同样 TypeError 但无 CSP 事件 → cspBlocked=false，前缀回落 NETWORK（且重试）", async () => {
    __resetCspViolationForTest();
    installFakeDocument(); // 装好监听但永不派发 = 真实网络中断
    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ key: "uploads/x.epub", uploadUrl: "https://r2.example/put" }),
    } as unknown as Response);
    fetchMock.mockImplementation(() => Promise.reject(new TypeError("Failed to fetch")));

    const err = await uploadFileDirect(fakeFile, "epub").then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(DirectUploadPutError);
    expect((err as DirectUploadPutError).cspBlocked).toBe(false);
    // 3 次尝试含 400+800ms 退避 ⇒ 时间桶会从 <1s 涨到 1-5s（正是 CSP 不重试的理由），
    // 故此处只断言 kind 与阶段，不锁死时间桶以免在慢速 CI 上抖动。
    expect(diagnosticPrefix(extractDiagnosticContext(err))).toMatch(/^PUT:NETWORK:on=\?:/);
    // 真网络失败仍要重试：presign(1) + PUT(3)
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  test("🔴 时间基准回归：真实监听器写入的 at 必须能被 Date.now() 的 since 匹配", () => {
    // 曾经的 bug：记录器用 performance.now()（从页面加载计时），而调用方 since 用
    // Date.now()（epoch 毫秒）。两者比较恒为「早于 since」⇒ 判别器永久空转。
    // 本用例透过真实监听器（非手工 push）验证时间基准一致。
    __resetCspViolationForTest();
    const doc = installFakeDocument();
    installCspViolationRecorder();
    const since = Date.now();
    doc.dispatch(); // 由真实监听器写入，at = Date.now()
    const rec = recordedViolations();
    expect(rec).toHaveLength(1);
    // 若记录器改用 performance.now()，at 会是几千量级，远小于 since → 此处失败
    expect(rec[0].at).toBeGreaterThanOrEqual(since);
    expect(matchViolation(rec, { since, expectedHost: "r2.example" })).not.toBeNull();
    doc.teardown();
  });

  test("installCspViolationRecorder 幂等：重复安装不会重复登记监听器", () => {
    __resetCspViolationForTest();
    let count = 0;
    (globalThis as unknown as { document: unknown }).document = {
      addEventListener: (type: string) => {
        if (type === "securitypolicyviolation") count++;
      },
    };
    installCspViolationRecorder();
    installCspViolationRecorder();
    installCspViolationRecorder();
    expect(count).toBe(1);
    delete (globalThis as unknown as { document?: unknown }).document;
  });
});
