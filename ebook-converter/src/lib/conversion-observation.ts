export const CONVERSION_OBSERVATION_SCHEMA_VERSION = "conversion_observation_v1" as const;

export interface ConversionObservationContext {
  schema_version: typeof CONVERSION_OBSERVATION_SCHEMA_VERSION;
  request_id: string;
  attempt_id: string;
  batch_id?: string;
}

function createObservationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Compatibility fallback for older secure browser contexts; contains no user data.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

/** One context per user-initiated file conversion. Re-selecting/retrying creates new IDs. */
export function createConversionObservationContext(batchId?: string): ConversionObservationContext {
  return {
    schema_version: CONVERSION_OBSERVATION_SCHEMA_VERSION,
    request_id: createObservationId(),
    attempt_id: createObservationId(),
    ...(batchId ? { batch_id: batchId } : {}),
  };
}