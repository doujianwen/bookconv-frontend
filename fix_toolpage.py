import re

path = r'E:\一人公司\电子书格式转换站\ebook-converter\src\app\convert\[slug]\ToolPageClient.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add VideoTutorial import
if 'VideoTutorial' not in content:
    content = content.replace(
        "import { RelatedConversions } from '@/components/tools/RelatedConversions';",
        "import { RelatedConversions } from '@/components/tools/RelatedConversions';\nimport { VideoTutorial } from '@/components/tools/VideoTutorial';"
    )
    print('Added VideoTutorial import')

# 2. Add VIDEO_TUTORIALS constant before component function
video_tutorials_code = '''
const VIDEO_TUTORIALS: Record<string, { videoUrl: string; thumbnailUrl?: string; title: string; description?: string; steps?: Array<{ title: string; description: string }> }> = {
  'lit-to-epub': {
    videoUrl: '/videos/lit-to-epub.mp4',
    title: '如何将 LIT 文件转换为 EPUB？完整视频教程',
    description: '本教程演示如何使用 BookConv 将 LIT 格式电子书转换为通用的 EPUB 格式。',
    steps: [
      { title: '上传 LIT 文件', description: '点击上传区域或拖拽 LIT 文件到页面' },
      { title: '选择目标格式', description: '选择 EPUB 作为输出格式' },
      { title: '等待转换完成', description: '系统自动完成转换，通常只需几秒钟' },
      { title: '下载结果', description: '点击按钮下载转换后的 EPUB 文件' },
    ],
  },
  'pdf-to-epub': {
    videoUrl: '/videos/pdf-to-epub.mp4',
    title: 'PDF 转 EPUB：保留排版和目录的终极指南',
    description: '学习如何将 PDF 转换为可重排的 EPUB 格式，获得最佳阅读体验。',
    steps: [
      { title: '上传 PDF 文件', description: '支持扫描版和文字版 PDF' },
      { title: '选择 EPUB 格式', description: '系统会自动优化排版' },
      { title: '预览并下载', description: '转换完成后立即下载' },
    ],
  },
  'epub-to-txt': {
    videoUrl: '/videos/epub-to-txt.mp4',
    title: '从 EPUB 提取纯文本的快速方法',
    description: '将 EPUB 电子书转换为干净的纯文本，去除所有格式。',
    steps: [
      { title: '上传 EPUB 文件', description: '支持任意大小的 EPUB 文件' },
      { title: '选择 TXT 格式', description: '提取纯文本内容' },
      { title: '下载文本文件', description: '获得干净的 .txt 文件' },
    ],
  },
};'''

insert_point = content.find('export function ToolPageClient')
if insert_point > 0:
    content = content[:insert_point] + '\n\n' + video_tutorials_code + '\n\n' + content[insert_point:]
    print('Inserted VIDEO_TUTORIALS constant')

# 3. Embed VideoTutorial component after FAQSection, before SocialProofBanner
faq_section = content.find('<FAQSection faqs={faqs}')
social_proof = content.find('<SocialProofBanner />')

if faq_section > 0 and social_proof > 0:
    before_faq = content.rfind('\n', 0, faq_section)
    indent = content[before_faq+1:faq_section]
    
    video_jsx = indent + '      {/* Video Tutorial for S-tier conversions */}\n'
    video_jsx += indent + '      <section className="mb-12">\n'
    video_jsx += indent + '        <h2 className="text-2xl font-bold text-gray-900 mb-6">视频教程</h2>\n'
    video_jsx += indent + '        {' + '`{videoTutorial && (`' + '\n'
    video_jsx += indent + '          <VideoTutorial\n'
    video_jsx += indent + '            videoUrl={videoTutorial.videoUrl}\n'
    video_jsx += indent + '            title={videoTutorial.title}\n'
    video_jsx += indent + '            description={videoTutorial.description}\n'
    video_jsx += indent + '            steps={videoTutorial.steps}\n'
    video_jsx += indent + '          />\n'
    video_jsx += indent + '        {' + '`)}}' + '\n'
    video_jsx += indent + '      </section>\n'
    video_jsx += indent + '\n'
    
    content = content[:social_proof] + video_jsx + content[social_proof:]
    print('Inserted VideoTutorial JSX')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Done! Written {len(content)} chars')