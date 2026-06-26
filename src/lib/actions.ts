'use server';

import { redirect } from 'next/navigation';
import { productSchema, type ProductFormData } from './schemas';
import { supabase } from './supabase';

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createProduct(data: ProductFormData) {
  const parsed = productSchema.parse(data);

  if (!supabase) {
    // Demo mode: no Supabase configured, just navigate back
    redirect('/products');
  }

  const { error } = await supabase.from('products').insert({
    name: parsed.name,
    sku: parsed.sku,
    category_id: parsed.categoryId,
    price: parsed.price,
    stock: parsed.stock,
    min_stock: parsed.minStock,
    status: parsed.status,
    description: parsed.description ?? null,
  });

  if (error) throw new Error(error.message);
  redirect('/products');
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, data: ProductFormData) {
  const parsed = productSchema.parse(data);

  if (!supabase) {
    redirect(`/products/${id}`);
  }

  const { error } = await supabase
    .from('products')
    .update({
      name: parsed.name,
      sku: parsed.sku,
      category_id: parsed.categoryId,
      price: parsed.price,
      stock: parsed.stock,
      min_stock: parsed.minStock,
      status: parsed.status,
      description: parsed.description ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  redirect(`/products/${id}`);
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string) {
  if (!supabase) {
    redirect('/products');
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  redirect('/products');
}

// ─── Stock movement ───────────────────────────────────────────────────────────

export async function addStockMovement(
  productId: string,
  movementType: 'in' | 'out' | 'adjustment',
  quantity: number,
  reference?: string
) {
  if (!supabase) return;

  const { error } = await supabase.from('stock_movements').insert({
    product_id: productId,
    movement_type: movementType,
    quantity,
    reference: reference ?? null,
  });

  if (error) throw new Error(error.message);
}
