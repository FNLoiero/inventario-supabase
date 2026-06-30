import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getProduct, getProductMovements } from '@/lib/actions';
import { formatCurrency, getProductStatusLabel } from '@/lib/inventory';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, relatedMovements] = await Promise.all([
    getProduct(id),
    getCategories(),
    getProductMovements(id),
  ]);

  if (!product) notFound();

  const category = categories.find((item) => item.id === product.categoryId);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white/50">Productos · Detalle</p>
          <h1 className="mt-1 font-display text-4xl text-white">{product.name}</h1>
          <p className="mt-3 text-white/60">{product.description}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/products/${product.id}/edit`}
            className="inline-flex w-fit rounded-full bg-sand px-5 py-3 font-medium text-ink-900 shadow-soft transition hover:translate-y-[-1px]"
          >
            Editar
          </Link>
          <Link
            href="/products"
            className="inline-flex w-fit rounded-full border border-white/30 px-5 py-3 font-medium text-white/80 transition hover:bg-white/10"
          >
            Volver
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-ink-200 bg-white p-6 shadow-soft">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Meta label="SKU" value={product.sku} />
            <Meta label="Categoría" value={category?.name ?? 'Sin categoría'} />
            <Meta label="Precio" value={formatCurrency(product.price)} />
            <Meta label="Estado" value={getProductStatusLabel(product.status)} />
            <Meta label="Stock" value={`${product.stock} unidades`} />
            <Meta label="Stock mínimo" value={`${product.minStock} unidades`} />
          </dl>
          {product.description && (
            <div className="mt-6 rounded-[1.5rem] bg-ink-50 p-5">
              <p className="text-sm font-medium text-ink-500">Descripción</p>
              <p className="mt-2 text-ink-700">{product.description}</p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-ink-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-medium text-ink-500">Movimientos recientes</p>
          {relatedMovements.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">Sin movimientos registrados.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {relatedMovements.map((movement) => {
                const movLabel =
                  movement.movementType === 'in'
                    ? 'Entrada'
                    : movement.movementType === 'out'
                      ? 'Salida'
                      : 'Ajuste';
                const movColor =
                  movement.movementType === 'in'
                    ? 'bg-mint/15 text-mint ring-1 ring-mint/30'
                    : movement.movementType === 'out'
                      ? 'bg-coral/15 text-coral ring-1 ring-coral/30'
                      : 'bg-gold/20 text-ink-700 ring-1 ring-gold/35';
                return (
                  <div key={movement.id} className="rounded-[1.25rem] border border-ink-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-900">{movement.reference}</p>
                        <p className="text-sm text-ink-500">
                          {new Date(movement.createdAt).toLocaleString('es-AR')}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${movColor}`}>
                        {movLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-ink-600">
                      {movement.movementType === 'out' ? '−' : '+'}{movement.quantity} unidades
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-ink-200 p-4">
      <dt className="text-sm font-medium text-ink-500">{label}</dt>
      <dd className="mt-1 text-base font-medium text-ink-900">{value}</dd>
    </div>
  );
}
