import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessage } from '@/i18n/utils'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}

export async function generateMetadata(): Promise<Metadata> {
  // Homepage hreflang. Every leaf page under [locale] sets its own `languages`,
  // so this applies only to the homepage route and does not leak to children.
  return {
    alternates: {
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
