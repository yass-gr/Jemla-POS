import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list().then(data => {
      setProducts(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const filtered = products.filter(p => {
    const matchCategory = filter === 'all' ? true : filter === 'low' ? p.stock < 10 : p.category === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestion des Produits</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Gérez votre catalogue, vos stocks et vos prix.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export CSV
          </Button>
          <Button variant="secondary">
            <span className="material-symbols-outlined">add_circle</span>
            + Ajouter un produit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <Card className="md:col-span-8 p-6 flex flex-wrap items-center gap-6">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="flex items-center bg-surface-container p-1 rounded-xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-label-md transition-colors ${filter === cat ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-secondary-container hover:bg-white/50'}`}
              >
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>
          <div className="h-8 w-px bg-outline-variant" />
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={filter === 'low'}
              onChange={() => setFilter(filter === 'low' ? 'all' : 'low')}
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error" />
            <span className="ml-3 font-label-md text-label-md text-on-surface-variant">Stock Faible Uniquement</span>
          </label>
        </Card>
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20 p-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Total Produits</p>
            <p className="text-headline-md font-headline-md text-primary">{products.length}</p>
          </Card>
          <Card className="bg-error/5 border-error/20 p-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-error">Stock Faible</p>
            <p className="text-headline-md font-headline-md text-error">{lowStockCount}</p>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-center">Unité</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((p) => (
              <TableRow key={p.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-variant overflow-hidden flex-shrink-0 border border-outline-variant/20 flex items-center justify-center text-primary">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="material-symbols-outlined text-2xl">inventory_2</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{p.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={p.category === 'Fruits' ? 'default' : 'success'}>{p.category}</Badge>
                </TableCell>
                <TableCell className="text-center text-on-surface-variant">{p.unit}</TableCell>
                <TableCell className="text-right font-bold text-primary">{p.price.toFixed(2)} DH</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="w-40 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.stock < 10 ? 'bg-error' : 'bg-primary-container'}`}
                        style={{ width: `${Math.min((p.stock / 50) * 100, 100)}%` }} />
                    </div>
                    <p className={`font-label-md text-label-md ${p.stock < 10 ? 'text-error font-bold' : 'text-on-surface'}`}>
                      {p.stock} {p.unit}{p.stock < 10 ? ' (Stock Faible)' : ' en stock'}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-primary">
                      <span className="material-symbols-outlined">edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-error">
                      <span className="material-symbols-outlined">delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && !loading && (
              <TableRow><TableCell colSpan="6" className="text-center py-8 text-on-surface-variant">Aucun produit trouvé</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 bg-surface-container/30 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">
            {filtered.length > 0
              ? `Affichage ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} sur ${filtered.length} produits`
              : 'Aucun produit'}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost" size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPage(p)}
                  className={p === page ? '' : 'text-on-surface-variant'}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="ghost" size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
