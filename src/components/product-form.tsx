'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { createProduct, updateProduct } from '@/lib/actions';
import { type Category, type Product } from '@/lib/inventory';
import { productSchema, type ProductFormData } from '@/lib/schemas';

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'low_stock', label: 'Stock bajo' },
  { value: 'out_of_stock', label: 'Sin stock' },
  { value: 'archived', label: 'Archivado' },
] as const;

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const isEditing = !!product;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          price: product.price,
          stock: product.stock,
          minStock: product.minStock,
          status: product.status,
          description: product.description,
        }
      : {
          status: 'active',
          stock: 0,
          minStock: 5,
        },
  });

  function onSubmit(data: ProductFormData) {
    setServerError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid gap-5 rounded-[2rem] border border-ink-200 bg-white p-6 shadow-soft lg:grid-cols-2"
    >
      {serverError && (
        <div className="lg:col-span-2 rounded-2xl bg-coral/10 border border-coral/30 px-4 py-3 text-sm text-coral">
          {serverError}
        </div>
      )}

      <Field label="Nombre" error={errors.name?.message}>
        <input
          {...register('name')}
          className={inputClass(!!errors.name)}
          placeholder="Lámpara Nordic"
        />
      </Field>

      <Field label="SKU" error={errors.sku?.message}>
        <input
          {...register('sku')}
          className={inputClass(!!errors.sku)}
          placeholder="LMP-001"
        />
      </Field>

      <Field label="Categoría" error={errors.categoryId?.message}>
        <select {...register('categoryId')} className={inputClass(!!errors.categoryId)}>
          <option value="">Seleccioná una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Estado" error={errors.status?.message}>
        <select {...register('status')} className={inputClass(!!errors.status)}>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Precio (ARS)" error={errors.price?.message}>
        <input
          {...register('price')}
          type="number"
          step="0.01"
          className={inputClass(!!errors.price)}
          placeholder="45990"
        />
      </Field>

      <Field label="Stock inicial" error={errors.stock?.message}>
        <input
          {...register('stock')}
          type="number"
          step="1"
          className={inputClass(!!errors.stock)}
          placeholder="12"
        />
      </Field>

      <Field label="Stock mínimo" error={errors.minStock?.message}>
        <input
          {...register('minStock')}
          type="number"
          step="1"
          className={inputClass(!!errors.minStock)}
          placeholder="6"
        />
      </Field>

      <div className="lg:col-span-2">
        <Field label="Descripción" error={errors.description?.message}>
          <textarea
            {...register('description')}
            className={`${inputClass(!!errors.description)} min-h-28 resize-none`}
            placeholder="Describí brevemente el producto y su contexto de uso."
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-ink-900 px-5 py-3 font-medium text-white shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
        >
          {isPending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <Link
          href={isEditing ? `/products/${product.id}` : '/products'}
          className="rounded-full border border-ink-200 px-5 py-3 font-medium text-ink-700 transition hover:bg-ink-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-coral bg-white ${
    hasError ? 'border-coral/70 bg-coral/5' : 'border-ink-200 focus:border-coral'
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-coral">{error}</p>}
    </div>
  );
}
