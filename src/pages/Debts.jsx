import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Debts() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.customers.list().then(data => {
      setCustomers(data.filter(c => c.debt_balance > 0));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
      )
    : customers;

  const totalDebts = filtered.reduce((sum, c) => sum + c.debt_balance, 0);

  return (
    <div className="space-y-gutter pb-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestion des Dettes</h2>
        <p className="text-body-md text-on-surface-variant">Suivez les soldes impayés des clients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Total Dettes</p>
            <p className="text-headline-sm font-bold text-on-surface">{totalDebts.toFixed(2)} DH</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Créditeurs Actifs</p>
            <p className="text-headline-sm font-bold text-on-surface">{filtered.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Dette Moyenne</p>
            <p className="text-headline-sm font-bold text-primary">
              {filtered.length > 0 ? (totalDebts / filtered.length).toFixed(2) : '0.00'} DH
            </p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
            <Input
              type="text" placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="rounded-full shrink-0">Trié par: Montant</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Montant Dû</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-surface-container-highest text-primary font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold text-sm text-on-surface">{c.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className={`font-bold text-sm ${c.debt_balance > 5000 ? 'text-error' : 'text-on-surface'}`}>
                      {c.debt_balance.toFixed(2)} DH
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-on-surface">{c.phone || '-'}{c.email ? ` · ${c.email}` : ''}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="default" size="sm" className="rounded-xl">
                      Payer
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && !loading && (
              <TableRow><TableCell colSpan="4" className="text-center py-8 text-on-surface-variant">Aucune dette impayée</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">{filtered.length} clients avec dettes</p>
        </div>
      </Card>
    </div>
  );
}
