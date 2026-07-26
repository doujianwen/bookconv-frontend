# BookConv - Free Online Ebook Format Converter (Frontend)

> **Live site**: [bookconv.com](https://bookconv.com)

A beautiful, SEO-optimized frontend for converting between 28+ ebook formats. Powered by Calibre engine on the backend.

## Features

- **28+ format conversions** - EPUB, MOBI, AZW3, PDF, DOCX, TXT, FB2, LIT, RTF, and more
- **No registration required** - Convert instantly, no sign-up needed
- **No watermarks** - Clean output files
- **Multi-language** - English & Spanish support with i18n
- **PWA ready** - Installable on mobile devices
- **SEO optimized** - Structured data, sitemap, blog content
- **Free tier** - Generous free usage limits

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (en/es) |
| Analysis | Plausible Analytics + GA4 |
| Error Tracking | Sentry |
| PWA | Service Worker |

## Architecture

This repo contains the **frontend only**. The backend (file conversion, auth, payments, queue) is private.

The frontend makes API calls to `/api/*` endpoints which are served by the private backend on Vercel.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
LEMON_SQUEEZY_STORE_ID=your-store-id
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

> These env vars are only needed for local development. The production deployment uses Vercel environment variables.

## Deployment

Deploy to **Vercel** with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/doujianwen/bookconv-frontend)

## License

MIT - Feel free to use this as a template for your own projects!

## Credits

Built by [doujianwen](https://github.com/doujianwen).  
Powered by [Calibre](https://calibre-ebook.com/) for ebook conversion.
