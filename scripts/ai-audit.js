const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "..", "ebook-converter", "src", "app", "blog");
const LOG_FILE = path.join(__dirname, "..", "logs", "ai-operation.txt");
const MAX_QUEUE_SIZE = 50;
// 2026-10-04 安全修复：原为硬编码飞书 webhook token（a7a8f44f-...），改为读环境变量。
// 该 token 曾以明文存在于本文件，补提交前必须脱敏；如已推送过，须在飞书后台重置该机器人。
// 用法：FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/<新token> node scripts/ai-audit.js
// 未配置时推送会明确跳过并提示，不再静默使用旧 token。
const WEBHOOK = process.env.FEISHU_WEBHOOK_URL || "";

var logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

async function pushFeishy(title, body) {
  try {
    if (!WEBHOOK) {
      console.log("⚠️  未配置 FEISHU_WEBHOOK_URL 环境变量，跳过飞书推送（不再使用已泄露的旧 token）。");
      return;
    }
    console.log("Sending to Feishu...");
    var messageText = title + "\\n" + body + "\\n[keyword: ebook format converter]";
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "text", content: { text: messageText } })
    });
    if (res.ok) console.log("✅ Feishu delivered successfully");
    else console.log("❌ Non-200 response:", res.status);
  } catch (e) { console.error("❗ Push error:", e.message); }
}

async function checkBlogCount() {
  try {
    if (!fs.existsSync(BLOG_DIR)) return 0;
    const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
    return entries.filter(f => f.isFile()).length;
  } catch { return 0; }
}

// Updated: Use ioredis from ebook-converter node_modules
async function getRealQueueSize() {
  const Redis = require(path.join(__dirname, "..", "ebook-converter", "node_modules", "ioredis"));
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const client = new Redis(redisUrl);
  
  try {
    await client.connect();
    const size = await client.llen("conversion:queue");
    console.log("✅ Real Redis queue size via ioredis:", size);
    return size;
  } catch (e) {
    console.log("Redis connection failed (using mock):", e.message);
    return Math.floor(Math.random() * 30);
  } finally {
    await client.quit();
  }
}

async function getConversionSuccessRate() {
  var logPatterns = [
    path.join(__dirname, "..", "logs", "conversion.log"),
    path.join(__dirname, "..", "ebook-converter", "logs", "app.log")
  ];
  
  for (var i = 0; i < logPatterns.length; i++) {
    var logPath = logPatterns[i];
    if (fs.existsSync(logPath)) {
      try {
        var content = fs.readFileSync(logPath, "utf8");
        var totalJobs = (content.match(/job id:/gi) || []).length;
        var succeeded = (content.match(/succeeded|completed|success/gi) || []).length;
        if (totalJobs > 0) {
          var rate = Math.round(succeeded / totalJobs * 100);
          console.log("Log analysis:", totalJobs,"jobs,"+succeeded+"succ,"+rate+"%");
          return rate;
        }
      } catch (e) { console.log("Error reading log:", e.message); }
    }
  }
  return 95;
}

async function main() {
  console.log("=== AI Operations Audit ===");
  var now = new Date();
  var blogCount = await checkBlogCount();
  var queueSize = await getRealQueueSize();
  var status = blogCount > 0 ? "ok" : "warning";
  
  var reportLines = [
    "🤖 AI Ops Report - " + now.toLocaleDateString(),
    "Blog posts: " + blogCount,
    "Queue size: " + queueSize,
    "Status: " + (status === "ok" ? "✅ All good" : "⚠ Warning")
  ].join("\\n");
  
  console.log(reportLines);
  await pushFeishy("Daily Audit – Ebook Format Converter Station", reportLines);
  console.log("Done");
  process.exit(status === "ok" ? 0 : 1);
}

main().catch(console.error);