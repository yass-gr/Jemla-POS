import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list().then(data => {
      setProducts(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const filtered = filter === 'all'
    ? products
    : filter === 'low'
      ? products.filter(p => p.stock < 10)
      : products.filter(p => p.category === filter);

  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestion des Produits</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Gérez votre catalogue, vos stocks et vos prix.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface border border-outline-variant text-on-surface px-4 py-2.5 rounded-xl font-label-md text-label-md flex items-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined mr-2 text-sm">file_download</span>
            Export CSV
          </button>
          <button className="bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-bold flex items-center hover:shadow-lg transition-all active:scale-95 shadow-md">
            <span className="material-symbols-outlined mr-2">add_circle</span>
            + Ajouter un produit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-6">
          <div className="flex items-center bg-surface-container p-1 rounded-xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-label-md ${filter === cat ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-secondary-container hover:bg-white/50'}`}
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
        </div>
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Total Produits</p>
            <p className="text-headline-md font-headline-md text-primary">{products.length}</p>
          </div>
          <div className="bg-error/5 border border-error/20 p-6 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-error">Stock Faible</p>
            <p className="text-headline-md font-headline-md text-error">{lowStockCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant/30">
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Produit</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Catégorie</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Unité</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Prix</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Stock</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {filtered.map((p) => (
              <tr key={p.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-variant overflow-hidden flex-shrink-0 border border-outline-variant/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">inventory_2</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface">{p.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full font-label-md text-label-md ${
                    p.category === 'Fruits' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.category}
                  </span>
                </td>
                <td className="px-8 py-5 text-center text-body-md text-on-surface-variant">{p.unit}</td>
                <td className="px-8 py-5 text-right font-headline-sm text-headline-sm text-primary">{p.price.toFixed(2)} DH</td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-40 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.stock < 10 ? 'bg-error' : 'bg-primary-container'}`}
                        style={{ width: `${Math.min((p.stock / 50) * 100, 100)}%` }} />
                    </div>
                    <p className={`font-label-md text-label-md ${p.stock < 10 ? 'text-error font-bold' : 'text-on-surface'}`}>
                      {p.stock} {p.unit}{p.stock < 10 ? ' (Stock Faible)' : ' en stock'}
                    </p>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-high rounded-lg text-primary">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-high rounded-lg text-error">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan="6" className="text-center py-8 text-on-surface-variant">Aucun produit trouvé</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-8 py-5 bg-surface-container/30 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">Affichage de {filtered.length} sur {products.length} produits</p>
        </div>
      </div>
    </div>
  );
}
