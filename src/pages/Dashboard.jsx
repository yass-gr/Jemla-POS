import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
  LineChart, Line, XAxis, ResponsiveContainer, Tooltip,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomer, setTopCustomer] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

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

  function formatPrice(v) {
    return Number(v || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function statusBadge(status) {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "held") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  }

  function statusLabel(status) {
    if (status === "completed") return "Complété";
    if (status === "held") return "En attente";
    return "Annulé";
  }

  const kpiCards = [
    {
      title: "VENTES DU JOUR",
      value: stats ? `${formatPrice(stats.todaySales)} DH` : "0 DH",
      badge: stats ? `${stats.todayTransactions} transaction${stats.todayTransactions > 1 ? 's' : ''}` : "—",
      badgeColor: trendPercent != null && trendPercent > 0 ? "text-emerald-600 bg-emerald-100" : "text-slate-600 bg-slate-100",
      icon: "payments",
      gradient: "from-white to-[#F0FDF4]",
      hoverBorder: "hover:border-emerald-200",
      sparkColor: "bg-emerald-400",
      iconBg: "text-emerald-300",
    },
    {
      title: "CRÉANCES CLIENTS",
      value: stats ? `${formatPrice(stats.pendingDebts)} DH` : "0 DH",
      badge: stats ? `${stats.overdueAccounts} compte${stats.overdueAccounts > 1 ? 's' : ''}` : "—",
      badgeColor: stats?.overdueAccounts > 0 ? "text-red-600 bg-red-100" : "text-slate-600 bg-slate-100",
      icon: "receipt_long",
      gradient: "from-white to-[#FEF2F2]",
      hoverBorder: "hover:border-red-200",
      sparkColor: "bg-red-400",
      iconBg: "text-red-300",
    },
    {
      title: "ALERTES STOCK",
      value: stats ? `${stats.lowStockItems} alerte${stats.lowStockItems > 1 ? 's' : ''}` : "0",
      badge: stats?.lowStockItems > 0 ? "À réapprovisionner" : "Stock ok",
      badgeColor: stats?.lowStockItems > 0 ? "text-amber-600 bg-amber-100" : "text-slate-600 bg-slate-100",
      icon: "inventory",
      gradient: "from-white to-[#FFFBEB]",
      hoverBorder: "hover:border-amber-200",
      sparkColor: "bg-amber-400",
      iconBg: "text-amber-300",
    },
    {
      title: "TRANSACTIONS",
      value: stats ? `${stats.todayTransactions}` : "0",
      badge: trendPercent != null ? `${trendPercent > 0 ? '+' : ''}${trendPercent}%` : "—",
      badgeColor: trendPercent != null && trendPercent >= 0 ? "text-blue-600 bg-blue-100" : "text-slate-600 bg-slate-100",
      icon: "account_balance_wallet",
      gradient: "from-white to-[#EFF6FF]",
      hoverBorder: "hover:border-blue-200",
      sparkColor: "bg-blue-400",
      iconBg: "text-blue-300",
    },
  ];

  const maxSales = useMemo(
    () => topProducts.length > 0 ? Math.max(...topProducts.map(p => Number(p.sales) || 0)) : 1,
    [topProducts]
  );

  function sparklineBars() {
    if (!trendData.length) return null;
    const vals = trendData.map(d => d.value);
    const mx = Math.max(...vals, 1);
    return (
      <div className="w-12 h-6 flex items-end gap-[1.5px]">
        {vals.map((v, i) => (
          <div key={i} className="w-full bg-emerald-400 rounded-t-sm" style={{ height: `${(v / mx) * 100}%` }} />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Hero */}
      <section className="py-2">
        <h1 className="text-[26px] font-extrabold text-[#0f172a] leading-tight">
          Bonjour, {user?.name || 'Admin'} 👋
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Votre activité du jour en un coup d'œil
        </p>
      </section>

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className={`h-[105px] p-4 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-[#F1F5F9] flex flex-col justify-between group bg-gradient-to-br ${card.gradient} ${card.hoverBorder} transition-colors`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-[#64748B] tracking-[0.08em]">{card.title}</span>
              <span className={`flex items-center font-bold text-[10px] px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-[#0f172a] leading-none">{card.value}</span>
              {i === 0 ? sparklineBars() : (
                <span className={`material-symbols-outlined text-2xl ${card.iconBg}`}>{card.icon}</span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Chart */}
        <div className="lg:col-span-7 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-[#F1F5F9] p-5 min-h-[260px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h2 className="font-headline-sm text-[15px] text-[#0f172a] font-bold">Analyse des Ventes</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Tendances hebdomadaires de performance</p>
            </div>
            <div className="flex bg-[#f1f5f9] p-0.5 rounded-lg">
              <button className="px-3 py-1.5 bg-white rounded-md shadow-sm text-[#0F766E] font-bold text-[11px]">Semaine</button>
              <button className="px-3 py-1.5 text-[#64748B] font-medium text-[11px] hover:text-[#0F766E] transition-colors">Mois</button>
            </div>
          </div>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 2 }}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F766E" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#0F766E", strokeWidth: 3, stroke: "#fff" }}
                />
                {trendData.some(d => d.previous > 0) && (
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    activeDot={{ r: 4, fill: "#94a3b8", strokeWidth: 2, stroke: "#fff" }}
                  />
                )}
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)}k DH`,
                    name === "value" ? "Cette semaine" : "Semaine dernière"
                  ]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Top Products */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-[#F1F5F9] p-3.5">
            <h3 className="text-xs font-bold text-[#0f172a] mb-2.5">Top Produits</h3>
            <div className="space-y-2.5">
              {topProducts.slice(0, 2).map((p, i) => {
                const pct = Math.round((Number(p.sales) / maxSales) * 100);
                return (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#0F766E]/10 rounded-lg flex items-center justify-center text-[#0F766E] font-bold text-[11px] shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#0f172a] truncate">{p.name}</p>
                      <div className="w-full h-[3px] bg-[#f1f5f9] rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-[#0F766E] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-semibold shrink-0">{pct}%</span>
                  </div>
                );
              })}
              {topProducts.length === 0 && (
                <p className="text-[#64748B] text-[11px] text-center py-2">Aucune donnée produit</p>
              )}
            </div>
          </div>

          {/* Best Client */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-[#F1F5F9] p-3.5 flex flex-col items-center text-center">
            <span className="text-[9px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-2 py-0.5 rounded-full mb-2 tracking-wider">MEILLEUR CLIENT</span>
            <div className="w-10 h-10 rounded-full bg-[#0F766E]/10 flex items-center justify-center mb-1.5 ring-2 ring-[#0F766E]/5">
              <span className="material-symbols-outlined text-lg text-[#0F766E]">person</span>
            </div>
            {topCustomer ? (
              <>
                <p className="text-xs font-bold text-[#0f172a]">{topCustomer.name}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Total: {formatPrice(topCustomer.total_spent)} DH
                </p>
                <div className="flex gap-2 mt-1 text-[10px] text-[#64748B]">
                  <span>{topCustomer.total_orders} achats</span>
                  <span>Dette: {formatPrice(topCustomer.debt_balance)} DH</span>
                </div>
              </>
            ) : (
              <p className="text-[#64748B] text-[11px] mt-1">Aucune donnée client</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0F766E] text-white rounded-[20px] shadow-[0_8px_32px_rgba(15,118,110,0.2)] p-3.5">
            <h3 className="text-xs font-bold mb-2.5">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/pos')}
                className="flex flex-col items-center gap-1 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                <span className="text-[10px] font-semibold">Nouvelle Vente</span>
              </button>
              <button
                onClick={() => navigate('/customers')}
                className="flex flex-col items-center gap-1 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                <span className="text-[10px] font-semibold">Nouveau Client</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-[#F1F5F9] overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#0f172a]">Dernières Ventes</h3>
          <button
            onClick={() => navigate('/sales')}
            className="text-[#0F766E] font-semibold text-xs hover:underline flex items-center gap-1"
          >
            Voir tout <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]/50">
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] tracking-wider">RÉFÉRENCE</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] tracking-wider">CLIENT</th>
                <th className="hidden sm:table-cell px-4 py-3 text-[10px] font-bold text-[#64748B] tracking-wider">DATE</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] tracking-wider">STATUT</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] tracking-wider text-right">MONTANT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {recentTx.map(tx => (
                <tr key={tx.id} className="group hover:bg-[#f8fafc] transition-colors cursor-pointer" onClick={() => navigate(`/sales`)}>
                  <td className="px-4 py-3 text-xs font-semibold text-[#0f172a]">{tx.invoice}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] font-bold text-[10px] shrink-0">
                        {(tx.customer || 'W')[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-[#0f172a]">{tx.customer}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-xs text-[#64748B]">{tx.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(tx.status)}`}>
                      {statusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-xs text-[#0f172a]">{formatPrice(tx.total)} DH</td>
                </tr>
              ))}
              {recentTx.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[#64748B] text-xs">
                    Aucune transaction récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
