import { Search, Bell, Settings, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from './MobileSidebar';
import { Sidebar } from './Sidebar';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export function Header() {
  return (
    <header className="shrink-0 flex h-14 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="flex items-center gap-2">
        <MobileSidebar>
          <Sidebar mobile />
        </MobileSidebar>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm">
            <Compass className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Atlas
          </h2>
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
        <LogoutButton />
      </div>
    </header>
  );
}
