import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/utils';

export default function Products() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState(searchParams.get('highlight') ? parseInt(searchParams.get('highlight')) : null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', category: '', price: '', price_wholesale: '', unit: 'kg',
    stock: '', wholesale_min_qty: '', barcode: '', image_url: ''
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    api.products.list().then(data => {
      setProducts(data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Scroll to and highlight the searched item
  useEffect(() => {
    if (highlightedId && products.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`product-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Remove highlight after 3 seconds
          setTimeout(() => setHighlightedId(null), 3000);
        }
      }, 500);
    }
  }, [highlightedId, products]);

  const handleExportCSV = () => {
    const columns = [
      { header: 'ID', key: 'id' },
      { header: t('products.table.name'), key: 'name' },
      { header: t('products.table.category'), key: 'category' },
      { header: t('products.table.unit'), key: 'unit' },
      { header: t('products.table.retail_price'), key: 'price' },
      { header: t('products.table.wholesale_price'), key: 'price_wholesale' },
      { header: t('products.table.stock'), key: 'stock' },
      { header: t('products.table.min_qty'), key: 'wholesale_min_qty' },
      { header: t('products.table.barcode'), key: 'barcode' },
    ];
    exportToCSV(products, t('products.title'), columns);
  };

  const handleExportPDF = () => {
    exportToPDF(t('products.title'), t('products.subtitle'));
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', category: '', price: '', price_wholesale: '', unit: 'kg', stock: '', wholesale_min_qty: '10', barcode: '', image_url: '' });
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      price_wholesale: product.price_wholesale || '',
      unit: 'kg',
      stock: product.stock,
      wholesale_min_qty: product.wholesale_min_qty || '',
      barcode: product.barcode || '',
      image_url: product.image_url || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) {
      toast.error(t('products.form.required'));
      return;
    }
    
    const payload = {
      ...form, unit: 'kg',
      price: parseFloat(form.price),
      price_wholesale: form.price_wholesale !== '' ? parseFloat(form.price_wholesale) : null,
      stock: form.stock !== '' ? parseFloat(form.stock) : 0,
      wholesale_min_qty: form.wholesale_min_qty !== '' ? parseFloat(form.wholesale_min_qty) : 0,
    };

    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
        toast.success(t('products.updated'));
      } else {
        await api.products.create(payload);
        toast.success(t('products.created'));
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.products.delete(productToDelete.id);
      toast.success(t('products.deleted'));
      setDeleteOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const lowStockCount = products.filter(p => p.stock < (p.wholesale_min_qty || 10)).length;

  const filtered = products.filter(p => {
    const minQty = p.wholesale_min_qty || 10;
    const matchCategory = filter === 'all' ? true : filter === 'low' ? p.stock < minQty : p.category === filter;
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
            {t('products.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-emerald-500/10 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('products.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{products.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">inventory_2</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-red-500/10 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('products.low_stock')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{lowStockCount}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">warning</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full md:max-w-xs">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('products.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <div className="flex bg-[#f1f5f9] dark:bg-muted p-0.5 rounded-lg flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setPage(1); }}
              className={filter === cat ? 'px-3 py-1.5 bg-white dark:bg-card rounded-md shadow-sm text-[#0F766E] dark:text-teal-400 font-bold text-[11px]' : 'px-3 py-1.5 text-[#64748B] dark:text-muted-foreground font-medium text-[11px]'}
            >
              {cat === 'all' ? t('products.all') : cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input type="checkbox" className="sr-only peer" checked={filter === 'low'} onChange={() => { setFilter(filter === 'low' ? 'all' : 'low'); setPage(1); }} />
          <div className="w-9 h-5 bg-[#f1f5f9] dark:bg-muted peer-checked:bg-red-400 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white dark:after:bg-muted-foreground after:rounded-full after:h-4 after:w-4 after:transition-all ltr:peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4" />
          <span className="text-[11px] font-medium text-[#64748B] dark:text-muted-foreground">{t('products.low_stock_only')}</span>
        </label>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] dark:border-border">
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('products.table.product')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('products.table.category')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-center">{t('products.table.unit')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('products.table.price')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('products.table.stock')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('products.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const minQty = p.wholesale_min_qty || 10;
                const isLow = p.stock < minQty;
                return (
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
                        <div>
                          <span className="block text-xs font-semibold text-[#0f172a] dark:text-foreground">{p.name}</span>
                          {p.barcode && <span className="block text-[10px] text-muted-foreground">{p.barcode}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${p.category === 'Fruits' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground text-center">kg</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#0F766E] dark:text-teal-400 text-end">
                      {p.price.toFixed(2)}
                      {p.price_wholesale && <span className="block text-[10px] text-muted-foreground font-normal">{p.price_wholesale.toFixed(2)} (Gros)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="w-28 h-1.5 bg-[#f1f5f9] dark:bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isLow ? 'bg-red-400 dark:bg-red-500' : 'bg-[#0F766E]/20 dark:bg-teal-500/30'}`}
                            style={{ width: `${Math.min((p.stock / Math.max(50, minQty * 2)) * 100, 100)}%` }} />
                        </div>
                        <p className={`text-[10px] font-semibold ${isLow ? 'text-red-500 dark:text-red-400' : 'text-[#64748B] dark:text-muted-foreground'}`}>
                          {p.stock} kg{isLow ? ` (${t('products.table.stock_low')})` : ` ${t('products.table.in_stock')}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setProductToDelete(p); setDeleteOpen(true); }} className="gap-2 cursor-pointer text-error">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && !loading && (
                <tr><td colSpan="6" className="px-4 py-8 text-xs text-[#64748B] dark:text-muted-foreground text-center">{t('products.no_results')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
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

      <div className="hidden print:block w-full text-black p-8 max-w-4xl mx-auto">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('products.title')}</h1>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('products.total')}: <span className="font-normal">{filtered.length} {t('products.table.product', { count: filtered.length })}</span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('products.table.product')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('products.table.category')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-24">{t('products.table.price')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-32">{t('products.table.stock')}</th>
              <th className="border border-black p-2 text-center text-sm font-bold w-20">{t('products.table.unit')}</th>
            </tr>
          </thead>
          <tbody>
            {(search || filter !== 'all' ? filtered : products).map(p => (
              <tr key={p.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{p.name}</td>
                <td className="border border-black p-2 text-sm">{p.category}</td>
                <td className="border border-black p-2 text-sm text-right font-bold">{p.price.toFixed(2)} DH</td>
                <td className="border border-black p-2 text-sm text-right">{p.stock}</td>
                <td className="border border-black p-2 text-sm text-center">kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? t('products.dialog.edit') : t('products.dialog.add')}</DialogTitle>
            <DialogDescription>{editingProduct ? t('products.dialog.desc_edit') : t('products.dialog.desc_add')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.name')}</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.category')}</label>
              <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Fruits, Légumes..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.price')}</label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.price_wholesale')}</label>
              <Input type="number" step="0.01" value={form.price_wholesale} onChange={e => setForm({ ...form, price_wholesale: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.unit')}</label>
              <Input value="kg" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.wholesale_min_qty')}</label>
              <Input type="number" step="1" value={form.wholesale_min_qty} onChange={e => setForm({ ...form, wholesale_min_qty: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.barcode')}</label>
              <Input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('products.form.stock')}</label>
              <Input type="number" step="0.1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} disabled={!!editingProduct} placeholder={editingProduct ? "Use Inventory tab" : "Initial stock"} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">{t('products.form.image_url')}</label>
              <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('products.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('products.delete_desc', { name: productToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
