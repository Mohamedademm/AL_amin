import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { PageLoader } from "./components/ui/Spinner";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Route components are code-split so the storefront, staff and admin areas
// ship as separate chunks.
const Home = lazy(() => import("./pages/public/Home"));
const Catalog = lazy(() => import("./pages/public/Catalog"));
const ProductDetail = lazy(() => import("./pages/public/ProductDetail"));
const Cart = lazy(() => import("./pages/public/Cart"));
const Checkout = lazy(() => import("./pages/public/Checkout"));
const ClientOrders = lazy(() => import("./pages/public/ClientOrders"));
const OrderDetail = lazy(() => import("./pages/public/OrderDetail"));
const Profile = lazy(() => import("./pages/public/Profile"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

const StaffDashboard = lazy(() => import("./pages/staff/Dashboard"));
const StaffOrders = lazy(() => import("./pages/staff/Orders"));
const Inventory = lazy(() => import("./pages/staff/Inventory"));
const ProductManagement = lazy(() => import("./pages/staff/ProductManagement"));
const CategoryManagement = lazy(
  () => import("./pages/staff/CategoryManagement"),
);

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/staff/Orders"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const StaffManagement = lazy(() => import("./pages/admin/StaffManagement"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const Pricing = lazy(() => import("./pages/admin/Pricing"));
const Audit = lazy(() => import("./pages/admin/Audit"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const STAFF = ["ADMIN", "MANAGER", "WORKER"] as const;
const MANAGER = ["ADMIN", "MANAGER"] as const;

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ConfirmProvider>
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public storefront */}
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route
                          path="/product/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/cart" element={<Cart />} />

                        {/* Authenticated client */}
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <ClientOrders />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders/:id"
                          element={
                            <ProtectedRoute>
                              <OrderDetail />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                      </Route>

                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/auth/google/callback"
                        element={<GoogleCallback />}
                      />

                      {/* Staff / operations — all staff including workers */}
                      <Route
                        element={
                          <ProtectedRoute allowedRoles={[...STAFF]}>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route
                          path="/staff/dashboard"
                          element={<StaffDashboard />}
                        />
                        <Route path="/staff/orders" element={<StaffOrders />} />
                      </Route>

                      {/* Manager+ operations — inventory, products, categories */}
                      <Route
                        element={
                          <ProtectedRoute allowedRoles={[...MANAGER]}>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route
                          path="/staff/inventory"
                          element={<Inventory />}
                        />
                        <Route
                          path="/staff/products"
                          element={<ProductManagement />}
                        />
                        <Route
                          path="/staff/categories"
                          element={<CategoryManagement />}
                        />
                      </Route>

                      {/* Admin only */}
                      <Route
                        element={
                          <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route
                          path="/admin/dashboard"
                          element={<AdminDashboard />}
                        />
                        <Route
                          path="/admin/orders"
                          element={<AdminOrders />}
                        />
                        <Route
                          path="/admin/users"
                          element={<UserManagement />}
                        />
                        <Route
                          path="/admin/staff"
                          element={<StaffManagement />}
                        />
                        <Route path="/admin/pricing" element={<Pricing />} />
                        <Route path="/admin/audit" element={<Audit />} />
                        <Route
                          path="/admin/settings"
                          element={<AdminSettings />}
                        />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </ConfirmProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
