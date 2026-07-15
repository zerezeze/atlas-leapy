import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 font-sans antialiased overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
