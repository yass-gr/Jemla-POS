const kpiCards = [
  {
    title: "Today's Sales",
    value: '$14,284.50',
    trend: '+12.5% from yesterday',
    trendUp: true,
    icon: 'payments',
    color: 'text-primary',
    bg: 'bg-primary/10',
    barColor: 'bg-primary-container',
    barWidth: 'w-3/4',
  },
  {
    title: 'Pending Debts',
    value: '$3,120.00',
    trend: '8 overdue accounts',
    trendUp: false,
    icon: 'account_balance_wallet',
    color: 'text-error',
    bg: 'bg-error/10',
    barColor: 'bg-error',
    barWidth: 'w-1/2',
  },
  {
    title: 'Low Stock Alerts',
    value: '24 Items',
    trend: 'Restock required now',
    trendUp: true,
    icon: 'inventory_2',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    barColor: 'bg-tertiary',
    barWidth: 'w-2/3',
  },
];

const weeklyData = [
  { day: 'Mon', value: 2.1, height: 'h-2/3' },
  { day: 'Tue', value: 1.8, height: 'h-1/2' },
  { day: 'Wed', value: 2.9, height: 'h-3/4' },
  { day: 'Thu', value: 2.2, height: 'h-2/3' },
  { day: 'Fri', value: 3.5, height: 'h-5/6' },
  { day: 'Sat', value: 4.2, height: 'h-full' },
  { day: 'Sun', value: 3.2, height: 'h-4/5' },
];

const topProducts = [
  { name: 'Organic Strawberries', sales: '248 sales this week', price: '$4.99', img: 'https://lh3.googleusercontent.com/aida/AP1WRLseZgyJpgznCewyjbnXijuhbAX0tNFNBepPrrQjCuypXP4hWRID95E8zaYAeAf4sQ7jWqdugPn2EUrp2KvNiUiZsJoi9qu692rzO0V1D2wGqpwNIfpgJITtPEIxvBmpkH15Urmb6hnRHFoDPS6W0vaMmK-Ef9EMIye83RrQGqkqzImgS3Xw2N5CBfyBnTO83Jc3j6v26FcWces92WU5pLRMTMaDBkwClrCKD93vO6Yt9m7tCt1Bjfj2Yg' },
  { name: 'Fresh Broccoli', sales: '182 sales this week', price: '$2.50', img: 'https://lh3.googleusercontent.com/aida/AP1WRLts168qtwNCnoDlFjIlTauSyRMpF-9NZnpB__ro9vBGCyFWMPJM9K0jk8hr9xoVWPKqb2prt1ylti04b1CRMfiI6usvv8Jf0cggUN9F91HhUdue3Vm-peRTFaviXJrSquTYIPb3qc4Cbw6x9YxjZwGNUFHscF3LLZkjTkleKW0vVnbyQ2euS5zZnqGbtU_4PpCTna4t1QhIzmJiSb57YRmIY-C2_o_qdPrHTD4XaOE6jq0-6wYf16mXcQ' },
  { name: 'Fuji Apples', sales: '156 sales this week', price: '$1.20', img: 'https://lh3.googleusercontent.com/aida/AP1WRLsLFcRc3FN68kmqU5RyQR1SMgwM9Zj9sDtAvLhV9U7gGlsM5OmlzwtMjpXXam2-dmcZVhtoe3GmwtNGIMD-B_Y72BD0whGmX2dyzp4TaQM1utA9t6u7WOLEEZrufKzSdiSTyMVlj-YjLdO7id49VM_uXLpxabSX2Ds10DDl0z97ICLCmU6vjQz85IVe1b_Y_54DR7zvKw58RV_qlCjQNF0eXiPRqmY5JYTSPietkZS_A3NdLkW0qSxL7tI' },
  { name: 'Whole Milk 1L', sales: '142 sales this week', price: '$3.15', img: 'https://lh3.googleusercontent.com/aida/AP1WRLsuQFA4_auAUjaJERtYwwvEGGYduKHqylHrKnIg6Pq6Wqkq-o5UQJeYc2movCsSN2KqCpEejjW62w7lHigyKNB59GgEihglGr0BVlbO8wUIoEilbydy8VLI4YONexBLk8YMjlSX_ex8CqqTUZcWLV7Yo981ayG-gBVM__qb2-3AEgrXfYd0PNh9T1G3SvJvcNk-ATbZj2Aa5KA1FmVYUS8wAfCMDjoqE3MEcZOI9UTAzRy6U2icw_I3Zw' },
];

