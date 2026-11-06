import { GoogleGenAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenAI(GEMINI_API_KEY);

async function test() {
  try {
    // 测试基础调用（不开联网搜索）
    const result = await genAI.generateContent({
      model: 'gemini-2.5-flash',
      contents: '你好，请回复"测试成功"'
    });
    console.log('✅ 基础调用成功');
    console.log('响应:', result.response.text().slice(0, 200));
    
    // 测试带联网搜索的调用
    const result2 = await genAI.generateContent({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
      contents: 'bookconv.com 是什么网站？用一句话回答'
    });
    console.log('\n✅ 联网搜索调用成功');
    console.log('响应:', result2.response.text().slice(0, 500));
    
    // 检查 grounding metadata
    const candidates = result2.response.candidates || [];
    if (candidates[0]?.groundingMetadata?.searchEntryPoint) {
      console.log('\n🔍 联网搜索已触发，找到 grounding metadata');
    } else {
      console.log('\n⚠️ 未检测到 grounding metadata，可能未触发搜索');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.details) console.error('详情:', JSON.stringify(error.details, null, 2));
    return false;
  }
}

test();
