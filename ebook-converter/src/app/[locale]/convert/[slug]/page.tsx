import type { Metadata } from "next"
import { KEYWORDS } from "@/lib/constants"
import { getConversion } from "@/lib/conversion-map"
import { getDisplayName, getSlug } from "@/lib/utils"
// Step 3: Dynamic import for heavy client component — reduces initial bundle
import dynamic from "next/dynamic"
import { CONTENT_MAP } from "@/data/content"
import { generateFAQSchema, generateBreadcrumbSchema, generateConversionPageSchema } from "@/lib/seo/schema"
import { getRelatedBlogPostsForConversion } from "@/lib/internal-links"

// Lazy-load ToolPageClient with SSR disabled (it is fully client-side)

const ToolPageClientDynamic = dynamic(
  () => import("./ToolPageClient").then((mod) => ({ default: mod.ToolPageClient })),
  { loading: () => <div className="flex min-h-[50vh] items-center justify-center"><p className="text-gray-500">Loading converter…</p></div> },
)

interface ToolPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  return KEYWORDS.map((k) => ({
    slug: k.source + "-to-" + k.target
  }))
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { slug } = await params
  const displayName = getDisplayName(slug)
  const [source, target] = slug.split("-to-")
  const conversion = getConversion(source, target)
  const contentData = CONTENT_MAP[slug]

  const title = contentData?.title || `${source} to ${target} Converter -- Free Online`
  const subtitle = contentData?.content?.hero?.subtitle || `Free online ${getDisplayName(source)} to ${getDisplayName(target)} converter. No registration, no watermarks.`
  const description = subtitle

  return {
    title,
    description,
    keywords: [
      source.toLowerCase(), target.toLowerCase(),
      `${source} to ${target}`,
      `${source} to ${target} converter`,
      `convert ${source} to ${target}`,
      `free ${source} to ${target} online`,
      `online ${source} to ${target} converter`,
      "ebook converter", "calibre", "free",
    ],
    alternates: {
      canonical: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}/convert/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.bookconv.com${locale === 'es' ? '/es' : ''}/convert/${slug}`,
      siteName: "BookConv",
      images: [
        {
          url: `https://www.bookconv.com/og-image.svg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://www.bookconv.com/og-image.svg`],
    },
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params
  const [source, target] = slug.split("-to-")
  const keyword = KEYWORDS.find(
    (k) =>
      k.source.toLowerCase() === source.toLowerCase() &&
      k.target.toLowerCase() === target.toLowerCase()
  )
  const conversion = getConversion(source, target)
  const contentData = CONTENT_MAP[slug]

  if (!keyword || !conversion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Conversion not supported</h1>
          <p className="mt-2 text-gray-500">Please check our homepage for supported formats.</p>
        </div>
      </div>
    )
  }

  // Use dynamically imported component
  const relatedBlogPosts = getRelatedBlogPostsForConversion(source, target)
  const jsonLd = generateConversionPageSchema(source, target, contentData)
  return (
    <>
      {/* Server-rendered structured data so crawlers / AI engines read it in
          the initial HTML. The client-only ToolPageClient cannot emit JSON-LD
          during SSR. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ToolPageClientDynamic
        source={source}
        target={target}
        keyword={keyword}
        tool={conversion.tool}
        description={conversion.description}
        contentData={contentData}
        relatedBlogPosts={relatedBlogPosts}
      />
    </>
  )
}