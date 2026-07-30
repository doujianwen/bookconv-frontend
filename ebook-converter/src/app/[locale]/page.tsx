"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import {
  ArrowRight, Zap, Shield, Globe, Search,
  BookOpen, FileText, Image, Newspaper,
  Sparkles, ChevronRight, Star,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { KEYWORDS } from "@/lib/constants"
import { getSlug } from "@/lib/utils"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import { TestimonialsSection } from "@/components/tools/TestimonialsSection"
import { AnimatedCounter } from "@/components/tools/AnimatedCounter"
import { CONVERSION_COUNTER_TARGET } from "@/data/testimonials"

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  eBook: BookOpen,
  Document: FileText,
  Image: Image,
  Comic: Newspaper,
}

const CATEGORY_ORDER = ["eBook", "Document", "Image", "Comic"]

function getCategory(sourceFormat: string) {
  const ebookFormats = ["epub", "azw3", "mobi", "lit", "fb2"]
  const docFormats = ["doc", "docx", "rtf", "txt", "html", "word", "text"]
  const imageFormats = ["jpg", "png"]
  const comicFormats = ["cbr"]
  if (ebookFormats.includes(sourceFormat)) return "eBook"
  if (docFormats.includes(sourceFormat)) return "Document"
  if (imageFormats.includes(sourceFormat)) return "Image"
  if (comicFormats.includes(sourceFormat)) return "Comic"
  return "Other"
}

// Top converters for SEO internal linking
const TOP_CONVERTERS = [
  { label: "EPUB to MOBI", href: "/convert/epub-to-mobi" },
  { label: "PDF to EPUB", href: "/convert/pdf-to-epub" },
  { label: "AZW3 to EPUB", href: "/convert/azw3-to-epub" },
  { label: "MOBI to EPUB", href: "/convert/mobi-to-epub" },
  { label: "LIT to EPUB", href: "/convert/lit-to-epub" },
  { label: "EPUB to TXT", href: "/convert/epub-to-txt" },
  { label: "DOCX to EPUB", href: "/convert/docx-to-epub" },
  { label: "FB2 to EPUB", href: "/convert/fb2-to-epub" },
  { label: "EPUB to PDF", href: "/convert/epub-to-pdf" },
  { label: "TXT to EPUB", href: "/convert/txt-to-epub" },
]

