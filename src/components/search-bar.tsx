'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { categories } from '@/lib/inventory';

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get('category') ?? '';
  const query = searchParams.get('q') ?? '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-sm">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          defaultValue={query}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder="Buscar por nombre o SKU…"
          className="w-full rounded-full border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-coral"
        />
        {isPending && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-400">
            ···
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          label="Todos"
          active={!activeCategory}
          onClick={() => updateParam('category', '')}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            active={activeCategory === cat.id}
            onClick={() => updateParam('category', activeCategory === cat.id ? '' : cat.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-ink-900 text-white shadow-soft'
          : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
      }`}
    >
      {label}
    </button>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}
