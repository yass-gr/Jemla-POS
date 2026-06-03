import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { exportToCSV, exportToPDF } from '@/lib/utils';

export default function Debts() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', note: '' });
  
  const [receiptData, setReceiptData] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.customers.list().then(data => {
      setCustomers(data.filter(c => c.debt_balance > 0));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPayment = (customer) => {
    setActiveCustomer(customer);
    setPaymentForm({ amount: '', method: 'cash', note: '' });
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.amount || isNaN(paymentForm.amount) || parseFloat(paymentForm.amount) <= 0) {
      toast.error('Montant invalide');
      return;
    }
    
    try {
      await api.customers.addPayment(activeCustomer.id, {
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.method,
        note: paymentForm.note
      });
      
      toast.success(t('debts.payment.success'));
      setPaymentModalOpen(false);
      
      const remaining = activeCustomer.debt_balance - parseFloat(paymentForm.amount);
      
      setReceiptData({
        date: new Date().toLocaleString(),
        customerName: activeCustomer.name,
        amount: parseFloat(paymentForm.amount),
        remaining: remaining > 0 ? remaining : 0,
      });

      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const closeReceiptAndPrint = () => {
    window.print();
  };

  let filtered = search
    ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search)))
    : customers;
  
  if (filter === 'high') {
    filtered = filtered.filter(c => c.debt_balance > 5000);
  } else if (filter === 'medium') {
    filtered = filtered.filter(c => c.debt_balance >= 1000 && c.debt_balance <= 5000);
  } else if (filter === 'low') {
    filtered = filtered.filter(c => c.debt_balance < 1000);
  }

  const totalDebts = filtered.reduce((sum, c) => sum + c.debt_balance, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleExportCSV() {
    const columns = [
      { header: t('debts.table.name'), key: 'name' },
      { header: t('debts.table.phone'), key: 'phone' },
      { header: t('debts.table.balance'), key: 'debt_balance' },
      { header: t('debts.table.last_purchase'), key: 'last_purchase_date' },
    ];
    exportToCSV(filtered, t('debts.title'), columns);
  }

  function handleExportPDF() {
    exportToPDF(t('debts.title'), t('debts.subtitle'));
  }

  return (
    <div className="space-y-5 pb-8 print:p-0">
      <div className="py-2 print:hidden">
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('debts.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('debts.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-red-500/10 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('debts.total')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{totalDebts.toFixed(2)} <span className="text-sm">DH</span></span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">account_balance_wallet</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-orange-500/10 dark:to-orange-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('debts.high')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{customers.filter(c => c.debt_balance > 5000).length}</span>
            <span className="material-symbols-outlined text-2xl text-orange-300 dark:text-orange-400">warning</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 print:hidden">
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
        <div className="relative flex-1 w-full md:max-w-xs">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input type="text" placeholder={t('debts.search')} value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} className="w-full ps-10 pe-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 transition-all" />
        </div>
        <div className="flex bg-[#f1f5f9] dark:bg-muted p-0.5 rounded-lg flex-wrap">
          {['all', 'high', 'medium', 'low'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={filter === f ? 'px-3 py-1.5 bg-white dark:bg-card rounded-md shadow-sm text-[#0F766E] dark:text-teal-400 font-bold text-[11px]' : 'px-3 py-1.5 text-[#64748B] dark:text-muted-foreground font-medium text-[11px]'}>
              {t(`debts.${f === 'all' ? 'all' : f + '_risk'}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] dark:border-border">
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('debts.table.customer')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-start">{t('debts.table.contact')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('debts.table.balance')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-end">{t('debts.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors border-b border-[#F1F5F9] dark:border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#0F766E] dark:text-teal-400 font-bold text-[10px] shrink-0">
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-[#0f172a] dark:text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-end text-red-500 dark:text-red-400">{c.debt_balance.toFixed(2)} DH</td>
                  <td className="px-4 py-3 text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPayment(c)} className="gap-2 cursor-pointer text-[#0F766E] dark:text-teal-400 font-bold">
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                          {t('debts.table.pay')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && !loading && (
                <tr><td colSpan="4" className="px-4 py-8 text-xs text-[#64748B] dark:text-muted-foreground text-center">{t('debts.no_results')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0 ? t('debts.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length }) : t('debts.none')}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('debts.payment.title')}</DialogTitle>
            <DialogDescription>
              {t('debts.payment.desc')} <strong className="text-foreground">{activeCustomer?.name}</strong>.
              <br/>
              {t('debts.table.balance')} : <strong className="text-red-500">{activeCustomer?.debt_balance.toFixed(2)} DH</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('debts.payment.amount')}</label>
              <Input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('debts.payment.method')}</label>
              <Select value={paymentForm.method} onValueChange={v => setPaymentForm({ ...paymentForm, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte Bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('debts.payment.note')}</label>
              <Input value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} placeholder="Numéro de chèque, etc." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handlePaymentSubmit}>{t('debts.payment.submit')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PRINT RECEIPT */}
      {receiptData && (
        <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader className="print:hidden">
              <DialogTitle>{t('debts.payment.success')}</DialogTitle>
              <DialogDescription>Imprimez le reçu pour le client.</DialogDescription>
            </DialogHeader>
            <div className="p-4 border-2 border-dashed border-gray-300 print:border-none print:p-0 bg-white text-black font-mono text-sm mx-auto w-full max-w-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-black rounded-full text-white mx-auto flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-xl">storefront</span>
                </div>
                <h2 className="font-bold text-lg uppercase">JEMLA POS</h2>
                <p className="text-xs">{t('debts.receipt.title')}</p>
                <p className="text-[10px] mt-1">{receiptData.date}</p>
              </div>
              
              <div className="space-y-2 border-y border-dashed border-gray-300 py-4 mb-4">
                <div className="flex justify-between">
                  <span>{t('debts.receipt.customer')}</span>
                  <span className="font-bold">{receiptData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('debts.receipt.amount_paid')}</span>
                  <span className="font-bold text-green-700">+{receiptData.amount.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{t('debts.receipt.remaining')}</span>
                  <span>{receiptData.remaining.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="text-center mt-12 mb-4">
                <p className="text-xs mb-6">{t('debts.receipt.signature')}</p>
                <div className="w-32 border-b border-black mx-auto"></div>
              </div>
              <p className="text-center text-[10px] mt-8">Merci pour votre confiance.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 print:hidden">
              <Button variant="outline" onClick={() => setReceiptData(null)}>{t('common.close')}</Button>
              <Button onClick={closeReceiptAndPrint}><span className="material-symbols-outlined mr-2">print</span> Imprimer</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="hidden print:block w-full text-black p-8 max-w-4xl mx-auto">
        <div className="mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{t('debts.title')}</h1>
          <p className="text-sm">{t('debts.subtitle')}</p>
          <div className="flex justify-between text-sm">
            <p className="font-semibold">Date: <span className="font-normal">{new Date().toLocaleString()}</span></p>
            <p className="font-semibold">{t('debts.total')}: <span className="font-normal">{totalDebts.toFixed(2)} DH</span></p>
          </div>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left text-sm font-bold">{t('debts.table.customer')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('debts.table.phone')}</th>
              <th className="border border-black p-2 text-right text-sm font-bold w-32">{t('debts.table.balance')}</th>
              <th className="border border-black p-2 text-left text-sm font-bold">{t('debts.table.last_purchase')}</th>
            </tr>
          </thead>
          <tbody>
            {(search || filter !== 'all' ? filtered : customers).map(c => (
              <tr key={c.id} className="break-inside-avoid">
                <td className="border border-black p-2 text-sm font-semibold">{c.name}</td>
                <td className="border border-black p-2 text-sm">{c.phone || '-'}</td>
                <td className="border border-black p-2 text-sm text-right font-bold">{c.debt_balance.toFixed(2)} DH</td>
                <td className="border border-black p-2 text-sm">{c.last_purchase_date ? new Date(c.last_purchase_date).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
