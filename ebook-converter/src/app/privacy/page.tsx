import type { Metadata } from "next"
import Link from "next/link"
import { getLocale, getMessage } from '@/i18n/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Privacy Policy | BookConv",
    alternates: { canonical: `https://bookconv.com${locale === 'es' ? '/es' : ''}/privacy` },
    openGraph: { url: `https://bookconv.com${locale === 'es' ? '/es' : ''}/privacy`, type: "website" },
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => (messages as any)[key] || key;

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
          <p>All uploaded files are encrypted during transfer via HTTPS and automatically deleted within 1 hour of conversion completion.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Data Collection</h2>
          <p>We collect minimal data necessary for service operation. No personal information is stored or shared with third parties.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Cookies</h2>
          <p>We use essential cookies for language preference and session management only.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Contact</h2>
          <p>If you have questions about this policy, please contact us at privacy@bookconv.com.</p>
        </section>
      </div>
    </main>
  )
}
