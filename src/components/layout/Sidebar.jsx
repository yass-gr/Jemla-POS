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

function NavItem({ to, icon, label, expanded, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center h-10 px-2.5 rounded-lg transition-colors whitespace-nowrap ${
          expanded ? 'gap-3.5' : 'gap-0 justify-center'
        } ${
          isActive
            ? 'bg-[#0F766E] text-white'
            : 'text-white/60 hover:text-[#a3faef] hover:bg-[#0F766E]/10'
        }`
      }
    >
      <span className="material-symbols-outlined text-xl min-w-[22px] text-center shrink-0">{icon}</span>
      <span className={`text-sm font-medium truncate ${expanded ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 ml-0'} transition-all duration-200 overflow-hidden`}>
        {label}
      </span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col h-screen bg-[#171717] transition-all duration-200 ease-linear
          ${expanded ? 'lg:w-[260px]' : 'lg:w-[60px]'}
          ${open ? 'w-[260px] translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Logo row */}
        <div className={`flex items-center h-14 px-3 mt-1 ${expanded ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'} transition-all duration-200`}>
            <div className="w-7 h-7 rounded-lg bg-[#0F766E] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <span className="text-sm font-semibold text-[#a3faef] whitespace-nowrap">Jemla POS</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/40 hover:text-[#a3faef] hover:bg-[#0F766E]/10 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">{expanded ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-grow overflow-y-auto px-2 mt-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} expanded={expanded} onClick={onClose} />
          ))}
        </div>

        {/* Bottom section */}
        <div className="px-2 pb-3 mt-auto border-t border-[#0F766E]/20 pt-2">
          <NavItem to="/settings" icon="settings" label="Paramètres" expanded={expanded} onClick={onClose} />
        </div>
      </aside>
    </>
  );
}
