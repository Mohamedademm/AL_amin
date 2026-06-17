import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* User Avatar */}
        <div className="w-32 h-32 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full flex items-center justify-center text-[#10b981] mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          {user.firstName ? (
            <span className="text-2xl font-bold">{user.firstName.charAt(0)}</span>
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>

        {/* User Info */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-newsreader font-bold text-[#EBEBEB] tracking-tight">
            {user.firstName} {user.lastName || ''}
          </h2>
          <p className="text-[#EBEBEB]/60 font-inter mb-2 text-lg">
            {user.email}
          </p>
          <p className="text-[#10b981] font-space-grotesk text-xs uppercase tracking-[0.3em]">
            {user.role || 'User'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-[#0a0a0a]/50 border border-[#10b981]/20 rounded-xl p-4">
            <p className="text-[10px] text-[#10b981] font-space-grotesk uppercase tracking-widest mb-1">Logins</p>
            <p className="text-2xl font-bold text-[#EBEBEB]">{user.loginCount || 0}</p>
          </div>
          <div className="bg-[#0a0a0a]/50 border border-[#10b981]/20 rounded-xl p-4">
            <p className="text-[10px] text-[#10b981] font-space-grotesk uppercase tracking-widest mb-1">Member Since</p>
            <p className="text-lg font-inter text-[#EBEBEB]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-[#EBEBEB]/50 hover:text-[#10b981] hover:bg-[#10b981]/10 transition-all border border-transparent hover:border-[#10b981]/30">
            <span>← Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;