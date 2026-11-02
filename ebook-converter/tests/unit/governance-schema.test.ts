import { generateConversionPageSchema } from '@/lib/seo/schema';
import { content, es } from '@/data/content/epub-to-doc';
import { content as word } from '@/data/content/epub-to-word';
import { CONTENT_MAP } from '@/data/content';
import { ESP_CONVERT_SLUGS } from '@/lib/es-routes';

describe('conversion capability and language signals', () => {
  it.each(['en', 'es'])('does not advertise unavailable DOC as a usable application or tutorial (%s)', locale => {
    const schema = JSON.parse(generateConversionPageSchema('epub', 'doc', locale === 'es' ? es.content : content, locale));
    const types = schema['@graph'].map((node: { '@type': string }) => node['@type']);
    expect(types).not.toContain('HowTo');
    expect(types).not.toContain('SoftwareApplication');
    const page = schema['@graph'].find((node: { '@type': string }) => node['@type'] === 'WebPage');
    expect(page.url).toBe(`https://www.bookconv.com${locale === 'es' ? '/es' : ''}/convert/epub-to-doc`);
    expect(page.inLanguage).toBe(locale);
    expect(schema['@graph'].find((node: { '@type': string }) => node['@type'] === 'FAQPage').url).toBe(page.url);
  });
  it('keeps the working Word application and registers its real translation', () => {
    const schema = JSON.parse(generateConversionPageSchema('epub', 'word', word));
    expect(schema['@graph'].some((node: { '@type': string }) => node['@type'] === 'SoftwareApplication')).toBe(true);
    expect(CONTENT_MAP['epub-to-word'].es?.content.hero.title).toContain('Word');
    expect(ESP_CONVERT_SLUGS).toContain('epub-to-word');
  });
});
