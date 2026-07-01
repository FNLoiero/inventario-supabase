'use server';

import { redirect } from 'next/navigation';
import {
  categories as mockCategories,
  movements as mockMovements,
  products as mockProducts,
  type Category,
  type Product,
  type ProductStatus,
  type StockMovement,
} from './inventory';
import { productSchema, type ProductFormData } from './schemas';
import { supabase } from './supabase';

// ─── Data source ──────────────────────────────────────────────────────────────
// Si INVENTARIO_API_URL está definida, el frontend llama a la .NET Web API.
// Si no, llama directamente a Supabase.
// Ambas hablan con la misma base de datos Postgres.

const API_URL = process.env.INVENTARIO_API_URL?.replace(/\/$/, '');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  // .NET API
  if (API_URL) {
    const data = await apiFetch<Category[]>('/categories');
    if (data) return data;
  }

  // Supabase directo
  if (supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color')
      .order('name');
    if (!error && data) return data as Category[];
  }

  return mockCategories;
}

export async function getProducts(): Promise<Product[]> {
  // .NET API
  if (API_URL) {
    const data = await apiFetch<ApiProduct[]>('/products');
    if (data) return data.map(mapApiProduct);
  }

  // Supabase directo
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, category_id, price, stock, min_stock, status, description, updated_at')
      .order('updated_at', { ascending: false });
    if (!error && data) return data.map(mapSupabaseProduct);
  }

  return mockProducts;
}

export async function getProduct(id: string): Promise<Product | null> {
  // .NET API
  if (API_URL) {
    const data = await apiFetch<ApiProduct>(`/products/${id}`);
    if (data) return mapApiProduct(data);
  }

  // Supabase directo
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, category_id, price, stock, min_stock, status, description, updated_at')
      .eq('id', id)
      .single();
    if (!error && data) return mapSupabaseProduct(data);
  }

  return mockProducts.find((p) => p.id === id) ?? null;
}

export async function getProductMovements(productId: string): Promise<StockMovement[]> {
  // .NET API
  if (API_URL) {
    const data = await apiFetch<ApiMovement[]>(`/products/${productId}/movements`);
    if (data) return data.map(mapApiMovement);
  }

  // Supabase directo
  if (supabase) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('id, product_id, movement_type, quantity, reference, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (!error && data) return data.map(mapSupabaseMovement);
  }

  return mockMovements.filter((m) => m.productId === productId);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createProduct(data: ProductFormData): Promise<{ error?: string } | void> {
  const parsed = productSchema.parse(data);

  // .NET API
  if (API_URL) {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.name,
        sku: parsed.sku,
        categoryId: parsed.categoryId,
        price: parsed.price,
        stock: parsed.stock,
        minStock: parsed.minStock,
        status: parsed.status,
        description: parsed.description ?? null,
      }),
    });

    if (res.status === 409) return { error: 'Ya existe un producto con ese SKU.' };
    if (!res.ok) return { error: 'Ocurrió un error al guardar el producto.' };
    redirect('/products');
  }

  // Supabase directo
  if (supabase) {
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

  redirect('/products');
}

export async function updateProduct(
  id: string,
  data: ProductFormData,
): Promise<{ error?: string } | void> {
  const parsed = productSchema.parse(data);

  // .NET API
  if (API_URL) {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.name,
        sku: parsed.sku,
        categoryId: parsed.categoryId,
        price: parsed.price,
        stock: parsed.stock,
        minStock: parsed.minStock,
        status: parsed.status,
        description: parsed.description ?? null,
      }),
    });

    if (res.status === 409) return { error: 'Ya existe un producto con ese SKU.' };
    if (!res.ok) return { error: 'Ocurrió un error al guardar los cambios.' };
    redirect(`/products/${id}`);
  }

  // Supabase directo
  if (supabase) {
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

  redirect(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  // .NET API
  if (API_URL) {
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
    redirect('/products');
  }

  // Supabase directo
  if (supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  redirect('/products');
}

export async function addStockMovement(
  productId: string,
  movementType: 'in' | 'out' | 'adjustment',
  quantity: number,
  reference?: string,
) {
  // .NET API
  if (API_URL) {
    await fetch(`${API_URL}/api/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, movementType, quantity, reference }),
    });
    return;
  }

  // Supabase directo
  if (supabase) {
    const { error } = await supabase.from('stock_movements').insert({
      product_id: productId,
      movement_type: movementType,
      quantity,
      reference: reference ?? null,
    });
    if (error) throw new Error(error.message);
  }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  description?: string;
  updatedAt: string;
}

interface ApiMovement {
  id: string;
  productId: string;
  movementType: string;
  quantity: number;
  reference?: string;
  createdAt: string;
}

function mapApiProduct(row: ApiProduct): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    categoryId: row.categoryId,
    price: Number(row.price),
    stock: row.stock,
    minStock: row.minStock,
    status: row.status,
    description: row.description ?? '',
    updatedAt: row.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseProduct(row: any): Product {
  return {
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
  };
}

function mapApiMovement(row: ApiMovement): StockMovement {
  return {
    id: row.id,
    productId: row.productId,
    movementType: row.movementType,
    quantity: row.quantity,
    reference: row.reference ?? '',
    createdAt: row.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseMovement(row: any): StockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    movementType: row.movement_type,
    quantity: row.quantity,
    reference: row.reference ?? '',
    createdAt: row.created_at,
  };
}
