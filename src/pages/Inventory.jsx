import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      api.inventory.list(),
      api.inventory.log(),
    ]).then(([p, l]) => {
      setProducts(p);
      setLog(l);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  let filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;
  if (filter === 'low') {
    filtered = filtered.filter(p => p.stock < 10);
  } else if (filter === 'medium') {
    filtered = filtered.filter(p => p.stock >= 10 && p.stock < 30);
  } else if (filter === 'good') {
    filtered = filtered.filter(p => p.stock >= 30);
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStock = products.filter(p => p.stock < 10).length;

  return (
    <div className="space-y-gutter pb-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Inventaire</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Suivez vos niveaux de stock.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Stock Total</p>
            <p className="text-headline-sm font-bold text-primary">{totalStock} {products.length > 0 ? products[0].unit : 'u'}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Stock Faible</p>
            <p className="text-headline-sm font-bold text-error">{lowStock} produits</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined">category</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Catégories</p>
            <p className="text-headline-sm font-bold text-on-surface">{new Set(products.map(p => p.category)).size}</p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
          <Input
            type="text" placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filtrer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="low">Faible (&lt;10)</SelectItem>
            <SelectItem value="medium">Moyen (10-30)</SelectItem>
            <SelectItem value="good">Bon (&gt;30)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <Card className="lg:col-span-2 overflow-hidden">
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
              {filtered.map(p => (
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
              {filtered.length === 0 && !loading && (
                <TableRow><TableCell colSpan="4" className="text-center py-8 text-on-surface-variant">Aucun produit trouvé</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 py-3 border-b border-outline-variant/20">
            <h3 className="font-headline-sm">Activité Récente</h3>
          </div>
          <div className="divide-y divide-outline-variant/20 max-h-[500px] overflow-y-auto">
            {log.map(entry => (
              <div key={entry.id} className="px-4 py-3 hover:bg-surface-container/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-on-surface truncate">{entry.product_name}</p>
                  <Badge variant={entry.change_qty > 0 ? 'success' : 'destructive'} className="text-label-md">
                    {entry.change_qty > 0 ? '+' : ''}{entry.change_qty}
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant">{entry.reason}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
