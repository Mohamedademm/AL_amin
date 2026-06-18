import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';

import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

import Home from './pages/public/Home';
import Catalog from './pages/public/Catalog';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import ClientOrders from './pages/public/ClientOrders';
import Profile from './pages/public/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/public/NotFound';

import StaffDashboard from './pages/staff/Dashboard';
import StaffOrders from './pages/staff/Orders';
import Inventory from './pages/staff/Inventory';
import ProductManagement from './pages/staff/ProductManagement';

import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StaffManagement from './pages/admin/StaffManagement';
import AdminSettings from './pages/admin/AdminSettings';
import Pricing from './pages/admin/Pricing';
import Audit from './pages/admin/Audit';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const STAFF = ['ADMIN', 'MANAGER', 'WORKER'] as const;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Public storefront */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* Authenticated client */}
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><ClientOrders /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Staff / operations */}
                <Route element={<ProtectedRoute allowedRoles={[...STAFF]}><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  <Route path="/staff/orders" element={<StaffOrders />} />
                  <Route path="/staff/inventory" element={<Inventory />} />
                  <Route path="/staff/products" element={<ProductManagement />} />
                </Route>

                {/* Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/staff" element={<StaffManagement />} />
                  <Route path="/admin/pricing" element={<Pricing />} />
                  <Route path="/admin/audit" element={<Audit />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
