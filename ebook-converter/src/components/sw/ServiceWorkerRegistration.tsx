"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("SW registered:", registration.scope)
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("New content available; please refresh.")
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error("SW registration failed:", error)
          })
      })
    }
  }, [])

  return null
}