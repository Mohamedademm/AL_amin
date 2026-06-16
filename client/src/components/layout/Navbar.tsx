import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">AA</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Al Amine</h1>
            <p className="text-xs text-gray-500 -mt-1">Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex gap-8 text-sm font-medium">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition">Home</Link>
            <Link to="/catalog" className="text-gray-600 hover:text-gray-900 transition">Catalog</Link>
            <Link to="/orders" className="text-gray-600 hover:text-gray-900 transition">Orders</Link>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-medium">{user.first_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;