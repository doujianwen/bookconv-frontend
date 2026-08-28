describe('generateSchema', () => {
  it('should generate valid JSON-LD', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('epub', 'pdf');
    const parsed = JSON.parse(json);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(Array.isArray(parsed['@graph'])).toBe(true);
    expect(parsed['@graph'].length).toBeGreaterThan(0);
  });

  it('should include BreadcrumbList in graph', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('epub', 'pdf');
    const parsed = JSON.parse(json);
    const breadcrumb = parsed['@graph'].find((g: Record<string, any>) => g['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement.length).toBe(3);
  });

  it('should include HowTo with Calibre tool', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('epub', 'azw3');
    const parsed = JSON.parse(json);
    const howTo = parsed['@graph'].find((g: Record<string, any>) => g['@type'] === 'HowTo');
    expect(howTo).toBeDefined();
    expect(howTo.name).toContain('EPUB');
    expect(howTo.name).toContain('AZW3');
    expect(howTo.tool[0].name).toBe('Calibre');
  });

  it('should include SoftwareApplication with free pricing', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('mobi', 'epub');
    const parsed = JSON.parse(json);
    const app = parsed['@graph'].find((g: Record<string, any>) => g['@type'] === 'SoftwareApplication');
    expect(app).toBeDefined();
    expect(app.offers.price).toBe(0);
    expect(app.offers.priceCurrency).toBe('USD');
  });

  it('should include Article with author', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('pdf', 'epub');
    const parsed = JSON.parse(json);
    const article = parsed['@graph'].find((g: Record<string, any>) => g['@type'] === 'Article');
    expect(article).toBeDefined();
    expect(article.author.name).toBe('BookConv');
  });

  it('should include FAQ when provided', () => {
    const { generateSchema } = require('@/lib/schema');
    const faqs = [
      { question: 'Is it free?', answer: 'Yes' },
      { question: 'Max size?', answer: '10MB' },
    ];
    const json = generateSchema('epub', 'pdf', faqs);
    const parsed = JSON.parse(json);
    const faqPage = parsed['@graph'].find((g: Record<string, any>) => g['@type'] === 'FAQPage');
    expect(faqPage).toBeDefined();
    expect(faqPage.mainEntity.length).toBe(2);
  });

  it('should NOT include FAQ when empty', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('epub', 'pdf', []);
    const parsed = JSON.parse(json);
    const faqPage = parsed['@graph'].find((g: Record<string, any>) => g['@type'] === 'FAQPage');
    expect(faqPage).toBeUndefined();
  });

  it('should include Review entries', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('epub', 'pdf');
    const parsed = JSON.parse(json);
    const reviews = parsed['@graph'].filter((g: Record<string, any>) => g['@type'] === 'Review');
    expect(reviews.length).toBe(2);
    expect(reviews[0].author.name).toBe('Alex M.');
  });

  it('should use correct page URL pattern', () => {
    const { generateSchema } = require('@/lib/schema');
    const json = generateSchema('docx', 'epub');
    expect(json).toContain('/convert/docx-to-epub');
  });
});
