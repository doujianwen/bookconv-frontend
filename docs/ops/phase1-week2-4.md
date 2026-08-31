## Week 2-3: Tool Page Building

### KD=0 keyword page priority order

| Priority | Keyword | Monthly traffic | Page type | Content requirement |
|----------|---------|----------------|-----------|---------------------|
| S1 | lit to epub | 10.8K | Tool page + explainer | Video + comparison table |
| S2 | epub to txt | 6.5K | Tool page + explainer | Video tutorial |
| S3 | epub to pdf | 6.8K | Tool page + explainer | In-depth tutorial |
| A1 | epub to azw3 | Medium | Tool page + explainer | FAQ Schema |
| A2 | azw3 to epub | Medium | Tool page + explainer | FAQ Schema |
| A3 | mobi to epub | 1.6K | Tool page + explainer | FAQ Schema |
| B1 | fb2 to epub | 242 | Tool page | Basic explainer |
| B2 | epub to rtf | Low | Tool page | Basic explainer |
| B3 | epub to png | Low | Tool page | Basic explainer |
| B4 | azw3 to mobi | Low | Tool page | Basic explainer |
| B5 | mobi to txt | Low | Tool page | Basic explainer |
| B6 | rtf to epub | Low | Tool page | Basic explainer |
| B7 | epub to pdf linux | Low | Tutorial page | Linux tutorial |

### Every page must include
1. Conversion tool area: upload → select format → convert → download
2. Format explainer (800-1000 words): format intro, history, use cases, pros & cons
3. FAQ Schema (5-8 questions): how to convert, format definition, quality, batch, size limits
4. Related conversion recommendations: 3-5 related conversions at the bottom
5. Usage tutorial: step-by-step + screenshots

### FAQ Schema code example (JSON-LD)
Add to `<head>`:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How to convert EPUB to TXT?",
    "acceptedAnswer": { "@type": "Answer", "text": "Upload your EPUB file, select TXT as output format, click Convert." }
  }]
}
```

## Week 3-4: Expand Backlinks

### Hacker News Show HN
- [ ] Title template: "Show HN: I built a free online ebook converter with no limits"
- [ ] Body: project intro + tech stack + key features + link
- [ ] Post time: Tue/Wed/Thu 9am US Eastern
- [ ] Prepare to reply to comments (stay active)

### IndieHackers launch
- [ ] Register on IndieHackers
- [ ] Launch project: "Free Ebook Converter - 28+ formats, no signup"
- [ ] Angle: startup story + tech choices

### DEV.to article
- [ ] Register on DEV.to
- [ ] Write: "Building a Free Ebook Converter with Next.js + Calibre"
- [ ] Tags: #javascript #nextjs #calibre #opensource

### Tool directory submissions (cont.)
- [ ] Continue submitting to other directory sites
- [ ] Focus: ebook-related directories (if any)
