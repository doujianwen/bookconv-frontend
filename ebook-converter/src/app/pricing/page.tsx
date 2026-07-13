import type { Metadata } from "next"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { getPlans, formatPrice } from "@/lib/payments/service"

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans | BookConv",
  description: "Start converting ebooks for free. Upgrade to Pro for batch conversion, larger files, and priority processing. No hidden fees. Plans from $0–$5/month.",
  alternates: { canonical: "https://bookconv.com/pricing" },
  openGraph: {
    title: "Pricing — Free & Pro Plans | BookConv",
    description: "Start converting ebooks for free. Upgrade to Pro for batch conversion, larger files, and priority processing.",
    url: "https://bookconv.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Free & Pro Plans | BookConv",
    description: "Start converting ebooks for free. Upgrade to Pro for batch conversion.",
  },
},
}

export default function PricingPage() {
  const plans = getPlans()

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email: "" }),
      })

      const result = await response.json()

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else if (result.success) {
        alert(result.message)
      } else {
        alert(result.error || "Something went wrong")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to start checkout")
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">Pricing</li>
        </ol>
      </nav>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-gray-600">
          Start free. Upgrade when you need more. No hidden fees, cancel anytime.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-8 ${plan.id === "pro" ? "border-blue-500 shadow-lg relative" : ""}`}
          >
            {plan.id === "pro" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
            )}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {plan.id === "free"
                  ? "Perfect for casual users"
                  : plan.interval === "month"
                  ? "For power users who need more"
                  : "For developers and businesses"}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.priceCents)}</span>
              <span className="text-gray-500">
                {plan.interval === "one_time" ? "" : "/month"}
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

            {plan.id === "free" ? (
              <button className="w-full rounded-lg px-4 py-3 text-sm font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">
                Get Started Free
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={!plan.lemonSqueezyVariantId}
                className={"w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors" + (plan.id === "pro" ? " bg-blue-600 text-white hover:bg-blue-700" : " bg-gray-100 text-gray-900 hover:bg-gray-200")}
              >
                {!plan.lemonSqueezyVariantId
                  ? "Coming Soon"
                  : plan.id === "api"
                  ? "Contact Sales"
                  : "Start Pro Trial"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ with Schema */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bookconv.com" },
                    { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://bookconv.com/pricing" },
                  ],
                },
                {
                  "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Can I cancel anytime?",
                  acceptedAnswer: { "@type": "Answer", text: "Yes, you can cancel your subscription at any time from your account settings." },
                },
                {
                  "@type": "Question",
                  name: "What payment methods do you accept?",
                  acceptedAnswer: { "@type": "Answer", text: "We accept all major credit cards via Lemon Squeezy, including Visa, Mastercard, and American Express." },
                },
                {
                  "@type": "Question",
                  name: "Is there a free trial?",
                  acceptedAnswer: { "@type": "Answer", text: "Yes! All paid plans come with a 14-day free trial. You can cancel anytime during the trial." },
                },
                {
                  "@type": "Question",
                  name: "What happens to my files?",
                  acceptedAnswer: { "@type": "Answer", text: "All uploaded files are encrypted and automatically deleted within 1 hour of conversion, regardless of your plan." },
                },
                {
                  "@type": "Question",
                  name: "Do you offer refunds?",
                  acceptedAnswer: { "@type": "Answer", text: "Yes, we offer a full refund within 30 days of purchase if you are not satisfied with the service." },
                },
              ],
            }),
          }}
        />
        <div className="space-y-6">
          {[
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your account settings." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards via Lemon Squeezy, including Visa, Mastercard, and American Express." },
            { q: "Is there a free trial?", a: "Yes! All paid plans come with a 14-day free trial. You can cancel anytime during the trial." },
            { q: "What happens to my files?", a: "All uploaded files are encrypted and automatically deleted within 1 hour of conversion, regardless of your plan." },
            { q: "Do you offer refunds?", a: "Yes, we offer a full refund within 30 days of purchase if you are not satisfied with the service." },
          ].map(({ q, a }) => (
            <details key={q} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">{q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Comparison table for SEO */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Free vs Pro: Feature Comparison</h2>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Feature</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Free</th>
                <th className="px-4 py-3 text-center font-medium text-blue-600">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="px-4 py-3">Conversions per hour</td><td className="px-4 py-3 text-center">5</td><td className="px-4 py-3 text-center font-semibold text-blue-600">Unlimited</td></tr>
              <tr><td className="px-4 py-3">Max file size</td><td className="px-4 py-3 text-center">10 MB</td><td className="px-4 py-3 text-center font-semibold text-blue-600">50 MB</td></tr>
              <tr><td className="px-4 py-3">Batch conversion</td><td className="px-4 py-3 text-center"><X className="h-4 w-4 mx-auto text-gray-300" /></td><td className="px-4 py-3 text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></td></tr>
              <tr><td className="px-4 py-3">Priority queue</td><td className="px-4 py-3 text-center"><X className="h-4 w-4 mx-auto text-gray-300" /></td><td className="px-4 py-3 text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></td></tr>
              <tr><td className="px-4 py-3">API access</td><td className="px-4 py-3 text-center"><X className="h-4 w-4 mx-auto text-gray-300" /></td><td className="px-4 py-3 text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}