'use server';

import { redirect } from 'next/navigation';
import {
  categories as mockCategories,
  movements as mockMovements,
  products as mockProducts,
  type Category,
  type Product,
  type StockMovement,
} from './inventory';
import { productSchema, type ProductFormData } from './schemas';
import { supabase } from './supabase';

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return mockCategories;

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, color')
    .order('name');

  if (error || !data) return mockCategories;
  return data as Category[];
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return mockProducts;

  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, category_id, price, stock, min_stock, status, description, updated_at')
    .order('updated_at', { ascending: false });

  if (error || !data) return mockProducts;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    categoryId: row.category_id,
    price: Number(row.price),
    stock: row.stock,
    minStock: row.min_stock,
    status: row.status,
    description: row.description ?? '',
    updatedAt: row.updated_at,
  }));
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!supabase) return mockProducts.find((p) => p.id === id) ?? null;

  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, category_id, price, stock, min_stock, status, description, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    categoryId: data.category_id,
    price: Number(data.price),
    stock: data.stock,
    minStock: data.min_stock,
    status: data.status,
    description: data.description ?? '',
    updatedAt: data.updated_at,
  };
}

export async function getProductMovements(productId: string): Promise<StockMovement[]> {
  if (!supabase) return mockMovements.filter((m) => m.productId === productId);

  const { data, error } = await supabase
    .from('stock_movements')
    .select('id, product_id, movement_type, quantity, reference, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    movementType: row.movement_type,
    quantity: row.quantity,
    reference: row.reference ?? '',
    createdAt: row.created_at,
  }));
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createProduct(data: ProductFormData): Promise<{ error?: string } | void> {
  const parsed = productSchema.parse(data);

  if (!supabase) {
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

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un producto con ese SKU.' };
    return { error: 'Ocurrió un error al guardar el producto.' };
  }

  redirect('/products');
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, data: ProductFormData): Promise<{ error?: string } | void> {
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

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un producto con ese SKU.' };
    return { error: 'Ocurrió un error al guardar los cambios.' };
  }

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
