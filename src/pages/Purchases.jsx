import { useState, useEffect } from 'react';
import { api } from '@/services/api';

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
        <div className="bg-primary/10 px-5 py-2.5 rounded-xl">
          <p className="text-label-md text-on-surface-variant">Total dépensé</p>
          <p className="font-bold text-headline-sm text-primary">{totalSpent.toFixed(2)} DH</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container/50">
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Produit</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Fournisseur</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase text-right">Quantité</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase text-right">Prix unitaire</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase text-right">Total</th>
              <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {purchases.map(p => (
              <tr key={p.id} className="hover:bg-surface-container/30 transition-colors">
                <td className="px-8 py-5 font-bold text-on-surface">{p.product_name}</td>
                <td className="px-8 py-5 text-on-surface-variant">{p.supplier || '-'}</td>
                <td className="px-8 py-5 text-right">{p.qty}</td>
                <td className="px-8 py-5 text-right">{p.unit_price.toFixed(2)} DH</td>
                <td className="px-8 py-5 text-right font-bold">{p.total.toFixed(2)} DH</td>
                <td className="px-8 py-5 text-on-surface-variant">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && purchases.length === 0 && (
              <tr><td colSpan="6" className="text-center py-12 text-on-surface-variant">Aucun achat enregistré</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
