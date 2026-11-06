import { GoogleGenAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenAI(GEMINI_API_KEY);

async function test(prompt) {
  try {
    const result = await genAI.generateContent({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
      contents: prompt
    });
    const response = result.response;
    const text = response.text();
    
    // 检查 grounding metadata
    const candidates = response.candidates || [];
    const hasGrounding = candidates[0]?.groundingMetadata?.searchEntryPoint !== undefined;
    const groundingChunks = candidates[0]?.groundingMetadata?.groundingChunks || [];
    
    console.log('=== 提示词:', prompt, '===');
    console.log('响应长度:', text.length, '字符');
    console.log('联网搜索:', hasGrounding ? '✅ 已触发' : '❌ 未触发');
    console.log('来源数量:', groundingChunks.length);
    if (groundingChunks.length > 0) {
      console.log('来源示例:', groundingChunks.slice(0, 3).map(c => c.web?.uri).join(', '));
    }
    console.log('答案前500字:', text.slice(0, 500));
    console.log('');
    return { success: true, text, hasGrounding, groundingCount: groundingChunks.length };
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.details?.code) console.error('错误码:', error.details.code);
    if (error.details?.message) console.error('错误详情:', error.details.message);
    return { success: false, error: error.message };
  }
}

// 测试三个典型问题
await test('best free online ebook converter');
console.log('\n---\n');
await test('azw3 vs mobi which is better for kindle');
console.log('\n---\n');
await test('convert epub to zip file online free');
