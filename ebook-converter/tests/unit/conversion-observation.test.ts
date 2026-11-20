import {
  CONVERSION_OBSERVATION_SCHEMA_VERSION,
  createConversionObservationContext,
} from "@/lib/conversion-observation";

describe("conversion observation context", () => {
  it("includes a stable schema version and distinct opaque IDs", () => {
    const context = createConversionObservationContext();
    expect(context.schema_version).toBe(CONVERSION_OBSERVATION_SCHEMA_VERSION);
    expect(context.request_id).toBeTruthy();
    expect(context.attempt_id).toBeTruthy();
    expect(context.request_id).not.toBe(context.attempt_id);
    expect(context).not.toHaveProperty("batch_id");
  });

  it("creates fresh IDs for a retry", () => {
    const first = createConversionObservationContext();
    const retry = createConversionObservationContext();
    expect(retry.request_id).not.toBe(first.request_id);
    expect(retry.attempt_id).not.toBe(first.attempt_id);
  });

  it("includes an optional batch parent without adding user data", () => {
    const context = createConversionObservationContext("batch-test-id");
    expect(context.batch_id).toBe("batch-test-id");
    expect(Object.keys(context).sort()).toEqual([
      "attempt_id", "batch_id", "request_id", "schema_version",
    ]);
  });
});