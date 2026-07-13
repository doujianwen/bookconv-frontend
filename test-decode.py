import os, re

dir_path = "./eobok-converter/src/data/content"
bigf_files = ["azw3-to-pdf.ts","epub-to-rtf.ts","epub-to-txt.ts","mobi-to-txt.ts","pdf-to-epub.ts","rtf-to-epub.ts"]

for f in bigf_files:
    file = os.path.join(dir_path, f)
    with open(file, 'r', encoding='utf-8') as fh:
        c = fh.read()
    orig = c
    print("Processing: " + f)