import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import NumpadModal from '@/components/ui/NumpadModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function Purchases() {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', supplier: '', qty: 1, unit_price: 0 });
  const [products, setProducts] = useState([]);

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.purchases.list(),
      api.products.list(),
    ]).then(([p, prods]) => {
      setPurchases(p);
      setProducts(prods);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  let filtered = search
    ? purchases.filter(p =>
        p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase()))
      )
    : purchases;
  if (filter !== 'all') {
    filtered = filtered.filter(p => filter === 'with_supplier' ? p.supplier : !p.supplier);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);

  function openAdd() {
    setForm({ product_id: products[0]?.id || '', supplier: '', qty: 1, unit_price: 0 });
    setDialogOpen(true);
  }

  function openNumpad(field, value) {
    setNumpadTarget(field);
    setNumpadInitValue(value);
    setNumpadTitle(field === 'qty' ? t('purchases.form.qty_title') : t('purchases.form.price_title'));
    setNumpadAllowDecimal(field === 'unit_price');
    setNumpadOpen(true);
  }

  function handleNumpadConfirm(value) {
    setForm(f => ({ ...f, [numpadTarget]: value }));
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function handleNumpadClose() {
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  async function handleSave() {
    if (!form.product_id || !form.qty || !form.unit_price) {
      toast.error(t('purchases.form.fill_error'));
      return;
    }
    try {
      const purchase = await api.purchases.create(form);
      setPurchases(prev => [purchase, ...prev]);
      toast.success(t('purchases.created'));
      setDialogOpen(false);
    } catch (err) {
      toast.error(t('purchases.error') + err.message);
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex justify-between items-center">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('purchases.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('purchases.subtitle')}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          {t('purchases.add')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white to-[#fef2f2] dark:border-red-800/60 dark:from-card dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.total')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{t('purchases.expense')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalSpent.toFixed(2)} DH</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">shopping_cart</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white to-[#f0fdf4] dark:border-emerald-800/60 dark:from-card dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.amount')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{t('purchases.count')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{purchases.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">receipt_long</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white to-[#eff6ff] dark:border-blue-800/60 dark:from-card dark:to-blue-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.unique_products')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">{t('purchases.variety')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{new Set(purchases.map(p => p.product_name)).size}</span>
            <span className="material-symbols-outlined text-2xl text-blue-300 dark:text-blue-400">inventory_2</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('purchases.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full pl-10 pr-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('purchases.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('purchases.filter_all')}</SelectItem>
            <SelectItem value="with_supplier">{t('purchases.filter_with_supplier')}</SelectItem>
            <SelectItem value="without_supplier">{t('purchases.filter_without_supplier')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border bg-gradient-to-br from-white via-white to-[#E2E8F0] dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('purchases.table.product')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('purchases.table.supplier')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('purchases.table.qty')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('purchases.table.unit_price')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-right">{t('purchases.table.total')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('purchases.table.date')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{p.product_name}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{p.supplier || t('purchases.none')}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-right">{p.qty}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-right">{p.unit_price.toFixed(2)} DH</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-right">{p.total.toFixed(2)} DH</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('purchases.no_results')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0
              ? t('purchases.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
              : t('purchases.none')}
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
            <DialogTitle>{t('purchases.dialog.title')}</DialogTitle>
            <DialogDescription>{t('purchases.dialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('purchases.form.product')} *</label>
              <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger className="w-full h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground font-medium">
                  <SelectValue placeholder={t('purchases.form.select_product')} />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('purchases.form.supplier')}</label>
              <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder={t('purchases.form.supplier_placeholder')} className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('purchases.form.qty')} *</label>
              <button type="button" onClick={() => openNumpad('qty', form.qty)}
                className="w-full h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border bg-white dark:bg-card px-3 text-left text-sm text-[#0f172a] dark:text-foreground">
                {form.qty}
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('purchases.form.unit_price')} *</label>
              <button type="button" onClick={() => openNumpad('unit_price', form.unit_price)}
                className="w-full h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border bg-white dark:bg-card px-3 text-left text-sm text-[#0f172a] dark:text-foreground">
                {form.unit_price.toFixed(2)} DH
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground rounded-xl text-xs font-semibold hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">{t('purchases.form.cancel')}</button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">{t('purchases.form.save')}</button>
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
