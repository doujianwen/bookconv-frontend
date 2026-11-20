import { classifyCloudConvertBudget } from "@/lib/conversion-availability";

describe("classifyCloudConvertBudget", () => {
  it("reports available only when the tracked budget has headroom", () => {
    expect(classifyCloudConvertBudget({ allowed: true, degraded: false })).toEqual({
      status: "available", scope: "cloudconvert",
    });
  });

  it("reports limited when the tracked daily budget is exhausted", () => {
    expect(classifyCloudConvertBudget({ allowed: false, degraded: false, retryAfterSeconds: 1200 })).toEqual({
      status: "limited", scope: "cloudconvert", retryAfterSeconds: 1200,
    });
  });

  it("reports unknown when Redis is degraded, even though fail-open allows conversion", () => {
    expect(classifyCloudConvertBudget({ allowed: true, degraded: true })).toEqual({
      status: "unknown", scope: "cloudconvert",
    });
  });

  it("does not invent a reset estimate when none was provided", () => {
    expect(classifyCloudConvertBudget({ allowed: false, degraded: false })).toEqual({
      status: "limited", scope: "cloudconvert",
    });
  });
});