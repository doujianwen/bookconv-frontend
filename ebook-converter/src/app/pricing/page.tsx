import Link from "next/link"
import { Check, X } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for casual users",
    features: [
      { text: "5 conversions per hour", included: true },
      { text: "Up to 10MB file size", included: true },
      { text: "All standard formats", included: true },
      { text: "No watermark", included: true },
      { text: "Batch conversion", included: false },
      { text: "Priority queue", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For power users who need more",
    features: [
      { text: "Unlimited conversions", included: true },
      { text: "Up to 50MB file size", included: true },
      { text: "All formats + special tools", included: true },
      { text: "No watermark", included: true },
      { text: "Batch conversion", included: true },
      { text: "Priority queue", included: true },
      { text: "API access", included: false },
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "API",
    price: "$20",
    period: "/month",
    description: "For developers and businesses",
    features: [
      { text: "Unlimited conversions", included: true },
      { text: "Up to 100MB file size", included: true },
      { text: "All formats + special tools", included: true },
      { text: "No watermark", included: true },
      { text: "Batch conversion", included: true },
      { text: "Priority queue", included: true },
      { text: "Full API access", included: true },
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-gray-600">Start free. Upgrade when you need more.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 ${
              plan.highlighted
                ? "border-blue-500 shadow-xl scale-105 bg-white"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-500">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                plan.highlighted
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and Stripe." },
            { q: "Is there a free trial?", a: "Yes! All paid plans come with a 14-day free trial." },
            { q: "What happens to my files?", a: "All uploaded files are encrypted and automatically deleted within 1 hour." },
          ].map(({ q, a }) => (
            <div key={q} className="border-b pb-4">
              <h3 className="font-semibold text-gray-900">{q}</h3>
              <p className="mt-2 text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}