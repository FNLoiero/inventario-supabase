'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { type Category } from '@/lib/inventory';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'low_stock', label: 'Stock bajo' },
  { value: 'out_of_stock', label: 'Sin stock' },
  { value: 'archived', label: 'Archivado' },
];

export function SearchBar({
  categories,
  activeStatus = '',
}: {
  categories: Category[];
  activeStatus?: string;
}) {
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
      // Reset to page 1 on filter change
      params.delete('page');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Search input */}
      <div className="relative w-full max-w-sm">
        <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          defaultValue={query}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder="Buscar por nombre o SKU…"
          className="w-full rounded-full border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 dark:text-white dark:placeholder-ink-400 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-coral dark:focus:border-coral"
        />
        {isPending && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-400">
            ···
          </span>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Chip
          label="Todas las categorías"
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

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={activeStatus === opt.value}
            onClick={() => updateParam('status', activeStatus === opt.value ? '' : opt.value)}
            accent={
              opt.value === 'active'
                ? 'active'
                : opt.value === 'low_stock'
                  ? 'warning'
                  : opt.value === 'out_of_stock'
                    ? 'danger'
                    : undefined
            }
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
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: 'active' | 'warning' | 'danger';
}) {
  const accentClass = active
    ? accent === 'active'
      ? 'bg-mint/30 text-mint-700 dark:text-mint ring-1 ring-mint/50'
      : accent === 'warning'
        ? 'bg-gold/30 text-amber-600 dark:text-gold ring-1 ring-gold/50'
        : accent === 'danger'
          ? 'bg-coral/20 text-coral ring-1 ring-coral/40'
          : 'bg-ink-900 dark:bg-sand text-white dark:text-ink-900 shadow-soft'
    : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 ring-1 ring-ink-200 dark:ring-ink-600 hover:bg-ink-50 dark:hover:bg-ink-700';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${accentClass}`}
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
