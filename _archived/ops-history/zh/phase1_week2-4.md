## Week 2-3: 工具页面建设

### KD=0 关键词页面优先级排序

| 优先级 | 关键词 | 月流量 | 页面类型 | 内容要求 |
|--------|--------|--------|----------|----------|
| S1 | lit to epub | 10.8K | 工具页+科普 | 视频+对比表 |
| S2 | epub to txt | 6.5K | 工具页+科普 | 视频教程 |
| S3 | epub to pdf | 6.8K | 工具页+科普 | 深度教程 |
| A1 | epub to azw3 | 中 | 工具页+科普 | FAQ Schema |
| A2 | azw3 to epub | 中 | 工具页+科普 | FAQ Schema |
| A3 | mobi to epub | 1.6K | 工具页+科普 | FAQ Schema |
| B1 | fb2 to epub | 242 | 工具页 | 基础科普 |
| B2 | epub to rtf | 低 | 工具页 | 基础科普 |
| B3 | epub to png | 低 | 工具页 | 基础科普 |
| B4 | azw3 to mobi | 低 | 工具页 | 基础科普 |
| B5 | mobi to txt | 低 | 工具页 | 基础科普 |
| B6 | rtf to epub | 低 | 工具页 | 基础科普 |
| B7 | epub to pdf linux | 低 | 教程页 | Linux教程 |

### 每个页面必须包含
1. 转换工具区域: 上传 → 选择格式 → 转换 → 下载
2. 格式科普 (800-1000字): 格式简介、历史背景、使用场景、优缺点
3. FAQ Schema (5-8个问题): 如何转换、格式定义、质量、批量、大小限制
4. 相关转换推荐: 页面底部推荐3-5个相关转换
5. 使用教程: 步骤说明 + 截图

### FAQ Schema 代码示例 (JSON-LD)
在 head 中添加:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How to convert EPUB to TXT?",
    "acceptedAnswer": { "@type": "Answer", "text": "Upload your EPUB file, select TXT as output format, click Convert." }
  }]
}
```

## Week 3-4: 扩展外链

### Hacker News Show HN
- [ ] 标题模板: "Show HN: I built a free online ebook converter with no limits"
- [ ] 正文: 项目简介 + 技术栈 + 核心特点 + 链接
- [ ] 发布时间: 美国东部时间周二/周三/周四上午9点
- [ ] 准备回复评论 (保持活跃)

### IndieHackers 发布
- [ ] 注册 IndieHackers
- [ ] 发布项目: "Free Ebook Converter - 28+ formats, no signup"
- [ ] 描述角度: 创业故事 + 技术选型

### DEV.to 文章
- [ ] 注册 DEV.to
- [ ] 撰写: "Building a Free Ebook Converter with Next.js + Calibre"
- [ ] 标签: #javascript #nextjs #calibre #opensource

### 工具目录提交 (续)
- [ ] 继续提交到其他目录站
- [ ] 重点: 电子书相关目录 (如果有)
