import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.customers.list().then(data => {
      setCustomers(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalDebt = customers.reduce((sum, c) => sum + c.debt_balance, 0);
  const activeDebt = customers.filter(c => c.debt_balance > 0).length;

  return (
    <div className="space-y-gutter pb-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-primary font-bold text-label-md">{customers.length} total</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md">Total Clients</p>
            <h3 className="text-headline-md font-headline-md">{customers.length}</h3>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="text-error font-bold text-label-md">{activeDebt} avec dettes</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md">Dettes Impayées</p>
            <h3 className="text-headline-md font-headline-md text-error">{totalDebt.toFixed(2)} DH</h3>
          </div>
        </div>
        <div className="bg-primary p-6 rounded-[24px] shadow-xl shadow-primary/20 flex flex-col justify-center items-center text-on-primary group cursor-pointer hover:scale-[1.02] transition-all">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h4 className="font-bold text-headline-sm">Nouveau Client</h4>
          <p className="text-on-primary/70 text-label-md">Ajouter à la base de données</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[32px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/20">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Répertoire des Clients</h3>
            <p className="text-body-md text-on-surface-variant">Gestion des comptes et des soldes</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-full text-label-md hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filtrer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-full text-label-md hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">file_download</span> Exporter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50">
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nom du Client</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Contact</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Adresse</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Solde Dette</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {customers.map((c) => {
                const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={c.id} className="hover:bg-surface-container-lowest group transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-body-lg text-on-surface leading-none">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-body-md text-on-surface">{c.phone || '-'}</p>
                      <p className="text-label-md text-on-surface-variant">{c.email || '-'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-body-md text-on-surface-variant max-w-[200px] truncate">{c.address || '-'}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-2 bg-error/10 rounded-full font-bold text-body-md ${c.debt_balance > 0 ? 'text-error' : 'text-primary'}`}>
                        {c.debt_balance.toFixed(2)} DH
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && !loading && (
                <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">Aucun client trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-surface-container/30 border-t border-outline-variant/20 flex justify-between items-center">
          <p className="text-label-md text-on-surface-variant">Affichage de {customers.length} clients</p>
        </div>
      </div>
    </div>
  );
}
