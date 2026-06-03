import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.customers.list().then(data => {
      setCustomers(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalDebt = customers.reduce((sum, c) => sum + c.debt_balance, 0);
  const activeDebt = customers.filter(c => c.debt_balance > 0).length;

  let filtered = search
    ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search)))
    : customers;
  if (filter === 'with_debt') {
    filtered = filtered.filter(c => c.debt_balance > 0);
  } else if (filter === 'without_debt') {
    filtered = filtered.filter(c => c.debt_balance === 0);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5 pb-8">
      <div className="py-2">
        <h1 className="text-[26px] font-extrabold text-[#0f172a] dark:text-foreground leading-tight">{t('customers.title')}</h1>
        <p className="text-sm text-[#64748B] dark:text-muted-foreground mt-0.5">{t('customers.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#f0fdf4] dark:border-emerald-800/60 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('customers.total')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{t('customers.active')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{customers.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">group</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#fef2f2] dark:border-red-800/60 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('customers.debts')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{t('customers.unpaid')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalDebt.toFixed(2)} DH</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">account_balance_wallet</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#fffbeb] dark:border-amber-800/60 dark:to-amber-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('customers.total')} Dettes</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">{t('customers.active')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{activeDebt}</span>
            <span className="material-symbols-outlined text-2xl text-amber-300 dark:text-amber-400">warning</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('customers.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full pl-10 pr-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('customers.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('customers.filter_all')}</SelectItem>
            <SelectItem value="with_debt">{t('customers.filter_with_debt')}</SelectItem>
            <SelectItem value="without_debt">{t('customers.filter_without_debt')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] dark:border-border">
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('customers.table.name')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('customers.table.phone')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('common.address')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-center">{t('customers.table.debt')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => {
              const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <tr key={c.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#0F766E] dark:text-teal-400 font-bold text-[10px] shrink-0">{initials}</div>
                      <span className="text-xs font-semibold text-[#0f172a] dark:text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{c.phone || '-'}{c.email ? ` · ${c.email}` : ''}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground max-w-[200px] truncate">{c.address || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${c.debt_balance > 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'}`}>
                      {c.debt_balance.toFixed(2)} DH
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[#0F766E] dark:text-teal-400 hover:bg-[#0F766E]/8 dark:hover:bg-teal-500/20 p-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">more_vert</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && !loading && (
              <tr><td colSpan="5" className="px-4 py-8 text-xs text-[#64748B] dark:text-muted-foreground text-center">{t('customers.no_results')}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0
              ? t('customers.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
              : t('customers.none')}
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
