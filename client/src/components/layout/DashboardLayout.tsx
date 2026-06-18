import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Boxes, Package, Users, UserCog,
  Settings, Store, Menu, X, LogOut, Tag, ScrollText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo, LogoMark } from '../brand/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../lib/cn';
import { initials } from '../../utils/format';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const operationsNav: NavItem[] = [
  { to: '/staff/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/staff/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  { to: '/staff/inventory', label: 'Inventory', icon: <Boxes size={18} /> },
  { to: '/staff/products', label: 'Products', icon: <Package size={18} /> },
];

const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/staff', label: 'Staff', icon: <UserCog size={18} /> },
  { to: '/admin/pricing', label: 'Pricing', icon: <Tag size={18} /> },
  { to: '/admin/audit', label: 'Audit Log', icon: <ScrollText size={18} /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
];

// Shared operations shell (sidebar + topbar) used by staff and admin areas.
export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size={32} />
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={20} className="text-muted" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        <NavGroup title="Operations" items={operationsNav} onNavigate={() => setOpen(false)} />
        {isAdmin && <NavGroup title="Administration" items={adminNav} onNavigate={() => setOpen(false)} />}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-content"
        >
          <Store size={18} /> Back to store
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-content">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fade-in border-r border-line bg-surface">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg/70 px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <span className="lg:hidden"><LogoMark size={30} /></span>
            <p className="hidden font-mono text-xs uppercase tracking-[0.18em] text-muted sm:block">
              {isAdmin ? 'Administration Console' : 'Operations Console'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {initials(user?.firstName, user?.lastName)}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-semibold text-content">{user?.firstName} {user?.lastName}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-primary">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container-page py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Renders a labelled group of sidebar links.
function NavGroup({ title, items, onNavigate }: { title: string; items: NavItem[]; onNavigate: () => void }) {
  return (
    <div>
      <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                  : 'text-muted hover:bg-surface-2 hover:text-content',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
