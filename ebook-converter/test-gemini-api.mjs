import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
  try {
    // 测试模型列表
    const models = await genAI.listModels();
    console.log('模型列表（前5个）:', models.models.slice(0, 5).map(m => m.name).join(', '));
    
    // 测试简单调用（不开联网搜索）
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('你好，请回复"测试成功"');
    const response = await result.response;
    console.log('API响应:', response.text().slice(0, 200));
    console.log('✅ Gemini API 可用');
    return true;
  } catch (error) {
    console.error('❌ Gemini API 错误:', error.message);
    console.error('完整错误:', error);
    return false;
  }
}

test();
