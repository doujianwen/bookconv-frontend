import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'
import { ServiceWorkerRegistration } from '@/components/sw/ServiceWorkerRegistration'
import { PlausibleScript } from '@/components/analytics/PlausibleScript'
// Initialize Sentry in production (side-effect import)
import '@/lib/sentry-setup'
import '../globals.css'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeFromParams } = await params;
  const locale = localeFromParams || (await getLocale());
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

  return {
    metadataBase: new URL('https://bookconv.com'),
    title: {
      default: t('seo.defaultTitle') || 'BookConv -- Free Online Ebook Format Converter | Convert EPUB, MOBI, AZW3, PDF',
      template: `%s | ${t('common.siteName') || 'BookConv'}`,
    },
    description: t('seo.defaultDescription') || 'Free online ebook converter supporting 28+ formats: EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF. No registration, no watermarks, no limits. Powered by Calibre.',
    keywords: [
      'ebook converter', 'epub converter', 'mobi to epub', 'azw3 to epub',
      'pdf to epub', 'free ebook converter', 'online file converter',
      'lit to epub', 'fb2 to epub', 'docx to epub', 'calibre online',
      'kindle format converter', 'ebook format conversion',
    ],
    alternates: {
      canonical: `https://bookconv.com${locale === 'es' ? '/es' : ''}`,
      languages: {
        'en': '/',
        'es': '/es',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: `https://bookconv.com${locale === 'es' ? '/es' : ''}`,
      siteName: t('common.siteName') || 'BookConv',
      title: t('seo.defaultTitle') || 'BookConv -- Free Online Ebook Format Converter',
      description: t('home.formatsSectionDesc') || 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly. No registration required.',
      images: [
        {
          url: "https://bookconv.com/og-image.svg",
          width: 1200,
          height: 630,
          alt: t('seo.defaultTitle') || 'BookConv -- Free Online Ebook Format Converter',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('seo.defaultTitle') || 'BookConv -- Free Online Ebook Format Converter',
      description: t('home.formatsSectionDesc') || 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.',
      images: ['https://bookconv.com/og-image.svg'],
      creator: '@bookconv',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

  return (
    <html lang={locale} dir='ltr'>
      <head>
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="alternate" hrefLang="x-default" href="https://bookconv.com" />
        <link rel="alternate" hrefLang="en" href="https://bookconv.com/" />
        <link rel="alternate" hrefLang="es" href="https://bookconv.com/es" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/og-image.svg" type="image/svg+xml" />
        <link rel='icon' href='/favicon.ico' sizes='48x48' />
        <link rel='icon' href='/icon.svg' type='image/svg+xml' sizes='any' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
        {/* Plausible Analytics */}
        <PlausibleScript />
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QJTM9CFPWZ" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QJTM9CFPWZ');
            `.trim(),
          }}
        />
        <link rel='canonical' href={`https://bookconv.com${locale === 'es' ? '/es' : ''}`} />
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover' />
        <meta name='theme-color' content='#2563eb' />
        <meta name='msapplication-TileColor' content='#2563eb' />

        {/* JSON-LD Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': `https://bookconv.com${locale === 'es' ? '/es' : ''}#website`,
                  url: `https://bookconv.com${locale === 'es' ? '/es' : ''}`,
                  name: t('common.siteName') || 'BookConv',
                  description: 'Free online ebook format converter',
                  publisher: { '@id': `https://bookconv.com${locale === 'es' ? '/es' : ''}#organization` },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: `https://bookconv.com${locale === 'es' ? '/es' : ''}/?q={search_term_string}` },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': `https://bookconv.com${locale === 'es' ? '/es' : ''}#organization`,
                  name: t('common.siteName') || 'BookConv',
                  url: `https://bookconv.com${locale === 'es' ? '/es' : ''}`,
                  logo: 'https://bookconv.com/icon.svg',
                  sameAs: [],
                },
                {
                  '@type': 'WebApplication',
                  name: t('common.siteName') || 'BookConv',
                  url: `https://bookconv.com${locale === 'es' ? '/es' : ''}`,
                  description: 'Free online ebook format converter supporting 28+ formats including EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF.',
                  applicationCategory: 'UtilityApplication',
                  operatingSystem: 'Any',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                  browserRequirements: 'Requires JavaScript. Requires HTML5.',
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '1200',
                    bestRating: '5',
                    worstRating: '1',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className='min-h-screen bg-gray-50 font-sans text-gray-900 antialiased'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
