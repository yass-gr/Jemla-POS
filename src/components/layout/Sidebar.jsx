import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/pos', icon: 'point_of_sale', label: 'POS' },
  { to: '/products', icon: 'inventory_2', label: 'Products' },
  { to: '/customers', icon: 'group', label: 'Customers' },
  { to: '/suppliers', icon: 'local_shipping', label: 'Suppliers' },
  { to: '/purchases', icon: 'shopping_cart', label: 'Purchases' },
  { to: '/sales', icon: 'payments', label: 'Sales' },
  { to: '/returns', icon: 'assignment_return', label: 'Returns' },
  { to: '/inventory', icon: 'warehouse', label: 'Inventory' },
  { to: '/debts', icon: 'account_balance_wallet', label: 'Debts' },
  { to: '/reports', icon: 'analytics', label: 'Reports' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[260px] bg-inverse-surface flex flex-col py-margin z-50 shadow-xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-headline-sm">storefront</span>
          </div>
          <div>
            <h1 className="text-headline-md font-bold text-primary-fixed leading-tight">Simi Shop</h1>
            <p className="text-label-md text-on-secondary-container/60">Retail Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3.5 mx-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
                    : 'text-on-secondary-container hover:bg-primary-container/20 hover:text-on-primary'
                }`
              }
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <NavLink
            to="/login"
            onClick={onClose}
            className="flex items-center px-4 py-3 mx-2 text-on-secondary-container hover:bg-error/10 hover:text-error rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
