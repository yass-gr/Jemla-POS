import { useAuth } from '@/context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-gutter">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative w-full max-w-xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none"
              placeholder="Rechercher..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
          </button>
          <div className="h-8 w-[1px] bg-outline-variant" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-label-md font-bold text-on-surface leading-none">{user?.name || 'Utilisateur'}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{user?.role || ''}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary font-bold group-hover:ring-2 group-hover:ring-error/30 transition-all">
                {initials}
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-sm group-hover:text-error transition-colors">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
