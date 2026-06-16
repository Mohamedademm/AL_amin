import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Complete Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Inventory, Orders, Employees, Schedules, and more — all in one powerful platform.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link 
              to="/catalog" 
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-2xl hover:bg-blue-700 transition"
            >
              Browse Catalog
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 border border-gray-300 text-gray-700 text-lg font-semibold rounded-2xl hover:bg-gray-50 transition"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;