import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/utils';

export default function Suppliers() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    api.suppliers.list().then(setSuppliers).catch(console.error).finally(() => setLoading(false));
  }, []);

  let filtered = search
    ? suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone && s.phone.includes(search)))
    : suppliers;
  if (filter !== 'all') {
    filtered = filtered.filter(s => filter === 'phone' ? s.phone : s.email);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '' });
    setDialogOpen(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({ name: supplier.name, phone: supplier.phone || '', email: supplier.email || '', address: supplier.address || '' });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error(t('suppliers.form.name_required')); return; }
    try {
      if (editing) {
        await api.suppliers.update(editing.id, form);
        setSuppliers(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
        toast.success(t('suppliers.updated'));
      } else {
        const supplier = await api.suppliers.create(form);
        setSuppliers(prev => [supplier, ...prev]);
        toast.success(t('suppliers.created'));
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(t('common.error') + ': ' + err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.suppliers.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast.success(t('suppliers.deleted'));
    } catch (err) {
      toast.error(t('common.error') + ': ' + err.message);
    }
  }

  function handleExportCSV() {
    const columns = [
      { header: t('suppliers.table.name'), key: 'name' },
      { header: t('suppliers.table.phone'), key: 'phone' },
      { header: t('suppliers.table.email'), key: 'email' },
      { header: t('suppliers.table.address'), key: 'address' },
    ];
    exportToCSV(filtered, t('suppliers.title'), columns);
  }

  function handleExportPDF() {
    exportToPDF(t('suppliers.title'), t('suppliers.subtitle'));
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('suppliers.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('suppliers.subtitle')}</p>
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
            {t('suppliers.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-emerald-500/10 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('suppliers.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{suppliers.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">business</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-blue-500/10 dark:to-blue-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('suppliers.filter_phone')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{suppliers.filter(s => s.phone).length}</span>
            <span className="material-symbols-outlined text-2xl text-blue-300 dark:text-blue-400">contact_phone</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-purple-500/10 dark:to-purple-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('suppliers.with_email')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{suppliers.filter(s => s.email).length}</span>
            <span className="material-symbols-outlined text-2xl text-purple-300 dark:text-purple-400">email</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('suppliers.search')} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all" />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('suppliers.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('suppliers.filter_all')}</SelectItem>
            <SelectItem value="phone">{t('suppliers.filter_phone')}</SelectItem>
            <SelectItem value="email">{t('suppliers.filter_email')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] dark:border-border">
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('suppliers.table.name')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('suppliers.table.phone')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('suppliers.table.email')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('suppliers.table.address')}</th>
              <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('suppliers.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(s => (
              <tr key={s.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0">
                <td className="px-4 py-3 text-xs font-semibold text-[#0f172a] dark:text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{s.phone || '-'}</td>
                <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{s.email || '-'}</td>
                <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground max-w-[200px] truncate">{s.address || '-'}</td>
                <td className="px-4 py-3 text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(s.id)} className="gap-2 cursor-pointer text-error">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && !loading && (
              <tr><td colSpan="5" className="px-4 py-8 text-xs text-[#64748B] dark:text-muted-foreground text-center">{t('suppliers.no_results')}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0
              ? t('suppliers.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
              : t('suppliers.none')}
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
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('suppliers.title')}</h1>
          <p className="text-sm font-semibold">{t('suppliers.subtitle')}</p>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('suppliers.total')}: <span className="font-normal">{filtered.length}</span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('suppliers.table.name')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('suppliers.table.phone')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('suppliers.table.email')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('suppliers.table.address')}</th>
            </tr>
          </thead>
          <tbody>
            {(search || filter !== 'all' ? filtered : suppliers).map(s => (
              <tr key={s.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{s.name}</td>
                <td className="border border-black p-2 text-sm">{s.phone || '-'}</td>
                <td className="border border-black p-2 text-sm">{s.email || '-'}</td>
                <td className="border border-black p-2 text-sm">{s.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('suppliers.dialog.edit') : t('suppliers.dialog.add')}</DialogTitle>
            <DialogDescription>
              {editing ? t('suppliers.dialog.description_edit') : t('suppliers.dialog.description_add')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('suppliers.form.name')} *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('suppliers.form.name')}
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('suppliers.form.phone')}</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0612345678"
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('suppliers.form.email')}</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com"
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('suppliers.form.address')}</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder={t('suppliers.form.address')}
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground rounded-xl text-xs font-semibold hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors">{t('common.cancel')}</button>
              <button onClick={handleSave}
                className="px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">{editing ? t('common.save') : t('suppliers.add')}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