export default function HomePage() {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredKeywords = useMemo(() => {
    let result = KEYWORDS
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (k) =>
          k.source.toLowerCase().includes(q) ||
          k.target.toLowerCase().includes(q) ||
          (FORMAT_DISPLAY_NAMES[k.source] || "").toLowerCase().includes(q) ||
          (FORMAT_DISPLAY_NAMES[k.target] || "").toLowerCase().includes(q)
      )
    }
    return result
  }, [searchQuery])

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof KEYWORDS> = {}
    filteredKeywords.forEach((k) => {
      const cat = getCategory(k.source)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(k)
    })
    return groups
  }, [filteredKeywords])

  const categories = ["All", ...CATEGORY_ORDER.filter((c) => groupedByCategory[c])]

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-yellow-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-blue-100 mb-6">
            <Sparkles className="h-4 w-4" />
            {t('home.poweredByCalibre')}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span dangerouslySetInnerHTML={{ __html: (t('home.heroTitle') || 'Free Online Ebook\nFormat Converter').replace('\n', '<br/>') }} />
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl" dangerouslySetInnerHTML={{ __html: (t('home.heroSubtitle') || 'Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.\nNo registration, no watermarks, no limits.').replace('\n', '<br/>') }} />

          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.searchConversions')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 bg-white py-3 pl-12 pr-4 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Converter Grid */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{t('common.allFormats')}</h2>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? t('common.allFormats') : t(`common.${cat.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          {categories.map((cat) => {
            if (selectedCategory !== 'All' && selectedCategory !== cat) return null;
            const keywords = groupedByCategory[cat];
            if (!keywords) return null;

            const Icon = CATEGORY_ICONS[cat] || BookOpen;
            return (
              <div key={cat} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t(`common.${cat.toLowerCase()}`)}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {keywords.map((kw) => (
                    <Link
                      key={`${kw.source}-${kw.target}`}
                      href={`/convert/${getSlug(kw.source, kw.target)}`}
                      className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600">
                          {FORMAT_DISPLAY_NAMES[kw.source]} → {FORMAT_DISPLAY_NAMES[kw.target]}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">{t('common.freeOnlineEbookConverter')}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: 'Fast Conversion', desc: 'Powered by Calibre engine for lightning-fast conversions.' },
              { icon: Shield, title: 'Secure & Private', desc: 'Files are encrypted and auto-deleted within 1 hour.' },
              { icon: Globe, title: 'No Limits', desc: 'Convert as many files as you want — no registration needed.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Social Proof & Testimonials */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              <AnimatedCounter target={CONVERSION_COUNTER_TARGET} />
            </span>
            <span>ebooks converted — and counting</span>
          </div>
          <p className="text-sm text-gray-600">Join thousands of satisfied users who trust BookConv for their ebook conversion needs.</p>
        </div>
      </section>

              {/* Featured Video Tutorials */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{t('home.tutorialTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/lit-to-epub" className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-900">LIT → EPUB</h3>
                <p className="text-sm text-gray-500 mt-1">{t('home.tutorialLitDesc')}</p>
              </Link>
              <Link href="/pdf-to-epub" className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-900">PDF → EPUB</h3>
                <p className="text-sm text-gray-500 mt-1">{t('home.tutorialPdfDesc')}</p>
              </Link>
              <Link href="/epub-to-txt" className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-900">EPUB → TXT</h3>
                <p className="text-sm text-gray-500 mt-1">{t('home.tutorialEpubDesc')}</p>
              </Link>
            </div>
          </div>
        </section>

<TestimonialsSection />
      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('home.ctaReadyTitle')}</h2>
          <p className="mt-4 text-lg text-blue-100">{t('home.ctaReadyDesc')}</p>
          <Link href="/epub-to-mobi" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-lg transition-colors hover:bg-blue-50">
            {t('common.startConvertingNow')} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Homepage FAQ for Rich Snippets */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{t('home.faqTitle')}</h2>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "author": { "@type": "Organization", "name": "BookConv" },
                "datePublished": "2026-01-01T00:00:00+00:00",
                "url": "https://bookconv.com",
                "mainEntity": [
                  { "@type": "Question", "name": t('faq.q1'), "answerCount": 1, "acceptedAnswer": { "@type": "Answer", "text": t('faq.a1') } },
                  { "@type": "Question", "name": t('faq.q2'), "answerCount": 1, "acceptedAnswer": { "@type": "Answer", "text": t('faq.a2') } },
                  { "@type": "Question", "name": t('faq.q3'), "answerCount": 1, "acceptedAnswer": { "@type": "Answer", "text": t('faq.a3') } },
                  { "@type": "Question", "name": t('faq.q4'), "answerCount": 1, "acceptedAnswer": { "@type": "Answer", "text": t('faq.a4') } },
                  { "@type": "Question", "name": t('faq.q5'), "answerCount": 1, "acceptedAnswer": { "@type": "Answer", "text": t('faq.a5') } },
                ],
              }),
            }}
          />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <details key={i} className="rounded-xl border bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{t(`faq.q${i}`)}</summary>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(`faq.a${i}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Footer */}
      <section className="border-t bg-white py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-xl font-bold text-gray-900">{t('home.supportedFormatsTitle')}</h2>
          <p className="mb-6 text-sm text-gray-600">{t('home.supportedFormatsDesc')}</p>
          <div className="flex flex-wrap gap-2">
            {["EPUB", "MOBI", "AZW3", "PDF", "DOCX", "TXT", "RTF", "HTML", "FB2", "LIT", "CBR", "DJVU", "JPG", "PNG", "Word"].map((fmt) => (
              <span key={fmt} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{fmt}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
