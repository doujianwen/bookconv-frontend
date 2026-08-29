# Phase 1: 冷启动外链 (Week 1-4) - 详细执行步骤

## Week 1: 平台注册与基础建设

### Day 1-2: Product Hunt 提交
- [ ] 注册 Product Hunt 账号 (用 Twitter/Google 登录)
- [ ] 创建 Product Hunt "Coming Soon" 页面: https://www.producthunt.com/staging
- [ ] 准备素材:
  - Logo: 128x128 PNG
  - 封面图: 1160x628 (强调 "Free, No signup, Unlimited")
  - 演示GIF: 30秒展示转换流程
  - 标签: #ebook #converter #free #opensource
- [ ] 撰写 PH 描述 (英文):
  标题: "EbookConverter - Free, Unlimited E-book Format Conversion"
  正文: "A free online ebook converter that supports 28+ formats including EPUB, MOBI, AZW3, LIT, CBR. No signup required, no file size limits. Built with Calibre engine for maximum compatibility."
- [ ] 选择 launch date (建议周三/周四上午)

### Day 3-4: AlternativeTo 提交
- [ ] 访问 https://www.alternative.to/file-converter
- [ ] 搜索 "File Converter" 找到对应页面
- [ ] 提交你的产品: Product name: EbookConverter, URL, Category: File Conversion, Description, Tags: ebook, converter, epub
- [ ] 等待审核 (通常1-3天)

### Day 5-7: GitHub 仓库搭建
- [ ] 创建仓库: ebook-converter-engine
- [ ] 公开核心代码: Calibre wrapper, Format mapping table, Error handling
- [ ] README.md 包含: 项目简介 + 技术栈 + 工具链接 + License (MIT)
- [ ] 添加 GitHub Actions CI + 设置 repository topics
