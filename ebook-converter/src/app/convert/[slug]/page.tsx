import type { Metadata } from "next"
import { KEYWORDS } from "@/lib/constants"
import { getConversion } from "@/lib/conversion-map"
import { getDisplayName } from "@/lib/utils"
import { ToolPageClient } from "./ToolPageClient"

interface ToolPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return KEYWORDS.map((k) => ({
    slug: `${k.source.toLowerCase()}-to-${k.target.toLowerCase()}`,
  }))
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params
  const displayName = getDisplayName(slug)
  const [source, target] = slug.split("-to-")
  const conversion = getConversion(source, target)

  return {
    title: `${displayName} Converter — Free Online Tool`,
    description: `Free online ${displayName} converter. No registration, no watermarks. Convert ${source.toUpperCase()} files to ${target.toUpperCase()} instantly. Supports batch conversion with Pro.`,
    openGraph: {
      title: `${displayName} Converter — Free Online`,
      description: `Convert ${source.toUpperCase()} to ${target.toUpperCase()} online for free. Fast, secure, no registration required.`,
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
      tool={conversion.tool} description={conversion.description}
    />
  )
}