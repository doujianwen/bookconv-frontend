import type { Metadata } from "next"
import Link from "next/link"
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy",
    alternates: {
      canonical: `https://www.bookconv.com/privacy`,
      languages: { en: '/privacy', 'x-default': '/privacy' },
    },
    openGraph: { url: `https://www.bookconv.com/privacy`, type: "website" },
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={locale === 'es' ? '/es' : '/'} className="hover:text-blue-600">{t('common.home')}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">{t('common.privacyPolicy')}</li>
        </ol>
      </nav>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('common.privacyPolicy')}</h1>
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">File Handling &amp; Data Deletion</h2>
          <p>Files are transferred over HTTPS and processed on servers. Some conversions use third-party processing, including CloudConvert. Direct uploads use temporary object storage; converted outputs may be cached to serve an identical conversion again.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Data Collection</h2>
          <p>We process uploaded content and operational data to provide conversions. A route using a third-party conversion service sends the file to that processor. See CloudConvert’s privacy policy for its handling practices.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Cookies</h2>
          <p>The site uses cookies for language preference and sessions and may use analytics to understand site usage.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Contact</h2>
          <p>If you have questions about this policy, please contact us at privacy@bookconv.com.</p>
        </section>
      </div>
    </main>
  )
}
