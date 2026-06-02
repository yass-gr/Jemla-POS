import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NumpadModal from '@/components/ui/NumpadModal';

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
  const [productSearch, setProductSearch] = useState('');

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

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
  const filtered = products.filter(p => {
    if (activeCategory !== 'Tous' && p.category !== activeCategory) return false;
    if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
    return true;
  });

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

  function setQtyDirect(productId, newQty) {
    setCart(prev => {
      const item = prev.find(i => i.product_id === productId);
      if (!item) return prev;
      if (newQty <= 0) {
        return prev.filter(i => i.product_id !== productId);
      }
      return prev.map(i =>
        i.product_id === productId ? { ...i, qty: newQty } : i
      );
    });
  }

  function updatePrice(productId, newPrice) {
    setCart(prev => prev.map(item =>
      item.product_id === productId ? { ...item, price: Math.max(0, parseFloat(newPrice) || 0) } : item
    ));
  }

  function clearCart() {
    setCart([]);
  }

  function openNumpad(type, productId) {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;
    const currentValue = type === 'price' ? item.price : item.qty;
    setNumpadTarget({ type, productId });
    setNumpadInitValue(currentValue);
    setNumpadTitle(type === 'price' ? 'Modifier le prix' : 'Modifier la quantité');
    setNumpadAllowDecimal(true);
    setNumpadOpen(true);
  }

  function handleNumpadConfirm(value) {
    if (!numpadTarget) return;
    if (numpadTarget.type === 'price') {
      updatePrice(numpadTarget.productId, value);
    } else {
      setQtyDirect(numpadTarget.productId, value);
    }
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function handleNumpadClose() {
    setNumpadOpen(false);
    setNumpadTarget(null);
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
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-4 lg:gap-gutter h-full min-h-0">

      {/* Desktop top bar: Categories */}
      <div className="hidden lg:flex lg:col-span-12 items-center gap-4 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
        <div className="flex items-center gap-2 overflow-x-auto flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shrink-0 text-sm ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {cat === 'Tous' ? 'apps' : cat === 'Fruits' ? 'nutrition' : 'eco'}
              </span>
              <span className="whitespace-nowrap text-label-md">{cat}</span>
            </button>
          ))}
        </div>
        <div className="relative shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="w-48 pl-9 pr-3 py-1.5 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Mobile: Categories */}
      <div className="lg:hidden flex flex-col gap-4">
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Catégories</h2>
            <div className="relative flex-1 max-w-[200px] ml-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-primary-container/20 border border-outline-variant/20'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {cat === 'Tous' ? 'apps' : cat === 'Fruits' ? 'nutrition' : 'eco'}
                </span>
                <span className="text-label-md whitespace-nowrap">{cat}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Products */}
      <div className="lg:col-span-8 flex flex-col min-h-0 lg:overflow-y-auto">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Produits <span className="text-on-surface-variant font-normal text-body-lg ml-2">({filtered.length} Articles)</span>
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 gap-3">
            {[1,2,3,4,5,6,7,8,9,10].map(i => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-outline-variant/20 animate-pulse flex flex-col">
                <div className="aspect-square mb-2 rounded-xl bg-surface-container" />
                <div className="h-2 w-12 bg-surface-container mx-auto mb-1 rounded" />
                <div className="h-3 w-16 bg-surface-container mx-auto rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 gap-3 pr-2 pb-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="group bg-surface-container-lowest rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all border border-outline-variant/20 relative overflow-hidden cursor-pointer active:scale-[0.97] flex flex-col"
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
                <div className="aspect-square mb-2 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary/30">inventory_2</span>
                  )}
                </div>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-wider text-center truncate">{p.category}</p>
                <h3 className="font-bold text-xs text-on-surface text-center truncate">{p.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-primary font-bold text-xs">{p.price.toFixed(2)} <span className="text-[8px]">DH</span></p>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    className="bg-primary-container text-on-primary w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Cart */}
      <div className="hidden lg:flex lg:col-span-4 flex-col self-start sticky top-0">
        <CartPanel
          cart={cart}
          totalItems={totalItems}
          subtotal={subtotal}
          tax={tax}
          total={total}
          submitting={submitting}
          onUpdateQty={updateQty}
          onUpdatePrice={updatePrice}
          onClear={clearCart}
          onConfirm={confirmSale}
          selectedCustomer={selectedCustomer}
          showCustomerDropdown={showCustomerDropdown}
          customerSearch={customerSearch}
          filteredCustomers={filteredCustomers}
          onToggleCustomer={() => setShowCustomerDropdown(prev => !prev)}
          onSelectCustomer={(c) => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(''); }}
          onClearCustomer={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); setCustomerSearch(''); }}
          onCustomerSearch={setCustomerSearch}
          onOpenNumpad={openNumpad}
        />
      </div>

      {/* Mobile cart button + drawer */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-surface border-t border-outline-variant/30 shadow-2xl">
          <Button
            onClick={() => setShowCartMobile(true)}
            className="w-full h-auto py-2.5 rounded-xl text-sm"
          >
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            Panier ({totalItems}) — {total.toFixed(2)} DH
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
          <div className="px-3 pt-3 pb-1 border-b border-outline-variant/20">
            <div className="relative">
              <div
                className="flex items-center gap-2 bg-surface-container p-2 rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={() => setShowCustomerDropdown(prev => !prev)}
              >
                <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xs text-secondary">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-on-surface truncate leading-tight">
                    {selectedCustomer ? selectedCustomer.name : 'Client Libre'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-xs text-on-surface-variant shrink-0">
                  {showCustomerDropdown ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full bg-surface-container rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                      className="w-full text-left px-3 py-2 hover:bg-surface-container flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs">person_off</span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs">Client Libre</p>
                        <p className="text-[10px] text-on-surface-variant">Vente sans compte</p>
                      </div>
                    </button>
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                        className={`w-full text-left px-3 py-2 hover:bg-surface-container flex items-center gap-2 ${
                          selectedCustomer?.id === c.id ? 'bg-primary-container/20' : ''
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-secondary">
                            {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate">{c.name}</p>
                          <p className="text-[10px] text-on-surface-variant truncate">{c.phone || 'Pas de téléphone'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-on-surface-variant text-xs text-center py-8">
                Ajoutez des produits depuis la liste
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="bg-surface-container rounded-lg p-2.5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-xs text-on-surface truncate">{item.product_name}</h4>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openNumpad('price', item.product_id)}
                          className="w-14 bg-surface-container-highest rounded px-1 py-0.5 text-[10px] font-semibold text-on-surface text-right"
                        >
                          {item.price.toFixed(2)}
                        </button>
                        <span className="text-[10px] text-on-surface-variant">DH / {item.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => updateQty(item.product_id, -item.qty)}
                      className="text-error hover:bg-error-container/20 p-0.5 rounded ml-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-md p-0.5">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-highest/80 transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <button
                        onClick={() => openNumpad('qty', item.product_id)}
                        className="font-bold text-xs text-on-surface min-w-[2ch] text-center"
                      >
                        {item.qty}
                      </button>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary-container/80 transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <p className="font-bold text-xs text-primary">
                      {(item.price * item.qty).toFixed(2)} DH
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-surface-container-low border-t border-outline-variant/30">
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Sous-total</span>
                <span className="font-semibold text-on-surface">{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">TVA (5%)</span>
                <span className="font-semibold text-on-surface">{tax.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-outline-variant/20">
                <span className="font-bold text-sm text-on-surface">Total</span>
                <span className="font-bold text-sm text-primary">{total.toFixed(2)} DH</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCart} className="flex-1 py-2 rounded-xl text-sm">
                Vider
              </Button>
              <Button
                onClick={confirmSale}
                disabled={cart.length === 0 || submitting}
                className="flex-1 py-2 rounded-xl text-sm"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
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

      <NumpadModal
        open={numpadOpen}
        title={numpadTitle}
        value={numpadInitValue}
        allowDecimal={numpadAllowDecimal}
        onConfirm={handleNumpadConfirm}
        onClose={handleNumpadClose}
      />
    </div>
  );
}

function CartPanel({ cart, totalItems, subtotal, tax, total, submitting, onUpdateQty, onUpdatePrice, onClear, onConfirm, selectedCustomer, showCustomerDropdown, customerSearch, filteredCustomers, onToggleCustomer, onSelectCustomer, onClearCustomer, onCustomerSearch, onOpenNumpad }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col h-full border border-outline-variant/30">
      <div className="p-3 border-b border-outline-variant/30 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm text-on-surface">Panier</h2>
          {cart.length > 0 && (
            <button onClick={onClear} className="text-error hover:bg-error-container/20 p-1 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
            </button>
          )}
        </div>

        <div className="relative">
          <div
            className="flex items-center gap-1.5 bg-surface-container p-1.5 rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors"
            onClick={onToggleCustomer}
          >
            <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xs text-secondary">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-on-surface truncate leading-tight">
                {selectedCustomer ? selectedCustomer.name : 'Client Libre'}
              </p>
            </div>
            <span className="material-symbols-outlined text-xs text-on-surface-variant shrink-0">
              {showCustomerDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          {showCustomerDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={customerSearch}
                  onChange={e => onCustomerSearch(e.target.value)}
                  className="w-full bg-surface-container rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto">
                <button
                  onClick={onClearCustomer}
                  className="w-full text-left px-3 py-2 hover:bg-surface-container flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs">person_off</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Client Libre</p>
                    <p className="text-[10px] text-on-surface-variant">Vente sans compte</p>
                  </div>
                </button>
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCustomer(c)}
                    className={`w-full text-left px-3 py-2 hover:bg-surface-container flex items-center gap-2 ${
                      selectedCustomer?.id === c.id ? 'bg-primary-container/20' : ''
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-secondary">
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{c.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{c.phone || 'Pas de téléphone'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <p className="text-on-surface-variant text-xs text-center py-8">
            Ajoutez des produits depuis la liste
          </p>
        ) : (
          cart.map((item) => (
            <div key={item.product_id} className="bg-surface-container rounded-lg p-2.5">
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-on-surface truncate">{item.product_name}</h4>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onOpenNumpad('price', item.product_id)}
                      className="w-14 bg-surface-container-highest rounded px-1 py-0.5 text-[10px] font-semibold text-on-surface text-right"
                    >
                      {item.price.toFixed(2)}
                    </button>
                    <span className="text-[10px] text-on-surface-variant">DH / {item.unit}</span>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateQty(item.product_id, -item.qty)}
                  className="text-error hover:bg-error-container/20 p-0.5 rounded ml-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-md p-0.5">
                  <button
                    onClick={() => onUpdateQty(item.product_id, -1)}
                    className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-highest/80 transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <button
                    onClick={() => onOpenNumpad('qty', item.product_id)}
                    className="font-bold text-xs text-on-surface min-w-[2ch] text-center"
                  >
                    {item.qty}
                  </button>
                  <button
                    onClick={() => onUpdateQty(item.product_id, 1)}
                    className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary-container/80 transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <p className="font-bold text-xs text-primary">
                  {(item.price * item.qty).toFixed(2)} DH
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-surface-container-low rounded-b-2xl border-t border-outline-variant/30">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Sous-total</span>
            <span className="font-semibold text-on-surface">{subtotal.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">TVA (5%)</span>
            <span className="font-semibold text-on-surface">{tax.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-outline-variant/20">
            <span className="font-bold text-sm text-on-surface">Total</span>
            <span className="font-bold text-sm text-primary">{total.toFixed(2)} DH</span>
          </div>
        </div>

        <Button
          onClick={onConfirm}
          disabled={cart.length === 0 || submitting}
          className="w-full h-auto py-2.5 rounded-xl text-sm"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Traitement...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">payments</span>
              Confirmer la vente
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
