import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.sales.list(),
      api.sales.stats(),
    ]).then(([s, st]) => {
      setSales(s);
      setStats(st);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-xl">
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Historique des Ventes</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Consultez et gérez vos transactions.</p>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Revenu Total</p>
              <p className="text-headline-sm font-bold text-primary">
                {stats ? `${stats.totalRevenue.toFixed(2)} DH` : '...'}
              </p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Total Ventes</p>
              <p className="text-headline-sm font-bold text-on-surface">{stats ? stats.totalSales : '...'}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
            <div className="w-12 h-12 bg-error-container/10 rounded-xl flex items-center justify-center text-error">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Dettes Impayées</p>
              <p className="text-headline-sm font-bold text-error">
                {stats ? `${stats.pendingDebts.toFixed(2)} DH` : '...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full text-label-md font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Ce Mois
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full text-label-md font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Statut: Tous
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">download</span>
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">print</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container-high overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant">
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Facture</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Date</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Client</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Articles</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Total</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Statut</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="text-body-md font-bold text-primary">{s.invoice}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="text-body-md text-on-surface">{s.date}</div>
                  <div className="text-label-md text-on-surface-variant">{s.time}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center text-xs font-bold">
                      {s.initials}
                    </div>
                    <span className="text-body-md font-medium text-on-surface">{s.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-body-md text-on-surface-variant">{s.items}</div>
                </td>
                <td className="px-8 py-6 text-body-md font-bold text-on-surface">{s.total}</td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${s.statusColor}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && !loading && (
              <tr><td colSpan="7" className="text-center py-8 text-on-surface-variant">Aucune vente trouvée</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-8 py-5 bg-surface-container/30 border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant font-medium">Affichage de {sales.length} ventes</p>
        </div>
      </div>
    </div>
  );
}
