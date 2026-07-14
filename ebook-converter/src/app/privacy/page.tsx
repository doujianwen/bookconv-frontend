import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | BookConv -- Your Data Stays Private",
  description: "BookConv privacy policy: All uploaded files are encrypted in transit and auto-deleted within 1 hour. We collect zero personal data. No cookies, no tracking.",
  alternates: { canonical: "https://bookconv.com/privacy" },
  openGraph: {
    title: "Privacy Policy | BookConv",
    description: "We collect zero personal data. All files encrypted and auto-deleted within 1 hour.",
    url: "https://bookconv.com/privacy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | BookConv",
    description: "Zero data collection. Files auto-deleted in 1 hour.",
  },
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">Privacy Policy</li>
        </ol>
      </nav>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy",
            description: "BookConv privacy policy: zero data collection, automatic file deletion.",
            url: "https://bookconv.com/privacy",
          }),
        }}
      />
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">File Handling &amp; Data Deletion</h2>
          <p>All uploaded files are encrypted during transfer via HTTPS and automatically deleted within 1 hour of conversion completion. We do not store, read, access, or share your content under any circumstances.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Data Collection</h2>
          <p>We only collect minimal technical data necessary for service operation: file names, file types, and conversion types. <strong>No personal information</strong> (name, email, address) is collected without your explicit consent.</p>
          <p>We do not use cookies for tracking purposes, and we do not employ any third-party analytics that track user behavior across websites.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Third-Party Services</h2>
          <p>Our service uses Supabase for authentication and Cloudflare R2 for temporary file storage. Both providers comply with GDPR and CCPA regulations. We do not share your data with any other third parties.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Your Rights</h2>
          <p>Under GDPR and CCPA, you have the right to access, rectify, erase, and port your data. Since we collect minimal data, there is little to no personal data stored. For questions, contact us at privacy@bookconv.com.</p>
        </section>
      </div>
      <p className="text-sm text-gray-500 mt-12">Last updated: July 13, 2026</p>
    </main>
  )
}
