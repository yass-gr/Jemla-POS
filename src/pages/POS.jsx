const categories = [
  { name: 'All Products', icon: 'apps', active: true },
  { name: 'Fruits', icon: 'nutrition', active: false },
  { name: 'Vegetables', icon: 'eco', active: false },
];

const products = [
  { name: 'Fresh Strawberry', category: 'Fruits', price: '$12.50', unit: 'per kg', stock: 15, img: 'https://lh3.googleusercontent.com/aida/AP1WRLsyKtZC8w4T2O9STsqpThGzI4lJkD_fgoGKcuCDpV8XspNS0pZ10dRyrQBMzlzAT-BO5od7s5lASrA16ztp3WSZKCKm52EpJ3Hm4ipfi_hYui_sjPa8aiq9guzlpHtkFKiYSOViESmgJDRtCm2nzwp0Rllu_JLcbhPG0cue_sK_OUgq2HhSn7ykJZ3JWzBrArsggXjCPJXCJzesu7ErsitBdferEAJiLkV3z5vH95g9ZrScglNp8kZIzsk' },
  { name: 'Organic Cabbage', category: 'Vegetables', price: '$4.20', unit: 'per unit', stock: 0, img: 'https://lh3.googleusercontent.com/aida/AP1WRLtvAdKpG-HT_WBY1icfQV_nBuMidsF4_LtDu9V8XnUNQGkeEOTn_dzoVdyGzLND0w62rAMl-RnBXCBRMpaJdfshJVekb2hmgBET3YV08lTr58AevkfHbYSrcjk1FbzDWRkDm07fhpBbNRYvpp_KvdmAe2eovrycgXre-Cp4stnbYilXoEhZzTwWQhP6BPw5ztooEedhgFC2thiTCc7aNE1qwtVlqrAGBXqPezryRACy_iuKpOUJ-6eLS1o' },
  { name: 'Garden Mix Bowl', category: 'Vegetables', price: '$18.90', unit: 'per pack', stock: 8, img: 'https://lh3.googleusercontent.com/aida/AP1WRLvxfCXxUBsEhovliXmZB1LVr96Aa-xpO8Z-BG4JyeRwAAeYuwu3ZTkt2yM_HtYCXi-Uxbsa05ZRgR6SANHNSJq6w3oKG9ozCpJreBzAi_HzsKtZkMTZGf8N6c2859T-mdmfyleBeScESr2KJZ6PrhshslkdIyOMmvB7UitdWKXenyu80J8ePMhs7kq69GGV5F6YklOoGN2zf9vVUtv3A6iEquxEdYhXsQNfShhvJn7ICTeM675geI-oWik' },
  { name: 'Valencia Orange', category: 'Fruits', price: '$3.15', unit: 'per kg', stock: 20, img: 'https://lh3.googleusercontent.com/aida/AP1WRLsVgT2cUQmDm_mQYEfxOEKLRobYkrjB2tXgLVnqJ43FPrt5lNgpWfoOqHcfBDIWfm6HrkKeg8dBO2gksKCN16QskilS8kaW6QEyE7bfVXrpuHGAXX4xFCJEEILHKJgeawVLY5Y2wN858SMZlWRG0yjPZLcmGfaf6wCsVmCpOiaeo2i4Id0WC-PyFfmuUZIAAY6AksXtFbZQ9BYtm-BFxGF3rQDLIebC_ARLOXWzhR1zoWOwvpPbt_By3A' },
  { name: 'Granny Smith', category: 'Fruits', price: '$5.50', unit: 'per kg', stock: 12, img: 'https://lh3.googleusercontent.com/aida/AP1WRLvC9OA3NYEvC7qtIs24eAZeWZ-Fz9-yO1TTgkgXbRRhZk2Zz34u27td9jkxsUPQuH4nPfW2LPGOYQKE1Kg3IPu39_NnGkBuJ8Ulw9yoJyMBLmMbIAzVL5dMbGepn1TmINuLNlQ1kO1NcZPXhkctPbjUFBREvM58CcjD3ufY5kmj8Gqi3p8454rFrspEADXVz-9f2zKtGv1WndHklYmACN1MGhDPMvtThiQH21QKEMXmuxCpmT0rqpivlQ' },
  { name: 'Rainbow Carrots', category: 'Vegetables', price: '$8.40', unit: 'per bunch', stock: 5, img: 'https://lh3.googleusercontent.com/aida/AP1WRLs5liRYhnALuEEoQriBWv7VMaEV_EzjuzAWr6-SFvfMYggW67LZTs0XrNvj77QoVYAQG8PtBrNhOL4-ieuc5vj0ocrHit7s87d0Yv58KXlRRUnLxdQttNso3ofQ6_Q1kVYp-Vw62YQIrTwY3fuenldN83oZcgGwm_anLkHSW06M2bmH72G0a2l1vxcwjN5mqSYfbiJAwMFqlHIQK6WM6JdyZ90C1katZzY1pQoU9Z6iK2_wlsX0ioVqPl8' },
];

