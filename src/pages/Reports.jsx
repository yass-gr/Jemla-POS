import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';

export default function Reports() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.summary().then(setSummary).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: t('reports.revenue'), value: summary ? `${summary.totalRevenue.toFixed(2)} DH` : '...', icon: 'payments', valueColor: 'text-[#0F766E] dark:text-teal-400' },
    { label: t('reports.purchases'), value: summary ? `${summary.totalPurchases.toFixed(2)} DH` : '...', icon: 'shopping_cart', valueColor: 'text-[#0f172a] dark:text-foreground' },
    { label: t('reports.gross_profit'), value: summary ? `${summary.grossProfit.toFixed(2)} DH` : '...', icon: 'trending_up', valueColor: 'text-[#0F766E] dark:text-teal-400' },
    { label: t('reports.expenses'), value: summary ? `${summary.totalExpenses.toFixed(2)} DH` : '...', icon: 'receipt', valueColor: 'text-[#ef4444] dark:text-red-400' },
    { label: t('reports.products'), value: summary?.productCount ?? '...', icon: 'inventory_2', valueColor: 'text-[#0f172a] dark:text-foreground' },
    { label: t('reports.customers'), value: summary?.customerCount ?? '...', icon: 'group', valueColor: 'text-[#0f172a] dark:text-foreground' },
  ];

  return (
    <div className="space-y-5 pb-8">
      <div className="py-2">
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('reports.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('reports.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, idx) => {
          const gradients = ['from-white to-[#f0fdf4] dark:border-emerald-800/60 dark:from-card dark:to-emerald-950/40', 'from-white to-[#fef2f2] dark:border-red-800/60 dark:from-card dark:to-red-950/40', 'from-white to-[#eff6ff] dark:border-blue-800/60 dark:from-card dark:to-blue-950/40', 'from-white to-[#fffbeb] dark:border-amber-800/60 dark:from-card dark:to-amber-950/40', 'from-white to-[#f0fdf4] dark:border-emerald-800/60 dark:from-card dark:to-emerald-950/40', 'from-white to-[#faf5ff] dark:border-purple-800/60 dark:from-card dark:to-purple-950/40'];
          const badgeColors = ['bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'];
          const iconColors = ['text-emerald-300 dark:text-emerald-400', 'text-red-300 dark:text-red-400', 'text-blue-300 dark:text-blue-400', 'text-amber-300 dark:text-amber-400', 'text-emerald-300 dark:text-emerald-400', 'text-purple-300 dark:text-purple-400'];
          const badgeTexts = [t('reports.badge_revenue'), t('reports.badge_purchases'), t('reports.badge_profit'), t('reports.badge_expenses'), t('reports.badge_products'), t('reports.badge_customers')];
          return (
            <div key={s.label} className={`h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br ${gradients[idx]}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{s.label}</span>
                <span className={`flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full ${badgeColors[idx]}`}>{badgeTexts[idx]}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-xl font-extrabold leading-none ${s.valueColor}`}>{s.value}</span>
                <span className={`material-symbols-outlined text-2xl ${iconColors[idx]}`}>{s.icon}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
