import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'nav.dashboard' },
  { to: '/pos', icon: 'point_of_sale', label: 'nav.pos' },
  { to: '/products', icon: 'inventory_2', label: 'nav.products' },
  { to: '/customers', icon: 'group', label: 'nav.customers' },
  { to: '/suppliers', icon: 'local_shipping', label: 'nav.suppliers' },
  { to: '/purchases', icon: 'shopping_cart', label: 'nav.purchases' },
  { to: '/sales', icon: 'payments', label: 'nav.sales' },
  { to: '/returns', icon: 'assignment_return', label: 'nav.returns' },
  { to: '/inventory', icon: 'warehouse', label: 'nav.inventory' },
  { to: '/debts', icon: 'account_balance_wallet', label: 'nav.debts' },
  { to: '/reports', icon: 'assessment', label: 'nav.reports' },
];

export default function Sidebar({ open, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const showLabel = expanded || open;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-out
          ${open ? 'w-[240px] translate-x-0' : '-translate-x-full'}
          ${expanded ? 'lg:w-[240px]' : 'lg:w-[60px]'}
          lg:translate-x-0`}
      >
        <div className={`flex items-center h-14 px-3 ${showLabel ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${
            showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'
          }`}>
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">Jemla</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300" style={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
            }}>{expanded ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-2 mt-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center h-9 px-2.5 rounded-lg transition-all duration-150 group ${
                showLabel ? 'gap-3' : 'gap-0 justify-center'
              } ${
                location.pathname === item.to
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span className="material-symbols-outlined text-xl min-w-[22px] text-center shrink-0">{item.icon}</span>
              <span className={`text-sm font-medium truncate overflow-hidden transition-all duration-200 ${
                showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'
              }`}>
                {t(item.label)}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="px-2 pb-3 mt-auto border-t border-border pt-2">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={`flex items-center h-9 px-2.5 rounded-lg transition-all duration-150 ${
              showLabel ? 'gap-3' : 'gap-0 justify-center'
            } ${
              location.pathname === '/settings'
                ? 'bg-teal-500/15 text-teal-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <span className="material-symbols-outlined text-xl min-w-[22px] text-center shrink-0">settings</span>
            <span className={`text-sm font-medium truncate overflow-hidden transition-all duration-200 ${
              showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}>
              {t('nav.settings')}
            </span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
