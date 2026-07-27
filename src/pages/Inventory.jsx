import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/utils';

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [highlightedId, setHighlightedId] = useState(searchParams.get('highlight') ? parseInt(searchParams.get('highlight')) : null);
  
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ productId: '', changeQty: '', reason: 'correction' });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { t } = useTranslation();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.inventory.list(),
      api.inventory.log(),
    ]).then(([p, l]) => {
      setProducts(p);
      setLog(l);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (highlightedId && products.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`inventory-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setHighlightedId(null), 3000);
        }
      }, 500);
    }
  }, [highlightedId, products]);

  const handleAdjust = async () => {
    if (!adjustForm.productId || !adjustForm.changeQty || !adjustForm.reason) {
      toast.error(t('common.error'));
      return;
    }
    try {
      await api.inventory.adjust({
        productId: adjustForm.productId,
        changeQty: parseFloat(adjustForm.changeQty),
        reason: t(`inventory.reason_${adjustForm.reason}`) || adjustForm.reason
      });
      toast.success(t('inventory.adjust_success') || 'Stock adjusted');
      setAdjustOpen(false);
      setAdjustForm({ productId: '', changeQty: '', reason: 'correction' });
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  let filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;
  if (filter === 'low') {
    filtered = filtered.filter(p => p.stock < (p.wholesale_min_qty || 10));
  } else if (filter === 'medium') {
    filtered = filtered.filter(p => p.stock >= (p.wholesale_min_qty || 10) && p.stock < (p.wholesale_min_qty || 10) + 20);
  } else if (filter === 'good') {
    filtered = filtered.filter(p => p.stock >= (p.wholesale_min_qty || 10) + 20);
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + (p.stock * (p.price_wholesale || p.price || 0)), 0);
  const lowStock = products.filter(p => p.stock < (p.wholesale_min_qty || 10)).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const productHistory = selectedProduct ? log.filter(l => l.product_id === selectedProduct.id) : [];

  function handleExportCSV() {
    const columns = [
      { header: t('inventory.table.product'), key: 'name' },
      { header: t('inventory.table.category'), key: 'category' },
      { header: t('inventory.table.stock'), key: 'stock' },
      { header: t('inventory.table.unit'), key: 'unit' },
      { header: t('inventory.table.min_qty'), key: 'wholesale_min_qty' },
    ];
    exportToCSV(filtered, t('inventory.title'), columns);
  }

  function handleExportPDF() {
    exportToPDF(t('inventory.title'), t('inventory.subtitle'));
  }

  return (
    <div className="space-y-5 pb-8 print:p-0 print:space-y-0">
      <div className="py-2 flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('inventory.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <span className="material-symbols-outlined text-sm">print</span>
            {t('inventory.print_sheet')}
          </Button>
          <Button onClick={() => setAdjustOpen(true)} className="gap-2">
            <span className="material-symbols-outlined text-sm">edit_square</span>
            {t('inventory.adjust_stock')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-emerald-500/10 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('inventory.total_stock')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalStock.toFixed(2)} kg</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">inventory_2</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-red-500/10 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('inventory.low_stock')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{lowStock} {t('inventory.products')}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">warning</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-blue-500/10 dark:to-blue-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('inventory.total_value') || 'Total Value'}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalValue.toFixed(2)} DH</span>
            <span className="material-symbols-outlined text-2xl text-blue-300 dark:text-blue-400">payments</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 print:hidden">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('inventory.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('inventory.table.product')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('inventory.table.category')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('inventory.table.stock')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('inventory.table.status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr 
                    key={p.id} 
                    id={`inventory-${p.id}`}
                    className={`group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors ${
                      highlightedId === p.id ? 'bg-yellow-100 dark:bg-yellow-900/40 animate-pulse' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground text-end">{p.stock.toFixed(2)} kg</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock < (p.wholesale_min_qty || 10) ? 'bg-red-100 dark:bg-red-900/40 text-[#ef4444]' : p.stock < (p.wholesale_min_qty || 10) + 20 ? 'bg-amber-100 dark:bg-amber-900/40 text-[#f59e0b] dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {p.stock < (p.wholesale_min_qty || 10) ? t('inventory.filter_low') : p.stock < (p.wholesale_min_qty || 10) + 20 ? t('inventory.filter_medium') : t('inventory.filter_good')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { 
                            setAdjustForm({ productId: p.id.toString(), changeQty: '', reason: 'correction' });
                            setAdjustOpen(true);
                          }} className="gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">edit_square</span>
                            {t('inventory.adjust_stock')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { 
                            setSelectedProduct(p); 
                            setHistoryOpen(true);
                          }} className="gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">history</span>
                            {t('inventory.recent_activity')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && !loading && (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('inventory.no_results')}</td></tr>
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

        <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden print:hidden">
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

      <div className="hidden print:block w-full text-black p-8 max-w-4xl mx-auto">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('inventory.print_title') || 'Fiche de Comptage'}</h1>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('inventory.counted_by') || 'Compté par'}: <span className="inline-block w-48 border-b border-black border-dashed"></span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('inventory.table.product')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('inventory.table.category')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-24">{t('inventory.table.stock')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold w-32">{t('inventory.actual_count') || 'Comptage Réel'}</th>
              <th className="border border-black p-2 text-left text-sm font-bold w-48">{t('inventory.notes') || 'Notes'}</th>
            </tr>
          </thead>
          <tbody>
            {(search || filter !== 'all' ? filtered : products).map(p => (
              <tr key={p.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{p.name}</td>
                <td className="border border-black p-2 text-sm">{p.category}</td>
                <td className="border border-black p-2 text-sm text-right font-bold">{p.stock.toFixed(2)} {p.unit}</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.adjust_title') || 'Manual Adjustment'}</DialogTitle>
            <DialogDescription>{t('inventory.adjust_desc') || 'Correct product stock.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('inventory.adjust_product') || 'Product'}</label>
              <Select value={adjustForm.productId} onValueChange={v => setAdjustForm(f => ({...f, productId: v}))}>
                <SelectTrigger><SelectValue placeholder={t('common.search')} /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stock: {p.stock})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('inventory.adjust_qty') || 'Adjustment (+/-)'}</label>
              <Input type="number" step="0.01" value={adjustForm.changeQty} onChange={e => setAdjustForm(f => ({...f, changeQty: e.target.value}))} placeholder="-10 or +5" />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">{t('inventory.adjust_reason') || 'Reason'}</label>
              <Select value={adjustForm.reason} onValueChange={v => setAdjustForm(f => ({...f, reason: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spoilage">{t('inventory.reason_spoilage') || 'Spoilage'}</SelectItem>
                  <SelectItem value="correction">{t('inventory.reason_correction') || 'Count Correction'}</SelectItem>
                  <SelectItem value="other">{t('inventory.reason_other') || 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAdjustOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleAdjust}>{t('common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.history_title', { name: selectedProduct?.name }) || 'Product History'}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto mt-4">
            {productHistory.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground">{t('inventory.no_results')}</p>
            ) : (
              productHistory.map(entry => (
                <div key={entry.id} className="py-2 border-b border-border last:border-0 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.reason}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    entry.change_qty > 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-[#ef4444]'
                  }`}>
                    {entry.change_qty > 0 ? '+' : ''}{entry.change_qty}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
