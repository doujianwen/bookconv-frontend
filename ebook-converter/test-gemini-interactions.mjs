import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testInteractions(prompt, withSearch = false) {
  try {
    // 使用 Interactions API（新推荐方式）
    const result = await genAI.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: withSearch ? [{ googleSearch: {} }] : undefined
    });
    
    const response = result.response;
    const text = response.text();
    const candidates = response.candidates || [];
    const hasGrounding = candidates[0]?.groundingMetadata?.searchEntryPoint !== undefined;
    const groundingChunks = candidates[0]?.groundingMetadata?.groundingChunks || [];
    
    return { 
      success: true, 
      text, 
      hasGrounding, 
      groundingCount: groundingChunks.length,
      sources: groundingChunks.map(c => c.web?.uri).filter(Boolean).slice(0, 3)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 测试三个问题
console.log('=== 测试1: best free online ebook converter（联网）===');
let r = await testInteractions('best free online ebook converter', true);
console.log('成功:', r.success);
if (r.success) {
  console.log('联网搜索:', r.hasGrounding ? '✅' : '❌');
  console.log('来源数:', r.groundingCount);
  console.log('答案:', r.text.slice(0, 400));
  if (r.sources.length > 0) console.log('来源:', r.sources.join(', '));
} else {
  console.log('错误:', r.error);
}

console.log('\n=== 测试2: azw3 vs mobi（联网）===');
r = await testInteractions('azw3 vs mobi which is better for kindle', true);
console.log('成功:', r.success);
if (r.success) {
  console.log('联网搜索:', r.hasGrounding ? '✅' : '❌');
  console.log('来源数:', r.groundingCount);
  console.log('答案:', r.text.slice(0, 400));
}

console.log('\n=== 测试3: 无联网搜索 ===');
r = await testInteractions('what is bookconv.com', false);
console.log('成功:', r.success);
if (r.success) {
  console.log('答案:', r.text.slice(0, 400));
}
