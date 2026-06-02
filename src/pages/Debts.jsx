import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Debts() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.customers.list().then(data => {
      setCustomers(data.filter(c => c.debt_balance > 0));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalDebts = customers.reduce((sum, c) => sum + c.debt_balance, 0);

  return (
    <div className="space-y-6 pb-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestion des Dettes</h2>
          <p className="text-body-md text-on-surface-variant">Suivez les soldes impayés des clients.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-sm">file_download</span> Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Total Dettes</span>
            <div className="p-2 bg-error-container text-on-error-container rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">{totalDebts.toFixed(2)} DH</p>
            <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              {customers.length} comptes actifs
            </p>
          </div>
        </Card>
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Créditeurs Actifs</span>
            <div className="p-2 bg-secondary-container text-on-secondary-fixed-variant rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">{customers.length}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Avec soldes impayés</p>
          </div>
        </Card>
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Dette Moyenne</span>
            <div className="p-2 bg-primary-container text-on-primary rounded-lg">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">
              {customers.length > 0 ? (totalDebts / customers.length).toFixed(2) : '0.00'} DH
            </p>
            <p className="text-label-md text-on-surface-variant mt-1">Par compte</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Soldes Impayés</h3>
          <Badge variant="secondary" className="rounded-full">Trié par: Montant</Badge>
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
            {customers.map((c) => {
              const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-surface-container-highest text-primary font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <p className="text-body-lg font-bold text-on-surface">{c.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className={`text-body-lg font-extrabold ${c.debt_balance > 5000 ? 'text-error' : 'text-on-surface'}`}>
                      {c.debt_balance.toFixed(2)} DH
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-on-surface">{c.phone || '-'}</p>
                    <p className="text-label-md text-on-surface-variant">{c.email || '-'}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="default" size="sm" className="rounded-xl">
                      Payer
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {customers.length === 0 && !loading && (
              <TableRow><TableCell colSpan="4" className="text-center py-8 text-on-surface-variant">Aucune dette impayée</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">{customers.length} clients avec dettes</p>
        </div>
      </Card>
    </div>
  );
}
