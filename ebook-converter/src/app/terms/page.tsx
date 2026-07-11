export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <h2>Service</h2>
        <p>We provide a free online ebook format conversion service. The service is provided "as is" without warranties of any kind.</p>
        <h2>Usage Limits</h2>
        <p>Free users are limited to 5 conversions per hour and 10MB file size. Paid plans offer higher limits.</p>
        <h2>Acceptable Use</h2>
        <p>You agree not to use this service for illegal purposes or to distribute copyrighted material without authorization.</p>
        <p className="text-sm text-gray-500 mt-8">Last updated: July 11, 2026</p>
      </div>
    </main>
  )
}
