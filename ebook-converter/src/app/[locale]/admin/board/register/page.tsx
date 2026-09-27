// src/app/[locale]/admin/board/register/page.tsx
// The full task register — every task across M0–M10, grouped by module.
//
// This is the reference view of the same data the board summarises. Useful when
// you want to read the acceptance criteria or change a status without opening
// the JSON.
import Link from 'next/link';
import { TaskRegister } from '@/components/board/BoardView';
import { loadBoardData } from '@/lib/board/loader';
import { deriveBoard, isoDay } from '@/lib/board/derive';

export const dynamic = 'force-dynamic';

export default async function BoardRegisterPage() {
  const data = loadBoardData();
  const view = deriveBoard(data, isoDay());
  const total = view.totals.tasks;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">任务总表</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {data.modules.length} 个模块 · {total} 条任务 · 按模块分组。改{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px] dark:bg-white/10">
              {data.meta.sourceBreakdown}
            </code>{' '}
            中的数据即可变更本表。
          </p>
        </div>
        <Link
          href="./"
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:text-gray-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
        >
          ← 回到作战台
        </Link>
      </div>
      <TaskRegister data={data} view={view} />
    </div>
  );
}
