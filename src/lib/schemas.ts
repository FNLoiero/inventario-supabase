import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z.coerce.number().int('El stock debe ser un número entero').min(0, 'El stock no puede ser negativo'),
  minStock: z.coerce.number().int('El stock mínimo debe ser un número entero').min(0, 'El stock mínimo no puede ser negativo'),
  status: z.enum(['active', 'low_stock', 'out_of_stock', 'archived']),
  description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
