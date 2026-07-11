import { KEYWORDS } from "@/lib/constants"
import { getSlug } from "@/lib/utils"

const baseUrl = "https://your-domain.com"

export default function sitemap() {
  const pages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    ...KEYWORDS.map((k) => ({
      url: `${baseUrl}/convert/${getSlug(k.source, k.target)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
  return pages
}