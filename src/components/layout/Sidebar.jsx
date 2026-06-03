import { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function NavItem({ to, icon, label, showLabel, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center h-10 px-2.5 rounded-lg transition-all duration-150 whitespace-nowrap ${
          showLabel ? 'gap-3.5' : 'gap-0 justify-center'
        } ${
          isActive
            ? 'bg-[#0F766E] text-white dark:bg-teal-600 dark:text-white'
            : 'text-[#64748B] hover:text-[#0F766E] hover:bg-[#0F766E]/10 dark:text-muted-foreground dark:hover:text-teal-400 dark:hover:bg-teal-500/20'
        }`
      }
    >
      <span className="material-symbols-outlined text-xl min-w-[22px] text-center shrink-0">{icon}</span>
      <span className={`text-sm font-medium truncate overflow-hidden transition-all duration-200 ease-in-out ${
        showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'
      }`}>
        {label}
      </span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const tooltipRefs = useRef({});
  const navItems = [
    { to: '/dashboard', icon: 'dashboard', label: t('nav.dashboard') },
    { to: '/pos', icon: 'point_of_sale', label: t('nav.pos') },
    { to: '/products', icon: 'inventory_2', label: t('nav.products') },
    { to: '/customers', icon: 'group', label: t('nav.customers') },
    { to: '/suppliers', icon: 'local_shipping', label: t('nav.suppliers') },
    { to: '/purchases', icon: 'shopping_cart', label: t('nav.purchases') },
    { to: '/sales', icon: 'payments', label: t('nav.sales') },
    { to: '/returns', icon: 'assignment_return', label: t('nav.returns') },
    { to: '/inventory', icon: 'warehouse', label: t('nav.inventory') },
    { to: '/debts', icon: 'account_balance_wallet', label: t('nav.debts') },
    { to: '/reports', icon: 'assessment', label: t('nav.reports') },
    { to: '/settings', icon: 'settings', label: t('nav.settings') },
  ];
  const showLabel = expanded || open;

  function Tooltip({ id }) {
    if (showLabel || !id || !tooltipRefs.current[id]) return null;
    const rect = tooltipRefs.current[id].getBoundingClientRect();
    return (
      <div
        className="fixed z-[100] px-2.5 py-1.5 bg-[#0f172a] text-white dark:bg-foreground dark:text-foreground text-xs font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none"
        style={{
          left: rect.right + 10,
          top: rect.top + rect.height / 2 - 14,
        }}
      >
        {id}
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col h-screen bg-white border-r border-[#e2e8f0] dark:bg-card dark:border-border transition-all duration-300 ease-in-out
          ${open ? 'w-[260px] translate-x-0 shadow-xl' : '-translate-x-full'}
          ${expanded ? 'lg:w-[260px] lg:shadow-lg' : 'lg:w-[60px] lg:shadow-none'}
          lg:translate-x-0`}
      >
        {/* Logo row */}
        <div className={`flex items-center h-14 px-3 mt-1 ${showLabel ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
            showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'
          }`}>
            <div className="w-7 h-7 rounded-lg bg-[#0F766E] dark:bg-teal-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white dark:text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <span className="text-sm font-semibold text-[#0f172a] dark:text-foreground whitespace-nowrap">Jemla POS</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#0F766E] hover:bg-[#0F766E]/8 dark:hover:text-teal-400 dark:hover:bg-teal-500/20 transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300 ease-in-out" style={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
            }}>{expanded ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-grow overflow-y-auto px-2 mt-2">
          {navItems.map((item) => (
            <div key={item.to} ref={el => tooltipRefs.current[item.label] = el}
              onMouseEnter={() => setHoveredTooltip(item.label)}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <NavItem {...item} showLabel={showLabel} onClick={onClose} />
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="px-2 pb-3 mt-auto border-t border-[#e2e8f0] dark:border-border pt-2">
          <div ref={el => tooltipRefs.current[t('nav.settings')] = el}
            onMouseEnter={() => setHoveredTooltip(t('nav.settings'))}
            onMouseLeave={() => setHoveredTooltip(null)}
          >
            <NavItem to="/settings" icon="settings" label={t('nav.settings')} showLabel={showLabel} onClick={onClose} />
          </div>
        </div>
      </aside>

      <Tooltip id={hoveredTooltip} />
    </>
  );
}
