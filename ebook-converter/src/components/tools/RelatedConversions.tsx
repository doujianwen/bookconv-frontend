import Link from "next/link"
import { KEYWORDS } from "@/lib/constants"
import { getConversion } from "@/lib/conversion-map"
import { getSlug } from "@/lib/utils"

// Only link to pairs that are actually supported (in CONVERSION_MAP).
// Excludes "planned" KEYWORDS pairs that would 404 (epub-to-zip, epub-to-lrf, …).
const SUPPORTED_KEYWORDS = KEYWORDS.filter((k) => getConversion(k.source, k.target))

interface RelatedConversionsProps {
  currentSource: string
  currentTarget: string
  max?: number
}

export function RelatedConversions({ currentSource, currentTarget, max = 6 }: RelatedConversionsProps) {
  const currentKey = `${currentSource}-${currentTarget}`

  const related = SUPPORTED_KEYWORDS
    .filter((k) => {
      const key = `${k.source}-${k.target}`
      if (key === currentKey) return false
      return k.source === currentSource || k.target === currentTarget
           || k.source === currentTarget || k.target === currentSource
    })
    .slice(0, max)

  if (related.length === 0) {
    const others = SUPPORTED_KEYWORDS
      .filter((k) => `${k.source}-${k.target}` !== currentKey)
      .slice(0, max)
    return <RelatedLinks keywords={others} />
  }

  return <RelatedLinks keywords={related} />
}

function RelatedLinks({ keywords }: { keywords: typeof KEYWORDS }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Other Useful Conversions</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {keywords.map((k) => {
          const slug = getSlug(k.source, k.target)
          return (
            <Link
              key={slug}
              href={`/convert/${slug}`}
              className="rounded-lg border bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600"
            >
              {k.source.toUpperCase()} to {k.target.toUpperCase()}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
