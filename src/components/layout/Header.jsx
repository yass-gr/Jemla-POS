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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
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
    const interval = setInterval(fetchNotifs, 10000);
    window.addEventListener('notifications:refresh', fetchNotifs);
    window.addEventListener('focus', fetchNotifs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications:refresh', fetchNotifs);
      window.removeEventListener('focus', fetchNotifs);
    };
  }, []);

  useEffect(() => {
    if (showNotif) {
      api.notifications.list()
        .then(data => {
          setNotifications(data);
          const count = (data.lowStock?.length || 0) + (data.outOfStock?.length || 0) +
            (data.debtors?.length || 0) + (data.heldSales?.length || 0);
          setNotifCount(count);
        })
        .catch(() => {});
    }
  }, [showNotif]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const query = searchQuery.toLowerCase();
        const results = [];

        // Search products
        const products = await api.products.list();
        const matchedProducts = products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query) ||
          (p.barcode && p.barcode.includes(query))
        ).slice(0, 3);
        
        matchedProducts.forEach(p => {
          results.push({
            type: 'product',
            id: p.id,
            name: p.name,
            subtitle: `${p.category} • ${p.stock} ${p.unit}`,
            path: '/products'
          });
        });

        // Search customers
        const customers = await api.customers.list();
        const matchedCustomers = customers.filter(c => 
          c.name.toLowerCase().includes(query) || 
          (c.phone && c.phone.includes(query))
        ).slice(0, 2);
        
        matchedCustomers.forEach(c => {
          results.push({
            type: 'customer',
            id: c.id,
            name: c.name,
            subtitle: c.phone || c.email || '',
            path: '/customers'
          });
        });

        // Search sales
        const sales = await api.sales.list();
        const matchedSales = sales.filter(s => 
          s.customer_name?.toLowerCase().includes(query) ||
          String(s.id).includes(query)
        ).slice(0, 2);
        
        matchedSales.forEach(s => {
          results.push({
            type: 'sale',
            id: s.id,
            name: `#${s.id} - ${s.customer_name || t('sales.free_customer')}`,
            subtitle: `${s.total.toFixed(2)} DH • ${new Date(s.created_at).toLocaleDateString()}`,
            path: '/sales'
          });
        });

        setSuggestions(results.slice(0, 7));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, t]);

  const handleSearchSelect = (item) => {
    // Navigate with search query parameter to filter and highlight the item
    navigate(`${item.path}?search=${encodeURIComponent(searchQuery)}&highlight=${item.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search
      navigate('/products');
      setShowSuggestions(false);
    }
  };

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background transition-all duration-200 print:hidden">
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
          }`} ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center w-full h-9 ps-3 bg-muted border border-transparent rounded-xl text-sm text-foreground outline-none focus-within:border-border focus-within:bg-card transition-all overflow-hidden">
                <span className="material-symbols-outlined text-base text-muted-foreground me-2 shrink-0">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    if (searchQuery.trim()) setShowSuggestions(true);
                  }}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder={t('header.search')}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="p-1 hover:bg-accent rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-muted-foreground">close</span>
                  </button>
                )}
                {!searchQuery && (
                  <kbd className="absolute end-2.5 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md">
                    ⌘K
                  </kbd>
                )}
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[60vh] overflow-y-auto">
                <div className="p-2 space-y-1">
                  {suggestions.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full text-start px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === 'product' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' :
                          item.type === 'customer' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                          'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                        }`}>
                          <span className="material-symbols-outlined text-sm">
                            {item.type === 'product' ? 'inventory_2' :
                             item.type === 'customer' ? 'person' : 'receipt'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          {item.subtitle && (
                            <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          arrow_forward
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground text-center">
                    {t('header.search_results', { count: suggestions.length })}
                  </p>
                </div>
              </div>
            )}

            {showSuggestions && searchQuery && suggestions.length === 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-muted-foreground mb-2 block">search_off</span>
                <p className="text-xs text-muted-foreground">{t('header.no_results')}</p>
              </div>
            )}
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
                              <p className="text-[10px] text-amber-600 dark:text-amber-400">{p.stock.toFixed(2)} {p.unit} {t('products.remaining')}</p>
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
