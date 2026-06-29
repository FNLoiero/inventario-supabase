import { ProductForm } from '@/components/product-form';
import { getCategories } from '@/lib/actions';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div>
        <p className="text-sm font-medium text-ink-500">Inventario</p>
        <h1 className="mt-1 font-display text-4xl text-ink-900">Nuevo producto</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">
          Todos los campos se validan antes de enviar. El SKU debe ser único.
        </p>
      </div>

      <ProductForm categories={categories} />
    </section>
  );
}
