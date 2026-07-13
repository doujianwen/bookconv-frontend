import Link from "next/link"
import { Check, X } from "lucide-react"
import { getPlans, formatPrice } from "@/lib/payments/service"

const plans = getPlans()

export default function PricingPage() {
  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email: '' }),
      })

      const result = await response.json()

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result.success) {
        alert(result.message)
      } else {
        alert(result.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-gray-600">Start free. Upgrade when you need more.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={"rounded-2xl border p-8"}
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {plan.id === 'free'
                  ? 'Perfect for casual users'
                  : plan.interval === 'month'
                  ? 'For power users who need more'
                  : 'For developers and businesses'}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.priceCents)}</span>
              <span className="text-gray-500">
                {plan.interval === 'one_time' ? '' : '/month'}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <button className="w-full rounded-lg px-4 py-3 text-sm font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">
                Get Started
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={!plan.lemonSqueezyVariantId}
                className={"w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors"}
              >
                {!plan.lemonSqueezyVariantId
                  ? 'Coming Soon'
                  : plan.id === 'api'
                  ? 'Contact Sales'
                  : 'Start Pro Trial'}
              </button>
            )}
          </div>
        ))}
      </div>

      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards via Lemon Squeezy." },
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



