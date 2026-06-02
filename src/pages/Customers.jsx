const customers = [
  { initials: 'JD', name: 'Jane Doe', phone: '+1 (555) 012-3456', email: 'jane.doe@email.com', address: '123 Emerald Garden, West District, City 4002', debt: 450.25, lastPurchase: '2 hours ago', invoice: '#INV-88219' },
  { initials: 'MS', name: 'Marcus Smith', phone: '+1 (555) 998-2121', email: 'm.smith@provider.net', address: '45 Pine Street, Apt 3B, North Valley', debt: 0, lastPurchase: 'Yesterday, 4:15 PM', invoice: '#INV-88102' },
  { initials: 'AL', name: 'Alicia Lee', phone: '+1 (555) 443-1002', email: 'lee.ali@domain.com', address: '888 Skyline Blvd, Floor 12, Tech Park', debt: 1200.50, lastPurchase: 'Oct 24, 2023', invoice: '#INV-87995' },
  { initials: 'RT', name: 'Robert Taylor', phone: '+1 (555) 776-0909', email: 'rob.t@email.com', address: '12 Harbour Row, Marina Bay, South', debt: 12.00, lastPurchase: 'Oct 22, 2023', invoice: '#INV-87950' },
];

export default function Customers() {
  return (
    <div className="space-y-gutter pb-xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-primary font-bold text-label-md">+12% ↑</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md">Total Customers</p>
            <h3 className="text-headline-md font-headline-md">1,284</h3>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="text-error font-bold text-label-md">+5% ↓</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-md">Total Outstanding Debt</p>
            <h3 className="text-headline-md font-headline-md text-error">$14,250.00</h3>
          </div>
        </div>
        <div className="bg-primary p-6 rounded-[24px] shadow-xl shadow-primary/20 flex flex-col justify-center items-center text-on-primary group cursor-pointer hover:scale-[1.02] transition-all">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h4 className="font-bold text-headline-sm">New Customer</h4>
          <p className="text-on-primary/70 text-label-md">Add to database</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[32px] shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/20">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Customer Directory</h3>
            <p className="text-body-md text-on-surface-variant">Managing all registered accounts and credit histories</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-full text-label-md hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-full text-label-md hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">file_download</span> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50">
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer Name</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Contact Details</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Address</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Debt Balance</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Purchase</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {customers.map((c) => (
                <tr key={c.name} className="hover:bg-surface-container-lowest group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                        {c.initials}
                      </div>
                      <div>
                        <p className="font-bold text-body-lg text-on-surface leading-none">{c.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-body-md text-on-surface">{c.phone}</p>
                    <p className="text-label-md text-on-surface-variant">{c.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-body-md text-on-surface-variant max-w-[200px] truncate">{c.address}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-2 bg-error/10 rounded-full font-bold text-body-md ${
                      c.debt > 0 ? 'text-error' : 'text-primary'
                    }`}>
                      ${c.debt.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-body-md text-on-surface">{c.lastPurchase}</p>
                    <p className="text-label-md text-on-surface-variant">{c.invoice}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-surface-container/30 border-t border-outline-variant/20 flex justify-between items-center">
          <p className="text-label-md text-on-surface-variant">Showing 4 of 1,284 customers</p>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container disabled:opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold text-label-md">1</button>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface font-medium text-label-md">2</button>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface font-medium text-label-md">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
