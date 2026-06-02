import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.suppliers.list().then(setSuppliers).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Fournisseurs</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Gérez vos fournisseurs de produits.</p>
        </div>
        <Button className="rounded-xl">
          <span className="material-symbols-outlined">add_circle</span>
          + Ajouter
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-bold text-on-surface">{s.name}</TableCell>
                <TableCell className="text-on-surface-variant">{s.phone || '-'}</TableCell>
                <TableCell className="text-on-surface-variant">{s.email || '-'}</TableCell>
                <TableCell className="text-on-surface-variant max-w-[200px] truncate">{s.address || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="rounded-full p-2">
                    <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && suppliers.length === 0 && (
              <TableRow><TableCell colSpan="5" className="text-center py-12 text-on-surface-variant">Aucun fournisseur enregistré</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
