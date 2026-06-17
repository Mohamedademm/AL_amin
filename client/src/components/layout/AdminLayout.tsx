import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, ShieldCheck, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'HQ Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Directory', icon: Users },
    { path: '/admin/staff', label: 'Staff Management', icon: ShieldCheck },
    { path: '/admin/settings', label: 'System Config', icon: Settings },
    { path: '/admin/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-[#EBEBEB] font-inter overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-[#10b981]/30 flex flex-col z-10">
        <div className="p-6 border-b border-[#10b981]/20">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#10b981] blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-[#050505] font-bold text-sm shadow-[0_0_10px_rgba(16,185,129,0.4)]">AA</div>
            </div>
            <div className="font-newsreader leading-tight">
              <h2 className="text-lg font-bold text-[#EBEBEB] tracking-tight">Al Amine</h2>
              <p className="text-[9px] text-[#10b981] font-space-grotesk uppercase tracking-[0.2em] opacity-80">Admin Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#EBEBEB]/50 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all group border border-transparent hover:border-[#10b981]/30"
            >
              <Icon size={20} className="group-hover:text-[#10b981] transition-colors" />
              <span className="font-inter">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#10b981]/20 bg-[#0a0a0a]/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 group">
            <div className="w-8 h-8 bg-[#10b981]/10 border border-[#10b981]/40 rounded-full flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/20 transition-colors">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate text-[#EBEBEB]">{user?.firstName}</p>
              <p className="text-[9px] text-[#10b981] font-space-grotesk uppercase tracking-widest opacity-80">
                Super Administrator
              </p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#EBEBEB]/50 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/30"
          >
            <LogOut size={20} />
            <span className="font-inter">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-8">
          <div className="backdrop-blur-sm bg-[#050505]/20 rounded-3xl p-1 border border-[#10b981]/10 shadow-2xl">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
