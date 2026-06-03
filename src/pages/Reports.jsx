import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const DONUT_COLORS = ['#0F766E', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

export default function Reports() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.reports.summary(period),
      api.dashboard.salesTrend(period),
      api.dashboard.topProducts(period)
    ]).then(([sum, trend, top]) => {
      setSummary(sum);
      setSalesTrend(trend);
      setTopProducts(top);
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const revenue = summary?.totalRevenue || 0;
  const purchases = summary?.totalPurchases || 0;
  const grossProfit = summary?.grossProfit || 0;
  const expenses = summary?.totalExpenses || 0;

  const profitMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : '0.0';
  const expenseRatio = revenue > 0 ? ((expenses / revenue) * 100).toFixed(1) : '0.0';
  const purchaseRatio = revenue > 0 ? ((purchases / revenue) * 100).toFixed(1) : '0.0';

  const thisWeekTotal = salesTrend.reduce((s, d) => s + d.value, 0);
  const lastWeekTotal = salesTrend.reduce((s, d) => s + (d.previous || 0), 0);
  const weeklyChange = lastWeekTotal > 0 ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1) : '0.0';
  const isUp = Number(weeklyChange) >= 0;

  const kpis = [
    {
      label: t('reports.revenue'),
      value: `${revenue.toFixed(2)} DH`,
      icon: 'payments',
      badge: `${isUp ? '+' : ''}${weeklyChange}%`,
      badgeColor: isUp ? 'text-success-foreground bg-success/10' : 'text-destructive-foreground bg-destructive/10',
      iconBg: 'bg-success/10 text-success-foreground dark:bg-success/20',
      gradient: 'from-white to-emerald-500/10 dark:from-card dark:to-emerald-950/40',
    },
    {
      label: t('reports.purchases'),
      value: `${purchases.toFixed(2)} DH`,
      icon: 'shopping_cart',
      badge: `${purchaseRatio}%`,
      badgeColor: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      gradient: 'from-white to-blue-500/10 dark:from-card dark:to-blue-950/40',
    },
    {
      label: t('reports.gross_profit'),
      value: `${grossProfit.toFixed(2)} DH`,
      icon: 'trending_up',
      badge: `${profitMargin}%`,
      badgeColor: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950',
      iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      gradient: 'from-white to-amber-500/10 dark:from-card dark:to-amber-950/40',
    },
    {
      label: t('reports.expenses'),
      value: `${expenses.toFixed(2)} DH`,
      icon: 'receipt',
      badge: `${expenseRatio}%`,
      badgeColor: 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950',
      iconBg: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
      gradient: 'from-white to-red-500/10 dark:from-card dark:to-red-950/40',
    },
  ];

  function ChartTooltip({ active, payload, label, valueFormat, nameFormat }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-border bg-white dark:bg-card px-4 py-3 shadow-lg">
        {label && <p className="text-label-sm font-label-sm text-muted-foreground mb-1.5">{label}</p>}
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-body-md font-body-md text-foreground">
              {nameFormat?.(entry.name) ?? entry.name}: {valueFormat?.(entry.value) ?? entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const currentLabel = t(period === 'week' ? 'dashboard.this_week' : 'dashboard.current_period');
  const previousLabel = period === 'all' ? '' : t(period === 'week' ? 'dashboard.last_week' : 'dashboard.previous_period');

  const totalProductRevenue = topProducts.reduce((s, p) => s + p.revenue, 0);
  const topProductShare = topProducts.length > 0 && totalProductRevenue > 0
    ? ((topProducts[0].revenue / totalProductRevenue) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4 py-2">
        <div>
          <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">{t('reports.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="flex bg-muted p-0.5 rounded-lg shrink-0">
          {['week', 'month', 'year', 'all'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(p === 'all' ? 'dashboard.all_time' : `dashboard.${p}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => (
          <div key={i}
            className={`rounded-2xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border flex flex-col justify-between bg-gradient-to-br hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-200 ${k.gradient}`}>
            <div className="flex justify-between items-start">
              <div className={`p-2.5 rounded-xl ${k.iconBg}`}>
                <span className="material-symbols-outlined text-lg">{k.icon}</span>
              </div>
              <span className={`text-label-lg font-label-lg px-2.5 py-1 rounded-full ${k.badgeColor}`}>
                {k.badge}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-label-lg font-label-lg text-muted-foreground/70 mb-0.5">{k.label}</p>
              <h3 className="text-headline-sm font-headline-sm text-foreground">{k.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-card shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h4 className="text-title-lg font-title-lg text-foreground">{t('dashboard.weekly_trends')}</h4>
              <p className="text-body-md text-muted-foreground/70">{t(period === 'week' ? 'dashboard.week' : period === 'all' ? 'dashboard.all_time' : `dashboard.${period}`)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-label-lg font-label-lg text-muted-foreground">{currentLabel}</span>
              </div>
              {previousLabel && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#94a3b8]"></span>
                  <span className="text-label-lg font-label-lg text-muted-foreground">{previousLabel}</span>
                </div>
              )}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="thisWeekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="lastWeekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<ChartTooltip valueFormat={v => v.toFixed(1) + 'k DH'} nameFormat={n => n === 'value' ? currentLabel : previousLabel} />} />
                <Area type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#lastWeekGrad)" />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#thisWeekGrad)" dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 3, stroke: 'white' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-white dark:bg-card shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border">
          <h4 className="text-title-lg font-title-lg text-foreground mb-1">{t('dashboard.top_products')}</h4>
          <p className="text-body-md text-muted-foreground/70 mb-6">{t('reports.subtitle')}</p>
          {topProducts.length > 0 ? (
            <>
              <div className="flex justify-center mb-6 relative">
                <div className="w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProducts.slice(0, 6)}
                        cx="50%" cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        dataKey="revenue"
                        strokeWidth={0}
                        paddingAngle={2}
                      >
                        {topProducts.slice(0, 6).map((_, idx) => (
                          <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip valueFormat={v => Number(v).toFixed(0) + ' DH'} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="text-headline-sm font-headline-sm text-foreground">{topProductShare}%</span>
                      <p className="text-label-sm font-label-sm text-muted-foreground uppercase tracking-wider">{t('dashboard.best_customer')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-1">
                {topProducts.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 px-3 rounded-xl hover:bg-surface-variant/50 dark:hover:bg-muted/30 transition-colors -mx-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}></span>
                      <span className="text-body-md font-body-md text-muted-foreground truncate max-w-[130px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-label-sm font-label-sm text-muted-foreground/60">{p.sales}</span>
                      <span className="text-body-md font-bold text-foreground w-[90px] text-right">{p.revenue.toFixed(0)} DH</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">{t('dashboard.no_product_data')}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 pt-6 pb-0">
          <CardTitle>{t('reports.revenue')}</CardTitle>
          <CardDescription>{t(period === 'week' ? 'dashboard.week' : period === 'all' ? 'dashboard.all_time' : `dashboard.${period}`)}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[260px] w-full">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip content={<ChartTooltip valueFormat={v => v + 'K DH'} nameFormat={() => t('reports.badge_revenue')} />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                    {salesTrend.map((entry, idx) => {
                      const maxVal = Math.max(...salesTrend.map(d => d.value));
                      return (
                        <Cell key={idx} fill={entry.value >= maxVal ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">{t('dashboard.no_product_data')}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
