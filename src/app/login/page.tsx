'use client';

import { useState } from 'react';
import { loginAction } from '@/features/auth/actions/login';
import { Compass, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Em caso de sucesso o next-auth fará o redirecionamento
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md mb-4">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Entrar no Atlas
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 text-center">
            Acesse sua conta para continuar
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nome@empresa.com"
                className="w-full h-10 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-primary transition-colors text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                htmlFor="password"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-10 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-primary transition-colors text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 rounded-lg font-medium mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
