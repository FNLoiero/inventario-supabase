import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from '@/components/search-bar';
import { formatCurrency, getCategoryName, getProductStatusLabel, products } from '@/lib/inventory';

const statusStyles: Record<string, string> = {
  active: 'bg-mint/15 text-ink-700 ring-1 ring-mint/30',
  low_stock: 'bg-gold/20 text-ink-700 ring-1 ring-gold/35',
  out_of_stock: 'bg-coral/15 text-coral ring-1 ring-coral/30',
  archived: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200',
};

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '', category = '' } = await searchParams;

  const filtered = products.filter((product) => {
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q.toLowerCase()) ||
      product.sku.toLowerCase().includes(q.toLowerCase()) ||
      product.description.toLowerCase().includes(q.toLowerCase());

    const matchesCategory = !category || product.categoryId === category;

    return matchesQuery && matchesCategory;
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">Inventario</p>
          <h1 className="mt-1 font-display text-4xl text-ink-900">Productos</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
            {q || category ? ' · filtrado' : ' en total'}
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex w-fit rounded-full bg-ink-900 px-5 py-3 font-medium text-white shadow-soft transition hover:translate-y-[-1px]"
        >
          Nuevo producto
        </Link>
      </div>

      {/* SearchBar usa useSearchParams, necesita Suspense boundary */}
      <Suspense>
        <SearchBar />
      </Suspense>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-ink-200 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-ink-200 text-left text-sm">
          <thead className="bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-500">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-ink-50/70">
                  <td className="px-4 py-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-ink-900 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1 max-w-md text-ink-500">{product.description}</div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-ink-600">{product.sku}</td>
                  <td className="px-4 py-4 text-ink-600">{getCategoryName(product.categoryId)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`font-medium ${
                        product.stock === 0
                          ? 'text-coral'
                          : product.stock <= product.minStock
                            ? 'text-gold'
                            : 'text-ink-900'
                      }`}
                    >
                      {product.stock}
                    </span>
                    <span className="ml-1 text-ink-400">/ mín {product.minStock}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[product.status] ?? statusStyles.active}`}
                    >
                      {getProductStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-ink-600">{formatCurrency(product.price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
