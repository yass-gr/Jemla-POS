import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const DONUT_COLORS = ['#0F766E', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

function formatPrice(v) {
  return Number(v || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Reports() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.reports.summary(period),
      api.dashboard.salesTrend(period),
      api.dashboard.topProducts(period),
      api.reports.salesByCategory(period)
    ]).then(([sum, trend, top, cats]) => {
      setSummary(sum);
      setSalesTrend(trend);
      setTopProducts(top);
      setSalesByCategory(cats);
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
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
      value: `${formatPrice(revenue)} DH`,
      icon: 'payments',
      badge: `${isUp ? '+' : ''}${weeklyChange}%`,
      badgeColor: isUp ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40' : 'text-slate-600 bg-slate-100 dark:text-muted-foreground dark:bg-muted',
      iconColor: 'text-emerald-300 dark:text-emerald-400',
      gradient: 'from-white to-emerald-500/10 dark:from-card dark:to-emerald-900/60',
    },
    {
      label: t('reports.purchases'),
      value: `${formatPrice(purchases)} DH`,
      icon: 'shopping_cart',
      badge: `${purchaseRatio}%`,
      badgeColor: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40',
      iconColor: 'text-blue-300 dark:text-blue-400',
      gradient: 'from-white to-blue-500/10 dark:from-card dark:to-blue-900/60',
    },
    {
      label: t('reports.gross_profit'),
      value: `${formatPrice(grossProfit)} DH`,
      icon: 'trending_up',
      badge: `${profitMargin}%`,
      badgeColor: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40',
      iconColor: 'text-amber-300 dark:text-amber-400',
      gradient: 'from-white to-amber-500/10 dark:from-card dark:to-amber-900/60',
    },
    {
      label: t('reports.expenses'),
      value: `${formatPrice(expenses)} DH`,
      icon: 'receipt',
      badge: `${expenseRatio}%`,
      badgeColor: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40',
      iconColor: 'text-red-300 dark:text-red-400',
      gradient: 'from-white to-red-500/10 dark:from-card dark:to-red-900/60',
    },
  ];

  const totalProductRevenue = topProducts.reduce((s, p) => s + p.revenue, 0);
  const topProductShare = topProducts.length > 0 && totalProductRevenue > 0
    ? ((topProducts[0].revenue / totalProductRevenue) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-start justify-between gap-4 pt-1 pb-2">
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

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <div key={i}
            data-reveal
            className={`h-[105px] p-3 sm:p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between bg-gradient-to-br ${k.gradient} transition-colors`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em] uppercase">{k.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.badgeColor}`}>{k.badge}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-lg sm:text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{k.value}</span>
              <span className={`material-symbols-outlined text-xl sm:text-2xl ${k.iconColor}`}>{k.icon}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div data-reveal className="lg:col-span-2 bg-white dark:bg-card border border-border rounded-3xl shadow-lg shadow-black/5 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] p-4 sm:p-5 min-h-[280px] sm:min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">{t('dashboard.sales_analysis')}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t(period === 'week' ? 'dashboard.weekly_trends' : 'dashboard.all_time')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <span className="text-[10px] font-semibold text-muted-foreground">{t('dashboard.this_week')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span>
                <span className="text-[10px] font-semibold text-muted-foreground">{t('dashboard.last_week')}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="reportsChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-20" />
                <Area type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" fillOpacity={0} dot={false} />
                <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2.5} fill="url(#reportsChartFill)" dot={false} activeDot={{ r: 5, fill: "#14b8a6", strokeWidth: 2, stroke: "#09090B" }} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    fontSize: 12,
                    color: '#f4f4f5',
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4, color: '#f4f4f5' }}
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)}k DH`,
                    name === 'value' ? t('dashboard.this_week') : t('dashboard.last_week')
                  ]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div data-reveal className="bg-white dark:bg-card border border-border rounded-3xl shadow-lg shadow-black/5 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] p-4 sm:p-5">
          <h3 className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider">{t('dashboard.top_products')}</h3>
          <p className="text-[10px] text-muted-foreground mb-4">{t('reports.subtitle')}</p>
          {topProducts.length > 0 ? (
            <>
              <div className="flex justify-center mb-4 relative">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProducts.slice(0, 6)}
                        cx="50%" cy="50%"
                        innerRadius={44}
                        outerRadius={68}
                        dataKey="revenue"
                        strokeWidth={0}
                        stroke="none"
                        paddingAngle={3}
                      >
                        {topProducts.slice(0, 6).map((_, idx) => (
                          <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: 12,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                          fontSize: 12,
                          color: '#f4f4f5',
                        }}
                        formatter={(value) => [`${Number(value).toFixed(0)} DH`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-1">
                {topProducts.slice(0, 4).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                      <span className="text-xs text-foreground truncate max-w-[110px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{p.sales}</span>
                      <span className="text-xs font-bold text-foreground w-[80px] text-right">{p.revenue.toFixed(0)} DH</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-12">{t('dashboard.no_product_data')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div data-reveal className="bg-white dark:bg-card border border-border rounded-3xl shadow-lg shadow-black/5 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">{t('reports.revenue')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t(period === 'week' ? 'dashboard.week' : period === 'all' ? 'dashboard.all_time' : `dashboard.${period}`)}</p>
          </div>
          <div className="h-[260px] w-full">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-20" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: 12,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      fontSize: 12,
                      color: '#f4f4f5',
                    }}
                    formatter={(value) => [`${Number(value).toFixed(1)}k DH`, t('reports.badge_revenue')]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {salesTrend.map((entry, idx) => {
                      const maxVal = Math.max(...salesTrend.map(d => d.value));
                      return (
                        <Cell key={idx} fill={entry.value >= maxVal ? '#14b8a6' : '#14b8a640'} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{t('dashboard.no_product_data')}</div>
            )}
          </div>
        </div>

        <div data-reveal className="bg-white dark:bg-card border border-border rounded-3xl shadow-lg shadow-black/5 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">{t('reports.sales_by_category')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t(period === 'week' ? 'dashboard.week' : period === 'all' ? 'dashboard.all_time' : `dashboard.${period}`)}</p>
          </div>
          {salesByCategory.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%" cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        dataKey="revenue"
                        strokeWidth={0}
                        stroke="none"
                        paddingAngle={3}
                      >
                        {salesByCategory.map((_, idx) => (
                          <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: 12,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                          fontSize: 12,
                          color: '#f4f4f5',
                        }}
                        formatter={(value) => [`${Number(value).toFixed(0)} DH`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-1.5">
                {salesByCategory.map((cat, idx) => {
                  const totalRevenue = salesByCategory.reduce((s, c) => s + c.revenue, 0);
                  const share = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                        <span className="text-xs text-foreground truncate">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{share}%</span>
                        <span className="text-xs font-bold text-foreground w-[80px] text-right">{Number(cat.revenue).toFixed(0)} DH</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-xs text-muted-foreground">{t('dashboard.no_product_data')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
