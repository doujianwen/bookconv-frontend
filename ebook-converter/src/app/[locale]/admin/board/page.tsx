// src/app/[locale]/admin/board/page.tsx
// SEO/GEO execution board — today's work, module progress, anchors, social.
//
// Everything on this page is derived at request time from
// data/seo-geo-board.json (see src/lib/board/derive.ts). The page itself is a
// thin shell: load data, derive the view for today, render.
import { BoardView } from '@/components/board/BoardView';
import { loadBoardData } from '@/lib/board/loader';
import { deriveBoard, isoDay } from '@/lib/board/derive';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const data = loadBoardData();
  const view = deriveBoard(data, isoDay());

  return <BoardView view={view} data={data} />;
}
