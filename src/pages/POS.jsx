import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [showCartMobile, setShowCartMobile] = useState(false);

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
      setShowCartMobile(false);
      toast.success(`Vente confirmée ! Total: ${total.toFixed(2)} DH`);

      const prods = await api.products.list();
      setProducts(prods);
    } catch (err) {
      toast.error('Erreur lors de la validation de la vente: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-gutter min-h-0">
      {/* Left panel: Client + Categories */}
      <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-gutter">
        <section className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-sm border border-outline-variant/30 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Client</h2>
            <button className="text-primary hover:bg-primary-container/10 p-1 rounded-lg transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
          <div
            className="flex items-center gap-3 bg-surface-container p-3 rounded-lg cursor-pointer"
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
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

        <section className="flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3 sm:mb-4">Catégories</h2>
          <div className="flex lg:grid lg:grid-cols-2 gap-2 sm:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 lg:p-5 rounded-xl flex items-center lg:flex-col lg:items-center gap-2 transition-all active:scale-95 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-primary-container/20 border border-outline-variant/20'
                }`}
              >
                <span className="material-symbols-outlined text-xl lg:text-2xl">
                  {cat === 'Tous' ? 'apps' : cat === 'Fruits' ? 'nutrition' : 'eco'}
                </span>
                <span className="text-label-md whitespace-nowrap">{cat}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Center: Products */}
      <div className="lg:col-span-6 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Produits <span className="text-on-surface-variant font-normal text-body-lg ml-2">({filtered.length} Articles)</span>
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-outline-variant/20 animate-pulse aspect-[4/5] flex flex-col">
                <div className="flex-1 mb-2 rounded-xl bg-surface-container" />
                <div className="h-2 w-12 bg-surface-container mx-auto mb-1 rounded" />
                <div className="h-3 w-16 bg-surface-container mx-auto rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pr-2 pb-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="group bg-surface-container-lowest rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all border border-outline-variant/20 relative overflow-hidden cursor-pointer active:scale-[0.97] aspect-[4/5] flex flex-col"
              >
                {p.stock > 0 && (
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <Badge variant="default" className="text-[9px] px-1.5 py-0.5">{p.stock}</Badge>
                  </div>
                )}
                {p.stock <= 0 && (
                  <div className="absolute inset-0 z-10 bg-surface-container-lowest/60 flex items-center justify-center rounded-2xl">
                    <Badge variant="destructive" className="text-[10px] px-3 py-1">Rupture</Badge>
                  </div>
                )}
                <div className="flex-1 mb-2 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary/30">inventory_2</span>
                </div>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-wider text-center truncate">{p.category}</p>
                <h3 className="font-bold text-xs text-on-surface text-center truncate">{p.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-primary font-bold text-xs">{p.price.toFixed(2)} <span className="text-[8px]">DH</span></p>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    className="bg-primary-container text-on-primary w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel: Cart - hidden on mobile unless toggled */}
      <div className="hidden lg:flex lg:col-span-3 flex-col h-full">
        <CartPanel
          cart={cart}
          totalItems={totalItems}
          subtotal={subtotal}
          tax={tax}
          total={total}
          submitting={submitting}
          onUpdateQty={updateQty}
          onClear={clearCart}
          onConfirm={confirmSale}
        />
      </div>

      {/* Mobile cart button + drawer */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-4 bg-surface border-t border-outline-variant/30 shadow-2xl">
          <Button
            onClick={() => setShowCartMobile(true)}
            className="w-full h-auto py-4 rounded-2xl text-base"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            Voir le panier ({totalItems} article{totalItems > 1 ? 's' : ''}) — {total.toFixed(2)} DH
          </Button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Panier</h2>
            <button
              onClick={() => setShowCartMobile(false)}
              className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <div className="p-4 bg-surface-container-low border-t border-outline-variant/30">
            <div className="space-y-2 mb-4">
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearCart} className="flex-1 py-3 rounded-2xl">
                Vider
              </Button>
              <Button
                onClick={confirmSale}
                disabled={cart.length === 0 || submitting}
                className="flex-1 py-3 rounded-2xl"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartPanel({ cart, totalItems, subtotal, tax, total, submitting, onUpdateQty, onClear, onConfirm }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col h-full border border-outline-variant/30">
      <div className="p-6 sm:p-8 border-b border-outline-variant/30 flex justify-between items-center">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Panier</h2>
          <p className="text-label-md text-on-surface-variant">
            {totalItems > 0 ? `${totalItems} article${totalItems > 1 ? 's' : ''}` : 'Aucun article'}
          </p>
        </div>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-error hover:bg-error-container/20 p-2 rounded-lg transition-colors">
            <span className="material-symbols-outlined">delete_sweep</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                  onClick={() => onUpdateQty(item.product_id, -item.qty)}
                  className="text-error hover:bg-error-container/20 p-1 rounded-lg ml-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg p-1">
                  <button
                    onClick={() => onUpdateQty(item.product_id, -1)}
                    className="w-9 h-9 rounded-md bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-highest/80 transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span className="font-bold text-body-lg text-on-surface min-w-[3ch] text-center">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.product_id, 1)}
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

      <div className="p-6 sm:p-8 bg-surface-container-low rounded-b-2xl border-t border-outline-variant/30">
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

        <Button
          onClick={onConfirm}
          disabled={cart.length === 0 || submitting}
          className="w-full h-auto py-4 rounded-2xl text-base"
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
        </Button>
      </div>
    </div>
  );
}
