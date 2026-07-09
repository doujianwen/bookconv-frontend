import type { Metadata } from "next"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Ebook Converter — Free Online E-book Format Conversion",
    template: "%s | Ebook Converter",
  },
  description:
    "Free online ebook converter supporting EPUB, MOBI, AZW3, PDF, and more. No registration required. Convert ebooks instantly.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
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