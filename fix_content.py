import os, re
base = r'E:\一人公司\电子书格式转换站\ebook-converter\src\data\content\'
files = [
    'azw3-to-mobi.ts', 'epub-to-jpg.ts', 'epub-to-png.ts', 'azw3-to-epub.ts',
    'azw3-to-pdf.ts', 'epub-to-rtf.ts', 'epub-to-text.ts', 'epub-to-txt.ts',
    'lit-to-epub.ts', 'mobi-to-txt.ts', 'pdf-to-epub.ts', 'rtf-to-epub.ts',
    'txt-to-epub.ts', 'epub-to-mobi.ts', 'mobi-to-epub.ts', 'epub-to-pdf.ts',
    'doc-to-epub.ts', 'epub-to-azw3.ts', 'epub-to-doc.ts', 'epub-to-word.ts',
    'fb2-to-epub.ts', 'mobi-to-pdf.ts', 'docx-to-epub.ts',
]
for fname in files:
    path = os.path.join(base, fname)
    if not os.path.exists(path):
        print('SKIP ' + fname)
        continue
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    original = c
    c = c.replace(chr(125)+chr(96), chr(125))
    c = c.replace(chr(93)+chr(96)+',', ']')
    c = c.replace(chr(93)+chr(96)+chr(10), ']' + chr(10))
    c = re.sub(r'}(\s*){', lambda m: '},\n    {' if ',' not in m.group(0) else m.group(0), c)
    if c != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print('FIXED ' + fname)
    else:
        print('OK    ' + fname)
print('Done!')