import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Debts from './pages/Debts';
import POS from './pages/POS';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/pos" element={<AppLayout><POS /></AppLayout>} />
        <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
        <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
        <Route path="/sales" element={<AppLayout><Sales /></AppLayout>} />
        <Route path="/debts" element={<AppLayout><Debts /></AppLayout>} />
        <Route
          path="/suppliers"
          element={<AppLayout><div className="flex items-center justify-center h-full text-on-surface-variant text-headline-md">Suppliers — Coming next</div></AppLayout>}
        />
        <Route
          path="/purchases"
          element={<AppLayout><div className="flex items-center justify-center h-full text-on-surface-variant text-headline-md">Purchases — Coming next</div></AppLayout>}
        />
        <Route
          path="/returns"
          element={<AppLayout><div className="flex items-center justify-center h-full text-on-surface-variant text-headline-md">Returns — Coming next</div></AppLayout>}
        />
        <Route
          path="/inventory"
          element={<AppLayout><div className="flex items-center justify-center h-full text-on-surface-variant text-headline-md">Inventory — Coming next</div></AppLayout>}
        />
        <Route
          path="/reports"
          element={<AppLayout><div className="flex items-center justify-center h-full text-on-surface-variant text-headline-md">Reports — Coming next</div></AppLayout>}
        />
        <Route
          path="/settings"
          element={<AppLayout><div className="flex items-center justify-center h-full text-on-surface-variant text-headline-md">Settings — Coming next</div></AppLayout>}
        />
      </Routes>
    </BrowserRouter>
  );
}
