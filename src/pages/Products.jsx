const products = [
  {
    id: 1,
    name: 'Fresh Strawberry',
    sku: 'FR-001-STR',
    category: 'Fruits',
    unit: 'kg',
    price: '$20.10',
    stock: 84,
    stockPercent: 80,
    lowStock: false,
    img: 'https://lh3.googleusercontent.com/aida/AP1WRLtx9tD1pmCAHNXPK2ffdI73Ad1lkPl_Jdd9EGjI93AGxdkN06hCb4JuJonxLHYGf1wqGk5wUYuAlUc_10lt6vgFoL_vVUQlgbftbjbE9onqmWT_PptbcGlB57ZjPjNRCCy8dzB1DAz-i2idMxW-Ujh5odgLES6cal4T7pPdFjQS8qNapCgSYdZnhyYDHGeMvt2d9PzuiKr_rnFu72hHOiAsGNN-o91n7lywkeICbWdNd7zXlqKjdWw4Tx4',
  },
  {
    id: 2,
    name: 'Organic Cabbage',
    sku: 'VG-042-CAB',
    category: 'Vegetable',
    unit: 'piece',
    price: '$15.10',
    stock: 5,
    stockPercent: 15,
    lowStock: true,
    img: 'https://lh3.googleusercontent.com/aida/AP1WRLtYwjD7EtyFX0AMiBeGGp78EP8i3x6TVOPbaRGsC536maNSSsusJ-mJfPRRHKAhhGb4Cdpl-BjSI3rt8RnLykWMjM_3yLc8EL13sDPO6YrbkxD1_UgBXRp_dfcxunuaYxF-mkDGNwS2SbF0KOQmweSzIbY_ybLZYpvgfkt3C8ZUcbbZQ5gXmDR1qCT5fs_XFI-moh8l9X0KmDIO710Ro9R71pD3JZkM0KPPhXzPoRvBJvg6EdwbzR54f9Y',
  },
  {
    id: 3,
    name: 'Fresh Brocoly',
    sku: 'VG-012-BRO',
    category: 'Vegetable',
    unit: 'kg',
    price: '$25.10',
    stock: 45,
    stockPercent: 45,
    lowStock: false,
    img: 'https://lh3.googleusercontent.com/aida/AP1WRLv5nQPTCCn1u57kxD1YecYP_i2_9uOWtdBi0VnhCFYYqu1rfeYL0ODN5p9EXpRtWcBnBlm8V0vFgQgC2nr1D7_UDRRZEsxPX_0eZvHy8f0Vl1RfGuFdvYmymflBllV7stJ8GQ-oPQtws8i4Pl1UaEYZgpst7m5R7GY9bu3cj1Gvq6LU4dbEPD4Rs3BYs-PMCjBu3rHMyQdwmQt-pUYsczprUI3QBgRrPZeLUmKip9dDGUA24klMqSW98YE',
  },
  {
    id: 4,
    name: 'Navel Orange',
    sku: 'FR-009-ORA',
    category: 'Fruits',
    unit: 'dozen',
    price: '$12.10',
    stock: 120,
    stockPercent: 95,
    lowStock: false,
    img: 'https://lh3.googleusercontent.com/aida/AP1WRLtZrKkZeI4SZ3MM0pCBCxCu8N14XWOmngcbl-AwaHXHGjzfh_KzbrfJX59zr3b9uG_BmdrSWi36laJCtgffj_SEyA28lfvkUchrejK26hmwALI2lYeT5PcxmERaOGG_s9tFaPadmiZ-eHHdUPUWNJi3JXa9HJZASSp77RkNW4cSUKZHDBuSMg8Rt7CgjBIA9QPtNXQeJMChJx-ayZr4f1NmNX1_9AtoQWOtM5r2sRPms9MzAIEIpH4vNQ',
  },
];

export default function Products() {
  return (
    <div className="space-y-gutter pb-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Products Management</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Manage your inventory catalog, stock levels, and pricing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface border border-outline-variant text-on-surface px-4 py-2.5 rounded-xl font-label-md text-label-md flex items-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined mr-2 text-sm">file_download</span>
            Export CSV
          </button>
          <button className="bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-bold flex items-center hover:shadow-lg transition-all active:scale-95 shadow-md">
            <span className="material-symbols-outlined mr-2">add_circle</span>
            + Add New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center gap-6">
          <div className="flex items-center bg-surface-container p-1 rounded-xl">
            <button className="px-4 py-1.5 rounded-lg text-label-md bg-white shadow-sm text-primary font-bold">All Items</button>
            <button className="px-4 py-1.5 rounded-lg text-label-md text-on-secondary-container hover:bg-white/50">Fruits</button>
            <button className="px-4 py-1.5 rounded-lg text-label-md text-on-secondary-container hover:bg-white/50">Vegetables</button>
          </div>
          <div className="h-8 w-px bg-outline-variant" />
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error" />
            <span className="ml-3 font-label-md text-label-md text-on-surface-variant">Low Stock Only</span>
          </label>
        </div>
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Total Products</p>
            <p className="text-headline-md font-headline-md text-primary">1,284</p>
          </div>
          <div className="bg-error/5 border border-error/20 p-6 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-error">Low Stock Items</p>
            <p className="text-headline-md font-headline-md text-error">12</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant/30">
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Product Info</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Unit</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Selling Price</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Stock Status</th>
              <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {products.map((p) => (
              <tr key={p.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-surface-variant overflow-hidden flex-shrink-0 border border-outline-variant/20">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface">{p.name}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant">SKU: {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full font-label-md text-label-md ${
                    p.category === 'Fruits' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.category}
                  </span>
                </td>
                <td className="px-8 py-5 text-center text-body-md text-on-surface-variant">{p.unit}</td>
                <td className="px-8 py-5 text-right font-headline-sm text-headline-sm text-primary">{p.price}</td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="w-40 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.lowStock ? 'bg-error' : 'bg-primary-container'}`} style={{ width: `${p.stockPercent}%` }} />
                    </div>
                    <p className={`font-label-md text-label-md ${p.lowStock ? 'text-error font-bold' : 'text-on-surface'}`}>
                      {p.stock} Units{p.lowStock ? ' (Low Stock)' : ' in Stock'}
                    </p>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-high rounded-lg text-primary">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="p-2 hover:bg-surface-container-high rounded-lg text-error">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-8 py-5 bg-surface-container/30 border-t border-outline-variant/30 flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">Showing 1 to 4 of 1,284 results</p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary text-label-md font-bold">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container text-label-md">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container text-label-md">3</button>
            <span className="px-1 text-on-surface-variant">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container text-label-md">128</button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
