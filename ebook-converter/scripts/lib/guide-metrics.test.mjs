import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guideMetrics } from './guide-metrics.mjs';

test('equivalent TS and quoted JSON-style guide fields produce equal metrics', () => {
  const a = "export const keyTakeaways = ['one','two','three']; export const content = {intro:'Intro',sections:[{heading:'Check output',body:'Check the opening paragraph and final chapter.'}]}; export const faqs=[{question:'How?',answer:'Read.'}]; export const authorship={lastVerified:'2026-11-01',credentials:'Review'};";
  const b = 'export const keyTakeaways = ["one","two","three"]; export const content = {"intro":"Intro","sections":[{"heading":"Check output","body":"Check the opening paragraph and final chapter."}]}; export const faqs=[{"question":"How?","answer":"Read."}]; export const authorship={"lastVerified":"2026-11-01","credentials":"Review"};';
  assert.deepEqual(guideMetrics(a), guideMetrics(b));
  assert.equal(guideMetrics(a).faqCount, 1);
});
test('invalid and empty source cannot masquerade as a populated guide', () => {
  assert.throws(() => guideMetrics('export const content = { sections: [;'), /parse errors/);
  assert.equal(guideMetrics('export const content = {};').wordCount, 0);
});
test('Spanish mirrors cannot inflate the primary guide depth', () => {
  const r = guideMetrics("export const content={sections:[{heading:'English',body:'English content here.'}]}; export const es={sections:[{heading:'Español',body:'Additional translated content.'}]};");
  assert.deepEqual(r.headings, ['English']);
  assert.equal(r.wordCount, 2);
});
