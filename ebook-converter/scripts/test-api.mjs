// Test script for production API
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  const API_URL = 'https://www.bookconv.com/api/convert';
  const EPUB_PATH = path.join(__dirname, '..', 'tests', 'fixtures', 'test-content.epub');

  // Read test EPUB
  const buffer = fs.readFileSync(EPUB_PATH);
  console.log('Test EPUB size:', buffer.length, 'bytes');

  // Test 1: epub-to-txt with FormData
  console.log('\n=== Test 1: epub-to-txt (FormData) ===');
  try {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: 'application/epub+zip' }), 'test.epub');
    form.append('source_format', 'epub');
    form.append('target_format', 'txt');

    const r = await fetch(API_URL, { method: 'POST', body: form });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response:', text.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }

  // Test 2: epub-to-pdf
  console.log('\n=== Test 2: epub-to-pdf (FormData) ===');
  try {
    const form2 = new FormData();
    form2.append('file', new Blob([buffer], { type: 'application/epub+zip' }), 'test.epub');
    form2.append('source_format', 'epub');
    form2.append('target_format', 'pdf');

    const r = await fetch(API_URL, { method: 'POST', body: form2 });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response:', text.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }

  // Test 3: epub-to-zip
  console.log('\n=== Test 3: epub-to-zip (FormData) ===');
  try {
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: 'application/epub+zip' }), 'test.epub');
    form.append('source_format', 'epub');
    form.append('target_format', 'zip');

    const r = await fetch(API_URL, { method: 'POST', body: form });
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    console.log('Content-Disposition:', r.headers.get('content-disposition'));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test().catch(console.error);
