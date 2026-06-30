'use client';

import { useActionState } from 'react';
import { signIn } from './actions';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl tracking-[0.2em] text-ink-900 uppercase">Inventario</p>
          <p className="mt-2 text-sm text-ink-500">Ingresá para continuar</p>
        </div>

        <form
          action={action}
          className="rounded-[2rem] border border-ink-200 bg-white p-6 shadow-soft"
        >
          {state?.error && (
            <div className="mb-4 rounded-2xl bg-coral/10 border border-coral/30 px-4 py-3 text-sm text-coral">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 outline-none transition focus:border-coral"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 outline-none transition focus:border-coral"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-full bg-ink-900 py-3 font-medium text-white shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {isPending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
