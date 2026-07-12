import type { Metadata } from "next"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import LoginButton from "@/components/auth/LoginButton"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"),
  title: {
    default: "Free Online Ebook Format Converter | Convert EPUB, MOBI, AZW3, PDF",
    template: "%s | Free Ebook Converter",
  },
  description: "Free online ebook converter supporting 17+ formats: EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF. No registration, no watermarks, no limits. Convert ebooks instantly with our Calibre-powered engine.",
  keywords: ["ebook converter", "epub to mobi", "pdf to epub", "azw3 converter", "free ebook conversion", "online file converter"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    siteName: "EbookConverter",
    title: "Free Online Ebook Format Converter",
    description: "Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly. No registration required.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Ebook Converter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Ebook Format Converter",
    description: "Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EbookConverter",
              url: "https://your-domain.com",
              description: "Free online ebook format converter supporting 17+ formats",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://your-domain.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "EbookConverter",
              url: "https://your-domain.com",
              logo: "https://your-domain.com/icon.svg",
              sameAs: [],
            }),
          }}
        />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-blue-600">
              <BookOpen className="h-6 w-6" />
              <span>EbookConverter</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <Link href="/pricing" className="hover:text-blue-600">Pricing</Link>
              <Link href="/blog" className="hover:text-blue-600">Blog</Link>
              <LoginButton />
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t bg-white py-8 text-center text-sm text-gray-500">
          <div className="mx-auto max-w-5xl space-y-2 px-4">
            <p>Free online ebook converter. All files are automatically deleted within 1 hour.</p>
            <div className="flex justify-center gap-4">
              <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
