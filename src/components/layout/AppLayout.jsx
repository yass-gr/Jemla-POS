import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[60px]">
        <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-gutter space-y-gutter overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
