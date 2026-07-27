import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import NumpadModal from '@/components/ui/NumpadModal';
import { exportToCSV, exportToPDF } from '@/lib/utils';

export default function Purchases() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState(searchParams.get('highlight') ? parseInt(searchParams.get('highlight')) : null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', supplier: '', qty: 1, unit_price: 0, supplier_mode: 'select' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.purchases.list(),
      api.products.list(),
      api.suppliers.list(),
    ]).then(([p, prods, supps]) => {
      setPurchases(p);
      setProducts(prods);
      setSuppliers(supps);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (highlightedId && purchases.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`purchase-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setHighlightedId(null), 3000);
        }
      }, 500);
    }
  }, [highlightedId, purchases]);

  let filtered = search
    ? purchases.filter(p =>
        p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase()))
      )
    : purchases;
  if (filter === 'with_supplier') {
    filtered = filtered.filter(p => p.supplier);
  } else if (filter === 'without_supplier') {
    filtered = filtered.filter(p => !p.supplier);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);
  const totalQty = purchases.reduce((s, p) => s + p.qty, 0);
  const avgPrice = totalQty > 0 ? totalSpent / totalQty : 0;

  function openAdd() {
    setForm({ product_id: products[0]?.id || '', supplier: '', qty: 1, unit_price: 0, supplier_mode: 'select' });
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
      const purchase = await api.purchases.create({
        product_id: form.product_id,
        supplier: form.supplier || null,
        qty: form.qty,
        unit_price: form.unit_price,
      });
      setPurchases(prev => [purchase, ...prev]);
      toast.success(t('purchases.created'));
      setDialogOpen(false);
    } catch (err) {
      toast.error(t('purchases.error') + err.message);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.purchases.delete(deleteTarget.id);
      setPurchases(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success(t('purchases.deleted'));
    } catch (err) {
      toast.error(t('purchases.error') + err.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleExportCSV() {
    const columns = [
      { header: t('purchases.table.product'), key: 'product_name' },
      { header: t('purchases.table.supplier'), key: 'supplier' },
      { header: t('purchases.table.qty'), key: 'qty' },
      { header: t('purchases.table.unit_price'), key: 'unit_price' },
      { header: t('purchases.table.total'), key: 'total' },
      { header: t('purchases.table.date'), key: 'created_at' },
    ];
    exportToCSV(filtered, t('purchases.title'), columns);
  }

  function handleExportPDF() {
    exportToPDF(t('purchases.title'), t('purchases.subtitle'));
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('purchases.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('purchases.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border rounded-xl text-xs font-semibold text-[#64748B] dark:text-muted-foreground hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">
                <span className="material-symbols-outlined text-sm">download</span>
                {t('common.export')}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">description</span>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            {t('purchases.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-red-500/10 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalSpent.toFixed(2)} DH</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">shopping_cart</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-emerald-500/10 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.amount')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{purchases.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">receipt_long</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-blue-500/10 dark:to-blue-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.total_qty')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{Number(totalQty).toFixed(2)} kg</span>
            <span className="material-symbols-outlined text-2xl text-blue-300 dark:text-blue-400">package_2</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-purple-500/10 dark:to-purple-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('purchases.avg_price')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{avgPrice.toFixed(2)} DH</span>
            <span className="material-symbols-outlined text-2xl text-purple-300 dark:text-purple-400">trending_up</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('purchases.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
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

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('purchases.table.product')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('purchases.table.supplier')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('purchases.table.qty')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('purchases.table.unit_price')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('purchases.table.total')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('purchases.table.date')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('purchases.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr 
                  key={p.id} 
                  id={`purchase-${p.id}`}
                  className={`group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0 ${
                    highlightedId === p.id ? 'bg-yellow-100 dark:bg-yellow-900/40 animate-pulse' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{p.product_name}</td>
                  <td className="px-4 py-3">
                    {p.supplier ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                        {p.supplier}
                      </span>
                    ) : (
                      <span className="text-xs text-[#64748B] dark:text-muted-foreground">{t('purchases.none')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-end">{Number(p.qty).toFixed(2)} kg</td>
                  <td className="px-4 py-3 text-xs text-[#0F766E] dark:text-teal-400 text-end font-semibold">{p.unit_price.toFixed(2)} DH</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0f172a] dark:text-foreground text-end">{p.total.toFixed(2)} DH</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                    <span className="text-[10px] ms-1">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDeleteTarget(p)} className="gap-2 cursor-pointer text-error">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('purchases.no_results')}</td></tr>
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
              {form.supplier_mode === 'select' ? (
                <div className="flex gap-2">
                  <Select value={form.supplier} onValueChange={v => setForm(f => ({ ...f, supplier: v === '__other__' ? f.supplier : v, supplier_mode: v === '__other__' ? 'custom' : 'select' }))}>
                    <SelectTrigger className="flex-1 h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground font-medium">
                      <SelectValue placeholder={t('purchases.form.select_supplier')} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                      {suppliers.length > 0 && <SelectItem value="__other__">{t('purchases.form.supplier_other')}</SelectItem>}
                    </SelectContent>
                  </Select>
                  {suppliers.length > 0 && (
                    <button onClick={() => setForm(f => ({ ...f, supplier_mode: 'custom' }))} className="px-3 h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground text-xs hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors shrink-0">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder={t('purchases.form.supplier_placeholder')} className="flex-1 h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
                  {suppliers.length > 0 && (
                    <button onClick={() => setForm(f => ({ ...f, supplier: '', supplier_mode: 'select' }))} className="px-3 h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground text-xs hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors shrink-0">
                      <span className="material-symbols-outlined text-sm">list</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('purchases.form.qty')} *</label>
              <button type="button" onClick={() => openNumpad('qty', form.qty)}
                className="w-full h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border bg-white dark:bg-card px-3 text-start text-sm text-[#0f172a] dark:text-foreground">
                {Number(form.qty).toFixed(2)} kg
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-1 block">{t('purchases.form.unit_price')} *</label>
              <button type="button" onClick={() => openNumpad('unit_price', form.unit_price)}
                className="w-full h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border bg-white dark:bg-card px-3 text-start text-sm text-[#0f172a] dark:text-foreground">
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

      <AlertDialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('purchases.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('purchases.delete_desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-error text-on-error hover:brightness-110">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="hidden print:block w-full text-black p-8 max-w-4xl mx-auto">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('purchases.title')}</h1>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('purchases.total')}: <span className="font-normal">{filtered.length}</span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('purchases.table.product')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('purchases.table.supplier')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-24">{t('purchases.table.qty')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-32">{t('purchases.table.unit_price')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-32">{t('purchases.table.total')}</th>
            </tr>
          </thead>
          <tbody>
            {(search || filter !== 'all' ? filtered : purchases).map(p => (
              <tr key={p.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{p.product_name}</td>
                <td className="border border-black p-2 text-sm">{p.supplier}</td>
                <td className="border border-black p-2 text-sm text-right">{Number(p.qty).toFixed(2)} kg</td>
                <td className="border border-black p-2 text-sm text-right">{p.unit_price.toFixed(2)} DH</td>
                <td className="border border-black p-2 text-sm text-right font-bold">{p.total.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
