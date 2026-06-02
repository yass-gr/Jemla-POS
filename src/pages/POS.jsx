import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products.list().then(data => {
      setProducts(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...new Set(products.map(p => p.category))];

  const filtered = activeCategory === 'Tous'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="grid grid-cols-12 gap-gutter h-full overflow-hidden">
      <div className="col-span-3 flex flex-col gap-gutter h-full overflow-hidden">
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Client</h2>
            <button className="text-primary hover:bg-primary-container/10 p-1 rounded-lg transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
          <div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">person</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-body-md">Client Libre</p>
              <p className="text-label-md text-on-surface-variant">Compte par défaut</p>
            </div>
            <button className="material-symbols-outlined text-on-surface-variant">edit</button>
          </div>
        </section>
        <section className="flex-1 flex flex-col overflow-hidden">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Catégories</h2>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`p-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-primary-container/20 border border-outline-variant/20'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {cat === 'Tous' ? 'apps' : cat === 'Fruits' ? 'nutrition' : 'eco'}
                </span>
                <span className="text-label-md">{cat}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="col-span-6 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Produits <span className="text-on-surface-variant font-normal text-body-lg ml-2">({filtered.length} Articles)</span>
          </h2>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">view_module</span>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/20 animate-pulse">
                <div className="h-32 mb-4 rounded-2xl bg-surface-container" />
                <div className="h-3 w-16 bg-surface-container mb-2 rounded" />
                <div className="h-5 w-24 bg-surface-container mb-2 rounded" />
                <div className="h-6 w-20 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 overflow-y-auto pr-2 pb-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group bg-surface-container-lowest rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-outline-variant/20 relative overflow-hidden cursor-pointer"
              >
                {p.stock > 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-primary-container/20 text-on-primary-container px-2 py-1 rounded-full text-[10px] font-bold">
                      {p.stock} en stock
                    </span>
                  </div>
                )}
                <div className="h-32 mb-4 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-primary/30">inventory_2</span>
                </div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{p.category}</p>
                <h3 className="font-bold text-body-lg text-on-surface mb-2 truncate">{p.name}</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-primary font-bold text-headline-sm">{p.price.toFixed(2)} DH</p>
                    <p className="text-[10px] text-on-surface-variant">par {p.unit}</p>
                  </div>
                  <button className="bg-primary-container text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-3 flex flex-col h-full overflow-hidden">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col h-full border border-outline-variant/30">
          <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Panier</h2>
              <p className="text-label-md text-on-surface-variant">Aucun article</p>
            </div>
            <button className="text-error hover:bg-error-container/20 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-on-surface-variant text-body-md text-center py-12">Ajoutez des produits depuis la liste</p>
          </div>
          <div className="p-8 bg-surface-container-low rounded-b-2xl border-t border-outline-variant/30">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Sous-total</span>
                <span className="font-bold text-on-surface">0.00 DH</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">TVA (5%)</span>
                <span className="font-bold text-on-surface">0.00 DH</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-outline-variant/20">
                <span className="font-bold text-headline-sm text-on-surface">Total</span>
                <span className="font-bold text-headline-sm text-primary">0.00 DH</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className="flex flex-col items-center justify-center gap-2 bg-surface-container-highest/50 py-4 rounded-xl hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-on-surface">receipt_long</span>
                <span className="text-[10px] font-bold">Mettre en attente</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 bg-surface-container-highest/50 py-4 rounded-xl hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-on-surface">percent</span>
                <span className="text-[10px] font-bold">Remise</span>
              </button>
            </div>
            <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <span className="material-symbols-outlined">payments</span>
              Confirmer la vente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
