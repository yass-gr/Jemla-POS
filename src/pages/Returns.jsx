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

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: '', qty: 1, reason: '', sale_id: '' });
  const [products, setProducts] = useState([]);

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

  useEffect(() => {
    Promise.all([
      api.returns.list(),
      api.products.list(),
    ]).then(([r, prods]) => {
      setReturns(r);
      setProducts(prods);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? returns.filter(r =>
        r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        (r.reason && r.reason.toLowerCase().includes(search.toLowerCase()))
      )
    : returns;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalReturned = paginated.reduce((s, r) => s + r.qty, 0);

  function openAdd() {
    setForm({ product_id: products[0]?.id || '', qty: 1, reason: '', sale_id: '' });
    setDialogOpen(true);
  }

  function openNumpad(value) {
    setNumpadTarget('qty');
    setNumpadInitValue(value);
    setNumpadTitle('Quantité');
    setNumpadAllowDecimal(false);
    setNumpadOpen(true);
  }

  function handleNumpadConfirm(value) {
    setForm(f => ({ ...f, qty: value }));
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function handleNumpadClose() {
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  async function handleSave() {
    if (!form.product_id || !form.qty) {
      toast.error('Veuillez sélectionner un produit et saisir une quantité');
      return;
    }
    try {
      const payload = {
        product_id: form.product_id,
        qty: form.qty,
        reason: form.reason || undefined,
        sale_id: form.sale_id ? parseInt(form.sale_id) : undefined,
      };
      const ret = await api.returns.create(payload);
      setReturns(prev => [ret, ...prev]);
      toast.success('Retour enregistré');
      setDialogOpen(false);
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Retours</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Gérez les produits retournés par les clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-5 py-2.5 border-outline-variant/30">
            <p className="text-label-md text-on-surface-variant">Quantité retournée</p>
            <p className="font-bold text-headline-sm text-error">{filtered.reduce((s, r) => s + r.qty, 0)} unités</p>
          </Card>
          <Button className="rounded-xl" onClick={openAdd}>
            <span className="material-symbols-outlined">add_circle</span>
            + Retour
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
            <Input
              type="text" placeholder="Rechercher un retour..."
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
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead>Raison</TableHead>
              <TableHead>Vente</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-bold text-on-surface">{r.product_name}</TableCell>
                <TableCell className="text-right">{r.qty}</TableCell>
                <TableCell className="text-on-surface-variant">{r.reason || '-'}</TableCell>
                <TableCell className="text-on-surface-variant">{r.sale_id ? `#INV-${String(r.sale_id).padStart(4, '0')}` : '-'}</TableCell>
                <TableCell className="text-on-surface-variant">{new Date(r.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {!loading && paginated.length === 0 && (
              <TableRow><TableCell colSpan="5" className="text-center py-12 text-on-surface-variant">Aucun retour enregistré</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-6 py-4 bg-surface-container/30 border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">
            {filtered.length > 0
              ? `Affichage ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} sur ${filtered.length} retours`
              : 'Aucun retour'}
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
            <DialogTitle>Nouveau retour</DialogTitle>
            <DialogDescription>Enregistrez un retour de produit par un client.</DialogDescription>
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
              <label className="text-sm font-medium text-on-surface mb-1 block">Quantité *</label>
              <button type="button" onClick={() => openNumpad(form.qty)}
                className="w-full h-10 rounded-md border border-outline-variant/50 bg-surface px-3 text-left text-sm text-on-surface">
                {form.qty}
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Raison</label>
              <Input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Motif du retour (ex: périmé, abîmé)" />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">N° de vente (optionnel)</label>
              <Input value={form.sale_id} onChange={e => setForm(f => ({ ...f, sale_id: e.target.value }))} placeholder="ID de la vente" type="number" />
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
