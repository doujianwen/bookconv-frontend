import pathlib, json, hashlib, zipfile, io, shutil, datetime, subprocess
import requests

root = pathlib.Path('E:/一人公司/电子书格式转换站/ebook-converter')
out = root / 'docs/tasks/bookconv-growth-20261105/evidence/2026-11-07'
out.mkdir(parents=True, exist_ok=True)
fixtures = out / 'fixtures'
fixtures.mkdir(exist_ok=True)
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

def epub(padding=0):
    b = io.BytesIO()
    with zipfile.ZipFile(b, 'w', compression=zipfile.ZIP_STORED) as z:
        z.writestr('mimetype', 'application/epub+zip')
        z.writestr('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')
        z.writestr('OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">bookconv-owned-fixture-20261107</dc:identifier><dc:title>BookConv Upload Test</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-11-07T00:00:00Z</meta></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>'+('<item id="padding" href="padding.txt" media-type="text/plain"/>' if padding else '')+'</manifest><spine><itemref idref="chapter"/></spine></package>')
        z.writestr('OEBPS/chapter.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Upload Test</title></head><body><h1>BookConv Test</h1><p>This original test text is dedicated to the public domain. Marker: NOV07-OWNED-001.</p></body></html>')
        z.writestr('OEBPS/nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">Test</a></li></ol></nav></body></html>')
        if padding: z.writestr('OEBPS/padding.txt', b'P' * padding)
    return b.getvalue()

(fixtures/'owned-small.epub').write_bytes(epub())
for suffix, size in [('below', 4*1024*1024-1), ('at', 4*1024*1024), ('above', 4*1024*1024+1)]:
    data = epub(size-len(epub(1))+1)
    assert len(data) == size
    (fixtures/f'owned-4MiB-{suffix}.epub').write_bytes(data)
# A genuine, minimal one-page PDF with original text and correct xref offsets.
stream = b'BT /F1 12 Tf 50 750 Td (BookConv original fixture NOV07-OWNED-001) Tj ET'
objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>', b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
pdf = b'%PDF-1.4\n'; offsets = [0]
for i, obj in enumerate(objects, 1):
    offsets.append(len(pdf)); pdf += f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
xref = len(pdf)
pdf += b'xref\n0 6\n0000000000 65535 f \n'+b''.join(f'{x:010d} 00000 n \n'.encode() for x in offsets[1:])+f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
(fixtures/'owned-small.pdf').write_bytes(pdf)
manifest = []
for p in sorted(fixtures.iterdir()):
    if p.suffix == '.epub':
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None
            assert z.infolist()[0].filename == 'mimetype'
            assert z.read('mimetype') == b'application/epub+zip'
    manifest.append(dict(name=p.name, bytes=p.stat().st_size, sha256=hashlib.sha256(p.read_bytes()).hexdigest(), provenance='Original synthetic text; public-domain dedication; no DRM or personal data', uploaded=False))
(out/'fixture-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
snapshot = root/'_wb_tmp/ga4-advanced-2026-11-06.json'
shutil.copy2(snapshot, out/'ga4-advanced-2026-11-06.json')
ga = json.loads(snapshot.read_text(encoding='utf-8'))
summary = {'queriedAt': stamp, 'meta': ga['meta'], 'diagnostic': ga['modules']['failed_by_date_error_diagnostic'], 'uploadFailures': [r for r in ga['modules']['failed_by_date_error_code'] if 'UPLOAD' in r.get('error_code','')]}
(out/'diagnostic-summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
probe = {'checkedAt': stamp, 'localHead': subprocess.check_output(['git','rev-parse','HEAD'], cwd=root,text=True).strip(), 'deployedSha': 'UNKNOWN'}
for path in ['/convert/epub-to-mobi','/api/upload/presign']:
    try:
        r=requests.get('https://www.bookconv.com'+path, timeout=40)
        entry={'status': r.status_code, 'finalUrl': r.url, 'csp':r.headers.get('Content-Security-Policy'), 'cacheControl':r.headers.get('Cache-Control')}
        if path.endswith('/presign'): entry['body']=r.json()
        probe[path]=entry
    except Exception as e: probe[path]={'error':type(e).__name__, 'result':'UNKNOWN'}
(out/'production-probe.json').write_text(json.dumps(probe, ensure_ascii=False, indent=2), encoding='utf-8')
with (out/'closure-gate.txt').open('w',encoding='utf-8') as f:
    gate=subprocess.run(['node','scripts/verify-closure-gates.mjs','--no-live'],cwd=root,stdout=f,stderr=subprocess.STDOUT)
print(json.dumps({'fixtures':manifest, 'probe':probe,'gateExit':gate.returncode,'diagnostic':summary['diagnostic']},ensure_ascii=False,indent=2))
