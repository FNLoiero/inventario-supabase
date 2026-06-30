import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/actions';
import { formatCurrency, getInventoryStats, getProductStatusLabel } from '@/lib/inventory';

const statusStyles: Record<string, string> = {
  active: 'bg-mint/15 text-ink-700 ring-1 ring-mint/30',
  low_stock: 'bg-gold/20 text-ink-700 ring-1 ring-gold/35',
  out_of_stock: 'bg-coral/15 text-coral ring-1 ring-coral/30',
  archived: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200',
};

export async function InventoryDashboard() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const stats = getInventoryStats(products);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-ink-900 px-6 py-8 text-white shadow-soft lg:px-8">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sand">
            Panel de control
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-4xl leading-tight text-balance lg:text-5xl">
            Controlá tu inventario en tiempo real.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/60 lg:text-lg">
            Gestioná productos, categorías y movimientos de stock desde un solo lugar. Recibí alertas visuales cuando el stock esté bajo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-sand px-5 py-3 font-medium text-ink-900 transition hover:translate-y-[-1px]"
            >
              Ver productos
            </Link>
            <Link
              href="/products/new"
              className="rounded-full border border-white/40 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Agregar producto
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-ink-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-ink-500">Resumen general</p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <Stat label="Productos" value={stats.totalProducts.toString()} accent="text-ink-900" />
              <Stat label="Unidades" value={stats.totalUnits.toString()} accent="text-ink-900" />
              <Stat label="Stock bajo" value={stats.lowStock.toString()} accent="text-gold" />
              <Stat label="Sin stock" value={stats.outOfStock.toString()} accent="text-coral" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-ink-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-ink-500">Categorías</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-ink-400">Sin categorías cargadas.</p>
              ) : (
                categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full px-3 py-2 text-sm font-medium"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-500">Últimos productos</p>
              <h2 className="mt-1 font-display text-2xl text-ink-900">Stock actualizado</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-coral hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-ink-200">
            {products.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-ink-400">
                No hay productos cargados.{' '}
                <Link href="/products/new" className="font-medium text-coral hover:underline">
                  Agregá el primero.
                </Link>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-ink-200 text-left text-sm">
                <thead className="bg-ink-50 text-ink-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id} className="hover:bg-ink-50/70">
                      <td className="px-4 py-4">
                        <Link href={`/products/${product.id}`} className="font-medium text-ink-900 hover:underline">
                          {product.name}
                        </Link>
                        <div className="text-ink-500">{product.sku}</div>
                      </td>
                      <td className="px-4 py-4 text-ink-600">
                        {categories.find((c) => c.id === product.categoryId)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-ink-600">{product.stock}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[product.status] ?? statusStyles.active}`}>
                          {getProductStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-ink-600">{formatCurrency(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-ink-500">Estado de stock</p>
          <div className="mt-4 space-y-3">
            {products.length === 0 ? (
              <p className="text-sm text-ink-400">Sin productos cargados aún.</p>
            ) : (
              products.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center justify-between rounded-[1.3rem] border border-ink-200 p-4 transition hover:bg-ink-50/70"
                >
                  <div>
                    <p className="font-medium text-ink-900">{product.name}</p>
                    <p className="text-sm text-ink-500">mín. {product.minStock} unidades</p>
                  </div>
                  <span
                    className={`font-display text-xl font-medium ${
                      product.stock === 0
                        ? 'text-coral'
                        : product.stock <= product.minStock
                          ? 'text-gold'
                          : 'text-mint'
                    }`}
                  >
                    {product.stock}
                  </span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
      <div className={`font-display text-3xl ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-ink-500">{label}</div>
    </div>
  );
}
