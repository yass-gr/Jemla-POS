const debts = [
  { initials: 'MS', name: 'Main Street Grocers', id: '#CUST-9021', amount: 24560.00, lastActivity: 'May 12, 2024' },
  { initials: 'RL', name: 'Riverside Logistics', id: '#CUST-7742', amount: 18200.50, lastActivity: 'May 24, 2024' },
  { initials: 'OC', name: 'Organic Corner', id: '#CUST-4410', amount: 12440.00, lastActivity: 'May 20, 2024' },
  { initials: 'BP', name: 'Blue Plate Bistro', id: '#CUST-1198', amount: 7890.25, lastActivity: 'June 01, 2024' },
  { initials: 'SV', name: 'Sunny Valley Mart', id: '#CUST-5523', amount: 5200.00, lastActivity: 'May 15, 2024' },
];

export default function Debts() {
  return (
    <div className="space-y-6 pb-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Debts Management</h2>
          <p className="text-body-md text-on-surface-variant">Track outstanding balances across customer accounts.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-high transition-colors font-semibold text-label-md">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-high transition-colors font-semibold text-label-md">
            <span className="material-symbols-outlined text-sm">file_download</span> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Total Debts</span>
            <div className="p-2 bg-error-container text-on-error-container rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">$142,580.00</p>
            <p className="text-label-md text-error flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              12% from last month
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Active Creditors</span>
            <div className="p-2 bg-secondary-container text-on-secondary-fixed-variant rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">158</p>
            <p className="text-label-md text-on-surface-variant mt-1">42 high-priority accounts</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-label-md">Avg. Debt per Creditor</span>
            <div className="p-2 bg-primary-container text-on-primary rounded-lg">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div>
            <p className="text-headline-lg font-extrabold text-on-surface">$902.41</p>
            <p className="text-label-md text-on-surface-variant mt-1">Across 158 accounts</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Outstanding Balances</h3>
          <span className="px-3 py-1 bg-surface-container-high rounded-full text-label-md text-on-surface-variant">Sorted by: Highest Debt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Debt Amount</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Last Activity</th>
                <th className="px-8 py-5 text-label-md font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {debts.map((d) => (
                <tr key={d.name} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary">
                        {d.initials}
                      </div>
                      <div>
                        <p className="text-body-lg font-bold text-on-surface">{d.name}</p>
                        <p className="text-label-md text-on-surface-variant">ID: {d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className={`text-body-lg font-extrabold ${d.amount > 10000 ? 'text-error' : 'text-on-surface'}`}>
                      ${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-body-md text-on-surface">{d.lastActivity}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-primary-container text-on-primary px-5 py-2 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95">
                      Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">Showing 5 of 158 customers</p>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="p-2 bg-primary text-on-primary rounded-lg font-bold text-label-md min-w-[32px]">1</button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high font-bold text-label-md min-w-[32px]">2</button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high font-bold text-label-md min-w-[32px]">3</button>
            <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
