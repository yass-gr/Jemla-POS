import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

function KpiCard({ title, value, trend, trendUp, icon, color, barColor, barWidth, loading }) {
  return (
    <Card className="p-6 flex flex-col justify-between relative overflow-hidden group">
      <div className="z-10">
        <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-2">{title}</p>
        {loading ? (
          <div className="h-10 w-28 bg-surface-container-highest rounded animate-pulse mb-2" />
        ) : (
          <h3 className={`text-headline-lg font-headline-lg ${color}`}>{value}</h3>
        )}
        <div className={`flex items-center gap-1 mt-4 ${trendUp ? 'text-primary' : 'text-on-surface-variant'} font-bold`}>
          <span className="material-symbols-outlined text-sm">{trendUp ? 'trending_up' : 'warning'}</span>
          <span>{trend}</span>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <span className={`material-symbols-outlined text-[120px] ${color}`}>{icon}</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container absolute bottom-0 left-0">
        <div className={`h-full ${barColor} ${barWidth}`} />
      </div>
    </Card>
  );
}

export default function Dashboard() {
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
    ]).then(([s, t, p, r]) => {
      setStats(s);
      setSalesTrend(t);
      setTopProducts(p);
      setRecentTx(r);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    {
      title: "Today's Sales",
      value: stats ? `${stats.todaySales.toFixed(2)} DH` : '0 DH',
      trend: stats ? `${stats.todayTransactions} transactions today` : 'No data yet',
      trendUp: true,
      icon: 'payments',
      color: 'text-primary',
      barColor: 'bg-primary-container',
      barWidth: 'w-3/4',
    },
    {
      title: 'Pending Debts',
      value: stats ? `${stats.pendingDebts.toFixed(2)} DH` : '0 DH',
      trend: stats ? `${stats.overdueAccounts} accounts with debt` : 'No data yet',
      trendUp: false,
      icon: 'account_balance_wallet',
      color: 'text-error',
      barColor: 'bg-error',
      barWidth: stats ? `${Math.min(stats.overdueAccounts * 10, 100)}%` : 'w-1/2',
    },
    {
      title: 'Low Stock Alerts',
      value: stats ? `${stats.lowStockItems} Items` : '0 Items',
      trend: stats && stats.lowStockItems > 0 ? 'Restock required now' : 'All stocked up',
      trendUp: stats ? stats.lowStockItems === 0 : true,
      icon: 'inventory_2',
      color: stats && stats.lowStockItems > 0 ? 'text-tertiary' : 'text-primary',
      barColor: stats && stats.lowStockItems > 0 ? 'bg-tertiary' : 'bg-primary-container',
      barWidth: stats ? `${Math.min(stats.lowStockItems * 10, 100)}%` : 'w-2/3',
    },
  ];

  const maxTrend = Math.max(...salesTrend.map(d => d.value), 1);
  const CHART_TOP = 32;
  const CHART_BOT = 28;

  return (
    <div className="space-y-gutter pb-xl">
      <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} {...card} loading={loading} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-sm font-headline-sm">Sales Revenue Trend</h4>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="rounded-full">Weekly</Button>
              <Button variant="outline" size="sm" className="rounded-full">Monthly</Button>
            </div>
          </div>
          <div className="relative w-full" style={{ height: 300 }}>
            <div className="absolute inset-0 flex justify-between px-2" style={{ paddingTop: CHART_TOP }}>
              {salesTrend.map((d) => {
                const barH = Math.max((d.value / maxTrend) * (300 - CHART_TOP - CHART_BOT), 2);
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer justify-end" style={{ height: '100%' }}>
                    <div className="flex-1" />
                    <div className="w-[70%] bg-primary-container rounded-t-lg relative transition-all hover:opacity-80" style={{ height: barH }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        {d.value} DH
                      </div>
                    </div>
                    <span className="text-label-md text-on-surface-variant">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-sm font-headline-sm">Top Products</h4>
            <a href="/products" className="text-primary font-bold text-label-md hover:underline">View All</a>
          </div>
          <div className="flex-1 space-y-4">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-4 p-2 hover:bg-surface-container rounded-xl transition-all">
                <div className="w-12 h-12 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-md text-on-surface truncate">{p.name}</p>
                  <p className="text-label-md text-on-surface-variant">{p.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{Number(p.price).toFixed(2)} DH</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && !loading && (
              <p className="text-on-surface-variant text-body-md text-center py-8">No product data yet</p>
            )}
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h4 className="text-headline-sm font-headline-sm">Recent Transactions</h4>
          <Button variant="outline" size="sm">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </Button>
        </div>
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
                <TableCell className="font-bold text-primary">{tx.invoice}</TableCell>
                <TableCell className="text-body-md">{tx.customer}</TableCell>
                <TableCell className="text-on-surface-variant text-body-md">{tx.date}</TableCell>
                <TableCell className="text-body-md">{tx.items} Items</TableCell>
                <TableCell>
                  <Badge variant={
                    tx.status === 'completed' ? 'success' :
                    tx.status === 'held' ? 'secondary' : 'destructive'
                  }>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-body-md">{tx.total.toFixed(2)} DH</TableCell>
              </TableRow>
            ))}
            {recentTx.length === 0 && !loading && (
              <TableRow><TableCell colSpan="6" className="text-center py-8 text-on-surface-variant">No recent transactions</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
