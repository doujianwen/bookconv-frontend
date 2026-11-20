export type ConversionAvailability = "available" | "limited" | "unknown";

export interface ConversionAvailabilityResult {
  status: ConversionAvailability;
  scope: "local" | "cloudconvert";
  retryAfterSeconds?: number;
}

/**
 * `available` means the local Redis ledger has headroom, not that CloudConvert's
 * upstream account or every serverless instance is guaranteed to be available.
 */
export function classifyCloudConvertBudget(input: {
  allowed: boolean;
  degraded: boolean;
  retryAfterSeconds?: number;
}): ConversionAvailabilityResult {
  if (input.degraded) return { status: "unknown", scope: "cloudconvert" };
  if (!input.allowed) {
    return {
      status: "limited",
      scope: "cloudconvert",
      ...(input.retryAfterSeconds ? { retryAfterSeconds: input.retryAfterSeconds } : {}),
    };
  }
  return { status: "available", scope: "cloudconvert" };
}