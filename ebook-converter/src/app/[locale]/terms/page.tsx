import type { Metadata } from "next"
import Link from "next/link"
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Terms of Service",
    alternates: {
      canonical: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}/terms`,
      languages: { en: '/terms', es: '/es/terms', 'x-default': '/terms' },
    },
    openGraph: { url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}/terms`, type: "website" },
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={locale === 'es' ? '/es' : '/'} className="hover:text-blue-600">{t('common.home')}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">{t('common.termsOfService')}</li>
        </ol>
      </nav>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('common.termsOfService')}</h1>
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Acceptance of Terms</h2>
          <p>By accessing and using BookConv, you accept and agree to these Terms of Service.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Use of Service</h2>
          <p>You may use BookConv for personal and commercial purposes subject to applicable laws. You are responsible for ensuring you have the right to convert any files you upload.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">File Storage</h2>
          <p>All uploaded files are automatically deleted within 1 hour of conversion. We do not retain copies of your files.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mt-6">Limitation of Liability</h2>
          <p>BookConv is provided "as is" without warranties. We are not liable for any damages arising from the use of our service.</p>
        </section>
      </div>
    </main>
  )
}
