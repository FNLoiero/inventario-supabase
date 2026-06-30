import { ProductForm } from '@/components/product-form';
import { getCategories } from '@/lib/actions';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div>
        <p className="text-sm font-medium text-white/50">Productos</p>
        <h1 className="mt-1 font-display text-4xl text-white">Nuevo producto</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
          Completá los datos del producto. El SKU identifica cada artículo de forma única en el sistema.
        </p>
      </div>

      <ProductForm categories={categories} />
    </section>
  );
}
