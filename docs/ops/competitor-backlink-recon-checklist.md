# Competitor Backlink Recon Checklist (bookconv.com)

> Purpose: Use Ahrefs' free backlink checker to find which **directory sites / resource pages / tool-list pages** competitors are listed on, then reverse-engineer backlink opportunities that bookconv.com can also submit to.
> Generated: 2026-08-12
>
> ⚠️ Capability boundary: This environment has no Ahrefs account/API, so backlink data cannot be fetched programmatically.
> For each competitor below we prepared a **clickable Ahrefs free-check URL** — open it in a browser to see the top 100 backlinks (no login required).
> All `DR` / `referring-domains` / `opportunity` columns must be filled in manually after you check.

---

## 1. How to Run (3 Steps)

1. Click any competitor's Ahrefs URL below, confirm the domain in the input box, click **Check backlinks** (free, no account, see top 100).
2. In the results, filter for **Directory / Resources / Tools / "submit" / .edu / industry-resource-page** backlinks (these are the ones bookconv can also request).
3. Backfill valuable targets into the "Tracking Table" below, then merge into the submission queue in `外链资源完整清单.md` (directory-type prioritized by ROI).

> Advanced: register **Bing Webmaster Tools** (free, can check any site's backlinks) to cross-verify; **Moz Link Explorer** gives 10 free checks/month to see DA/Spam Score for quality assessment.

---

## 2. Competitor List (layered by relevance to bookconv)

URL format: `https://ahrefs.com/backlink-checker?input=<domain>`

### P0 — Ebook / format-conversion core competitors (recon first)

| # | Competitor | Domain | Relation to bookconv | Ahrefs query URL |
|---|------------|--------|----------------------|------------------|
| 1 | CloudConvert | cloudconvert.com | 200+ formats incl. EPUB/MOBI/AZW/PDF, has API; bookconv's strongest feature benchmark | https://ahrefs.com/backlink-checker?input=cloudconvert.com |
| 2 | Convertio | convertio.com | 300+ formats incl. ebooks, Google Drive/Dropbox integration; one of the highest-traffic online converters | https://ahrefs.com/backlink-checker?input=convertio.com |
| 3 | Zamzar | zamzar.com | Since 2006, 1200+ formats, old-school authority, deep backlink history | https://ahrefs.com/backlink-checker?input=zamzar.com |
| 4 | Online-Convert | online-convert.com | Finest output control, incl. ebook/device-specific settings | https://ahrefs.com/backlink-checker?input=online-convert.com |
| 5 | Calibre | calibre-ebook.com | Ebook management/conversion desktop benchmark, authority site in the ebook niche, high-quality backlinks | https://ahrefs.com/backlink-checker?input=calibre-ebook.com |
| 6 | Epubor | epubor.com | Ebook/DRM-removal, pure-ebook SaaS, backlink audience highly overlaps bookconv's target users | https://ahrefs.com/backlink-checker?input=epubor.com |

### P1 — Generic / PDF conversion (large backlink volume, good for mining directories/resources)

| # | Competitor | Domain | Relation to bookconv | Ahrefs query URL |
|---|------------|--------|----------------------|------------------|
| 7 | FreeConvert | freeconvert.com | 1GB/25 free conversions, large volume, broad backlinks | https://ahrefs.com/backlink-checker?input=freeconvert.com |
| 8 | Smallpdf | smallpdf.com | PDF-category leader, strong brand, often listed on resource pages | https://ahrefs.com/backlink-checker?input=smallpdf.com |
| 9 | iLovePDF | ilovepdf.com | PDF suite, large international traffic | https://ahrefs.com/backlink-checker?input=ilovepdf.com |
| 10 | PDF24 | pdf24.org | Free PDF tools, German site, frequent on resource pages | https://ahrefs.com/backlink-checker?input=pdf24.org |
| 11 | PDFCandy | pdfcandy.com | 47 tools, incl. EPUB↔PDF | https://ahrefs.com/backlink-checker?input=pdfcandy.com |
| 12 | CheersPDF | cheerspdf.com | Emerging browser-based ebook converter, clean new-site backlink structure (easy to copy) | https://ahrefs.com/backlink-checker?input=cheerspdf.com |

---

## 3. Recon Tracking Table (backfill after checking)

| Competitor | DR (fill after check) | Referring domains | Backlink type distribution (dir/resource/guest) | Reusable opportunity for bookconv | Landing URL / notes | Status |
|------------|----------------------|------------------|------------------------------------------------|-----------------------------------|--------------------|--------|
| CloudConvert | | | | | | To check |
| Convertio | | | | | | To check |
| Zamzar | | | | | | To check |
| Online-Convert | | | | | | To check |
| Calibre | | | | | | To check |
| Epubor | | | | | | To check |
| FreeConvert | | | | | | To check |
| Smallpdf | | | | | | To check |
| iLovePDF | | | | | | To check |
| PDF24 | | | | | | To check |
| PDFCandy | | | | | | To check |
| CheersPDF | | | | | | To check |

**After backfilling**: merge the identified directory/resource-site candidates into the submission queue in `外链资源完整清单.md` (directory-type prioritized by ROI), managed together with existing BetaList / StartupProject records.

---

## 4. Google补漏 search queries (supplement beyond Ahrefs)

Ahrefs free only shows top 100; use these Google mention queries to fill gaps (not a backlink list, but can surface resource pages):

```
intext:"cloudconvert.com" "directory" -site:cloudconvert.com
intext:"convertio.com" "resources" -site:convertio.com
intitle:directory "ebook converter"
"submit your tool" "file converter"
```

---

## 5. Related Docs

- `外链资源完整清单.md` (Chinese) — real submission records + submission queue (candidates ultimately merge here)
- `backlink-tools-index.md` (English) — backlink scripts/docs map
- `外链推广完整方案_20260804.md` (Chinese) — master plan (3 phases / priorities)
- Archived drafts: see `_archived_backlink/`
