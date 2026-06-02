import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.customers.list().then(data => {
      setCustomers(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalDebt = customers.reduce((sum, c) => sum + c.debt_balance, 0);
  const activeDebt = customers.filter(c => c.debt_balance > 0).length;

  const filtered = search
    ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search)))
    : customers;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-gutter pb-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Clients</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Gestion des comptes et des soldes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Total Clients</p>
            <p className="text-headline-sm font-bold text-primary">{customers.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Dettes Impayées</p>
            <p className="text-headline-sm font-bold text-error">{totalDebt.toFixed(2)} DH</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Comptes avec dettes</p>
            <p className="text-headline-sm font-bold text-on-surface">{activeDebt}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
            <Input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom du Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-center">Solde Dette</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c) => {
              const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-on-surface leading-none">{c.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-on-surface">{c.phone || '-'}{c.email ? ` · ${c.email}` : ''}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-on-surface-variant max-w-[200px] truncate">{c.address || '-'}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.debt_balance > 0 ? 'destructive' : 'success'}>
                      {c.debt_balance.toFixed(2)} DH
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-on-surface-variant">
                      <span className="material-symbols-outlined">more_vert</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && !loading && (
              <TableRow><TableCell colSpan="5" className="text-center py-8 text-on-surface-variant">Aucun client trouvé</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <div className="px-4 py-3 bg-surface-container/30 border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">
            {filtered.length > 0
              ? `Affichage ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} sur ${filtered.length} clients`
              : 'Aucun client'}
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
    </div>
  );
}
