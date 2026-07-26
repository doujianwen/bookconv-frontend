"use client"

import { AnimatedCounter } from "./AnimatedCounter"
import { CONVERSION_COUNTER_TARGET } from "@/data/testimonials"

export function SocialProofBanner() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
      <span className="font-medium">
        <AnimatedCounter target={CONVERSION_COUNTER_TARGET} prefix="" suffix="" className="inline" />
      </span>
      <span>ebooks converted successfully</span>
    </div>
  )
}
