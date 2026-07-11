"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import {
  ArrowRight, Zap, Shield, Globe, Search,
  BookOpen, FileText, Image, Newspaper,
  Sparkles, ChevronRight, Star
} from "lucide-react"
import { KEYWORDS } from "@/lib/constants"
import { getSlug } from "@/lib/utils"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"

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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const p0Keywords = KEYWORDS.filter((k) => k.phase === "P0")

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
            Powered by Calibre Engine
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Free Online Ebook
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Format Converter
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Convert EPUB, MOBI, AZW3, PDF, DOCX and more instantly.
            No registration, no watermarks, no limits.
          </p>

          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversions... (e.g., EPUB to MOBI)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-200 transition-all focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
              />
            </div>
          </div>

          {!searchQuery && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["EPUB to MOBI", "PDF to EPUB", "AZW3 to EPUB", "EPUB to TXT"].map((quick) => {
                const parts = quick.toLowerCase().split(" to ")
                const slug = parts[0] + "-to-" + parts[1]
                return (
                  <Link
                    key={quick}
                    href={`/convert/${slug}`}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    {quick}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-6 shadow-sm">
        <div className="mx-auto flex max-w-5xl justify-around px-4 text-center">
          <div><div className="text-2xl font-bold text-gray-900">{KEYWORDS.length}</div><div className="text-sm text-gray-500">Conversion Types</div></div>
          <div><div className="text-2xl font-bold text-gray-900">17</div><div className="text-sm text-gray-500">Supported Formats</div></div>
          <div><div className="text-2xl font-bold text-gray-900">100%</div><div className="text-sm text-gray-500">Free Forever</div></div>
          <div><div className="text-2xl font-bold text-gray-900">&lt;10s</div><div className="text-sm text-gray-500">Avg. Speed</div></div>
        </div>
      </section>

      {/* Popular Conversions (P0) */}
      {!searchQuery && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Most Popular Conversions</h2>
            <Link href="#all" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p0Keywords.slice(0, 9).map((k) => {
              const slug = getSlug(k.source, k.target)
              const s = FORMAT_DISPLAY_NAMES[k.source] || k.source.toUpperCase()
              const t = FORMAT_DISPLAY_NAMES[k.target] || k.target.toUpperCase()
              return (
                <Link key={slug} href={`/convert/${slug}`} className="group flex items-center justify-between rounded-xl border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{s} <span className="text-gray-400">→</span> {t}</div>
                      {k.traffic && <div className="text-xs text-gray-500">{k.traffic.toLocaleString()} monthly searches</div>}
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">KD {k.kd}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* All Conversions with Category Filter */}
      <section id="all" className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">All Supported Conversions</h2>
        {!searchQuery && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {CATEGORY_ORDER.map((cat) => {
              const count = filteredKeywords.filter((k) => getCategory(k.source) === cat).length
              if (count === 0) return null
              const Icon = CATEGORY_ICONS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}{cat} ({count})
                </button>
              )
            })}
          </div>
        )}
        {Object.keys(groupedByCategory).length > 0 ? (
          Object.entries(groupedByCategory).map(([category, keywords]) => {
            if (selectedCategory !== "All" && selectedCategory !== category) return null
            const Icon = CATEGORY_ICONS[category] || BookOpen
            return (
              <div key={category} className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                  {Icon && <Icon className="h-5 w-5 text-blue-600" />}
                  <h3 className="text-lg font-semibold text-gray-900">{category} Formats</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {keywords.map((k) => {
                    const slug = getSlug(k.source, k.target)
                    const s = FORMAT_DISPLAY_NAMES[k.source] || k.source.toUpperCase()
                    const t = FORMAT_DISPLAY_NAMES[k.target] || k.target.toUpperCase()
                    return (
                      <Link key={slug} href={`/convert/${slug}`} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm">
                        <span className="font-medium text-gray-700">{s} <span className="text-gray-400">→</span> {t}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          k.phase === "P0"
                            ? "bg-green-100 text-green-700"
                            : k.phase === "P1" || k.phase === "P2"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                        }`}>{k.phase}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No conversions match "{searchQuery}"</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">Why Choose Our Converter?</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {icon:Zap,title:"Lightning Fast",desc:"Powered by Calibre&apos;s battle-tested engine. Most conversions complete in under 10 seconds."},
              {icon:Shield,title:"Privacy First",desc:"Files are encrypted in transit and automatically deleted within 1 hour."},
              {icon:Globe,title:"No Registration",desc:"Start converting immediately. No account, no email, no hassle."}
            ].map(({icon:Icon,title,desc}) => (
              <div key={title} className="rounded-xl border bg-white p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Trusted by Readers Worldwide</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {name:"Sarah K.",text:"Finally a converter that actually works! Converted my entire Kindle library to EPUB in minutes."},
            {name:"Mike T.",text:"I use this daily for my audiobook production. The batch conversion feature is a game changer."},
            {name:"Lisa R.",text:"No sign-up, no watermarks, just pure conversion power."}
          ].map(({name,text}) => (
            <div key={name} className="rounded-xl border bg-white p-6">
              <div className="flex gap-0.5">
                {Array.from({length:5}).map((_,i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">&ldquo;{text}&rdquo;</p>
              <p className="mt-3 font-medium text-sm text-gray-900">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to Convert Your Ebooks?</h2>
          <p className="mt-4 text-lg text-blue-100">Join thousands of readers who trust our free converter.</p>
          <Link href="/convert/epub-to-mobi" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-lg transition-colors hover:bg-blue-50">
            Start Converting Now <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  )
}