import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function fetchNotifs() {
      api.notifications.list()
        .then(data => {
          setNotifications(data);
          const count = (data.lowStock?.length || 0) + (data.outOfStock?.length || 0) +
            (data.debtors?.length || 0) + (data.heldSales?.length || 0);
          setNotifCount(count);
        })
        .catch(() => {});
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
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
            <div className="flex items-center w-full h-9 ps-3 pe-8 bg-muted border border-transparent rounded-xl text-sm text-foreground outline-none focus-within:border-border focus-within:bg-card transition-all">
              <span className="material-symbols-outlined text-base text-muted-foreground me-2">search</span>
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder={t('header.search')}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="absolute end-2.5 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md">
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
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(prev => !prev)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground relative"
              title={t('header.notifications')}
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {notifCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-[14px] h-3.5 flex items-center justify-center px-1 bg-red-500 text-white text-[8px] font-bold rounded-full ring-2 ring-background leading-none">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute end-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[70vh] flex flex-col">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                  <p className="text-sm font-bold text-foreground">{t('header.notifications')}</p>
                  {notifCount > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">{notifCount} alerte{notifCount > 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto py-1">
                  {!notifications ? (
                    <p className="text-xs text-muted-foreground text-center py-8">{t('common.loading')}</p>
                  ) : notifCount === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">{t('header.no_notifications')}</p>
                  ) : (
                    <>
                      {notifications.outOfStock?.length > 0 && (
                        <div className="px-4 pt-3 pb-1">
                          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">dangerous</span>
                            {t('header.out_of_stock')}
                          </p>
                        </div>
                      )}
                      {notifications.outOfStock?.map(p => (
                        <button
                          key={`oos-${p.id}`}
                          onClick={() => { setShowNotif(false); navigate('/products'); }}
                          className="w-full text-start px-4 py-2 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-red-500">{t('products.out_of_stock')}</p>
                            </div>
                          </div>
                        </button>
                      ))}

                      {notifications.lowStock?.length > 0 && (
                        <div className="px-4 pt-3 pb-1">
                          <p className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">inventory</span>
                            {t('header.low_stock')}
                          </p>
                        </div>
                      )}
                      {notifications.lowStock?.map(p => (
                        <button
                          key={`ls-${p.id}`}
                          onClick={() => { setShowNotif(false); navigate('/products'); }}
                          className="w-full text-start px-4 py-2 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-amber-600 dark:text-amber-400">{p.stock} {p.unit} {t('products.remaining')}</p>
                            </div>
                          </div>
                        </button>
                      ))}

                      {notifications.debtors?.length > 0 && (
                        <div className="px-4 pt-3 pb-1">
                          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">receipt_long</span>
                            {t('header.overdue_debts')}
                          </p>
                        </div>
                      )}
                      {notifications.debtors?.map(c => (
                        <button
                          key={`debt-${c.id}`}
                          onClick={() => { setShowNotif(false); navigate('/debts'); }}
                          className="w-full text-start px-4 py-2 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                              <p className="text-[10px] text-red-500">{Number(c.debt_balance).toFixed(2)} DH</p>
                            </div>
                          </div>
                        </button>
                      ))}

                      {notifications.heldSales?.length > 0 && (
                        <div className="px-4 pt-3 pb-1">
                          <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">pause_circle</span>
                            {t('header.held_sales')}
                          </p>
                        </div>
                      )}
                      {notifications.heldSales?.map(s => (
                        <button
                          key={`held-${s.id}`}
                          onClick={() => { setShowNotif(false); navigate('/pos'); }}
                          className="w-full text-start px-4 py-2 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate">{s.customer}</p>
                              <p className="text-[10px] text-blue-500">{Number(s.total).toFixed(2)} DH</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
                {notifCount > 0 && (
                  <button
                    onClick={() => { setShowNotif(false); navigate('/dashboard'); }}
                    className="w-full text-center px-4 py-2.5 border-t border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 rounded-b-xl"
                  >
                    {t('dashboard.view_all')}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-teal-400 font-bold text-xs ring-1 ring-border group-hover:ring-teal-500/30 transition-all shrink-0">
                {initials}
              </div>
              <div className="text-start hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">{user?.name || t('header.user')}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user?.role || ''}</p>
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute end-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role || ''}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-start px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2"
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
