import os, csv
def read_all_rows(filepath):
    with open(filepath, " r\, encoding=\utf-8-sig\) as fh:
        reader = csv.reader(fh)
        header = next(reader)
        rows = list(reader)
        return header, rows

folder = " C:\\Users\\29537\\Downloads\\https___www.bookconv.com_-Performance-on-Search-2026-08-03\
for f in os.listdir(folder):
        header, rows = read_all_rows(os.path.join(folder, f))
        print(" \\\\n=== \ + f + " ===\)
        print(" Header:\, header)
        for row in rows:
            print(" \, row)
