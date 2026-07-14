import type { Metadata } from "next"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { getPlans, formatPrice } from "@/lib/payments/service"
import { getLocale, getMessage } from '@/i18n/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => (messages as any)[key] || key;

  return {
    title: t('pricing.title') + " | BookConv",
    description: t('seo.defaultDescription') || 'Start converting ebooks for free.',
    alternates: { canonical: `https://bookconv.com${locale === 'es' ? '/es' : ''}/pricing` },
    openGraph: {
      title: t('pricing.title') + " | BookConv",
      url: `https://bookconv.com${locale === 'es' ? '/es' : ''}/pricing`,
      type: "website",
    },
    twitter: {
      card: 'summary_large_image',
      title: t('pricing.title') + " | BookConv",
    },
  };
}

export default async function PricingPage() {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => (messages as any)[key] || key;
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
          <li><Link href={locale === 'es' ? '/es' : '/'} className="hover:text-blue-600">{t('common.home')}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">{t('common.pricing')}</li>
        </ol>
      </nav>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">{t('pricing.title')}</h1>
        <p className="mt-4 text-lg text-gray-600" dangerouslySetInnerHTML={{ __html: (t('pricing.subtitle') || 'Start free. Upgrade when you need more.').replace('\n', '<br/>') }} />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-8 ${plan.id === "pro" ? "border-blue-500 shadow-lg relative" : ""}`}
          >
            {plan.id === "pro" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">{t('pricing.mostPopular')}</span>
            )}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {plan.id === "free"
                  ? t('pricing.perfectForCasual')
                  : plan.interval === "month"
                  ? t('pricing.forPowerUsers')
                  : t('pricing.forDevelopers')}
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
                {t('pricing.getStartedFree')}
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={!plan.lemonSqueezyVariantId}
                className={"w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors" + (plan.id === "pro" ? " bg-blue-600 text-white hover:bg-blue-700" : " bg-gray-100 text-gray-900 hover:bg-gray-200")}
              >
                {!plan.lemonSqueezyVariantId
                  ? t('pricing.comingSoon')
                  : plan.id === "api"
                  ? t('pricing.contactSales')
                  : t('pricing.startProTrial')}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('pricing.faqTitle')}</h2>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <details key={i} className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">{t(`pricing.pqa${i}_q`)}</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(`pricing.pqa${i}_a`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('pricing.featureComparison')}</h2>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Feature</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">{t('pricing.getStartedFree')}</th>
                <th className="px-4 py-3 text-center font-medium text-blue-600">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="px-4 py-3">{t('pricing.conversionsPerHour')}</td><td className="px-4 py-3 text-center">5</td><td className="px-4 py-3 text-center font-semibold text-blue-600">{t('pricing.unlimited')}</td></tr>
              <tr><td className="px-4 py-3">{t('pricing.maxFileSize')}</td><td className="px-4 py-3 text-center">10 MB</td><td className="px-4 py-3 text-center font-semibold text-blue-600">50 MB</td></tr>
              <tr><td className="px-4 py-3">{t('pricing.batchConversion')}</td><td className="px-4 py-3 text-center"><X className="h-4 w-4 mx-auto text-gray-300" /></td><td className="px-4 py-3 text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></td></tr>
              <tr><td className="px-4 py-3">{t('pricing.priorityQueue')}</td><td className="px-4 py-3 text-center"><X className="h-4 w-4 mx-auto text-gray-300" /></td><td className="px-4 py-3 text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></td></tr>
              <tr><td className="px-4 py-3">{t('pricing.apiAccess')}</td><td className="px-4 py-3 text-center"><X className="h-4 w-4 mx-auto text-gray-300" /></td><td className="px-4 py-3 text-center"><Check className="h-4 w-4 mx-auto text-green-500" /></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
