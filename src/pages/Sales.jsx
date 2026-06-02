import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import SaleDetail from '@/components/SaleDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

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
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.sales.list(),
      api.sales.stats(),
    ]).then(([s, st]) => {
      setSales(s);
      setStats(st);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? sales.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.invoice.toLowerCase().includes(search.toLowerCase())
      )
    : sales;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 pb-xl">
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Historique des Ventes</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Consultez et gérez vos transactions.</p>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Revenu Total</p>
              <p className="text-headline-sm font-bold text-primary">
                {stats ? `${stats.totalRevenue.toFixed(2)} DH` : '...'}
              </p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Total Ventes</p>
              <p className="text-headline-sm font-bold text-on-surface">{stats ? stats.totalSales : '...'}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-error-container/10 rounded-xl flex items-center justify-center text-error">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Dettes Impayées</p>
              <p className="text-headline-sm font-bold text-error">
                {stats ? `${stats.pendingDebts.toFixed(2)} DH` : '...'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            Ce Mois
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Statut: Tous
          </Button>
        </div>
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
          <Input
            type="text"
            placeholder="Rechercher une vente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined">download</span>
          </Button>
          <Button variant="ghost" size="icon">
            <span className="material-symbols-outlined">print</span>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((s) => (
              <TableRow key={s.id} className="group cursor-pointer" onClick={() => setSelectedSaleId(s.id)}>
                <TableCell>
                  <span className="font-bold text-primary">{s.invoice}</span>
                </TableCell>
                <TableCell>
                  <div className="text-on-surface">{s.date}</div>
                  <div className="text-xs text-on-surface-variant">{s.time}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary-container text-secondary">{s.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-on-surface">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-on-surface-variant">{s.items}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 capitalize">
                    <span className="material-symbols-outlined text-lg text-on-surface-variant">
                      {s.payment_method === 'card' ? 'credit_card' : s.payment_method === 'check' ? 'checkbook' : s.payment_method === 'credit' ? 'account_balance' : 'payments'}
                    </span>
                    <span className="text-on-surface-variant">
                      {s.payment_method === 'cash' ? 'Espèces' : s.payment_method === 'card' ? 'Carte' : s.payment_method === 'check' ? 'Chèque' : s.payment_method === 'credit' ? 'Crédit' : s.payment_method}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-on-surface">{s.total}</TableCell>
                <TableCell>
                  <Badge variant={s.payment_status === 'paid' ? 'success' : s.payment_status === 'partial' ? 'warning' : 'destructive'}>
                    {s.payment_status === 'paid' ? 'Payé' : s.payment_status === 'partial' ? 'Partiel' : 'Impayé'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-on-surface-variant" onClick={e => { e.stopPropagation(); reprintSale(s.id); }} title="Réimprimer">
                      <span className="material-symbols-outlined">print</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-on-surface-variant" onClick={e => { e.stopPropagation(); setSelectedSaleId(s.id); }}>
                      <span className="material-symbols-outlined">more_vert</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && !loading && (
              <TableRow><TableCell colSpan="8" className="text-center py-8 text-on-surface-variant">Aucune vente trouvée</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-8 py-5 bg-surface-container/30 border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant font-medium">
            {filtered.length > 0
              ? `Affichage ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} sur ${filtered.length} ventes`
              : 'Aucune vente'}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <span className="material-symbols-outlined">chevron_left</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? 'default' : 'ghost'} size="icon" onClick={() => setPage(p)}
                  className={p === page ? '' : 'text-on-surface-variant'}>
                  {p}
                </Button>
              ))}
              <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <span className="material-symbols-outlined">chevron_right</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
      {selectedSaleId && (
        <SaleDetail saleId={selectedSaleId} onClose={() => setSelectedSaleId(null)} />
      )}
    </div>
  );
}
