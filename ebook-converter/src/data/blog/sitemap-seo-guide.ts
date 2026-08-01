export const slug = `sitemap-seo-guide`;
export const title = `Inside BookConv's Sitemap: How Every Converter Page Gets Found`;
export const date = `2026-07-30`;
export const author = "BookConv Team";
export const tags = ["SEO", "sitemap", "search-console", "bookconv", "technical"];

export const content = {
  intro: `BookConv publishes a sitemap at /sitemap.xml that's generated from the same data the site renders, so every conversion page and blog post is listed the moment it ships. Here's what's inside it, how to submit a sitemap to Google Search Console, and the mistakes that quietly keep pages out of the index.`,
  sections: [
    {
      heading: `What BookConv's Sitemap Does, and What It Can't Do`,
      body: `A sitemap is an XML file listing the URLs you want search engines to know about. Each entry carries an address plus a few optional hints: when the page last changed, how often it tends to change, and how important it is relative to your other pages.

Crawlers mostly find pages by following links. That works fine for anything one click from the homepage and badly for pages buried deeper. A sitemap short-circuits discovery by handing over the full list instead of hoping a crawler stumbles across everything.

Now the honest part. A sitemap doesn't make Google index a page and it doesn't improve rankings. Google says so plainly in its [guide to building and submitting a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): being listed makes a URL known, not necessarily worth storing.

That's still worth having, because a page nobody crawls can't rank at all. Everything after discovery — useful content, clear titles, internal links — decides whether it earns a position.

For BookConv the payoff sits in the tool pages. Each format pair is a separate thing people search for, and someone hunting for a way to [turn a PDF into an EPUB](/convert/pdf-to-epub) will never reach that page if it was never crawled.`
    },
    {
      heading: `What's Actually Inside /sitemap.xml`,
      body: `Ours isn't a static file someone remembers to update. It's generated at build time from the same data the pages render from, using the framework's built-in sitemap file convention.

Because it reads live data, adding a conversion pair or publishing a post puts the URL in the sitemap on the next deploy. There's no separate step to forget.

### What gets listed

The generator walks both locales we ship — English at the site root, Spanish under an /es prefix — and emits every public URL for each:

- **The homepage**, marked weekly and given top priority as the main entry point
- **Pricing**, updated monthly, and the **blog index**, updated weekly
- **Privacy and terms**, marked yearly at low priority — necessary, but not what anyone searches for
- **Every conversion page** under /convert/, refreshed monthly, with the heavily used format pairs weighted slightly above the long-tail ones
- **Every blog post**, using the post's own publication date as its last-modified value

Priority values are relative signals inside your own site, not a score anyone else sees. They say which pages you consider central. We put the homepage and pairs like [EPUB to MOBI](/convert/epub-to-mobi) above the legal pages, which is roughly how visitors rank them too.

The finished file is served at /sitemap.xml, and we publish an RSS feed alongside it so readers and aggregators can follow new posts without waiting on a crawl. For the formal definition of the XML format — allowed tags, size limits, encoding rules — [sitemaps.org](https://www.sitemaps.org/protocol.html) is what everyone implements against.`
    },
    {
      heading: `Submitting a Sitemap to Google Search Console`,
      body: `Publishing the file is step one. Telling Google about it is step two, and it takes about a minute.

1. **Verify ownership** of the property in Google Search Console. Domain-level verification through a DNS record covers every subdomain plus http and https, so it's usually the least painful route.
2. **Open the Sitemaps report** in the left-hand navigation.
3. **Enter the path**, normally just sitemap.xml, since the field is already scoped to your verified domain.
4. **Submit and leave it alone.** Status flips to Success once the file has been fetched and parsed. Fetching is fast; indexing the URLs inside is not.
5. **Check back in a week or two** and compare discovered URLs against what you expected.

You submit once. Google re-fetches the file on its own schedule, so a rebuilt sitemap doesn't need resubmitting after every deploy.

### Reading the results without panicking

The Pages report will always show some URLs as discovered but not indexed. That's normal. It means Google knows about the page and hasn't decided it's worth storing. Thin pages, near-duplicates, and brand-new URLs sit in that bucket routinely.

What deserves attention is a change in direction: pages that were indexed dropping out, or a spike in fetch errors. Steady background noise isn't worth chasing. And timelines vary — a new site can wait weeks for meaningful coverage, and submitting again won't speed it up.`
    },
    {
      heading: `robots.txt Is the Other Half of the Job`,
      body: `A sitemap says which pages you want found. robots.txt says which paths crawlers should stay out of. They work as a pair, and a conflict between them either wastes crawl budget or hides content.

Ours does three things. It allows crawling of the parts that matter — the conversion pages, the blog, pricing. It blocks paths with no business in search results, including our API routes, the auth flow, and the framework's internal build assets. And it names the sitemap location outright, so any crawler that reads the file learns where the URL list lives.

That last line matters more than it looks. Search Console submission covers Google; the robots.txt reference covers every other compliant crawler. Google's [robots.txt documentation](https://developers.google.com/search/docs/crawling-indexing/robots/intro) explains how the directives get interpreted.

One rule catches people out constantly: **never list a URL in your sitemap that robots.txt blocks.** You'd be asking a crawler to look at a page and forbidding it in the same breath. Search Console flags the contradiction and the page sits in limbo. Pick one — public and listed, or blocked and left out.

The same logic applies to canonical URLs. Every sitemap entry should be the canonical version of that page: same protocol, same subdomain, same trailing-slash convention. Listing an address that redirects elsewhere sends a mixed signal about which one is real.`
    },
    {
      heading: `Sitemap Mistakes That Quietly Cost You Traffic`,
      body: `Most sitemap problems never announce themselves. The file validates, Search Console reports Success, and pages still don't show up. These are the usual reasons:

1. **Stale entries.** URLs for deleted pages turn into soft 404s. Generating from live data fixes this by design; hand-maintained lists rot within months.
2. **Relative paths.** Every entry needs the full absolute URL including the protocol. Relative paths simply aren't valid here.
3. **Non-canonical duplicates.** Listing both www and non-www, or both trailing-slash variants, splits signals between addresses that should be one page.
4. **Blocked URLs included anyway.** The robots.txt contradiction above, common enough to be worth checking twice.
5. **Private pages exposed.** Anything behind a login returns an error to a crawler and burns fetches for nothing.
6. **Uniform priority.** Setting everything to 1.0 says exactly as much as setting everything to 0.5, which is nothing.
7. **Missing translated versions.** Each locale needs its own entries. A sitemap covering only English leaves the rest of the site undiscovered.
8. **Fake last-modified dates.** Stamping every URL with today's date on every build teaches crawlers to ignore the field. Use the date the content really changed — which is why our blog entries carry each post's own date.

Two of these are worth automating rather than remembering: generate from live data, and route every URL through one canonical builder. That kills stale entries and duplicate variants in a single move.

The pages themselves still have to earn their place. A conversion page that only repeats its own title won't hold attention, which is why we pair each one with real explanation — for instance [what actually differs between ebook formats](/blog/ebook-formats-explained-en). Discovery gets you seen; substance gets you kept.`
    },
    {
      heading: `Key Takeaways`,
      body: `- **Discovery, not ranking.** BookConv's sitemap gets conversion pages and posts crawled; content and links decide whether they place.
- **Generated from live data**, so shipping a new format pair or a new article adds its URL automatically on the next deploy.
- **Submit once in Search Console** and let Google re-fetch on its own — resubmitting after every build accomplishes nothing.
- **Keep robots.txt consistent** with the sitemap, and name the sitemap inside robots.txt so crawlers beyond Google find it.
- **Use honest metadata.** Real last-modified dates and differentiated priorities carry signal; identical values everywhere carry none.`
    },
    {
      heading: `Frequently Asked Questions`,
      body: `Q: Where is BookConv's sitemap?
A: At /sitemap.xml, generated fresh with every build. We also reference it from robots.txt and publish an RSS feed for the blog, so there are three separate ways to find new content.

Q: How often should a sitemap be regenerated?
A: Every build, if it's generated from code. Ours rebuilds with the site, so the deploy that ships a new page ships its sitemap entry at the same time.

Q: Does a higher priority value make a page rank better?
A: No. Priority is a relative hint about which of your own pages matter most, used at most for crawl ordering. Search engines are free to ignore it, and often do.

Q: Search Console says my pages are discovered but not indexed. Is that broken?
A: It's a normal state, not a failure. The URL is known and hasn't been selected. The fix is usually making the page more distinct and useful, or linking to it better from pages that already perform.

Q: Should each language get its own sitemap file?
A: Not necessarily. One file can hold every locale, which is how ours works — both language variants live in the same list. Splitting only helps once the file gets large enough to be awkward.

Q: Can I include pages that robots.txt blocks?
A: You can, but don't. The two instructions contradict each other, Search Console reports the conflict, and nothing good comes of it. Decide whether the page is public, then make both files agree.

Q: What about Bing and other search engines?
A: Bing has its own webmaster tools with an equivalent submission flow, and most other crawlers pick up the sitemap through the robots.txt reference. The file itself needs no changes.`
    }
  ]
};
