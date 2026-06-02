import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Debts from './pages/Debts';
import POS from './pages/POS';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Returns from './pages/Returns';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><AppLayout><POS /></AppLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AppLayout><Products /></AppLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><AppLayout><Customers /></AppLayout></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><AppLayout><Sales /></AppLayout></ProtectedRoute>} />
      <Route path="/debts" element={<ProtectedRoute><AppLayout><Debts /></AppLayout></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><AppLayout><Suppliers /></AppLayout></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><AppLayout><Purchases /></AppLayout></ProtectedRoute>} />
      <Route path="/returns" element={<ProtectedRoute><AppLayout><Returns /></AppLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AppLayout><Inventory /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-body-md">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Router />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
