import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { KEYWORDS } from '@/lib/constants'

interface BlogPostProps {
  params: Promise<{ slug: string }>
}

const blogPosts: Record<string, { title: string; date: string; content: React.ReactNode }> = {
  'how-to-convert-epub-to-mobi': {
    title: 'How to Convert EPUB to MOBI for Free',
    date: '2026-07-11',
    content: (
      <>
        <p className='mb-4'>Looking for a free way to convert EPUB to MOBI? You&apos;ve come to the right place!</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>Why Convert EPUB to MOBI?</h2>
        <p className='mb-4'>MOBI format is widely supported by Kindle devices and apps. While EPUB is the modern standard, many Kindle users still need MOBI files for their older devices.</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>Our Free Converter</h2>
        <p className='mb-4'>Our online converter uses Calibre engine to ensure high-quality conversions. No registration required, no watermarks, completely free.</p>
        
        <div className='bg-blue-50 p-4 rounded-lg my-4'>
          <Link href='/convert/epub-to-mobi' className='text-blue-600 hover:text-blue-800 font-medium'>
            Try our EPUB to MOBI converter now
          </Link>
        </div>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>Tips for Best Results</h2>
        <ul className='list-disc pl-6 mb-4 space-y-2'>
          <li>Ensure your EPUB file is not DRM-protected</li>
          <li>Check that images are properly embedded</li>
          <li>Test the converted MOBI file on your device</li>
        </ul>
      </>
    ),
  },
  'ebook-formats-explained': {
    title: 'Best Ebook Formats Explained: EPUB vs AZW3 vs PDF',
    date: '2026-07-10',
    content: (
      <>
        <p className='mb-4'>Confused about ebook formats? Let us break down the most popular formats: EPUB, AZW3, and PDF.</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>EPUB: The Universal Standard</h2>
        <p className='mb-4'>EPUB is an open standard supported by most e-readers except Kindle. It offers reflowable text and excellent compatibility.</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>AZW3: Kindle&apos;s Modern Format</h2>
        <p className='mb-4'>AZW3 (Kindle Format 8) is Amazon&apos;s proprietary format supporting advanced features like tables and complex layouts.</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>PDF: Fixed Layout</h2>
        <p className='mb-4'>PDF maintains exact formatting but doesn&apos;t reflow text, making it less ideal for small screens.</p>
        
        <div className='bg-blue-50 p-4 rounded-lg my-4'>
          <Link href='/convert/epub-to-azw3' className='text-blue-600 hover:text-blue-800 font-medium mr-4'>
            EPUB to AZW3
          </Link>
          <Link href='/convert/azw3-to-epub' className='text-blue-600 hover:text-blue-800 font-medium'>
            AZW3 to EPUB
          </Link>
        </div>
      </>
    ),
  },
  'why-convert-lit-to-epub': {
    title: 'Why You Should Convert LIT to EPUB',
    date: '2026-07-09',
    content: (
      <>
        <p className='mb-4'>LIT files are legacy MS Reader format files. If you have old LIT ebooks, converting them to EPUB will give you better compatibility and features.</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>What is LIT Format?</h2>
        <p className='mb-4'>LIT was Microsoft&apos;s ebook format for MS Reader, now discontinued. These files can&apos;t be read on most modern devices.</p>
        
        <h2 className='text-2xl font-bold mt-6 mb-3'>Benefits of Converting to EPUB</h2>
        <ul className='list-disc pl-6 mb-4 space-y-2'>
          <li>Universal compatibility across devices</li>
          <li>Reflowable text for better reading experience</li>
          <li>Support for bookmarks, highlights, and notes</li>
          <li>Smaller file sizes with compression</li>
        </ul>
        
        <div className='bg-blue-50 p-4 rounded-lg my-4'>
          <Link href='/convert/lit-to-epub' className='text-blue-600 hover:text-blue-800 font-medium'>
            Convert LIT to EPUB now
          </Link>
        </div>
      </>
    ),
  },
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }))
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    return (
      <main className='mx-auto max-w-3xl px-4 py-16'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Post Not Found</h1>
          <Link href='/blog' className='text-blue-600 hover:text-blue-800 inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' /> Back to Blog
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <Link href='/blog' className='mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600'>
        <ArrowLeft className='h-4 w-4' /> Back to Blog
      </Link>

      <article>
        <header className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-3'>{post.title}</h1>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <Calendar className='h-4 w-4' />
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </div>
        </header>

        <div className='prose max-w-none'>
          {post.content}
        </div>

        <div className='mt-12 pt-8 border-t'>
          <h2 className='text-xl font-semibold mb-4'>Related Conversions</h2>
          <div className='grid gap-3 sm:grid-cols-2'>
            {KEYWORDS.slice(0, 6).map((k) => (
              <Link
                key={k.source + '-' + k.target}
                href={'/convert/' + k.source.toLowerCase() + '-to-' + k.target.toLowerCase()}
                className='rounded-lg border bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600'
              >
                {k.source.toUpperCase() + ' to ' + k.target.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}