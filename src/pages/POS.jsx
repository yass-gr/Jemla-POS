import { useState, useEffect, useCallback } from 'react';
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
  const [favorites, setFavorites] = useState(new Set());

  const [numpadOpen, setNumpadOpen] = useState(false);
  const [numpadTarget, setNumpadTarget] = useState(null);
  const [numpadInitValue, setNumpadInitValue] = useState(0);
  const [numpadTitle, setNumpadTitle] = useState('');
  const [numpadAllowDecimal, setNumpadAllowDecimal] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState(0);
  const [saleDiscount, setSaleDiscount] = useState(0);
  const [saleNote, setSaleNote] = useState('');
  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const [heldOrders, setHeldOrders] = useState([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [showRecentSales, setShowRecentSales] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  useEffect(() => {
    Promise.all([
      api.products.list(),
      api.customers.list(),
      api.favorites.list(),
      api.sales.recent(5),
    ]).then(([prods, custs, favs, recent]) => {
      setProducts(prods);
      setCustomers(custs);
      setFavorites(new Set(favs.map(f => f.id)));
      setRecentSales(recent);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    if (activeCategory !== 'Tous' && p.category !== activeCategory) return false;
    if (activeCategory === 'Favoris' && !favorites.has(p.id)) return false;
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
      let price = product.price;
      if (product.price_wholesale && product.wholesale_min_qty && 1 >= product.wholesale_min_qty) {
        price = product.price_wholesale;
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        price,
        original_price: price,
        qty: 1,
        unit: product.unit,
        discount: 0,
        discount_type: 'fixed',
        note: '',
        barcode: product.barcode,
      }];
    });
  }

  function updateQty(productId, delta) {
    setCart(prev => {
      const item = prev.find(i => i.product_id === productId);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.product_id !== productId);
      const product = products.find(p => p.id === productId);
      let price = item.original_price;
      if (product && product.price_wholesale && product.wholesale_min_qty && newQty >= product.wholesale_min_qty) {
        price = product.price_wholesale;
      }
      return prev.map(i =>
        i.product_id === productId ? { ...i, qty: newQty, price } : i
      );
    });
  }

  function setQtyDirect(productId, newQty) {
    setCart(prev => {
      const item = prev.find(i => i.product_id === productId);
      if (!item) return prev;
      if (newQty <= 0) return prev.filter(i => i.product_id !== productId);
      const product = products.find(p => p.id === productId);
      let price = item.original_price;
      if (product && product.price_wholesale && product.wholesale_min_qty && newQty >= product.wholesale_min_qty) {
        price = product.price_wholesale;
      }
      return prev.map(i =>
        i.product_id === productId ? { ...i, qty: newQty, price } : i
      );
    });
  }

  function updatePrice(productId, newPrice) {
    setCart(prev => prev.map(item =>
      item.product_id === productId ? { ...item, price: Math.max(0, parseFloat(newPrice) || 0) } : item
    ));
  }

  function updateItemDiscount(productId, discount) {
    setCart(prev => prev.map(item =>
      item.product_id === productId ? { ...item, discount: Math.max(0, parseFloat(discount) || 0) } : item
    ));
  }

  function updateItemNote(productId, note) {
    setCart(prev => prev.map(item =>
      item.product_id === productId ? { ...item, note } : item
    ));
  }

  function clearCart() {
    setCart([]);
    setSaleDiscount(0);
    setSaleNote('');
    setPaymentMethod('cash');
    setAmountReceived(0);
    setDeliveryAddress('');
    setDeliveryDate('');
    setDeliveryFee(0);
  }

  function openNumpad(type, productId) {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;
    const currentValue = type === 'price' ? item.price : type === 'discount' ? item.discount : item.qty;
    setNumpadTarget({ type, productId });
    setNumpadInitValue(currentValue);
    const titles = { price: 'Modifier le prix', qty: 'Modifier la quantité', discount: 'Remise' };
    setNumpadTitle(titles[type] || '');
    setNumpadAllowDecimal(type !== 'qty');
    setNumpadOpen(true);
  }

  function handleNumpadConfirm(value) {
    if (!numpadTarget) return;
    const { type, productId } = numpadTarget;
    if (type === 'price') updatePrice(productId, value);
    else if (type === 'discount') updateItemDiscount(productId, value);
    else setQtyDirect(productId, value);
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function handleNumpadClose() {
    setNumpadOpen(false);
    setNumpadTarget(null);
  }

  function openPaymentModal() {
    if (cart.length === 0) return;
    setPaymentMethod('cash');
    setAmountReceived(0);
    setSaleDiscount(0);
    setSaleNote('');
    setShowPaymentModal(true);
  }

  async function confirmPayment() {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const sale = await api.sales.create({
        customer_id: selectedCustomer?.id || null,
        payment_method: paymentMethod,
        amount_paid: amountReceived || 0,
        discount_total: saleDiscount,
        discount_note: saleDiscount > 0 ? 'Remise manuelle' : null,
        note: saleNote || null,
        delivery_address: deliveryAddress || null,
        delivery_date: deliveryDate || null,
        delivery_fee: deliveryFee || 0,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          qty: item.qty,
          unit: item.unit,
          discount: item.discount,
          discount_type: 'fixed',
          note: item.note || null,
          original_price: item.original_price,
        })),
      });
      setLastSale(sale);
      setShowPaymentModal(false);
      setCart([]);
      setShowCartMobile(false);
      toast.success('Vente confirmée !');

      const [prods, recent] = await Promise.all([
        api.products.list(),
        api.sales.recent(5),
      ]);
      setProducts(prods);
      setRecentSales(recent);
      setShowInvoiceModal(true);
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function holdOrder() {
    if (cart.length === 0) return;
    try {
      await api.sales.hold({
        customer_id: selectedCustomer?.id || null,
        note: saleNote || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          qty: item.qty,
          unit: item.unit,
          discount: item.discount,
          note: item.note,
          original_price: item.original_price,
        })),
      });
      toast.success('Commande suspendue');
      setCart([]);
      loadHeldOrders();
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  async function restoreHeldOrder(sale) {
    try {
      const items = sale.items || [];
      setCart(items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        price: i.price,
        original_price: i.original_price || i.price,
        qty: i.qty,
        unit: i.unit,
        discount: i.discount || 0,
        discount_type: i.discount_type || 'fixed',
        note: i.note || '',
      })));
      if (sale.customer_id) {
        setSelectedCustomer(customers.find(c => c.id === sale.customer_id) || null);
      }
      if (sale.note) setSaleNote(sale.note);
      await api.sales.restore(sale.id);
      loadHeldOrders();
      setShowHeldOrders(false);
      toast.success('Commande restaurée');
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  async function loadHeldOrders() {
    try {
      const orders = await api.sales.held();
      setHeldOrders(orders);
    } catch (err) { /* ignore */ }
  }

  async function toggleFavorite(productId) {
    const isFav = favorites.has(productId);
    try {
      if (isFav) {
        await api.favorites.remove(productId);
        setFavorites(prev => { const n = new Set(prev); n.delete(productId); return n; });
      } else {
        await api.favorites.add(productId);
        setFavorites(prev => { const n = new Set(prev); n.add(productId); return n; });
      }
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  async function addNewCustomer() {
    if (!newCustomerName.trim()) return;
    try {
      const customer = await api.customers.create({ name: newCustomerName.trim(), phone: newCustomerPhone.trim() || null });
      setCustomers(prev => [customer, ...prev]);
      setSelectedCustomer(customer);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setShowCustomerDropdown(false);
      toast.success('Client ajouté');
    } catch (err) {
      toast.error('Erreur: ' + err.message);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.discount || 0), 0) + saleDiscount;
  const tax = Math.max(0, (subtotal - totalDiscount) * TAX_RATE);
  const total = Math.max(0, subtotal - totalDiscount + tax);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const changeDue = amountReceived > total ? amountReceived - total : 0;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-4 lg:gap-gutter h-full min-h-0">

      {/* Products */}
      <div className="lg:col-span-8 flex flex-col min-h-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Produits <span className="text-on-surface-variant font-normal text-body-lg ml-2">({filtered.length} Articles)</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-3 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shrink-0 text-sm whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow'
                  : 'text-on-surface-variant hover:bg-surface-container border border-outline-variant/20'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {cat === 'Tous' ? 'apps' : cat === 'Favoris' ? 'favorite' : cat === 'Fruits' ? 'nutrition' : 'eco'}
              </span>
              <span className="text-label-md whitespace-nowrap">{cat}</span>
            </button>
          ))}
          <div className="relative shrink-0 ml-auto sticky right-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-36 sm:w-48 pl-9 pr-3 py-1.5 bg-surface-container rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-3 text-xs text-on-surface-variant shrink-0">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">today</span> Aujourd'hui: {recentSales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length} ventes</span>
          <button onClick={() => { loadHeldOrders(); setShowHeldOrders(prev => !prev); }} className="flex items-center gap-1 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">pause_circle</span> Suspendues ({heldOrders.length})
          </button>
          <button onClick={() => setShowRecentSales(prev => !prev)} className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
            <span className="material-symbols-outlined text-sm">history</span> Récentes
          </button>
        </div>

        {/* Recent sales panel */}
        {showRecentSales && (
          <div className="mb-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-3 shrink-0 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-bold text-on-surface mb-2">Dernières ventes</h3>
            {recentSales.map(s => (
              <div key={s.id} className="flex items-center justify-between py-1.5 text-xs border-b border-outline-variant/10 last:border-0">
                <span className="text-on-surface-variant">#{String(s.id).padStart(4, '0')}</span>
                <span className="text-on-surface font-medium">{s.customer_name}</span>
                <span className="text-primary font-bold">{s.total.toFixed(2)} DH</span>
              </div>
            ))}
          </div>
        )}

        {/* Held orders panel */}
        {showHeldOrders && (
          <div className="mb-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 p-3 shrink-0 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">Commandes suspendues</h3>
            {heldOrders.length === 0 ? (
              <p className="text-xs text-amber-600/60">Aucune commande suspendue</p>
            ) : (
              heldOrders.map(s => (
                <div key={s.id} className="flex items-center justify-between py-1.5 text-xs border-b border-amber-200/20 last:border-0">
                  <div>
                    <span className="text-amber-800 dark:text-amber-300 font-medium">{s.customer_name}</span>
                    <span className="text-amber-600/60 ml-2">{s.items?.length || 0} articles</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-800 dark:text-amber-300 font-bold">{s.total.toFixed(2)} DH</span>
                    <button onClick={() => restoreHeldOrder(s)} className="text-primary hover:underline text-xs">Restaurer</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
                {p.stock <= 0 && (
                  <div className="absolute inset-0 z-10 bg-surface-container-lowest/60 flex items-center justify-center rounded-2xl">
                    <Badge variant="destructive" className="text-[10px] px-3 py-1">Rupture</Badge>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                  className={`absolute top-1.5 left-1.5 z-10 p-0.5 rounded-full transition-colors ${favorites.has(p.id) ? 'text-error' : 'text-on-surface-variant/30 opacity-0 group-hover:opacity-100'}`}
                >
                  <span className="material-symbols-outlined text-sm">{favorites.has(p.id) ? 'favorite' : 'favorite_border'}</span>
                </button>
                <div className="aspect-square mb-1.5 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center relative">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary/30">inventory_2</span>
                  )}
                  {p.stock > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1 pt-4 flex items-end justify-between">
                      <span className="text-white text-[11px] font-bold">{p.stock} {p.unit}</span>
                      {p.price_wholesale && p.wholesale_min_qty && (
                        <span className="text-white/80 text-[8px]">{p.wholesale_min_qty}+kg</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-wider text-center truncate">{p.category}</p>
                <h3 className="font-bold text-xs text-on-surface text-center truncate">{p.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <p className="text-primary font-bold text-[13px]">{p.price.toFixed(2)} <span className="text-[9px]">DH</span></p>
                    {p.price_wholesale && (
                      <p className="text-[9px] text-on-surface-variant">Gros: {p.price_wholesale.toFixed(2)} DH</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    className="bg-primary-container text-on-primary w-7 h-7 rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
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
          totalDiscount={totalDiscount}
          tax={tax}
          total={total}
          submitting={submitting}
          onUpdateQty={updateQty}
          onUpdatePrice={updatePrice}
          onClear={clearCart}
          onConfirm={openPaymentModal}
          onHold={holdOrder}
          selectedCustomer={selectedCustomer}
          showCustomerDropdown={showCustomerDropdown}
          customerSearch={customerSearch}
          filteredCustomers={filteredCustomers}
          onToggleCustomer={() => setShowCustomerDropdown(prev => !prev)}
          onSelectCustomer={(c) => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(''); }}
          onClearCustomer={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); setCustomerSearch(''); }}
          onCustomerSearch={setCustomerSearch}
          onOpenNumpad={openNumpad}
          newCustomerName={newCustomerName}
          newCustomerPhone={newCustomerPhone}
          onNewCustomerName={setNewCustomerName}
          onNewCustomerPhone={setNewCustomerPhone}
          onAddNewCustomer={addNewCustomer}
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
                    <div className="border-t border-outline-variant/20 p-2 space-y-2">
                      <p className="text-[10px] text-on-surface-variant font-semibold">Nouveau client</p>
                      <input
                        type="text"
                        placeholder="Nom"
                        value={newCustomerName}
                        onChange={e => setNewCustomerName(e.target.value)}
                        className="w-full bg-surface-container rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Téléphone (optionnel)"
                        value={newCustomerPhone}
                        onChange={e => setNewCustomerPhone(e.target.value)}
                        className="w-full bg-surface-container rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button size="sm" className="w-full text-xs rounded-lg" onClick={() => { addNewCustomer(); setShowCustomerDropdown(false); }}>
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-on-surface-variant text-xs text-center py-8">Ajoutez des produits depuis la liste</p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="bg-surface-container rounded-lg p-2.5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-xs text-on-surface truncate">{item.product_name}</h4>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openNumpad('price', item.product_id)} className="w-14 bg-surface-container-highest rounded px-1 py-0.5 text-[10px] font-semibold text-on-surface text-right">{item.price.toFixed(2)}</button>
                        <span className="text-[10px] text-on-surface-variant">DH / {item.unit}</span>
                        {item.discount > 0 && <Badge variant="destructive" className="text-[8px] px-1 py-0">-{item.discount} DH</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openNumpad('discount', item.product_id)} className="text-primary hover:bg-primary-container/10 p-0.5 rounded">
                        <span className="material-symbols-outlined text-sm">sell</span>
                      </button>
                      <button onClick={() => updateQty(item.product_id, -item.qty)} className="text-error hover:bg-error-container/20 p-0.5 rounded">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-md p-0.5">
                      <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-highest/80 transition-colors active:scale-90">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <button onClick={() => openNumpad('qty', item.product_id)} className="font-bold text-xs text-on-surface min-w-[2ch] text-center">{item.qty}</button>
                      <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary-container/80 transition-colors active:scale-90">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <p className="font-bold text-xs text-primary">{(item.price * item.qty).toFixed(2)} DH</p>
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
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-error">Remise</span>
                  <span className="font-semibold text-error">-{totalDiscount.toFixed(2)} DH</span>
                </div>
              )}
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
              <Button variant="outline" onClick={clearCart} className="flex-1 py-2 rounded-xl text-sm">Vider</Button>
              <Button variant="outline" onClick={holdOrder} className="py-2 rounded-xl text-sm" disabled={cart.length === 0}>
                <span className="material-symbols-outlined text-sm">pause</span>
              </Button>
              <Button onClick={openPaymentModal} disabled={cart.length === 0} className="flex-1 py-2 rounded-xl text-sm">
                {submitting ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>...</> : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center">
              <h2 className="font-bold text-lg text-on-surface">Paiement</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Payment method */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant mb-2">Méthode de paiement</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'cash', label: 'Espèces', icon: 'payments' },
                    { key: 'card', label: 'Carte', icon: 'credit_card' },
                    { key: 'check', label: 'Chèque', icon: 'receipt' },
                    { key: 'credit', label: 'Crédit', icon: 'account_balance' },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        paymentMethod === m.key
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{m.icon}</span>
                      <span className="text-[10px] font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount received (only for cash) */}
              {paymentMethod === 'cash' && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1">Montant reçu</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amountReceived || ''}
                      onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                    />
                    {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].map(amt => (
                      amt > 0 && amt !== amountReceived && (
                        <button
                          key={amt}
                          onClick={() => setAmountReceived(amt)}
                          className="px-2 py-1 bg-surface-container-higher rounded-lg text-xs font-semibold hover:bg-primary-container/20"
                        >{amt.toFixed(0)}</button>
                      )
                    )).slice(0, 3)}
                  </div>
                  {changeDue > 0 && (
                    <p className="mt-2 text-lg font-bold text-success flex items-center gap-2">
                      <span className="material-symbols-outlined">currency_exchange</span>
                      Monnaie: {changeDue.toFixed(2)} DH
                    </p>
                  )}
                </div>
              )}

              {/* Credit payment: partial payment */}
              {paymentMethod === 'credit' && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1">Acompte (optionnel)</p>
                  <input
                    type="number"
                    value={amountReceived || ''}
                    onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00 — rien = total à crédit"
                  />
                  {amountReceived > 0 && (
                    <p className="mt-1 text-xs text-error">Reste à payer: {(total - amountReceived).toFixed(2)} DH</p>
                  )}
                </div>
              )}

              {/* Discount on total */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant mb-1">Remise sur total</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={saleDiscount || ''}
                    onChange={e => setSaleDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                  <span className="text-xs text-on-surface-variant self-center">DH</span>
                  {[10, 20, 50].map(d => (
                    <button
                      key={d}
                      onClick={() => setSaleDiscount(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${saleDiscount === d ? 'bg-primary text-on-primary' : 'bg-surface-container-higher hover:bg-primary-container/20'}`}
                    >-{d}</button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant mb-1">Note</p>
                <textarea
                  value={saleNote}
                  onChange={e => setSaleNote(e.target.value)}
                  className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                  placeholder="Optionnelle..."
                />
              </div>

              {/* Delivery toggle */}
              <div>
                <button onClick={() => setShowDelivery(prev => !prev)} className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-sm">{showDelivery ? 'expand_less' : 'expand_more'}</span>
                  Livraison
                </button>
                {showDelivery && (
                  <div className="mt-2 space-y-2 pl-4">
                    <input type="text" placeholder="Adresse de livraison" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    <div className="flex gap-2">
                      <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="flex-1 bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
                      <input type="number" placeholder="Frais" value={deliveryFee || ''} onChange={e => setDeliveryFee(parseFloat(e.target.value) || 0)} className="w-24 bg-surface-container rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-surface-container-low rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Sous-total</span><span className="font-semibold">{subtotal.toFixed(2)} DH</span></div>
                {totalDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-error">Remise</span><span className="font-semibold text-error">-{totalDiscount.toFixed(2)} DH</span></div>}
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">TVA (5%)</span><span className="font-semibold">{tax.toFixed(2)} DH</span></div>
                {deliveryFee > 0 && <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Livraison</span><span className="font-semibold">{deliveryFee.toFixed(2)} DH</span></div>}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-outline-variant/20">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-bold text-base text-primary">{total.toFixed(2)} DH</span>
                </div>
              </div>

            </div>

            <div className="p-5 border-t border-outline-variant/30 flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 rounded-xl">Annuler</Button>
              <Button onClick={confirmPayment} disabled={submitting} className="flex-1 py-2.5 rounded-xl">
                {submitting ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Traitement...</> : `Confirmer ${total.toFixed(2)} DH`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-success">check_circle</span>
              </div>
              <h2 className="font-bold text-xl text-on-surface mb-1">Vente confirmée</h2>
              <p className="text-sm text-on-surface-variant mb-2">#{`INV-${String(lastSale.id).padStart(4, '0')}`}</p>
              <p className="text-3xl font-extrabold text-primary mb-4">{lastSale.total.toFixed(2)} DH</p>

              <div className="bg-surface-container-low rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Méthode</span><span className="font-semibold capitalize">{lastSale.payment_method}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Statut</span><span className="font-semibold capitalize">{lastSale.payment_status}</span></div>
                {lastSale.amount_paid > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Payé</span><span className="font-semibold">{lastSale.amount_paid.toFixed(2)} DH</span></div>}
                {lastSale.change_due > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Monnaie</span><span className="font-semibold text-success">{lastSale.change_due.toFixed(2)} DH</span></div>}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowInvoiceModal(false); setLastSale(null); }} className="flex-1 py-2.5 rounded-xl">Fermer</Button>
                <Button onClick={() => { setShowInvoiceModal(false); setLastSale(null); printBon(lastSale); }} className="flex-1 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-sm">print</span> Imprimer
                </Button>
              </div>
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

function CartPanel({
  cart, totalItems, subtotal, totalDiscount, tax, total,
  submitting, onUpdateQty, onUpdatePrice, onClear, onConfirm, onHold,
  selectedCustomer, showCustomerDropdown, customerSearch, filteredCustomers,
  onToggleCustomer, onSelectCustomer, onClearCustomer, onCustomerSearch, onOpenNumpad,
  printTicket, onTogglePrint,
  newCustomerName, newCustomerPhone, onNewCustomerName, onNewCustomerPhone, onAddNewCustomer,
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col h-full border border-outline-variant/30">
      <div className="p-3 border-b border-outline-variant/30 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm text-on-surface">Panier</h2>
          {cart.length > 0 && (
            <div className="flex items-center gap-1">
              <button onClick={onHold} className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 p-1 rounded-lg transition-colors" title="Suspendre">
                <span className="material-symbols-outlined text-sm">pause_circle</span>
              </button>
              <button onClick={onClear} className="text-error hover:bg-error-container/20 p-1 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
              </button>
            </div>
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
                <button onClick={onClearCustomer} className="w-full text-left px-3 py-2 hover:bg-surface-container flex items-center gap-2">
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
                    className={`w-full text-left px-3 py-2 hover:bg-surface-container flex items-center gap-2 ${selectedCustomer?.id === c.id ? 'bg-primary-container/20' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-secondary">{c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{c.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{c.phone || 'Pas de téléphone'}</p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-outline-variant/20 p-2 space-y-2">
                  <p className="text-[10px] text-on-surface-variant font-semibold">Nouveau client</p>
                  <input type="text" placeholder="Nom" value={newCustomerName} onChange={e => onNewCustomerName(e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  <input type="text" placeholder="Téléphone (optionnel)" value={newCustomerPhone} onChange={e => onNewCustomerPhone(e.target.value)} className="w-full bg-surface-container rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  <Button size="sm" className="w-full text-xs rounded-lg" onClick={onAddNewCustomer}>Ajouter</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <p className="text-on-surface-variant text-xs text-center py-8">Ajoutez des produits depuis la liste</p>
        ) : (
          cart.map((item) => (
            <div key={item.product_id} className="bg-surface-container rounded-lg p-2.5">
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-on-surface truncate">{item.product_name}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onOpenNumpad('price', item.product_id)} className="w-14 bg-surface-container-highest rounded px-1 py-0.5 text-[10px] font-semibold text-on-surface text-right">{item.price.toFixed(2)}</button>
                    <span className="text-[10px] text-on-surface-variant">DH / {item.unit}</span>
                    {item.discount > 0 && <Badge variant="destructive" className="text-[8px] px-1 py-0">-{item.discount} DH</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onOpenNumpad('discount', item.product_id)} className="text-primary hover:bg-primary-container/10 p-0.5 rounded" title="Remise">
                    <span className="material-symbols-outlined text-sm">sell</span>
                  </button>
                  <button onClick={() => onUpdateQty(item.product_id, -item.qty)} className="text-error hover:bg-error-container/20 p-0.5 rounded ml-1 shrink-0">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-md p-0.5">
                  <button onClick={() => onUpdateQty(item.product_id, -1)} className="w-6 h-6 rounded bg-surface-container-highest flex items-center justify-center hover:bg-surface-container-highest/80 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <button onClick={() => onOpenNumpad('qty', item.product_id)} className="font-bold text-xs text-on-surface min-w-[2ch] text-center">{item.qty}</button>
                  <button onClick={() => onUpdateQty(item.product_id, 1)} className="w-6 h-6 rounded bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary-container/80 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <p className="font-bold text-xs text-primary">{(item.price * item.qty).toFixed(2)} DH</p>
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
          {totalDiscount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-error">Remise</span>
              <span className="font-semibold text-error">-{totalDiscount.toFixed(2)} DH</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">TVA (5%)</span>
            <span className="font-semibold text-on-surface">{tax.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-outline-variant/20">
            <span className="font-bold text-sm text-on-surface">Total</span>
            <span className="font-bold text-sm text-primary">{total.toFixed(2)} DH</span>
          </div>
        </div>

        <Button onClick={onConfirm} disabled={cart.length === 0 || submitting} className="w-full h-auto py-2.5 rounded-xl text-sm">
          {submitting ? (
            <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Traitement...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">payments</span> Confirmer la vente</>
          )}
        </Button>
      </div>
    </div>
  );
}

function printBon(sale) {
  if (!sale) return;
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const customerName = sale.customer_name || 'Client Libre';
  const items = sale.items || [];

  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>Bon de vente</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #222; }
      .header { text-align: center; margin-bottom: 30px; }
      .header h1 { margin: 0; font-size: 24px; }
      .header p { margin: 4px 0 0; color: #666; font-size: 12px; }
      .title { text-align: center; font-size: 20px; font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 10px 0; margin-bottom: 24px; }
      .info { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; flex-wrap: wrap; gap: 8px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { background: #f5f5f5; text-align: left; padding: 8px 12px; font-size: 13px; border-bottom: 2px solid #ddd; }
      td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
      .right { text-align: right; }
      .totals { margin-left: auto; width: 300px; }
      .totals div { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
      .totals .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 8px; margin-top: 4px; }
      .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
      .signature-box { text-align: center; }
      .signature-box .line { width: 200px; border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; font-size: 13px; }
      .note { margin-top: 16px; font-size: 12px; color: #666; font-style: italic; }
      @media print { body { padding: 20px; } }
    </style></head><body>
      <div class="header">
        <h1>Simi Shop</h1>
        <p>Grossiste en fruits et légumes</p>
      </div>
      <div class="title">BON DE VENTE</div>
      <div class="info">
        <span>N°: INV-${String(sale.id).padStart(4, '0')}</span>
        <span>Date: ${date}</span>
        <span>Client: ${customerName}</span>
        <span>Paiement: ${sale.payment_method || 'cash'}</span>
      </div>
      <table>
        <tr><th>Produit</th><th class="right">Qté</th><th class="right">Prix unitaire</th><th class="right">Total</th></tr>
        ${items.map(item => `
          <tr>
            <td>${item.product_name}${item.discount > 0 ? ' (remise ' + item.discount + ' DH)' : ''}</td>
            <td class="right">${item.qty} ${item.unit}</td>
            <td class="right">${item.price.toFixed(2)} DH</td>
            <td class="right">${(item.price * item.qty).toFixed(2)} DH</td>
          </tr>
        `).join('')}
      </table>
      <div class="totals">
        <div><span>Sous-total</span><span>${items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)} DH</span></div>
        ${sale.discount_total > 0 ? `<div><span>Remise</span><span>-${sale.discount_total.toFixed(2)} DH</span></div>` : ''}
        <div><span>TVA (5%)</span><span>${sale.tax.toFixed(2)} DH</span></div>
        ${sale.delivery_fee > 0 ? `<div><span>Livraison</span><span>${sale.delivery_fee.toFixed(2)} DH</span></div>` : ''}
        <div class="grand"><span>Total</span><span>${sale.total.toFixed(2)} DH</span></div>
      </div>
      ${sale.note ? `<div class="note">Note: ${sale.note}</div>` : ''}
      <div class="signatures">
        <div class="signature-box"><div class="line">Signature du vendeur</div></div>
        <div class="signature-box"><div class="line">Signature du client</div></div>
      </div>
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}
