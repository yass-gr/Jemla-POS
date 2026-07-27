import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/utils';

const emptyForm = { name: '', phone: '', email: '', address: '', delivery_address: '' };

export default function Customers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [highlightedId, setHighlightedId] = useState(searchParams.get('highlight') ? parseInt(searchParams.get('highlight')) : null);

  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  useEffect(() => {
    if (highlightedId && customers.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`customer-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [highlightedId, customers]);

  function loadCustomers() {
    setLoading(true);
    api.customers.list()
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const totalDebt = customers.reduce((sum, c) => sum + (c.debt_balance || 0), 0);
  const activeDebt = customers.filter(c => c.debt_balance > 0).length;

  let filtered = search
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      )
    : customers;
  if (filter === 'with_debt') {
    filtered = filtered.filter(c => c.debt_balance > 0);
  } else if (filter === 'without_debt') {
    filtered = filtered.filter(c => c.debt_balance === 0);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(customer) {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      delivery_address: customer.delivery_address || '',
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(t('customers.form.name_required'));
      return;
    }
    try {
      if (editing) {
        const updated = await api.customers.update(editing.id, form);
        setCustomers(prev => prev.map(c => c.id === editing.id ? updated : c));
        toast.success(t('customers.updated'));
      } else {
        const customer = await api.customers.create(form);
        setCustomers(prev => [customer, ...prev]);
        toast.success(t('customers.created'));
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(t('common.error') + ': ' + err.message);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.customers.delete(deleteTarget.id);
      setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success(t('customers.deleted'));
    } catch (err) {
      toast.error(t('common.error') + ': ' + err.message);
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleExportCSV() {
    const columns = [
      { header: t('customers.table.name'), key: 'name' },
      { header: t('customers.table.phone'), key: 'phone' },
      { header: t('customers.table.email'), key: 'email' },
      { header: t('customers.table.address'), key: 'address' },
      { header: t('customers.table.debt'), key: 'debt_balance' },
    ];
    exportToCSV(filtered, t('customers.title'), columns);
  }

  function handleExportPDF() {
    exportToPDF(t('customers.title'), t('customers.subtitle'));
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between">
        <div className="py-2">
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('customers.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('customers.subtitle')}</p>
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
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            {t('customers.add')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-emerald-500/10 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('customers.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{customers.length}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">group</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-red-500/10 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('customers.debts')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalDebt.toFixed(2)} DH</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">account_balance_wallet</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-amber-500/10 dark:to-amber-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('customers.unpaid')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{activeDebt}</span>
            <span className="material-symbols-outlined text-2xl text-amber-300 dark:text-amber-400">warning</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input
            type="text"
            placeholder={t('customers.search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all"
          />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('customers.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('customers.filter_all')}</SelectItem>
            <SelectItem value="with_debt">{t('customers.filter_with_debt')}</SelectItem>
            <SelectItem value="without_debt">{t('customers.filter_without_debt')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] dark:border-border">
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('customers.table.name')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('customers.table.phone')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start hidden md:table-cell">{t('common.address')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-center">{t('customers.table.debt')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('customers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-xs text-[#64748B] dark:text-muted-foreground text-center">
                    {t('common.loading')}
                  </td>
                </tr>
              )}
              {!loading && paginated.map((c) => {
                const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const isHighlighted = highlightedId === c.id;
                return (
                  <tr 
                    key={c.id} 
                    id={`customer-${c.id}`}
                    className={`group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0 ${isHighlighted ? 'bg-amber-100 dark:bg-amber-900/30 animate-pulse' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#0F766E] dark:text-teal-400 font-bold text-[10px] shrink-0">{initials}</div>
                        <div>
                          <span className="text-xs font-semibold text-[#0f172a] dark:text-foreground block">{c.name}</span>
                          {c.delivery_address && (
                            <span className="text-[10px] text-[#64748B] dark:text-muted-foreground md:hidden truncate max-w-[140px] block">{c.delivery_address}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">
                      <span className="block">{c.phone || '-'}</span>
                      {c.email && <span className="text-[10px] opacity-75">{c.email}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground max-w-[200px] truncate hidden md:table-cell">{c.address || c.delivery_address || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${c.debt_balance > 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'}`}>
                        {(c.debt_balance || 0).toFixed(2)} DH
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
                          {c.debt_balance > 0 && (
                            <DropdownMenuItem onClick={() => navigate('/debts')} className="gap-2 cursor-pointer">
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                              {t('customers.view_debt')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEdit(c)} className="gap-2 cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="gap-2 cursor-pointer text-error">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-12">
                    {search || filter !== 'all' ? (
                      <div className="flex flex-col items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm">info</span>
                        <span className="text-xs text-amber-800 dark:text-amber-300">
                          {t('customers.no_results')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 mb-2 rounded-full bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-muted-foreground">group</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{t('customers.none')}</p>
                        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors">
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          {t('customers.add')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex flex-col sm:flex-row items-center justify-between gap-3">
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

      <div className="hidden print:block w-full text-black p-8 max-w-4xl mx-auto">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('customers.title')}</h1>
          <p className="text-sm">{t('customers.subtitle')}</p>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('customers.total')}: <span className="font-normal">{filtered.length} {t('customers.table.customer', { count: filtered.length })}</span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('customers.table.name')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('customers.table.phone')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('customers.table.email')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-32">{t('customers.table.debt')}</th>
            </tr>
          </thead>
          <tbody>
            {(search || filter !== 'all' ? filtered : customers).map(c => (
              <tr key={c.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{c.name}</td>
                <td className="border border-black p-2 text-sm">{c.phone || '-'}</td>
                <td className="border border-black p-2 text-sm">{c.email || '-'}</td>
                <td className="border border-black p-2 text-sm text-right font-bold">{c.debt_balance.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('customers.dialog.edit') : t('customers.dialog.add')}</DialogTitle>
            <DialogDescription>
              {editing ? t('customers.dialog.description_edit') : t('customers.dialog.description_add')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('customers.form.name')} *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('customers.form.name')}
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('customers.form.phone')}</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0612345678"
                  className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('customers.form.email')}</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('customers.form.address')}</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder={t('customers.form.address')}
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-1 block">{t('customers.form.delivery_address')}</label>
              <input
                value={form.delivery_address}
                onChange={e => setForm(f => ({ ...f, delivery_address: e.target.value }))}
                placeholder={t('customers.form.delivery_address')}
                className="w-full h-10 px-3 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all"
              />
            </div>
            {editing && editing.debt_balance > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm">info</span>
                <span className="text-xs text-amber-800 dark:text-amber-300">
                  {t('customers.debt_notice', { amount: editing.debt_balance.toFixed(2) })}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground rounded-xl text-xs font-semibold hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#0F766E] dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors"
              >
                {editing ? t('common.save') : t('customers.add')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.debt_balance > 0
                ? t('customers.delete_has_debt', { name: deleteTarget.name, amount: deleteTarget.debt_balance.toFixed(2) })
                : t('customers.delete_confirm_desc', { name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