const cartItems = [
  { name: 'Fresh Strawberry', price: 12.50, qty: 2, unit: 'kg', img: 'https://lh3.googleusercontent.com/aida/AP1WRLuzjlAPaFquDvj7GHqiJTw7cxCgrlJkdwtxIAJTd37R1rnEEHfhbIzX-MdiS9b0V2OC-S5mpMYly-Q4HCuEETCNceLrc9tIeXzvul1fGsj419a_JOT1kQ-CwYW6hZivBJWthANtLP7Z2hkapsDEJbpj1rcPM1YCWbaphFelFHmSLy12G2peSOURgkK6k0eYy3kBkJ-zuP6t5ThdhMefRq91AiKC-k4WDMxUFiWSQn8KIC8VS6lrEZlzGsE' },
  { name: 'Organic Cabbage', price: 4.20, qty: 1, unit: 'u', img: 'https://lh3.googleusercontent.com/aida/AP1WRLsMDmX7t7785lY12IAKYVTQPg-AGCBSG2vZBrf2Q21_XJACD6-qCdn5FIMU-wgtj-JeUpMJ_0HvxS4I_CavJ2pYfSVX29mzqhee6t5bEk_N33i2iahzYW5OhlrSjfFZqPSxMyezg_IaHpxVNpC4XjUm5XoW858WY4smecP8aOB6gWAbmobu6R_4sQDvLqsMK18Twy2V54rOX4VCZUDP89OxBJm-HELBg0LR6o0DqNHbLbjY7lQz8vC-FA' },
];

export default function POS() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-12 gap-gutter h-full overflow-hidden">
      <div className="col-span-3 flex flex-col gap-gutter h-full overflow-hidden">
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Customer</h2>
            <button className="text-primary hover:bg-primary-container/10 p-1 rounded-lg transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
          <div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">person</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-body-md">Walk-in Customer</p>
              <p className="text-label-md text-on-surface-variant">Default account</p>
            </div>
            <button className="material-symbols-outlined text-on-surface-variant">edit</button>
          </div>
        </section>
        <section className="flex-1 flex flex-col overflow-hidden">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Categories</h2>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`p-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                  cat.active
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-primary-container/20 border border-outline-variant/20'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                <span className="text-label-md">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="col-span-6 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Available Products <span className="text-on-surface-variant font-normal text-body-lg ml-2">(42 Items)</span>
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
        <div className="grid grid-cols-3 gap-5 overflow-y-auto pr-2 pb-6">
          {products.map((p) => (
            <div
              key={p.name}
              className="group bg-surface-container-lowest rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-outline-variant/20 relative overflow-hidden cursor-pointer"
            >
              {p.stock > 0 && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-primary-container/20 text-on-primary-container px-2 py-1 rounded-full text-[10px] font-bold">
                    {p.stock} in stock
                  </span>
                </div>
              )}
              <div className="h-32 mb-4 rounded-2xl overflow-hidden bg-surface-container">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{p.category}</p>
              <h3 className="font-bold text-body-lg text-on-surface mb-2 truncate">{p.name}</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-primary font-bold text-headline-sm">{p.price}</p>
                  <p className="text-[10px] text-on-surface-variant">{p.unit}</p>
                </div>
                <button className="bg-primary-container text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-3 flex flex-col h-full overflow-hidden">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col h-full border border-outline-variant/30">
          <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Cart</h2>
              <p className="text-label-md text-on-surface-variant">Order #12845</p>
            </div>
            <button className="text-error hover:bg-error-container/20 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.name} className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-md truncate">{item.name}</p>
                  <p className="text-label-md text-on-surface-variant">
                    ${item.price.toFixed(2)} x {item.qty}
                    {item.unit}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-bold text-primary">${(item.price * item.qty).toFixed(2)}</p>
                  <div className="flex items-center gap-2 bg-surface-container rounded-lg p-1">
                    <button className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-primary">remove</button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-primary">add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-surface-container-low rounded-b-2xl border-t border-outline-variant/30">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Tax (5%)</span>
                <span className="font-bold text-on-surface">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-outline-variant/20">
                <span className="font-bold text-headline-sm text-on-surface">Total</span>
                <span className="font-bold text-headline-sm text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className="flex flex-col items-center justify-center gap-2 bg-surface-container-highest/50 py-4 rounded-xl hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-on-surface">receipt_long</span>
                <span className="text-[10px] font-bold">Hold Order</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 bg-surface-container-highest/50 py-4 rounded-xl hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-on-surface">percent</span>
                <span className="text-[10px] font-bold">Add Discount</span>
              </button>
            </div>
            <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <span className="material-symbols-outlined">payments</span>
              Confirm Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
