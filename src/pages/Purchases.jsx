import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.purchases.list().then(setPurchases).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Achats</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Suivez vos approvisionnements au marché de gros.</p>
        </div>
        <Card className="px-5 py-2.5 border-outline-variant/30">
          <p className="text-label-md text-on-surface-variant">Total dépensé</p>
          <p className="font-bold text-headline-sm text-primary">{totalSpent.toFixed(2)} DH</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-on-surface">{p.product_name}</TableCell>
                <TableCell className="text-on-surface-variant">{p.supplier || '-'}</TableCell>
                <TableCell className="text-right">{p.qty}</TableCell>
                <TableCell className="text-right">{p.unit_price.toFixed(2)} DH</TableCell>
                <TableCell className="text-right font-bold">{p.total.toFixed(2)} DH</TableCell>
                <TableCell className="text-on-surface-variant">{new Date(p.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!loading && purchases.length === 0 && (
              <TableRow><TableCell colSpan="6" className="text-center py-12 text-on-surface-variant">Aucun achat enregistré</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
