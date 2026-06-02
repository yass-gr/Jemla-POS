import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function KpiCard({
  title,
  value,
  trend,
  trendUp,
  icon,
  color,
  loading,
}) {
  return (
    <Card className="p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
      <div className="z-10">
        <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-2">
          {title}
        </p>
        {loading ? (
          <div className="h-10 w-28 bg-surface-container-highest rounded animate-pulse mb-2" />
        ) : (
          <h3
            className={`text-headline-md sm:text-headline-lg font-headline-lg ${color}`}
          >
            {value}
          </h3>
        )}
        <div
          className={`flex items-center gap-1 mt-4 ${trendUp ? "text-primary" : "text-on-surface-variant"} font-bold`}
        >
          <span className="material-symbols-outlined text-sm">
            {trendUp ? "trending_up" : "warning"}
          </span>
          <span className="text-label-sm sm:text-label-md">{trend}</span>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <span
          className={`material-symbols-outlined text-[80px] sm:text-[120px] ${color}`}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.stats(),
      api.dashboard.salesTrend(),
      api.dashboard.topProducts(),
      api.dashboard.recentTransactions(),
    ])
      .then(([s, t, p, r]) => {
        setStats(s);
        setSalesTrend(t);
        setTopProducts(p);
        setRecentTx(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    {
      title: "Today's Sales",
      value: stats ? `${stats.todaySales.toFixed(2)} DH` : "0 DH",
      trend: stats
        ? `${stats.todayTransactions} transactions today`
        : "No data yet",
      trendUp: true,
      icon: "payments",
      color: "text-primary",
    },
    {
      title: "Pending Debts",
      value: stats ? `${stats.pendingDebts.toFixed(2)} DH` : "0 DH",
      trend: stats
        ? `${stats.overdueAccounts} accounts with debt`
        : "No data yet",
      trendUp: false,
      icon: "account_balance_wallet",
      color: "text-error",
    },
    {
      title: "Low Stock Alerts",
      value: stats ? `${stats.lowStockItems} Items` : "0 Items",
      trend:
        stats && stats.lowStockItems > 0
          ? "Restock required now"
          : "All stocked up",
      trendUp: stats ? stats.lowStockItems === 0 : true,
      icon: "inventory_2",
      color:
        stats && stats.lowStockItems > 0 ? "text-tertiary" : "text-primary",
    },
  ];

  const trendData = salesTrend.map(d => ({ ...d, value: Number(d.value) || 0 }));

  return (
    <div className="space-y-4 sm:space-y-gutter pb-xl">
      <h2 className="font-headline-lg text-headline-lg text-on-surface">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-gutter">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-gutter">
        <button onClick={() => navigate('/pos')} className="group relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">point_of_sale</span>
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Nouvelle Vente</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Ouvrir le POS</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigate('/products')} className="group relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">add_box</span>
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Ajouter Produit</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Nouveau stock</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigate('/purchases')} className="group relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Enregistrer Achat</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Approvisionnement</p>
            </div>
          </div>
        </button>
        <button onClick={() => navigate('/reports')} className="group relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md hover:border-tertiary/30 transition-all text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">bar_chart</span>
            </div>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Rapports</p>
              <p className="text-label-md text-on-surface-variant mt-0.5">Analytiques</p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-gutter">
        <Card className="lg:col-span-2 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h4 className="text-headline-sm font-headline-sm">
              Sales Revenue Trend
            </h4>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full text-xs sm:text-sm"
              >
                Weekly
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs sm:text-sm"
              >
                Monthly
              </Button>
            </div>
          </div>
          <div
            className="relative w-full"
            style={{ height: "clamp(180px, 40vw, 300px)" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.556 0 0)" axisLine={true} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.205 0 0)",
                    border: "none",
                    borderRadius: 8,
                    color: "oklch(0.985 0 0)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                  formatter={(value) => value === "value" ? "Cette semaine" : "Semaine dernière"}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.546 0.245 262.88)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.546 0.245 262.88)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="oklch(0.715 0.143 215.22)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ fill: "oklch(0.715 0.143 215.22)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-sm font-headline-sm">Top Products</h4>
            <a
              href="/products"
              className="text-primary font-bold text-label-md hover:underline"
            >
              View All
            </a>
          </div>
          <div className="flex-1 space-y-3">
            {topProducts.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 p-1.5 hover:bg-surface-container rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {p.sales} sales
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-xs text-primary">
                    {Number(p.price).toFixed(2)} DH
                  </p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && !loading && (
              <p className="text-on-surface-variant text-body-md text-center py-8">
                No product data yet
              </p>
            )}
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h4 className="text-headline-sm font-headline-sm">
            Recent Transactions
          </h4>
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>{" "}
            Filter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTx.map((tx) => (
                <TableRow key={tx.id} className="cursor-pointer">
                  <TableCell className="font-bold text-primary whitespace-nowrap">
                    {tx.invoice}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {tx.customer}
                  </TableCell>
                  <TableCell className="text-on-surface-variant whitespace-nowrap">
                    {tx.date}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {tx.items} Items
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.status === "completed"
                          ? "success"
                          : tx.status === "held"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold whitespace-nowrap">
                    {tx.total.toFixed(2)} DH
                  </TableCell>
                </TableRow>
              ))}
              {recentTx.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan="6"
                    className="text-center py-8 text-on-surface-variant"
                  >
                    No recent transactions
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
