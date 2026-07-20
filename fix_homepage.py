path = r'E:\一人公司\电子书格式转换站\ebook-converter\src\app\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'VideoTutorial' not in content and '热门转换教程' not in content:
    # Add import
    content = content.replace(
        "import { TestimonialsSection } from '@/components/tools/TestimonialsSection';",
        "import { TestimonialsSection } from '@/components/tools/TestimonialsSection';\nimport { VideoTutorial } from '@/components/tools/VideoTutorial';"
    )
    print('Added VideoTutorial import to homepage')
    
    # Add featured video section before testimonials
    testimonial_import = content.find('<TestimonialsSection')
    if testimonial_import > 0:
        before = content[:testimonial_import]
        after = content[testimonial_import:]
        
        video_section = '''        {/* Featured Video Tutorials */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">热门转换教程</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/convert/lit-to-epub" className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-900">LIT → EPUB</h3>
                <p className="text-sm text-gray-500 mt-1">3 分钟学会转换</p>
              </Link>
              <Link href="/convert/pdf-to-epub" className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-900">PDF → EPUB</h3>
                <p className="text-sm text-gray-500 mt-1">保留排版的秘诀</p>
              </Link>
              <Link href="/convert/epub-to-txt" className="group block rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="text-white text-4xl">▶</span>
                </div>
                <h3 className="font-semibold text-gray-900">EPUB → TXT</h3>
                <p className="text-sm text-gray-500 mt-1">提取纯文本内容</p>
              </Link>
            </div>
          </div>
        </section>

'''
        content = before + video_section + after
        print('Added featured video section to homepage')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Homepage updated')
else:
    print('Homepage already has video content')