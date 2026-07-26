export interface KeywordVariant {
  base: string;
  modifier: string;
  full: string;
  type: 'search' | 'longtail' | 'question';
}

const modifiers = [
  'online free', 'no email required', 'best', 'fast', 'high quality',
  'free download', 'no registration', 'instant', 'batch', 'bulk',
];

const questions = [
  'how to convert {base} online', 'best {base} converter',
  '{base} free online', '{base} no sign up',
];

export function generateVariants(baseKeyword: string): KeywordVariant[] {
  const variants: KeywordVariant[] = [];
  for (const mod of modifiers) {
    variants.push({
      base: baseKeyword,
      modifier: mod,
      full: baseKeyword + ' ' + mod,
      type: 'longtail' as const,
    });
  }
  for (const q of questions) {
    variants.push({
      base: baseKeyword,
      modifier: 'question' as const,
      full: q.replace('{base}', baseKeyword),
      type: 'question' as const,
    });
  }
  return variants;
}

export function getAlsoTryKeywords(baseKeyword: string): KeywordVariant[] {
  return generateVariants(baseKeyword).slice(0, 8);
}