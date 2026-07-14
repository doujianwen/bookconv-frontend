const fs = require("fs");
const f = "E:\\一人公司\\电子书格式转换站\\ebook-converter\\src\\lib\\queue.ts";
let c = fs.readFileSync(f, "utf8");
c = c.replace("|| '8'", "|| '4'");
fs.writeFileSync(f, c);
console.log("Fixed queue.ts");
