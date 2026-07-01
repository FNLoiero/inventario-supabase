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
      const active = products.filter((p) => p.status !== 'archived');
      const stats = getInventoryStats(products);
      expect(stats.totalProducts).toBe(active.length);
      expect(stats.lowStock).toBe(active.filter((p) => p.status === 'low_stock').length);
      expect(stats.outOfStock).toBe(active.filter((p) => p.status === 'out_of_stock').length);
      expect(stats.totalUnits).toBe(active.reduce((acc, p) => acc + p.stock, 0));
    });

    it('devuelve ceros para lista vacia', () => {
      const stats = getInventoryStats([]);
      expect(stats.totalProducts).toBe(0);
      expect(stats.lowStock).toBe(0);
      expect(stats.outOfStock).toBe(0);
      expect(stats.totalUnits).toBe(0);
    });

    it('excluye archivados de todos los conteos', () => {
      const withArchived = [
        ...products,
        {
          ...products[0],
          id: 'prod-archived',
          status: 'archived' as const,
          stock: 999,
        },
      ];
      const stats = getInventoryStats(withArchived);
      // archived product should not increase counts
      expect(stats.totalProducts).toBe(products.filter((p) => p.status !== 'archived').length);
    });
  });

  describe('getCategoryName', () => {
    it('devuelve el nombre de categoria existente', () => {
      expect(getCategoryName('cat-home')).toBe('Hogar');
    });

    it('devuelve fallback para categoria inexistente', () => {
      const result = getCategoryName('cat-unknown');
      expect(result).toBeTruthy();
    });
  });

  describe('getProductStatusLabel', () => {
    it('devuelve etiquetas en espanol', () => {
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
