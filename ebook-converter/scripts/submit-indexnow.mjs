// Submit every URL from the live sitemap to IndexNow (Bing / Yahoo / DuckDuckGo / Yandex).
// This implements the "主动通知搜索引擎" step from the growth playbook:
// after publishing a new blog post or conversion page, run this so Bing indexes it fast.
//
// Usage:
//   npm run submit-indexnow
//   SITE_URL=https://www.bookconv.com node scripts/submit-indexnow.mjs
//
// Prerequisite: the key file public/<KEY>.txt MUST be deployed (it is served at
// https://www.bookconv.com/<KEY>.txt) and the same KEY registered in Bing Webmaster Tools.

const KEY = process.env.INDEXNOW_KEY || '6d8f9d25096b4bb380a718f3d84ee140';
const SITE_URL =
  process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.bookconv.com';
const SITEMAP_URL = `${SITE_URL.replace(/\/$/, '')}/sitemap.xml`;
const HOST = new URL(SITE_URL).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function getUrls() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.status} ${SITEMAP_URL}`);
  }
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function submit(urls) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, urlList: urls }),
  });
  const text = await res.text();
  return { status: res.status, text };
}

(async () => {
  try {
    const urls = await getUrls();
    console.log(`Found ${urls.length} URLs in ${SITEMAP_URL}`);
    if (urls.length === 0) {
      console.log('Nothing to submit.');
      return;
    }
    const { status, text } = await submit(urls);
    console.log(`IndexNow response: ${status}`);
    console.log(text || '(empty body)');
    if (status >= 200 && status < 300) {
      console.log('✅ Submitted successfully.');
      process.exit(0);
    } else {
      console.error(
        '❌ Submission failed. Verify the key file is deployed at',
        `${SITE_URL}/${KEY}.txt`,
        'and registered in Bing Webmaster Tools.',
      );
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
