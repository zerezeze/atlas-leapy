'use client';

import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Fechar o menu quando o usuário navegar
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mr-2 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-[260px] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu do Atlas</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
