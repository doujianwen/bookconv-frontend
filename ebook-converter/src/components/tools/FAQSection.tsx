import { chrome } from "@/lib/ui-chrome"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  sourceFormat: string
  targetFormat: string
  /** M5-6：西语页 chrome 本地化开关 */
  isEs?: boolean
}

export function FAQSection({ faqs, isEs = false }: FAQSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{chrome('faq', isEs)}</h2>
      <div className="divide-y rounded-xl border bg-white">
        {faqs.map((faq, i) => (
          <details key={i} className="group p-4">
            <summary className="cursor-pointer font-medium text-gray-900 group-open:text-blue-600">
              {faq.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export { generateDefaultFAQs } from '@/lib/seo/conversion-faq'
