interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[], url?: string): string {
  const items = faqs.map((f, i) => ({
    '@type': 'Question',
    name: f.question,
    answerCount: 1,
    author: { '@type': 'Organization', name: 'BookConv' },
    url: url ? url + '#faq-' + (i + 1) : undefined,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
      datePublished: new Date().toISOString(),
      author: { '@type': 'Organization', name: 'BookConv' },
      url: url ? url + '#faq-' + (i + 1) : undefined,
    },
  }));
  const base: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
    author: { '@type': 'Organization', name: 'BookConv' },
    datePublished: '2026-01-01T00:00:00+00:00',
  };
  if (url) base.url = url;
  return JSON.stringify(base, null, 2);
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }, null, 2);
}

interface SoftwareAppSchemaOpts {
  title: string; description: string; url: string; sourceFormat: string; targetFormat: string; price?: number; priceCurrency?: string;
}

export function generateSoftwareApplicationSchema(opts: SoftwareAppSchemaOpts): string {
  const { title, description, url, sourceFormat, targetFormat, price = 0, priceCurrency = 'USD' } = opts;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'SoftwareApplication',
      name: title,
      description,
      url,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price, priceCurrency, availability: 'https://schema.org/InStock' },
      featureList: [
        sourceFormat + " to " + targetFormat,
        'No registration required',
        'No watermarks',
        'Files auto-deleted within 1 hour',
        'Batch conversion (Pro)',
        'High-quality Calibre engine',
      ],
    }],
  }, null, 2);
}

interface ArticleSchemaOpts {
  headline: string; description: string; url: string; text?: string; image?: string; authorName?: string; datePublished?: string; dateModified?: string;
}

export function generateArticleSchema(opts: ArticleSchemaOpts): string {
  const { headline, description, url, image, authorName = 'BookConv Team', datePublished, dateModified, text } = opts;
  const graph: Record<string, any>[] = [{
    '@type': 'Article',
    headline,
    description,
    text: text || undefined,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: 'BookConv',
      logo: { '@type': 'ImageObject', url: 'https://www.bookconv.com/icon.svg' },
    },
    datePublished: datePublished || new Date().toISOString().split('T')[0],
    dateModified: dateModified || new Date().toISOString().split('T')[0],
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }];
  if (image) graph[0]['image'] = image;
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

interface ConversionContentLite {
  hero?: { title?: string; subtitle?: string };
  sections?: Array<{ heading: string; body: string }>;
  faq?: Array<{ q: string; a: string }>;
}

function defaultFaqsFor(source: string, target: string): FAQItem[] {
  const s = source.toUpperCase();
  const t = target.toUpperCase();
  return [
    { question: `Is ${s} to ${t} conversion free?`, answer: `Yes! Our ${s} to ${t} converter is completely free to use. No registration required, no watermarks, no hidden fees. Convert up to 5 files per hour for free.` },
    { question: `Will I lose formatting when converting from ${s} to ${t}?`, answer: `Our converter uses the Calibre engine, which preserves most formatting including fonts, images, tables, and layout. However, some complex formatting may change slightly due to differences between ${s} and ${t} format capabilities. The result is optimized for readability on your target device.` },
    { question: 'Is my file secure?', answer: 'Absolutely. All files are transferred over encrypted HTTPS connections. Your original file and converted file are automatically deleted from our servers within 1 hour. We do not read, store, or share your content.' },
    { question: 'What is the file size limit?', answer: 'Free users can convert files up to 10 MB. Pro users enjoy up to 50 MB per file and unlimited conversions.' },
    { question: 'Can I batch convert multiple files?', answer: 'Batch conversion is available with our Pro plan ($5/month). You can upload multiple files at once and convert them all in a single session, saving you time.' },
  ];
}

/**
 * Server-side structured data for a conversion page.
 * Rendered by the [locale]/convert/[slug]/page.tsx server component so crawlers
 * (Google / AI engines) can read it in the initial HTML — the client-only
 * ToolPageClient cannot output JSON-LD during SSR.
 */
