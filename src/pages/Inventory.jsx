import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      api.inventory.list(),
      api.inventory.log(),
    ]).then(([p, l]) => {
      setProducts(p);
      setLog(l);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  let filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;
  if (filter === 'low') {
    filtered = filtered.filter(p => p.stock < 10);
  } else if (filter === 'medium') {
    filtered = filtered.filter(p => p.stock >= 10 && p.stock < 30);
  } else if (filter === 'good') {
    filtered = filtered.filter(p => p.stock >= 30);
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter(p => p.stock < 10).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5 pb-8">
      <div className="py-2">
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('inventory.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('inventory.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#f0fdf4] dark:border-emerald-800/60 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('inventory.total_stock')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{t('inventory.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalStock} {products.length > 0 ? products[0].unit : 'u'}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">inventory_2</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#fef2f2] dark:border-red-800/60 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('inventory.low_stock')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{t('inventory.alert')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{lowStock} {t('inventory.products')}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">warning</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#eff6ff] dark:border-blue-800/60 dark:to-blue-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('inventory.categories')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">{t('inventory.categories_badge')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{new Set(products.map(p => p.category)).size}</span>
            <span className="material-symbols-outlined text-2xl text-blue-300 dark:text-blue-400">category</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('inventory.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full pl-10 pr-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('inventory.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('inventory.filter_all')}</SelectItem>
            <SelectItem value="low">{t('inventory.filter_low')}</SelectItem>
            <SelectItem value="medium">{t('inventory.filter_medium')}</SelectItem>
            <SelectItem value="good">{t('inventory.filter_good')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border bg-gradient-to-br from-white via-white to-[#E2E8F0] dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('inventory.table.product')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('inventory.table.category')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('inventory.table.stock')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('inventory.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-right">{p.stock} {p.unit}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock < 10 ? 'bg-red-100 dark:bg-red-900/40 text-[#ef4444]' : p.stock < 30 ? 'bg-amber-100 dark:bg-amber-900/40 text-[#f59e0b] dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {p.stock < 10 ? t('inventory.filter_low') : p.stock < 30 ? t('inventory.filter_medium') : t('inventory.filter_good')}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && !loading && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('inventory.no_results')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
            <p className="text-xs text-[#64748B] dark:text-muted-foreground">
              {filtered.length > 0
                ? t('inventory.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
                : t('inventory.none')}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent disabled:opacity-30 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={p === page ? 'w-7 h-7 rounded-lg text-xs font-bold bg-[#0F766E] dark:bg-teal-600 text-white' : 'w-7 h-7 rounded-lg text-xs font-medium text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent'}>
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent disabled:opacity-30 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border bg-gradient-to-br from-white via-white to-[#E2E8F0] dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F5F9] dark:border-border">
            <h3 className="text-sm font-extrabold text-[#0f172a] dark:text-foreground">{t('inventory.recent_activity')}</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {log.map(entry => (
              <div key={entry.id} className="px-4 py-3 hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[#0f172a] dark:text-foreground truncate">{entry.product_name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    entry.change_qty > 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-[#ef4444]'
                  }`}>
                    {entry.change_qty > 0 ? '+' : ''}{entry.change_qty}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-muted-foreground mt-0.5">{entry.reason}</p>
                <p className="text-[10px] text-[#64748B] dark:text-muted-foreground mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
