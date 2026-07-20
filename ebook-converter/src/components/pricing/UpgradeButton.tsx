"use client";

import { useState } from "react";

interface UpgradeButtonProps {
  planId: string;
  hasVariantId: boolean;
  label: string;
}

export default function UpgradeButton({ planId, hasVariantId, label }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!hasVariantId || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email: "" }),
      });

      const result = await response.json();

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.success) {
        alert(result.message);
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={!hasVariantId || loading}
      className={"w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors" + (planId === "pro" ? " bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400" : " bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-100")}
    >
      {label}
    </button>
  );
}