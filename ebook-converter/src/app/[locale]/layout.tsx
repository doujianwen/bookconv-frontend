import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessage } from '@/i18n/utils'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}

export async function generateMetadata(): Promise<Metadata> {
  // Homepage metadata. Every leaf page under [locale] sets its own
  // `alternates`, so this applies only to the homepage and does not leak
  // to children. We MUST include `canonical` here because Next.js replaces
  // (not merges) the parent root layout's `alternates` entirely, and the
  // root layout's path-blind canonical would otherwise point at `/` for
  // every page under [locale].
  const locale = await getLocale()
  return {
    alternates: {
      canonical: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}`,
      languages: {
        en: '/',
        es: '/es',
        'x-default': '/',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessage(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
