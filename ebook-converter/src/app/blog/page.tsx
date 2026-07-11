import Link from "next/link"

const posts = [
  { title: "How to Convert EPUB to MOBI for Free", slug: "how-to-convert-epub-to-mobi", date: "2026-07-11" },
  { title: "Best Ebook Formats Explained: EPUB vs AZW3 vs PDF", slug: "ebook-formats-explained", date: "2026-07-10" },
  { title: "Why You Should Convert LIT to EPUB", slug: "why-convert-lit-to-epub", date: "2026-07-09" },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b pb-6">
            <Link href={`/blog/${post.slug}`} className="block hover:text-blue-600">
              <h2 className="text-xl font-semibold">{post.title}</h2>
            </Link>
            <p className="mt-2 text-sm text-gray-500">{post.date}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
