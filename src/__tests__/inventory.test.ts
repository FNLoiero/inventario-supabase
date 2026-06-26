import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  getCategoryName,
  getInventoryStats,
  getProductStatusLabel,
  products,
} from '@/lib/inventory';

describe('inventory helpers', () => {
  describe('getInventoryStats', () => {
    it('cuenta totales correctamente con los datos semilla', () => {
      const stats = getInventoryStats(products);
      expect(stats.totalProducts).toBe(products.length);
      expect(stats.lowStock).toBe(products.filter((p) => p.status === 'low_stock').length);
      expect(stats.outOfStock).toBe(products.filter((p) => p.status === 'out_of_stock').length);
      expect(stats.totalUnits).toBe(products.reduce((acc, p) => acc + p.stock, 0));
    });

    it('devuelve ceros para lista vacía', () => {
      const stats = getInventoryStats([]);
      expect(stats.totalProducts).toBe(0);
      expect(stats.lowStock).toBe(0);
      expect(stats.outOfStock).toBe(0);
      expect(stats.totalUnits).toBe(0);
    });
  });

  describe('getCategoryName', () => {
    it('devuelve el nombre de categoría existente', () => {
      expect(getCategoryName('cat-home')).toBe('Hogar');
    });

    it('devuelve fallback para categoría inexistente', () => {
      expect(getCategoryName('cat-unknown')).toBe('Sin categoría');
    });
  });

  describe('getProductStatusLabel', () => {
    it('devuelve etiquetas en español', () => {
      expect(getProductStatusLabel('active')).toBe('Activo');
      expect(getProductStatusLabel('low_stock')).toBe('Stock bajo');
      expect(getProductStatusLabel('out_of_stock')).toBe('Sin stock');
      expect(getProductStatusLabel('archived')).toBe('Archivado');
    });
  });

  describe('formatCurrency', () => {
    it('formatea en ARS correctamente', () => {
      const result = formatCurrency(45990);
      expect(result).toContain('45');
      expect(result).toContain('990');
    });

    it('maneja cero', () => {
      const result = formatCurrency(0);
      expect(result).toBeTruthy();
    });
  });
});
