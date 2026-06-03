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

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex flex-col py-6 px-4 h-screen w-[260px] -translate-x-full lg:w-[88px] lg:hover:w-64 lg:translate-x-0 transition-all duration-300 ease-in-out overflow-hidden bg-white border-r border-[#e2e8f0] shadow-[0_8px_40px_rgba(15,23,42,0.04)] group ${open ? 'translate-x-0' : ''}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-4 mb-8 overflow-hidden">
          <div className="min-w-[52px] h-[52px] flex items-center justify-center bg-[#0F766E] rounded-2xl shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          </div>
          <div className="flex flex-col whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-lg font-extrabold text-[#0F766E] leading-none">Jemla POS</span>
            <span className="text-xs text-[#64748B] font-medium">Enterprise</span>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 flex-grow overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F766E] text-white font-bold shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F766E] hover:bg-[#f1f5f9]'
                }`
              }
            >
              <span className="material-symbols-outlined min-w-[28px] text-center shrink-0">{item.icon}</span>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Settings */}
        <div className="mt-auto">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F766E] text-white font-bold shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F766E] hover:bg-[#f1f5f9]'
              }`
            }
          >
            <span className="material-symbols-outlined min-w-[28px] text-center shrink-0">settings</span>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">Paramètres</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
