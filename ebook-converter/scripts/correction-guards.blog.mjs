// scripts/correction-guards.blog.mjs
//
// bookconv 领域守卫 —— 把《英文博客写作指南》里「可确定性校验」的规则
// 翻译成代码检查。这是「通用纠错智能体」在 bookconv 的项目判据插槽
// （对应扫描项目的 correction-guards.js）。
//
// 设计：只挑刺、不修改。每个候选已带好派生指标（wordCount / internalLinks /
// externalLinks / faqCount / hasKeyTakeaways / titleHasSlugToken / introHasTopic /
// deAiHits / topKeywordDensity），本文件只比对阈值并调 ctx.BLOCK/WARN/INFO。
//
// 信息隔离：本文件不 require 任何生产方打分/排序逻辑，只消费 critic-layer
// 传入的原始候选 + 派生指标，杜绝「被主流方向带偏」。

/**
 * @param {Array<object>} candidates
 * @param {object} ctx  { cfg, BLOCK, WARN, INFO }
 */
export function projectGuards(candidates, ctx) {
  for (const c of candidates) {
    ctx.current = c; // 供 ctx.BLOCK 判定变更范围（GATE_SLUGS）
    checkFaq(c, ctx);
    checkKeyTakeaways(c, ctx);
    checkTitle(c, ctx);
    checkIntroTopic(c, ctx);
    checkLinks(c, ctx);
    checkDeAi(c, ctx);
    checkThin(c, ctx);
    checkAuthor(c, ctx);
    checkKeywordStuffing(c, ctx);
  }
}

function checkFaq(c, ctx) {
  const min = (ctx.cfg.faq && ctx.cfg.faq.minCount) || 5;
  if (c.faqCount === 0) {
    ctx.BLOCK('内容质量/GEO缺失',
      `博文 ${c.slug} 无 FAQ 段落（写作指南 7.2 强制 5-7 条 PAA 问答）`,
      '缺 FAQ = 失去 GEO 可引用片段 + FAQPage 结构化数据，AI 引擎无法抽取直接答案。须补 5-7 条 FAQ。');
    return;
  }
  if (c.faqCount < min) {
    ctx.WARN('内容质量/GEO',
      `博文 ${c.slug} 仅 ${c.faqCount} 条 FAQ（指南要求 ≥${min}）`,
      'FAQ 偏少，GEO 可抽取问答不足。建议补到 5-7 条。');
  }
}

function checkKeyTakeaways(c, ctx) {
  if (!c.hasKeyTakeaways) {
    ctx.BLOCK('内容质量/GEO缺失',
      `博文 ${c.slug} 无 "Key Takeaways" 段落（写作指南 7.1 强制）`,
      'Key Takeaways 是 GEO 可引用摘要的核心块。须加 3-6 条带数据的要点。');
  }
}

function checkTitle(c, ctx) {
  const t = (c.title || '').trim();
  const max = (ctx.cfg.title && ctx.cfg.title.maxLen) || 60;
  const min = (ctx.cfg.title && ctx.cfg.title.minLen) || 20;
  if (t.length > max) {
    ctx.WARN('SEO/标题',
      `博文 ${c.slug} 标题 ${t.length} 字（指南 meta title ≤${max}，且全局会追加上 "| BookConv"）`,
      '标题过长，SERP 会被截断且超出指南上限。建议压到 ${max} 字内。');
  } else if (t.length > 0 && t.length < min) {
    ctx.WARN('SEO/标题',
      `博文 ${c.slug} 标题仅 ${t.length} 字（指南建议 ≥${min}）`,
      '标题过短，未充分利用主关键词前置空间。');
  }
  if (!c.titleHasSlugToken) {
    ctx.WARN('SEO/标题-关键词',
      `博文 ${c.slug} 标题未含 slug 主题词（slug=${c.slug}）`,
      '标题应前置主关键词（slug 即主关键词的连字符形式）。标题与 URL 主题不一致会稀释排名。');
  }
}

function checkIntroTopic(c, ctx) {
  if (!c.introHasTopic) {
    ctx.WARN('SEO/首段',
      `博文 ${c.slug} 首 100 词未出现主关键词/主题词`,
      '写作指南要求首 100 词内提及主关键词并直接回答查询意图。前 100 词无主题词会拖慢相关性信号。');
  }
}

function checkLinks(c, ctx) {
  const wc = c.wordCount || 0;
  const minInt = (ctx.cfg.wordCount && ctx.cfg.wordCount.minPer1000Internal) || 2;
  const minExt = (ctx.cfg.wordCount && ctx.cfg.wordCount.minExternal) || 1;
  if (wc >= 1000 && c.internalLinks < minInt) {
    ctx.WARN('SEO/内链',
      `博文 ${c.slug} 字数 ${wc} 但仅 ${c.internalLinks} 条内链（指南 2-4/1000 词）`,
      '内链不足，权重无法在站内流转，相关支柱页得不到支撑。');
  } else if (wc > 600 && c.internalLinks === 0) {
    ctx.WARN('SEO/内链',
      `博文 ${c.slug} 无任何内链`,
      '至少应有一条上下文内链指向相关转换/指南页。');
  }
  if (c.externalLinks < minExt) {
    ctx.WARN('E-E-A-T/外链',
      `博文 ${c.slug} 无权威外链（指南要求 3-5 条 .gov/.edu/权威媒体）`,
      '无外链削弱可信度信号；YMYL 类更需权威来源支撑。');
  }
}

function checkDeAi(c, ctx) {
  if (c.deAiHits && c.deAiHits.length > 0) {
    const uniq = [...new Set(c.deAiHits)];
    ctx.WARN('去AI/机械感',
      `博文 ${c.slug} 检出 ${uniq.length} 类 AI 套话：${uniq.slice(0, 6).join('、')}${uniq.length > 6 ? '…' : ''}`,
      '写作指南第 9 节要求发布前去除 AI 词汇（leverage/utilize/delve/landscape 等）。未去 AI 易被识别为机器文，损害可读性。');
  }
}

function checkThin(c, ctx) {
  const thin = (ctx.cfg.wordCount && ctx.cfg.wordCount.thinWarn) || 800;
  if ((c.wordCount || 0) < thin) {
    ctx.WARN('内容质量/薄内容',
      `博文 ${c.slug} 仅 ${c.wordCount} 词（指南同类型 ≥${thin}）`,
      '内容偏薄，难覆盖搜索意图，竞争页通常为 1200-2500+ 词。建议扩充深度。');
  }
}

function checkAuthor(c, ctx) {
  if (!c.author || !c.author.trim()) {
    ctx.WARN('E-E-A-T/作者',
      `博文 ${c.slug} 缺 author 字段`,
      '写作指南 5.2 要求作者署名 + 资历，缺失削弱 E-E-A-T 可信度。');
  }
}

function checkKeywordStuffing(c, ctx) {
  if (c.topKeywordDensity > 0.03) {
    ctx.WARN('SEO/关键词堆砌',
      `博文 ${c.slug} 主关键词密度 ${(c.topKeywordDensity * 100).toFixed(1)}%（>3% 疑似堆砌）`,
      '关键词密度过高触发堆砌判定，可能被降权。建议自然分布、用 LSI 词替换。');
  }
}
