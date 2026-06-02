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
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((s) => (
              <TableRow key={s.id} className="group cursor-pointer" onClick={() => setSelectedSaleId(s.id)}>
                <TableCell>
                  <span className="text-body-md font-bold text-primary">{s.invoice}</span>
                </TableCell>
                <TableCell>
                  <div className="text-body-md text-on-surface">{s.date}</div>
                  <div className="text-label-md text-on-surface-variant">{s.time}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary-container text-secondary">{s.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-body-md font-medium text-on-surface">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-body-md text-on-surface-variant">{s.items}</div>
                </TableCell>
                <TableCell className="text-body-md font-bold text-on-surface">{s.total}</TableCell>
                <TableCell>
                  <Badge variant={s.status === 'Debt' ? 'destructive' : 'success'}>{s.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-on-surface-variant" onClick={e => { e.stopPropagation(); setSelectedSaleId(s.id); }}>
                    <span className="material-symbols-outlined">more_vert</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && !loading && (
              <TableRow><TableCell colSpan="7" className="text-center py-8 text-on-surface-variant">Aucune vente trouvée</TableCell></TableRow>
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
