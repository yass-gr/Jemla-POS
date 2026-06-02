import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-gutter space-y-gutter overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
