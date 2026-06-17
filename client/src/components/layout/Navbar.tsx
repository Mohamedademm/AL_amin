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
    <nav className="sticky top-0 z-50 w-full border-b border-[#10b981]/30 bg-[#050505]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-[#10b981] blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-[#050505] font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-transform group-hover:scale-110">
              AA
            </div>
          </div>
          <div className="font-newsreader leading-none">
            <h1 className="text-2xl font-bold text-[#EBEBEB] tracking-tighter group-hover:text-[#10b981] transition-colors">
              Al Amine
            </h1>
            <p className="text-[10px] text-[#10b981] font-space-grotesk uppercase tracking-[0.2em] opacity-80">
              Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 text-sm font-medium font-inter">
            <Link to="/" className="text-[#EBEBEB]/50 hover:text-[#10b981] transition-all hover:translate-y-[-1px]">Home</Link>
            <Link to="/catalog" className="text-[#EBEBEB]/50 hover:text-[#10b981] transition-all hover:translate-y-[-1px]">Catalog</Link>
            <Link to="/orders" className="text-[#EBEBEB]/50 hover:text-[#10b981] transition-all hover:translate-y-[-1px]">Orders</Link>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-[#10b981]/20">
              <div className="flex items-center gap-3 text-sm font-inter group">
                <div className="w-8 h-8 bg-[#10b981]/10 border border-[#10b981]/40 rounded-full flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/20 transition-colors">
                  <User size={16} />
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#EBEBEB] leading-none">{user.firstName}</p>
                  <p className="text-[9px] text-[#10b981] font-space-grotesk uppercase tracking-widest opacity-80">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-1.5 text-xs text-[#EBEBEB]/60 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all border border-transparent hover:border-red-400/30 font-inter"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 bg-[#10b981] text-[#050505] rounded-full hover:bg-[#10b981]/90 transition-all font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.4)] font-inter"
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
