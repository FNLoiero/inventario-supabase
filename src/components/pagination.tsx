'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  total: number;
  page: number;
  pageSize: number;
}

export function Pagination({ total, page, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between border-t border-ink-200 dark:border-ink-700 px-4 py-4">
      <p className="text-sm text-ink-500 dark:text-ink-400">
        Página {page} de {totalPages} · {total} productos
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="rounded-full border border-ink-200 dark:border-ink-700 px-4 py-2 text-sm font-medium text-ink-600 dark:text-ink-300 transition hover:bg-ink-50 dark:hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>
        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="rounded-full border border-ink-200 dark:border-ink-700 px-4 py-2 text-sm font-medium text-ink-600 dark:text-ink-300 transition hover:bg-ink-50 dark:hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
