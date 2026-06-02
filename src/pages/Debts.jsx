import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function Debts() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.customers.list().then(data => {
      setCustomers(data.filter(c => c.debt_balance > 0));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalDebts = customers.reduce((sum, c) => sum + c.debt_balance, 0);

  return (
    <div className="space-y-6 pb-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestion des Dettes</h2>
          <p className="text-body-md text-on-surface-variant">Suivez les soldes impayés des clients.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-high transition-colors font-semibold text-label-md">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filtrer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-high transition-colors font-semibold text-label-md">
            <span className="material-symbols-outlined text-sm">file_download</span> Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Total Dettes</span>
            <div className="p-2 bg-error-container text-on-error-container rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">{totalDebts.toFixed(2)} DH</p>
            <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              {customers.length} comptes actifs
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Créditeurs Actifs</span>
            <div className="p-2 bg-secondary-container text-on-secondary-fixed-variant rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">{customers.length}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Avec soldes impayés</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Dette Moyenne</span>
            <div className="p-2 bg-primary-container text-on-primary rounded-lg">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">
              {customers.length > 0 ? (totalDebts / customers.length).toFixed(2) : '0.00'} DH
            </p>
            <p className="text-label-md text-on-surface-variant mt-1">Par compte</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Soldes Impayés</h3>
          <span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md text-on-surface-variant">Trié par: Montant</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Client</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Montant Dû</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Contact</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {customers.map((c) => {
                const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={c.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary">
                          {initials}
                        </div>
                        <div>
                          <p className="text-body-lg font-bold text-on-surface">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className={`text-body-lg font-extrabold ${c.debt_balance > 5000 ? 'text-error' : 'text-on-surface'}`}>
                        {c.debt_balance.toFixed(2)} DH
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-body-md text-on-surface">{c.phone || '-'}</p>
                      <p className="text-label-md text-on-surface-variant">{c.email || '-'}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="bg-primary-container text-on-primary px-5 py-2 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                        Payer
                      </button>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && !loading && (
                <tr><td colSpan="4" className="text-center py-8 text-on-surface-variant">Aucune dette impayée</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">{customers.length} clients avec dettes</p>
        </div>
      </div>
    </div>
  );
}
