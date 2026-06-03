import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';

export default function Header({ onMenuClick }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background transition-all duration-200">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className={`relative w-full max-w-sm transition-all duration-200 ${
            searchFocused ? 'lg:max-w-lg' : ''
          }`}>
            <div className="flex items-center w-full h-9 pl-3 pr-8 bg-muted border border-transparent rounded-xl text-sm text-foreground outline-none focus-within:border-border focus-within:bg-card transition-all">
              <span className="material-symbols-outlined text-base text-muted-foreground mr-2">search</span>
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder={t('header.search')}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="absolute right-2.5 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            title={theme === 'dark' ? t('header.light_mode') : t('header.dark_mode')}
          >
            <span className="material-symbols-outlined text-xl">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'ar' : 'fr')}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground font-semibold text-xs tracking-wider"
            title={i18n.language === 'fr' ? t('header.switch_ar') : t('header.switch_fr')}
          >
            {i18n.language === 'fr' ? 'AR' : 'FR'}
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-card" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-teal-400 font-bold text-xs ring-1 ring-border group-hover:ring-teal-500/30 transition-all shrink-0">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">{user?.name || t('header.user')}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user?.role || ''}</p>
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role || ''}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
