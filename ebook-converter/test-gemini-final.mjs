import { execFileSync } from 'child_process';

const API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const MODEL = 'gemini-2.5-flash';

async function generate(prompt, withSearch = false) {
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(withSearch ? { tools: [{ googleSearch: {} }] } : {})
  });
  
  try {
    const result = execFileSync('curl', [
      '-s',
      '-X', 'POST',
      '-H', 'Content-Type: application/json',
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      '--data', body
    ], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    
    const response = JSON.parse(result);
    if (response.candidates) {
      const text = response.candidates[0]?.content?.parts?.[0]?.text || '';
      const grounding = response.candidates[0]?.groundingMetadata || {};
      const chunks = grounding.groundingChunks || [];
      return { 
        success: true, 
        text, 
        hasGrounding: !!grounding.searchEntryPoint,
        groundingCount: chunks.length,
        sources: chunks.map(c => c.web?.uri).filter(Boolean)
      };
    } else {
      return { success: false, error: response.error?.message || result.slice(0, 300) };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 测试问题
const tests = [
  { prompt: 'best free online ebook converter', search: true, desc: '找工具类' },
  { prompt: 'azw3 vs mobi which is better for kindle', search: true, desc: '格式对比' },
  { prompt: 'convert epub to zip file online free', search: true, desc: '原理类' },
  { prompt: 'how to convert lit to epub', search: true, desc: '操作类' },
  { prompt: 'epub to word converter online free', search: true, desc: '格式转换' },
  { prompt: 'kfx vs azw3 which format should i use for kindle', search: true, desc: '格式对比2' },
  { prompt: 'convertir epub a doc online gratis', search: true, desc: '西语' }
];

console.log('=== Gemini API 实测（带联网搜索）===\n');

for (const t of tests) {
  console.log(`【${t.desc}】${t.prompt}`);
  const r = await generate(t.prompt, true);
  if (r.success) {
    console.log(`  ✅ 成功 | 长度:${r.text.length} | 联网搜索:${r.hasGrounding ? '✅' : '❌'} | 来源:${r.groundingCount}个`);
    if (r.sources.length > 0) console.log(`     来源: ${r.sources.join(', ')}`);
    
    // 检查是否提到 bookconv
    const hasBookconv = /bookconv/i.test(r.text);
    console.log(`     BookConv提及:${hasBookconv ? '✅' : '❌'}`);
    
    // 打印答案前300字
    console.log(`     答案片段: ${r.text.slice(0, 200).replace(/\n/g, ' ')}...`);
  } else {
    console.log(`  ❌ 失败: ${r.error}`);
  }
  console.log('');
}
