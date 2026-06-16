import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Home from './pages/public/Home';
import Catalog from './pages/public/Catalog';
import Cart from './pages/public/Cart';
import ProtectedRoute from './routes/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Protected Routes will be added later */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl">404 - Page Not Found</div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;