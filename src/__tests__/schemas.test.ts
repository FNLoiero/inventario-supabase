import { describe, expect, it } from 'vitest';
import { productSchema } from '@/lib/schemas';

describe('productSchema', () => {
  const validProduct = {
    name: 'Lámpara Nordic',
    sku: 'LMP-001',
    categoryId: 'cat-home',
    price: 45990,
    stock: 12,
    minStock: 6,
    status: 'active' as const,
    description: 'Lámpara de mesa.',
  };

  it('valida un producto completo y correcto', () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = productSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name');
    }
  });

  it('rechaza SKU vacío', () => {
    const result = productSchema.safeParse({ ...validProduct, sku: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('sku');
    }
  });

  it('rechaza precio negativo', () => {
    const result = productSchema.safeParse({ ...validProduct, price: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('price');
    }
  });

  it('coerce strings numéricos a número', () => {
    const result = productSchema.safeParse({ ...validProduct, price: '45990', stock: '12' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(45990);
      expect(result.data.stock).toBe(12);
    }
  });

  it('acepta description como opcional', () => {
    const { description: _, ...withoutDesc } = validProduct;
    const result = productSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it('rechaza status fuera del enum', () => {
    const result = productSchema.safeParse({ ...validProduct, status: 'deleted' });
    expect(result.success).toBe(false);
  });
});
