import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/card';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.summary().then(setSummary).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Revenu Total', value: summary ? `${summary.totalRevenue.toFixed(2)} DH` : '...', icon: 'payments', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Achats', value: summary ? `${summary.totalPurchases.toFixed(2)} DH` : '...', icon: 'shopping_cart', color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Bénéfice Brut', value: summary ? `${summary.grossProfit.toFixed(2)} DH` : '...', icon: 'trending_up', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Dépenses', value: summary ? `${summary.totalExpenses.toFixed(2)} DH` : '...', icon: 'receipt', color: 'text-error', bg: 'bg-error/10' },
    { label: 'Produits', value: summary?.productCount ?? '...', icon: 'inventory_2', color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { label: 'Clients', value: summary?.customerCount ?? '...', icon: 'group', color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-gutter pb-xl">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Rapports</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Vue d'ensemble de votre activité.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {stats.map(s => (
          <Card key={s.label} className="p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">{s.label}</p>
              <p className={`text-headline-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
