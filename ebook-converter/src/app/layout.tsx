import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import LoginButton from '@/components/auth/LoginButton'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessage, resolvePath } from '@/i18n/utils'
import { clampMetaDescription } from '@/lib/seo/meta-description'
import './globals.css'
import Script from 'next/script'
import { ServiceWorkerRegistration } from '@/components/sw/ServiceWorkerRegistration'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = await getMessage(locale);
  const t = (key: string) => resolvePath(messages, key) || key;

  return {
    metadataBase: new URL('https://www.bookconv.com'),
    title: {
      default: t('seo.defaultTitle') || 'BookConv — Free Online Ebook Format Converter | Convert EPUB, MOBI, AZW3, PDF',
      template: `%s | ${t('common.siteName') || 'BookConv'}`,
    },
    description: clampMetaDescription(t('seo.defaultDescription') || 'Free online ebook converter supporting 28+ formats: EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF. No registration, no watermarks, free for personal use. Powered by Calibre.'),
    keywords: [
      'ebook converter', 'epub converter', 'mobi to epub', 'azw3 to epub',
      'pdf to epub', 'free ebook converter', 'online file converter',
      'lit to epub', 'fb2 to epub', 'docx to epub', 'calibre online',
      'kindle format converter', 'ebook format conversion',
    ],
    alternates: {
      canonical: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}`,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}`,
      siteName: t('common.siteName') || 'BookConv',
      title: t('seo.defaultTitle') || 'BookConv — Free Online Ebook Format Converter',
      description: t('home.formatsSectionDesc') || 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly. No registration required.',
      images: [
        {
          url: "https://www.bookconv.com/og-image.svg",
          width: 1200,
          height: 630,
          alt: t('seo.defaultTitle') || 'BookConv — Free Online Ebook Format Converter',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('seo.defaultTitle') || 'BookConv — Free Online Ebook Format Converter',
      description: t('home.formatsSectionDesc') || 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.',
      images: ['https://www.bookconv.com/og-image.svg'],
      creator: '@GinoTou2024',
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
        {/* Preconnect to external domains to reduce connection latency */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.reddit.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="preload" as="image" href="/og-image.svg" type="image/svg+xml" />
        <link rel='icon' href='/favicon.ico' sizes='48x48' />
        <link rel='icon' href='/icon.svg' type="image/svg+xml" sizes='any' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        {/* Google Analytics 4 — lazyOnload to avoid blocking first paint / LCP */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QJTM9CFPWZ"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QJTM9CFPWZ');
          `}
        </Script>
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
                  '@id': `https://www.bookconv.com${locale === 'es' ? '/es' : ''}#website`,
                  url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}`,
                  name: t('common.siteName') || 'BookConv',
                  description: 'Free online ebook format converter',
                  inLanguage: ['en', 'es'],
                  publisher: { '@id': `https://www.bookconv.com${locale === 'es' ? '/es' : ''}#organization` },
                },
                {
                  '@type': 'Organization',
                  '@id': `https://www.bookconv.com${locale === 'es' ? '/es' : ''}#organization`,
                  name: t('common.siteName') || 'BookConv',
                  url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}`,
                  logo: 'https://www.bookconv.com/icon.svg',
                  sameAs: [
                    'https://www.reddit.com/r/ebooks/comments/1v8ypvd/',
                    'https://x.com/GinoTou2024',
                  ],
                  areaServed: 'Worldwide',
                  availableLanguage: ['en', 'es'],
                },
                {
                  '@type': 'SoftwareApplication',
                  name: t('common.siteName') || 'BookConv',
                  url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}`,
                  description: 'Free online ebook format converter supporting 28+ formats including EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF.',
                  applicationCategory: 'UtilityApplication',
                  operatingSystem: 'Any',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                  browserRequirements: 'Requires JavaScript. Requires HTML5.',
                },
              ],
            }),
          }}
        />
      </head>
      <body className='min-h-screen bg-gray-50 font-sans text-gray-900 antialiased'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href='#main-content' className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white'>
            {t('common.skipToMainContent') || 'Skip to main content'}
          </a>
          <header className='border-b bg-white' role='banner'>
            <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'>
              {/* M5-6（2026-10-22）：/es 索引页与静态页（/es/convert、/es/blog、/es/guide、
                  /es/pricing 等）不在 middleware P3-C 白名单（只放行白名单 slug 详情页）⇒ 裸 /es 前缀会 404。
                  西语会话下头部/页脚导航一律回退英文路由（白名单外回退，与 es-routes.ts 同纪律）；
                  locale='en' 时行为与链接逐字不变。 */}
              <Link href='/' className='flex items-center gap-2 font-bold text-blue-600' aria-label={`${t('common.siteName') || 'BookConv'} Home`}>
                <BookOpen className='h-6 w-6' />
                <span>{t('common.siteName') || 'BookConv'}</span>
              </Link>
              <nav aria-label={locale === 'es' ? 'Navegación principal' : 'Primary navigation'} className='flex items-center gap-3 text-sm text-gray-600'>
                <Link href='/' className='hover:text-blue-600'>{t('common.home') || 'Home'}</Link>
                <Link href='/convert' className='hover:text-blue-600'>{t('common.convert') || 'Convert'}</Link>
                <Link href='/blog' className='hover:text-blue-600'>{t('common.blog') || 'Blog'}</Link>
                <Link href='/guide' className='hover:text-blue-600'>{t('common.guide') || 'Guides'}</Link>
                <Link href='/pricing' className='hover:text-blue-600'>{t('common.pricing') || 'Pricing'}</Link>
                <Link href='/help' className='hover:text-blue-600'>{t('common.help') || 'Help'}</Link>
                <Link href='/about' className='hover:text-blue-600'>{t('common.about') || 'About'}</Link>
                <Link href='/founder' className='hover:text-blue-600'>{t('common.founder') || 'Founder'}</Link>
                <LocaleSwitcher />
                <LoginButton />
              </nav>
            </div>
          </header>
          <main id='main-content' role='main'>
            {children}
          </main>
          <footer className='mt-16 border-t bg-white py-8 text-center text-sm text-gray-500' role='contentinfo'>
            <div className='mx-auto max-w-5xl space-y-2 px-4'>
              <p>{t('common.siteName') || 'BookConv'} — {t('home.formatsSectionDesc') || 'Free online ebook converter. All files are deleted as soon as the conversion completes.'}</p>
              <nav aria-label={locale === 'es' ? 'Navegación del pie de página' : 'Footer navigation'} className='flex flex-wrap justify-center gap-4'>
                <Link href='/convert' className='hover:text-gray-700'>{t('common.convert') || 'Convert'}</Link>
                <Link href='/blog' className='hover:text-gray-700'>{t('common.blog') || 'Blog'}</Link>
                <Link href='/guide' className='hover:text-gray-700'>{t('common.guide') || 'Guides'}</Link>
                <Link href='/privacy' className='hover:text-gray-700'>{t('common.privacyPolicy') || 'Privacy Policy'}</Link>
                <Link href='/help' className='hover:text-gray-700'>{t('common.help') || 'Help'}</Link>
                <Link href='/terms' className='hover:text-gray-700'>{t('common.termsOfService') || 'Terms of Service'}</Link>
              </nav>
              <div className='flex flex-wrap justify-center gap-4 text-xs'>
                <a href='mailto:hello@bookconv.com' className='flex items-center gap-1 text-gray-500 hover:text-gray-700' aria-label={t('common.contact') || 'Contact'}>
                  <span>{t('common.contact') || 'Contact'}: hello@bookconv.com</span>
                </a>
                <a href='https://x.com/GinoTou2024' target='_blank' rel='noopener noreferrer' className='flex items-center gap-1 text-gray-500 hover:text-gray-700' aria-label='X (Twitter)'>
                  <span aria-hidden='true'>𝕏</span>
                  <span>@GinoTou2024</span>
                </a>
              </div>
              <p className='text-xs text-gray-500'>{new Date().getFullYear()} {t('common.siteName') || 'BookConv'}. {t('common.allRightsReserved') || 'All rights reserved.'}</p>
            </div>
          </footer>
        </NextIntlClientProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

