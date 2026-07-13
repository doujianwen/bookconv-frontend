import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | BookConv — Free Ebook Converter",
  description: "BookConv Terms of Service: free online ebook converter with usage limits. Acceptable use, liability limitations, and subscription terms.",
  alternates: { canonical: "https://bookconv.com/terms" },
  openGraph: {
    title: "Terms of Service | BookConv",
    description: "Free online ebook converter terms. Usage limits, acceptable use policy, and subscription details.",
    url: "https://bookconv.com/terms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | BookConv",
    description: "Free online ebook converter terms of service.",
  },
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">Terms of Service</li>
        </ol>
      </nav>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Terms of Service",
            description: "BookConv terms of service for free online ebook format conversion.",
            url: "https://bookconv.com/terms",
          }),
        }}
      />
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Service Description</h2>
          <p>BookConv provides a free online ebook format conversion service powered by Calibre. The service is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Usage Limits</h2>
          <p><strong>Free users</strong> are limited to 5 conversions per hour with a maximum file size of 10 MB. <strong>Pro subscribers</strong> enjoy unlimited conversions, up to 50 MB per file, batch processing, and priority queue access.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Acceptable Use</h2>
          <p>You agree not to use this service for illegal purposes, to distribute copyrighted material without authorization, or to attempt to reverse-engineer our conversion engine. Violation of these terms may result in immediate suspension of access.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, and software, is the property of BookConv and protected by applicable intellectual property laws.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Limitation of Liability</h2>
          <p>BookConv shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service in the preceding 12 months.</p>
        </section>
      </div>
      <p className="text-sm text-gray-500 mt-12">Last updated: July 13, 2026</p>
    </main>
  )
}
