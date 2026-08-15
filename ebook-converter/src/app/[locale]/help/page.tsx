import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const messages = await getMessage(locale)
  const t = (key: string) => resolvePath(messages, key) || key

  return {
    title: t('help.metaTitle'),
    description: t('help.metaDescription'),
    alternates: {
      canonical: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}/help`,
      languages: { en: '/help', es: '/es/help', 'x-default': '/help' },
    },
    openGraph: {
      title: t('help.metaTitle') + ' | BookConv',
      url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}/help`,
      type: 'website',
    },
  }
}

interface HelpSection {
  titleKey: string
  slug: string
  descKey: string
  links: Array<{ labelKey: string; href: string }>
}

const sections: HelpSection[] = [
  {
    titleKey: 'help.sections.troubleshoot.title',
    slug: 'troubleshoot',
    descKey: 'help.sections.troubleshoot.desc',
    links: [
      { labelKey: 'help.sections.troubleshoot.links.download', href: 'https://www.bookconv.com/blog/download-troubleshooting' },
      { labelKey: 'help.sections.troubleshoot.links.error', href: '#error-codes' },
    ],
  },
  {
    titleKey: 'help.sections.files.title',
    slug: 'files',
    descKey: 'help.sections.files.desc',
    links: [
      { labelKey: 'help.sections.files.links.expiry', href: '#file-expiry' },
      { labelKey: 'help.sections.files.links.recover', href: '#recover-files' },
    ],
  },
  {
    titleKey: 'help.sections.quality.title',
    slug: 'quality',
    descKey: 'help.sections.quality.desc',
    links: [
      { labelKey: 'help.sections.quality.links.checklist', href: '#quality-checklist' },
      { labelKey: 'help.sections.quality.links.fix', href: 'https://www.bookconv.com/guide/fix-epub-to-pdf-formatting' },
    ],
  },
  {
    titleKey: 'help.sections.contacts.title',
    slug: 'contacts',
    descKey: 'help.sections.contacts.desc',
    links: [
      { labelKey: 'help.sections.contacts.links.email', href: 'mailto:hello@bookconv.com' },
      { labelKey: 'help.sections.contacts.links.report', href: 'https://github.com/doujianwen/bookconv-frontend/issues' },
    ],
  },
]

export default async function HelpPage() {
  const locale = await getLocale()
  const messages = await getMessage(locale)
  const t = (key: string) => resolvePath(messages, key) || key

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href={locale === 'es' ? '/es' : '/'} className="hover:text-blue-600">{t('common.home')}</Link></li>
          <li>/</li>
          <li aria-current="page" className="font-medium text-gray-900">{t('help.title')}</li>
        </ol>
      </nav>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('help.title')}</h1>
      <p className="text-lg text-gray-600 mb-12">{t('help.subtitle')}</p>

      {/* Quick search hint */}
      <div className="mb-12 rounded-xl border bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('help.quickSearch.title')}</h2>
        <p className="text-gray-700">{t('help.quickSearch.desc')}</p>
        <Link
          href={locale === 'es' ? '/es' : '/'}
          className="inline-block mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {t('help.quickSearch.cta')}
        </Link>
      </div>

      {/* Help sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.slug} id={section.slug} className="rounded-xl border bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t(section.titleKey)}</h2>
            <p className="text-gray-700 mb-4">{t(section.descKey)}</p>
            <div className="flex flex-wrap gap-3">
              {section.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {t(link.labelKey)}
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Detailed FAQ anchor section */}
      <section id="error-codes" className="mt-12 rounded-xl border bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('help.errorCodes.title')}</h2>
        <div className="space-y-4">
          {[
            { code: 'CONVERSION_FAILED', descKey: 'help.errorCodes.codes.CONVERSION_FAILED' },
            { code: 'FILE_TOO_LARGE', descKey: 'help.errorCodes.codes.FILE_TOO_LARGE' },
            { code: 'RATE_LIMIT', descKey: 'help.errorCodes.codes.RATE_LIMIT' },
            { code: 'DRM_PROTECTED', descKey: 'help.errorCodes.codes.DRM_PROTECTED' },
            { code: 'CORRUPT_INPUT', descKey: 'help.errorCodes.codes.CORRUPT_INPUT' },
          ].map((item) => (
            <div key={item.code} className="flex items-start gap-3">
              <code className="mt-0.5 rounded bg-gray-200 px-2 py-1 text-xs font-mono font-semibold text-gray-900">
                {item.code}
              </code>
              <p className="text-sm text-gray-700">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* File expiry section */}
      <section id="file-expiry" className="mt-8 rounded-xl border bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('help.fileExpiry.title')}</h2>
        <p className="text-gray-700 mb-4">{t('help.fileExpiry.body')}</p>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>{t('help.fileExpiry.points.download')}</li>
          <li>{t('help.fileExpiry.points.immediate')}</li>
          <li>{t('help.fileExpiry.points.no-recovery')}</li>
        </ul>
      </section>

      {/* Quality checklist */}
      <section id="quality-checklist" className="mt-8 rounded-xl border bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('help.qualityChecklist.title')}</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>{t('help.qualityChecklist.checks.fileSize')}</li>
          <li>{t('help.qualityChecklist.checks.toc')}</li>
          <li>{t('help.qualityChecklist.checks.images')}</li>
          <li>{t('help.qualityChecklist.checks.open')}</li>
          <li>{t('help.qualityChecklist.checks.layout')}</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">{t('help.qualityChecklist.note')}</p>
      </section>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">{t('help.footer.text')}</p>
        <a
          href="mailto:hello@bookconv.com"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          hello@bookconv.com
        </a>
      </div>
    </main>
  )
}
