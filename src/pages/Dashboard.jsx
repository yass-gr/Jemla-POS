import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
  Line, XAxis, ResponsiveContainer, Tooltip, Area, AreaChart,
  PieChart, Pie, Cell,
} from "recharts";

const DONUT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatPrice(v) {
  return Number(v || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-card border border-border rounded-3xl shadow-lg shadow-black/5 dark:bg-gradient-to-br dark:from-card dark:via-card dark:to-white/[0.07] ${className}`}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomer, setTopCustomer] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartInterval, setChartInterval] = useState("week");

  useEffect(() => {
    Promise.all([
      api.dashboard.stats(),
      api.dashboard.salesTrend(),
      api.dashboard.topProducts(),
      api.dashboard.topCustomers(),
      api.dashboard.recentTransactions(),
    ])
      .then(([s, t, p, c, r]) => {
        setStats(s);
        setSalesTrend(t);
        setTopProducts(p);
        setTopCustomer(c);
        setRecentTx(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trendData = useMemo(
    () => salesTrend.map(d => ({ ...d, value: Number(d.value) || 0, previous: Number(d.previous) || 0 })),
    [salesTrend]
  );

  const trendPercent = useMemo(() => {
    if (trendData.length < 2) return null;
    const current = trendData.reduce((s, d) => s + d.value, 0);
    const prev = trendData.reduce((s, d) => s + d.previous, 0);
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100 * 10) / 10;
  }, [trendData]);

  const maxSales = useMemo(
    () => topProducts.length > 0 ? Math.max(...topProducts.map(p => Number(p.sales) || 0)) : 1,
    [topProducts]
  );

  const donutData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: " espèces", value: stats.cashPercent || 25 },
      { name: "CB", value: stats.cardPercent || 35 },
      { name: "virement", value: stats.transferPercent || 20 },
      { name: "crédit", value: stats.creditPercent || 15 },
      { name: "autre", value: stats.otherPercent || 5 },
    ].filter(d => d.value > 0);
  }, [stats]);

  function statusBadge(status) {
    if (status === "completed") return "bg-emerald-500/10 text-emerald-400";
    if (status === "held") return "bg-amber-500/10 text-amber-400";
    return "bg-red-500/10 text-red-400";
  }

  function statusLabel(status) {
    if (status === "completed") return t('dashboard.status_completed');
    if (status === "held") return t('dashboard.status_held');
    return t('dashboard.status_cancelled');
  }

  function sparklineBars() {
    if (!trendData.length) return null;
    const vals = trendData.map(d => d.value);
    const mx = Math.max(...vals, 1);
    return (
      <div className="w-16 h-8 flex items-end gap-[2px]">
        {vals.map((v, i) => (
          <div key={i} className="w-full bg-emerald-400/70 dark:bg-emerald-500/70 rounded-t-sm transition-all" style={{ height: `${(v / mx) * 100}%` }} />
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: t('dashboard.daily_sales'),
      value: stats ? `${formatPrice(stats.todaySales)} DH` : "0 DH",
      badge: stats ? `${stats.todayTransactions} transaction${stats.todayTransactions > 1 ? 's' : ''}` : "—",
      badgeColor: trendPercent != null && trendPercent > 0 ? "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40" : "text-slate-600 bg-slate-100 dark:text-muted-foreground dark:bg-muted",
      icon: "payments",
      gradient: "from-white to-emerald-500/10 dark:from-card dark:to-emerald-900/60",
      sparkColor: "bg-emerald-400 dark:bg-emerald-500",
      iconBg: "text-emerald-300 dark:text-emerald-400",
    },
    {
      title: t('dashboard.client_debts'),
      value: stats ? `${formatPrice(stats.pendingDebts)} DH` : "0 DH",
      icon: "receipt_long",
      gradient: "from-white to-red-500/10 dark:from-card dark:to-red-900/60",
      sparkColor: "bg-red-400",
      iconBg: "text-red-300 dark:text-red-400",
    },
    {
      title: t('dashboard.stock_alerts'),
      value: stats ? `${stats.lowStockItems} alerte${stats.lowStockItems > 1 ? 's' : ''}` : "0",
      icon: "inventory",
      gradient: "from-white to-amber-500/10 dark:from-card dark:to-amber-900/60",
      sparkColor: "bg-amber-400",
      iconBg: "text-amber-300 dark:text-amber-400",
    },
    {
      title: t('dashboard.transactions'),
      value: stats ? `${stats.todayTransactions}` : "0",
      icon: "account_balance_wallet",
      gradient: "from-white to-blue-500/10 dark:from-card dark:to-blue-900/60",
      sparkColor: "bg-blue-400",
      iconBg: "text-blue-300 dark:text-blue-400",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Hero */}
      <section className="pt-1 pb-2">
        <h1 className="text-[28px] font-extrabold text-foreground leading-tight tracking-tight">
          {t('dashboard.greeting', { name: user?.name || 'Admin' })} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('dashboard.activity_overview')}
        </p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className={`h-[105px] p-4 bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between group bg-gradient-to-br ${card.gradient} transition-colors`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-muted-foreground tracking-[0.08em]">{card.title}</span>
              {card.badge && (
                <span className={`flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-[#0f172a] dark:text-foreground leading-none">{card.value}</span>
              {i === 0 ? sparklineBars() : (
                <span className={`material-symbols-outlined text-2xl ${card.iconBg}`}>{card.icon}</span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
        {/* Vercel-style Chart */}
        <Card className="lg:col-span-7 p-5 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">{t('dashboard.sales_analysis')}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.weekly_trends')}</p>
            </div>
            <div className="flex bg-muted p-0.5 rounded-lg">
              <button
                onClick={() => setChartInterval("week")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                  chartInterval === "week"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t('dashboard.week')}
              </button>
              <button
                onClick={() => setChartInterval("month")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                  chartInterval === "month"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t('dashboard.month')}
              </button>
            </div>
          </div>
          <div className="flex-1 -mx-1">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2.5} fill="url(#chartFill)" dot={false} activeDot={{ r: 5, fill: "#14b8a6", strokeWidth: 2, stroke: "#09090B" }} />
                {trendData.some(d => d.previous > 0) && (
                  <Line type="monotone" dataKey="previous" stroke="#52525b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} activeDot={{ r: 4, fill: "#52525b", strokeWidth: 2, stroke: "#09090B" }} />
                )}
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} tickMargin={8} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    fontSize: 12,
                    color: "#f4f4f5",
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4, color: "#f4f4f5" }}
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)}k DH`,
                    name === "value" ? t('dashboard.this_week') : t('dashboard.last_week')
                  ]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Top Products */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">{t('dashboard.top_products')}</h3>
            <div className="space-y-3">
              {topProducts.slice(0, 3).map((p, i) => {
                const pct = Math.round((Number(p.sales) / maxSales) * 100);
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <span className="text-[10px] text-muted-foreground font-medium">{pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {topProducts.length === 0 && (
                <p className="text-muted-foreground text-xs text-center py-3">{t('dashboard.no_product_data')}</p>
              )}
            </div>
          </Card>

          {/* Best Customer */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{t('dashboard.best_customer')}</span>
            </div>
            {topCustomer ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 flex items-center justify-center ring-1 ring-teal-500/20 shrink-0">
                  <span className="material-symbols-outlined text-lg text-teal-400">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{topCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.total_amount', { amount: formatPrice(topCustomer.total_spent) })}
                  </p>
                  <div className="flex gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{topCustomer.total_orders} achats</span>
                    <span>dette {formatPrice(topCustomer.debt_balance)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">{t('dashboard.no_customer_data')}</p>
            )}
          </Card>

          {/* Donut Chart */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Paiements</h3>
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={donutData.length > 0 ? donutData : [{ name: "vide", value: 100 }]}
                      cx={45}
                      cy={45}
                      innerRadius={32}
                      outerRadius={44}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-[10px] text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">{t('dashboard.recent_sales')}</h3>
          <button
            onClick={() => navigate('/sales')}
            className="text-teal-400 font-semibold text-xs hover:text-teal-300 transition-colors flex items-center gap-1"
          >
            {t('dashboard.view_all')}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.ref_header')}</th>
                <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.client_header')}</th>
                <th className="hidden sm:table-cell px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.date_header')}</th>
                <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.status_header')}</th>
                <th className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-end">{t('dashboard.amount_header')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTx.map(tx => (
                <tr key={tx.id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate(`/sales`)}>
                  <td className="px-5 py-3.5 text-xs font-semibold text-foreground">{tx.invoice}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-[10px] shrink-0">
                        {(tx.customer || 'W')[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-foreground">{tx.customer}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5 text-xs text-muted-foreground">{tx.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(tx.status)}`}>
                      {statusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-end font-bold text-xs text-foreground">{formatPrice(tx.total)} DH</td>
                </tr>
              ))}
              {recentTx.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    {t('dashboard.no_recent_transactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
