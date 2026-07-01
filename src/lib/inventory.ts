export type Category = {
  id: string;
  name: string;
  color: string;
};

export type ProductStatus = 'active' | 'low_stock' | 'out_of_stock' | 'archived';

export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  description: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference: string;
  createdAt: string;
};

export const categories: Category[] = [
  { id: 'cat-home', name: 'Hogar', color: '#ff7a59' },
  { id: 'cat-tech', name: 'Tecnologia', color: '#59d4a9' },
  { id: 'cat-office', name: 'Oficina', color: '#f6c453' },
  { id: 'cat-food', name: 'Alimentos', color: '#7f8ba9' }
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Lampara Nordic',
    sku: 'LMP-001',
    categoryId: 'cat-home',
    price: 45990,
    stock: 4,
    minStock: 6,
    status: 'low_stock',
    description: 'Lampara de mesa con luz calida y base de madera.',
    updatedAt: '2026-06-23T18:20:00Z'
  },
  {
    id: 'prod-2',
    name: 'Mouse Pro Silent',
    sku: 'TEC-214',
    categoryId: 'cat-tech',
    price: 27990,
    stock: 19,
    minStock: 5,
    status: 'active',
    description: 'Mouse inalambrico ergonomico con clic silencioso.',
    updatedAt: '2026-06-22T12:10:00Z'
  },
  {
    id: 'prod-3',
    name: 'Cuaderno A5',
    sku: 'OFF-840',
    categoryId: 'cat-office',
    price: 8990,
    stock: 0,
    minStock: 10,
    status: 'out_of_stock',
    description: 'Cuaderno rayado de tapa dura para oficina o estudio.',
    updatedAt: '2026-06-21T09:40:00Z'
  },
  {
    id: 'prod-4',
    name: 'Barra de cereal cacao',
    sku: 'ALI-330',
    categoryId: 'cat-food',
    price: 1290,
    stock: 42,
    minStock: 12,
    status: 'active',
    description: 'Snack individual apto para puntos de venta.',
    updatedAt: '2026-06-24T07:30:00Z'
  }
];

export const movements: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    movementType: 'out',
    quantity: 2,
    reference: 'Pedido 4182',
    createdAt: '2026-06-24T10:15:00Z'
  },
  {
    id: 'mov-2',
    productId: 'prod-2',
    movementType: 'in',
    quantity: 12,
    reference: 'Compra proveedor Delta',
    createdAt: '2026-06-23T14:00:00Z'
  },
  {
    id: 'mov-3',
    productId: 'prod-3',
    movementType: 'adjustment',
    quantity: 3,
    reference: 'Conteo fisico',
    createdAt: '2026-06-22T08:30:00Z'
  }
];

export function getCategoryName(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Sin categoria';
}

export function getProductStatusLabel(status: ProductStatus) {
  const labels: Record<ProductStatus, string> = {
    active: 'Activo',
    low_stock: 'Stock bajo',
    out_of_stock: 'Sin stock',
    archived: 'Archivado'
  };

  return labels[status];
}

export function getInventoryStats(currentProducts: Product[]) {
  const active = currentProducts.filter((p) => p.status !== 'archived');
  const totalProducts = active.length;
  const lowStock = active.filter((p) => p.status === 'low_stock').length;
  const outOfStock = active.filter((p) => p.status === 'out_of_stock').length;
  const totalUnits = active.reduce((sum, p) => sum + p.stock, 0);

  return {
    totalProducts,
    lowStock,
    outOfStock,
    totalUnits
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}
