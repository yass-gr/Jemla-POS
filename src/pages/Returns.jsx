import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.returns.list().then(setReturns).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalReturned = returns.reduce((s, r) => s + r.qty, 0);

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Retours</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Gérez les produits retournés par les clients.</p>
        </div>
        <Card className="px-5 py-2.5 border-outline-variant/30">
          <p className="text-label-md text-on-surface-variant">Quantité retournée</p>
          <p className="font-bold text-headline-sm text-error">{totalReturned} unités</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Vente</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-bold text-on-surface">{r.product_name}</TableCell>
                <TableCell className="text-right">{r.qty}</TableCell>
                <TableCell className="text-on-surface-variant">{r.reason || '-'}</TableCell>
                <TableCell className="text-on-surface-variant">{r.sale_id ? `#INV-${String(r.sale_id).padStart(4, '0')}` : '-'}</TableCell>
                <TableCell className="text-on-surface-variant">{new Date(r.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!loading && returns.length === 0 && (
              <TableRow><TableCell colSpan="5" className="text-center py-12 text-on-surface-variant">Aucun retour enregistré</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