const recentTransactions = [
  { id: '#POS-82741', customer: 'James Wilson', date: 'Today, 10:45 AM', items: '4 Items', status: 'Completed', total: '$124.50' },
  { id: '#POS-82740', customer: 'Sarah Connor', date: 'Today, 10:32 AM', items: '2 Items', status: 'Pending', total: '$42.00' },
  { id: '#POS-82739', customer: 'Michael Brown', date: 'Today, 09:55 AM', items: '7 Items', status: 'Canceled', total: '$215.10' },
  { id: '#POS-82738', customer: 'Emily Davis', date: 'Yesterday, 06:20 PM', items: '12 Items', status: 'Completed', total: '$450.80' },
];

function KpiCard({ title, value, trend, trendUp, icon, color, bg, barColor, barWidth }) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
      <div className="z-10">
        <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-2">{title}</p>
        <h3 className={`text-headline-lg font-headline-lg ${color}`}>{value}</h3>
        <div className={`flex items-center gap-1 mt-4 ${trendUp ? 'text-primary' : 'text-on-surface-variant'} font-bold`}>
          <span className="material-symbols-outlined text-sm">{trendUp ? 'trending_up' : 'warning'}</span>
          <span>{trend}</span>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <span className={`material-symbols-outlined text-[120px] ${color}`}>{icon}</span>
      </div>
      <div className={`h-1.5 w-full bg-surface-container absolute bottom-0 left-0`}>
        <div className={`h-full ${barColor} ${barWidth}`} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-gutter pb-xl">
      <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[24px] shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-sm font-headline-sm">Sales Revenue Trend</h4>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full text-label-md bg-primary-container text-on-primary font-bold">Weekly</button>
              <button className="px-4 py-1.5 rounded-full text-label-md border border-outline-variant hover:bg-surface-container">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] relative w-full">
            <div className="absolute inset-0 flex items-end justify-between px-2 pt-8">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-full mx-1 h-full flex items-end">
                    <div className={`w-full bg-primary-container/20 rounded-t-lg relative hover:bg-primary-container/40 transition-all ${d.height}`}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        {d.day}: ${d.value}k
                      </div>
                      <div className={`absolute bottom-0 w-full bg-primary-container rounded-t-lg ${d.height}`} style={{ height: '60%' }} />
                    </div>
                  </div>
                  <span className="text-label-md text-on-surface-variant">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-sm font-headline-sm">Top Products</h4>
            <a href="/products" className="text-primary font-bold text-label-md hover:underline">View All</a>
          </div>
          <div className="flex-1 space-y-4">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-4 p-2 hover:bg-surface-container rounded-xl transition-all">
                <div className="w-12 h-12 bg-surface-container rounded-xl overflow-hidden flex-shrink-0">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-md text-on-surface truncate">{p.name}</p>
                  <p className="text-label-md text-on-surface-variant">{p.sales}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
          <h4 className="text-headline-sm font-headline-sm">Recent Transactions</h4>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors font-bold text-label-md">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/50">
              <tr>
                <th className="px-8 py-5 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Order ID</th>
                <th className="px-8 py-5 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="px-8 py-5 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="px-8 py-5 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Items</th>
                <th className="px-8 py-5 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container/30 transition-colors cursor-pointer">
                  <td className="px-8 py-5 font-bold text-primary">{tx.id}</td>
                  <td className="px-8 py-5 text-body-md">{tx.customer}</td>
                  <td className="px-8 py-5 text-on-surface-variant text-body-md">{tx.date}</td>
                  <td className="px-8 py-5 text-body-md">{tx.items}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-label-md font-bold inline-block ${
                      tx.status === 'Completed' ? 'bg-primary/10 text-primary' :
                      tx.status === 'Pending' ? 'bg-secondary/10 text-secondary' :
                      'bg-error/10 text-error'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-body-md">{tx.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
