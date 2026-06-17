import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Home from './pages/public/Home';
import Catalog from './pages/public/Catalog';
import Cart from './pages/public/Cart';
import Profile from './pages/public/Profile';
import ClientOrders from './pages/public/ClientOrders';
import Checkout from './pages/public/Checkout';
import StaffDashboard from './pages/staff/Dashboard';
import StaffOrders from './pages/staff/Orders';
import Inventory from './pages/staff/Inventory';
import ProductManagement from './pages/staff/ProductManagement';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StaffManagement from './pages/admin/StaffManagement';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import StaffLayout from './components/layout/StaffLayout';
import AdminLayout from './components/layout/AdminLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
            </Route>

            <Route path="/login" element={<Login />} />

            {/* Authenticated Client Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<ClientOrders />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><StaffLayout /></ProtectedRoute>}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/orders" element={<StaffOrders />} />
              <Route path="/staff/inventory" element={<Inventory />} />
              <Route path="/staff/products" element={<ProductManagement />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/staff" element={<StaffManagement />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl bg-[#050505] text-[#EBEBEB]">404 - Page Not Found</div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
