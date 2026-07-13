import type { Metadata } from "next"
import { KEYWORDS } from "@/lib/constants"
import { getConversion } from "@/lib/conversion-map"
import { getDisplayName } from "@/lib/utils"
import { ToolPageClient } from "./ToolPageClient"
import { CONTENT_MAP } from "@/data/content"

interface ToolPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return KEYWORDS.map((k) => ({
    slug: k.source + "-to-" + k.target,
  }))
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params
  const displayName = getDisplayName(slug)
  const [source, target] = slug.split("-to-")
  const conversion = getConversion(source, target)
  const contentData = CONTENT_MAP[slug]

  const title = contentData?.title || `${source} to ${target} Converter — Free Online`
  const subtitle = contentData?.content?.hero?.subtitle || `Free online ${getDisplayName(source)} to ${getDisplayName(target)} converter. No registration, no watermarks.`

  return {
    title,
    description: subtitle,
    openGraph: {
      title,
      description: subtitle,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: subtitle,
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

  return (
    <ToolPageClient
      source={source}
      target={target}
      keyword={keyword}
      tool={conversion.tool}
      description={conversion.description}
      contentData={contentData}
    />
  )
}
