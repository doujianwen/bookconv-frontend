"use client"

import { useEffect, useRef } from "react"

interface AnimatedCounterProps {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "", className = "" }: AnimatedCounterProps) {
  // SSR and first paint render the target value so crawlers that don't run JS
  // (GPTBot, ClaudeBot, etc.) never see a zero counter next to "join thousands
  // of users" claims. On mount the client resets the text to 0 via the DOM
  // (no React state, so no extra render) and animates up when the element
  // scrolls into view.
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.textContent = "0"

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true

          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = Math.floor(eased * target).toLocaleString()
            if (progress < 1) {
              requestAnimationFrame(tick)
            } else {
              el.textContent = target.toLocaleString()
            }
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{target.toLocaleString()}{suffix}
    </span>
  )
}
