"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoTutorialProps {
  videoUrl: string
  thumbnailUrl?: string
  title: string
  description?: string
  steps?: Array<{ title: string; description: string }>
}

export function VideoTutorial({ videoUrl, thumbnailUrl, title, description, steps }: VideoTutorialProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-black">
        {!isPlaying ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover opacity-60" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
            )}
            <button
              onClick={() => setIsPlaying(true)}
              className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white/30"
            >
              <Play className="h-8 w-8 text-white" fill="white" />
            </button>
          </div>
        ) : (
          <iframe
            src={videoUrl + "?autoplay=1"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
      </div>

      {/* Title and Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>

      {/* Steps */}
      {steps && steps.length > 0 && (
        <div className="rounded-xl border bg-gray-50 p-4">
          <h4 className="mb-3 text-sm font-medium text-gray-700">Steps</h4>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  {i + 1}
                </span>
                <div>
                  <span className="font-medium text-gray-900">{step.title}</span>
                  {step.description && <p className="text-gray-600">{step.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
