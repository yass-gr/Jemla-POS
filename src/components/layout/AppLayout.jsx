import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
    const cards = el.querySelectorAll('[data-reveal]');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-background print:bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[60px] print:!ml-0 print:w-full">
        <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main ref={mainRef} className="flex-1 p-4 sm:p-6 lg:p-gutter pt-20 sm:pt-20 lg:pt-[72px] space-y-4 sm:space-y-6 lg:space-y-gutter overflow-y-auto print:overflow-visible print:p-0 print:m-0">
          {children}
        </main>
        
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 print:hidden"
            aria-label="Retour en haut"
          >
            <span className="material-symbols-outlined text-xl">arrow_upward</span>
          </button>
        )}
      </div>
    </div>
  );
}
