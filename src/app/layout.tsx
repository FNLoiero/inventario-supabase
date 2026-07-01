import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/app-shell';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const body = Manrope({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Inventario Supabase',
  description: 'MVP para challenge técnico con Next.js, Supabase y una UI cuidada.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ink-50 font-body antialiased text-ink-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
