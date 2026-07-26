"use client"

import { Star } from "lucide-react"
import { TESTIMONIALS } from "@/data/testimonials"
import { TestimonialCard } from "./TestimonialCard"

interface TestimonialsSectionProps {
  title?: string
  showAll?: boolean
}

export function TestimonialsSection({ title = "What Our Users Say", showAll = false }: TestimonialsSectionProps) {
  const display = showAll ? TESTIMONIALS : TESTIMONIALS.slice(0, 3)

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">Trusted by thousands of readers and content creators worldwide</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {display.map((t, i) => (
            <TestimonialCard key={i} name={t.name} role={t.role} rating={t.rating} text={t.text} />
          ))}
        </div>
      </div>
    </section>
  )
}
