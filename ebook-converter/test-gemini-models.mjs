import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 列出可用模型
try {
  const models = await genAI.listModels();
  console.log('可用模型列表:');
  models.models.forEach(m => {
    console.log(`  - ${m.name} (${m.description?.slice(0, 50) || 'N/A'})`);
  });
} catch (error) {
  console.error('列模型失败:', error.message);
}

// 尝试不同的模型名称
const testModels = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-pro'
];

console.log('\n=== 测试各模型 ===\n');
for (const modelName of testModels) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('你好，请回复"OK"');
    console.log(`✅ ${modelName}: 响应=${result.response.text().slice(0, 30)}`);
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message.slice(0, 80)}`);
  }
}
