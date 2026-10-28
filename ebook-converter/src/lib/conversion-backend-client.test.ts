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
  recordBackendFailure,
  recordBackendSuccess,
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
  });
});
