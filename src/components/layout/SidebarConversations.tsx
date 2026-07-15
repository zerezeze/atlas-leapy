'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface SidebarConversationsProps {
  conversations: Conversation[];
}

export function SidebarConversations({
  conversations,
}: SidebarConversationsProps) {
  const pathname = usePathname();

  const getRelativeDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - target.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
      date
    );
  };

  if (conversations.length === 0) {
    return (
      <p className="px-2 text-xs text-zinc-400">Nenhuma conversa encontrada.</p>
    );
  }

  return (
    <>
      {conversations.map((item) => {
        const isActive = pathname === `/c/${item.id}`;
        return (
          <Link
            key={item.id}
            href={`/c/${item.id}`}
            className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-left transition-all group ${
              isActive
                ? 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div className="flex-1 overflow-hidden">
              <span className="truncate block">{item.title}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate mt-0.5">
                {getRelativeDate(item.createdAt)}
              </span>
            </div>
          </Link>
        );
      })}
    </>
  );
}
