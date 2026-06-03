import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NumpadModal from '@/components/ui/NumpadModal';
import { useTranslation } from 'react-i18next';

export default function POS() {
  const { t } = useTranslation();
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
  const [productPage, setProductPage] = useState(1);
  const pageSize = 15;

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
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  function handleBarcode(e) {
    const code = e.target.value.trim();
    if (!code) return;
    const product = products.find(p => p.barcode === code);
    if (product) {
      addToCart(product);
      toast.success(`${product.name} ${t('pos.added')}`);
    } else {
      toast.error(t('pos.barcode_not_found'));
    }
    setBarcodeInput('');
  }
  const [settings, setSettings] = useState({});
  const settingsRef = useRef({});
  const taxRate = parseFloat(settings.tax_rate || '5') / 100;

  useEffect(() => {
    Promise.all([
      api.products.list(),
      api.customers.list(),
      api.favorites.list(),
      api.sales.recent(5),
      api.settings.get(),
    ]).then(([prods, custs, favs, recent, s]) => {
      setProducts(prods);
      setCustomers(custs);
      setFavorites(new Set(favs.map(f => f.id)));
      setRecentSales(recent);
      setSettings(s);
      settingsRef.current = s;
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Keyboard shortcuts for POS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F1 - Show shortcuts help
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      // F2 - Focus search
      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('product-search-input')?.focus();
      }
      // F4 - Show/hide cart on mobile
      if (e.key === 'F4') {
        e.preventDefault();
        setShowCartMobile(prev => !prev);
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setShowCustomerDropdown(false);
        setShowHeldOrders(false);
        setShowRecentSales(false);
        setShowShortcuts(false);
        if (showPaymentModal) setShowPaymentModal(false);
      }
      // Ctrl+H - Hold order
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        if (cart.length > 0) handleHoldOrder();
      }
      // Ctrl+P - Payment
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (cart.length > 0) openPaymentModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, showPaymentModal]);

  const categories = ['Tous', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    if (activeCategory !== 'Tous' && p.category !== activeCategory) return false;
    if (activeCategory === 'Favoris' && !favorites.has(p.id)) return false;
    if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((productPage - 1) * pageSize, productPage * pageSize);

  useEffect(() => { setProductPage(1); }, [activeCategory, productSearch]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  function addToCart(product) {
    if (product.stock <= 0) {
      toast.error(t('pos.out_of_stock'));
      return;
    }
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
        tax_exempt: false,
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
      if (delta > 0 && product && product.stock < newQty) {
        toast.error(t('pos.insufficient_stock') + product.name);
        return prev;
      }
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

  function toggleDiscountType(productId) {
    setCart(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, discount_type: item.discount_type === 'fixed' ? 'percentage' : 'fixed', discount: 0 }
        : item
    ));
  }

  function toggleTaxExempt(productId) {
    setCart(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, tax_exempt: !item.tax_exempt }
        : item
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
    const titles = { price: t('pos.edit_price'), qty: t('pos.edit_qty'), discount: t('pos.discount') };
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
      const freshProducts = await api.products.list();
      for (const item of cart) {
        const product = freshProducts.find(p => p.id === item.product_id);
        if (!product || product.stock < item.qty) {
          toast.error(t('pos.insufficient_stock') + (product?.name || item.product_name));
          setSubmitting(false);
          return;
        }
      }
      const rate = parseFloat(settingsRef.current.tax_rate || '5') / 100;
      const sale = await api.sales.create({
        customer_id: selectedCustomer?.id || null,
        payment_method: paymentMethod,
        amount_paid: amountReceived || 0,
        discount_total: saleDiscount,
        discount_note: saleDiscount > 0 ? t('pos.discount_note') : null,
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
          discount_type: item.discount_type || 'fixed',
          tax_exempt: item.tax_exempt ? 1 : 0,
          tax_rate: rate,
          note: item.note || null,
          original_price: item.original_price,
        })),
      });
      setLastSale(sale);
      setShowPaymentModal(false);
      setCart([]);
      setShowCartMobile(false);
      toast.success(t('pos.sale_success'));
      window.dispatchEvent(new Event('notifications:refresh'));

      const [prods, recent] = await Promise.all([
        api.products.list(),
        api.sales.recent(5),
      ]);
      setProducts(prods);
      setRecentSales(recent);
      setShowInvoiceModal(true);
    } catch (err) {
      toast.error(t('pos.error') + err.message);
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
          discount_type: item.discount_type || 'fixed',
          tax_exempt: item.tax_exempt ? 1 : 0,
          tax_rate: parseFloat(settingsRef.current.tax_rate || '5') / 100,
          note: item.note,
          original_price: item.original_price,
        })),
      });
      toast.success(t('pos.suspend_success'));
      setCart([]);
      loadHeldOrders();
    } catch (err) {
      toast.error(t('pos.error') + err.message);
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
        tax_exempt: !!i.tax_exempt,
        note: i.note || '',
      })));
      if (sale.customer_id) {
        setSelectedCustomer(customers.find(c => c.id === sale.customer_id) || null);
      }
      if (sale.note) setSaleNote(sale.note);
      await api.sales.restore(sale.id);
      loadHeldOrders();
      setShowHeldOrders(false);
      toast.success(t('pos.restore_success'));
      window.dispatchEvent(new Event('notifications:refresh'));
    } catch (err) {
      toast.error(t('pos.error') + err.message);
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
      toast.error(t('pos.error') + err.message);
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
      toast.success(t('pos.customer_added'));
    } catch (err) {
      toast.error(t('pos.error') + err.message);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const totalItemDiscount = cart.reduce((sum, item) => {
    if (item.discount_type === 'percentage') {
      return sum + (item.price * item.qty * (item.discount || 0) / 100);
    }
    return sum + (item.discount || 0);
  }, 0);
  const totalDiscount = totalItemDiscount + saleDiscount;

  const taxableSubtotal = cart.reduce((sum, item) => {
    if (item.tax_exempt) return sum;
    const lineTotal = item.price * item.qty;
    let lineDiscount = item.discount || 0;
    if (item.discount_type === 'percentage') {
      lineDiscount = lineTotal * lineDiscount / 100;
    }
    return sum + (lineTotal - lineDiscount);
  }, 0);
  const tax = Math.max(0, taxableSubtotal * taxRate);
  const total = Math.max(0, subtotal - totalDiscount + tax);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const changeDue = amountReceived > total ? amountReceived - total : 0;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-4 lg:gap-gutter h-full min-h-0">

      {/* Products */}
      <div className="lg:col-span-8 flex flex-col min-h-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="font-bold text-[18px] text-[#0f172a] dark:text-foreground">
            {t('pos.products')} <span className="text-[#64748B] dark:text-muted-foreground font-normal text-sm ms-2">({filtered.length} {t('pos.articles')})</span>
          </h2>
          <button 
            onClick={() => setShowShortcuts(true)}
            className="p-2 hover:bg-surface-container rounded-lg transition-colors group"
            title={t('pos.shortcuts') + ' (F1)'}
          >
            <span className="material-symbols-outlined text-xl text-muted-foreground group-hover:text-foreground">keyboard</span>
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-3 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shrink-0 text-sm whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#0F766E] dark:bg-teal-600 text-white shadow-sm'
                  : 'text-[#64748B] dark:text-muted-foreground hover:bg-[#f8fafc] dark:hover:bg-accent border border-[#F1F5F9] dark:border-border'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {cat === 'Tous' ? 'apps' : cat === 'Favoris' ? 'favorite' : cat === 'Fruits' ? 'nutrition' : 'eco'}
              </span>
              <span className="text-[11px] font-medium whitespace-nowrap">{cat}</span>
            </button>
          ))}
          <div className="relative shrink-0 sticky end-0">
            <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] dark:text-muted-foreground">search</span>
            <input
              type="text"
              placeholder={t('pos.search')}
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-24 sm:w-32 ps-9 pe-3 py-1.5 bg-[#f8fafc] dark:bg-background rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30 transition-all"
            />
          </div>
          <div className="relative shrink-0 sticky end-0">
            <span className="material-symbols-outlined absolute start-2 top-1/2 -translate-y-1/2 text-sm text-[#64748B] dark:text-muted-foreground">qr_code_scanner</span>
            <input
              type="text"
              placeholder={t('pos.barcode')}
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBarcode(e)}
              className="w-28 ps-8 pe-2 py-1.5 bg-[#f8fafc] dark:bg-background rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30 transition-all"
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-3 text-xs text-[#64748B] dark:text-muted-foreground shrink-0">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">today</span> {t('pos.today')}: {recentSales.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length} {t('pos.sales')}</span>
          <button onClick={() => setShowRecentSales(prev => !prev)} className="flex items-center gap-1 hover:text-[#0F766E] dark:hover:text-teal-400 transition-colors">
            <span className="material-symbols-outlined text-sm">history</span> {t('pos.recent')}
          </button>
          <button onClick={() => { loadHeldOrders(); setShowHeldOrders(prev => !prev); }} className="flex items-center gap-1 hover:text-[#0F766E] dark:hover:text-teal-400 transition-colors ms-auto">
            <span className="material-symbols-outlined text-sm">pause_circle</span> {t('pos.suspended')} ({heldOrders.length})
          </button>
        </div>

        {/* Recent sales panel */}
        {showRecentSales && (
          <div className="mb-3 bg-white dark:bg-card rounded-xl border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] p-3 shrink-0 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-bold text-[#0f172a] dark:text-foreground mb-2">{t('pos.recent_sales')}</h3>
            {recentSales.map(s => (
              <div key={s.id} className="flex items-center justify-between py-1.5 text-xs border-b border-[#F1F5F9] dark:border-border last:border-0">
                <span className="text-[#64748B] dark:text-muted-foreground">#{String(s.id).padStart(4, '0')}</span>
                <span className="text-[#0f172a] dark:text-foreground font-medium">{s.customer_name}</span>
                <span className="text-[#0F766E] dark:text-teal-400 font-bold">{s.total.toFixed(2)} DH</span>
              </div>
            ))}
          </div>
        )}

        {/* Held orders panel */}
        {showHeldOrders && (
          <div className="mb-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 p-3 shrink-0 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">{t('pos.suspended')}</h3>
            {heldOrders.length === 0 ? (
              <p className="text-xs text-amber-600/60">{t('pos.no_suspended')}</p>
            ) : (
              heldOrders.map(s => (
                <div key={s.id} className="flex items-center justify-between py-1.5 text-xs border-b border-amber-200/20 last:border-0">
                  <div>
                    <span className="text-amber-800 dark:text-amber-300 font-medium">{s.customer_name}</span>
                    <span className="text-amber-600/60 ms-2">{s.items?.length || 0} {t('pos.items')}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-800 dark:text-amber-300 font-bold">{s.total.toFixed(2)} DH</span>
                    <button onClick={() => restoreHeldOrder(s)} className="text-[#0F766E] dark:text-teal-400 hover:underline text-xs">{t('pos.restore')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-5 gap-3">
            {[1,2,3,4,5,6,7,8,9,10].map(i => (
              <div key={i} className="bg-white dark:bg-card rounded-2xl p-3 shadow-sm border border-[#F1F5F9] dark:border-border animate-pulse flex flex-col">
                <div className="aspect-square mb-2 rounded-xl bg-[#f8fafc] dark:bg-background" />
                <div className="h-2 w-12 bg-[#f8fafc] dark:bg-background mx-auto mb-1 rounded" />
                <div className="h-3 w-16 bg-[#f8fafc] dark:bg-background mx-auto rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 pe-2 pb-6">
            {paginated.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="group bg-white dark:bg-card rounded-2xl p-3 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] shadow-sm hover:shadow-lg transition-all border border-[#F1F5F9] dark:border-border relative overflow-hidden cursor-pointer active:scale-[0.97] flex flex-col"
              >
                {p.stock <= 0 && (
                  <div className="absolute inset-0 z-10 bg-white/60 dark:bg-card/60 flex items-center justify-center rounded-2xl">
                    <Badge variant="destructive" className="text-[10px] px-3 py-1">{t('pos.out_of_stock')}</Badge>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                  className={`absolute top-1.5 start-1.5 z-10 p-0.5 rounded-full transition-colors ${favorites.has(p.id) ? 'text-[#ef4444] dark:text-red-400' : 'text-[#64748B]/30 dark:text-muted-foreground/30 opacity-0 group-hover:opacity-100'}`}
                >
                  <span className="material-symbols-outlined text-sm">{favorites.has(p.id) ? 'favorite' : 'favorite_border'}</span>
                </button>
                <div className="aspect-square mb-1.5 rounded-xl overflow-hidden bg-[#f8fafc] dark:bg-background flex items-center justify-center relative">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#0F766E]/30 dark:text-teal-400/30">inventory_2</span>
                  )}
                  {p.stock > 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1 pt-4 flex items-end justify-between">
                      <span className="text-white text-[11px] font-bold">{p.stock} kg</span>
                      {p.price_wholesale && p.wholesale_min_qty && (
                        <span className="text-white/80 text-[8px]">{p.wholesale_min_qty}+kg</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-[#64748B] dark:text-muted-foreground uppercase tracking-wider text-center truncate">{p.category}</p>
                <h3 className="font-bold text-xs text-[#0f172a] dark:text-foreground text-center truncate">{p.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <p className="text-[#0F766E] dark:text-teal-400 font-bold text-[13px]">{p.price.toFixed(2)} <span className="text-[9px]">DH</span></p>
                    {p.price_wholesale && (
                      <p className="text-[9px] text-[#64748B] dark:text-muted-foreground">{t('pos.wholesale')}: {p.price_wholesale.toFixed(2)} DH</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                    className="bg-[#0F766E] dark:bg-teal-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow group-hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pb-4 shrink-0">
            <button
              onClick={() => setProductPage(p => Math.max(1, p - 1))}
              disabled={productPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              {t('pos.prev_page')}
            </button>
            <span className="text-xs text-muted-foreground">
              {productPage}/{totalPages}
            </span>
            <button
              onClick={() => setProductPage(p => Math.min(totalPages, p + 1))}
              disabled={productPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              {t('pos.next_page')}
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
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
          onToggleDiscountType={toggleDiscountType}
          onToggleTaxExempt={toggleTaxExempt}
          selectedCustomerDebt={selectedCustomer?.debt_balance || 0}
        />
      </div>

      {/* Mobile cart button + drawer */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3 bg-white dark:bg-card border-t border-[#F1F5F9] dark:border-border shadow-2xl">
          <Button
            onClick={() => setShowCartMobile(true)}
            className="w-full h-auto py-2.5 rounded-xl text-sm"
          >
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            {t('pos.cart')} ({totalItems}) — {total.toFixed(2)} DH
          </Button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {showCartMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-card">
          <div className="flex items-center justify-between p-4 border-b border-[#F1F5F9] dark:border-border">
            <h2 className="font-bold text-[15px] text-[#0f172a] dark:text-foreground">{t('pos.cart')}</h2>
            <button
              onClick={() => setShowCartMobile(false)}
              className="p-2 hover:bg-[#f1f5f9] dark:hover:bg-accent rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="px-3 pt-3 pb-1 border-b border-[#F1F5F9] dark:border-border">
            <div className="relative">
              <div
                className="flex items-center gap-2 bg-[#f8fafc] dark:bg-background p-2 rounded-xl cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-accent transition-colors"
                onClick={() => setShowCustomerDropdown(prev => !prev)}
              >
                <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xs text-[#0F766E] dark:text-teal-400">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-[#0f172a] dark:text-foreground truncate leading-tight">
                    {selectedCustomer ? selectedCustomer.name : t('pos.general')}
                  </p>
                </div>
                <span className="material-symbols-outlined text-xs text-[#64748B] dark:text-muted-foreground shrink-0">
                  {showCustomerDropdown ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {showCustomerDropdown && (
                <div className="absolute top-full inset-x-0 mt-1 z-40 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder={t('pos.search_customer')}
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                      className="w-full text-start px-3 py-2 hover:bg-[#f8fafc] dark:hover:bg-accent flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#f1f5f9] dark:bg-muted flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs">person_off</span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{t('pos.general')}</p>
                        <p className="text-[10px] text-[#64748B] dark:text-muted-foreground">{t('pos.without_account')}</p>
                      </div>
                    </button>
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(''); }}
                        className={`w-full text-start px-3 py-2 hover:bg-[#f8fafc] dark:hover:bg-accent flex items-center gap-2 ${
                          selectedCustomer?.id === c.id ? 'bg-[#0F766E]/10 dark:bg-teal-500/20' : ''
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#0F766E] dark:text-teal-400">
                            {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate">{c.name}</p>
                          <p className="text-[10px] text-[#64748B] dark:text-muted-foreground truncate">{c.phone || t('pos.no_phone')}</p>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-[#F1F5F9]/50 dark:border-border/50 p-2 space-y-2">
                      <p className="text-[10px] text-[#64748B] dark:text-muted-foreground font-semibold">{t('pos.new_customer')}</p>
                      <input
                        type="text"
                        placeholder={t('pos.name')}
                        value={newCustomerName}
                        onChange={e => setNewCustomerName(e.target.value)}
                        className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                      />
                      <input
                        type="text"
                        placeholder={t('pos.phone_optional')}
                        value={newCustomerPhone}
                        onChange={e => setNewCustomerPhone(e.target.value)}
                        className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                      />
                      <Button size="sm" className="w-full text-xs rounded-lg" onClick={() => { addNewCustomer(); setShowCustomerDropdown(false); }}>
                        {t('pos.add')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-[#64748B] dark:text-muted-foreground text-xs text-center py-8">{t('pos.add_items')}</p>
            ) : (
          cart.map((item) => (
            <div key={item.product_id} className="bg-[#f8fafc] dark:bg-background rounded-xl p-2.5">
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-[#0f172a] dark:text-foreground truncate">{item.product_name}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openNumpad('price', item.product_id)} className="w-14 bg-[#f1f5f9] dark:bg-muted rounded px-1 py-0.5 text-[10px] font-semibold text-[#0f172a] dark:text-foreground text-end">{item.price.toFixed(2)}</button>
                    <span className="text-[10px] text-[#64748B] dark:text-muted-foreground">DH / kg</span>
                    {item.discount > 0 && (
                      <Badge variant="destructive" className="text-[8px] px-1 py-0">
                        -{item.discount}{item.discount_type === 'percentage' ? '%' : ' DH'}
                      </Badge>
                    )}
                    {item.tax_exempt && <Badge variant="secondary" className="text-[8px] px-1 py-0">{t('pos.tax_exempt')}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleDiscountType(item.product_id)}
                    className={`p-0.5 rounded ${item.discount_type === 'percentage' ? 'text-[#f59e0b] dark:text-amber-400' : 'text-[#64748B] dark:text-muted-foreground'} hover:bg-[#f8fafc] dark:hover:bg-accent/50`}
                    title={item.discount_type === 'percentage' ? t('pos.fixed') : t('pos.percentage')}
                  >
                    <span className="text-[9px] font-bold">{item.discount_type === 'percentage' ? '%' : 'DH'}</span>
                  </button>
                  <button onClick={() => openNumpad('discount', item.product_id)} className="text-[#0F766E] dark:text-teal-400 hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20 p-0.5 rounded" title={t('pos.discount')}>
                    <span className="material-symbols-outlined text-sm">sell</span>
                  </button>
                  <button onClick={() => toggleTaxExempt(item.product_id)} className={`p-0.5 rounded ${item.tax_exempt ? 'text-[#f59e0b] dark:text-amber-400' : 'text-[#64748B] dark:text-muted-foreground'} hover:bg-[#f8fafc] dark:hover:bg-accent/50`} title={item.tax_exempt ? t('pos.taxable') : t('pos.tax_exempt')}>
                    <span className="material-symbols-outlined text-sm">{item.tax_exempt ? 'block' : 'check_circle'}</span>
                  </button>
                  <button onClick={() => updateQty(item.product_id, -item.qty)} className="text-[#ef4444] dark:text-red-400 hover:bg-[#ef4444]/10 dark:hover:bg-red-950/30 p-0.5 rounded ms-1 shrink-0">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white dark:bg-card rounded-md p-0.5">
                  <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded bg-[#f1f5f9] dark:bg-muted flex items-center justify-center hover:bg-[#f1f5f9]/80 dark:hover:bg-accent/80 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <button onClick={() => openNumpad('qty', item.product_id)} className="font-bold text-xs text-[#0f172a] dark:text-foreground min-w-[2ch] text-center">{item.qty}</button>
                  <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded bg-[#0F766E] dark:bg-teal-600 text-white flex items-center justify-center hover:bg-[#0F766E]/80 dark:hover:bg-teal-600/80 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 5, 10].map(preset => (
                      <button
                        key={preset}
                        onMouseDown={(e) => { e.preventDefault(); updateQty(item.product_id, preset - item.qty); }}
                        className="text-[8px] px-1 py-0.5 rounded bg-[#f1f5f9] dark:bg-muted hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20 text-[#64748B] dark:text-muted-foreground"
                      >{preset}kg</button>
                    ))}
                  </div>
                  <p className="font-bold text-xs text-[#0F766E] dark:text-teal-400">{(item.price * item.qty).toFixed(2)} DH</p>
                </div>
              </div>
            </div>
          )))}
          </div>

              {/* Amount received (only for cash) */}
              {paymentMethod === 'cash' && (
                <div>
                  <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.amount_received')}</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amountReceived || ''}
                      onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                      placeholder="0.00"
                    />
                    {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].map(amt => (
                      amt > 0 && amt !== amountReceived && (
                        <button
                          key={amt}
                          onClick={() => setAmountReceived(amt)}
                          className="px-2 py-1 bg-[#f1f5f9] dark:bg-muted rounded-lg text-xs font-semibold hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20"
                        >{amt.toFixed(0)}</button>
                      )
                    )).slice(0, 3)}
                  </div>
                  {changeDue > 0 && (
                    <p className="mt-2 text-lg font-bold text-[#10b981] dark:text-emerald-400 flex items-center gap-2">
                      <span className="material-symbols-outlined">currency_exchange</span>
                      {t('pos.change')}: {changeDue.toFixed(2)} DH
                    </p>
                  )}
                </div>
              )}

              {/* Credit payment: partial payment */}
              {paymentMethod === 'credit' && (
                <div>
                  <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.deposit')}</p>
                  <input
                    type="number"
                    value={amountReceived || ''}
                    onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                    placeholder={t('pos.credit_info')}
                  />
                  {amountReceived > 0 && (
                    <p className="mt-1 text-xs text-[#ef4444] dark:text-red-400">{t('pos.remaining')}: {(total - amountReceived).toFixed(2)} DH</p>
                  )}
                </div>
              )}

              {/* Discount on total */}
              <div>
                <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.discount_total')}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={saleDiscount || ''}
                    onChange={e => setSaleDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                    placeholder="0"
                  />
                  <span className="text-xs text-[#64748B] dark:text-muted-foreground self-center">DH</span>
                  {[10, 20, 50].map(d => (
                    <button
                      key={d}
                      onClick={() => setSaleDiscount(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${saleDiscount === d ? 'bg-[#0F766E] dark:bg-teal-600 text-white' : 'bg-[#f1f5f9] dark:bg-muted hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20'}`}
                    >-{d}</button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.note')}</p>
                <textarea
                  value={saleNote}
                  onChange={e => setSaleNote(e.target.value)}
                  className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30 resize-none"
                  rows={2}
                  placeholder={t('pos.optional')}
                />
              </div>

              {/* Delivery toggle */}
              <div>
                <button onClick={() => setShowDelivery(prev => !prev)} className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-muted-foreground hover:text-[#0f172a] dark:hover:text-foreground transition-colors">
                  <span className="material-symbols-outlined text-sm">{showDelivery ? 'expand_less' : 'expand_more'}</span>
                  {t('pos.delivery')}
                </button>
                {showDelivery && (
                  <div className="mt-2 space-y-2 ps-4">
                    <input type="text" placeholder={t('pos.delivery_address')} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                    <div className="flex gap-2">
                      <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="flex-1 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                      <input type="number" placeholder={t('pos.fee')} value={deliveryFee || ''} onChange={e => setDeliveryFee(parseFloat(e.target.value) || 0)} className="w-24 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-[#f8fafc] dark:bg-background rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.subtotal')}</span><span className="font-semibold">{subtotal.toFixed(2)} DH</span></div>
                {totalDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-[#ef4444] dark:text-red-400">{t('pos.discount')}</span><span className="font-semibold text-[#ef4444] dark:text-red-400">-{totalDiscount.toFixed(2)} DH</span></div>}
                <div className="flex justify-between text-sm"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.tax')}</span><span className="font-semibold">{tax.toFixed(2)} DH</span></div>
                {deliveryFee > 0 && <div className="flex justify-between text-sm"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.delivery')}</span><span className="font-semibold">{deliveryFee.toFixed(2)} DH</span></div>}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#F1F5F9] dark:border-border">
                  <span className="font-bold text-base">{t('pos.total')}</span>
                  <span className="font-bold text-base text-[#0F766E] dark:text-teal-400">{total.toFixed(2)} DH</span>
                </div>
              </div>

            <div className="p-5 border-t border-[#F1F5F9] dark:border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 rounded-xl">{t('pos.cancel')}</Button>
              <Button onClick={confirmPayment} disabled={submitting} className="flex-1 py-2.5 rounded-xl">
                {submitting ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> {t('pos.processing')}</> : `${t('pos.confirm')} ${total.toFixed(2)} DH`}
              </Button>
            </div>
          </div>
      )}

      {/* Payment Modal (desktop) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-card rounded-[20px] dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-5 border-b border-[#F1F5F9] dark:border-border flex justify-between items-center">
              <h2 className="font-bold text-lg text-[#0f172a] dark:text-foreground">{t('pos.checkout')}</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-[#f8fafc] dark:hover:bg-accent rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">

              <div>
                <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-2">{t('pos.payment_method')}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'cash', label: t('pos.cash'), icon: 'payments' },
                    { key: 'card', label: t('pos.card'), icon: 'credit_card' },
                    { key: 'check', label: t('pos.check'), icon: 'receipt' },
                    { key: 'credit', label: t('pos.credit'), icon: 'account_balance' },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        paymentMethod === m.key
                          ? 'border-[#0F766E] dark:border-teal-600 bg-[#0F766E]/5 dark:bg-teal-500/10 text-[#0F766E] dark:text-teal-400'
                          : 'border-[#F1F5F9] dark:border-border text-[#64748B] dark:text-muted-foreground hover:border-[#F1F5F9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{m.icon}</span>
                      <span className="text-[10px] font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.amount_received')}</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amountReceived || ''}
                      onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                      placeholder="0.00"
                    />
                    {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].map(amt => (
                      amt > 0 && amt !== amountReceived && (
                        <button
                          key={amt}
                          onClick={() => setAmountReceived(amt)}
                          className="px-2 py-1 bg-[#f1f5f9] dark:bg-muted rounded-lg text-xs font-semibold hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20"
                        >{amt.toFixed(0)}</button>
                      )
                    )).slice(0, 3)}
                  </div>
                  {changeDue > 0 && (
                    <p className="mt-2 text-lg font-bold text-[#10b981] dark:text-emerald-400 flex items-center gap-2">
                      <span className="material-symbols-outlined">currency_exchange</span>
                      {t('pos.change')}: {changeDue.toFixed(2)} DH
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === 'credit' && (
                <div>
                  <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.deposit')}</p>
                  <input
                    type="number"
                    value={amountReceived || ''}
                    onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                    placeholder={t('pos.credit_info')}
                  />
                  {amountReceived > 0 && (
                    <p className="mt-1 text-xs text-[#ef4444] dark:text-red-400">{t('pos.remaining')}: {(total - amountReceived).toFixed(2)} DH</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.discount_total')}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={saleDiscount || ''}
                    onChange={e => setSaleDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                    placeholder="0"
                  />
                  <span className="text-xs text-[#64748B] dark:text-muted-foreground self-center">DH</span>
                  {[10, 20, 50].map(d => (
                    <button
                      key={d}
                      onClick={() => setSaleDiscount(d)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${saleDiscount === d ? 'bg-[#0F766E] dark:bg-teal-600 text-white' : 'bg-[#f1f5f9] dark:bg-muted hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20'}`}
                    >-{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#64748B] dark:text-muted-foreground mb-1">{t('pos.note')}</p>
                <textarea
                  value={saleNote}
                  onChange={e => setSaleNote(e.target.value)}
                  className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30 resize-none"
                  rows={2}
                  placeholder={t('pos.optional')}
                />
              </div>

              <div>
                <button onClick={() => setShowDelivery(prev => !prev)} className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-muted-foreground hover:text-[#0f172a] dark:hover:text-foreground transition-colors">
                  <span className="material-symbols-outlined text-sm">{showDelivery ? 'expand_less' : 'expand_more'}</span>
                  {t('pos.delivery')}
                </button>
                {showDelivery && (
                  <div className="mt-2 space-y-2 ps-4">
                    <input type="text" placeholder={t('pos.delivery_address')} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                    <div className="flex gap-2">
                      <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="flex-1 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                      <input type="number" placeholder={t('pos.fee')} value={deliveryFee || ''} onChange={e => setDeliveryFee(parseFloat(e.target.value) || 0)} className="w-24 bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#f8fafc] dark:bg-background rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.subtotal')}</span><span className="font-semibold">{subtotal.toFixed(2)} DH</span></div>
                {totalDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-[#ef4444] dark:text-red-400">{t('pos.discount')}</span><span className="font-semibold text-[#ef4444] dark:text-red-400">-{totalDiscount.toFixed(2)} DH</span></div>}
                <div className="flex justify-between text-sm"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.tax')}</span><span className="font-semibold">{tax.toFixed(2)} DH</span></div>
                {deliveryFee > 0 && <div className="flex justify-between text-sm"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.delivery')}</span><span className="font-semibold">{deliveryFee.toFixed(2)} DH</span></div>}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#F1F5F9] dark:border-border">
                  <span className="font-bold text-base">{t('pos.total')}</span>
                  <span className="font-bold text-base text-[#0F766E] dark:text-teal-400">{total.toFixed(2)} DH</span>
                </div>
              </div>

            </div>

            <div className="p-5 border-t border-[#F1F5F9] dark:border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 rounded-xl">{t('pos.cancel')}</Button>
              <Button onClick={confirmPayment} disabled={submitting} className="flex-1 py-2.5 rounded-xl">
                {submitting ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> {t('pos.processing')}</> : `${t('pos.confirm')} ${total.toFixed(2)} DH`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-card rounded-[20px] dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#10b981]/10 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-[#10b981] dark:text-emerald-400">check_circle</span>
              </div>
              <h2 className="font-bold text-xl text-[#0f172a] dark:text-foreground mb-1">{t('pos.sale_success')}</h2>
              <p className="text-sm text-[#64748B] dark:text-muted-foreground mb-2">#{`INV-${String(lastSale.id).padStart(4, '0')}`}</p>
              <p className="text-3xl font-extrabold text-[#0F766E] dark:text-teal-400 mb-4">{lastSale.total.toFixed(2)} DH</p>

              <div className="bg-[#f8fafc] dark:bg-background rounded-xl p-4 text-start space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.method')}</span><span className="font-semibold capitalize">{lastSale.payment_method}</span></div>
                <div className="flex justify-between"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.status')}</span><span className="font-semibold capitalize">{lastSale.payment_status}</span></div>
                {lastSale.amount_paid > 0 && <div className="flex justify-between"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.paid')}</span><span className="font-semibold">{lastSale.amount_paid.toFixed(2)} DH</span></div>}
                {lastSale.change_due > 0 && <div className="flex justify-between"><span className="text-[#64748B] dark:text-muted-foreground">{t('pos.change')}</span><span className="font-semibold text-[#10b981] dark:text-emerald-400">{lastSale.change_due.toFixed(2)} DH</span></div>}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowInvoiceModal(false); setLastSale(null); }} className="flex-1 py-2.5 rounded-xl">{t('pos.close')}</Button>
                <Button onClick={() => { setShowInvoiceModal(false); setLastSale(null); printBon(lastSale, settingsRef.current); }} className="flex-1 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-sm">print</span> {t('pos.print')}
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

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#F1F5F9] dark:border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{t('pos.shortcuts')}</h3>
              <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-xl text-muted-foreground">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <span className="text-sm text-foreground">Aide Raccourcis</span>
                <kbd className="px-2 py-1 bg-white dark:bg-background border border-border rounded text-xs font-mono">F1</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <span className="text-sm text-foreground">Rechercher Produit</span>
                <kbd className="px-2 py-1 bg-white dark:bg-background border border-border rounded text-xs font-mono">F2</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <span className="text-sm text-foreground">Afficher/Masquer Panier</span>
                <kbd className="px-2 py-1 bg-white dark:bg-background border border-border rounded text-xs font-mono">F4</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <span className="text-sm text-foreground">Mettre en Attente</span>
                <kbd className="px-2 py-1 bg-white dark:bg-background border border-border rounded text-xs font-mono">Ctrl+H</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <span className="text-sm text-foreground">Paiement</span>
                <kbd className="px-2 py-1 bg-white dark:bg-background border border-border rounded text-xs font-mono">Ctrl+P</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <span className="text-sm text-foreground">Fermer Modales</span>
                <kbd className="px-2 py-1 bg-white dark:bg-background border border-border rounded text-xs font-mono">Esc</kbd>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Appuyez sur F1 pour masquer cette aide
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartPanel({
  cart, totalItems, subtotal, totalDiscount, tax, total,
  submitting, onUpdateQty, onUpdatePrice, onClear, onConfirm, onHold,
  selectedCustomer, showCustomerDropdown, customerSearch, filteredCustomers,
  onToggleCustomer, onSelectCustomer, onClearCustomer, onCustomerSearch, onOpenNumpad,
  newCustomerName, newCustomerPhone, onNewCustomerName, onNewCustomerPhone, onAddNewCustomer,
  onToggleDiscountType, onToggleTaxExempt, selectedCustomerDebt,
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] flex flex-col h-full">
      <div className="p-3 border-b border-[#F1F5F9] dark:border-border space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm text-[#0f172a] dark:text-foreground">{t('pos.cart')}</h2>
          {cart.length > 0 && (
            <div className="flex items-center gap-1">
              <button onClick={onHold} className="text-[#f59e0b] dark:text-amber-400 hover:bg-[#fffbeb] dark:hover:bg-amber-950/30 p-1 rounded-lg transition-colors" title={t('pos.suspend')}>
                <span className="material-symbols-outlined text-sm">pause_circle</span>
              </button>
              <button onClick={onClear} className="text-[#ef4444] dark:text-red-400 hover:bg-[#ef4444]/10 dark:hover:bg-red-950/30 p-1 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <div
            className="flex items-center gap-1.5 bg-[#f8fafc] dark:bg-background p-1.5 rounded-lg cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-accent transition-colors"
            onClick={onToggleCustomer}
          >
            <div className="w-6 h-6 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xs text-[#0F766E] dark:text-teal-400">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-[#0f172a] dark:text-foreground truncate leading-tight">
                {selectedCustomer ? selectedCustomer.name : t('pos.general')}
              </p>
            </div>
            <span className="material-symbols-outlined text-xs text-[#64748B] dark:text-muted-foreground shrink-0">
              {showCustomerDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          {showCustomerDropdown && (
            <div className="absolute top-full inset-x-0 mt-1 z-40 bg-white dark:bg-card border border-[#F1F5F9] dark:border-border dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] rounded-xl shadow-xl overflow-hidden">
              <div className="p-2">
                <input
                  type="text"
                  placeholder={t('pos.search_customer')}
                  value={customerSearch}
                  onChange={e => onCustomerSearch(e.target.value)}
                  className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto">
                <button onClick={onClearCustomer} className="w-full text-start px-3 py-2 hover:bg-[#f8fafc] dark:hover:bg-accent flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#f1f5f9] dark:bg-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs">person_off</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs">{t('pos.general')}</p>
                    <p className="text-[10px] text-[#64748B] dark:text-muted-foreground">{t('pos.without_account')}</p>
                  </div>
                </button>
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCustomer(c)}
                    className={`w-full text-start px-3 py-2 hover:bg-[#f8fafc] dark:hover:bg-accent flex items-center gap-2 ${selectedCustomer?.id === c.id ? 'bg-[#0F766E]/10 dark:bg-teal-500/20' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0F766E]/10 dark:bg-teal-500/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#0F766E] dark:text-teal-400">{c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate">{c.name}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-muted-foreground truncate">{c.phone || t('pos.no_phone')}</p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-[#F1F5F9]/50 dark:border-border/50 p-2 space-y-2">
                  <p className="text-[10px] text-[#64748B] dark:text-muted-foreground font-semibold">{t('pos.new_customer')}</p>
                  <input type="text" placeholder={t('pos.name')} value={newCustomerName} onChange={e => onNewCustomerName(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                  <input type="text" placeholder={t('pos.phone_optional')} value={newCustomerPhone} onChange={e => onNewCustomerPhone(e.target.value)} className="w-full bg-[#f8fafc] dark:bg-background rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]/30 dark:focus:ring-teal-700/30" />
                  <Button size="sm" className="w-full text-xs rounded-lg" onClick={onAddNewCustomer}>{t('pos.add')}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <p className="text-[#64748B] dark:text-muted-foreground text-xs text-center py-8">{t('pos.add_items')}</p>
        ) : (
          cart.map((item) => (
            <div key={item.product_id} className="bg-[#f8fafc] dark:bg-background rounded-xl p-2.5">
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-[#0f172a] dark:text-foreground truncate">{item.product_name}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onOpenNumpad('price', item.product_id)} className="w-14 bg-[#f1f5f9] dark:bg-muted rounded px-1 py-0.5 text-[10px] font-semibold text-[#0f172a] dark:text-foreground text-end">{item.price.toFixed(2)}</button>
                    <span className="text-[10px] text-[#64748B] dark:text-muted-foreground">DH / kg</span>
                    {item.discount > 0 && <Badge variant="destructive" className="text-[8px] px-1 py-0">-{item.discount} DH</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onOpenNumpad('discount', item.product_id)} className="text-[#0F766E] dark:text-teal-400 hover:bg-[#0F766E]/10 dark:hover:bg-teal-500/20 p-0.5 rounded" title={t('pos.discount')}>
                    <span className="material-symbols-outlined text-sm">sell</span>
                  </button>
                  <button onClick={() => onUpdateQty(item.product_id, -item.qty)} className="text-[#ef4444] dark:text-red-400 hover:bg-[#ef4444]/10 dark:hover:bg-red-950/30 p-0.5 rounded ms-1 shrink-0">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white dark:bg-card rounded-md p-0.5">
                  <button onClick={() => onUpdateQty(item.product_id, -1)} className="w-6 h-6 rounded bg-[#f1f5f9] dark:bg-muted flex items-center justify-center hover:bg-[#f1f5f9]/80 dark:hover:bg-accent/80 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <button onClick={() => onOpenNumpad('qty', item.product_id)} className="font-bold text-xs text-[#0f172a] dark:text-foreground min-w-[2ch] text-center">{item.qty}</button>
                  <button onClick={() => onUpdateQty(item.product_id, 1)} className="w-6 h-6 rounded bg-[#0F766E] dark:bg-teal-600 text-white flex items-center justify-center hover:bg-[#0F766E]/80 dark:hover:bg-teal-600/80 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <p className="font-bold text-xs text-[#0F766E] dark:text-teal-400">{(item.price * item.qty).toFixed(2)} DH</p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCustomer && selectedCustomerDebt > 0 && (
        <div className="mx-3 mb-2 flex items-center gap-2 bg-[#fef3c7] dark:bg-amber-950/40 rounded-lg p-2">
          <span className="material-symbols-outlined text-[#d97706] dark:text-amber-400 text-sm">warning</span>
          <span className="text-xs font-medium text-[#92400e] dark:text-amber-300">
            {t('pos.debt_warning', { amount: selectedCustomerDebt.toFixed(2) })}
          </span>
        </div>
      )}

      <div className="p-4 bg-[#f8fafc] dark:bg-background rounded-b-2xl border-t border-[#F1F5F9] dark:border-border">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-[#64748B] dark:text-muted-foreground">{t('pos.subtotal')}</span>
            <span className="font-semibold text-[#0f172a] dark:text-foreground">{subtotal.toFixed(2)} DH</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-[#ef4444] dark:text-red-400">{t('pos.discount')}</span>
              <span className="font-semibold text-[#ef4444] dark:text-red-400">-{totalDiscount.toFixed(2)} DH</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-[#64748B] dark:text-muted-foreground">{t('pos.tax')}</span>
            <span className="font-semibold text-[#0f172a] dark:text-foreground">{tax.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-[#F1F5F9] dark:border-border">
            <span className="font-bold text-sm text-[#0f172a] dark:text-foreground">{t('pos.total')}</span>
            <span className="font-bold text-sm text-[#0F766E] dark:text-teal-400">{total.toFixed(2)} DH</span>
          </div>
        </div>

        <Button onClick={onConfirm} disabled={cart.length === 0 || submitting} className="w-full h-auto py-2.5 rounded-xl text-sm">
          {submitting ? (
            <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> {t('pos.processing')}</>
          ) : (
            <><span className="material-symbols-outlined text-sm">payments</span> {t('pos.confirm_sale')}</>
          )}
        </Button>
      </div>
    </div>
  );
}

function printBon(sale, settings = {}) {
  if (!sale) return;
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const customerName = sale.customer_name || 'Client Libre';
  const items = sale.items || [];
  const width = settings.receipt_width || '48';
  const showLogo = settings.receipt_show_logo !== 'false';
  const showTax = settings.receipt_show_tax !== 'false';
  const taxRate = parseFloat(settings.tax_rate || '5');

  const taxHtml = showTax ? `<div><span>TVA (${taxRate}%)</span><span>${sale.tax.toFixed(2)} DH</span></div>` : '';
  const logoHtml = showLogo
    ? `<div class="header"><h1>Simi Shop</h1><p>Grossiste en fruits et légumes</p></div>`
    : `<div class="title">BON DE VENTE</div>`;
  const titleHtml = showLogo ? `<div class="title">BON DE VENTE</div>` : '';

  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>Bon de vente</title>
    <style>
      body { font-family: 'Courier New', monospace; margin: 0; padding: ${width > 58 ? '40px' : '10px'}; color: #222; font-size: ${width > 58 ? '14px' : '11px'}; width: ${width}mm; }
      .header { text-align: center; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: ${width > 58 ? '24px' : '16px'}; }
      .header p { margin: 4px 0 0; color: #666; font-size: ${width > 58 ? '12px' : '9px'}; }
      .title { text-align: center; font-size: ${width > 58 ? '20px' : '13px'}; font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 8px 0; margin-bottom: 16px; }
      .info { margin-bottom: 16px; font-size: ${width > 58 ? '13px' : '10px'}; }
      .info div { display: flex; justify-content: space-between; padding: 2px 0; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: ${width > 58 ? '12px' : '10px'}; }
      th { background: #f5f5f5; text-align: left; padding: 4px 6px; font-size: ${width > 58 ? '12px' : '9px'}; border-bottom: 2px solid #ddd; }
      td { padding: 4px 6px; border-bottom: 1px solid #eee; }
      .right { text-align: right; }
      .totals { width: 100%; }
      .totals div { display: flex; justify-content: space-between; padding: 3px 0; font-size: ${width > 58 ? '13px' : '10px'}; }
      .totals .grand { font-weight: bold; font-size: ${width > 58 ? '15px' : '12px'}; border-top: 2px solid #333; padding-top: 6px; margin-top: 3px; }
      .note { margin-top: 12px; font-size: ${width > 58 ? '11px' : '9px'}; color: #666; font-style: italic; }
      hr { border: none; border-top: 1px dashed #999; margin: 12px 0; }
      @media print { body { padding: ${width > 58 ? '20px' : '5px'}; } }
    </style></head><body>
      ${logoHtml}
      ${titleHtml}
      <hr>
      <div class="info">
        <div><span>N°:</span><span>INV-${String(sale.id).padStart(4, '0')}</span></div>
        <div><span>Date:</span><span>${date}</span></div>
        <div><span>Client:</span><span>${customerName}</span></div>
        <div><span>Paiement:</span><span>${sale.payment_method || 'cash'}</span></div>
      </div>
      <hr>
      <table>
        <tr><th>Produit</th><th class="right">Qté</th><th class="right">P.U.</th><th class="right">Total</th></tr>
        ${items.map(item => `
          <tr>
            <td>${item.product_name}${item.discount > 0 ? ' (-' + item.discount + (item.discount_type === 'percentage' ? '%)' : ' DH)') : ''}</td>
            <td class="right">${item.qty} kg</td>
            <td class="right">${item.price.toFixed(2)}</td>
            <td class="right">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <hr>
      <div class="totals">
        <div><span>Sous-total</span><span>${items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)} DH</span></div>
        ${sale.discount_total > 0 ? `<div><span>Remise</span><span>-${sale.discount_total.toFixed(2)} DH</span></div>` : ''}
        ${taxHtml}
        ${sale.delivery_fee > 0 ? `<div><span>Livraison</span><span>${sale.delivery_fee.toFixed(2)} DH</span></div>` : ''}
        <div class="grand"><span>Total</span><span>${sale.total.toFixed(2)} DH</span></div>
      </div>
      ${sale.note ? `<div class="note">Note: ${sale.note}</div>` : ''}
      <hr>
      <div style="text-align: center; font-size: ${width > 58 ? '11px' : '9px'}; color: #999; margin-top: 8px;">
        Merci de votre confiance
      </div>
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}
