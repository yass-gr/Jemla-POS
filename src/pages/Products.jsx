import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list().then(data => {
      setProducts(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const filtered = products.filter(p => {
    const matchCategory = filter === 'all' ? true : filter === 'low' ? p.stock < 10 : p.category === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('products.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('products.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground rounded-xl text-xs font-semibold hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">
            <span className="material-symbols-outlined text-sm">file_download</span>
            {t('products.export_csv')}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            {t('products.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#f0fdf4] dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('products.total')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{t('products.in_stock')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{products.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">inventory_2</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#fef2f2] dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('products.low_stock')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{t('products.low_stock_title')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{lowStockCount}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">warning</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full md:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('products.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full pl-10 pr-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <div className="flex bg-[#f1f5f9] dark:bg-muted p-0.5 rounded-lg flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'px-3 py-1.5 bg-white dark:bg-card rounded-md shadow-sm text-[#0F766E] dark:text-teal-400 font-bold text-[11px]' : 'px-3 py-1.5 text-[#64748B] dark:text-muted-foreground font-medium text-[11px]'}
            >
              {cat === 'all' ? t('products.all') : cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input type="checkbox" className="sr-only peer" checked={filter === 'low'} onChange={() => setFilter(filter === 'low' ? 'all' : 'low')} />
          <div className="w-9 h-5 bg-[#f1f5f9] dark:bg-muted peer-checked:bg-red-400 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white dark:after:bg-muted-foreground after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          <span className="text-[11px] font-medium text-[#64748B] dark:text-muted-foreground">{t('products.low_stock_only')}</span>
        </label>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border bg-gradient-to-br from-white via-white to-[#E2E8F0] dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] dark:border-border">
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('products.table.product')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('products.table.category')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-center">{t('products.table.unit')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('products.table.price')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('products.table.stock')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('products.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#0F766E] dark:text-teal-400 font-bold text-[10px] shrink-0 overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#0f172a] dark:text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${p.category === 'Fruits' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>{p.category}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground text-center">{p.unit}</td>
                <td className="px-4 py-3 text-xs font-semibold text-[#0F766E] dark:text-teal-400 text-right">{p.price.toFixed(2)} DH</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="w-28 h-1.5 bg-[#f1f5f9] dark:bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.stock < 10 ? 'bg-red-400 dark:bg-red-500' : 'bg-[#0F766E]/20 dark:bg-teal-500/30'}`}
                        style={{ width: `${Math.min((p.stock / 50) * 100, 100)}%` }} />
                    </div>
                    <p className={`text-[10px] font-semibold ${p.stock < 10 ? 'text-red-500 dark:text-red-400' : 'text-[#64748B] dark:text-muted-foreground'}`}>
                      {p.stock} {p.unit}{p.stock < 10 ? ` (${t('products.table.stock_low')})` : ` ${t('products.table.in_stock')}`}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[#0F766E] dark:text-teal-400 hover:bg-[#0F766E]/8 dark:hover:bg-teal-500/20 p-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && !loading && (
              <tr><td colSpan="6" className="px-4 py-8 text-xs text-[#64748B] dark:text-muted-foreground text-center">{t('products.no_results')}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0
              ? t('products.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
              : t('products.none')}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors ${p === page ? 'bg-[#0F766E] dark:bg-teal-600 text-white' : 'text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
