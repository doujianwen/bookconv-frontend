import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test(prompt, withSearch = false) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    tools: withSearch ? [{ googleSearch: {} }] : undefined
  });
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const candidates = response.candidates || [];
    const hasGrounding = candidates[0]?.groundingMetadata?.searchEntryPoint !== undefined;
    const groundingChunks = candidates[0]?.groundingMetadata?.groundingChunks || [];
    
    console.log('=== [', withSearch ? '联网' : '无联网', '] ===');
    console.log('提示词:', prompt.slice(0, 50));
    console.log('响应:', text.slice(0, 300));
    console.log('Grounding:', hasGrounding ? '✅' : '❌', '| 来源数:', groundingChunks.length);
    if (groundingChunks.length > 0) {
      console.log('来源:', groundingChunks.slice(0, 2).map(c => c.web?.uri || c?.source?.id).join(', '));
    }
    console.log('');
    return { text, hasGrounding, groundingCount: groundingChunks.length };
  } catch (error) {
    console.error('❌ 错误:', error.message);
    return null;
  }
}

console.log('测试1: bookconv.com 介绍');
await test('what is bookconv.com?', false);

console.log('测试2: best free online ebook converter');
await test('best free online ebook converter', true);

console.log('测试3: azw3 vs mobi');
await test('azw3 vs mobi which is better for kindle', true);
