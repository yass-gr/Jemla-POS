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
import { toast } from 'sonner';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    api.suppliers.list().then(setSuppliers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone && s.phone.includes(search)))
    : suppliers;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '' });
    setDialogOpen(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({ name: supplier.name, phone: supplier.phone || '', email: supplier.email || '', address: supplier.address || '' });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    try {
      if (editing) {
        await api.suppliers.update(editing.id, form);
        setSuppliers(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
        toast.success('Fournisseur modifié');
      } else {
        const supplier = await api.suppliers.create(form);
        setSuppliers(prev => [supplier, ...prev]);
        toast.success('Fournisseur ajouté');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.suppliers.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast.success('Fournisseur supprimé');
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Fournisseurs</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Gérez vos fournisseurs de produits.</p>
        </div>
        <Button className="rounded-xl" onClick={openAdd}>
          <span className="material-symbols-outlined">add_circle</span>
          + Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">business</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Total Fournisseurs</p>
            <p className="text-headline-sm font-bold text-primary">{suppliers.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined">contact_phone</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Avec téléphone</p>
            <p className="text-headline-sm font-bold text-on-surface">{suppliers.filter(s => s.phone).length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined">email</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Avec email</p>
            <p className="text-headline-sm font-bold text-on-surface">{suppliers.filter(s => s.email).length}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">search</span>
            <Input
              type="text" placeholder="Rechercher un fournisseur..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(s => (
              <TableRow key={s.id} className="group">
                <TableCell>
                  <p className="font-bold text-on-surface">{s.name}</p>
                </TableCell>
                <TableCell className="text-on-surface-variant">{s.phone || '-'}</TableCell>
                <TableCell className="text-on-surface-variant">{s.email || '-'}</TableCell>
                <TableCell className="text-on-surface-variant max-w-[200px] truncate">{s.address || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-primary" onClick={() => openEdit(s)}>
                      <span className="material-symbols-outlined">edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-error" onClick={() => handleDelete(s.id)}>
                      <span className="material-symbols-outlined">delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && !loading && (
              <TableRow><TableCell colSpan="5" className="text-center py-8 text-on-surface-variant">Aucun fournisseur enregistré</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-3 bg-surface-container/30 border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">
            {filtered.length > 0
              ? `Affichage ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} sur ${filtered.length} fournisseurs`
              : 'Aucun fournisseur'}
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
            <DialogTitle>{editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifiez les informations du fournisseur.' : 'Ajoutez un nouveau fournisseur.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Nom *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom du fournisseur" />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Téléphone</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0612345678" />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Email</label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-on-surface mb-1 block">Adresse</label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Adresse" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave}>{editing ? 'Modifier' : 'Ajouter'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
