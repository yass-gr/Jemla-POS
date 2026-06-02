import { useState, useEffect } from 'react';
import { api } from '@/services/api';

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
        <button className="bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          + Ajouter
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container/50">
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Nom</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Téléphone</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Email</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Adresse</th>
              <th className="px-8 py-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-surface-container/30 transition-colors">
                <td className="px-8 py-5 font-bold text-on-surface">{s.name}</td>
                <td className="px-8 py-5 text-on-surface-variant">{s.phone || '-'}</td>
                <td className="px-8 py-5 text-on-surface-variant">{s.email || '-'}</td>
                <td className="px-8 py-5 text-on-surface-variant max-w-[200px] truncate">{s.address || '-'}</td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined text-on-surface-variant">more_vert</span></button>
                </td>
              </tr>
            ))}
            {!loading && suppliers.length === 0 && (
              <tr><td colSpan="5" className="text-center py-12 text-on-surface-variant">Aucun fournisseur enregistré</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
