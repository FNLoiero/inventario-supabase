import Link from 'next/link';
import { categories, formatCurrency, getCategoryName, getInventoryStats, getProductStatusLabel, movements, products } from '@/lib/inventory';

const statusStyles: Record<string, string> = {
  active: 'bg-mint/15 text-ink-700 ring-1 ring-mint/30',
  low_stock: 'bg-gold/20 text-ink-700 ring-1 ring-gold/35',
  out_of_stock: 'bg-coral/15 text-coral ring-1 ring-coral/30',
  archived: 'bg-ink-100 text-ink-500 ring-1 ring-ink-200'
};

export function InventoryDashboard() {
  const stats = getInventoryStats(products);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-ink-900 px-6 py-8 text-white shadow-soft lg:px-8">
          <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sand">
            MVP listo para demo
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-4xl leading-tight text-balance lg:text-6xl">
            Un inventario simple, visual y preparado para crecer con Supabase.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 lg:text-lg">
            Pensado para mostrar arquitectura, UI cuidada, CRUD y una base de datos real sin convertir el challenge en un proyecto innecesariamente grande.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-sand px-5 py-3 font-medium text-ink-900 transition hover:translate-y-[-1px]">
              Ver productos
            </Link>
            <Link href="/products/new" className="rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/10">
              Cargar producto
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-ink-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-ink-500">Cobertura del inventario</p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <Stat label="Productos" value={stats.totalProducts.toString()} accent="text-ink-900" />
              <Stat label="Unidades" value={stats.totalUnits.toString()} accent="text-ink-900" />
              <Stat label="Stock bajo" value={stats.lowStock.toString()} accent="text-gold" />
              <Stat label="Sin stock" value={stats.outOfStock.toString()} accent="text-coral" />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-ink-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-medium text-ink-500">Categorías activas</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span key={category.id} className="rounded-full px-3 py-2 text-sm font-medium" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-ink-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-500">Productos recientes</p>
              <h2 className="mt-1 font-display text-2xl text-ink-900">Lo que vería un evaluador al abrir la app</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-coral hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-ink-200">
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
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-ink-50/70">
                    <td className="px-4 py-4">
                      <div className="font-medium text-ink-900">{product.name}</div>
                      <div className="text-ink-500">{product.sku}</div>
                    </td>
                    <td className="px-4 py-4 text-ink-600">{getCategoryName(product.categoryId)}</td>
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
          </div>
        </div>

        <aside className="rounded-[2rem] border border-ink-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-ink-500">Actividad reciente</p>
          <div className="mt-4 space-y-4">
            {movements.map((movement) => {
              const product = products.find((item) => item.id === movement.productId);
              return (
                <div key={movement.id} className="rounded-[1.3rem] border border-ink-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-900">{product?.name}</p>
                      <p className="text-sm text-ink-500">{movement.reference}</p>
                    </div>
                    <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white">{movement.movementType}</span>
                  </div>
                  <p className="mt-3 text-sm text-ink-600">
                    {movement.quantity} unidades • {new Date(movement.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
              );
            })}
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
