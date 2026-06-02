import { useState, useEffect } from 'react';
import { api } from '@/services/api';

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
        <div className="bg-error/10 px-5 py-2.5 rounded-xl">
          <p className="text-label-md text-on-surface-variant">Quantité retournée</p>
          <p className="font-bold text-headline-sm text-error">{totalReturned} unités</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container/50">
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Produit</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase text-right">Quantité</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Raison</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Vente</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {returns.map(r => (
              <tr key={r.id} className="hover:bg-surface-container/30 transition-colors">
                <td className="px-8 py-5 font-bold text-on-surface">{r.product_name}</td>
                <td className="px-8 py-5 text-right">{r.qty}</td>
                <td className="px-8 py-5 text-on-surface-variant">{r.reason || '-'}</td>
                <td className="px-8 py-5 text-on-surface-variant">{r.sale_id ? `#INV-${String(r.sale_id).padStart(4, '0')}` : '-'}</td>
                <td className="px-8 py-5 text-on-surface-variant">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && returns.length === 0 && (
              <tr><td colSpan="5" className="text-center py-12 text-on-surface-variant">Aucun retour enregistré</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
