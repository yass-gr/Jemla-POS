const sales = [
  { invoice: '#INV-8821', date: 'Oct 24, 2023', time: '14:20 PM', initials: 'JD', name: 'John Doe', items: '5 Items', total: '$124.50', status: 'Paid', statusColor: 'bg-primary/10 text-primary' },
  { invoice: '#INV-8822', date: 'Oct 24, 2023', time: '13:45 PM', initials: 'SM', name: 'Sarah Miller', items: '3 Items', total: '$42.20', status: 'Debt', statusColor: 'bg-error/10 text-error' },
  { invoice: '#INV-8823', date: 'Oct 24, 2023', time: '12:30 PM', initials: 'MK', name: 'Mike Knight', items: '2 Items', total: '$450.00', status: 'Paid', statusColor: 'bg-primary/10 text-primary' },
  { invoice: '#INV-8824', date: 'Oct 23, 2023', time: '17:10 PM', initials: 'ES', name: 'Elena Smith', items: '8 Items', total: '$89.95', status: 'Paid', statusColor: 'bg-primary/10 text-primary' },
  { invoice: '#INV-8825', date: 'Oct 23, 2023', time: '15:55 PM', initials: 'TR', name: 'Tom Riddle', items: '12 Items', total: '$1,250.00', status: 'Debt', statusColor: 'bg-error/10 text-error' },
];

export default function Sales() {
  return (
    <div className="space-y-6 pb-xl">
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Sales History</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Review and manage your store transactions.</p>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Total Revenue</p>
              <p className="text-headline-sm font-bold text-primary">$45,280.00</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Total Sales</p>
              <p className="text-headline-sm font-bold text-on-surface">1,248</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center gap-4">
            <div className="w-12 h-12 bg-error-container/10 rounded-xl flex items-center justify-center text-error">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Pending Debts</p>
              <p className="text-headline-sm font-bold text-error">$3,120.50</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full text-label-md font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            This Month
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full text-label-md font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Status: All
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">download</span>
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">print</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container-high overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant">
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Invoice#</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Date</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Customer</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Items Summary</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Total</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Status</th>
              <th className="px-8 py-5 text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {sales.map((s) => (
              <tr key={s.invoice} className="hover:bg-surface-container-low/50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="text-body-md font-bold text-primary">{s.invoice}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="text-body-md text-on-surface">{s.date}</div>
                  <div className="text-label-md text-on-surface-variant">{s.time}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center text-xs font-bold">
                      {s.initials}
                    </div>
                    <span className="text-body-md font-medium text-on-surface">{s.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-body-md text-on-surface-variant">{s.items}</div>
                </td>
                <td className="px-8 py-6 text-body-md font-bold text-on-surface">{s.total}</td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${s.statusColor}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-8 py-5 bg-surface-container/30 border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant font-medium">Showing 1 to 5 of 1,248 entries</p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary text-label-md font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-label-md font-medium transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-label-md font-medium transition-colors">3</button>
            <span className="text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-label-md font-medium transition-colors">25</button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
