import { useState, useEffect } from 'react';
import { api } from '@/services/api';

const TAX_RATE = 0.05;

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.products.list(),
      api.customers.list(),
    ]).then(([prods, custs]) => {
      setProducts(prods);
      setCustomers(custs);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...new Set(products.map(p => p.category))];
  const filtered = activeCategory === 'Tous'
    ? products
    : products.filter(p => p.category === activeCategory);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        qty: 1,
        unit: product.unit,
      }];
    });
  }

  function updateQty(productId, delta) {
    setCart(prev => {
      const item = prev.find(i => i.product_id === productId);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prev.filter(i => i.product_id !== productId);
      }
      return prev.map(i =>
        i.product_id === productId ? { ...i, qty: newQty } : i
      );
    });
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  async function confirmSale() {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await api.sales.create({
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          qty: item.qty,
          unit: item.unit,
        })),
      });
      setCart([]);
      setSuccessMsg(`Vente confirmée ! Total: ${total.toFixed(2)} DH`);
      setTimeout(() => setSuccessMsg(''), 4000);

      const prods = await api.products.list();
      setProducts(prods);
    } catch (err) {
      alert('Erreur lors de la validation de la vente: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-gutter h-full overflow-hidden relative">
      {successMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-6 py-3 rounded-xl shadow-xl font-bold text-body-md animate-pulse">
          {successMsg}
        </div>
      )}

      <div className="col-span-3 flex flex-col gap-gutter h-full overflow-hidden">
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Client</h2>
            <button className="text-primary hover:bg-primary-container/10 p-1 rounded-lg transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
          <div
            className="flex items-center gap-4 bg-surface-container p-3 rounded-lg cursor-pointer"
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
          >
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-body-md truncate">
                {selectedCustomer ? selectedCustomer.name : 'Client Libre'}
              </p>
              <p className="text-label-md text-on-surface-variant truncate">
                {selectedCustomer ? `${selectedCustomer.phone || 'Pas de téléphone'} · ${selectedCustomer.debt_balance.toFixed(2)} DH dû` : 'Compte par défaut'}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">
              {showCustomerDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          {showCustomerDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden">
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-md outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">person_off</span>
                  </div>
                  <div>
                    <p className="font-bold text-body-md">Client Libre</p>
                    <p className="text-label-md text-on-surface-variant">Vente sans compte</p>
                  </div>
                </button>
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                    className={`w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 ${
                      selectedCustomer?.id === c.id ? 'bg-primary-container/20' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="text-label-md font-bold text-secondary">
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-body-md truncate">{c.name}</p>
                      <p className="text-label-md text-on-surface-variant truncate">{c.phone || 'Pas de téléphone'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
                onClick={() => addToCart(p)}
                className="group bg-surface-container-lowest rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-outline-variant/20 relative overflow-hidden cursor-pointer active:scale-[0.97]"
              >
                {p.stock > 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-primary-container/20 text-on-primary-container px-2 py-1 rounded-full text-[10px] font-bold">
                      {p.stock} en stock
                    </span>
                  </div>
                )}
                {p.stock <= 0 && (
                  <div className="absolute inset-0 z-10 bg-surface-container-lowest/60 flex items-center justify-center">
                    <span className="bg-error/10 text-error px-4 py-2 rounded-full text-label-md font-bold">Rupture</span>
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
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    className="bg-primary-container text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  >
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
              <p className="text-label-md text-on-surface-variant">
                {totalItems > 0 ? `${totalItems} article${totalItems > 1 ? 's' : ''}` : 'Aucun article'}
              </p>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-error hover:bg-error-container/20 p-2 rounded-lg transition-colors">
                <span className="material-symbols-outlined">delete_sweep</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <p className="text-on-surface-variant text-body-md text-center py-12">
                Ajoutez des produits depuis la liste
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="bg-surface-container rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-body-md text-on-surface truncate">{item.product_name}</h4>
                      <p className="text-label-md text-on-surface-variant">{item.price.toFixed(2)} DH / {item.unit}</p>
                    </div>
                    <button
                      onClick={() => updateQty(item.product_id, -item.qty)}
                      className="text-error hover:bg-error-container/20 p-1 rounded-lg ml-2 shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg p-1">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        className="w-9 h-9 rounded-md bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-highest/80 transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="font-bold text-body-lg text-on-surface min-w-[3ch] text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        className="w-9 h-9 rounded-md bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary-container/80 transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                    <p className="font-bold text-body-lg text-primary">
                      {(item.price * item.qty).toFixed(2)} DH
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-surface-container-low rounded-b-2xl border-t border-outline-variant/30">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Sous-total</span>
                <span className="font-bold text-on-surface">{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">TVA (5%)</span>
                <span className="font-bold text-on-surface">{tax.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-outline-variant/20">
                <span className="font-bold text-headline-sm text-on-surface">Total</span>
                <span className="font-bold text-headline-sm text-primary">{total.toFixed(2)} DH</span>
              </div>
            </div>

            <button
              onClick={confirmSale}
              disabled={cart.length === 0 || submitting}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all ${
                cart.length === 0
                  ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                  : 'bg-primary text-on-primary shadow-primary/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Traitement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">payments</span>
                  Confirmer la vente
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
