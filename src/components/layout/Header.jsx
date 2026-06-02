export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center justify-between h-16 px-gutter">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
          </button>
          <div className="h-8 w-[1px] bg-outline-variant" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-label-md font-bold text-on-surface leading-none">Admin User</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary font-bold">
              AU
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
