import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import SaleDetail from '@/components/SaleDetail';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

async function reprintSale(saleId) {
  try {
    const sale = await api.sales.get(saleId);
    const date = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const customerName = sale.customer_name || 'Client Libre';
    const items = sale.items || [];

    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Bon de vente</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #222; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 4px 0 0; color: #666; font-size: 12px; }
        .title { text-align: center; font-size: 20px; font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 10px 0; margin-bottom: 24px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; flex-wrap: wrap; gap: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #f5f5f5; text-align: left; padding: 8px 12px; font-size: 13px; border-bottom: 2px solid #ddd; }
        td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        .right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals div { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
        .totals .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 8px; margin-top: 4px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
        .signature-box { text-align: center; }
        .signature-box .line { width: 200px; border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; font-size: 13px; }
        .note { margin-top: 16px; font-size: 12px; color: #666; font-style: italic; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <div class="header"><h1>Simi Shop</h1><p>Grossiste en fruits et légumes</p></div>
        <div class="title">BON DE VENTE (Réimpression)</div>
        <div class="info">
          <span>N°: INV-${String(sale.id).padStart(4, '0')}</span>
          <span>Date: ${date}</span>
          <span>Client: ${customerName}</span>
          <span>Paiement: ${sale.payment_method || 'cash'}</span>
        </div>
        <table>
          <tr><th>Produit</th><th class="right">Qté</th><th class="right">Prix unitaire</th><th class="right">Total</th></tr>
          ${items.map(item => `
            <tr>
              <td>${item.product_name}${item.discount > 0 ? ' (remise ' + item.discount + ' DH)' : ''}</td>
              <td class="right">${item.qty} ${item.unit}</td>
              <td class="right">${item.price.toFixed(2)} DH</td>
              <td class="right">${(item.price * item.qty).toFixed(2)} DH</td>
            </tr>
          `).join('')}
        </table>
        <div class="totals">
          <div><span>Sous-total</span><span>${items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)} DH</span></div>
          ${sale.discount_total > 0 ? `<div><span>Remise</span><span>-${sale.discount_total.toFixed(2)} DH</span></div>` : ''}
          <div><span>TVA (5%)</span><span>${sale.tax.toFixed(2)} DH</span></div>
          ${sale.delivery_fee > 0 ? `<div><span>Livraison</span><span>${sale.delivery_fee.toFixed(2)} DH</span></div>` : ''}
          <div class="grand"><span>Total</span><span>${sale.total.toFixed(2)} DH</span></div>
        </div>
        ${sale.note ? `<div class="note">Note: ${sale.note}</div>` : ''}
        <div class="signatures">
          <div class="signature-box"><div class="line">Signature du vendeur</div></div>
          <div class="signature-box"><div class="line">Signature du client</div></div>
        </div>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  } catch (err) {
    console.error(err);
  }
}

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      api.sales.list(),
      api.sales.stats(),
    ]).then(([s, st]) => {
      setSales(s);
      setStats(st);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  let filtered = search
    ? sales.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.invoice.toLowerCase().includes(search.toLowerCase())
      )
    : sales;
  if (filter !== 'all') {
    filtered = filtered.filter(s => s.payment_status === filter);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5 pb-8">
      <div className="py-2">
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('sales.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('sales.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#f0fdf4] dark:border-emerald-800/60 dark:to-emerald-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('sales.stat_revenue')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{t('sales.revenue_badge')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0F766E] dark:text-teal-400 leading-none">{stats ? `${stats.totalRevenue.toFixed(2)} DH` : '...'}</span>
            <span className="material-symbols-outlined text-2xl text-emerald-300 dark:text-emerald-400">payments</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#eff6ff] dark:border-blue-800/60 dark:to-blue-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('sales.stat_total_sales')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">{t('sales.sales_badge')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{stats ? stats.totalSales : '...'}</span>
            <span className="material-symbols-outlined text-2xl text-blue-300 dark:text-blue-400">receipt_long</span>
          </div>
        </div>
        <div className="h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br from-white dark:from-card to-[#fef2f2] dark:border-red-800/60 dark:to-red-950/40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{t('sales.stat_unpaid_debts')}</span>
            <span className="flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">{t('sales.unpaid_badge')}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-extrabold text-[#ef4444] leading-none">{stats ? `${stats.pendingDebts.toFixed(2)} DH` : '...'}</span>
            <span className="material-symbols-outlined text-2xl text-red-300 dark:text-red-400">pending_actions</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground text-lg">search</span>
          <input
            type="text"
            placeholder={t('sales.search')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 h-10 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all"
          />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-10 rounded-[20px] border-[#F1F5F9] dark:border-border text-xs text-[#64748B] dark:text-muted-foreground font-medium">
            <SelectValue placeholder={t('sales.filter_all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('sales.filter_all')}</SelectItem>
            <SelectItem value="paid">{t('sales.filter_paid')}</SelectItem>
            <SelectItem value="partial">{t('sales.filter_partial')}</SelectItem>
            <SelectItem value="unpaid">{t('sales.filter_unpaid')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border bg-gradient-to-br from-white via-white to-[#E2E8F0] dark:from-card dark:via-card dark:to-white/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] dark:border-border">
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.invoice')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.date')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.customer')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.items')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.method')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.total')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.status')}</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-wider uppercase text-left">{t('sales.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.id} className="group hover:bg-[#f8fafc] dark:hover:bg-accent transition-colors cursor-pointer border-b border-[#F1F5F9] dark:border-border" onClick={() => setSelectedSaleId(s.id)}>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0F766E] dark:text-teal-400">{s.invoice}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-[#0f172a] dark:text-foreground">{s.date}</span>
                    <span className="text-[10px] text-[#64748B] dark:text-muted-foreground ml-1">{s.time}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center text-[#0F766E] dark:text-teal-400 font-bold text-[10px] shrink-0">{s.initials}</div>
                      <span className="text-xs font-semibold text-[#0f172a] dark:text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B] dark:text-muted-foreground">{s.items}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 capitalize">
                      <span className="material-symbols-outlined text-sm text-[#64748B] dark:text-muted-foreground">
                        {s.payment_method === 'card' ? 'credit_card' : s.payment_method === 'check' ? 'checkbook' : s.payment_method === 'credit' ? 'account_balance' : 'payments'}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-muted-foreground">
                        {s.payment_method === 'cash' ? t('sales.payment_cash') : s.payment_method === 'card' ? t('sales.payment_card') : s.payment_method === 'check' ? t('sales.payment_check') : s.payment_method === 'credit' ? t('sales.payment_credit') : s.payment_method}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0f172a] dark:text-foreground">{s.total}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.payment_status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                      s.payment_status === 'partial' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                      'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    }`}>
                      {s.payment_status === 'paid' ? t('sales.status_paid') : s.payment_status === 'partial' ? t('sales.status_partial') : t('sales.status_unpaid')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="text-[#0F766E] dark:text-teal-400 hover:bg-[#0F766E]/8 dark:hover:bg-teal-500/20 p-1.5 rounded-lg transition-colors" onClick={e => { e.stopPropagation(); reprintSale(s.id); }} title={t('sales.reprint')}>
                        <span className="material-symbols-outlined text-sm">print</span>
                      </button>
                      <button className="text-[#0F766E] dark:text-teal-400 hover:bg-[#0F766E]/8 dark:hover:bg-teal-500/20 p-1.5 rounded-lg transition-colors" onClick={e => { e.stopPropagation(); setSelectedSaleId(s.id); }}>
                        <span className="material-symbols-outlined text-sm">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && !loading && (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-xs text-[#64748B] dark:text-muted-foreground">{t('sales.no_results')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#F1F5F9] dark:border-border flex items-center justify-between">
          <p className="text-xs text-[#64748B] dark:text-muted-foreground">
            {filtered.length > 0
              ? t('sales.showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filtered.length), total: filtered.length })
              : t('sales.none')}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent disabled:opacity-30 transition-colors" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${p === page ? 'bg-[#0F766E] dark:bg-teal-600 text-white' : 'text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent'}`}
                  onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] dark:text-muted-foreground hover:bg-[#f1f5f9] dark:hover:bg-accent disabled:opacity-30 transition-colors" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {selectedSaleId && (
        <SaleDetail saleId={selectedSaleId} onClose={() => setSelectedSaleId(null)} />
      )}
    </div>
  );
}
