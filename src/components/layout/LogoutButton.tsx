'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/features/auth/actions/logout';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        title="Sair"
        className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </form>
  );
}
