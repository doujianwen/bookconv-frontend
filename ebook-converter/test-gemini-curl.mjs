import { execFileSync } from 'child_process';

const API_KEY = 'AIzaSyD4TmjFsFetH6eSpn4AjtQ91t3NKShGxzs';

// 测试1: 列出可用模型
console.log('=== 1. 列出可用模型 ===');
try {
  const result = execFileSync('curl', [
    '-s',
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
  ], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  const models = JSON.parse(result);
  console.log('可用模型:', models.models?.slice(0, 5).map(m => m.name).join(', ') || '无');
} catch (error) {
  console.error('列模型失败:', error.message);
}

// 测试2: 简单生成内容（无搜索）
console.log('\n=== 2. 简单生成（无搜索）===');
try {
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: '你好，请回复"OK"' }] }]
  });
  const result = execFileSync('curl', [
    '-s',
    '-X', 'POST',
    '-H', 'Content-Type: application/json',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    '--data', body
  ], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  const response = JSON.parse(result);
  if (response.candidates) {
    console.log('✅ 成功');
    console.log('响应:', response.candidates[0]?.content?.parts?.[0]?.text?.slice(0, 100));
  } else {
    console.log('❌ 错误:', response?.error?.message || result.slice(0, 200));
  }
} catch (error) {
  console.error('生成失败:', error.message);
}

// 测试3: 带联网搜索的生成
console.log('\n=== 3. 带联网搜索的生成 ===');
try {
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'best free online ebook converter' }] }],
    tools: [{ googleSearch: {} }]
  });
  const result = execFileSync('curl', [
    '-s',
    '-X', 'POST',
    '-H', 'Content-Type: application/json',
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    '--data', body
  ], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  const response = JSON.parse(result);
  if (response.candidates) {
    console.log('✅ 成功');
    const text = response.candidates[0]?.content?.parts?.[0]?.text || '';
    const grounding = response.candidates[0]?.groundingMetadata || {};
    console.log('联网搜索:', grounding.searchEntryPoint ? '✅ 已触发' : '❌ 未触发');
    console.log('来源数:', (grounding.groundingChunks || []).length);
    console.log('答案:', text.slice(0, 400));
  } else {
    console.log('❌ 错误:', response?.error?.message || result.slice(0, 200));
  }
} catch (error) {
  console.error('生成失败:', error.message);
}
