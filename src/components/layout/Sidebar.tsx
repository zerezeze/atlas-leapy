import {
  Plus,
  MessageSquare,
  Database,
  Info,
  User as UserIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { conversationService } from '@/features/conversations/services/conversation-service';
import { SidebarConversations } from './SidebarConversations';
import { auth } from '@/auth';

export async function Sidebar({ mobile = false }: { mobile?: boolean } = {}) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const organizationId = session.user.organizationId;
  const conversations = await conversationService.listConversations(
    organizationId,
    userId
  );

  return (
    <aside
      className={`${mobile ? 'flex' : 'hidden md:flex'} flex-col h-full w-[260px] bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800`}
    >
      <div className="p-3 pb-0">
        <Link
          href="/"
          className="flex items-center w-full justify-start gap-2 h-10 px-4 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors mb-4"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium text-sm">Nova Conversa</span>
        </Link>
        <div className="flex flex-col gap-0.5 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-1">
          <Link
            href="/"
            className="flex items-center w-full justify-start gap-2.5 h-9 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium text-sm">Conversas</span>
          </Link>
          <Link
            href="/knowledge"
            className="flex items-center w-full justify-start gap-2.5 h-9 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Database className="h-4 w-4" />
            <span className="font-medium text-sm">Knowledge Base</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center w-full justify-start gap-2.5 h-9 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Info className="h-4 w-4" />
            <span className="font-medium text-sm">Sobre</span>
          </Link>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-3">
          <p className="px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2 mb-2">
            Histórico Recente
          </p>

          <SidebarConversations conversations={conversations} />
        </div>
      </ScrollArea>

      {session?.user && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {session.user.name}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {session.user.email}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
