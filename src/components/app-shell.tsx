import Link from 'next/link';
import { signOut } from '@/app/login/actions';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Productos' },
  { href: '/products/new', label: 'Nuevo producto' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,122,89,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(89,212,169,0.14),_transparent_24%),linear-gradient(180deg,_#11151d_0%,_#171c27_42%,_#f6f7fb_42%,_#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,122,89,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(89,212,169,0.14),_transparent_24%),linear-gradient(180deg,_#11151d_0%,_#171c27_42%,_#11151d_42%,_#11151d_100%)] text-ink-900 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white lg:px-10">
          <div>
            <p className="font-display text-lg tracking-[0.24em] text-sand uppercase">Inventario</p>
            <p className="text-sm text-white/50">Gestión de stock</p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-white/30 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
