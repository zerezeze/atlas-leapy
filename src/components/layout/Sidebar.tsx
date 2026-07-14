import { Home, Users, BookOpen, Layers } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-20 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-muted/30">
      <nav className="flex flex-col gap-2 p-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-all"
        >
          <Home className="h-4 w-4" />
          Início
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Users className="h-4 w-4" />
          Clientes
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Base de Conhecimento
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <Layers className="h-4 w-4" />
          Integrações
        </a>
      </nav>
    </aside>
  );
}
