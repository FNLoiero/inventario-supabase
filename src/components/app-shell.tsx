import { NavHeader } from './nav-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,122,89,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(89,212,169,0.14),_transparent_24%),linear-gradient(180deg,_#11151d_0%,_#171c27_42%,_#f6f7fb_42%,_#f6f7fb_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,122,89,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(89,212,169,0.14),_transparent_24%),linear-gradient(180deg,_#11151d_0%,_#171c27_42%,_#11151d_42%,_#11151d_100%)] text-ink-900 dark:text-white">
      <NavHeader />
      <main>{children}</main>
    </div>
  );
}