export function generateConversionPageSchema(
  source: string,
  target: string,
  contentData?: ConversionContentLite,
): string {
  const baseUrl = 'https://www.bookconv.com';
  const sourceDisplay = source.toUpperCase();
  const targetDisplay = target.toUpperCase();
  const slug = source + '-to-' + target;
  const pageUrl = baseUrl + '/convert/' + slug;
  const faqs: FAQItem[] = (contentData?.faq && contentData.faq.length > 0)
    ? contentData.faq.map((f) => ({ question: f.q, answer: f.a }))
    : defaultFaqsFor(source, target);

  const graph = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Converters', item: baseUrl + '/convert' },
        { '@type': 'ListItem', position: 3, name: sourceDisplay + ' to ' + targetDisplay, item: pageUrl },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert ' + sourceDisplay + ' to ' + targetDisplay + ' Online',
      description: 'Follow these simple steps to convert ' + sourceDisplay + ' files to ' + targetDisplay + ' format online for free.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your file', text: 'Drag and drop your ' + sourceDisplay + ' file or click to browse.' },
        { '@type': 'HowToStep', position: 2, name: 'Conversion starts automatically', text: 'Our Calibre-powered engine converts your file in seconds.' },
        { '@type': 'HowToStep', position: 3, name: 'Download result', text: 'Once complete, download your converted ' + targetDisplay + ' file instantly.' },
      ],
      totalTime: 'PT2M',
      supply: [{ '@type': 'HowToSupply', name: sourceDisplay + ' file' }],
      tool: [{ '@type': 'HowToTool', name: 'Calibre' }],
    },
    {
      '@type': 'WebPage',
      '@id': pageUrl,
      url: pageUrl,
      name: 'Free Online ' + sourceDisplay + ' to ' + targetDisplay + ' Converter',
      description: contentData?.hero?.subtitle || ('Convert ' + sourceDisplay + ' to ' + targetDisplay + ' online for free.'),
      isPartOf: { '@id': baseUrl + '#website' },
      inLanguage: 'en',
    },
    {
      '@type': 'Article',
      headline: 'How to Convert ' + sourceDisplay + ' to ' + targetDisplay + ' Online — Free Guide',
      description: contentData?.hero?.subtitle || ('Free online ' + sourceDisplay + ' to ' + targetDisplay + ' converter guide with step-by-step instructions.'),
      author: { '@type': 'Organization', name: 'BookConv', url: baseUrl },
      publisher: { '@type': 'Organization', name: 'BookConv', logo: { '@type': 'ImageObject', url: baseUrl + '/icon.svg' } },
      datePublished: '2026-01-01T00:00:00+00:00',
      dateModified: '2026-07-14T00:00:00+00:00',
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      image: baseUrl + '/og-image.svg',
    },
    {
      '@type': 'SoftwareApplication',
      name: sourceDisplay + ' to ' + targetDisplay + ' Online',
      description: sourceDisplay + ' to ' + targetDisplay + ' converter powered by Calibre. Free, no registration, no watermarks.',
      url: pageUrl,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      featureList: [
        sourceDisplay + ' to ' + targetDisplay,
        'No registration required',
        'No watermarks',
        'Files auto-deleted within 1 hour',
        'Batch conversion (Pro)',
        'High-quality Calibre engine',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f, i) => ({
        '@type': 'Question',
        name: f.question,
        answerCount: 1,
        author: { '@type': 'Organization', name: 'BookConv' },
        url: pageUrl + '#faq-' + (i + 1),
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
          datePublished: '2026-01-01T00:00:00+00:00',
          author: { '@type': 'Organization', name: 'BookConv' },
          url: pageUrl + '#faq-' + (i + 1),
        },
      })),
      author: { '@type': 'Organization', name: 'BookConv' },
      datePublished: '2026-01-01T00:00:00+00:00',
      url: pageUrl,
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

const LOCALE_MAP = {
  en: { lang: 'en', hrefLang: 'en-US' },
  es: { lang: 'es', hrefLang: 'es-ES' },
};

export function getLocale(locale: string) {
  return (LOCALE_MAP as any)[locale] ?? LOCALE_MAP.en;
}

export function generateHrefLangTags(baseUrl: string, slugs: string[]): string[] {
  const locales = Object.keys(LOCALE_MAP);
  const tags: string[] = [];
  for (const slug of slugs) {
    for (const locale of locales) {
      tags.push(baseUrl + "/?lang=" + locale);
    }
    tags.unshift(`${baseUrl}/?lang=en`);
  }
  return tags;
}
