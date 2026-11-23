// Unit tests for fetchWithTimeout (P0 G-C).
// No network: fetch is mocked; timers are driven with Jest fake timers.
import { fetchWithTimeout } from "@/lib/api-error";

describe("fetchWithTimeout", () => {
  afterEach(() => {
    jest.useRealTimers();
    const m = global.fetch as jest.Mock | undefined;
    if (m?.mockRestore) m.mockRestore();
  });

  it("returns the Response unchanged on a normal fetch", async () => {
    const ok = new Response("bytes", { status: 200 });
    global.fetch = jest.fn(async () => ok) as unknown as typeof global.fetch;
    const res = await fetchWithTimeout("/api/convert", { method: "POST" }, 1000);
    expect(res).toBe(ok);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("aborts and throws CONVERSION_TIMEOUT when the budget is exceeded", async () => {
    jest.useFakeTimers();
    let seenSignal: AbortSignal | undefined;
    global.fetch = jest.fn((_url, init) => {
      seenSignal = (init as RequestInit).signal ?? undefined;
      return new Promise((_resolve, reject) => {
        seenSignal?.addEventListener("abort", () => reject(new Error("aborted")));
      });
    }) as unknown as typeof global.fetch;

    const p = fetchWithTimeout("/api/convert", { method: "POST" }, 1000);
    jest.advanceTimersByTime(1000);
    await expect(p).rejects.toThrow(/timed out after 1000ms/);
    try {
      await p;
    } catch (e) {
      expect((e as Error & { cause?: { code?: string } }).cause?.code).toBe("CONVERSION_TIMEOUT");
    }
    expect(seenSignal?.aborted).toBe(true);
  });

  it("propagates non-timeout fetch errors unchanged", async () => {
    const boom = new Error("network down");
    global.fetch = jest.fn(async () => { throw boom; }) as unknown as typeof global.fetch;
    await expect(fetchWithTimeout("/api/convert", {}, 5000)).rejects.toBe(boom);
  });

  it("forwards an already-aborted external signal as a timeout (not a silent hang)", async () => {
    const ext = new AbortController();
    ext.abort();
    global.fetch = jest.fn(() => Promise.reject(new Error("aborted"))) as unknown as typeof global.fetch;
    // external aborted -> we do NOT relabel as timeout (caller owns that signal);
    // the original error propagates. This prevents mislabeling a user cancel.
    await expect(fetchWithTimeout("/api/convert", { signal: ext.signal }, 5000)).rejects.toThrow("aborted");
  });
});
