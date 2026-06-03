import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import NumpadModal from '@/components/ui/NumpadModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function Returns() {
  const { t } = useTranslation();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', qty: 1, reason: '', sale_id: '' });
  const [products, setProducts] = useState([]);

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.returns.list(),
      api.products.list(),
    ]).then(([r, prods]) => {
      setReturns(r);
      setProducts(prods);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  let filtered = search
    ? returns.filter(r =>
        r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        (r.reason && r.reason.toLowerCase().includes(search.toLowerCase()))
      )
    : returns;
  if (filter !== 'all') {
    filtered = filtered.filter(r => filter === 'with_reason' ? r.reason : !r.reason);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalReturned = returns.reduce((s, r) => s + r.qty, 0);

  function openAdd() {
    setForm({ product_id: products[0]?.id || '', qty: 1, reason: '', sale_id: '' });
    setDialogOpen(true);
  }

  function openNumpad(value) {
    setNumpadTarget('qty');
    setNumpadInitValue(value);
    setNumpadTitle(t('returns.form.qty_title'));
    setNumpadAllowDecimal(false);
    setNumpadOpen(true);
  }

  function handleNumpadConfirm(value) {
    setForm(f => ({ ...f, qty: value }));
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function handleNumpadClose() {
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  async function handleSave() {
    if (!form.product_id || !form.qty) {
      toast.error(t('returns.form.fill_error'));
      return;
    }
    try {
      const payload = {
        product_id: form.product_id,
        qty: form.qty,
        reason: form.reason || undefined,
        sale_id: form.sale_id ? parseInt(form.sale_id) : undefined,
      };
      const ret = await api.returns.create(payload);
      setReturns(prev => [ret, ...prev]);
      toast.success(t('returns.created'));
      setDialogOpen(false);
    } catch (err) {
      toast.error(t('returns.error') + err.message);
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex justify-between items-center">
        <div className="py-2">
          <h1 className="text-[26px] font-extrabold text-[#0f172a] dark:text-foreground leading-tight">{t('returns.title')}</h1>
          <p className="text-sm text-[#64748B] dark:text-muted-foreground mt-0.5">{t('returns.subtitle')}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          {t('returns.add')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white to-[#fef2f2] dark:border-red-800/60 dark:from-card dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('returns.total')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{t('returns.returned')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalReturned} {t('returns.units')}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">assignment_return</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white to-[#f0fdf4] dark:border-emerald-800/60 dark:from-card dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('returns.amount')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{t('returns.count')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{returns.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">receipt_long</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white to-[#fffbeb] dark:border-amber-800/60 dark:from-card dark:to-amber-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('returns.unique_products')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:text-amber-300">{t('returns.concerned')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{new Set(returns.map(r => r.product_name)).size}</span>
            <span className="material-symbols-outlined text-2xl text-amber-300 dark:text-amber-400">inventory_2</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('returns.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full pl-10 pr-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('returns.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('returns.filter_all')}</SelectItem>
            <SelectItem value="with_reason">{t('returns.filter_with_reason')}</SelectItem>
            <SelectItem value="without_reason">{t('returns.filter_without_reason')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('returns.table.product')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('returns.table.qty')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('returns.table.reason')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('returns.table.sale')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('returns.table.date')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{r.product_name}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-right">{r.qty}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{r.reason || t('returns.none')}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{r.sale_id ? `#INV-${String(r.sale_id).padStart(4, '0')}` : t('returns.none')}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('returns.no_results')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0
              ? t('returns.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
              : t('returns.none')}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('returns.dialog.title')}</DialogTitle>
            <DialogDescription>{t('returns.dialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('returns.form.product')} *</label>
              <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger className="w-full h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground font-medium">
                  <SelectValue placeholder={t('returns.form.select_product')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('returns.form.qty')} *</label>
              <button type="button" onClick={() => openNumpad(form.qty)}
                className="w-full h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border bg-white dark:bg-card px-3 text-left text-sm text-[#0f172a] dark:text-foreground">
                {form.qty}
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('returns.form.reason')}</label>
              <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder={t('returns.form.reason_placeholder')} className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('returns.form.sale')}</label>
              <input value={form.sale_id} onChange={e => setForm(f => ({ ...f, sale_id: e.target.value }))} placeholder={t('returns.form.sale_placeholder')} type="number" className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground rounded-xl text-xs font-semibold hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">{t('returns.form.cancel')}</button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">{t('returns.form.save')}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NumpadModal
        open={numpadOpen}
        title={numpadTitle}
        value={numpadInitValue}
        allowDecimal={numpadAllowDecimal}
        onConfirm={handleNumpadConfirm}
        onClose={handleNumpadClose}
      />
    </div>
  );
}
