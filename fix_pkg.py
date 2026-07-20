import json

path = r"E:\一人公司\电子书格式转换站\ebook-converter\package.json"
with open(path, "r", encoding="utf-8-sig") as f:
    pkg = json.load(f)

pkg["scripts"]["start-with-worker"] = (
    'node -e "const q = require(\'./dist/lib/queue\'); '
    'q.startWorker().then(() => console.log(\'Worker started\')).catch(e => console.error(\'Worker failed:\', e.message)) '
    '& npm start"'
)

with open(path, "w", encoding="utf-8") as f:
    json.dump(pkg, f, indent=2, ensure_ascii=False)
    f.write("\n")

print("Updated package.json scripts:")
for k, v in pkg["scripts"].items():
    print(f"  {k}: {v}")