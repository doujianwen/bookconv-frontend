import { chromium } from 'playwright';

const TARGETS = [
  'https://www.bookconv.com/convert/mobi-to-epub',
  'https://www.bookconv.com/',
  'https://www.bookconv.com/blog',
];

const run = async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PW_EXEC,
  });
  const results = [];
  for (const url of TARGETS) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12/13/14
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    const metrics = {};
    await page.addInitScript(() => {
      window.__cwv = { lcp: null, cls: 0, fid: null, inp: null };
      try {
        new PerformanceObserver((list) => {
          const e = list.getEntries();
          const last = e[e.length - 1];
          window.__cwv.lcp = last.renderTime || last.loadTime || null;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) window.__cwv.cls += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.name === 'first-input') window.__cwv.fid = e.processingStart - e.startTime;
          }
        }).observe({ type: 'first-input', buffered: true });
      } catch (e) {}
    });
    const navStart = Date.now();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(3500); // let LCP/CLS settle
    } catch (e) {
      metrics.error = String(e).slice(0, 200);
    }
    const nav = await page.evaluate(() => {
      const t = performance.getEntriesByType('navigation')[0];
      return t ? {
        ttfb: Math.round(t.responseStart),
        domContentLoaded: Math.round(t.domContentLoadedEventEnd),
        load: Math.round(t.loadEventEnd),
        transferSize: t.transferSize,
        domInteractive: Math.round(t.domInteractive),
      } : null;
    });
    const cwv = await page.evaluate(() => window.__cwv);
    const title = await page.title();
    results.push({ url, title, nav, cwv, elapsedMs: Date.now() - navStart });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
};

run().catch((e) => { console.error('FATAL', e); process.exit(1); });
