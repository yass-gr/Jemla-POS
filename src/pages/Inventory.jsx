import { useState, useEffect } from 'react';
import { api } from '@/services/api';

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
          <div className="bg-primary/10 px-5 py-2.5 rounded-xl text-center">
            <p className="text-label-md text-on-surface-variant">Stock total</p>
            <p className="font-bold text-headline-sm text-primary">{totalStock} {products.length > 0 ? products[0].unit : 'u'}</p>
          </div>
          <div className="bg-error/10 px-5 py-2.5 rounded-xl text-center">
            <p className="text-label-md text-on-surface-variant">Stock faible</p>
            <p className="font-bold text-headline-sm text-error">{lowStock} produits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30">
            <h3 className="font-headline-sm">Niveaux de Stock</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/50">
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Produit</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Catégorie</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase text-right">Stock</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-8 py-4 font-bold text-on-surface">{p.name}</td>
                  <td className="px-8 py-4 text-on-surface-variant">{p.category}</td>
                  <td className="px-8 py-4 text-right">{p.stock} {p.unit}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-label-md font-bold ${p.stock < 10 ? 'bg-error/10 text-error' : p.stock < 30 ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                      {p.stock < 10 ? 'Faible' : p.stock < 30 ? 'Moyen' : 'Bon'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30">
            <h3 className="font-headline-sm">Activité Récente</h3>
          </div>
          <div className="divide-y divide-outline-variant/20 max-h-[500px] overflow-y-auto">
            {log.map(entry => (
              <div key={entry.id} className="px-6 py-4 hover:bg-surface-container/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-body-md text-on-surface truncate">{entry.product_name}</p>
                  <span className={`font-bold text-label-md ${entry.change_qty > 0 ? 'text-primary' : 'text-error'}`}>
                    {entry.change_qty > 0 ? '+' : ''}{entry.change_qty}
                  </span>
                </div>
                <p className="text-label-md text-on-surface-variant">{entry.reason}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
