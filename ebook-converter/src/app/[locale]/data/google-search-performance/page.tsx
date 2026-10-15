import type { Metadata } from "next"
import { getLocale } from "@/i18n/utils"
import { buildAlternates } from "@/lib/seo/alternates"
import { clampMetaDescription } from "@/lib/seo/meta-description"
import { getDataPage } from "@/data/data-pages"
import type { DataPageSpec } from "@/data/data-pages"
import { DataPageView } from "@/components/data-page-view"

function getSpec(): DataPageSpec {
  const s = getDataPage("google-search-performance")
  if (!s) throw new Error("data-page spec missing: google-search-performance")
  return s
}
const SPEC = getSpec()

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { canonical, languages } = buildAlternates({
    locale,
    slugPath: "/data/google-search-performance",
    pageType: "leaf",
  })
  return {
    title: SPEC.title,
    description: clampMetaDescription(SPEC.metaDescription),
    alternates: { canonical, languages },
    openGraph: {
      title: SPEC.title,
      description: SPEC.metaDescription,
      type: "article",
      url: canonical,
      siteName: "BookConv",
    },
  }
}

export default function GoogleSearchPerformanceDataPage() {
  return <DataPageView spec={SPEC} />
}
