# R5: Kindle 子簇内链集权

> 执行时间：2026-08-11
> Commit：`4f6a13b`
> 状态：本地已 commit，待用户本地 push

## 目标

立 `/guide/kindle-formats` 为 Kindle 子簇支柱页，打通 5 个卫星页的内链指向，形成 hub-and-spoke 结构，避免多页争同一意图。

## 改动清单

### 支柱页（新增）
- `src/data/guides/kindle-formats.ts`
  - 新增「Related guides for your specific situation」段，4 条内链指向卫星页
  - 新增「Start converting now」段，2 条钱页 CTA 内链

### 卫星页（强化指向支柱）
- `src/data/blog/can-kindle-read-azw3.ts`：intro 末尾加指向 kindle-formats 的内链（EN + ES）
- `src/data/blog/why-ebook-wont-open-kindle.ts`：intro 段加强化指向 + 修复段加指向
- `src/data/blog/mobi-to-kobo.ts`：跨生态段加指向 `epub-to-azw3-for-kindle`
- `src/data/guides/epub-to-azw3-for-kindle.ts`：What Is AZW3 段改指向支柱而非 azw3-vs-mobi

## 最终内链结构

```
/convert/epub-to-azw3 (钱页)
       ▲
  /guide/kindle-formats (支柱)
   /blog/can-kindle-read-azw3
   /blog/why-ebook-wont-open-kindle
   /guide/epub-to-azw3-for-kindle
   /blog/mobi-to-kobo
```

## 门禁

- seo-critic：0/0 ✅
- next build --webpack：通过 ✅
- 线上验证：卫星页已部署，支柱页待 R5 push 后验证

## 风险

- 无新增 noindex/301，不影响索引
- 仅增加内链，不删减内容
