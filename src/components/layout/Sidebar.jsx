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
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          group fixed left-0 top-0 h-screen bg-inverse-surface flex flex-col z-50 shadow-xl
          transition-[width] duration-200 ease-in-out
          w-[260px] lg:w-[72px] lg:hover:w-[260px]
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="mb-8 flex items-center justify-center lg:group-hover:justify-start gap-0 lg:group-hover:gap-3 mt-margin lg:group-hover:px-4">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-headline-sm">storefront</span>
          </div>
          <div className="hidden lg:group-hover:block overflow-hidden">
            <h1 className="text-headline-md font-bold text-primary-fixed leading-tight whitespace-nowrap">Simi Shop</h1>
            <p className="text-label-md text-on-secondary-container/60 whitespace-nowrap">Retail Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-center lg:group-hover:justify-start gap-0 lg:group-hover:gap-3 py-3.5 lg:group-hover:px-4 lg:group-hover:mx-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
                    : 'text-on-secondary-container hover:bg-primary-container/20 hover:text-on-primary'
                }`
              }
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              <span className="font-label-md text-label-md hidden lg:group-hover:inline truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <NavLink
            to="/login"
            onClick={onClose}
            className="flex items-center justify-center lg:group-hover:justify-start gap-0 lg:group-hover:gap-3 py-3.5 lg:group-hover:px-4 lg:group-hover:mx-2 text-on-secondary-container hover:bg-error/10 hover:text-error rounded-xl transition-all whitespace-nowrap"
          >
            <span className="material-symbols-outlined shrink-0">logout</span>
            <span className="font-label-md text-label-md hidden lg:group-hover:inline">Logout</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
