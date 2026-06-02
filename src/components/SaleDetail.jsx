import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function SaleDetail({ saleId, onClose }) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!saleId) return;
    setLoading(true);
    api.sales.get(saleId)
      .then(setSale)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [saleId]);

  const subtotal = sale ? sale.items.reduce((s, i) => s + i.price * i.qty, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-8 border-b border-outline-variant/20">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              #{saleId ? `INV-${String(saleId).padStart(4, '0')}` : ''}
            </h2>
            <p className="text-label-md text-on-surface-variant">Détails de la facture</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 p-8 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sale ? (
          <>
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="bg-surface-container rounded-2xl p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-label-md text-on-surface-variant">Date</span>
                  <span className="font-bold text-body-md">
                    {new Date(sale.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label-md text-on-surface-variant">Client</span>
                  <span className="font-bold text-body-md">{sale.customer_name}</span>
                </div>
                {sale.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-label-md text-on-surface-variant">Téléphone</span>
                    <span className="font-bold text-body-md">{sale.customer_phone}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Articles</h3>
                <div className="space-y-3">
                  {sale.items.map((item, i) => (
                    <div key={item.id || i} className="flex items-center justify-between bg-surface-container rounded-xl p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-body-md text-on-surface truncate">{item.product_name}</p>
                        <p className="text-label-md text-on-surface-variant">{item.price.toFixed(2)} DH × {item.qty} {item.unit}</p>
                      </div>
                      <p className="font-bold text-body-lg text-primary ml-4">
                        {(item.price * item.qty).toFixed(2)} DH
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface-container-low border-t border-outline-variant/20 rounded-b-2xl space-y-2">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Sous-total</span>
                <span className="font-bold text-on-surface">{subtotal.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">TVA (5%)</span>
                <span className="font-bold text-on-surface">{sale.tax.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-outline-variant/20">
                <span className="font-bold text-headline-sm text-on-surface">Total</span>
                <span className="font-bold text-headline-sm text-primary">{sale.total.toFixed(2)} DH</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-on-surface-variant">Vente introuvable</div>
        )}
      </div>
    </div>
  );
}
