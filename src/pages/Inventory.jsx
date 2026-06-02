import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.inventory.list(),
      api.inventory.log(),
    ]).then(([p, l]) => {
      setProducts(p);
      setLog(l);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Inventaire</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Suivez vos niveaux de stock.</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-5 py-2.5 border-outline-variant/30">
            <p className="text-label-md text-on-surface-variant">Stock total</p>
            <p className="font-bold text-headline-sm text-primary">{totalStock} {products.length > 0 ? products[0].unit : 'u'}</p>
          </Card>
          <Card className="px-5 py-2.5 border-outline-variant/30">
            <p className="text-label-md text-on-surface-variant">Stock faible</p>
            <p className="font-bold text-headline-sm text-error">{lowStock} produits</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30">
            <h3 className="font-headline-sm">Niveaux de Stock</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-on-surface">{p.name}</TableCell>
                  <TableCell className="text-on-surface-variant">{p.category}</TableCell>
                  <TableCell className="text-right">{p.stock} {p.unit}</TableCell>
                  <TableCell>
                    <Badge variant={
                      p.stock < 10 ? 'destructive' : p.stock < 30 ? 'secondary' : 'success'
                    }>
                      {p.stock < 10 ? 'Faible' : p.stock < 30 ? 'Moyen' : 'Bon'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30">
            <h3 className="font-headline-sm">Activité Récente</h3>
          </div>
          <div className="divide-y divide-outline-variant/20 max-h-[500px] overflow-y-auto">
            {log.map(entry => (
              <div key={entry.id} className="px-6 py-4 hover:bg-surface-container/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-body-md text-on-surface truncate">{entry.product_name}</p>
                  <Badge variant={entry.change_qty > 0 ? 'success' : 'destructive'} className="text-label-md">
                    {entry.change_qty > 0 ? '+' : ''}{entry.change_qty}
                  </Badge>
                </div>
                <p className="text-label-md text-on-surface-variant">{entry.reason}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
