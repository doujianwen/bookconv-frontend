import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
  try {
    // 测试带联网搜索的模型
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      tools: [{ googleSearch: {} }]  // 开启联网搜索
    });
    
    const result = await model.generateContent('bookconv.com 是什么网站？用一句话回答');
    const response = await result.response;
    const text = response.text();
    const candidates = response.candidates || [];
    
    console.log('API响应:', text.slice(0, 500));
    console.log('候选数:', candidates.length);
    if (candidates[0]?.groundingMetadata?.searchEntryPoint) {
      console.log('✅ 联网搜索已启用');
    } else {
      console.log('⚠️ 可能未触发联网搜索');
    }
    return true;
  } catch (error) {
    console.error('❌ 错误:', error.message);
    return false;
  }
}

test();
