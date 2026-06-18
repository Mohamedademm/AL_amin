import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, LayoutDashboard, Package, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { buttonClasses } from '../ui/Button';
import { cn } from '../../lib/cn';
import { initials } from '../../utils/format';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/catalog', label: 'Catalog' },
];

// Public top navigation: brand, links, theme switch, cart and account menu.
export default function Navbar() {
  const { user, logout, isStaff } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/70 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Al Amine home">
          <Logo size={36} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted hover:text-content',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user && !isStaff && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                cn('rounded-lg px-3.5 py-2 text-sm font-medium transition-colors', isActive ? 'text-primary' : 'text-muted hover:text-content')
              }
            >
              My Orders
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            to="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-content transition-all hover:border-primary/50 hover:text-primary focus-ring"
            aria-label="Cart"
          >
            <ShoppingCart size={17} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-contrast">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-primary/50 focus-ring"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {initials(user.firstName, user.lastName)}
                </span>
                <span className="hidden text-sm font-medium text-content sm:block">{user.firstName}</span>
                <ChevronDown size={14} className={cn('text-muted transition-transform', menuOpen && 'rotate-180')} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-scale-in rounded-2xl border border-line bg-surface p-2 shadow-card dark:shadow-card-dark">
                    <div className="border-b border-line px-3 py-2">
                      <p className="truncate text-sm font-semibold text-content">{user.firstName} {user.lastName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <span className="mt-1 inline-block font-mono text-[10px] uppercase tracking-widest text-primary">{user.role}</span>
                    </div>
                    <div className="py-1">
                      {isStaff ? (
                        <MenuLink to="/staff/dashboard" icon={<LayoutDashboard size={15} />} onClick={() => setMenuOpen(false)}>
                          Dashboard
                        </MenuLink>
                      ) : (
                        <>
                          <MenuLink to="/orders" icon={<Package size={15} />} onClick={() => setMenuOpen(false)}>
                            My Orders
                          </MenuLink>
                          <MenuLink to="/profile" icon={<UserIcon size={15} />} onClick={() => setMenuOpen(false)}>
                            Profile
                          </MenuLink>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className={buttonClasses('primary', 'sm')}>
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

// Internal helper for account-menu navigation rows.
function MenuLink({ to, icon, children, onClick }: { to: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-content transition-colors hover:bg-surface-2"
    >
      {icon} {children}
    </Link>
  );
}
