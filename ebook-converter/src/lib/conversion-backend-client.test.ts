// Unit tests for the self-hosted backend delegation client (WP4 failover).
// fetch is mocked; no network involved. See src/lib/conversion-backend-client.ts.
//
// NOTE: deliberately NO jest.resetModules() — the client and the breaker must
// share ONE breaker module instance, otherwise the "circuit open" assertions
// would silently test a different instance than the code under test (the
// exact "silent false-success" failure mode this repo treats as enemy #1).
import {
  backendConfigured,
  delegateToBackend,
  isCalibreTarget,
} from "@/lib/conversion-backend-client";
import {
  breakerSnapshot,
  breakerState,
  recordBackendFailure,
  recordBackendSuccess,
  shouldUseBackend,
} from "@/lib/conversion-circuit-breaker";

const ENV = process.env;

describe("conversion backend client", () => {
  beforeEach(() => {
    process.env = { ...ENV };
    recordBackendSuccess(); // reset breaker state between tests
  });

  afterAll(() => {
    process.env = ENV;
  });

  function makeForm(target = "mobi"): FormData {
    const fd = new FormData();
    fd.append("file", new File([Buffer.from("fake-epub-bytes")], "book.epub"), "book.epub");
    fd.append("source_format", "epub");
    fd.append("target_format", target);
    return fd;
  }

  function setEnv(url = "https://bk.test", secret = "sec") {
    process.env.CONVERSION_BACKEND_URL = url;
    process.env.CONVERSION_INTERNAL_SECRET = secret;
  }

  describe("isCalibreTarget (whitelist mirrors backend BACKEND_TARGETS)", () => {
    it("accepts formats Calibre can emit", () => {
      for (const f of ["epub", "mobi", "azw3", "pdf", "txt", "docx", "html", "rtf"]) {
        expect(isCalibreTarget(f)).toBe(true);
      }
    });
    it("rejects unknown/unsupported formats and null", () => {
      expect(isCalibreTarget("xyz")).toBe(false);
      expect(isCalibreTarget("")).toBe(false);
      expect(isCalibreTarget(null)).toBe(false);
      expect(isCalibreTarget(undefined)).toBe(false);
    });
    it("strips a leading dot and lowercases", () => {
      expect(isCalibreTarget(".MOBI")).toBe(true);
    });
  });

  describe("backendConfigured", () => {
    it("false when either env var is missing", () => {
      delete process.env.CONVERSION_BACKEND_URL;
      delete process.env.CONVERSION_INTERNAL_SECRET;
      expect(backendConfigured()).toBe(false);
      process.env.CONVERSION_BACKEND_URL = "https://bk.test";
      expect(backendConfigured()).toBe(false); // secret still missing
      process.env.CONVERSION_INTERNAL_SECRET = "sec";
      expect(backendConfigured()).toBe(true);
    });
  });

  describe("delegateToBackend", () => {
    afterEach(() => {
      const mock = global.fetch as jest.Mock | undefined;
      if (mock?.mockRestore) mock.mockRestore();
    });

    it("returns null when backend is not configured (fail-open to CloudConvert)", async () => {
      delete process.env.CONVERSION_BACKEND_URL;
      const fetchMock = jest.fn();
      global.fetch = fetchMock as unknown as typeof global.fetch;
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns null when the circuit is open (no request attempted)", async () => {
      setEnv();
      recordBackendFailure();
      recordBackendFailure();
      recordBackendFailure(); // opens the circuit
      const fetchMock = jest.fn();
      global.fetch = fetchMock as unknown as typeof global.fetch;
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns null when the form has no File (upload_key path -> CloudConvert)", async () => {
      setEnv();
      const fetchMock = jest.fn();
      global.fetch = fetchMock as unknown as typeof global.fetch;
      const fd = new FormData();
      fd.append("upload_key", "uploads/abc.epub");
      fd.append("source_format", "epub");
      fd.append("target_format", "mobi");
      expect(await delegateToBackend(fd, {})).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns a 200 NextResponse streaming the backend bytes on success", async () => {
      setEnv();
      const fakeRes = new Response(new Blob([Buffer.from("MOBI-BYTES")]), {
        status: 200,
        headers: {
          "content-type": "application/x-mobipocket-ebook",
          "content-disposition": 'attachment; filename="book.mobi"',
          "cache-control": "no-store",
          "x-internal-noise": "should-not-forward",
        },
      });
      const fetchMock = jest.fn(async () => fakeRes);
      global.fetch = fetchMock as unknown as typeof global.fetch;

      const resp = await delegateToBackend(makeForm(), { "X-RateLimit-Remaining": "19" });
      expect(resp).not.toBeNull();
      expect(resp!.status).toBe(200);
      expect(resp!.headers.get("content-type")).toBe("application/x-mobipocket-ebook");
      expect(resp!.headers.get("content-disposition")).toBe('attachment; filename="book.mobi"');
      expect(resp!.headers.get("cache-control")).toBe("no-store");
      expect(resp!.headers.get("x-internal-noise")).toBeNull(); // not forwarded
      expect(resp!.headers.get("X-Conversion-Backend")).toBe("hit");
      expect(resp!.headers.get("X-RateLimit-Remaining")).toBe("19");
      expect(await resp!.text()).toBe("MOBI-BYTES");

      // contract: secret header + correct URL were sent
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe("https://bk.test/api/convert-internal");
      expect((init.headers as Record<string, string>)["x-internal-convert"]).toBe("sec");
    });

    it("returns null on 5xx (failover to CloudConvert) and records a failure", async () => {
      setEnv();
      global.fetch = jest.fn(
        async () => new Response("boom", { status: 500 }),
      ) as unknown as typeof global.fetch;
      const before = breakerSnapshot();
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      const after = breakerSnapshot();
      expect(after.failures).toBe(before.failures + 1);
    });

    // 2026-11-02 红队修正：429 是容量信号（后端活着但排满了），不是健康失败。
    // 反向约束——若有人把 429 重新接回 recordBackendFailure，本组用例立刻变红。
    it("429 is capacity, not outage: does not increment failures", async () => {
      setEnv();
      global.fetch = jest.fn(
        async () =>
          new Response(JSON.stringify({ error: "Backend busy", code: "BACKEND_BUSY" }), {
            status: 429,
          }),
      ) as unknown as typeof global.fetch;
      const before = breakerSnapshot();
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      const after = breakerSnapshot();
      expect(after.failures).toBe(before.failures); // 关键：健康失败数不增
      expect(after.busyCount).toBe(before.busyCount + 1); // 只计观测数
      expect(after.state).toBe("closed");
    });

    it("three consecutive 429s do NOT open the circuit (would have before the fix)", async () => {
      setEnv();
      const fetchMock = jest.fn(async () => new Response("busy", { status: 429 }));
      global.fetch = fetchMock as unknown as typeof global.fetch;

      for (let i = 0; i < 3; i += 1) {
        expect(await delegateToBackend(makeForm(), {})).toBeNull();
      }

      expect(breakerState()).toBe("closed");
      expect(shouldUseBackend()).toBe(true);
      // 第三次仍然真的发了请求（没被熔断提前挡掉）
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("a 429 does not swallow the failure budget of a real outage", async () => {
      setEnv();
      // 两次真实故障 + 两次忙：仍是 2 次健康失败，未达阈值
      global.fetch = jest.fn(async () => new Response("boom", { status: 500 })) as unknown as typeof global.fetch;
      await delegateToBackend(makeForm(), {});
      await delegateToBackend(makeForm(), {});
      global.fetch = jest.fn(async () => new Response("busy", { status: 429 })) as unknown as typeof global.fetch;
      await delegateToBackend(makeForm(), {});
      await delegateToBackend(makeForm(), {});

      expect(breakerState()).toBe("closed");
      expect(breakerSnapshot().failures).toBe(2);
      expect(breakerSnapshot().busyCount).toBe(2);
    });

    it("returns null on network error (failover to CloudConvert)", async () => {
      setEnv();
      global.fetch = jest.fn(async () => {
        throw new Error("ECONNREFUSED");
      }) as unknown as typeof global.fetch;
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
    });

    it("aborts a slow backend quickly and falls back (timeout path)", async () => {
      setEnv();
      process.env.CONVERSION_BACKEND_TIMEOUT_MS = "100"; // fast test; prod default 90s
      global.fetch = jest.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new Error("The operation was aborted")),
            );
          }),
      ) as unknown as typeof global.fetch;
      const started = Date.now();
      const resp = await delegateToBackend(makeForm(), {});
      expect(resp).toBeNull();
      const elapsed = Date.now() - started;
      expect(elapsed).toBeLessThan(5_000); // aborted, did NOT wait 90s
      expect(breakerSnapshot().failures).toBeGreaterThan(0); // counted as failure
    });

    it("forwards a prebuiltFile (R2 upload_key path) to the backend", async () => {
      setEnv();
      const fetchMock = jest.fn(
        async () => new Response(new Blob([Buffer.from("OUT")]), { status: 200 }),
      );
      global.fetch = fetchMock as unknown as typeof global.fetch;
      const fd = new FormData();
      fd.append("upload_key", "uploads/2026-10-28/2f1c9a3b-4d5e-4f6a-8b7c-9d0e1f2a3b4c.epub");
      fd.append("source_format", "epub");
      fd.append("target_format", "mobi");
      const prebuilt = new File([Buffer.from("BIG-EPUB-BYTES")], "upload.epub");

      const resp = await delegateToBackend(fd, {}, { prebuiltFile: prebuilt });

      expect(resp).not.toBeNull();
      expect(resp!.status).toBe(200);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe("https://bk.test/api/convert-internal");
      const sent = init.body as FormData;
      const sentFile = sent.get("file");
      expect(sentFile).toBeInstanceOf(File);
      expect((sentFile as File).name).toBe("upload.epub");
      expect(sent.get("source_format")).toBe("epub");
      expect(sent.get("target_format")).toBe("mobi");
    });

    it("forwards the quality field when present", async () => {
      setEnv();
      const fetchMock = jest.fn(
        async () => new Response(new Blob([Buffer.from("X")]), { status: 200 }),
      );
      global.fetch = fetchMock as unknown as typeof global.fetch;
      const fd = makeForm();
      fd.append("quality", "high");

      await delegateToBackend(fd, {});

      const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect((init.body as FormData).get("quality")).toBe("high");
    });

    // 2026-11-02：delegation 失败原因必须能回传给调用方（告警卡归因）。
    // 反向约束——若有人把 onFallback 删掉或忘了某个分支，下列用例变红。
    describe("fallback reason reporting (alert attribution)", () => {
      it("reports busy + backend code for 429", async () => {
        setEnv();
        global.fetch = jest.fn(
          async () =>
            new Response(JSON.stringify({ error: "Backend busy", code: "BACKEND_BUSY" }), {
              status: 429,
            }),
        ) as unknown as typeof global.fetch;
        let reason: string | undefined;
        await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        expect(reason).toBe("backend busy (429) BACKEND_BUSY");
      });

      it("reports a plain busy reason when the 429 body is not JSON (nginx limit_req)", async () => {
        setEnv();
        global.fetch = jest.fn(
          async () => new Response("<html>503</html>", { status: 429 }),
        ) as unknown as typeof global.fetch;
        let reason: string | undefined;
        await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        expect(reason).toBe("backend busy (429)");
      });

      it("reports the HTTP status AND the backend's own error body", async () => {
        setEnv();
        global.fetch = jest.fn(
          async () => new Response("boom", { status: 502 }),
        ) as unknown as typeof global.fetch;
        let reason: string | undefined;
        await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        // 2026-11-03 行为变更：非 200 分支开始透传响应体（此前只有 "backend HTTP 502"）。
        expect(reason).toBe("backend HTTP 502 — boom");
      });

      // 2026-11-03（Job f547b469）：后端 500 的 261 B 响应体里本来就有真因
      // （`Conversion failed: ...BadZipfile...`），此前被整条丢弃，告警卡只剩
      // "backend HTTP 500"，值班人只能 SSH 翻日志。反向约束——若有人删掉
      // readBackendDetail，本组用例立刻变红。
      describe("5xx body passthrough (root-cause visibility)", () => {
        it("includes code + error from a JSON body", async () => {
          setEnv();
          const backendError =
            "Conversion failed: calibre.utils.zipfile.BadZipfile: File is not a zip file";
          global.fetch = jest.fn(
            async () =>
              new Response(JSON.stringify({ error: backendError, code: "CONVERSION_FAILED" }), {
                status: 500,
              }),
          ) as unknown as typeof global.fetch;
          let reason: string | undefined;
          await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
          expect(reason).toContain("backend HTTP 500");
          expect(reason).toContain("CONVERSION_FAILED");
          expect(reason).toContain("BadZipfile"); // 真因必须可见
        });

        it("flattens newlines so the alert card keeps one line per field", async () => {
          setEnv();
          global.fetch = jest.fn(
            async () =>
              new Response(
                JSON.stringify({ error: "line1\n\nline2\r\nline3", code: "CONVERSION_FAILED" }),
                { status: 500 },
              ),
          ) as unknown as typeof global.fetch;
          let reason: string | undefined;
          await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
          expect(reason).not.toMatch(/[\r\n]/);
          expect(reason).toContain("line1 line2 line3");
        });

        it("caps the appended detail at 180 chars (alerts.ts does not truncate)", async () => {
          setEnv();
          const huge = "X".repeat(5000);
          global.fetch = jest.fn(
            async () =>
              new Response(JSON.stringify({ error: huge, code: "CONVERSION_FAILED" }), {
                status: 500,
              }),
          ) as unknown as typeof global.fetch;
          let reason: string | undefined;
          await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
          expect(reason!.length).toBeLessThanOrEqual("backend HTTP 500 — ".length + 180);
        });

        it("degrades to plain status when the body is empty", async () => {
          setEnv();
          global.fetch = jest.fn(
            async () => new Response(null, { status: 500 }),
          ) as unknown as typeof global.fetch;
          let reason: string | undefined;
          await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
          expect(reason).toBe("backend HTTP 500");
        });

        it("degrades to plain status when reading the body throws (already consumed)", async () => {
          setEnv();
          const broken = new Response("x", { status: 500 });
          Object.defineProperty(broken, "clone", {
            value: () => {
              throw new TypeError("Body is unusable");
            },
          });
          global.fetch = jest.fn(async () => broken) as unknown as typeof global.fetch;
          let reason: string | undefined;
          await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
          expect(reason).toBe("backend HTTP 500"); // 诊断失败绝不能影响降级路径
        });
      });

      it("reports circuit-open WITHOUT attempting a request", async () => {
        setEnv();
        recordBackendFailure();
        recordBackendFailure();
        recordBackendFailure(); // opens the circuit
        const fetchMock = jest.fn();
        global.fetch = fetchMock as unknown as typeof global.fetch;
        let reason: string | undefined;
        await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        expect(reason).toContain("circuit open");
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it("reports the network error message", async () => {
        setEnv();
        global.fetch = jest.fn(async () => {
          throw new Error("ECONNREFUSED 10.0.0.1:443");
        }) as unknown as typeof global.fetch;
        let reason: string | undefined;
        await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        expect(reason).toBe("backend error: ECONNREFUSED 10.0.0.1:443");
      });

      it("stays silent on success (no false alarm in the card)", async () => {
        setEnv();
        global.fetch = jest.fn(
          async () => new Response(new Blob([Buffer.from("OK")]), { status: 200 }),
        ) as unknown as typeof global.fetch;
        let reason: string | undefined;
        const resp = await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        expect(resp).not.toBeNull();
        expect(reason).toBeUndefined();
      });
    });

    // 2026-11-02：Vercel 出站不转发客户端 IP，必须显式带上，否则后端永远
    // 只能看到 Vercel egress。反向约束——若有人删掉这个头，本组用例变红。
    describe("client IP passthrough", () => {
      it("sends x-client-ip when the route resolved one", async () => {
        setEnv();
        const fetchMock = jest.fn(
          async () => new Response(new Blob([Buffer.from("OK")]), { status: 200 }),
        );
        global.fetch = fetchMock as unknown as typeof global.fetch;

        await delegateToBackend(makeForm(), {}, { clientIp: "203.0.113.7" });

        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect((init.headers as Record<string, string>)["x-client-ip"]).toBe("203.0.113.7");
      });

      it("omits the header entirely when IP is unknown (never sends empty)", async () => {
        setEnv();
        const fetchMock = jest.fn(
          async () => new Response(new Blob([Buffer.from("OK")]), { status: 200 }),
        );
        global.fetch = fetchMock as unknown as typeof global.fetch;

        await delegateToBackend(makeForm(), {}, {});

        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect("x-client-ip" in (init.headers as Record<string, string>)).toBe(false);
    });
  });

  // 2026-11-04（任务 #1）· 2026-11-04 红队审计校正：
  // 注意「立论校正」——f547b469 那次 500 实为 CONVERSION_FAILED（用户坏文件），
  // 不是基础设施瞬时 5xx，重试救不了它。本重试逻辑是**通用的 fail-safe**：针对
  // 后端进程抖动/重启/GC 这类真·瞬时 5xx，挽救本可成功的 job，避免白烧 CC；
  // 对「转换失败 500」（坏文件）是净开销，但安全（重试必再败，只计 1 次故障）。
  // 超时/网络/429/4xx 一律不重试。
  describe("5xx transient retry (task #1)", () => {
    it("retries a single 5xx and succeeds on the retry", async () => {
      setEnv();
      let calls = 0;
      global.fetch = jest.fn(async () => {
        calls += 1;
        if (calls === 1) return new Response("boom", { status: 500 });
        return new Response(new Blob([Buffer.from("RETRY-OK")]), { status: 200 });
      }) as unknown as typeof global.fetch;

      const before = breakerSnapshot();
      const resp = await delegateToBackend(makeForm(), {});
      const after = breakerSnapshot();

      expect(resp).not.toBeNull();
      expect(resp!.status).toBe(200);
      expect(await resp!.text()).toBe("RETRY-OK");
      expect(calls).toBe(2); // 重试发生了
      expect(after.failures).toBe(before.failures); // 重试成功 → 故障数不增
    });

    it("two 5xx (after retry) records exactly ONE failure, not two", async () => {
      setEnv();
      global.fetch = jest.fn(
        async () => new Response("boom", { status: 500 }),
      ) as unknown as typeof global.fetch;

      const before = breakerSnapshot();
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      const after = breakerSnapshot();

      expect(after.failures).toBe(before.failures + 1); // 关键：重试失败只计 1 次
    });

    it("does NOT retry on timeout (slow failure)", async () => {
      setEnv();
      process.env.CONVERSION_BACKEND_TIMEOUT_MS = "100";
      let calls = 0;
      global.fetch = jest.fn(
        (_url: string, init?: RequestInit) => {
          calls += 1;
          return new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new Error("The operation was aborted")),
            );
          });
        },
      ) as unknown as typeof global.fetch;

      const started = Date.now();
      const resp = await delegateToBackend(makeForm(), {});
      expect(resp).toBeNull();
      expect(Date.now() - started).toBeLessThan(5_000);
      expect(calls).toBe(1); // 超时绝不重试
    });

    it("does NOT retry on network error", async () => {
      setEnv();
      let calls = 0;
      global.fetch = jest.fn(async () => {
        calls += 1;
        throw new Error("ECONNREFUSED");
      }) as unknown as typeof global.fetch;

      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      expect(calls).toBe(1); // 网络错误不重试
    });

    it("does NOT retry on 429 (capacity signal)", async () => {
      setEnv();
      let calls = 0;
      global.fetch = jest.fn(async () => {
        calls += 1;
        return new Response("busy", { status: 429 });
      }) as unknown as typeof global.fetch;

      const before = breakerSnapshot();
      expect(await delegateToBackend(makeForm(), {})).toBeNull();
      const after = breakerSnapshot();

      expect(calls).toBe(1); // 429 不重试
      expect(after.failures).toBe(before.failures); // 不计入熔断
      expect(after.busyCount).toBe(before.busyCount + 1);
    });

    it("retry sends a fresh, valid FormData to the backend", async () => {
      setEnv();
      let calls = 0;
      global.fetch = jest.fn(async () => {
        calls += 1;
        if (calls === 1) return new Response("boom", { status: 500 });
        return new Response(new Blob([Buffer.from("X")]), { status: 200 });
      }) as unknown as typeof global.fetch;

      await delegateToBackend(makeForm(), {});
      expect(calls).toBe(2);
      const secondCall = (global.fetch as jest.Mock).mock.calls[1] as unknown as [string, RequestInit];
      const sent = secondCall[1].body as FormData;
      expect(sent).toBeInstanceOf(FormData);
      expect(sent.get("file")).toBeInstanceOf(File);
      expect(sent.get("source_format")).toBe("epub");
      expect(sent.get("target_format")).toBe("mobi");
    });

    it("does NOT retry a deterministic CONVERSION_FAILED 500 (bad user file)", async () => {
      // 后端契约：conversion-backend/app/index.js 对 Calibre 转换失败固定返回
      // 500 + code=CONVERSION_FAILED，与瞬时故障无关；重试同一输入必再败。
      // 但告警串 / 故障计数 / 回退行为必须与其它 5xx 完全一致（输出不变）。
      setEnv();
      let calls = 0;
      global.fetch = jest.fn(async () => {
        calls += 1;
        return new Response(
          JSON.stringify({ error: "Conversion failed: OEBError: Spine is empty", code: "CONVERSION_FAILED" }),
          { status: 500 },
        );
      }) as unknown as typeof global.fetch;

      const before = breakerSnapshot();
      let reason: string | undefined;
      const resp = await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
      const after = breakerSnapshot();

      expect(resp).toBeNull(); // 仍回退 CloudConvert
      expect(calls).toBe(1); // 关键：跳过必败重试
      expect(after.failures).toBe(before.failures + 1); // 仍计 1 次故障（不放大）
      expect(reason).toContain("backend HTTP 500");
      expect(reason).toContain("CONVERSION_FAILED");
      expect(reason).not.toContain("after 1 retry"); // 告警卡格式不变
    });

    it("still retries a generic 5xx WITHOUT a CONVERSION_FAILED code (transient infra fault)", async () => {
      // 反向约束：只有确定性转换失败才跳过重试；进程抖动/重启类 5xx 仍重试挽救。
      setEnv();
      let calls = 0;
      global.fetch = jest.fn(async () => {
        calls += 1;
        if (calls === 1) return new Response("boom", { status: 500 });
        return new Response(new Blob([Buffer.from("OK")]), { status: 200 });
      }) as unknown as typeof global.fetch;

      const resp = await delegateToBackend(makeForm(), {});
      expect(resp).not.toBeNull();
      expect(calls).toBe(2);
    });

    it("reports the backend root cause without a retry tag (alert-card format unchanged)", async () => {
      setEnv();
      const backendError = "Conversion failed: calibre.utils.zipfile.BadZipfile";
      global.fetch = jest.fn(
        async () =>
          new Response(JSON.stringify({ error: backendError, code: "CONVERSION_FAILED" }), {
            status: 500,
          }),
      ) as unknown as typeof global.fetch;
      let reason: string | undefined;
      await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
      // onFallback 串与现状一致（不含 "after 1 retry"），保证既有告警卡解析不变
      expect(reason).toContain("backend HTTP 500");
      expect(reason).toContain("CONVERSION_FAILED");
      expect(reason).toContain("BadZipfile");
      expect(reason).not.toContain("after 1 retry");
    });

    describe("DRM detection short-circuit (2026-11-07)", () => {
      it("returns a 422 DRM_PROTECTED response and does NOT fall back to CloudConvert", async () => {
        setEnv();
        global.fetch = jest.fn(
          async () =>
            new Response(
              JSON.stringify({
                error: "This file is protected by DRM and cannot be converted.",
                code: "DRM_PROTECTED",
              }),
              { status: 422 },
            ),
        ) as unknown as typeof global.fetch;

        let reason: string | undefined;
        const resp = await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });

        expect(resp).not.toBeNull();
        expect(resp!.status).toBe(422);
        const body = (await resp!.json()) as { code: string; error: string };
        expect(body.code).toBe("DRM_PROTECTED");
        expect(body.error).toContain("remove DRM");
        // DRM 是用户侧输入问题：不应计入熔断、不应回退（onFallback 不应被调用）
        expect(reason).toBeUndefined();
      });

      it("does not short-circuit a non-DRM 4xx (still falls back)", async () => {
        setEnv();
        global.fetch = jest.fn(
          async () =>
            new Response(JSON.stringify({ error: "bad input", code: "OTHER_4XX" }), { status: 422 }),
        ) as unknown as typeof global.fetch;

        let reason: string | undefined;
        const resp = await delegateToBackend(makeForm(), {}, { onFallback: (r) => { reason = r; } });
        expect(resp).toBeNull(); // 仍回退
        expect(reason).toContain("backend HTTP 422");
      });
    });
  });
});
});
