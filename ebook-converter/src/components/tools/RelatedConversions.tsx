import Link from "next/link"
import { KEYWORDS } from "@/lib/constants"
import { getConversion } from "@/lib/conversion-map"
import { getSlug } from "@/lib/utils"
import { chrome } from "@/lib/ui-chrome"

// Only link to pairs that are actually supported (present in CONVERSION_MAP
// via getConversion). Pairs absent from CONVERSION_MAP (e.g. epub-to-lrf,
// epub-to-odt) return undefined here and are excluded — they would 404.
// Note: epub-to-zip IS in CONVERSION_MAP (passthrough), so it is included.
const SUPPORTED_KEYWORDS = KEYWORDS.filter((k) => getConversion(k.source, k.target))

interface RelatedConversionsProps {
  currentSource: string
  currentTarget: string
  max?: number
  /** M5-6：西语页 chrome 本地化开关 */
  isEs?: boolean
}

export function RelatedConversions({ currentSource, currentTarget, max = 6, isEs = false }: RelatedConversionsProps) {
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
    return <RelatedLinks keywords={others} isEs={isEs} />
  }

  return <RelatedLinks keywords={related} isEs={isEs} />
}

function RelatedLinks({ keywords, isEs }: { keywords: typeof KEYWORDS; isEs: boolean }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{chrome('otherUsefulConversions', isEs)}</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {keywords.map((k) => {
          const slug = getSlug(k.source, k.target)
          return (
            <Link
              key={slug}
              href={`/convert/${slug}`}
              className="rounded-lg border bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600"
            >
              {isEs ? `${k.source.toUpperCase()} a ${k.target.toUpperCase()}` : `${k.source.toUpperCase()} to ${k.target.toUpperCase()}`}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
