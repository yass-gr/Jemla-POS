import { useAuth } from '@/context/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between h-[72px] lg:h-[80px] px-4 lg:px-8">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f1f5f9] transition-colors text-[#64748B]"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-2.5 bg-[#f1f5f9] border-none rounded-2xl focus:ring-2 focus:ring-[#0F766E]/20 text-sm text-[#0f172a] transition-all outline-none placeholder:text-[#64748B]"
              placeholder="Rechercher une vente, un client..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl hover:bg-[#f1f5f9] transition-colors text-[#64748B] relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 lg:top-3 lg:right-3 w-2 h-2 bg-[#dc2626] rounded-full border-2 border-white" />
          </button>
          <div className="h-8 lg:h-10 w-px bg-[#e2e8f0] mx-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0f172a] leading-tight">{user?.name || 'Utilisateur'}</p>
              <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider">{user?.role || ''}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-2 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#0F766E] font-bold text-sm border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-[#dc2626]/30 transition-all shrink-0">
                {initials}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
