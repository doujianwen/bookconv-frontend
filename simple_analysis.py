import csv
folder = r" C:\\Users\\29537\\Downloads\\https___www.bookconv.com_-Performance-on-Search-2026-08-03\
with open(folder + " \\\\查询数.csv\, \r\, encoding=\utf-8-sig\) as f:
    reader = csv.DictReader(f)
    queries = list(reader)

print(" Keywords count:\, len(queries))
total_imp = sum(int(q[" 展示\]) for q in queries)
print(" Total impressions:\, total_imp)
