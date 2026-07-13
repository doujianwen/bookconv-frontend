import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import LoginButton from '@/components/auth/LoginButton'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://bookconv.com'),
  title: {
    default: 'BookConv — Free Online Ebook Format Converter | Convert EPUB, MOBI, AZW3, PDF',
    template: '%s | BookConv',
  },
  description: 'Free online ebook converter supporting 28+ formats: EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF. No registration, no watermarks, no limits. Powered by Calibre.',
  keywords: [
    'ebook converter', 'epub converter', 'mobi to epub', 'azw3 to epub',
    'pdf to epub', 'free ebook converter', 'online file converter',
    'lit to epub', 'fb2 to epub', 'docx to epub', 'calibre online',
    'kindle format converter', 'ebook format conversion',
  ],
  authors: [{ name: 'BookConv' }],
  creator: 'BookConv',
  publisher: 'BookConv',
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookconv.com',
    siteName: 'BookConv',
    title: 'BookConv — Free Online Ebook Format Converter',
    description: 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly. No registration required.',
    images: [
      {
        url: 'https://bookconv.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'BookConv — Free Online Ebook Format Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookConv — Free Online Ebook Format Converter',
    description: 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.',
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
  verification: {
    // Add your Google Search Console / Bing verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' dir='ltr'>
      <head>
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="alternate" hrefLang="x-default" href="https://bookconv.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/og-image.svg" type="image/svg+xml" />
        <link rel='icon' href='/favicon.ico' sizes='48x48' />
        <link rel='icon' href='/icon.svg' type='image/svg+xml' sizes='any' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
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
                  '@id': 'https://bookconv.com/#website',
                  url: 'https://bookconv.com',
                  name: 'BookConv',
                  description: 'Free online ebook format converter',
                  publisher: { '@id': 'https://bookconv.com/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: 'https://bookconv.com/?q={search_term_string}' },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://bookconv.com/#organization',
                  name: 'BookConv',
                  url: 'https://bookconv.com',
                  logo: 'https://bookconv.com/icon.svg',
                  sameAs: [],
                },
                {
                  '@type': 'WebApplication',
                  name: 'BookConv',
                  url: 'https://bookconv.com',
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
        <a href='#main-content' className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white'>
          Skip to main content
        </a>
        <header className='border-b bg-white' role='banner'>
          <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'>
            <Link href='/' className='flex items-center gap-2 font-bold text-blue-600' aria-label='BookConv Home'>
              <BookOpen className='h-6 w-6' />
              <span>BookConv</span>
            </Link>
            <nav aria-label='Primary navigation' className='flex items-center gap-4 text-sm text-gray-600'>
              <Link href='/' className='hover:text-blue-600'>Home</Link>
              <Link href='/pricing' className='hover:text-blue-600'>Pricing</Link>
              <Link href='/blog' className='hover:text-blue-600'>Blog</Link>
              <LoginButton />
            </nav>
          </div>
        </header>
        <main id='main-content' role='main'>
          {children}
        </main>
        <footer className='mt-16 border-t bg-white py-8 text-center text-sm text-gray-500' role='contentinfo'>
          <div className='mx-auto max-w-5xl space-y-2 px-4'>
            <p>BookConv — Free online ebook converter. All files are automatically deleted within 1 hour.</p>
            <nav aria-label='Footer navigation' className='flex justify-center gap-4'>
              <Link href='/privacy' className='hover:text-gray-700'>Privacy Policy</Link>
              <Link href='/terms' className='hover:text-gray-700'>Terms of Service</Link>
            </nav>
            <p className='text-xs text-gray-400'>© {new Date().getFullYear()} BookConv. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
