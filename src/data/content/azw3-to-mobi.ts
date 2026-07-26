export const slug = 'azw3-to-mobi';
export const title = 'AZW3 to MOBI Converter';
export const level = 'B' as const;
export const wordCount = 1200;

export const content = {
  hero: {
    title: 'AZW3 to MOBI - Downgrade to Legacy Kindle Format',
    subtitle: 'Convert AZW3 to MOBI format for older Kindle device compatibility.'
  },

  sections: [
    {
      heading: 'Why Convert AZW3 to MOBI?',
      body: 'Ultra-Legacy Devices — Very old Kindles (Kindle DXG, Kindle Keyboard 3rd Gen) only accept MOBI. USB Transfer — MOBI files transfer easily via USB cable to older Kindles without wireless capability. Reliability — MOBI simple structure makes it predictable and stable on older hardware. Universal Kindle Support — Every Kindle device ever manufactured supports MOBI format.'
    },
    {
      heading: 'Conversion Notes',
      body: 'When converting AZW3 to MOBI be aware of format limitations: No Advanced Typography — MOBI cannot support custom fonts CSS styling or complex layouts. Reduced Features — Table of contents navigation is basic; annotations may not transfer perfectly. Larger File Size — MOBI compression is less efficient resulting in files 20-40% larger than AZW3. Image Quality — Images may be downsampled to maintain reasonable file sizes. Despite these limitations MOBI remains a reliable format for basic reading on compatible devices.'
    }
  ],

  faq: [
    { q: 'Should I use MOBI or AZW3?', a: 'If your Kindle is post-2012 use AZW3 for better typography and smaller files. Pre-2012 devices can only use MOBI. When in doubt try both.' },
    { q: 'Will MOBI files be larger than AZW3?', a: 'Typically yes. MOBI files are 20-40% larger than equivalent AZW3 files due to less efficient compression.' }
  ]
};
