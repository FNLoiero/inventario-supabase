'use client';

import type { Product, Category } from '@/lib/inventory';

interface Props {
  products: Product[];
  categories: Category[];
}

export function ExportButton({ products, categories }: Props) {
  function handleExport() {
    const getCategoryName = (id: string) =>
      categories.find((c) => c.id === id)?.name ?? 'Sin categoría';

    const headers = ['Nombre', 'SKU', 'Categoría', 'Stock', 'Stock mínimo', 'Precio', 'Estado'];

    const rows = products.map((p) => [
      `"${p.name}"`,
      p.sku,
      `"${getCategoryName(p.categoryId)}"`,
      p.stock,
      p.minStock,
      p.price,
      p.status,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 px-5 py-3 font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      ↓ Exportar CSV
    </button>
  );
}
