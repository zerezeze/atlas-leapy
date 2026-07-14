import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col items-center justify-start p-8 bg-zinc-50/50 dark:bg-zinc-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}
