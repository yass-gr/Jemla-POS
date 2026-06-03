import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import NumpadModal from '@/components/ui/NumpadModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { exportToCSV, exportToPDF } from '@/lib/utils';

export default function Returns() {
  const { t } = useTranslation();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [form, setForm] = useState({ product_id: '', qty: 1, reason: '', sale_id: '' });
  const [products, setProducts] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
  const totalValue = returns.reduce((s, r) => s + (r.price || 0) * r.qty, 0);

  function openAdd() {
    setEditingReturn(null);
    setForm({ product_id: products[0]?.id || '', qty: 1, reason: '', sale_id: '' });
    setDialogOpen(true);
  }

  function openEdit(ret) {
    setEditingReturn(ret);
    setForm({ 
      product_id: ret.product_id, 
      qty: ret.qty, 
      reason: ret.reason || '', 
      sale_id: ret.sale_id || '' 
    });
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
      
      if (editingReturn) {
        const updated = await api.returns.update(editingReturn.id, payload);
        setReturns(prev => prev.map(r => r.id === editingReturn.id ? updated : r));
        toast.success(t('returns.updated'));
      } else {
        const ret = await api.returns.create(payload);
        setReturns(prev => [ret, ...prev]);
        toast.success(t('returns.created'));
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(t('returns.error') + err.message);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.returns.delete(deleteTarget.id);
      setReturns(prev => prev.filter(r => r.id !== deleteTarget.id));
      toast.success(t('returns.deleted'));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(t('returns.error') + err.message);
    }
  }

  function handleExportCSV() {
    const columns = [
      { header: t('returns.table.product'), key: 'product_name' },
      { header: t('returns.table.qty'), key: 'qty' },
      { header: t('purchases.table.unit_price'), key: 'price' },
      { header: t('returns.table.reason'), key: 'reason' },
      { header: t('returns.table.sale'), key: 'sale_id' },
      { header: t('returns.table.date'), key: 'created_at' },
    ];
    exportToCSV(filtered, t('returns.title'), columns);
  }

  function handleExportPDF() {
    exportToPDF(t('returns.title'), t('returns.subtitle'));
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex justify-between items-center">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('returns.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('returns.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
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
            {t('returns.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white to-red-500/10 dark:from-card dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('returns.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalReturned} {t('returns.units')}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">assignment_return</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white to-emerald-500/10 dark:from-card dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('returns.amount')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalValue.toFixed(2)} MAD</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">payments</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white to-amber-500/10 dark:from-card dark:to-amber-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('returns.unique_products')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{new Set(returns.map(r => r.product_name)).size}</span>
            <span className="material-symbols-outlined text-2xl text-amber-300 dark:text-amber-400">inventory_2</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('returns.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
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

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('returns.table.product')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('returns.table.qty')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('purchases.table.unit_price')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('returns.table.reason')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('returns.table.sale')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('returns.table.date')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('returns.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{r.product_name}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-end">{r.qty}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground text-end">{r.price ? `${r.price.toFixed(2)} MAD` : '-'}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{r.reason || t('returns.none')}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{r.sale_id ? `#${String(r.sale_id).padStart(4, '0')}` : t('returns.none')}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(r)} className="gap-2 cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(r)} className="gap-2 cursor-pointer text-error">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('returns.no_results')}</td></tr>
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
            <DialogTitle>{editingReturn ? t('returns.dialog.edit_title') : t('returns.dialog.title')}</DialogTitle>
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
                className="w-full h-10 rounded-[20px] border border-[#F1F5F9] dark:border-border bg-white dark:bg-card px-3 text-start text-sm text-[#0f172a] dark:text-foreground">
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('returns.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && t('returns.delete_desc', { name: deleteTarget.product_name, qty: deleteTarget.qty })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="hidden print:block w-full text-black p-8 max-w-4xl mx-auto">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('returns.title')}</h1>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('returns.total')}: <span className="font-normal">{filtered.length}</span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('returns.table.product')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-24">{t('returns.table.qty')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-32">{t('purchases.table.unit_price')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('returns.table.reason')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('returns.table.date')}</th>
            </tr>
          </thead>
          <tbody>
            {(search ? filtered : returns).map(r => (
              <tr key={r.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{r.product_name}</td>
                <td className="border border-black p-2 text-sm text-right">{r.qty}</td>
                <td className="border border-black p-2 text-sm text-right">{(r.price || 0).toFixed(2)} DH</td>
                <td className="border border-black p-2 text-sm">{r.reason || '-'}</td>
                <td className="border border-black p-2 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
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
