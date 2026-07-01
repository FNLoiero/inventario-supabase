'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Category, Product } from '@/lib/inventory';

interface Props {
  products: Product[];
  categories: Category[];
}

export function StockChart({ products, categories }: Props) {
  const data = categories.map((cat) => {
    const catProducts = products.filter((p) => p.categoryId === cat.id);
    const total = catProducts.reduce((sum, p) => sum + p.stock, 0);
    return { name: cat.name, stock: total, color: cat.color };
  }).filter((d) => d.stock > 0);

  if (data.length === 0) return (
    <p className="mt-4 text-sm text-ink-400 dark:text-ink-500">Sin datos para mostrar.</p>
  );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#5a6787' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#5a6787' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '1rem',
            border: '1px solid #d5daea',
            fontSize: 12,
            boxShadow: '0 4px 16px rgba(17,21,29,0.1)',
          }}
          formatter={(value) => [`${value} unidades`, 'Stock']}
        />
        <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
