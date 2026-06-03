import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background print:bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[60px] print:!ml-0 print:w-full">
        <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-gutter space-y-gutter overflow-y-auto print:overflow-visible print:p-0 print:m-0">
          {children}
        </main>
      </div>
    </div>
  );
}
