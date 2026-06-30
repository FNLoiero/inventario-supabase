import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import { getCategories, getProduct } from '@/lib/actions';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);

  if (!product) notFound();

  return (
    <section className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div>
        <p className="text-sm font-medium text-white/50">Productos · Editar</p>
        <h1 className="mt-1 font-display text-4xl text-white">{product.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
          Modificá los datos del producto. Los cambios se aplican de inmediato.
        </p>
      </div>

      <ProductForm product={product} categories={categories} />
    </section>
  );
}
