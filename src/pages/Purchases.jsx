import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import NumpadModal from '@/components/ui/NumpadModal';
import { toast } from 'sonner';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', supplier: '', qty: 1, unit_price: 0 });
  const [products, setProducts] = useState([]);

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.purchases.list(),
      api.products.list(),
    ]).then(([p, prods]) => {
      setPurchases(p);
      setProducts(prods);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? purchases.filter(p =>
        p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        (p.supplier && p.supplier.toLowerCase().includes(search.toLowerCase()))
      )
    : purchases;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);

  function openAdd() {
    setForm({ product_id: products[0]?.id || '', supplier: '', qty: 1, unit_price: 0 });
    setDialogOpen(true);
  }

  function openNumpad(field, value) {
    setNumpadTarget(field);
    setNumpadInitValue(value);
    setNumpadTitle(field === 'qty' ? 'Quantité' : 'Prix unitaire');
    setNumpadAllowDecimal(field === 'unit_price');
    setNumpadOpen(true);
  }

  function handleNumpadConfirm(value) {
    setForm(f => ({ ...f, [numpadTarget]: value }));
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function handleNumpadClose() {
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  async function handleSave() {
    if (!form.product_id || !form.qty || !form.unit_price) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    try {
      const purchase = await api.purchases.create(form);
      setPurchases(prev => [purchase, ...prev]);
      toast.success('Achat enregistré');
      setDialogOpen(false);
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Achats</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Suivez vos approvisionnements au marché de gros.</p>
        </div>
        <Button className="rounded-xl" onClick={openAdd}>
          <span className="material-symbols-outlined">add_circle</span>
          + Achat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">shopping_cart</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Total Dépensé</p>
            <p className="text-headline-sm font-bold text-primary">{totalSpent.toFixed(2)} DH</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Total Achats</p>
            <p className="text-headline-sm font-bold text-on-surface">{purchases.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Produits distincts</p>
            <p className="text-headline-sm font-bold text-on-surface">{new Set(purchases.map(p => p.product_name)).size}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
            <Input
              type="text" placeholder="Rechercher un achat..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </div>
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
            {paginated.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-on-surface">{p.product_name}</TableCell>
                <TableCell className="text-on-surface-variant">{p.supplier || '-'}</TableCell>
                <TableCell className="text-right">{p.qty}</TableCell>
                <TableCell className="text-right">{p.unit_price.toFixed(2)} DH</TableCell>
                <TableCell className="text-right font-bold">{p.total.toFixed(2)} DH</TableCell>
                <TableCell className="text-on-surface-variant">{new Date(p.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!loading && paginated.length === 0 && (
              <TableRow><TableCell colSpan="6" className="text-center py-8 text-on-surface-variant">Aucun achat enregistré</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 bg-surface-container/30 border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">
            {filtered.length > 0
              ? `Affichage ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} sur ${filtered.length} achats`
              : 'Aucun achat'}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel achat</DialogTitle>
            <DialogDescription>Enregistrez un approvisionnement auprès d'un fournisseur.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Produit *</label>
              <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un produit" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Fournisseur</label>
              <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Nom du fournisseur" />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Quantité *</label>
              <button type="button" onClick={() => openNumpad('qty', form.qty)}
                className="w-full h-10 rounded-md border border-outline-variant/50 bg-surface px-3 text-left text-sm text-on-surface">
                {form.qty}
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Prix unitaire (DH) *</label>
              <button type="button" onClick={() => openNumpad('unit_price', form.unit_price)}
                className="w-full h-10 rounded-md border border-outline-variant/50 bg-surface px-3 text-left text-sm text-on-surface">
                {form.unit_price.toFixed(2)} DH
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NumpadModal
        open={numpadOpen}
        title={numpadTitle}
        value={numpadInitValue}
        allowDecimal={numpadAllowDecimal}
        onConfirm={handleNumpadConfirm}
        onClose={handleNumpadClose}
      />
    </div>
  );
}
