import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transformSync } from '@swc/core';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';

test('drawer closes on navigation and stays closed when returning', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  let pathname = '/admin';
  const source = fs.readFileSync(new URL('../../src/components/workbench/WorkbenchShell.tsx', import.meta.url), 'utf8');
  const code = transformSync(source, { filename: 'WorkbenchShell.tsx', jsc: { parser: { syntax: 'typescript', tsx: true }, target: 'es2022', transform: { react: { runtime: 'classic' } } }, module: { type: 'commonjs' } }).code;
  const module = { exports: {} };
  const mocks = {
    react: React,
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    'next/navigation': { usePathname: () => pathname },
    './SidebarNav': { SidebarNav: () => null },
    '@/lib/workbench/panels': { panelFromPath: () => ({ key: 'overview', labelZh: 'Overview' }) },
    '@/lib/utils': { cn: (...parts) => parts.filter(Boolean).join(' ') },
  };
  new Function('require', 'module', 'exports', code)(name => {
    if (!(name in mocks)) throw new Error(`Unexpected dependency ${name}`);
    return mocks[name];
  }, module, module.exports);
  const { WorkbenchShell } = module.exports;
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const render = () => root.render(React.createElement(WorkbenchShell, { basePath: '/admin', children: 'Panel' }));
  try {
    await React.act(render);
    await React.act(() => container.querySelector('[aria-label="Open navigation"]').click());
    assert.ok(container.querySelector('[aria-expanded="true"]'));
    pathname = '/admin/seo';
    await React.act(render);
    assert.equal(container.querySelector('[aria-expanded="true"]'), null);
    pathname = '/admin';
    await React.act(render);
    assert.equal(container.querySelector('[aria-expanded="true"]'), null);
  } finally {
    await React.act(() => root.unmount());
    dom.window.close();
  }
});
