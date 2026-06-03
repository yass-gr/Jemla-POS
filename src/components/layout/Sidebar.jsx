import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/pos', icon: 'point_of_sale', label: 'POS' },
  { to: '/products', icon: 'inventory_2', label: 'Produits' },
  { to: '/customers', icon: 'group', label: 'Clients' },
  { to: '/suppliers', icon: 'local_shipping', label: 'Fournisseurs' },
  { to: '/purchases', icon: 'shopping_cart', label: 'Achats' },
  { to: '/sales', icon: 'payments', label: 'Ventes' },
  { to: '/returns', icon: 'assignment_return', label: 'Retours' },
  { to: '/inventory', icon: 'warehouse', label: 'Stock' },
  { to: '/debts', icon: 'account_balance_wallet', label: 'Dettes' },
  { to: '/reports', icon: 'assessment', label: 'Rapports' },
];

function NavItem({ to, icon, label, showLabel, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center h-10 px-2.5 rounded-lg transition-colors whitespace-nowrap ${
          showLabel ? 'gap-3.5' : 'gap-0 justify-center'
        } ${
          isActive
            ? 'bg-[#0F766E] text-white'
            : 'text-[#64748B] hover:text-[#0F766E] hover:bg-[#0F766E]/8'
        }`
      }
    >
      <span className="material-symbols-outlined text-xl min-w-[22px] text-center shrink-0">{icon}</span>
      <span className={`text-sm font-medium truncate transition-all duration-200 overflow-hidden ${
        showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'
      }`}>
        {label}
      </span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const showLabel = expanded || open;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col h-screen bg-white border-r border-[#e2e8f0] transition-all duration-200 ease-linear
          ${open ? 'w-[260px] translate-x-0 shadow-xl' : '-translate-x-full'}
          ${expanded ? 'lg:w-[260px] lg:shadow-lg' : 'lg:w-[60px] lg:shadow-none'}
          lg:translate-x-0`}
      >
        {/* Logo row */}
        <div className={`flex items-center h-14 px-3 mt-1 ${showLabel ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-200 ${showLabel ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <div className="w-7 h-7 rounded-lg bg-[#0F766E] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <span className="text-sm font-semibold text-[#0f172a] whitespace-nowrap">Jemla POS</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#0F766E] hover:bg-[#0F766E]/8 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">{expanded ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-grow overflow-y-auto px-2 mt-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} showLabel={showLabel} onClick={onClose} />
          ))}
        </div>

        {/* Bottom section */}
        <div className="px-2 pb-3 mt-auto border-t border-[#e2e8f0] pt-2">
          <NavItem to="/settings" icon="settings" label="Paramètres" showLabel={showLabel} onClick={onClose} />
        </div>
      </aside>
    </>
  );
}
