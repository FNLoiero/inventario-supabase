import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { ExportButton } from '@/components/export-button';
import { Pagination } from '@/components/pagination';
import { getCategories, getProducts } from '@/lib/actions';
import { formatCurrency, getProductStatusLabel } from '@/lib/inventory';

const statusStyles: Record<string, string> = {
  active: 'bg-mint/15 text-mint-700 dark:text-mint ring-1 ring-mint/30',
  low_stock: 'bg-gold/20 text-yellow-800 dark:text-gold ring-1 ring-gold/35',
  out_of_stock: 'bg-coral/15 text-coral ring-1 ring-coral/30',
  archived: 'bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400 ring-1 ring-ink-200 dark:ring-ink-600',
};

const PAGE_SIZE = 10;

type SearchParams = Promise<{ q?: string; category?: string; status?: string; page?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '', category = '', status = '', page: pageParam = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? 'Sin categoría';

  const filtered = products.filter((product) => {
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q.toLowerCase()) ||
      product.sku.toLowerCase().includes(q.toLowerCase()) ||
      product.description.toLowerCase().includes(q.toLowerCase());

    const matchesCategory = !category || product.categoryId === category;
    const matchesStatus = !status || product.status === status;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white/50">Inventario</p>
          <h1 className="mt-1 font-display text-4xl text-white">Productos</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
            {q || category ? ' · filtrado' : ' en total'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportButton products={filtered} categories={categories} />
          <Link
            href="/products/new"
            className="inline-flex w-fit rounded-full bg-sand px-5 py-3 font-medium text-ink-900 shadow-soft transition hover:translate-y-[-1px]"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      <Suspense>
        <SearchBar categories={categories} activeStatus={status} />
      </Suspense>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-soft">
        <table className="min-w-full divide-y divide-ink-200 dark:divide-ink-700 text-left text-sm">
          <thead className="bg-ink-50 dark:bg-ink-900 text-ink-500 dark:text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200 dark:divide-ink-700">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-500 dark:text-ink-400">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              paginated.map((product) => (
                <tr key={product.id} className="hover:bg-ink-50/70 dark:hover:bg-ink-700/50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-ink-900 dark:text-white hover:underline"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1 max-w-md text-ink-500 dark:text-ink-400">{product.description}</div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-600 dark:text-ink-300">{product.sku}</td>
                  <td className="px-4 py-4 text-ink-600 dark:text-ink-300">{getCategoryName(product.categoryId)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`font-medium ${
                        product.stock === 0
                          ? 'text-coral'
                          : product.stock <= product.minStock
                            ? 'text-gold'
                            : 'text-ink-900 dark:text-white'
                      }`}
                    >
                      {product.stock}
                    </span>
                    <span className="ml-1 text-ink-400 dark:text-ink-500">/ mín {product.minStock}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[product.status] ?? statusStyles.active}`}
                    >
                      {getProductStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-ink-600 dark:text-ink-300">{formatCurrency(product.price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Suspense>
          <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} />
        </Suspense>
      </div>
    </section>
  );
}
