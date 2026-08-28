// ai-audit.js - 运维审计脚本（修复版）
// 修复说明：
//   1. BLOG_DIR / LOG_FILE 路径修正（原双重 ebook-converter 导致找不到目录、日志写错位置）
//   2. Redis 连不上时不再用随机数冒充队列长度，如实报告 unknown
//   3. webhook 外置到环境变量 / .feishu-webhook 文件，不再硬编码
//   4. success rate 无日志来源时标注 "assumed"，不假装真实
const fs = require("fs");
const path = require("path");

// === 配置 ===
// 本文件位于 ebook-converter/scripts/，".."" 回到 ebook-converter/
const BLOG_DIR = path.join(__dirname, "..", "src", "app", "blog");
// 日志统一写到仓库根 logs/（与历史日志位置一致）
const LOG_FILE = path.join(__dirname, "..", "..", "logs", "ai-operation.txt");
const MAX_QUEUE_SIZE = 50;

// 确保日志目录存在
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// === webhook 读取（env 优先 > 配置文件 > 未配置则跳过推送）===
function getWebhook() {
  if (process.env.FEISHU_WEBHOOK) return process.env.FEISHU_WEBHOOK;
  const cfg = path.join(__dirname, ".feishu-webhook");
  if (fs.existsSync(cfg)) {
    const v = fs.readFileSync(cfg, "utf8").trim();
    if (v) return v;
  }
  return null;
}

// === 飞书通知 ===
async function pushFeishy(title, body) {
  const webhook = getWebhook();
  if (!webhook) {
    console.log("⚠ 未配置 webhook（FEISHU_WEBHOOK 环境变量或 .feishu-webhook 文件），跳过飞书推送");
    return;
  }
  try {
    console.log("Sending to Feishu...");
    const messageText = title + "\n" + body + "\n[关键词: 电子书格式]";
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msg_type: "text",
        content: { text: messageText }
      })
    });
    if (res.ok) {
      console.log("✅ Feishu delivered successfully");
    } else {
      console.log("❌ Non-200 response:", res.status);
    }
  } catch (e) {
    console.error("❗ Push error:", e.message);
  }
}

// === 博客数量检查 ===
async function checkBlogCount() {
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      console.log("Blog dir not found:", BLOG_DIR);
      return 0;
    }
    const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
    const fileCount = entries.filter(f => f.isFile() && f.name.endsWith(".mdx")).length;
    console.log("Blog directory has", entries.length, "entries,", fileCount, "mdx files");
    return fileCount;
  } catch (e) {
    console.error("Blog dir check error:", e.message);
    return 0;
  }
}

// === Redis 队列检查（连不上时如实报告 unknown，不造假数据）===
async function getRealQueueSize() {
  try {
    const { createClient } = require("redis");
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const client = createClient({ url: redisUrl });
    await client.connect();
    const size = await client.llen("conversion:queue");
    await client.quit();
    console.log("✅ Real Redis queue size:", size);
    return { size, available: true };
  } catch (e) {
    // 修复：不再用 Math.random() 冒充队列长度，如实报告 Redis 不可用
    console.log("⚠ Redis not available:", e.message);
    return { size: null, available: false };
  }
}

// === 转换成功率分析（无日志来源时标注 assumed）===
async function getConversionSuccessRate() {
  const logPatterns = [
    path.join(__dirname, "..", "..", "logs", "conversion.log"),
    path.join(__dirname, "..", "logs", "app.log"),
    path.join(__dirname, "..", "src", "lib", "logger.log")
  ];

  for (const logPath of logPatterns) {
    if (fs.existsSync(logPath)) {
      try {
        const content = fs.readFileSync(logPath, "utf8");
        const totalJobs = (content.match(/job id:/gi) || []).length;
        const succeeded = (content.match(/succeeded|completed|success/gi) || []).length;
        const failed = (content.match(/failed|error|exception/gi) || []).length;

        if (totalJobs > 0) {
          const rate = Math.round(succeeded / totalJobs * 100);
          console.log("Log analysis:", totalJobs, "jobs,", succeeded, "succ,", failed, "fail,", rate, "%");
          return { rate, source: "log" };
        }
      } catch (e) {
        console.log("Error reading log:", e.message);
      }
    }
  }

  // 无日志可分析，标注为假设值
  console.log("⚠ No conversion log found, using assumed rate");
  return { rate: 95, source: "assumed" };
}

// === 主审计流程 ===
async function main() {
  console.log("=== AI Operations Audit ===");
  const now = new Date();
  const dateStr = now.toLocaleDateString();

  const blogCount = await checkBlogCount();
  const queue = await getRealQueueSize();
  const success = await getConversionSuccessRate();

  let status = "ok";
  const alerts = [];

  if (blogCount === 0) {
    status = "warning";
    alerts.push("⚠ No blog posts yet");
  }
  // 队列：仅在 Redis 真实可用且超阈值时才 critical；不可用时仅 warning
  if (queue.available && queue.size > MAX_QUEUE_SIZE) {
    status = "critical";
    alerts.push("⚠ Queue overflow: " + queue.size + " items");
  }
  if (!queue.available) {
    status = "warning";
    alerts.push("⚠ Redis 不可用，队列长度未知（非随机猜测）");
  }
  if (success.source === "log" && success.rate < 80) {
    status = "warning";
    alerts.push("⚠ Low success rate: " + success.rate + "%");
  }

  const queueLabel = queue.available ? String(queue.size) : "unknown (Redis 不可用)";
  const rateLabel = success.rate + "% (" + (success.source === "log" ? "日志统计" : "假设值，无日志") + ")";

  const reportLines = [
    "🤖 AI Ops Report - " + dateStr,
    "Time: " + now.toISOString(),
    "------------------------",
    "Blog posts: " + blogCount,
    "Queue size: " + queueLabel,
    "Success rate: " + rateLabel,
    ...alerts,
    "------------------------",
    "Status: " + (status === "ok" ? "✅ All good" : status === "warning" ? "⚠ Warnings" : "❗ CRITICAL!"),
    "------------------------"
  ].join("\n");

  console.log(reportLines);

  fs.appendFileSync(LOG_FILE, reportLines + "\n");
  console.log("✅ Log written:", LOG_FILE);

  await pushFeishy("Daily Audit - 电子书格式转换站", reportLines);

  console.log("Done");
  process.exit(status === "ok" ? 0 : 1);
}

main().catch(e => {
  console.error("❗ Audit crashed:", e);
  fs.appendFileSync(LOG_FILE, "CRASH: " + e.message + "\n");
  process.exit(1);
});
